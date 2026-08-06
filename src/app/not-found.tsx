import Link from "next/link";
import { CatFace } from "@/components/CatArt";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-5 px-6 text-center">
      <CatFace className="w-28 text-ink-faint opacity-60" />
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">No cat here</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          That household key doesn&apos;t match a tracker. Check the link your flatmate shared — keys are
          case-sensitive.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-2xl bg-salmon px-6 py-3.5 font-display text-base font-bold text-white shadow-[var(--shadow-card)] transition hover:bg-salmon-deep active:scale-95"
      >
        Enter a key
      </Link>
    </div>
  );
}
