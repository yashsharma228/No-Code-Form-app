import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  createForm,
  deleteFormById,
  fetchFormById,
  fetchForms,
  fetchResponsesForForm,
  updateForm,
} from "../api";
import {
  duplicateFormPayload,
  getEmptyForm,
  normalizeFields,
  normalizeFormPayload,
  sortFields,
} from "../lib/formUtils";

const FormBuilderContext = createContext(null);

export function FormBuilderProvider({ children }) {
  const [forms, setForms] = useState([]);
  const [activeForm, setActiveForm] = useState(getEmptyForm);
  const [loadingForms, setLoadingForms] = useState(true);
  const [savingForm, setSavingForm] = useState(false);
  const [responsesState, setResponsesState] = useState({ form: null, stats: null, responses: [] });
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [shouldAutoSelectFirstForm, setShouldAutoSelectFirstForm] = useState(true);

  const loadForms = async () => {
    setLoadingForms(true);
    try {
      const data = await fetchForms();
      setForms(data);
      return data;
    } finally {
      setLoadingForms(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    if (!shouldAutoSelectFirstForm || loadingForms || activeForm.id || forms.length === 0) {
      return;
    }

    const [firstForm] = forms;
    if (!firstForm?.id) {
      return;
    }

    fetchFormById(firstForm.id)
      .then((form) => {
        setActiveForm({
          ...form,
          fields: normalizeFields(form.fields),
          theme: { ...getEmptyForm().theme, ...(form.theme || {}) },
        });
        setShouldAutoSelectFirstForm(false);
      })
      .catch(() => {});
  }, [forms, loadingForms, activeForm.id, shouldAutoSelectFirstForm]);

  const createNewForm = () => {
    setShouldAutoSelectFirstForm(false);
    setActiveForm(getEmptyForm());
    setResponsesState({ form: null, stats: null, responses: [] });
  };

  const selectForm = async (formSummary) => {
    const form = await fetchFormById(formSummary.id);
    setActiveForm({
      ...form,
      fields: normalizeFields(form.fields),
      theme: { ...getEmptyForm().theme, ...(form.theme || {}) },
    });
    setResponsesState({ form: null, stats: null, responses: [] });
  };

  const updateFormMeta = (patch) => {
    setActiveForm((current) => ({ ...current, ...patch }));
  };

  const updateTheme = (patch) => {
    setActiveForm((current) => ({
      ...current,
      theme: { ...current.theme, ...patch },
    }));
  };

  const updateFields = (fields) => {
    setActiveForm((current) => ({
      ...current,
      fields: normalizeFields(fields),
    }));
  };

  const saveActiveForm = async () => {
    const payload = normalizeFormPayload(activeForm);
    if (!payload.name) {
      throw new Error("Form name is required.");
    }

    setSavingForm(true);
    try {
      const saved = activeForm.id ? await updateForm(activeForm.id, payload) : await createForm(payload);
      const hydrated = {
        ...saved,
        fields: normalizeFields(saved.fields),
        theme: { ...getEmptyForm().theme, ...(saved.theme || {}) },
      };

      setActiveForm(hydrated);
      await loadForms();
      return hydrated;
    } finally {
      setSavingForm(false);
    }
  };

  const duplicateActiveForm = async (sourceForm = activeForm) => {
    if (!sourceForm?.name?.trim() && !sourceForm?.id) {
      return null;
    }

    setSavingForm(true);
    try {
      const formToClone = sourceForm.id && !Array.isArray(sourceForm.fields)
        ? await fetchFormById(sourceForm.id)
        : sourceForm;

      const cloned = await createForm(duplicateFormPayload(formToClone));
      const hydrated = {
        ...cloned,
        fields: normalizeFields(cloned.fields),
        theme: { ...getEmptyForm().theme, ...(cloned.theme || {}) },
      };

      setActiveForm(hydrated);
      setResponsesState({ form: null, stats: null, responses: [] });
      await loadForms();
      return hydrated;
    } finally {
      setSavingForm(false);
    }
  };

  const removeForm = async (formId) => {
    await deleteFormById(formId);
    const nextForms = await loadForms();

    if (activeForm.id === formId) {
      if (nextForms.length > 0) {
        const next = await fetchFormById(nextForms[0].id);
        setActiveForm({
          ...next,
          fields: normalizeFields(next.fields),
          theme: { ...getEmptyForm().theme, ...(next.theme || {}) },
        });
      } else {
        createNewForm();
      }
    }
  };

  const loadResponses = useCallback(
    async (formId = activeForm.id) => {
      if (!formId) {
        setResponsesState({ form: null, stats: null, responses: [] });
        return null;
      }

      setLoadingResponses(true);
      try {
        const responsePayload = await fetchResponsesForForm(formId);
        setResponsesState(responsePayload);
        return responsePayload;
      } finally {
        setLoadingResponses(false);
      }
    },
    [activeForm.id]
  );

  const value = {
    forms,
    activeForm: {
      ...activeForm,
      fields: sortFields(activeForm.fields),
    },
    loadingForms,
    savingForm,
    responsesState,
    loadingResponses,
    loadForms,
    createNewForm,
    selectForm,
    updateFormMeta,
    updateTheme,
    updateFields,
    saveActiveForm,
    duplicateActiveForm,
    removeForm,
    loadResponses,
  };

  return <FormBuilderContext.Provider value={value}>{children}</FormBuilderContext.Provider>;
}

export function useFormBuilder() {
  const context = useContext(FormBuilderContext);
  if (!context) {
    throw new Error("useFormBuilder must be used inside FormBuilderProvider");
  }
  return context;
}