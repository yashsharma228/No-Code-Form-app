import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 xl:px-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-panel md:p-12">
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-ink-800 md:text-6xl md:leading-[1]">
          Create, publish, and manage no-code dynamic forms.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500">
          Build forms visually, collect responses, and review results from one simple admin workspace.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/admin/forms")}
            className="rounded-full bg-gradient-to-r from-ember-500 to-ember-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            Open Form Builder
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-3">
        {[
          ["Create forms", "Add text, textarea, dropdown, radio, checkbox, and date fields without writing code."],
          ["Manage forms", "Edit, duplicate, save, preview, publish, and delete forms from the admin panel."],
          ["Review data", "View responses, export CSV files, and inspect basic analytics for each form."],
        ].map(([title, description]) => (
          <article key={title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="font-display text-2xl font-bold text-ink-800">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Home;
