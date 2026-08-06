"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PawPrint } from "./CatArt";
import { IconBowl, IconCalendar, IconChart, IconGear, IconScale } from "./icons";
import ThemeToggle from "./ThemeToggle";

const TABS = [
  { href: "", label: "Log", Icon: IconBowl },
  { href: "/calendar", label: "Calendar", Icon: IconCalendar },
  { href: "/chart", label: "Charts", Icon: IconChart },
  { href: "/weight", label: "Weight", Icon: IconScale },
  { href: "/settings", label: "Settings", Icon: IconGear },
] as const;

function useActive(householdKey: string) {
  const pathname = usePathname();
  const base = `/h/${householdKey}`;
  return (href: string) => {
    const full = base + href;
    return href === "" ? pathname === base || pathname === `${base}/` : pathname.startsWith(full);
  };
}

/** Phone: a thumb-height bar pinned to the bottom. */
export function TabBar({ householdKey }: { householdKey: string }) {
  const isActive = useActive(householdKey);

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-rim bg-enamel/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={`/h/${householdKey}${href}`}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  active ? "text-salmon" : "text-ink-faint active:text-ink-soft"
                }`}
              >
                <span className="relative grid h-7 w-11 place-items-center">
                  <span
                    className={`absolute inset-0 rounded-full bg-salmon-wash transition-all duration-300 ${
                      active ? "scale-100 opacity-100" : "scale-75 opacity-0"
                    }`}
                  />
                  <Icon className={`relative h-[22px] w-[22px] ${active ? "tab-hop" : ""}`} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Laptop: a rail down the left, so the content can use the whole page width. */
export function SideRail({ householdKey, catName }: { householdKey: string; catName: string }) {
  const isActive = useActive(householdKey);

  return (
    <aside className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-rim bg-enamel/70 backdrop-blur-xl md:flex md:w-[76px] lg:w-60">
      <Link
        href={`/h/${householdKey}`}
        className="flex items-center gap-3 px-4 py-6 lg:px-5"
        aria-label={`${catName} — food tracker home`}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-salmon text-white shadow-[var(--shadow-card)]">
          <PawPrint className="h-6 w-6" />
        </span>
        <span className="hidden min-w-0 lg:block">
          <span className="block truncate font-display text-lg font-extrabold leading-tight">{catName}</span>
          <span className="block text-xs text-ink-soft">Food tracker</span>
        </span>
      </Link>

      <nav aria-label="Sections" className="flex-1 px-3 lg:px-4">
        <ul className="flex flex-col gap-1">
          {TABS.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={`/h/${householdKey}${href}`}
                  aria-current={active ? "page" : undefined}
                  title={label}
                  className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors lg:px-4 ${
                    active
                      ? "bg-salmon-wash text-salmon"
                      : "text-ink-soft hover:bg-enamel-sunk hover:text-ink"
                  }`}
                >
                  {/* the marker travels with the active tab */}
                  <span
                    className={`absolute -left-3 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-salmon transition-all duration-300 lg:-left-4 ${
                      active ? "opacity-100" : "h-1 opacity-0"
                    }`}
                  />
                  <Icon className="h-[22px] w-[22px] shrink-0 transition-transform group-hover:scale-110" />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center justify-center px-3 py-5 lg:justify-start lg:px-5">
        <ThemeToggle />
      </div>
    </aside>
  );
}
