"use client";

import type { ViewUnit } from "@/lib/units";

/** Switch between what was logged ("1 scoop") and what it converts to ("30 g"). */
export default function UnitToggle({
  view,
  setView,
}: {
  view: ViewUnit;
  setView: (v: ViewUnit) => void;
}) {
  return (
    <div className="flex shrink-0 rounded-full border border-rim bg-enamel-sunk/80 p-1 text-xs">
      {(["raw", "grams"] as ViewUnit[]).map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          aria-pressed={view === v}
          className={`rounded-full px-3 py-1.5 font-medium capitalize transition ${
            view === v ? "bg-enamel text-ink shadow-[var(--shadow-card)]" : "text-ink-soft hover:text-ink"
          }`}
        >
          {v === "raw" ? "As logged" : "Grams"}
        </button>
      ))}
    </div>
  );
}
