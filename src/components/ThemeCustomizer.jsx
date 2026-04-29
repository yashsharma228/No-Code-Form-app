import React from "react";

const ThemeCustomizer = ({ theme, onThemeChange }) => {
  const handleChange = (key, value) => {
    onThemeChange({ [key]: value });
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Theme Studio</div>
        <h3 className="mt-2 font-display text-2xl font-bold text-ink-800">Visual styling</h3>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2 text-sm font-semibold text-ink-800">
          <label>Theme Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["light", "Light"],
              ["dark", "Dark"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => handleChange("mode", value)}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${theme.mode === value ? "border-teal-600 bg-teal-600 text-white" : "border-slate-200 bg-white text-ink-800"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {[
          ["primaryColor", "Primary Color", "#0f766e"],
          ["backgroundColor", "Background Color", "#ffffff"],
          ["textColor", "Text Color", "#14213d"],
        ].map(([key, label, fallback]) => (
          <div key={key} className="grid gap-2 text-sm font-semibold text-ink-800">
            <label>{label}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-11 w-14 rounded-xl border border-slate-200 bg-white"
                value={theme[key] || fallback}
                onChange={(event) => handleChange(key, event.target.value)}
              />
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                value={theme[key] || fallback}
                onChange={(event) => handleChange(key, event.target.value)}
              />
            </div>
          </div>
        ))}

        <label className="grid gap-2 text-sm font-semibold text-ink-800">
          Font Family
          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            value={theme.fontFamily || "Manrope, system-ui, sans-serif"}
            onChange={(event) => handleChange("fontFamily", event.target.value)}
          >
            <option value="Manrope, system-ui, sans-serif">Manrope</option>
            <option value="Inter, system-ui, sans-serif">Inter</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Helvetica Neue', sans-serif">Helvetica Neue</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default ThemeCustomizer;

