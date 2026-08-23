import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (p: P) => {
  const { size = 18, ...rest } = p;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
};

export const IconPlay = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 4.5v15l13-7.5L7 4.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPause = (p: P) => (
  <svg {...base(p)}>
    <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
    <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPrev = (p: P) => (
  <svg {...base(p)}>
    <path d="M17 5v14L7.5 12 17 5Z" fill="currentColor" stroke="none" />
    <path d="M6 5v14" />
  </svg>
);

export const IconNext = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 5v14l9.5-7L7 5Z" fill="currentColor" stroke="none" />
    <path d="M18 5v14" />
  </svg>
);

export const IconHeart = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)}>
    <path
      d="M12 20.5S3.5 15.6 3.5 9.6C3.5 6.9 5.6 5 8 5c1.7 0 3.2.9 4 2.3C12.8 5.9 14.3 5 16 5c2.4 0 4.5 1.9 4.5 4.6 0 6-8.5 10.9-8.5 10.9Z"
      fill={filled ? "currentColor" : "none"}
    />
  </svg>
);

export const IconHome = (p: P) => (
  <svg {...base(p)}>
    <path d="m4 10.5 8-6.5 8 6.5" />
    <path d="M5.5 9.5V20h13V9.5" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </svg>
);

export const IconArtists = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <path d="M15.5 5.6a3.5 3.5 0 0 1 0 5.8M17.8 14.9c1.7.8 2.7 2.4 2.7 4.6" />
  </svg>
);

export const IconStory = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.6" strokeDasharray="3.4 3" />
    <path d="M10 9v6l5-3-5-3Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconShare = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="12" r="2.6" />
    <circle cx="17.5" cy="5.5" r="2.6" />
    <circle cx="17.5" cy="18.5" r="2.6" />
    <path d="m8.4 10.8 6.8-4M8.4 13.2l6.8 4" />
  </svg>
);

export const IconDownload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v10" />
    <path d="m7.5 10 4.5 4.5L16.5 10" />
    <path d="M4.5 16.5V19a1.5 1.5 0 0 0 1.5 1.5h12A1.5 1.5 0 0 0 19.5 19v-2.5" />
  </svg>
);

export const IconQueue = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6h16M4 11h16M4 16h8" />
    <path d="M16 14.5v5l4-2.5-4-2.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconUpload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 15V4" />
    <path d="m7 8.5 5-4.5 5 4.5" />
    <path d="M4 15.5v2.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5" />
  </svg>
);

export const IconShuffle = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 6.5h3.2c5.6 0 6 10.5 11.6 10.5H21" />
    <path d="M3 17h3.2c2.2 0 3.6-1.6 4.8-3.4M21 6.5h-3.2c-2.2 0-3.6 1.6-4.8 3.4" />
    <path d="m18.5 4 2.5 2.5L18.5 9M18.5 14.5 21 17l-2.5 2.5" />
  </svg>
);

export const IconRepeat = (p: P) => (
  <svg {...base(p)}>
    <path d="M17 3.5 20 6.5l-3 3" />
    <path d="M4 12V9.5a3 3 0 0 1 3-3h13" />
    <path d="M7 20.5 4 17.5l3-3" />
    <path d="M20 12v2.5a3 3 0 0 1-3 3H4" />
  </svg>
);

export const IconVolume = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" stroke="none" />
    <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
  </svg>
);

export const IconMute = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" stroke="none" />
    <path d="m15.5 9.5 5 5M20.5 9.5l-5 5" />
  </svg>
);

export const IconX = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconSpark = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 13.8 9.7 20 11.5l-6.2 1.8L12 19.5l-1.8-6.2L4 11.5l6.2-1.8L12 3.5Z" />
  </svg>
);

export const IconNote = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 18.5V6l10-2v12.5" />
    <circle cx="6.5" cy="18.5" r="2.5" />
    <circle cx="16.5" cy="16.5" r="2.5" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconWave = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12h1.6l1.6-4 2.4 8 2.4-11 2.4 13 2-7 1.6 3.5L21 12" />
  </svg>
);

export const Logo = (p: P) => {
  const { size = 28, ...rest } = p;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...rest}>
      <rect x="6.6" y="6.6" width="18.8" height="18.8" stroke="#35d5bd" strokeOpacity="0.75" strokeWidth="1.7" />
      <rect
        x="6.6"
        y="6.6"
        width="18.8"
        height="18.8"
        stroke="#f0b445"
        strokeOpacity="0.9"
        strokeWidth="1.7"
        transform="rotate(45 16 16)"
      />
      <path d="M13 11.5v9l8-4.5-8-4.5Z" fill="#ecf6f2" />
    </svg>
  );
};

export const IconBack = (p: P) => (
  <svg {...base(p)}>
    <path d="M14.5 5.5 8 12l6.5 6.5" />
  </svg>
);

export const IconComment = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.5-4.6A7.5 7.5 0 1 1 20 11.5Z" />
  </svg>
);

export const IconBookmark = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)}>
    <path d="M6.5 4h11v16L12 15.8 6.5 20V4Z" fill={filled ? "currentColor" : "none"} />
  </svg>
);

export const IconGear = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
  </svg>
);

export const IconGlobe = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.3 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.3-3.8-8.5s1.2-6.1 3.8-8.5Z" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const IconVideo = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="6" width="13" height="12" rx="2" />
    <path d="m16.5 10.5 4-2.5v8l-4-2.5" />
  </svg>
);

export const IconMic = (p: P) => (
  <svg {...base(p)}>
    <rect x="9.5" y="3.5" width="5" height="10" rx="2.5" />
    <path d="M6 11.5a6 6 0 0 0 12 0M12 17.5V21" />
  </svg>
);

export const IconCar = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12 6.5 7.5h11L19 12" />
    <path d="M4 12h16v5h-2.5v1.5h-3V17h-5v1.5h-3V17H4v-5Z" />
    <path d="M6.5 14.5h2M15.5 14.5h2" />
  </svg>
);

export const IconSliders = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 4v6M6 14v6M12 4v2M12 10v10M18 4v10M18 18v2" />
    <circle cx="6" cy="12" r="1.8" />
    <circle cx="12" cy="8" r="1.8" />
    <circle cx="18" cy="16" r="1.8" />
  </svg>
);

export const IconMore = (p: P) => (
  <svg {...base(p)}>
    <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSend = (p: P) => (
  <svg {...base(p)}>
    <path d="m4 11 16-7-5 16-3.5-6L4 11Z" />
    <path d="m11.5 14 8.5-10" />
  </svg>
);

export const IconUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
);

export const IconMusic = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 18V6.5L19 4.5V16" />
    <circle cx="6.5" cy="18" r="2.4" />
    <circle cx="16.5" cy="16" r="2.4" />
  </svg>
);

export const IconExternal = (p: P) => (
  <svg {...base(p)}>
    <path d="M10 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4" />
    <path d="M14 4h6v6M20 4l-9 9" />
  </svg>
);

export const IconChev = (p: P) => (
  <svg {...base(p)}>
    <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
  </svg>
);

export const IconStar = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)}>
    <path
      d="m12 3.8 2.5 5.2 5.7.7-4.2 3.9 1.1 5.6L12 16.4l-5.1 2.8 1.1-5.6L3.8 9.7l5.7-.7L12 3.8Z"
      fill={filled ? "currentColor" : "none"}
    />
  </svg>
);

export const IconEq = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20V9M8.5 20V4M13 20v-8M17.5 20V7M22 20v-5" strokeWidth={2.2} />
  </svg>
);

export const IconLogout = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
    <path d="m17 8 4 4-4 4M21 12H10" />
  </svg>
);

