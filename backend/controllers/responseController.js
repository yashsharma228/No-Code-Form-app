import { query } from "../db.js";

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

function formatResponse(response) {
  return {
    id: String(response.id),
    formId: String(response.form_id),
    answers: parseJson(response.answers, {}),
    submittedAt: response.submitted_at,
  };
}

function parseFormId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function createResponse(req, res, next) {
  try {
    const { formId, answers } = req.body;
    const parsedFormId = parseFormId(formId);

    if (!parsedFormId) {
      return res.status(400).json({ error: "A valid formId is required." });
    }

    const rows = await query(
      `SELECT id, label, is_required, sort_order, validation_rules
       FROM fields
       WHERE form_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [parsedFormId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Form not found." });
    }

    const fields = rows.map((field) => {
      const metadata = parseJson(field.validation_rules, {});
      const safeMetadata = metadata && typeof metadata === "object" ? metadata : {};

      return {
        fieldId: safeMetadata.fieldId || `field_${field.id}`,
        label: field.label,
        required: Boolean(field.is_required),
      };
    });

    const missingRequired = fields.find((field) => {
      if (!field.required) {
        return false;
      }

      const value = answers?.[field.fieldId];
      if (Array.isArray(value)) {
        return value.length === 0;
      }

      return value === undefined || value === null || value === "";
    });

    if (missingRequired) {
      return res.status(400).json({ error: `${missingRequired.label} is required.` });
    }

    const result = await query(
      `INSERT INTO responses (form_id, answers, respondent_email)
       VALUES (?, ?, ?)`,
      [parsedFormId, JSON.stringify(answers || {}), null]
    );

    const responses = await query(
      `SELECT id, form_id, answers, submitted_at
       FROM responses
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(formatResponse(responses[0]));
  } catch (error) {
    next(error);
  }
}

export async function getResponsesByFormId(req, res, next) {
  try {
    const formId = parseFormId(req.params.formId);

    if (!formId) {
      return res.status(400).json({ error: "A valid form id is required." });
    }

    const forms = await query(
      `SELECT id, title, description, created_at, updated_at
       FROM forms
       WHERE id = ?`,
      [formId]
    );

    if (!forms.length) {
      return res.status(404).json({ error: "Form not found." });
    }

    const form = forms[0];
    const fields = await query(
      `SELECT id, label, type, placeholder, is_required, sort_order, options, validation_rules
       FROM fields
       WHERE form_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [formId]
    );

    const responses = await query(
      `SELECT id, form_id, answers, submitted_at
       FROM responses
       WHERE form_id = ?
       ORDER BY submitted_at DESC`,
      [formId]
    );

    res.json({
      form: {
        id: String(form.id),
        name: form.title,
        description: form.description || "",
        fields: fields.map((field, index) => {
          const metadata = parseJson(field.validation_rules, {});
          const safeMetadata = metadata && typeof metadata === "object" ? metadata : {};
          const options = parseJson(field.options, []);

          return {
            fieldId: safeMetadata.fieldId || `field_${field.id}`,
            type: field.type,
            label: field.label,
            placeholder: field.placeholder || "",
            helperText: safeMetadata.helperText || "",
            required: Boolean(field.is_required),
            options: Array.isArray(options) ? options : [],
            width: safeMetadata.width === "half" ? "half" : "full",
            alignment: ["left", "center", "right"].includes(safeMetadata.alignment) ? safeMetadata.alignment : "left",
            order: Number.isFinite(field.sort_order) ? field.sort_order : index,
          };
        }),
      },
      stats: {
        totalResponses: responses.length,
        lastSubmittedAt: responses[0]?.submitted_at || null,
      },
      responses: responses.map(formatResponse),
    });
  } catch (error) {
    next(error);
  }
}