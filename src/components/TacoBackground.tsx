import { CatCurl, CatLoaf, CatStretch, CatWalk, PawPrint } from "./CatArt";

/*
  Taco, scattered across the wall behind the app.

  Percentages are viewport-relative so the cats sit on the page, not on the card
  column — they stay put while content scrolls over them. Sizes step up on wider
  screens so the wall never looks sparse on a laptop.
*/
const CATS = [
  { Cat: CatLoaf, style: "top-[7%] -left-[3%] w-36 sm:w-44 lg:w-56", rot: "-7deg", anim: "cat-breathe", delay: "0s" },
  { Cat: CatCurl, style: "top-[24%] left-[74%] w-40 sm:w-52 lg:w-64", rot: "5deg", anim: "cat-breathe", delay: "1.6s" },
  { Cat: CatStretch, style: "top-[52%] -left-[6%] w-40 sm:w-52 lg:w-72", rot: "6deg", anim: "cat-sway", delay: "0.8s" },
  { Cat: CatWalk, style: "top-[74%] left-[70%] w-36 sm:w-48 lg:w-60", rot: "-4deg", anim: "cat-breathe", delay: "2.4s" },
  { Cat: CatLoaf, style: "top-[91%] left-[16%] w-32 sm:w-40 lg:w-48", rot: "4deg", anim: "cat-sway", delay: "3.1s" },
];

// A trail of prints wandering off toward the corner.
const PAWS = [
  { style: "top-[17%] left-[46%] w-6 lg:w-8", rot: "24deg" },
  { style: "top-[22%] left-[52%] w-5 lg:w-7", rot: "36deg" },
  { style: "top-[28%] left-[57%] w-6 lg:w-8", rot: "48deg" },
  { style: "top-[63%] left-[38%] w-5 lg:w-7", rot: "-30deg" },
  { style: "top-[68%] left-[31%] w-6 lg:w-8", rot: "-42deg" },
];

export default function TacoBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden text-ink">
      {CATS.map(({ Cat, style, rot, anim, delay }, i) => (
        <Cat
          key={i}
          className={`absolute opacity-[0.07] dark:opacity-[0.09] ${style} ${anim}`}
          style={{ "--rot": rot, animationDelay: delay } as React.CSSProperties}
        />
      ))}
      {PAWS.map(({ style, rot }, i) => (
        <PawPrint
          key={i}
          className={`absolute opacity-[0.06] dark:opacity-[0.08] ${style}`}
          style={{ transform: `rotate(${rot})` }}
        />
      ))}
    </div>
  );
}
