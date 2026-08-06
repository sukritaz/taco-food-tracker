/*
  The shared enamel surfaces. Everything in the app is one of three things:
  a CARD (a piece of enamel), a WELL (an inset dish inside a card), or a control.
*/

export const CARD =
  "rounded-[28px] border border-rim bg-enamel/85 p-5 shadow-[var(--shadow-card)] backdrop-blur-md md:p-6";

export const WELL = "rounded-2xl bg-enamel-sunk/80 p-4";

/* No width here on purpose: `w-full` inside this constant and a `w-24` at the
   call site are the same Tailwind layer, so whichever came later in the
   generated stylesheet would win rather than the one written last. Every use
   sets its own width. */
export const INPUT =
  "min-w-0 rounded-2xl border border-rim bg-enamel-sunk/70 px-4 py-3 text-[15px] text-ink outline-none transition focus:border-salmon focus:bg-enamel";

export const BUTTON_PRIMARY =
  "w-full rounded-2xl bg-salmon px-5 py-4 font-display text-base font-bold text-white shadow-[var(--shadow-card)] transition hover:bg-salmon-deep active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55";

export const BUTTON_QUIET =
  "rounded-2xl border border-rim bg-enamel px-4 py-2.5 text-sm font-medium text-ink transition hover:border-rim-strong active:scale-95";

export function SectionTitle({
  children,
  hint,
  action,
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-lg font-bold leading-tight tracking-tight">{children}</h2>
        {hint && <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

/** Small caps label for data columns and totals. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{children}</span>
  );
}
