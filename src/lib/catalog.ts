import type { Genre, TrackSpec } from "./synth";

/* ---------- ابزارهای فارسی ---------- */

const FA = "۰۱۲۳۴۵۶۷۸۹";
export const faNum = (v: number | string): string =>
  String(v).replace(/[0-9]/g, (d) => FA[Number(d)]);

export function faTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return faNum(`${m}:${String(s).padStart(2, "0")}`);
}

export function faTotal(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${faNum(h)} ساعت و ${faNum(m)} دقیقه`;
  return `${faNum(m)} دقیقه و ${faNum(Math.floor(sec % 60))} ثانیه`;
}

export function faPlays(n: number): string {
  if (n >= 1_000_000) return `${faNum((n / 1_000_000).toFixed(1).replace(".", "٫"))} میلیون`;
  if (n >= 1000) return `${faNum(Math.round(n / 1000))} هزار`;
  return faNum(n);
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "شب‌زنده‌داری مبارک";
  if (h < 12) return "صبح بخیر";
  if (h < 17) return "ظهر بخیر";
  if (h < 20) return "عصر بخیر";
  return "شب بخیر";
}

export const normalizeFa = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/\u200c/g, " ");

/* ---------- مدل داده ---------- */

export interface Artist {
  id: string;
  name: string;
  genres: Genre[];
  bio: string;
  hue: number;
  city: string;
}

export interface TrackDef {
  id: string;
  title: string;
  artistId: string;
  album: string;
  genre: Genre;
  dastgah: string;
  root: number;
  bpm: number;
  seed: number;
  duration: number;
  year: number; // سال شمسی
  hue: number;
  plays: number;
}

export interface TrackRuntime extends TrackDef {
  ready: boolean;
  url?: string;
  peaks?: number[];
  uploaded?: boolean;
}

export const toSpec = (t: TrackDef): TrackSpec => ({
  scaleName: t.dastgah,
  root: t.root,
  bpm: t.bpm,
  genre: t.genre,
  seed: t.seed,
  duration: t.duration,
});

/* ---------- هنرمندان ---------- */

export const ARTISTS: Artist[] = [
  { id: "a1", name: "لیلا سرحدی", genres: ["سنتی"], bio: "صدای آینه‌ها؛ آوازه‌خوانی که بداهه را به قصه تبدیل می‌کند.", hue: 38, city: "اصفهان" },
  { id: "a2", name: "میرزا طاهر", genres: ["سنتی"], bio: "سه‌تاریِ اهل خلوت؛ بداهه‌نوازی در سکوتِ صبح.", hue: 25, city: "شیراز" },
  { id: "a3", name: "کیان راد", genres: ["الکترونیک"], bio: "معمارِ صدا؛ مدارهای فیروزه‌ای از دلِ سینث‌سایزر.", hue: 174, city: "تهران" },
  { id: "a4", name: "آوا مهرداد", genres: ["پاپ"], bio: "راویِ دلتنگی‌های شهر؛ پاپِ روشن با لهجهٔ تهران.", hue: 330, city: "تهران" },
  { id: "a5", name: "سایه", genres: ["رپ"], bio: "قلمِ خیابان؛ روایت‌های جنوب شهر روی بیس‌های سنگین.", hue: 210, city: "اهواز" },
  { id: "a6", name: "گروه باربد", genres: ["تلفیقی"], bio: "کاروانی از سازهای کویری و ضرب‌های مدرن.", hue: 150, city: "کرمان" },
  { id: "a7", name: "نیلوفر آبی", genres: ["پاپ", "الکترونیک"], bio: "موج‌های شبانه؛ جایی که پاپ در الکترونیک غرق می‌شود.", hue: 196, city: "رشت" },
  { id: "a8", name: "رها کمالی", genres: ["تلفیقی"], bio: "باغ‌های صوتی؛ تلفیق سنتور و بیت‌های آرام.", hue: 96, city: "تبریز" },
];

/* ---------- آثار ---------- */

export const TRACKS: TrackDef[] = [
  // لیلا سرحدی — آینه‌های شوری (۱۴۰۰)
  { id: "t01", title: "آینه‌های شوری", artistId: "a1", album: "آینه‌های شوری", genre: "سنتی", dastgah: "شور", root: 196, bpm: 78, seed: 101, duration: 28, year: 1400, hue: 38, plays: 482_300 },
  { id: "t02", title: "رقص قلم", artistId: "a1", album: "آینه‌های شوری", genre: "سنتی", dastgah: "دشت", root: 196, bpm: 84, seed: 102, duration: 24, year: 1400, hue: 32, plays: 291_400 },
  { id: "t03", title: "شب‌های همایون", artistId: "a1", album: "شب‌های همایون", genre: "سنتی", dastgah: "همایون", root: 174.6, bpm: 72, seed: 103, duration: 30, year: 1402, hue: 44, plays: 655_900 },
  { id: "t04", title: "چهارمضرابِ مهر", artistId: "a1", album: "شب‌های همایون", genre: "سنتی", dastgah: "چهارگاه", root: 196, bpm: 92, seed: 104, duration: 22, year: 1402, hue: 48, plays: 198_700 },
  // میرزا طاهر — بداهه در شور (۱۳۹۸)
  { id: "t05", title: "بداههٔ سحر", artistId: "a2", album: "بداهه در شور", genre: "سنتی", dastgah: "شور", root: 220, bpm: 70, seed: 201, duration: 32, year: 1398, hue: 24, plays: 377_100 },
  { id: "t06", title: "زمزمهٔ سه‌تار", artistId: "a2", album: "بداهه در شور", genre: "سنتی", dastgah: "اصفهان", root: 196, bpm: 76, seed: 202, duration: 26, year: 1398, hue: 28, plays: 244_800 },
  { id: "t07", title: "خلوتِ ماهور", artistId: "a2", album: "بداهه در شور", genre: "سنتی", dastgah: "ماهور", root: 174.6, bpm: 80, seed: 203, duration: 24, year: 1398, hue: 20, plays: 156_300 },
  // کیان راد — مدار فیروزه (۱۴۰۱) و پالس (۱۴۰۳)
  { id: "t08", title: "مدار فیروزه", artistId: "a3", album: "مدار فیروزه", genre: "الکترونیک", dastgah: "بیات ترک", root: 196, bpm: 124, seed: 301, duration: 28, year: 1401, hue: 174, plays: 921_500 },
  { id: "t09", title: "پالس", artistId: "a3", album: "پالس", genre: "الکترونیک", dastgah: "چهارگاه", root: 220, bpm: 128, seed: 302, duration: 26, year: 1403, hue: 182, plays: 1_204_000 },
  { id: "t10", title: "شب‌گردی در نئون", artistId: "a3", album: "پالس", genre: "الکترونیک", dastgah: "بیات ترک", root: 174.6, bpm: 126, seed: 303, duration: 30, year: 1403, hue: 190, plays: 743_200 },
  { id: "t11", title: "سراب دیجیتال", artistId: "a3", album: "مدار فیروزه", genre: "الکترونیک", dastgah: "همایون", root: 196, bpm: 122, seed: 304, duration: 24, year: 1401, hue: 168, plays: 512_600 },
  // آوا مهرداد — دلتنگی (۱۴۰۰) و تهران ۱۴۰۰ (۱۴۰۲)
  { id: "t12", title: "دلتنگی", artistId: "a4", album: "دلتنگی", genre: "پاپ", dastgah: "ماهور", root: 220, bpm: 112, seed: 401, duration: 26, year: 1400, hue: 330, plays: 1_530_000 },
  { id: "t13", title: "تهران، ساعت پنج", artistId: "a4", album: "تهران ۱۴۰۰", genre: "پاپ", dastgah: "اصفهان", root: 196, bpm: 118, seed: 402, duration: 28, year: 1402, hue: 338, plays: 2_110_000 },
  { id: "t14", title: "آفتابگردان", artistId: "a4", album: "تهران ۱۴۰۰", genre: "پاپ", dastgah: "ماهور", root: 220, bpm: 120, seed: 403, duration: 24, year: 1402, hue: 322, plays: 884_400 },
  { id: "t15", title: "پل", artistId: "a4", album: "دلتنگی", genre: "پاپ", dastgah: "اصفهان", root: 174.6, bpm: 110, seed: 404, duration: 25, year: 1400, hue: 346, plays: 690_200 },
  // سایه — کوچه‌های جنوب (۱۴۰۱)
  { id: "t16", title: "کوچه‌های جنوب", artistId: "a5", album: "کوچه‌های جنوب", genre: "رپ", dastgah: "چهارگاه", root: 146.8, bpm: 86, seed: 501, duration: 28, year: 1401, hue: 210, plays: 1_870_000 },
  { id: "t17", title: "خاطرات خاکستری", artistId: "a5", album: "کوچه‌های جنوب", genre: "رپ", dastgah: "شور", root: 146.8, bpm: 90, seed: 502, duration: 26, year: 1401, hue: 218, plays: 1_320_000 },
  { id: "t18", title: "قلمِ شکسته", artistId: "a5", album: "کوچه‌های جنوب", genre: "رپ", dastgah: "چهارگاه", root: 130.8, bpm: 84, seed: 503, duration: 24, year: 1401, hue: 202, plays: 954_800 },
  // گروه باربد — کاروان (۱۳۹۹)
  { id: "t19", title: "کاروان", artistId: "a6", album: "کاروان", genre: "تلفیقی", dastgah: "دشت", root: 196, bpm: 104, seed: 601, duration: 28, year: 1399, hue: 150, plays: 611_700 },
  { id: "t20", title: "کویر و کابل", artistId: "a6", album: "کاروان", genre: "تلفیقی", dastgah: "اصفهان", root: 174.6, bpm: 100, seed: 602, duration: 26, year: 1399, hue: 142, plays: 428_900 },
  { id: "t21", title: "یلدای الکتریک", artistId: "a6", album: "کاروان", genre: "تلفیقی", dastgah: "شور", root: 196, bpm: 108, seed: 603, duration: 25, year: 1399, hue: 158, plays: 505_100 },
  // نیلوفر آبی — موج (۱۴۰۳)
  { id: "t22", title: "موج اول", artistId: "a7", album: "موج", genre: "پاپ", dastgah: "ماهور", root: 220, bpm: 116, seed: 701, duration: 26, year: 1403, hue: 196, plays: 1_045_000 },
  { id: "t23", title: "شب‌های نیلوفری", artistId: "a7", album: "موج", genre: "الکترونیک", dastgah: "بیات ترک", root: 196, bpm: 124, seed: 702, duration: 28, year: 1403, hue: 204, plays: 776_300 },
  { id: "t24", title: "خلیج", artistId: "a7", album: "موج", genre: "پاپ", dastgah: "اصفهان", root: 196, bpm: 114, seed: 703, duration: 24, year: 1403, hue: 188, plays: 640_500 },
  // رها کمالی — باغ ارم (۱۴۰۲)
  { id: "t25", title: "باغ ارم", artistId: "a8", album: "باغ ارم", genre: "تلفیقی", dastgah: "همایون", root: 174.6, bpm: 102, seed: 801, duration: 27, year: 1402, hue: 96, plays: 388_600 },
  { id: "t26", title: "سنتور و باران", artistId: "a8", album: "باغ ارم", genre: "تلفیقی", dastgah: "شور", root: 196, bpm: 98, seed: 802, duration: 25, year: 1402, hue: 88, plays: 297_400 },
  { id: "t27", title: "شهرزاد", artistId: "a8", album: "باغ ارم", genre: "تلفیقی", dastgah: "دشت", root: 220, bpm: 106, seed: 803, duration: 23, year: 1402, hue: 104, plays: 215_900 },
];

export const GENRES: { id: Exclude<Genre, "آپلود">; hue: number; desc: string }[] = [
  { id: "سنتی", hue: 38, desc: "آواز، سه‌تار و بداهه" },
  { id: "پاپ", hue: 330, desc: "روایت‌های روشن شهر" },
  { id: "الکترونیک", hue: 174, desc: "مدارها و پالس‌ها" },
  { id: "رپ", hue: 210, desc: "قلمِ خیابان" },
  { id: "تلفیقی", hue: 150, desc: "سنت در گفت‌وگو با امروز" },
];

export const artistById = (id: string): Artist | undefined => ARTISTS.find((a) => a.id === id);

export const tracksOfArtist = (artistId: string): TrackDef[] => TRACKS.filter((t) => t.artistId === artistId);

export const albumsOfArtist = (artistId: string): { album: string; year: number; tracks: TrackDef[] }[] => {
  const map = new Map<string, { album: string; year: number; tracks: TrackDef[] }>();
  tracksOfArtist(artistId).forEach((t) => {
    if (!map.has(t.album)) map.set(t.album, { album: t.album, year: t.year, tracks: [] });
    map.get(t.album)!.tracks.push(t);
  });
  return [...map.values()];
};
