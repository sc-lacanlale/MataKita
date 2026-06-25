import type { CSSProperties } from "react";

export type IconName =
  | "sun"
  | "house"
  | "users"
  | "book"
  | "cutlery"
  | "eye"
  | "video"
  | "mic"
  | "micOff"
  | "flash"
  | "refresh"
  | "flipCamera"
  | "back"
  | "phone"
  | "camera";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export default function Icon({ name, size = 24, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[name]}
    </svg>
  );
}

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const GLYPHS: Record<IconName, JSX.Element> = {
  sun: (
    <g>
      <circle cx="12" cy="12" r="4.6" fill="currentColor" />
      <g {...STROKE}>
        <line x1="12" y1="1.5" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22.5" />
        <line x1="1.5" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22.5" y2="12" />
        <line x1="4.4" y1="4.4" x2="6.2" y2="6.2" />
        <line x1="17.8" y1="17.8" x2="19.6" y2="19.6" />
        <line x1="19.6" y1="4.4" x2="17.8" y2="6.2" />
        <line x1="6.2" y1="17.8" x2="4.4" y2="19.6" />
      </g>
    </g>
  ),
  house: (
    <path
      d="M12 2.6 1.8 11.4h2.7V20a1 1 0 0 0 1 1h4v-5.4h5V21h4a1 1 0 0 0 1-1v-8.6h2.7L12 2.6Z"
      fill="currentColor"
    />
  ),
  users: (
    <g fill="currentColor">
      <circle cx="8.3" cy="8" r="3.3" />
      <circle cx="16.4" cy="9" r="2.7" />
      <path d="M2 19.5c0-3.6 2.9-6 6.3-6s6.3 2.4 6.3 6v.5H2v-.5Z" />
      <path d="M14.7 13.7c2.3.4 4.7 2.3 4.7 5.3v1H17v-1c0-2-.7-3.8-2.3-5.3Z" />
    </g>
  ),
  book: (
    <path
      d="M12 5.6C9.9 4.3 6.8 3.8 3.3 4.5 2.9 4.6 2.6 5 2.6 5.4v13c0 .6.5 1 1.1.9 3-.5 5.6-.1 7.4 1 .5.3 1.1.3 1.6 0 1.8-1.1 4.4-1.5 7.4-1 .6.1 1.1-.3 1.1-.9v-13c0-.4-.3-.8-.7-.9-3.5-.7-6.6-.2-8.7 1.1l-.1.1Zm0 0v13.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  cutlery: (
    <g {...STROKE} strokeWidth="2">
      <path d="M5 2.5V7" />
      <path d="M7.5 2.5V7" />
      <path d="M10 2.5V7" />
      <path d="M5 7a2.5 2.5 0 0 0 5 0" />
      <path d="M7.5 7V21.5" />
      <path d="M17 2.5c-2.4 1.3-2.4 7.9 0 9.2" />
      <path d="M17 2.5V21.5" />
    </g>
  ),
  eye: (
    <g>
      <path
        d="M1.6 12S5.2 5.5 12 5.5 22.4 12 22.4 12 18.8 18.5 12 18.5 1.6 12 1.6 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3.1" fill="currentColor" />
    </g>
  ),
  video: (
    <g fill="currentColor">
      <rect x="2" y="6" width="14" height="12" rx="2.5" />
      <path d="M16 10.2 22 6.6v10.8L16 13.8Z" />
    </g>
  ),
  mic: (
    <g>
      <rect x="9" y="2.5" width="6" height="11.5" rx="3" fill="currentColor" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" {...STROKE} />
      <line x1="12" y1="17.5" x2="12" y2="21.5" {...STROKE} />
      <line x1="8" y1="21.5" x2="16" y2="21.5" {...STROKE} />
    </g>
  ),
  micOff: (
    <g>
      <rect x="9" y="2.5" width="6" height="11.5" rx="3" fill="currentColor" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" {...STROKE} />
      <line x1="12" y1="17.5" x2="12" y2="21.5" {...STROKE} />
      <line x1="8" y1="21.5" x2="16" y2="21.5" {...STROKE} />
      <line x1="3" y1="3" x2="21" y2="21" {...STROKE} strokeWidth="2.4" />
    </g>
  ),
  flash: (
    <path d="M13 2 4.5 13.4c-.3.4 0 1 .5 1H10l-1.6 6.8c-.1.6.6 1 1 .5L20 9.6c.3-.4 0-1-.5-1H14l1.2-5.9c.1-.6-.6-1-1-.7Z" fill="currentColor" />
  ),
  refresh: (
    <g {...STROKE} strokeWidth="2.2">
      <path d="M20.5 12a8.5 8.5 0 1 1-2.4-5.9" />
      <path d="M20.8 3v4.3h-4.3" />
    </g>
  ),
  flipCamera: (
    <g {...STROKE} strokeWidth="2">
      <path d="M3 8.5a2 2 0 0 1 2-2h2L8.2 4.5h7.6L17 6.5h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z" />
      <path d="M9.4 13.2a2.8 2.8 0 0 1 4.8-1.9" />
      <path d="M14.4 9.6v2.1h-2.1" />
      <path d="M14.6 13.2a2.8 2.8 0 0 1-4.8 1.9" />
      <path d="M9.6 16.8v-2.1h2.1" />
    </g>
  ),
  back: (
    <path d="M15 4.5 7.5 12 15 19.5" {...STROKE} strokeWidth="2.6" />
  ),
  phone: (
    <path
      d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.1-.2 1.1.4 2.4.6 3.7.6.6 0 1.1.5 1.1 1.1V20c0 .6-.5 1.1-1.1 1.1C10.6 21.1 3 13.5 3 4.1 3 3.5 3.5 3 4.1 3h3.4c.6 0 1.1.5 1.1 1.1 0 1.3.2 2.6.6 3.7.1.4 0 .8-.3 1.1l-2.3 1.9Z"
      fill="currentColor"
    />
  ),
  camera: (
    <g {...STROKE}>
      <path d="M3 8.5a2 2 0 0 1 2-2h2l1.3-2h7.4L17 6.5h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z" />
      <circle cx="12" cy="13" r="3.6" />
    </g>
  ),
};
