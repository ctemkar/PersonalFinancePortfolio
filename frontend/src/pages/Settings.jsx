// frontend/src/pages/Settings.jsx
import React from "react";
import Layout from "../components/Layout.jsx";
import { usePreferences } from "../lib/PreferencesContext.jsx";

export default function Settings() {
  const { prefs, setScope, setExportMode } = usePreferences();

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Settings</h1>
      </div>

      <div style={{ marginTop: 20, maxWidth: 560 }}>
        <h3 style={{ marginBottom: 10 }}>Default Scope</h3>

        <label style={{ display: "block", marginTop: 8 }}>
          <input
            type="radio"
            name="scope"
            checked={prefs.scope === "INDIVIDUAL"}
            onChange={() => setScope("INDIVIDUAL")}
          />
          <span style={{ marginLeft: 8 }}>Individual (default)</span>
        </label>

        <label style={{ display: "block", marginTop: 8 }}>
          <input
            type="radio"
            name="scope"
            checked={prefs.scope === "FAMILY"}
            onChange={() => setScope("FAMILY")}
          />
          <span style={{ marginLeft: 8 }}>Family</span>
        </label>

        <hr style={{ margin: "24px 0" }} />

        <h3 style={{ marginBottom: 10 }}>Export / Print Default</h3>

        <select
          value={prefs.exportMode}
          onChange={(e) => setExportMode(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.2)",
          }}
        >
          <option value="ASK">Ask every time</option>
          <option value="PDF">PDF</option>
          <option value="PRINT">Print</option>
        </select>

        <p style={{ marginTop: 10, opacity: 0.75 }}>
          These preferences are stored locally in your browser (no database
          changes).
        </p>
      </div>
    </Layout>
  );
}