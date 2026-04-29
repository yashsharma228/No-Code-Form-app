export const FIELD_LIBRARY = [
  {
    type: "text",
    title: "Text input",
    description: "Single-line answer",
    placeholder: "Enter a response",
  },
  {
    type: "textarea",
    title: "Textarea",
    description: "Long-form answer",
    placeholder: "Write your answer",
  },
  {
    type: "select",
    title: "Dropdown",
    description: "Choose one option",
    options: ["Option 1", "Option 2"],
  },
  {
    type: "radio",
    title: "Radio group",
    description: "Single choice",
    options: ["Option 1", "Option 2"],
  },
  {
    type: "checkbox",
    title: "Checkboxes",
    description: "Multiple choice",
    options: ["Option 1", "Option 2"],
  },
  {
    type: "date",
    title: "Date picker",
    description: "Calendar input",
  },
];

export const DEFAULT_THEME = {
  mode: "light",
  primaryColor: "#0f766e",
  backgroundColor: "#fffdf7",
  textColor: "#14213d",
  fontFamily: "Manrope, system-ui, sans-serif",
};

export const CHOICE_FIELD_TYPES = ["select", "radio", "checkbox"];

export function createField(type) {
  const template = FIELD_LIBRARY.find((item) => item.type === type);

  return {
    fieldId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `field_${Date.now()}`,
    type,
    label: template?.title || "Untitled field",
    placeholder: template?.placeholder || "",
    helperText: "",
    required: false,
    options: template?.options ? [...template.options] : [],
    width: "full",
    alignment: "left",
    order: 0,
  };
}

export function getEmptyForm() {
  return {
    id: null,
    name: "",
    description: "",
    fields: [],
    theme: { ...DEFAULT_THEME },
    shareSlug: "",
    responseCount: 0,
  };
}

export function sortFields(fields = []) {
  return [...fields].sort((left, right) => left.order - right.order);
}

export function normalizeFields(fields = []) {
  return sortFields(fields).map((field, index) => ({
    fieldId: field.fieldId || field.id || `field_${index + 1}`,
    type: field.type,
    label: field.label || `Field ${index + 1}`,
    placeholder: field.placeholder || "",
    helperText: field.helperText || "",
    required: Boolean(field.required),
    options: Array.isArray(field.options) ? field.options : [],
    width: field.width === "half" ? "half" : "full",
    alignment: ["left", "center", "right"].includes(field.alignment) ? field.alignment : "left",
    order: index,
  }));
}

export function normalizeFormPayload(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    fields: normalizeFields(form.fields),
    theme: form.theme,
  };
}

export function duplicateFormPayload(form) {
  return {
    ...normalizeFormPayload(form),
    name: `${form.name || "Untitled Form"} Copy`,
  };
}

export function formatAnswerValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return String(value);
}

export function downloadResponsesCsv(form, responses) {
  const headers = ["Submitted At", ...sortFields(form.fields).map((field) => field.label)];
  const rows = responses.map((response) => [
    new Date(response.submittedAt).toLocaleString(),
    ...sortFields(form.fields).map((field) => JSON.stringify(formatAnswerValue(response.answers?.[field.fieldId]))),
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(form.name || "form").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-responses.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}