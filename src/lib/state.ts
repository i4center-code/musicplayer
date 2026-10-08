/* لایهٔ داده: کاربر، استوری‌ها، مود/فضا، اکولایزر و صدای خودرو — با ماندگاری localStorage */

export interface ArtistWork {
  id: string;
  title: string;
  kind: "track" | "video" | "album";
  note: string;
  coverHue: number;
  trackId?: string; // لینک به اثر داخل اپ
  external?: string;
}

export interface ArtistProfile {
  name: string;
  tagline: string;
  bio: string;
  genre: string;
  coverHue: number;
  works: ArtistWork[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // ایموجی یا dataURL
  isArtist: boolean;
  artist?: ArtistProfile;
}

export interface Comment {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  text: string;
  ts: number;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userIsArtist: boolean;
  trackId: string;
  isVideo: boolean;
  theme: string; // id تم
  caption: string;
  likes: string[];
  comments: Comment[];
  saves: string[];
  ts: number;
}

export interface Theme {
  id: string;
  label_fa: string;
  label_en: string;
  css: string; // background
  accent: string;
}

export const THEMES: Theme[] = [
  { id: "noor", label_fa: "نور", label_en: "Glow", css: "linear-gradient(160deg,#f6a83b 0%,#ff6d55 55%,#c2364b 100%)", accent: "#fff3dd" },
  { id: "darya", label_fa: "دریا", label_en: "Tide", css: "linear-gradient(160deg,#0f5e63 0%,#14919b 55%,#35d5bd 100%)", accent: "#eafffa" },
  { id: "shab", label_fa: "شب", label_en: "Night", css: "linear-gradient(160deg,#0b1514 0%,#123a3f 60%,#1d5c63 100%)", accent: "#9ff0e4" },
  { id: "gol", label_fa: "گل", label_en: "Bloom", css: "linear-gradient(160deg,#7a1f4d 0%,#c2366b 55%,#ff8fa3 100%)", accent: "#ffe7ee" },
  { id: "kavir", label_fa: "کویر", label_en: "Dune", css: "linear-gradient(160deg,#3d2b1f 0%,#8a5a2b 60%,#d9a05b 100%)", accent: "#ffe9c9" },
  { id: "barf", label_fa: "برف", label_en: "Frost", css: "linear-gradient(160deg,#232a4d 0%,#3d5a9e 60%,#7fa8ff 100%)", accent: "#eaf1ff" },
];
export const themeById = (id: string): Theme => THEMES.find((x) => x.id === id) ?? THEMES[0];

/* ---------- مود و فضا ---------- */

export interface Mood {
  id: string;
  fa: string;
  en: string;
  emoji: string;
  hue: number;
  genres: string[];
}

export const MOODS: Mood[] = [
  { id: "deep", fa: "دیپ‌هاوس", en: "Deep House", emoji: "🌊", hue: 190, genres: ["الکترونیک"] },
  { id: "party", fa: "پارتی", en: "Party", emoji: "🪩", hue: 310, genres: ["الکترونیک", "پاپ", "رپ"] },
  { id: "road", fa: "جاده و سفر", en: "Road Trip", emoji: "🛣️", hue: 30, genres: ["پاپ", "تلفیقی", "الکترونیک"] },
  { id: "chill", fa: "چیل و ریلکس", en: "Chill", emoji: "🍃", hue: 150, genres: ["تلفیقی", "پاپ"] },
  { id: "focus", fa: "تمرکز و مطالعه", en: "Focus", emoji: "📚", hue: 210, genres: ["سنتی", "تلفیقی"] },
  { id: "sad", fa: "دلتنگ و بارونی", en: "Rainy Mood", emoji: "🌧️", hue: 220, genres: ["پاپ", "سنتی"] },
  { id: "energy", fa: "انرژی و ورزش", en: "Workout", emoji: "⚡", hue: 10, genres: ["رپ", "الکترونیک"] },
  { id: "love", fa: "عاشقونه", en: "Romance", emoji: "💘", hue: 340, genres: ["پاپ"] },
  { id: "night", fa: "شب‌گردی", en: "Night Drive", emoji: "🌃", hue: 260, genres: ["الکترونیک", "رپ"] },
  { id: "cafe", fa: "کافه", en: "Café", emoji: "☕", hue: 40, genres: ["تلفیقی", "پاپ"] },
  { id: "sonati", fa: "حالِ سنتی", en: "Traditional", emoji: "🪕", hue: 38, genres: ["سنتی"] },
  { id: "streets", fa: "کفِ خیابون", en: "Streets", emoji: "🏙️", hue: 205, genres: ["رپ"] },
];
export const moodById = (id: string): Mood | undefined => MOODS.find((m) => m.id === id);

export interface Place {
  id: string;
  fa: string;
  en: string;
  emoji: string;
  genres: string[];
}

export const PLACES: Place[] = [
  { id: "home", fa: "خونه", en: "Home", emoji: "🏠", genres: ["پاپ", "تلفیقی", "سنتی"] },
  { id: "car", fa: "تو ماشین", en: "In the car", emoji: "🚗", genres: ["پاپ", "الکترونیک", "رپ"] },
  { id: "gym", fa: "باشگاه", en: "Gym", emoji: "🏋️", genres: ["رپ", "الکترونیک"] },
  { id: "cafe", fa: "کافه", en: "Café", emoji: "☕", genres: ["تلفیقی", "پاپ"] },
  { id: "club", fa: "کلاب", en: "Club", emoji: "🎛️", genres: ["الکترونیک"] },
  { id: "nature", fa: "طبیعت", en: "Outdoors", emoji: "⛰️", genres: ["تلفیقی", "سنتی"] },
  { id: "work", fa: "محل کار", en: "Work", emoji: "💼", genres: ["سنتی", "تلفیقی"] },
];
export const placeById = (id: string): Place | undefined => PLACES.find((p) => p.id === id);

/* ---------- اکولایزر ---------- */

export const EQ_FREQS = ["۳۱", "۶۲", "۱۲۵", "۲۵۰", "۵۰۰", "۱ک", "۲ک", "۴ک", "۸ک", "۱۶ک"];
export const EQ_FREQS_EN = ["31", "62", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];

export interface EqPreset {
  id: string;
  fa: string;
  en: string;
  gains: number[]; // dB -12..12
}

export const EQ_PRESETS: EqPreset[] = [
  { id: "flat", fa: "تخت", en: "Flat", gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: "pop", fa: "پاپ", en: "Pop", gains: [-1, 1, 3, 4, 3, 1, 0, 1, 2, 1] },
  { id: "rock", fa: "راک", en: "Rock", gains: [4, 3, 1, 0, -1, 0, 1, 3, 4, 4] },
  { id: "jazz", fa: "جاز", en: "Jazz", gains: [2, 1, 0, 1, -1, 0, 1, 2, 3, 3] },
  { id: "classic", fa: "کلاسیک", en: "Classical", gains: [3, 2, 1, 0, -1, -1, 0, 1, 2, 3] },
  { id: "bass", fa: "بیس‌بوست", en: "Bass Boost", gains: [6, 5, 4, 2, 0, 0, 0, 0, 1, 1] },
  { id: "vocal", fa: "وکال", en: "Vocal", gains: [-2, -1, 0, 2, 4, 4, 3, 1, 0, -1] },
  { id: "electro", fa: "الکترونیک", en: "Electronic", gains: [5, 4, 2, 0, -1, 0, 1, 3, 4, 5] },
  { id: "sonati", fa: "سنتی", en: "Traditional", gains: [1, 2, 3, 2, 1, 2, 3, 3, 2, 1] },
];
export const presetById = (id: string): EqPreset | undefined => EQ_PRESETS.find((p) => p.id === id);

/* ---------- صدای خودرو ---------- */

export const CAR_HEADUNITS = [
  { id: "pioneer", name: "Pioneer" },
  { id: "sony", name: "Sony" },
  { id: "kenwood", name: "Kenwood" },
  { id: "jvc", name: "JVC" },
  { id: "alpine", name: "Alpine" },
  { id: "nakamichi", name: "Nakamichi" },
  { id: "clarion", name: "Clarion" },
  { id: "jbl", name: "JBL" },
  { id: "stock", name: "فابریک / Stock" },
];

export interface CarConfig {
  headunit: string;
  hasSub: boolean;
  subLocation: "trunk" | "seat" | "deck";
  frontCount: number;
  rearCount: number;
  hasTweeter: boolean;
}

/** کوک تخصصی: بر اساس چیدمان ماشین، گین‌های ۱۰ باند تولید می‌کند */
export function optimizeCarGains(cfg: CarConfig): number[] {
  const g = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  if (cfg.hasSub) {
    g[0] += 5;
    g[1] += 4;
    if (cfg.subLocation === "trunk") g[2] += 2;
    if (cfg.subLocation === "seat") {
      g[1] += 2;
      g[2] += 3;
    }
    if (cfg.subLocation === "deck") g[2] += 2;
  } else {
    g[1] += 2;
    g[2] += 3;
  }
  const total = cfg.frontCount + cfg.rearCount;
  if (total >= 6) {
    g[4] += 1;
    g[5] += 2;
    g[6] += 2;
  } else {
    g[5] += 3;
    g[6] += 3;
  }
  if (cfg.hasTweeter) {
    g[8] += 2;
    g[9] += 2;
  }
  // جبران شیشه و فضای کابین
  g[3] += 1;
  return g.map((v) => Math.max(-12, Math.min(12, Math.round(v))));
}

/* ---------- اثرات ویدیویی ---------- */

export const VIDEO_TRACK_IDS = new Set(["t09", "t10", "t13", "t16", "t23", "t08"]);
export const isVideoTrack = (id: string) => VIDEO_TRACK_IDS.has(id);

/* ---------- ماندگاری ---------- */

const LS_USER = "irantify_user";
const LS_STORIES = "irantify_stories";
const LS_SAVED = "irantify_saved";

export function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(LS_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
export function saveUser(u: User | null) {
  if (u) localStorage.setItem(LS_USER, JSON.stringify(u));
  else localStorage.removeItem(LS_USER);
}

export function loadStories(): Story[] {
  try {
    const raw = localStorage.getItem(LS_STORIES);
    if (raw) return JSON.parse(raw) as Story[];
  } catch {
    /* ignore */
  }
  return seedStories();
}
export function saveStories(s: Story[]) {
  localStorage.setItem(LS_STORIES, JSON.stringify(s));
}

export function loadSaved(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_SAVED) ?? "[]") as string[];
  } catch {
    return [];
  }
}
export function saveSaved(ids: string[]) {
  localStorage.setItem(LS_SAVED, JSON.stringify(ids));
}

function seedStories(): Story[] {
  const now = Date.now();
  return [
    {
      id: "s1", userId: "a3", userName: "کیان راد", userAvatar: "🎧", userIsArtist: true,
      trackId: "t09", isVideo: true, theme: "darya", caption: "پالس تازه از استودیو — با هدفون گوش کن ⚡",
      likes: ["a1", "a5"], comments: [{ id: "c1", userId: "a5", name: "سایه", avatar: "🎤", text: "بیسش دیوانه‌کننده‌ست 🔥", ts: now - 3600e3 }],
      saves: [], ts: now - 7200e3,
    },
    {
      id: "s2", userId: "a4", userName: "آوا مهرداد", userAvatar: "🌸", userIsArtist: true,
      trackId: "t13", isVideo: true, theme: "noor", caption: "تهران، ساعت پنج… ویدیوش اومد 🌇",
      likes: ["a7"], comments: [], saves: ["a1"], ts: now - 14400e3,
    },
    {
      id: "s3", userId: "a6", userName: "گروه باربد", userAvatar: "🪘", userIsArtist: true,
      trackId: "t19", isVideo: false, theme: "kavir", caption: "کاروانِ امشب — صدای کویر 🐪",
      likes: [], comments: [{ id: "c2", userId: "a8", name: "رها کمالی", avatar: "🎻", text: "سنتورش فوق‌العاده بود", ts: now - 1800e3 }],
      saves: [], ts: now - 21600e3,
    },
    {
      id: "s4", userId: "a7", userName: "نیلوفر آبی", userAvatar: "💧", userIsArtist: true,
      trackId: "t23", isVideo: true, theme: "shab", caption: "شب‌های نیلوفری، نسخهٔ ویدیویی 🌙",
      likes: ["a3"], comments: [], saves: [], ts: now - 28800e3,
    },
  ];
}

export const uid = () => Math.random().toString(36).slice(2, 10);
