// Pure frontend storage using localStorage for forms and responses

const FORMS_KEY = "nocode_forms";
const RESPONSES_KEY = "nocode_form_responses";

function loadArray(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveArray(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function fetchForms() {
  return loadArray(FORMS_KEY).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export async function createForm(payload) {
  const forms = loadArray(FORMS_KEY);
  const now = new Date().toISOString();
  const form = {
    id: generateId(),
    ...payload,
    createdAt: now,
    updatedAt: now,
  };
  forms.push(form);
  saveArray(FORMS_KEY, forms);
  return form;
}

export async function updateForm(id, payload) {
  const forms = loadArray(FORMS_KEY);
  const now = new Date().toISOString();
  const idx = forms.findIndex((f) => f.id === id);
  if (idx === -1) return;
  forms[idx] = {
    ...forms[idx],
    ...payload,
    updatedAt: now,
  };
  saveArray(FORMS_KEY, forms);
}

export async function deleteFormById(id) {
  const forms = loadArray(FORMS_KEY).filter((f) => f.id !== id);
  saveArray(FORMS_KEY, forms);
}

export async function fetchFormById(id) {
  const forms = loadArray(FORMS_KEY);
  return forms.find((f) => f.id === id) || null;
}

export async function createResponse(formId, data) {
  const responses = loadArray(RESPONSES_KEY);
  const now = new Date().toISOString();
  responses.push({ id: generateId(), formId, data, createdAt: now });
  saveArray(RESPONSES_KEY, responses);
}

export async function fetchResponsesForForm(formId) {
  const responses = loadArray(RESPONSES_KEY).filter(
    (r) => r.formId === formId
  );
  return responses.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}


