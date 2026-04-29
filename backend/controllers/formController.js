import { getPool, query } from "../db.js";
import { createShareSlug, normalizeFields, validateFields } from "../utils/formHelpers.js";

function normalizeTheme(theme = {}) {
  return {
    mode: theme.mode === "dark" ? "dark" : "light",
    primaryColor: theme.primaryColor || "#0f766e",
    backgroundColor: theme.backgroundColor || "#fffdf7",
    textColor: theme.textColor || "#14213d",
    fontFamily: theme.fontFamily || "Manrope, system-ui, sans-serif",
  };
}

function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parseFormId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseFieldMetadata(value) {
  const parsed = parseJson(value, {});
  return parsed && typeof parsed === "object" ? parsed : {};
}

function toClientField(field, index = 0) {
  const metadata = parseFieldMetadata(field.validation_rules);
  const options = parseJson(field.options, []);

  return {
    fieldId: metadata.fieldId || `field_${field.id}`,
    type: field.type,
    label: field.label,
    placeholder: field.placeholder || "",
    helperText: metadata.helperText || "",
    required: Boolean(field.is_required),
    options: Array.isArray(options) ? options : [],
    width: metadata.width === "half" ? "half" : "full",
    alignment: ["left", "center", "right"].includes(metadata.alignment) ? metadata.alignment : "left",
    order: Number.isFinite(field.sort_order) ? field.sort_order : index,
  };
}

function toClientForm(form, responseCount = 0) {
  const fields = Array.isArray(form.fields) ? form.fields : [];
  const theme = normalizeTheme(parseJson(form.theme_json, {}));

  return {
    id: String(form.id),
    name: form.title,
    description: form.description || "",
    shareSlug: createShareSlug(form.title || `form-${form.id}`),
    fields: fields.map(toClientField),
    theme,
    responseCount: Number(responseCount || form.responseCount || 0),
    createdAt: form.created_at,
    updatedAt: form.updated_at,
  };
}

async function getFieldsForFormIds(formIds) {
  if (!formIds.length) {
    return new Map();
  }

  const placeholders = formIds.map(() => "?").join(", ");
  const rows = await query(
    `SELECT id, form_id, label, type, placeholder, is_required, sort_order, options, validation_rules
     FROM fields
     WHERE form_id IN (${placeholders})
     ORDER BY form_id ASC, sort_order ASC, id ASC`,
    formIds
  );

  return rows.reduce((accumulator, row) => {
    const bucket = accumulator.get(row.form_id) || [];
    bucket.push(row);
    accumulator.set(row.form_id, bucket);
    return accumulator;
  }, new Map());
}

async function findFormWithResponseCount(formId) {
  const rows = await query(
    `SELECT f.*, COALESCE(rc.totalResponses, 0) AS responseCount
     FROM forms f
     LEFT JOIN (
       SELECT form_id, COUNT(*) AS totalResponses
       FROM responses
       GROUP BY form_id
     ) rc ON rc.form_id = f.id
     WHERE f.id = ?`,
    [formId]
  );

  if (!rows[0]) {
    return null;
  }

  const fieldsByFormId = await getFieldsForFormIds([formId]);
  return { ...rows[0], fields: fieldsByFormId.get(formId) || [] };
}

async function insertFields(connection, formId, fields) {
  if (!fields.length) {
    return;
  }

  const sql = `INSERT INTO fields (form_id, label, type, placeholder, is_required, sort_order, options, validation_rules)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  for (const [index, field] of fields.entries()) {
    const metadata = JSON.stringify({
      fieldId: field.fieldId,
      helperText: field.helperText || "",
      width: field.width === "half" ? "half" : "full",
      alignment: ["left", "center", "right"].includes(field.alignment) ? field.alignment : "left",
    });

    await connection.execute(sql, [
      formId,
      field.label,
      field.type,
      field.placeholder || null,
      field.required ? 1 : 0,
      Number.isFinite(field.order) ? field.order : index,
      JSON.stringify(Array.isArray(field.options) ? field.options : []),
      metadata,
    ]);
  }
}

export async function createForm(req, res, next) {
  try {
    const { name, description, fields, theme } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Form name is required." });
    }

    const normalizedFields = normalizeFields(fields);
    const validationError = validateFields(normalizedFields);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    let insertId;

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `INSERT INTO forms (title, description, theme_json, is_active)
         VALUES (?, ?, ?, 1)`,
        [name.trim(), description?.trim() || "", JSON.stringify(normalizeTheme(theme))]
      );

      insertId = result.insertId;
      await insertFields(connection, insertId, normalizedFields);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const form = await findFormWithResponseCount(insertId);
    res.status(201).json(toClientForm(form));
  } catch (error) {
    next(error);
  }
}

export async function getForms(req, res, next) {
  try {
    const forms = await query(
      `SELECT f.*, COALESCE(rc.totalResponses, 0) AS responseCount
       FROM forms f
       LEFT JOIN (
         SELECT form_id, COUNT(*) AS totalResponses
         FROM responses
         GROUP BY form_id
       ) rc ON rc.form_id = f.id
       ORDER BY f.updated_at DESC`
    );

    const fieldsByFormId = await getFieldsForFormIds(forms.map((form) => form.id));

    res.json(
      forms.map((form) =>
        toClientForm({
          ...form,
          fields: fieldsByFormId.get(form.id) || [],
        }, form.responseCount)
      )
    );
  } catch (error) {
    next(error);
  }
}

export async function getFormById(req, res, next) {
  try {
    const formId = parseFormId(req.params.id);

    if (!formId) {
      return res.status(400).json({ error: "A valid form id is required." });
    }

    const form = await findFormWithResponseCount(formId);
    if (!form) {
      return res.status(404).json({ error: "Form not found." });
    }

    res.json(toClientForm(form, form.responseCount));
  } catch (error) {
    next(error);
  }
}

export async function updateForm(req, res, next) {
  try {
    const { name, description, fields, theme } = req.body;
    const formId = parseFormId(req.params.id);

    if (!formId) {
      return res.status(400).json({ error: "A valid form id is required." });
    }

    if (!name?.trim()) {
      return res.status(400).json({ error: "Form name is required." });
    }

    const normalizedFields = normalizeFields(fields);
    const validationError = validateFields(normalizedFields);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    let affectedRows;

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `UPDATE forms
         SET title = ?, description = ?, theme_json = ?, is_active = 1, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name.trim(), description?.trim() || "", JSON.stringify(normalizeTheme(theme)), formId]
      );

      affectedRows = result.affectedRows;

      if (affectedRows) {
        await connection.execute(`DELETE FROM fields WHERE form_id = ?`, [formId]);
        await insertFields(connection, formId, normalizedFields);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    if (!affectedRows) {
      return res.status(404).json({ error: "Form not found." });
    }

    const form = await findFormWithResponseCount(formId);
    res.json(toClientForm(form, form.responseCount));
  } catch (error) {
    next(error);
  }
}

export async function deleteForm(req, res, next) {
  try {
    const formId = parseFormId(req.params.id);

    if (!formId) {
      return res.status(400).json({ error: "A valid form id is required." });
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    let affectedRows;

    try {
      await connection.beginTransaction();
      await connection.execute(`DELETE FROM responses WHERE form_id = ?`, [formId]);
      await connection.execute(`DELETE FROM fields WHERE form_id = ?`, [formId]);
      const [result] = await connection.execute(`DELETE FROM forms WHERE id = ?`, [formId]);
      affectedRows = result.affectedRows;
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    if (!affectedRows) {
      return res.status(404).json({ error: "Form not found." });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}