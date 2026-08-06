import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono, Instrument_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import TacoBackground from "@/components/TacoBackground";

// Display: a grotesque with a kink in it — headings should have a personality,
// not just a weight. Body: Instrument Sans, quiet and narrow enough for phones.
const display = Bricolage_Grotesque({
  variable: "--font-display-face",
  subsets: ["latin"],
  axes: ["opsz"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taco's Food Tracker",
  description: "Log how much Taco has eaten, shared across the household.",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9e3dc" },
    { media: "(prefers-color-scheme: dark)", color: "#15121a" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Runs before first paint so the saved theme never flashes the wrong kitchen.
const THEME_SCRIPT = `try{var t=localStorage.getItem("taco.theme");if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <TacoBackground />
        {children}
      </body>
    </html>
  );
}
