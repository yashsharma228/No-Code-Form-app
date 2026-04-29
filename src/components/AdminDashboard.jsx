import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FieldEditor from "./FieldEditor";
import FormBuilder from "./FormBuilder";
import ThemeCustomizer from "./ThemeCustomizer";
import { useFormBuilder } from "../context/FormBuilderContext";
import { getPublicFormUrl } from "../api";
import { downloadResponsesCsv, formatAnswerValue, sortFields } from "../lib/formUtils";

const NAV_ITEMS = ["Forms", "Responses", "Analytics"];

const AdminDashboard = ({ initialSection = "Forms" }) => {
  const {
    forms,
    activeForm,
    savingForm,
    responsesState,
    loadingResponses,
    createNewForm,
    selectForm,
    updateFormMeta,
    updateTheme,
    updateFields,
    saveActiveForm,
    duplicateActiveForm,
    removeForm,
    loadResponses,
  } = useFormBuilder();
  const navigate = useNavigate();

  const [selectedFieldId, setSelectedFieldId] = useState(
    activeForm.fields.length ? activeForm.fields[0]?.fieldId : null
  );
  const [activeSection, setActiveSection] = useState(initialSection);
  const [notice, setNotice] = useState("");

  const selectedField = useMemo(
    () => sortFields(activeForm.fields).find((field) => field.fieldId === selectedFieldId) || null,
    [activeForm.fields, selectedFieldId]
  );

  const sortedFields = useMemo(() => sortFields(activeForm.fields), [activeForm.fields]);
  const publicFormUrl = getPublicFormUrl(activeForm.id);
  const responseRows = responsesState.responses || [];

  useEffect(() => {
    if (!activeForm.fields.length) {
      setSelectedFieldId(null);
      return;
    }

    if (!activeForm.fields.some((field) => field.fieldId === selectedFieldId)) {
      setSelectedFieldId(activeForm.fields[0].fieldId);
    }
  }, [activeForm.fields, selectedFieldId]);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    if ((activeSection === "Responses" || activeSection === "Analytics") && activeForm.id) {
      loadResponses(activeForm.id).catch(() => {});
    }
  }, [activeSection, activeForm.id, loadResponses]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice("");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const applyFieldChange = (nextField) => {
    updateFields(
      activeForm.fields.map((field) => (field.fieldId === nextField.fieldId ? nextField : field))
    );
  };

  const handleSave = async () => {
    try {
      const saved = await saveActiveForm();
      setNotice(`Saved ${saved.name} successfully.`);
      return saved;
    } catch (error) {
      setNotice(error.message);
      return null;
    }
  };

  const handleDuplicate = async () => {
    try {
      if (!activeForm.id && activeForm.name.trim()) {
        const saved = await handleSave();
        if (!saved?.id) {
          return;
        }
      }

      const cloned = await duplicateActiveForm();
      if (cloned) {
        setNotice(`Duplicated ${cloned.name} and opened the copy.`);
        setSelectedFieldId(cloned.fields[0]?.fieldId || null);
      }
    } catch (error) {
      setNotice(error.message);
    }
  };

  const handleDelete = async (formId) => {
    if (!window.confirm("Delete this form and all responses?")) {
      return;
    }

    await removeForm(formId);
    setNotice("Form deleted.");
  };

  const ensureSavedForm = async () => {
    if (activeForm.id) {
      return activeForm;
    }

    return handleSave();
  };

  const handlePreview = async () => {
    const savedForm = await ensureSavedForm();
    if (!savedForm?.id) {
      return;
    }

    window.open(getPublicFormUrl(savedForm.id), "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    const savedForm = await ensureSavedForm();
    if (!savedForm?.id) {
      return;
    }

    const shareUrl = getPublicFormUrl(savedForm.id);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice("Public form link copied to clipboard.");
    } catch (error) {
      setNotice("Unable to copy the public form link.");
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    navigate("/admin/forms");
  };

  const handleFormSelection = async (event) => {
    const nextId = event.target.value;
    if (!nextId) {
      createNewForm();
      setNotice("New draft ready.");
      return;
    }

    const targetForm = forms.find((form) => String(form.id) === String(nextId));
    if (!targetForm) {
      return;
    }

    await selectForm(targetForm);
    setNotice(`Loaded ${targetForm.name}.`);
  };

  const handleOpenForm = async (formSummary) => {
    await selectForm(formSummary);
    setNotice(`Loaded ${formSummary.name}.`);
  };

  const renderFormsSection = () => (
    <>
      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">All Forms</div>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink-800">Your saved forms</h2>
            <p className="mt-2 text-sm text-slate-500">Open any saved form from here to continue editing it.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
            {forms.length} {forms.length === 1 ? "form" : "forms"}
          </div>
        </div>

        {!forms.length ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            No saved forms yet. Create a new form and save it to see it here.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {forms.map((form) => {
              const isActive = activeForm.id && String(activeForm.id) === String(form.id);

              return (
                <button
                  key={form.id}
                  type="button"
                  onClick={() => handleOpenForm(form)}
                  className={`rounded-[24px] border p-5 text-left transition ${isActive ? "border-teal-600 bg-teal-50 shadow-sm" : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-soft"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-bold text-ink-800">{form.name}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {form.description || "No description added yet."}
                      </div>
                    </div>
                    {isActive ? (
                      <span className="rounded-full bg-teal-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                        Open
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {form.responseCount || 0} responses
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-3xl font-bold text-ink-800">
                {activeForm.name || "Create New Form"}
              </h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {savingForm ? "Saving changes" : "All changes saved"}
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              Create, customize, and manage form experiences from a single workspace.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-ink-800">
            Form Name
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink-800 shadow-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              value={activeForm.name}
              onChange={(event) => updateFormMeta({ name: event.target.value })}
              placeholder="Customer feedback, event registration, onboarding"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink-800">
            Share Link
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 shadow-sm outline-none"
              value={publicFormUrl || "Save the form to generate a public URL"}
              readOnly
            />
          </label>
        </div>

        <label className="mt-4 grid gap-2 text-sm font-semibold text-ink-800">
          Description
          <textarea
            className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink-800 shadow-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            value={activeForm.description}
            onChange={(event) => updateFormMeta({ description: event.target.value })}
            placeholder="Explain what the form is for and what respondents should expect."
          />
        </label>

        <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1.35fr),340px]">
          <FormBuilder
            fields={activeForm.fields}
            selectedFieldId={selectedFieldId}
            onSelectField={setSelectedFieldId}
            onChange={(fields) => {
              updateFields(fields);
              if (!selectedFieldId && fields[0]) {
                setSelectedFieldId(fields[0].fieldId);
              }
            }}
          />

          <div className="grid gap-6">
            <FieldEditor field={selectedField} onChange={applyFieldChange} />
            <ThemeCustomizer theme={activeForm.theme} onThemeChange={updateTheme} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
          <p className="text-sm text-slate-500">
            Manage the current form after saving.
          </p>
          <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDuplicate}
            disabled={savingForm || (!activeForm.id && !activeForm.name.trim())}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition hover:-translate-y-0.5 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            Duplicate Form
          </button>
          <button
            onClick={() => activeForm.id && handleDelete(activeForm.id)}
            disabled={!activeForm.id}
            className="rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete Form
          </button>
          </div>
        </div>
      </section>
    </>
  );

  const renderResponsesSection = () => (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Responses</div>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink-800">Submission review</h2>
          <p className="mt-2 text-sm text-slate-500">Inspect responses for the active form and export them as CSV.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => loadResponses()} disabled={!activeForm.id || loadingResponses} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink-800 disabled:cursor-not-allowed disabled:opacity-60">
            {loadingResponses ? "Refreshing..." : "Reload Responses"}
          </button>
          <button onClick={() => downloadResponsesCsv(activeForm, responseRows)} disabled={!responseRows.length} className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
            Export CSV
          </button>
        </div>
      </div>

      {!responseRows.length ? (
        <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
          {activeForm.id ? "No responses found yet for this form." : "Save and load a form first to inspect responses."}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr>
                <th className="px-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Submitted</th>
                {sortedFields.map((field) => (
                  <th key={field.fieldId} className="px-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responseRows.map((response) => (
                <tr key={response.id}>
                  <td className="rounded-l-2xl border-y border-l border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    {new Date(response.submittedAt).toLocaleString()}
                  </td>
                  {sortedFields.map((field, index, items) => (
                    <td
                      key={field.fieldId}
                      className={`${index === items.length - 1 ? "rounded-r-2xl border-r" : ""} border-y border-slate-200 bg-white px-4 py-3 text-sm text-ink-800`}
                    >
                      {formatAnswerValue(response.answers?.[field.fieldId])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  const renderAnalyticsSection = () => (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Analytics</div>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink-800">Form summary</h2>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Responses</div>
          <div className="mt-2 text-4xl font-bold text-ink-800">{responsesState.stats?.totalResponses || activeForm.responseCount || 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Fields</div>
          <div className="mt-2 text-4xl font-bold text-ink-800">{sortedFields.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Latest Submission</div>
          <div className="mt-2 text-sm font-semibold text-ink-800">
            {responsesState.stats?.lastSubmittedAt ? new Date(responsesState.stats.lastSubmittedAt).toLocaleString() : "No activity yet"}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              <th className="px-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Field</th>
              <th className="px-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Type</th>
              <th className="px-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Required</th>
            </tr>
          </thead>
          <tbody>
            {sortedFields.length === 0 ? (
              <tr>
                <td colSpan="3" className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                  Add fields and collect responses to view analytics.
                </td>
              </tr>
            ) : (
              sortedFields.map((field) => (
                <tr key={field.fieldId}>
                  <td className="rounded-l-2xl border-y border-l border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink-800">
                    {field.label}
                  </td>
                  <td className="border-y border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    {field.type}
                  </td>
                  <td className="rounded-r-2xl border-y border-r border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    {field.required ? "Yes" : "No"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "Responses":
        return renderResponsesSection();
      case "Analytics":
        return renderAnalyticsSection();
      case "Forms":
      default:
        return renderFormsSection();
    }
  };

  return (
    <div className="min-h-screen xl:grid xl:grid-cols-[240px,minmax(0,1fr)]">
      <aside className="flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-5 py-6 text-white">
        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 font-display text-sm font-bold tracking-[0.3em] text-white">
            NC
          </div>
          <div>
            <div className="font-display text-lg font-bold">Form Builder</div>
            <div className="text-xs text-white/55">No-code admin studio</div>
          </div>
        </div>

        <nav className="mt-6 grid gap-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSectionChange(item)}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${item === activeSection ? "bg-teal-600 text-white shadow-lg shadow-teal-950/30" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
            >
              <span>{item}</span>
              <span className={`text-[10px] uppercase tracking-[0.2em] ${item === activeSection ? "text-white/80" : "text-white/50"}`}>
                {item === activeSection ? "Open" : "Ready"}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Workspace</div>
          <label className="mt-4 grid gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/60">
            Open Form
            <select
              value={activeForm.id || ""}
              onChange={handleFormSelection}
              className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3 text-sm font-semibold text-white outline-none"
            >
              <option value="" className="text-slate-900">New draft</option>
              {forms.map((form) => (
                <option key={form.id} value={form.id} className="text-slate-900">
                  {form.name}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-3 grid gap-3">
            <div>
              <div className="text-3xl font-bold">{forms.length}</div>
              <div className="text-sm text-white/60">forms created</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{responsesState.stats?.totalResponses || activeForm.responseCount || 0}</div>
              <div className="text-sm text-white/60">responses tracked</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={createNewForm}
          className="mt-auto rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:-translate-y-0.5"
        >
          + New Form
        </button>
      </aside>

      <section className="min-w-0">
        <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-4 text-white xl:px-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Workspace</div>
            <h1 className="mt-1 font-display text-2xl font-bold">{activeSection}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePreview}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={savingForm}
              className="rounded-xl border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-teal-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingForm ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Publish
            </button>
          </div>
        </div>

        {notice ? (
          <div className="px-4 pt-4 xl:px-8">
            <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700 shadow-sm">
              {notice}
            </div>
          </div>
        ) : null}

        <div className="space-y-6 px-4 py-6 xl:px-8">{renderSection()}</div>
      </section>
    </div>
  );
};

export default AdminDashboard;