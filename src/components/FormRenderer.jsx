import React from "react";
import { CHOICE_FIELD_TYPES, sortFields } from "../lib/formUtils";

const controlClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10";

function ChoiceField({ field, value, onChange, disabled }) {
  const choiceAlignment = field.alignment === "center"
    ? "justify-center"
    : field.alignment === "right"
      ? "justify-end"
      : "justify-start";

  if (field.type === "select") {
    return (
      <select
        className={controlClassName}
        value={value || ""}
        disabled={disabled}
        style={{ textAlign: field.alignment || "left" }}
        onChange={(event) => onChange(field.fieldId, event.target.value)}
      >
        <option value="">Select an option</option>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="grid gap-3">
      {field.options.map((option) => {
        const checked = field.type === "checkbox"
          ? Array.isArray(value) && value.includes(option)
          : value === option;

        return (
          <label key={option} className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink-800 shadow-sm ${choiceAlignment}`}>
            <input
              type={field.type}
              name={field.fieldId}
              checked={checked}
              disabled={disabled}
              onChange={(event) => {
                if (field.type === "checkbox") {
                  const current = Array.isArray(value) ? value : [];
                  onChange(
                    field.fieldId,
                    event.target.checked
                      ? [...current, option]
                      : current.filter((entry) => entry !== option)
                  );
                  return;
                }

                onChange(field.fieldId, option);
              }}
              className="h-4 w-4 border-slate-300 text-brand-500 focus:ring-brand-500"
            />
            <span>{option}</span>
          </label>
        );
      })}
    </div>
  );
}

const FormRenderer = ({
  form,
  values,
  onChange,
  onSubmit,
  submitting = false,
  readOnly = false,
  error = "",
  submitLabel = "Submit",
  className = "",
}) => {
  const theme = form?.theme || {};
  const fields = sortFields(form?.fields || []);
  const isDarkMode = theme.mode === "dark";
  const surfaceColor = theme.backgroundColor || (isDarkMode ? "#0f172a" : "#fffdf7");
  const textColor = theme.textColor || (isDarkMode ? "#e2e8f0" : "#14213d");
  const controlSurface = isDarkMode ? "rgba(15, 23, 42, 0.68)" : "rgba(255, 255, 255, 0.92)";

  return (
    <div
      className={`rounded-[32px] border border-slate-200 p-6 shadow-panel ${className}`}
      style={{
        backgroundColor: surfaceColor,
        color: textColor,
        fontFamily: theme.fontFamily || "Manrope, system-ui, sans-serif",
      }}
    >
      <div className="mb-6">
        <h2 className="font-display text-3xl font-bold">{form?.name || "Untitled form"}</h2>
        {form?.description ? <p className="mt-2 text-sm text-slate-500">{form.description}</p> : null}
      </div>

      <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {!fields.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 md:col-span-2">
            This form has no fields yet.
          </div>
        ) : null}

        {fields.map((field) => (
          <div
            key={field.fieldId}
            className={`grid gap-2 ${field.width === "half" ? "md:col-span-1" : "md:col-span-2"}`}
            style={{ textAlign: field.alignment || "left" }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-semibold text-ink-800" style={{ color: textColor }}>
                {field.label}
                {field.required ? <span className="text-red-500"> *</span> : null}
              </label>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {field.type}
              </span>
            </div>

            {field.helperText ? (
              <p className="text-xs leading-6 text-slate-500">{field.helperText}</p>
            ) : null}

            {CHOICE_FIELD_TYPES.includes(field.type) ? (
              <ChoiceField field={field} value={values[field.fieldId]} onChange={onChange} disabled={readOnly} />
            ) : field.type === "textarea" ? (
              <textarea
                className={`${controlClassName} min-h-28 resize-y`}
                value={values[field.fieldId] || ""}
                disabled={readOnly}
                placeholder={field.placeholder}
                style={{ backgroundColor: controlSurface, color: textColor, textAlign: field.alignment || "left" }}
                onChange={(event) => onChange(field.fieldId, event.target.value)}
              />
            ) : (
              <input
                type={field.type}
                className={controlClassName}
                value={values[field.fieldId] || ""}
                disabled={readOnly}
                placeholder={field.placeholder}
                style={{ backgroundColor: controlSurface, color: textColor, textAlign: field.alignment || "left" }}
                onChange={(event) => onChange(field.fieldId, event.target.value)}
              />
            )}
          </div>
        ))}

        {!readOnly ? (
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
            style={{ backgroundColor: theme.primaryColor || "#0f766e" }}
          >
            {submitting ? "Submitting..." : submitLabel}
          </button>
        ) : null}
      </form>
    </div>
  );
};

export default FormRenderer;