"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BowlGauge, PawPrint } from "@/components/CatArt";
import ThemeToggle from "@/components/ThemeToggle";
import { BUTTON_PRIMARY, CARD, INPUT } from "@/components/ui";

export default function Home() {
  const router = useRouter();
  const [key, setKey] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const k = key.trim();
    if (k) router.push(`/h/${encodeURIComponent(k)}`);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-7 px-6 pb-16">
        <div className="settle text-center" style={{ "--i": 0 } as React.CSSProperties}>
          <BowlGauge fill={0.62} className="mx-auto w-40" />
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight">
            Who fed
            <br />
            the cat?
          </h1>
          <p className="mx-auto mt-3 max-w-[19rem] text-[15px] leading-relaxed text-ink-soft">
            One shared bowl, one shared log. Everyone in the house sees the same feeds.
          </p>
        </div>

        <form onSubmit={go} className={`${CARD} settle`} style={{ "--i": 1 } as React.CSSProperties}>
          <label htmlFor="household-key" className="mb-1.5 block text-[13px] font-medium text-ink-soft">
            Household key
          </label>
          <input
            id="household-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="taco-home-abc123"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={`${INPUT} w-full font-mono text-sm`}
          />
          <button type="submit" className={`${BUTTON_PRIMARY} mt-3`}>
            Open tracker
          </button>
        </form>

        <p
          className="settle flex items-center justify-center gap-2 text-center text-[13px] text-ink-soft"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          <PawPrint className="h-4 w-4 shrink-0 text-ink-faint" />
          Ask a flatmate for the link, or open it directly.
        </p>
      </div>
    </div>
  );
}
