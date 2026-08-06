"use client";

import { useEffect, useState } from "react";

export const THEME_KEY = "taco.theme";

/*
  Two times of day, not two colour schemes: "Morning kitchen" and "Night kitchen".
  Starts on the system preference and remembers the choice after that.
*/
type Theme = "light" | "dark";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private mode: the choice just won't survive a reload.
    }
  }

  const dark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to morning kitchen" : "Switch to night kitchen"}
      title={dark ? "Morning kitchen" : "Night kitchen"}
      className={`grid h-10 w-10 place-items-center rounded-full border border-rim bg-enamel text-ink-soft transition hover:text-ink active:scale-90 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden>
        {dark ? (
          // Crescent — the 3am kitchen light.
          <path
            d="M20 14.2A8.5 8.5 0 0 1 9.8 4 8.5 8.5 0 1 0 20 14.2Z"
            fill="currentColor"
          />
        ) : (
          <>
            <circle cx="12" cy="12" r="4.4" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" />
            </g>
          </>
        )}
      </svg>
    </button>
  );
}
