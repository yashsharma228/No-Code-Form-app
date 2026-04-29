import React from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import AdminForms from "./pages/AdminForms";
import FormFill from "./pages/FormFill";

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      {!isAdminRoute ? (
        <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-800/90 px-6 py-4 text-white backdrop-blur xl:px-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-ember-500 to-ember-600 font-display text-sm font-bold tracking-[0.3em] text-orange-50">
                NC
              </div>
              <div>
                <div className="font-display text-lg font-bold">No-Code Form Studio</div>
                <div className="text-sm text-white/70">Create, publish, and analyze dynamic forms</div>
              </div>
            </div>
            <nav className="flex flex-wrap gap-2">
              <Link to="/" className="rounded-full px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white">
                Overview
              </Link>
              <Link to="/admin/forms" className="rounded-full px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white">
                Admin Studio
              </Link>
            </nav>
          </div>
        </header>
      ) : null}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Navigate to="/admin/forms" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin/forms" replace />} />
          <Route path="/admin/forms" element={<AdminForms initialSection="Forms" />} />
          <Route path="/form/:formId" element={<FormFill />} />
          <Route path="/forms/:formId" element={<FormFill />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
