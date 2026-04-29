import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchFormById, createResponse } from "../api";
import FormRenderer from "../components/FormRenderer";
import { sortFields } from "../lib/formUtils";

function getInitialValues(fields = []) {
  return Object.fromEntries(
    fields.map((field) => [field.fieldId, field.type === "checkbox" ? [] : ""])
  );
}

const FormFill = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const found = await fetchFormById(formId);
        setForm(found);
        setValues(getInitialValues(found.fields));
        setSubmitted(false);
      } catch (err) {
        setError(err.message || "Failed to load the form.");
        setForm(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [formId]);

  const handleChange = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;

    const missingRequired = sortFields(form.fields).find((field) => {
      if (!field.required) {
        return false;
      }

      const value = values[field.fieldId];
      if (Array.isArray(value)) {
        return value.length === 0;
      }

      return value === undefined || value === null || value === "";
    });

    if (missingRequired) {
      setError(`${missingRequired.label} is required.`);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await createResponse(form.id, values);
      setSubmitted(true);
      setValues(getInitialValues(form.fields));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Failed to submit form:", err);
      setError("Failed to submit form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-4xl place-items-center px-4 py-10">
        <div className="w-full rounded-[32px] border border-slate-200 bg-white/80 p-10 text-center shadow-panel backdrop-blur">
          <div className="text-5xl">⏳</div>
          <p className="mt-4 text-base text-slate-500">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-4xl place-items-center px-4 py-10">
        <div className="w-full rounded-[32px] border border-slate-200 bg-white/80 p-10 text-center shadow-panel backdrop-blur">
          <div className="text-5xl">❌</div>
          <h2 className="mt-4 font-display text-3xl font-bold text-ink-800">Form not found</h2>
          <p className="mt-3 text-sm text-slate-500">{error || "The form you're looking for doesn't exist or has been deleted."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 rounded-[32px] border border-slate-200 bg-white/80 p-6 shadow-soft backdrop-blur">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-ember-500">Public Form</div>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink-800">{form.name}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">Complete the form below and submit your response. Required fields are marked with an asterisk.</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">{sortFields(form.fields).length} questions</span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">Public submission link</span>
        </div>
      </div>

      <div style={{ fontFamily: form.theme?.fontFamily || "Manrope, system-ui, sans-serif" }}>
        {submitted ? (
          <div className="rounded-[32px] border border-brand-500/20 bg-white/80 p-10 shadow-panel backdrop-blur">
            <h2 className="font-display text-3xl font-bold text-ink-800">Thank you!</h2>
            <p className="mt-3 text-sm text-slate-500">Your response has been submitted successfully and stored for admin review.</p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-6 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink-800 transition hover:-translate-y-0.5 hover:shadow-soft"
            >
              Submit another response
            </button>
          </div>
        ) : (
          <FormRenderer
            form={form}
            values={values}
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitting={submitting}
            error={error}
            submitLabel="Submit response"
          />
        )}
      </div>
    </div>
  );
};

export default FormFill;


