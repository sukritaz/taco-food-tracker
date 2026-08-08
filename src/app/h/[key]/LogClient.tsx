"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { FoodLog, FoodType, Household, Unit } from "@/lib/types";
import { UNITS_FOR_FOOD, formatAmount, toGrams, unitLabel, type ViewUnit } from "@/lib/units";
import { BowlGauge, CatCurl } from "@/components/CatArt";
import { IconTrash } from "@/components/icons";
import UnitToggle from "@/components/UnitToggle";
import { BUTTON_PRIMARY, CARD, Eyebrow, INPUT, SectionTitle } from "@/components/ui";

const FED_BY_STORAGE = "taco.fedBy";
/** With no daily target set, the bowl reads feeds instead of grams. */
const NOMINAL_FEEDS = 3;

export default function LogClient({
  householdKey,
  household,
  initialToday,
}: {
  householdKey: string;
  household: Household;
  initialToday: FoodLog[];
}) {
  const [logs, setLogs] = useState<FoodLog[]>(initialToday);
  const [food, setFood] = useState<FoodType>("dry");
  const [unit, setUnit] = useState<Unit>("scoop");
  const [amount, setAmount] = useState("1");
  const [fedBy, setFedBy] = useState("");
  const [view, setView] = useState<ViewUnit>("raw");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [splash, setSplash] = useState(0);
  // Clock times and "3 h ago" depend on the reader's timezone and on when the
  // page is read, so they render after mount rather than during SSR.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setFedBy(localStorage.getItem(FED_BY_STORAGE) ?? "");
    } catch {
      /* private mode */
    }
  }, []);

  const allowedUnits = UNITS_FOR_FOOD[food];
  const totals = useMemo(() => sumByFood(logs, household), [logs, household]);
  const totalG = Math.round(totals.dryGrams + totals.wetGrams);
  const target = household.daily_target_g;
  const fill = target ? totalG / target : Math.min(logs.length / NOMINAL_FEEDS, 1);
  const shownTotal = useCountUp(target ? totalG : logs.length);

  function pickFood(f: FoodType) {
    setFood(f);
    if (!UNITS_FOR_FOOD[f].includes(unit)) setUnit(UNITS_FOR_FOOD[f][0]);
  }

  async function submit() {
    setError(null);
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    setBusy(true);
    if (fedBy.trim()) {
      try {
        localStorage.setItem(FED_BY_STORAGE, fedBy.trim());
      } catch {
        /* private mode */
      }
    }
    try {
      const res = await fetch(`/api/h/${householdKey}/food`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food_type: food, unit, amount: amt, fed_by: fedBy.trim() || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Couldn't save that feed. Try again.");
      const { log } = await res.json();
      setLogs((prev) => [log as FoodLog, ...prev]);
      setSplash((s) => s + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save that feed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    const prev = logs;
    setLogs((l) => l.filter((x) => x.id !== id)); // optimistic
    const res = await fetch(`/api/h/${householdKey}/food/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setLogs(prev);
      setError("Couldn't remove that entry. It's back in the list.");
    }
  }

  const last = logs[0];

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      {/* ── The bowl: today at a glance ───────────────────────────────── */}
      <section className={`${CARD} settle relative overflow-hidden`} style={{ "--i": 0 } as React.CSSProperties}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow>Today</Eyebrow>
            <p className="mt-1 font-display text-4xl font-extrabold leading-none tracking-tight tabular-nums md:text-5xl">
              {shownTotal}
              <span className="ml-1.5 font-sans text-base font-semibold text-ink-soft">
                {target ? "g" : logs.length === 1 ? "feed" : "feeds"}
              </span>
            </p>
            <p className="mt-1.5 text-[13px] text-ink-soft">
              {target ? (
                totalG >= target ? (
                  <span className="font-semibold text-mint">Target met — {totalG - target} g over</span>
                ) : (
                  <>
                    {target - totalG} g to go of {target} g
                  </>
                )
              ) : (
                <>
                  No daily target yet ·{" "}
                  <Link href={`/h/${householdKey}/settings`} className="font-semibold text-salmon underline-offset-2 hover:underline">
                    set one
                  </Link>
                </>
              )}
            </p>
          </div>
          <BowlGauge
            fill={fill}
            overfull={target != null && totalG > target}
            splash={splash}
            className="w-32 shrink-0 md:w-40"
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <TotalWell tone="kibble" label="Dry" grams={totals.dryGrams} raw={totals.dryRaw} />
          <TotalWell tone="salmon" label="Wet" grams={totals.wetGrams} raw={totals.wetRaw} />
        </div>

        <p className="mt-4 text-[13px] text-ink-soft" suppressHydrationWarning>
          {last ? (
            <>
              Last fed <strong className="font-semibold text-ink">{mounted ? timeAgo(last.fed_at) : "…"}</strong>
              {last.fed_by ? ` by ${last.fed_by}` : ""}
            </>
          ) : (
            <>Nobody has fed {household.cat_name} yet today.</>
          )}
        </p>
      </section>

      {/* ── Log a feed ────────────────────────────────────────────────── */}
      <section className={`${CARD} settle`} style={{ "--i": 1 } as React.CSSProperties}>
        <SectionTitle>Log a feed</SectionTitle>

        <div className="mb-3 grid grid-cols-2 gap-2.5">
          {(["dry", "wet"] as FoodType[]).map((f) => (
            <button
              key={f}
              onClick={() => pickFood(f)}
              aria-pressed={food === f}
              className={`rounded-2xl border py-3.5 text-[15px] font-semibold capitalize transition active:scale-[0.97] ${
                food === f
                  ? f === "dry"
                    ? "border-kibble bg-kibble-wash text-kibble-deep"
                    : "border-salmon bg-salmon-wash text-salmon-deep"
                  : "border-rim bg-enamel-sunk/60 text-ink-soft hover:text-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mb-3 flex gap-2.5">
          <label className="sr-only" htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.25"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`${INPUT} w-24 shrink-0 text-center font-mono text-lg tabular-nums`}
          />
          <div className="flex min-w-0 flex-1 gap-2.5">
            {allowedUnits.map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                aria-pressed={unit === u}
                className={`flex-1 rounded-2xl border py-3 text-sm font-medium capitalize transition active:scale-[0.97] ${
                  unit === u
                    ? "border-ink bg-ink text-enamel"
                    : "border-rim bg-enamel-sunk/60 text-ink-soft hover:text-ink"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <label className="sr-only" htmlFor="fed-by">
          Your name
        </label>
        <input
          id="fed-by"
          value={fedBy}
          onChange={(e) => setFedBy(e.target.value)}
          placeholder="Your name (optional)"
          className={`${INPUT} mb-3 w-full`}
        />

        {error && (
          <p role="alert" className="mb-3 rounded-2xl bg-salmon-wash px-4 py-2.5 text-[13px] font-medium text-salmon-deep">
            {error}
          </p>
        )}

        <button onClick={submit} disabled={busy} className={BUTTON_PRIMARY}>
          {busy ? "Saving…" : "Log feed"}
        </button>
      </section>

      {/* ── Today's entries ───────────────────────────────────────────── */}
      <section className={`${CARD} settle md:col-span-2`} style={{ "--i": 2 } as React.CSSProperties}>
        <SectionTitle action={<UnitToggle view={view} setView={setView} />}>Today&apos;s entries</SectionTitle>

        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CatCurl className="w-24 text-ink-faint opacity-40" />
            <p className="text-sm text-ink-soft">
              Nothing logged yet. The first feed of the day goes above.
            </p>
          </div>
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {logs.map((l, i) => (
              <li
                key={l.id}
                className="drop-in flex items-center gap-3 rounded-2xl bg-enamel-sunk/70 px-3.5 py-3"
                style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
              >
                <span
                  className={`h-9 w-1.5 shrink-0 rounded-full ${l.food_type === "dry" ? "bg-kibble" : "bg-salmon"}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">{formatAmount(l, household, view)}</p>
                  <p className="truncate text-xs text-ink-soft">
                    <span className="capitalize">{l.food_type}</span>
                    <span suppressHydrationWarning>
                      {" · "}
                      {mounted ? clockTime(l.fed_at) : "··:··"}
                    </span>
                    {l.fed_by ? ` · ${l.fed_by}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => remove(l.id)}
                  aria-label={`Remove ${formatAmount(l, household, view)} entry`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-faint transition hover:bg-salmon-wash hover:text-salmon active:scale-90"
                >
                  <IconTrash className="h-[18px] w-[18px]" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TotalWell({
  tone,
  label,
  grams,
  raw,
}: {
  tone: "kibble" | "salmon";
  label: string;
  grams: number;
  raw: string;
}) {
  return (
    <div className="rounded-2xl bg-enamel-sunk/80 p-3.5">
      <span className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${tone === "kibble" ? "bg-kibble" : "bg-salmon"}`} />
        <Eyebrow>{label}</Eyebrow>
      </span>
      <p className="mt-1.5 font-display text-xl font-bold leading-tight tabular-nums">{raw || "—"}</p>
      {grams > 0 && <p className="text-xs text-ink-faint tabular-nums">≈ {Math.round(grams)} g</p>}
    </div>
  );
}

/** Numbers roll up to their new value so a logged feed is felt, not just seen. */
function useCountUp(value: number) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fromRef.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    const DURATION = 550;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(from + (value - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return shown;
}

/** Clock time in the reader's timezone. Client-only — the server renders in UTC. */
function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

// Sum entries per food type. The raw label groups by unit so mixed units stay
// honest ("2 scoops + 30 g"); the grams column uses household conversion factors.
function sumByFood(logs: FoodLog[], h: Household) {
  const acc = {
    dryGrams: 0,
    wetGrams: 0,
    dryUnits: {} as Record<string, number>,
    wetUnits: {} as Record<string, number>,
  };
  for (const l of logs) {
    const g = toGrams(l, h);
    const target = l.food_type === "dry" ? acc.dryUnits : acc.wetUnits;
    target[l.unit] = (target[l.unit] ?? 0) + l.amount;
    if (g != null) {
      if (l.food_type === "dry") acc.dryGrams += g;
      else acc.wetGrams += g;
    }
  }
  return {
    dryGrams: acc.dryGrams,
    wetGrams: acc.wetGrams,
    dryRaw: rawLabel(acc.dryUnits),
    wetRaw: rawLabel(acc.wetUnits),
  };
}

function rawLabel(units: Record<string, number>): string {
  return Object.entries(units)
    .map(([u, amt]) => `${round(amt)} ${unitLabel(u as Unit, amt)}`)
    .join(" + ");
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}