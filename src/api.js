const API_BASE = (process.env.REACT_APP_API_BASE_URL || "/api").replace(/\/$/, "");
const PUBLIC_APP_URL = (process.env.REACT_APP_PUBLIC_APP_URL || "").trim().replace(/\/$/, "");

function isLocalhostUrl(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value);
}

export function getPublicAppUrl() {
  if (typeof window !== "undefined") {
    const runtimeOrigin = window.location.origin;

    if (PUBLIC_APP_URL) {
      if (isLocalhostUrl(PUBLIC_APP_URL) && !isLocalhostUrl(runtimeOrigin)) {
        return runtimeOrigin;
      }

      return PUBLIC_APP_URL;
    }

    return runtimeOrigin;
  }

  if (PUBLIC_APP_URL) {
    return PUBLIC_APP_URL;
  }

  return "";
}

export function getPublicFormUrl(formId) {
  if (!formId) {
    return "";
  }

  const appUrl = getPublicAppUrl();
  return appUrl ? `${appUrl}/form/${formId}` : "";
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function fetchForms() {
  return request("/forms");
}

export async function fetchFormById(id) {
  return request(`/forms/${id}`);
}

export async function createForm(payload) {
  return request("/forms", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateForm(id, payload) {
  return request(`/forms/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteFormById(id) {
  return request(`/forms/${id}`, {
    method: "DELETE",
  });
}

export async function fetchResponsesForForm(formId) {
  return request(`/responses/${formId}`);
}

export async function createResponse(formId, answers) {
  return request(`/responses`, {
    method: "POST",
    body: JSON.stringify({ formId, answers }),
  });
}