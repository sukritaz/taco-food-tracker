/*
  Taco, drawn in paths.

  Every cat in this app is inline SVG rather than an image file: it inherits
  currentColor so the watermarks re-tint themselves in dark mode, it stays crisp
  at any size, and there is nothing to 404.
*/

type CatProps = React.SVGProps<SVGSVGElement>;

/** Sitting bread-loaf cat, front three-quarters, tail curled around the paws. */
export function CatLoaf(props: CatProps) {
  return (
    <svg viewBox="0 0 130 104" fill="currentColor" aria-hidden {...props}>
      <path d="M14 96c-3-34 2-52 15-61l-6-27 25 19a63 63 0 0 1 30 0l25-19-6 27c13 9 18 27 15 61z" />
      <path
        d="M112 96c14-2 20-9 18-17-2-7-11-8-14-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Curled-up sleeping cat — the croissant. */
export function CatCurl(props: CatProps) {
  return (
    <svg viewBox="0 0 140 104" fill="currentColor" aria-hidden {...props}>
      <path d="M70 16c34 0 62 18 62 45 0 22-19 35-45 35H36C14 96 4 84 4 68c0-13 9-23 23-26C36 26 50 16 70 16" />
      <path d="M40 44c-16 2-27 12-27 25 0 12 10 21 26 21s27-9 27-21c0-13-10-23-26-25" />
      <path d="m22 30 3 18 16-9zM60 30l-3 18-16-9z" />
      <path
        d="M122 84c12 3 15 10 11 15-4 4-11 2-12-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Cat mid-stride, tail up. */
export function CatWalk(props: CatProps) {
  return (
    <svg viewBox="0 0 148 104" fill="currentColor" aria-hidden {...props}>
      <ellipse cx="72" cy="56" rx="46" ry="24" />
      <circle cx="118" cy="42" r="19" />
      <path d="m104 30 2-17 15 11zM134 30l-2-17-15 11z" />
      <path d="M36 70h11v26H36zM62 70h11v26H62zM88 70h11v26H88zM110 66h11v30h-11z" rx="5" />
      <path
        d="M28 54C12 50 6 34 14 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Long stretch, front paws forward. */
export function CatStretch(props: CatProps) {
  return (
    <svg viewBox="0 0 160 96" fill="currentColor" aria-hidden {...props}>
      <path d="M18 74c0-16 12-24 30-26 22-2 40-8 56-20 10-8 22-6 26 4 4 9-2 18-12 22-18 8-24 16-24 26z" />
      <circle cx="126" cy="26" r="17" />
      <path d="m113 15 1-15 14 10zM141 15l-1-15-14 10z" />
      <path d="M22 66h12v22H22zM86 66h12v22H86z" />
      <path
        d="M14 78C2 74-2 62 6 52"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Head-on, ears up — used for empty states and the 404. */
export function CatFace(props: CatProps) {
  return (
    <svg viewBox="0 0 120 104" fill="none" aria-hidden {...props}>
      <path
        d="M24 34 18 6l26 16a62 62 0 0 1 32 0l26-16-6 28c8 9 12 21 12 32 0 22-21 36-48 36s-48-14-48-36c0-11 4-23 12-32Z"
        fill="currentColor"
      />
      <circle cx="42" cy="62" r="5" fill="var(--enamel)" />
      <circle cx="78" cy="62" r="5" fill="var(--enamel)" />
      <path
        d="M60 76v4m0 0c0 4-4 6-8 6m8-6c0 4 4 6 8 6"
        stroke="var(--enamel)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Single paw print — the app's smallest mark. */
export function PawPrint(props: CatProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden {...props}>
      <ellipse cx="24" cy="33" rx="13" ry="11" />
      <ellipse cx="9" cy="20" rx="6" ry="7.5" transform="rotate(-18 9 20)" />
      <ellipse cx="19" cy="11" rx="6" ry="7.5" transform="rotate(-6 19 11)" />
      <ellipse cx="30" cy="11" rx="6" ry="7.5" transform="rotate(6 30 11)" />
      <ellipse cx="40" cy="20" rx="6" ry="7.5" transform="rotate(18 40 20)" />
    </svg>
  );
}

/**
 * The bowl gauge — this app's signature.
 *
 * A speckled enamel bowl seen from the side, filled to `fill` (0–1) of the day's
 * target. Reading the day is reading the bowl: empty at breakfast, brimming by
 * bedtime. `overfull` tints the food when the target has been passed.
 */
export function BowlGauge({
  fill,
  overfull = false,
  splash = 0,
  className,
}: {
  fill: number;
  overfull?: boolean;
  /** Bump this to replay the kibble-drop animation. */
  splash?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(1, fill));
  const EMPTY_Y = 112;
  const FULL_Y = 46;
  const depth = EMPTY_Y - FULL_Y;
  const surfaceY = EMPTY_Y - clamped * depth;
  // The bowl narrows toward the base, so the food surface narrows with it.
  const surfaceRx = 22 + 48 * ((EMPTY_Y - surfaceY) / depth);
  const food = overfull ? "var(--salmon)" : "var(--kibble)";
  const foodDeep = overfull ? "var(--salmon-deep)" : "var(--kibble-deep)";
  const WELL = "M30 44a70 13 0 0 1 140 0c0 40-28 68-70 68s-70-28-70-68Z";

  return (
    <svg viewBox="0 0 200 148" className={className} aria-hidden>
      <defs>
        <clipPath id="bowl-inside">
          <path d={WELL} />
        </clipPath>
      </defs>

      {/* the shadow it sits in, and the foot it sits on */}
      <ellipse cx="100" cy="136" rx="54" ry="7" fill="var(--ink)" opacity="0.1" />
      <rect x="74" y="118" width="52" height="14" rx="7" fill="var(--bowl-well)" />

      {/* the glazed body */}
      <path d="M16 44a84 18 0 0 1 168 0c0 44-33 78-84 78S16 88 16 44Z" fill="var(--bowl)" />
      {/* the well, shaded, cut into it */}
      <path d={WELL} fill="var(--bowl-well)" />

      {/* a paw pressed into the base of the bowl — it disappears as food covers it */}
      <g fill="var(--ink)" opacity="0.13">
        <ellipse cx="100" cy="88" rx="13" ry="10" />
        <ellipse cx="84" cy="72" rx="5.5" ry="7" transform="rotate(-18 84 72)" />
        <ellipse cx="94" cy="65" rx="5.5" ry="7" transform="rotate(-6 94 65)" />
        <ellipse cx="106" cy="65" rx="5.5" ry="7" transform="rotate(6 106 65)" />
        <ellipse cx="116" cy="72" rx="5.5" ry="7" transform="rotate(18 116 72)" />
      </g>

      <g clipPath="url(#bowl-inside)">
        <rect
          x="16"
          y={surfaceY}
          width="168"
          height="120"
          fill={foodDeep}
          className="transition-[y,fill] duration-700 ease-[cubic-bezier(0.2,0.9,0.3,1.2)]"
        />
        {clamped > 0.02 && (
          <>
            {/* the surface of the pile */}
            <ellipse
              key={splash}
              cx="100"
              cy={surfaceY}
              rx={surfaceRx}
              ry="8"
              fill={food}
              className="food-ripple transition-[cy,rx] duration-700 ease-[cubic-bezier(0.2,0.9,0.3,1.2)]"
            />
            {/* loose pieces perched on the pile, so it reads as kibble not soup */}
            <g
              className="transition-transform duration-700 ease-[cubic-bezier(0.2,0.9,0.3,1.2)]"
              style={{ transform: `translateY(${surfaceY - EMPTY_Y}px)` }}
              fill={food}
              stroke={foodDeep}
              strokeWidth="1.5"
            >
              {[
                [74, 108, -18],
                [93, 103, 12],
                [113, 107, -6],
                [84, 113, 24],
                [104, 114, -14],
              ].map(([x, y, r]) => (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width="13"
                  height="9"
                  rx="4.5"
                  transform={`rotate(${r} ${x + 6.5} ${y + 4.5})`}
                />
              ))}
            </g>
          </>
        )}
      </g>

      {/* kibble falling in, replayed whenever `splash` changes */}
      {splash > 0 && (
        <g key={`drop-${splash}`} clipPath="url(#bowl-inside)">
          {[
            { x: 84, d: "0ms" },
            { x: 102, d: "90ms" },
            { x: 116, d: "170ms" },
          ].map((k) => (
            <rect
              key={k.x}
              x={k.x}
              y={Math.max(surfaceY - 12, 34)}
              width="11"
              height="8"
              rx="4"
              fill={foodDeep}
              className="kibble-drop"
              style={{ animationDelay: k.d }}
            />
          ))}
        </g>
      )}

      {/* the near lip, drawn last so food never spills over it */}
      <path
        d="M30 44a70 13 0 0 0 140 0"
        fill="none"
        stroke="var(--bowl)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* the gleam on glazed ceramic */}
      <path
        d="M36 58c3 22 13 38 26 47"
        fill="none"
        stroke="var(--enamel)"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

/**
 * Bowl at day-cell size: a filled-fraction pip for the calendar grid. The month
 * then reads as a shelf of bowls rather than a wall of numbers.
 */
export function BowlPip({ fill, className }: { fill: number; className?: string }) {
  const clamped = Math.max(0, Math.min(1, fill));
  const surfaceY = 14 - clamped * 9;
  return (
    <svg viewBox="0 0 32 22" className={className} aria-hidden>
      <defs>
        <clipPath id="pip-inside">
          <path d="M5 6c0 8 5 13 11 13s11-5 11-13Z" />
        </clipPath>
      </defs>
      <path d="M5 6c0 8 5 13 11 13s11-5 11-13Z" fill="currentColor" opacity="0.18" />
      <g clipPath="url(#pip-inside)">
        <rect x="2" y={surfaceY} width="28" height="20" fill="currentColor" />
      </g>
      <path
        d="M5 6c0 8 5 13 11 13s11-5 11-13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.55"
      />
      <ellipse cx="16" cy="6" rx="11" ry="3" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.55" />
    </svg>
  );
}
