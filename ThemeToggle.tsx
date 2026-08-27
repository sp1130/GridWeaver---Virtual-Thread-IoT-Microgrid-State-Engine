import React, { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  ThemeToggle — dark/light theme switch                              */
/*                                                                     */
/*  • Stores the chosen theme in localStorage                          */
/*  • Applies a data-theme attribute on <html> so TileLayer theme +    */
/*    CSS can react accordingly                                        */
/* ------------------------------------------------------------------ */
export type AppTheme = "dark" | "light";

const THEME_KEY = "gridweaver-theme";

function readTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<AppTheme>(readTheme);

  /* Keep the document attribute in sync whenever the theme changes */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // localStorage unavailable — ignore
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="flex items-center justify-center w-8 h-8 rounded-md border border-slate-600
                 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
      data-testid="theme-toggle"
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
};

export default ThemeToggle;
