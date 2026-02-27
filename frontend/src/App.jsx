import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budgets from "./pages/Budgets.jsx";
import Categories from "./pages/Categories.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/budgets" element={<Budgets />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}