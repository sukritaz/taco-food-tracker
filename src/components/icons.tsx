/*
  Nav icons, drawn on a 24px grid with a 1.8px stroke. Emoji were doing this job
  before; they render differently on every device and never match the type.
*/

type IconProps = React.SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/** Food bowl — the Log tab. */
export function IconBowl(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 10h18c0 5.5-4 9.5-9 9.5S3 15.5 3 10Z" />
      <ellipse cx="12" cy="10" rx="9" ry="2.6" />
      <path d="M9 6.5c0-1.2 1.3-1.4 1.3-2.5M14.7 6.3c0-1.1 1.3-1.4 1.3-2.4" />
    </Icon>
  );
}

/** Month grid — the Calendar tab. */
export function IconCalendar(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="3.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <circle cx="8.5" cy="14.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="17.8" r="1.1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/** Bars over time — the Charts tab. */
export function IconChart(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8.5 20v-6M13 20V8.5M17.5 20v-9" />
    </Icon>
  );
}

/** Balance scale — the Weight tab. */
export function IconScale(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4.5v15M7 20h10M4 9h16" />
      <path d="M4 9 1.6 14.2a2.8 2.8 0 0 0 4.8 0Z" />
      <path d="M20 9l-2.4 5.2a2.8 2.8 0 0 0 4.8 0Z" />
      <circle cx="12" cy="4.5" r="1.6" />
    </Icon>
  );
}

/** Settings tab. */
export function IconGear(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5" />
    </Icon>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
      <path d="M6.5 7 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.5 7" />
    </Icon>
  );
}

export function IconChevron(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 5 7 7-7 7" />
    </Icon>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icon>
  );
}
