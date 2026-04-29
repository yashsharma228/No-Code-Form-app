import React, { useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableElement from "./DraggableElement";
import DragZone from "./DragZone";
import { createField, FIELD_LIBRARY, sortFields } from "../lib/formUtils";

const FIELD_ICONS = {
  text: "T",
  textarea: "P",
  select: "V",
  radio: "O",
  checkbox: "C",
  date: "D",
};

function describeField(field) {
  if (["select", "radio", "checkbox"].includes(field.type)) {
    return field.options?.length
      ? field.options.slice(0, 3).join(" • ")
      : "Add options from the editor";
  }

  if (field.type === "date") {
    return "Calendar date input";
  }

  if (field.type === "textarea") {
    return field.placeholder || "Long-form written response";
  }

  return field.placeholder || "Short answer field";
}

const FormBuilder = ({ fields, onChange, selectedFieldId, onSelectField }) => {
  const sortedFields = useMemo(() => sortFields(fields), [fields]);

  const addField = (type) => {
    const nextField = {
      ...createField(type),
      order: sortedFields.length,
    };
    onChange([...sortedFields, nextField]);
    onSelectField?.(nextField.fieldId);
  };

  const moveField = (fieldId, direction) => {
    const index = sortedFields.findIndex((field) => field.fieldId === fieldId);
    const target = index + direction;

    if (index < 0 || target < 0 || target >= sortedFields.length) {
      return;
    }

    const nextFields = [...sortedFields];
    const [item] = nextFields.splice(index, 1);
    nextFields.splice(target, 0, item);
    onChange(nextFields.map((field, order) => ({ ...field, order })));
  };

  const removeField = (fieldId) => {
    const nextFields = sortedFields
      .filter((field) => field.fieldId !== fieldId)
      .map((field, order) => ({ ...field, order }));
    onChange(nextFields);
    onSelectField?.(nextFields[0]?.fieldId || null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid gap-5 xl:grid-cols-[250px,minmax(0,1fr)]">
        <aside className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">
              Field Library
            </div>
            <h3 className="mt-2 font-display text-xl font-bold text-ink-800">
              Add Fields
            </h3>
          </div>

          <div className="grid gap-3">
            {FIELD_LIBRARY.map((field) => (
              <div key={field.type} className="grid gap-2 rounded-[22px] border border-slate-200 bg-slate-50 p-3">
                <DraggableElement element={field} />
                <button
                  type="button"
                  onClick={() => addField(field.type)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink-800 transition hover:-translate-y-0.5 hover:border-teal-500 hover:text-teal-700"
                >
                  Add {field.title}
                </button>
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">
                Form Builder
              </div>
              <h3 className="mt-2 font-display text-xl font-bold text-ink-800">
                Arrange and configure fields
              </h3>
            </div>
            <div className="text-sm text-slate-500">
              {sortedFields.length} field{sortedFields.length === 1 ? "" : "s"} in this form. Drag and drop is supported, or add fields with one click.
            </div>
          </div>

          <DragZone onDrop={(item) => addField(item.type)} />

          <div className="mt-5 grid gap-4">
            {sortedFields.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/60 px-6 py-10 text-center text-sm text-slate-500">
                Add your first field to start building the form.
              </div>
            ) : (
              sortedFields.map((field, index) => (
                <article
                  key={field.fieldId}
                  className={`rounded-[20px] border px-4 py-4 shadow-sm transition ${selectedFieldId === field.fieldId ? "border-teal-500 bg-teal-50/70" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  onClick={() => onSelectField?.(field.fieldId)}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-600">
                        {FIELD_ICONS[field.type] || field.type.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                            Step {index + 1}
                          </div>
                          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                            {field.type}
                          </div>
                          {field.required ? (
                            <div className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-500">
                              Required
                            </div>
                          ) : null}
                        </div>
                        <h4 className="mt-3 truncate font-display text-lg font-bold text-ink-800">
                          {field.label}
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                          {describeField(field)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button 
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          moveField(field.fieldId, -1);
                        }}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-ink-800 transition hover:bg-slate-50"
                        disabled={index === 0}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          moveField(field.fieldId, 1);
                        }}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-ink-800 transition hover:bg-slate-50"
                        disabled={index === sortedFields.length - 1}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeField(field.fieldId);
                        }}
                        className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {field.width === "half" ? "Half Width" : "Full Width"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {field.alignment || "left"} aligned
                    </span>
                    {field.options?.length ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {field.options.length} options
                      </span>
                    ) : null}
                    {selectedFieldId === field.fieldId ? (
                      <span className="rounded-full bg-teal-600 px-3 py-1 text-white">
                        Editing now
                      </span>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </DndProvider>
  );
};

export default FormBuilder;