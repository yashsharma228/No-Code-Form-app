import React from "react";
import AdminDashboard from "../components/AdminDashboard";
import { FormBuilderProvider } from "../context/FormBuilderContext";

const AdminForms = ({ initialSection = "Forms" }) => {
  return (
    <FormBuilderProvider>
      <AdminDashboard initialSection={initialSection} />
    </FormBuilderProvider>
  );
};

export default AdminForms;