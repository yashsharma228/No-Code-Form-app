import React from "react";
import { CHOICE_FIELD_TYPES } from "../lib/formUtils";

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10";

const labelClassName = "grid gap-2 text-sm font-semibold text-ink-800";

const FieldEditor = ({ field, onChange }) => {
  if (!field) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Select a field from the builder to edit its properties.
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Field Properties</div>
          <h3 className="mt-2 font-display text-2xl font-bold text-ink-800">{field.label}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          {field.type}
        </span>
      </div>

      <div className="grid gap-4">
        <label className={labelClassName}>
          Label
          <input
            className={inputClassName}
            value={field.label}
            onChange={(event) => onChange({ ...field, label: event.target.value })}
            placeholder="What should users see?"
          />
        </label>

        <label className={labelClassName}>
          Placeholder
          <input
            className={inputClassName}
            value={field.placeholder || ""}
            onChange={(event) => onChange({ ...field, placeholder: event.target.value })}
            placeholder="Optional helper placeholder"
          />
        </label>

        <label className={labelClassName}>
          Help Text
          <textarea
            className={`${inputClassName} min-h-24 resize-y`}
            value={field.helperText || ""}
            onChange={(event) => onChange({ ...field, helperText: event.target.value })}
            placeholder="Explain the context or instructions for this field"
          />
        </label>

        {CHOICE_FIELD_TYPES.includes(field.type) ? (
          <label className={labelClassName}>
            Options
            <textarea
              className={`${inputClassName} min-h-32 resize-y`}
              value={(field.options || []).join("\n")}
              onChange={(event) =>
                onChange({
                  ...field,
                  options: event.target.value
                    .split("\n")
                    .map((option) => option.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Add one option per line"
            />
          </label>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClassName}>
            Width
            <select
              className={inputClassName}
              value={field.width || "full"}
              onChange={(event) => onChange({ ...field, width: event.target.value })}
            >
              <option value="full">Full Width</option>
              <option value="half">Half Width</option>
            </select>
          </label>

          <label className={labelClassName}>
            Alignment
            <select
              className={inputClassName}
              value={field.alignment || "left"}
              onChange={(event) => onChange({ ...field, alignment: event.target.value })}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
        </div>

        <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-ink-800">
          <span>Required field</span>
          <span className="relative inline-flex h-7 w-12 items-center">
            <input
              type="checkbox"
              checked={Boolean(field.required)}
              onChange={(event) => onChange({ ...field, required: event.target.checked })}
              className="peer sr-only"
            />
            <span className="absolute inset-0 rounded-full bg-slate-300 transition peer-checked:bg-teal-600" />
            <span className="absolute left-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
          </span>
        </label>
      </div>
    </div>
  );
};

export default FieldEditor;