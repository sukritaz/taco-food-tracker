import { notFound } from "next/navigation";
import { getHousehold } from "@/lib/household";
import { PawPrint } from "@/components/CatArt";
import { SideRail, TabBar } from "@/components/Nav";
import ThemeToggle from "@/components/ThemeToggle";

export default async function HouseholdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const h = await getHousehold(key);
  if (!h) notFound();

  return (
    <div className="flex min-h-dvh">
      <SideRail householdKey={key} catName={h.cat_name} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-rim/70 bg-counter/75 backdrop-blur-xl md:border-b-0 md:bg-transparent md:backdrop-blur-none">
          <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3 md:max-w-3xl md:px-8 md:pb-2 md:pt-8 lg:max-w-5xl">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-salmon text-white shadow-[var(--shadow-card)] md:hidden">
                <PawPrint className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate font-display text-xl font-extrabold tracking-tight md:text-3xl">
                  {h.cat_name}
                </h1>
                <p className="text-[11px] text-ink-soft md:text-sm">
                  Food tracker
                  <span className="hidden md:inline"> · shared with your household</span>
                </p>
              </div>
            </div>
            <ThemeToggle className="md:hidden" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4 md:max-w-3xl md:px-8 md:pb-16 md:pt-6 lg:max-w-5xl">
          {children}
        </main>
      </div>

      <TabBar householdKey={key} />
    </div>
  );
}
