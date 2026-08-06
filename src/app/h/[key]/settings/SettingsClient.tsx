"use client";

import { useEffect, useState } from "react";
import type { Household } from "@/lib/types";
import { CatFace } from "@/components/CatArt";
import { BUTTON_PRIMARY, CARD, INPUT, SectionTitle } from "@/components/ui";

export default function SettingsClient({
  householdKey,
  household,
}: {
  householdKey: string;
  household: Household;
}) {
  const [catName, setCatName] = useState(household.cat_name);
  const [dry, setDry] = useState(String(household.dry_scoop_g));
  const [wet, setWet] = useState(String(household.wet_pouch_g));
  const [target, setTarget] = useState(
    household.daily_target_g != null ? String(household.daily_target_g) : "",
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(`${window.location.origin}/h/${householdKey}`);
  }, [householdKey]);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/h/${householdKey}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cat_name: catName,
          dry_scoop_g: Number(dry),
          wet_pouch_g: Number(wet),
          daily_target_g: target.trim() === "" ? null : Number(target),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Couldn't save settings. Try again.");
      setMsg({ tone: "ok", text: "Settings saved." });
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "Couldn't save settings. Try again." });
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setMsg({ tone: "error", text: "Copying isn't allowed here. Select the link and copy it." });
    }
  }

  return (
    <div className="grid items-start gap-4 md:grid-cols-2 md:gap-6">
      <section className={`${CARD} settle md:col-span-2`} style={{ "--i": 0 } as React.CSSProperties}>
        <SectionTitle hint="Anyone with this link can log feeds. It's the only key to your data — keep it in the group chat, not on the internet.">
          Share with your household
        </SectionTitle>
        <div className="flex gap-2.5">
          <label className="sr-only" htmlFor="share-url">
            Share link
          </label>
          <input
            id="share-url"
            readOnly
            value={shareUrl}
            onFocus={(e) => e.currentTarget.select()}
            className={`${INPUT} flex-1 font-mono text-xs`}
          />
          <button
            onClick={copy}
            className="shrink-0 rounded-2xl bg-ink px-5 text-sm font-semibold text-enamel transition active:scale-95"
          >
            {copied ? <span className="pop-check inline-block">Copied</span> : "Copy"}
          </button>
        </div>
      </section>

      <section className={`${CARD} settle relative overflow-hidden`} style={{ "--i": 1 } as React.CSSProperties}>
        <CatFace className="pointer-events-none absolute -right-5 -top-4 w-28 text-ink opacity-[0.06]" />
        <SectionTitle>The cat</SectionTitle>
        <label htmlFor="cat-name" className="mb-1.5 block text-[13px] font-medium text-ink-soft">
          Name
        </label>
        <input id="cat-name" value={catName} onChange={(e) => setCatName(e.target.value)} className={`${INPUT} w-full`} />
      </section>

      <section className={`${CARD} settle`} style={{ "--i": 2 } as React.CSSProperties}>
        <SectionTitle hint="Used for the grams view and the charts. Entries stay stored exactly as they were logged.">
          Gram conversions
        </SectionTitle>
        <Field id="dry-g" label="One scoop of dry food" suffix="g" value={dry} onChange={setDry} />
        <Field id="wet-g" label="One pouch of wet food" suffix="g" value={wet} onChange={setWet} />
      </section>

      <section className={`${CARD} settle md:col-span-2`} style={{ "--i": 3 } as React.CSSProperties}>
        <SectionTitle hint="Fills the bowl on the Log tab and draws the target line on the chart. Leave it blank to track feeds instead of grams.">
          Daily target
        </SectionTitle>
        <Field id="target-g" label="Target per day" suffix="g" value={target} onChange={setTarget} placeholder="none" />
      </section>

      <div className="settle md:col-span-2" style={{ "--i": 4 } as React.CSSProperties}>
        {msg && (
          <p
            role="status"
            className={`mb-3 rounded-2xl px-4 py-3 text-center text-[13px] font-medium ${
              msg.tone === "ok" ? "bg-mint-wash text-mint" : "bg-salmon-wash text-salmon-deep"
            }`}
          >
            {msg.text}
          </p>
        )}
        <button onClick={save} disabled={busy} className={BUTTON_PRIMARY}>
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  suffix,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  suffix: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rim py-3 last:border-0 last:pb-0">
      <label htmlFor={id} className="text-[15px] text-ink">
        {label}
      </label>
      <div className="flex shrink-0 items-center gap-1.5">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT} w-24 py-2.5 text-right font-mono tabular-nums`}
        />
        <span className="text-sm text-ink-faint">{suffix}</span>
      </div>
    </div>
  );
}
