export function createShareSlug(name) {
  const suffix = Math.random().toString(36).slice(2, 8);
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return `${base || "form"}-${suffix}`;
}

export function normalizeFields(fields = []) {
  return fields.map((field, index) => ({
    fieldId: String(field.fieldId || field.id || `field_${index + 1}`),
    type: field.type,
    label: String(field.label || `Field ${index + 1}`).trim(),
    placeholder: String(field.placeholder || ""),
    helperText: String(field.helperText || ""),
    required: Boolean(field.required),
    options: Array.isArray(field.options)
      ? field.options.map((option) => String(option).trim()).filter(Boolean)
      : [],
    width: field.width === "half" ? "half" : "full",
    alignment: ["left", "center", "right"].includes(field.alignment) ? field.alignment : "left",
    order: Number.isFinite(field.order) ? field.order : index,
  }));
}

export function validateFields(fields = []) {
  if (!Array.isArray(fields) || fields.length === 0) {
    return "At least one field is required.";
  }

  const invalidChoiceField = fields.find(
    (field) => ["select", "radio", "checkbox"].includes(field.type) && (!Array.isArray(field.options) || field.options.length === 0)
  );

  if (invalidChoiceField) {
    return `${invalidChoiceField.label || invalidChoiceField.type} requires at least one option.`;
  }

  return null;
}