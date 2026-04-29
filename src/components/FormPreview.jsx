import React from "react";
import FormRenderer from "./FormRenderer";

const FormPreview = ({ form, title = "Live Preview", subtitle = "Respondent view", className = "" }) => {
  const values = Object.fromEntries((form.fields || []).map((field) => [field.fieldId, field.type === "checkbox" ? [] : ""]));

  return (
    <div className={`grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">{title}</div>
        <h3 className="mt-2 font-display text-xl font-bold text-ink-800">{subtitle}</h3>
      </div>
      <FormRenderer form={form} values={values} onChange={() => {}} readOnly className="rounded-[24px] border-slate-100 bg-slate-50 p-4 shadow-none" />
    </div>
  );
};

export default FormPreview;