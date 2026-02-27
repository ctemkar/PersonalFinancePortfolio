const STORAGE_KEY = "pfp.preferences.v1";

const DEFAULTS = {
  scope: "INDIVIDUAL",     // IMPORTANT: default must be INDIVIDUAL
  exportMode: "ASK",       // ASK | PRINT | PDF
};

export function loadPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...parsed,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePreferences(next) {
  const current = loadPreferences();
  const merged = { ...current, ...next };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}
