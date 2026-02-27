
import React, { createContext, useContext, useMemo, useState } from "react";
import { loadPreferences, savePreferences } from "./preferences";

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(() => loadPreferences());

  const api = useMemo(() => {
    return {
      prefs,
      setScope: (scope) => setPrefs(savePreferences({ scope })),              // INDIVIDUAL | FAMILY
      setExportMode: (exportMode) => setPrefs(savePreferences({ exportMode })), // ASK | PRINT | PDF
    };
  }, [prefs]);

  return (
    <PreferencesContext.Provider value={api}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside PreferencesProvider");
  return ctx;
}