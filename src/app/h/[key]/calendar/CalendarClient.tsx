"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isFuture,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import type { FoodLog, Household, Unit } from "@/lib/types";
import { formatAmount, toGrams, unitLabel, type ViewUnit } from "@/lib/units";
import { BowlPip, CatCurl } from "@/components/CatArt";
import { IconChevron, IconClose } from "@/components/icons";
import UnitToggle from "@/components/UnitToggle";
import { CARD, Eyebrow } from "@/components/ui";

/** With no target set, a day's bowl reads feeds instead of grams. */
const NOMINAL_FEEDS = 3;

function dayKey(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return format(date, "yyyy-MM-dd");
}

export default function CalendarClient({ household, logs }: { household: Household; logs: FoodLog[] }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [view, setView] = useState<ViewUnit>("raw");

  // Group logs by local day once.
  const byDay = useMemo(() => {
    const m = new Map<string, FoodLog[]>();
    for (const l of logs) {
      const k = dayKey(l.fed_at);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(l);
    }
    // Oldest feed first inside a day reads like a timeline.
    for (const list of m.values()) list.sort((a, b) => a.fed_at.localeCompare(b.fed_at));
    return m;
  }, [logs]);

  const grid = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  // Month summary — only counts days that have already happened.
  const summary = useMemo(() => {
    const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }).filter(
      (d) => !isFuture(d),
    );
    let fedDays = 0;
    let totalG = 0;
    for (const d of days) {
      const dayLogs = byDay.get(dayKey(d)) ?? [];
      if (dayLogs.length === 0) continue;
      fedDays += 1;
      totalG += dayLogs.reduce((s, l) => s + (toGrams(l, household) ?? 0), 0);
    }
    return { days: days.length, fedDays, avgG: fedDays ? Math.round(totalG / fedDays) : 0 };
  }, [byDay, month, household]);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <section className={`${CARD} settle`} style={{ "--i": 0 } as React.CSSProperties}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            onClick={() => setMonth((m) => subMonths(m, 1))}
            aria-label="Previous month"
            className="grid h-10 w-10 place-items-center rounded-full border border-rim text-ink-soft transition hover:border-rim-strong hover:text-ink active:scale-90"
          >
            <IconChevron className="h-4 w-4 rotate-180" />
          </button>
          <div className="text-center">
            <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
              {format(month, "MMMM")}{" "}
              <span className="font-medium text-ink-soft">{format(month, "yyyy")}</span>
            </h2>
            <p className="text-xs text-ink-soft tabular-nums">
              Fed on {summary.fedDays} of {summary.days} days
              {summary.avgG > 0 && ` · ${summary.avgG} g avg`}
            </p>
          </div>
          <button
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label="Next month"
            className="grid h-10 w-10 place-items-center rounded-full border border-rim text-ink-soft transition hover:border-rim-strong hover:text-ink active:scale-90"
          >
            <IconChevron className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1.5 text-center md:gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              <span className="md:hidden">{d[0]}</span>
              <span className="hidden md:inline">{d}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {grid.map((d) => {
            const k = dayKey(d);
            const dayLogs = byDay.get(k) ?? [];
            const grams = dayLogs.reduce((s, l) => s + (toGrams(l, household) ?? 0), 0);
            const inMonth = isSameMonth(d, month);
            const fed = dayLogs.length > 0;
            const target = household.daily_target_g;
            const fill = target ? grams / target : Math.min(dayLogs.length / NOMINAL_FEEDS, 1);

            return (
              <button
                key={k}
                onClick={() => setOpenDay(k)}
                aria-label={`${format(d, "EEEE d MMMM")} — ${
                  fed ? `${dayLogs.length} feed${dayLogs.length === 1 ? "" : "s"}` : "no feeds"
                }`}
                className={`group relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl border transition active:scale-95 md:aspect-auto md:h-[88px] ${
                  fed && inMonth
                    ? "border-transparent bg-enamel-sunk hover:border-rim-strong"
                    : inMonth
                      ? "border-dashed border-rim bg-transparent hover:border-rim-strong"
                      : "border-transparent opacity-35"
                } ${isToday(d) ? "!border-solid !border-salmon ring-2 ring-salmon/25" : ""}`}
              >
                <span
                  className={`text-[13px] leading-none tabular-nums md:text-sm ${
                    fed && inMonth ? "font-bold text-ink" : "font-medium text-ink-soft"
                  }`}
                >
                  {format(d, "d")}
                </span>
                {fed && (
                  <>
                    <BowlPip
                      fill={fill}
                      className={`w-6 md:w-8 ${
                        target && grams >= target ? "text-mint" : "text-kibble"
                      }`}
                    />
                    <span className="hidden text-[10px] font-medium leading-none text-ink-soft tabular-nums md:block">
                      {grams > 0 ? `${Math.round(grams)} g` : `${dayLogs.length}×`}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-rim pt-4 text-xs text-ink-soft">
          <span className="flex items-center gap-1.5">
            <BowlPip fill={0.45} className="w-5 text-kibble" /> partly fed
          </span>
          <span className="flex items-center gap-1.5">
            <BowlPip fill={1} className="w-5 text-mint" /> target met
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-dashed border-rim-strong" /> no feeds
          </span>
        </div>
      </section>

      <p className="text-center text-[13px] text-ink-soft">Tap a day to see every feed.</p>

      {openDay && (
        <DaySheet
          dayKey={openDay}
          logs={byDay.get(openDay) ?? []}
          household={household}
          view={view}
          setView={setView}
          onClose={() => setOpenDay(null)}
        />
      )}
    </div>
  );
}

function DaySheet({
  dayKey,
  logs,
  household,
  view,
  setView,
  onClose,
}: {
  dayKey: string;
  logs: FoodLog[];
  household: Household;
  view: ViewUnit;
  setView: (v: ViewUnit) => void;
  onClose: () => void;
}) {
  // Escape closes; the page behind stays put while the sheet is up.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const date = new Date(dayKey + "T00:00:00");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Feeds on ${format(date, "EEEE, d MMMM yyyy")}`}
      onClick={onClose}
      className="veil-in fixed inset-0 z-50 flex items-end justify-center bg-[color-mix(in_srgb,var(--ink)_45%,transparent)] backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="sheet-pop max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-[32px] border border-rim bg-enamel p-5 pb-8 shadow-[var(--shadow-lift)] sm:rounded-[32px] sm:p-7"
      >
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-rim sm:hidden" />

        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <Eyebrow>{format(date, "EEEE")}</Eyebrow>
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              {format(date, "d MMMM yyyy")}
            </h2>
            <p className="mt-0.5 text-[13px] text-ink-soft">
              {logs.length === 0
                ? "Nothing logged"
                : `${logs.length} feed${logs.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-rim text-ink-soft transition hover:text-ink active:scale-90"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CatCurl className="w-28 text-ink-faint opacity-40" />
            <p className="text-sm text-ink-soft">No feeds on this day.</p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-3">
              <Eyebrow>Totals</Eyebrow>
              <UnitToggle view={view} setView={setView} />
            </div>
            <DayTotals logs={logs} household={household} />

            <ul className="mt-6 flex flex-col">
              {logs.map((l, i) => (
                <li
                  key={l.id}
                  className="drop-in flex items-center gap-3 border-t border-rim py-3 first:border-t-0"
                  style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}
                >
                  <span
                    className={`h-9 w-1.5 shrink-0 rounded-full ${
                      l.food_type === "dry" ? "bg-kibble" : "bg-salmon"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">{formatAmount(l, household, view)}</p>
                    <p className="truncate text-xs text-ink-soft">
                      <span className="capitalize">{l.food_type}</span>
                      {l.fed_by ? ` · fed by ${l.fed_by}` : ""}
                      {l.note ? ` · ${l.note}` : ""}
                    </p>
                  </div>
                  <time className="shrink-0 font-mono text-xs tabular-nums text-ink-soft" dateTime={l.fed_at}>
                    {new Date(l.fed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </time>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function DayTotals({ logs, household }: { logs: FoodLog[]; household: Household }) {
  const dry: Record<string, number> = {};
  const wet: Record<string, number> = {};
  let dryG = 0;
  let wetG = 0;
  for (const l of logs) {
    const target = l.food_type === "dry" ? dry : wet;
    target[l.unit] = (target[l.unit] ?? 0) + l.amount;
    const g = toGrams(l, household) ?? 0;
    if (l.food_type === "dry") dryG += g;
    else wetG += g;
  }
  const label = (u: Record<string, number>) =>
    Object.entries(u)
      .map(([unit, amt]) => `${Math.round(amt * 10) / 10} ${unitLabel(unit as Unit, amt)}`)
      .join(" + ") || "—";

  return (
    <div className="grid grid-cols-2 gap-3">
      {(
        [
          { tone: "kibble", name: "Dry", raw: label(dry), g: dryG },
          { tone: "salmon", name: "Wet", raw: label(wet), g: wetG },
        ] as const
      ).map((t) => (
        <div key={t.name} className="rounded-2xl bg-enamel-sunk/80 p-3.5">
          <span className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${t.tone === "kibble" ? "bg-kibble" : "bg-salmon"}`} />
            <Eyebrow>{t.name}</Eyebrow>
          </span>
          <p className="mt-1.5 font-display text-lg font-bold leading-tight">{t.raw}</p>
          {t.g > 0 && <p className="text-xs tabular-nums text-ink-faint">≈ {Math.round(t.g)} g</p>}
        </div>
      ))}
    </div>
  );
}
