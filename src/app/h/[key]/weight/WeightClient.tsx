"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { WeightLog } from "@/lib/types";
import { CatStretch } from "@/components/CatArt";
import { BUTTON_PRIMARY, CARD, Eyebrow, INPUT, SectionTitle } from "@/components/ui";

export default function WeightClient({
  householdKey,
  catName,
  initial,
}: {
  householdKey: string;
  catName: string;
  initial: WeightLog[];
}) {
  const [weights, setWeights] = useState<WeightLog[]>(initial);
  const [kg, setKg] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latest = weights[0];
  const previous = weights[1];
  const delta = latest && previous ? Number(latest.weight_kg) - Number(previous.weight_kg) : null;

  async function submit() {
    setError(null);
    const w = Number(kg);
    if (!Number.isFinite(w) || w <= 0) {
      setError("Enter a weight greater than 0.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/h/${householdKey}/weight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight_kg: w, measured_on: date }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Couldn't save that weigh-in. Try again.");
      const { weight } = await res.json();
      setWeights((prev) =>
        [weight as WeightLog, ...prev].sort((a, b) => b.measured_on.localeCompare(a.measured_on)),
      );
      setKg("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save that weigh-in. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      <section className={`${CARD} settle relative overflow-hidden`} style={{ "--i": 0 } as React.CSSProperties}>
        <CatStretch className="pointer-events-none absolute -bottom-3 -right-4 w-40 text-ink opacity-[0.06]" />
        <Eyebrow>Latest weight</Eyebrow>
        <p className="mt-1 font-display text-5xl font-extrabold leading-none tracking-tight tabular-nums">
          {latest ? Number(latest.weight_kg).toFixed(2) : "—"}
          {latest && <span className="ml-1.5 font-sans text-lg font-semibold text-ink-soft">kg</span>}
        </p>
        {latest ? (
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-soft">
            <span>Weighed {format(new Date(latest.measured_on + "T00:00:00"), "d MMM yyyy")}</span>
            {delta !== null && delta !== 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                  delta > 0 ? "bg-kibble-wash text-kibble-deep" : "bg-mint-wash text-mint"
                }`}
              >
                {delta > 0 ? "+" : "−"}
                {Math.abs(delta).toFixed(2)} kg since last
              </span>
            )}
          </p>
        ) : (
          <p className="mt-2 text-[13px] text-ink-soft">No weigh-ins yet — log the first one.</p>
        )}
      </section>

      <section className={`${CARD} settle`} style={{ "--i": 1 } as React.CSSProperties}>
        <SectionTitle hint="Weigh yourself holding the cat, then without — the difference is close enough.">
          Log a weigh-in
        </SectionTitle>
        <div className="mb-3 flex gap-2.5">
          <label className="sr-only" htmlFor="kg">
            Weight in kilograms
          </label>
          <input
            id="kg"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            placeholder="4.20"
            className={`${INPUT} w-28 shrink-0 text-center font-mono text-lg tabular-nums`}
          />
          <label className="sr-only" htmlFor="measured-on">
            Date
          </label>
          <input
            id="measured-on"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${INPUT} flex-1`}
          />
        </div>
        {error && (
          <p role="alert" className="mb-3 rounded-2xl bg-salmon-wash px-4 py-2.5 text-[13px] font-medium text-salmon-deep">
            {error}
          </p>
        )}
        <button onClick={submit} disabled={busy} className={BUTTON_PRIMARY}>
          {busy ? "Saving…" : `Log ${catName}'s weight`}
        </button>
      </section>

      <section className={`${CARD} settle md:col-span-2`} style={{ "--i": 2 } as React.CSSProperties}>
        <SectionTitle>History</SectionTitle>
        {weights.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CatStretch className="w-32 text-ink-faint opacity-40" />
            <p className="text-sm text-ink-soft">No weigh-ins yet.</p>
          </div>
        ) : (
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[22rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-rim text-left">
                  <th scope="col" className="py-2 pl-1 pr-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    Date
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    Weight
                  </th>
                  <th scope="col" className="py-2 pr-1 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {weights.map((w, i) => {
                  const prev = weights[i + 1];
                  const d = prev ? Number(w.weight_kg) - Number(prev.weight_kg) : null;
                  return (
                    <tr key={w.id} className="border-b border-rim/60 last:border-0 transition-colors hover:bg-enamel-sunk/60">
                      <td className="py-3 pl-1 pr-3 text-ink-soft">
                        {format(new Date(w.measured_on + "T00:00:00"), "d MMM yyyy")}
                      </td>
                      <td className="py-3 pr-3 text-right font-mono font-semibold tabular-nums">
                        {Number(w.weight_kg).toFixed(2)} kg
                      </td>
                      <td
                        className={`py-3 pr-1 text-right font-mono tabular-nums ${
                          d === null || d === 0
                            ? "text-ink-faint"
                            : d > 0
                              ? "text-kibble-deep"
                              : "text-mint"
                        }`}
                      >
                        {d === null ? "—" : d === 0 ? "0.00" : `${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(2)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
