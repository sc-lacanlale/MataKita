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
      <path d="M19.44,10.32c-1.29-.51-1.48-1.02-1.48-1.53c0-.51.37-1.02.83-1.39.79-.65,1.2-1.62,1.2-2.68 c0-2.04-1.34-3.79-3.7-3.79c-2.17,0-3.47,1.48-3.65,3.29c0,0.19,0.09,0.32,0.23,0.42c1.76,1.11,2.82,3.06,2.82,5.41 c0,1.76-0.69,3.33-1.94,4.44c-0.09,0.09-0.09,0.28,0,0.37c0.32,0.23,1.06,0.56,1.53,0.79c0.14,0.05,0.23,0.09,0.37,0.09h5.6 c1.06,0,1.9-0.88,1.9-1.85v-0.28C23.15,12.26,21.36,11.16,19.44,10.32z" />
      <path d="M13.24,16.75c-1.57-.65-1.8-1.2-1.8-1.8c0-0.6,0.46-1.2,0.97-1.67c0.93-0.79,1.43-1.9,1.43-3.19 c0-2.41-1.57-4.49-4.44-4.49c-2.82,0-4.44,2.08-4.44,4.49c0,1.3,0.51,2.41,1.43,3.19c0.51,0.46,0.97,1.06,0.97,1.67 c0,0.6-0.23,1.2-1.85,1.8c-2.31,0.93-4.58,1.99-4.58,3.93V21v0.46c0,1.02,0.83,1.85,1.9,1.85h12.82c1.06,0,1.94-0.83,1.94-1.85 V21v-0.19C17.59,18.74,15.55,17.68,13.24,16.75z" />
    </g>
  ),
  book: (
    <path
      d="M23.925 4.68v15.59H13.49l-1.195-1.168H11.2l-1.195 1.168H0V4.68h1.72v13.21v1.4l1.318-.467c2.216-.785 4.374-1.167 6.599-1.167.442 0 .912.018 1.397.052l.502.036v.04l.278-.02.278.02v-.04l.502-.036c.485-.035.955-.052 1.397-.052 2.225 0 4.383.382 6.599 1.167l1.318.467v-1.4V4.68h1.72zm-11.086.05v11.99c.493-.035.985-.055 1.468-.055 2.329 0 4.61.402 6.929 1.224V3.427c-.493-.039-.984-.058-1.467-.058-1.975 0-3.948.446-5.93 1.36zM2.706 17.89c2.32-.823 4.6-1.224 6.929-1.224.483 0 .975.02 1.468.055V4.73c-2.338-.913-4.61-1.36-6.93-1.36-.482 0-.973.02-1.467.058V17.89z"
      fill="currentColor"
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
    <path
      d="M1.5 12c0-2.25 3.75-7.5 10.5-7.5S22.5 9.75 22.5 12s-3.75 7.5-10.5 7.5S1.5 14.25 1.5 12zM12 16.75a4.75 4.75 0 1 0 0-9.5 4.75 4.75 0 0 0 0 9.5zM14.7 12a2.7 2.7 0 1 1-5.4 0 2.7 2.7 0 0 1 5.4 0z"
      fill="currentColor"
    />
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
      <path d="M4.06 13C4.02 12.67 4 12.34 4 12 4 7.58 7.58 4 12 4c2.5 0 4.73 1.15 6.2 2.94M19.94 11c.04.33.06.66.06 1 0 4.42-3.58 8-8 8-2.39 0-4.53-1.05-6-2.71M9 17H6v.29m12.2-10.35V7v.05L15.2 7M6 20v-2.71" />
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
