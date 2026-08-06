"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FoodLog, Household, WeightLog } from "@/lib/types";
import { toGrams } from "@/lib/units";
import { CatWalk } from "@/components/CatArt";
import { CARD, Eyebrow, SectionTitle } from "@/components/ui";

type Range = 7 | 30 | 90 | 0; // 0 = all

const RANGES: { value: Range; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: 0, label: "All" },
];

/* Recharts writes these straight onto SVG attributes, so CSS variables here
   re-colour the charts the moment the theme flips — no re-render needed. */
const AXIS = { fontSize: 11, fill: "var(--ink-soft)" };
const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 16,
  border: "1px solid var(--rim)",
  background: "var(--enamel)",
  color: "var(--ink)",
  boxShadow: "var(--shadow-card)",
  padding: "8px 12px",
};

export default function ChartClient({
  household,
  logs,
  weights,
}: {
  household: Household;
  logs: FoodLog[];
  weights: WeightLog[];
}) {
  const [range, setRange] = useState<Range>(30);

  const foodData = useMemo(() => {
    const byDay = new Map<string, { day: string; dry: number; wet: number }>();
    for (const l of logs) {
      const g = toGrams(l, household) ?? 0;
      const k = format(new Date(l.fed_at), "yyyy-MM-dd");
      if (!byDay.has(k)) byDay.set(k, { day: k, dry: 0, wet: 0 });
      const row = byDay.get(k)!;
      if (l.food_type === "dry") row.dry += g;
      else row.wet += g;
    }
    let rows = [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
    if (range !== 0) rows = rows.slice(-range);
    return rows.map((r) => ({
      ...r,
      dry: Math.round(r.dry),
      wet: Math.round(r.wet),
      label: format(new Date(r.day), "d MMM"),
    }));
  }, [logs, household, range]);

  const weightData = useMemo(
    () =>
      weights.map((w) => ({
        label: format(new Date(w.measured_on + "T00:00:00"), "d MMM"),
        kg: Number(w.weight_kg),
      })),
    [weights],
  );

  const avg = useMemo(() => {
    if (foodData.length === 0) return 0;
    return Math.round(foodData.reduce((s, r) => s + r.dry + r.wet, 0) / foodData.length);
  }, [foodData]);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="settle flex justify-center" style={{ "--i": 0 } as React.CSSProperties}>
        <div
          role="group"
          aria-label="Date range"
          className="flex rounded-full border border-rim bg-enamel/85 p-1 shadow-[var(--shadow-card)] backdrop-blur-md"
        >
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              aria-pressed={range === r.value}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                range === r.value ? "bg-ink text-enamel" : "text-ink-soft hover:text-ink"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <section className={`${CARD} settle`} style={{ "--i": 1 } as React.CSSProperties}>
        <SectionTitle
          hint="Grams per day, dry and wet stacked, converted with your Settings factors."
          action={
            avg > 0 ? (
              <div className="shrink-0 text-right">
                <Eyebrow>Daily avg</Eyebrow>
                <p className="font-display text-2xl font-bold leading-tight tabular-nums">
                  {avg}
                  <span className="ml-1 text-sm font-semibold text-ink-soft">g</span>
                </p>
              </div>
            ) : undefined
          }
        >
          Food per day
        </SectionTitle>

        {foodData.length === 0 ? (
          <Empty label="No feeds logged in this range yet." />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={240} className="md:!h-[320px]">
              <BarChart data={foodData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 5" vertical={false} stroke="var(--rim)" />
                <XAxis
                  dataKey="label"
                  tick={AXIS}
                  interval="preserveStartEnd"
                  tickLine={false}
                  axisLine={{ stroke: "var(--rim)" }}
                />
                <YAxis tick={AXIS} width={38} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: "var(--enamel-sunk)" }}
                  formatter={(v, name) => [`${v} g`, name === "dry" ? "Dry" : "Wet"]}
                />
                {household.daily_target_g != null && (
                  <ReferenceLine
                    y={household.daily_target_g}
                    stroke="var(--mint)"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    ifOverflow="extendDomain"
                    label={{
                      value: "daily target",
                      position: "insideTopRight",
                      fill: "var(--mint)",
                      fontSize: 11,
                      dy: -4,
                    }}
                  />
                )}
                <Bar dataKey="dry" stackId="f" fill="var(--kibble)" name="dry" />
                <Bar dataKey="wet" stackId="f" fill="var(--salmon)" name="wet" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <Legend />
          </>
        )}
      </section>

      <section className={`${CARD} settle relative overflow-hidden`} style={{ "--i": 2 } as React.CSSProperties}>
        <SectionTitle hint="Kilograms. Log weigh-ins on the Weight tab.">Weight over time</SectionTitle>
        {weightData.length === 0 ? (
          <Empty label="No weigh-ins yet." />
        ) : (
          <ResponsiveContainer width="100%" height={220} className="md:!h-[280px]">
            <LineChart data={weightData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 5" vertical={false} stroke="var(--rim)" />
              <XAxis
                dataKey="label"
                tick={AXIS}
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={{ stroke: "var(--rim)" }}
              />
              <YAxis domain={["auto", "auto"]} tick={AXIS} width={42} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} kg`, "Weight"]} />
              <Line
                type="monotone"
                dataKey="kg"
                stroke="var(--salmon)"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "var(--enamel)", stroke: "var(--salmon)", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex justify-center gap-5 text-[13px] text-ink-soft">
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-kibble" /> Dry
      </span>
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-salmon" /> Wet
      </span>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <CatWalk className="w-32 text-ink-faint opacity-40" />
      <p className="text-sm text-ink-soft">{label}</p>
    </div>
  );
}
