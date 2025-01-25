const storageKey = "jazzPrefs";
export type JazzPrefs = {
  darkPref?: "bright" | "dark" | "auto";
  compactPref?: "normal" | "compact" | "auto";
};

export default function useJazzPrefs() {
  function getPreferences(): JazzPrefs {
    const prefs = localStorage.getItem(storageKey);
    if (prefs) {
      return JSON.parse(prefs);
    } else return { darkPref: "auto", compactPref: "auto" };
  }

  function setPreferences(prefs: JazzPrefs): void {
    localStorage.removeItem(storageKey);
    localStorage.setItem(storageKey, JSON.stringify(prefs));
    window.dispatchEvent(new Event("storage"));
  }

  return { getPreferences, setPreferences };
}
