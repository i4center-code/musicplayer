import { useSyncExternalStore } from "react";

export type Lang = "fa" | "en";

const LS_LANG = "irantify_lang";

const STR: Record<Lang, Record<string, string>> = {
  fa: {
    appName: "ایران‌تیفای",
    tagline: "موزیک · ویدیو · استوری",
    home: "خانه", search: "جستجو", publish: "انتشار", library: "کتابخانه", profile: "پروفایل",
    play: "پخش", pause: "توقف", next: "بعدی", prev: "قبلی", queue: "صف پخش", upNext: "در ادامه",
    uploadSound: "آپلود صدا و ویدیو", login: "ورود", logout: "خروج از حساب", save: "ذخیره", cancel: "انصراف",
    send: "ارسال", delete: "حذف", share: "اشتراک‌گذاری", close: "بستن", seeAll: "همه",
    searchPlaceholder: "جستجوی اثر، هنرمند یا حال‌وهوا…", noResults: "چیزی پیدا نشد",
    email: "ایمیل", name: "نام",
    authTitle: "با ایمیل وارد شو",
    authBody: "لاگین اجباری نیست؛ ولی برای استوری گذاشتن، لایک، کامنت و آپلود، یک ایمیل لازمه.",
    emailPh: "you@mail.com", namePh: "اسم تو", avatarPick: "انتخاب تصویر پروفایل",
    emailRequired: "برای این کار اول یک ایمیل وارد کن",
    emailInvalid: "ایمیل درست به نظر نمی‌رسه",
    welcome: "خوش اومدی",
    forYou: "پیشنهاد امروز", hottest: "داغ‌ترین‌ها", artistsTitle: "هنرمندان", genresTitle: "ژانرها",
    yourUploads: "آپلودهای تو", moodsTitle: "الان چه فازی هستی؟", playAll: "پخش همه",
    storyAdd: "استوری تو", yourStory: "استوری‌ها",
    tracks: "اثر", followers: "دنبال‌کننده", listens: "پخش",
    guestTitle: "هنوز وارد نشدی",
    guestBody: "با یک ایمیل ساده وارد شو تا استوری بسازی، لایک و کامنت بذاری و کارهای خودت رو آپلود کنی.",
    enterApp: "ورود / ثبت‌نام",
    myProfile: "پروفایل من", artistPanel: "پنل هنرمند", viewArtistPage: "مشاهدهٔ صفحهٔ هنرمند",
    soundLab: "لابراتوار صدا", logoutConfirm: "از حساب خارج شدی",
    statsStories: "استوری", statsUploads: "آپلود", statsLikes: "علاقه‌مندی",
    artistBadge: "هنرمند", verified: "تأییدشده",
    myUploadsSec: "فایل‌های من", myLikesSec: "علاقه‌مندی‌ها",
    emptyLibrary: "کتابخانه‌ات خالیه", emptyLibraryBody: "اولین فایل صوتی یا ویدیویی خودت رو آپلود کن.",
    emptyLikes: "هنوز لایکی نزده‌ای", emptyLikesBody: "روی قلب بزن تا اینجا جمع بشن.",
    uploadBannerTitle: "صدای خودت رو برسون به بقیه",
    uploadBannerBody: "MP3، WAV، ویدیو… بکش و رها کن یا بزن روش.",
    sending: "در حال ارسال", reading: "خواندن فایل", decoding: "پردازش صدا", analyzing: "آنالیز و آماده‌سازی",
    addedToArchive: "اثر به آرشیو اضافه شد", notMedia: "این فایل صوتی/تصویری نیست",
    addedToFav: "به علاقه‌مندی‌ها اضافه شد",
    genres: "ژانرها", moods: "حال‌وهوا", all: "همه",
    nowPlaying: "در حال پخش", vizMode: "بصری‌ساز", removeFromQueue: "حذف از صف",
    storyBtn: "استوری کن", eqBtn: "اکولایزر", shareCard: "ساخت کارت استوری",
    chooseTrack: "انتخاب اثر", chooseTheme: "تم اکولایزر", captionPh: "چیزی بنویس…",
    postStory: "انتشار استوری", storyPosted: "استوری‌ات منتشر شد — همه می‌بیننش!",
    holdHint: "نگه دار = توقف · چپ و راست = جابه‌جایی",
    writeComment: "نظر بده…", noComments: "اولین کامنت رو تو بذار", comments: "کامنت‌ها",
    storySavedMsg: "استوری ذخیره شد", shareDone: "کارت استوری ساخته شد",
    loginToPost: "اول وارد شو تا بتونی استوری بذاری",
    artistName: "نام هنری", taglineLabel: "شعار کوتاه", bioLabel: "دربارهٔ تو",
    coverLabel: "کاور صفحه (تصویر)", genreLabel: "سبک اصلی",
    addWork: "افزودن اثر / آلبوم", workTitle: "عنوان", workKind: "نوع",
    kindTrack: "تک‌آهنگ", kindVideo: "موزیک‌ویدیو", kindAlbum: "آلبوم",
    workNote: "توضیح اثر", coverWork: "کاور اثر", linkToTrack: "لینک به اثر داخل اپ",
    pickTrack: "انتخاب اثر", externalLink: "لینک بیرونی (اختیاری)",
    saveArtist: "ذخیرهٔ پنل هنرمند", artistSaved: "پنل هنرمند ذخیره شد — نشان هنرمند گرفتی!",
    badgeNote: "کنار اسمت نشان «هنرمند» نمایش داده می‌شه.",
    aboutArtist: "درباره", worksTitle: "آثار و کاورها", listenHint: "برای پخش، روی اثر بزن",
    externalOpen: "باز شدن در مرورگر",
    eqTitle: "اکولایزر تخصصی", eqSub: "پریست آماده یا دستی — مستقیم روی زنجیرهٔ صوتی اعمال می‌شه",
    presets: "پریست‌ها", manual: "دستی", custom: "سفارشی",
    pFlat: "تخت", pPop: "پاپ", pRock: "راک", pJazz: "جاز", pClassic: "کلاسیک",
    pBass: "بیس‌بوست", pVocal: "وکال", pElectro: "الکترونیک", pSonati: "سنتی", pMood: "مود",
    eqApplied: "اکولایزر اعمال شد", saveAsPreset: "ذخیره به‌عنوان پریست", presetNamePh: "نام پریست",
    myPresets: "پریست‌های من",
    carTitle: "تنظیم صدای خودرو", carSub: "سیستم ماشینت رو بچین تا صدا رو تخصصی کوک کنیم",
    headunit: "برند ضبط", hasSub: "ساب‌ووفر داری؟", subLocation: "جای ساب",
    subTrunk: "صندوق عقب", subSeat: "زیر صندلی", subDeck: "طاقچه",
    frontCount: "باند جلو", rearCount: "باند عقب", hasTweeter: "توییتر داری؟",
    optimize: "کوک تخصصی", optimized: "بر اساس سیستم ماشینت کوک شد — می‌تونی دستی هم تغییر بدی",
    saveCarPreset: "ذخیرهٔ پریست خودرو", carSaved: "پریست خودرو ذخیره شد",
    apply: "اعمال", savedCarPresets: "تنظیمات ذخیره‌شده",
    yes: "دارم", no: "ندارم", language: "زبان", account: "حساب",
    djNote: "مناسب دی‌جی‌ها، آهنگسازها و سازنده‌های خوانندهٔ هوش مصنوعی",
    videoBadge: "ویدیو", audioBadge: "صدا",
    uploadProgress: "ارسال فایل",
    storyTheme: "تم",
    members: "کاربر ایران‌تیفای",
    back: "برگشت",
    nightDrive: "شب‌گردی",
    // مود و فضا
    space: "فضا", pickMood: "چه مودی داری؟", pickPlace: "کجا هستی؟", moodNow: "مودِ تو",
    matchedTracks: "اثرهای هماهنگ با فازت", resetMood: "پاک کردن مود",
    // ویدیو
    video: "ویدیو", watchVideo: "تماشای ویدیو", videoNow: "در حال پخش ویدیو",
    // آپلود
    uploadingFile: "در حال ارسال فایل", uploadStep: "مرحله", of: "از", filesInQueue: "فایل در صف",
    uploadDoneAll: "همهٔ فایل‌ها ارسال شد",
    // استوری و اشتراک
    noStories: "هنوز استوری‌ای نیست", beFirst: "اولین استوری رو تو بساز",
    myStories: "استوری‌های من", sendStory: "استوری بفرست", replay: "پخش دوباره",
    shareTo: "اشتراک در", whatsapp: "واتساپ", telegram: "تلگرام", instagram: "اینستاگرام",
    twitter: "توییتر", copyLink: "کپی لینک", downloadCard: "دانلود کارت", savedStory: "ذخیره شد",
    likesWord: "لایک", commentLogin: "برای نظر دادن وارد شو", yourComment: "نظرت…",
    savedTab: "ذخیره‌شده",
    // هنرمند
    artistStudio: "استودیوی هنرمند", becomeArtist: "هنرمند شو", djMode: "دی‌جی / تنظیم‌کننده",
    aiArtist: "خوانندهٔ هوش مصنوعی", monthlyListeners: "شنوندهٔ ماهانه", listenOnApp: "پخش در اپ",
    coverPick: "انتخاب رنگ کاور", worksHint: "اثرها و کاورهای منتشرشده‌ات",
    carAudioLab: "لابراتوار صدای خودرو", bandCount: "تعداد باند", settings: "تنظیمات",
    aboutApp: "دربارهٔ اپ", version: "نسخه", appearance: "ظاهر", notifications: "اعلان‌ها",
    membersCount: "عضو ایران‌تیفای",
  },
  en: {
    appName: "Irantify",
    tagline: "Music · Video · Stories",
    home: "Home", search: "Search", publish: "Post", library: "Library", profile: "Profile",
    play: "Play", pause: "Pause", next: "Next", prev: "Previous", queue: "Queue", upNext: "Up next",
    uploadSound: "Upload audio & video", login: "Sign in", logout: "Log out", save: "Save", cancel: "Cancel",
    send: "Send", delete: "Delete", share: "Share", close: "Close", seeAll: "All",
    searchPlaceholder: "Search tracks, artists, moods…", noResults: "Nothing found",
    email: "Email", name: "Name",
    authTitle: "Sign in with email",
    authBody: "Login isn't forced — but posting stories, liking, commenting and uploading need an email.",
    emailPh: "you@mail.com", namePh: "Your name", avatarPick: "Pick a profile picture",
    emailRequired: "Enter an email first to do that",
    emailInvalid: "That email doesn't look right",
    welcome: "Welcome",
    forYou: "Today's pick", hottest: "Hottest now", artistsTitle: "Artists", genresTitle: "Genres",
    yourUploads: "Your uploads", moodsTitle: "What's your vibe right now?", playAll: "Play all",
    storyAdd: "Your story", yourStory: "Stories",
    tracks: "tracks", followers: "followers", listens: "plays",
    guestTitle: "You're not signed in",
    guestBody: "Sign in with just an email to post stories, like, comment and upload your own work.",
    enterApp: "Sign in / Register",
    myProfile: "My profile", artistPanel: "Artist studio", viewArtistPage: "View artist page",
    soundLab: "Sound lab", logoutConfirm: "Logged out",
    statsStories: "Stories", statsUploads: "Uploads", statsLikes: "Likes",
    artistBadge: "Artist", verified: "Verified",
    myUploadsSec: "My files", myLikesSec: "Liked",
    emptyLibrary: "Your library is empty", emptyLibraryBody: "Upload your first audio or video file.",
    emptyLikes: "No likes yet", emptyLikesBody: "Tap the heart and they'll gather here.",
    uploadBannerTitle: "Get your sound out there",
    uploadBannerBody: "MP3, WAV, video… drag & drop or tap.",
    sending: "Uploading", reading: "Reading file", decoding: "Processing audio", analyzing: "Analyzing & preparing",
    addedToArchive: "Added to your archive", notMedia: "That file isn't audio/video",
    addedToFav: "Added to favorites",
    genres: "Genres", moods: "Moods", all: "All",
    nowPlaying: "Now playing", vizMode: "Visualizer", removeFromQueue: "Remove from queue",
    storyBtn: "Make a story", eqBtn: "Equalizer", shareCard: "Building story card",
    chooseTrack: "Pick a track", chooseTheme: "EQ theme", captionPh: "Write something…",
    postStory: "Post story", storyPosted: "Your story is live — everyone can see it!",
    holdHint: "Hold = pause · tap sides = navigate",
    writeComment: "Add a comment…", noComments: "Be the first to comment", comments: "Comments",
    storySavedMsg: "Story saved", shareDone: "Story card ready",
    loginToPost: "Sign in first to post stories",
    artistName: "Stage name", taglineLabel: "Short tagline", bioLabel: "About you",
    coverLabel: "Page cover (image)", genreLabel: "Main genre",
    addWork: "Add track / album", workTitle: "Title", workKind: "Type",
    kindTrack: "Single", kindVideo: "Music video", kindAlbum: "Album",
    workNote: "Description", coverWork: "Cover image", linkToTrack: "Link to in-app track",
    pickTrack: "Pick a track", externalLink: "External link (optional)",
    saveArtist: "Save artist studio", artistSaved: "Artist studio saved — you earned the badge!",
    badgeNote: "An “Artist” badge now shows next to your name.",
    aboutArtist: "About", worksTitle: "Works & covers", listenHint: "Tap a work to play it",
    externalOpen: "Open in browser",
    eqTitle: "Pro equalizer", eqSub: "Presets or manual — applied straight to the audio chain",
    presets: "Presets", manual: "Manual", custom: "Custom",
    pFlat: "Flat", pPop: "Pop", pRock: "Rock", pJazz: "Jazz", pClassic: "Classical",
    pBass: "Bass boost", pVocal: "Vocal", pElectro: "Electronic", pSonati: "Traditional", pMood: "Mood",
    eqApplied: "EQ applied", saveAsPreset: "Save as preset", presetNamePh: "Preset name",
    myPresets: "My presets",
    carTitle: "Car audio tuning", carSub: "Describe your car system for a custom tune",
    headunit: "Head-unit brand", hasSub: "Got a subwoofer?", subLocation: "Sub location",
    subTrunk: "Trunk", subSeat: "Under seat", subDeck: "Rear deck",
    frontCount: "Front speakers", rearCount: "Rear speakers", hasTweeter: "Got tweeters?",
    optimize: "Auto-tune", optimized: "Tuned for your system — tweak manually anytime",
    saveCarPreset: "Save car preset", carSaved: "Car preset saved",
    apply: "Apply", savedCarPresets: "Saved tunes",
    yes: "Yes", no: "No", language: "Language", account: "Account",
    djNote: "Built for DJs, producers & AI-vocal creators",
    videoBadge: "Video", audioBadge: "Audio",
    uploadProgress: "Uploading file",
    storyTheme: "Theme",
    members: "Irantify member",
    back: "Back",
    nightDrive: "Night drive",
    // moods & places
    space: "Space", pickMood: "What's your mood?", pickPlace: "Where are you?", moodNow: "Your vibe",
    matchedTracks: "Tracks matched to your vibe", resetMood: "Clear mood",
    // video
    video: "Video", watchVideo: "Watch video", videoNow: "Now playing video",
    // upload
    uploadingFile: "Uploading file", uploadStep: "Step", of: "of", filesInQueue: "files in queue",
    uploadDoneAll: "All files uploaded",
    // stories & share
    noStories: "No stories yet", beFirst: "Make the first one",
    myStories: "My stories", sendStory: "Send a story", replay: "Replay",
    shareTo: "Share to", whatsapp: "WhatsApp", telegram: "Telegram", instagram: "Instagram",
    twitter: "Twitter", copyLink: "Copy link", downloadCard: "Download card", savedStory: "Saved",
    likesWord: "likes", commentLogin: "Sign in to comment", yourComment: "Your comment…",
    savedTab: "Saved",
    // artist
    artistStudio: "Artist studio", becomeArtist: "Become an artist", djMode: "DJ / Producer",
    aiArtist: "AI vocalist", monthlyListeners: "monthly listeners", listenOnApp: "Play in app",
    coverPick: "Pick cover color", worksHint: "Your released works & covers",
    carAudioLab: "Car audio lab", bandCount: "Band count", settings: "Settings",
    aboutApp: "About", version: "Version", appearance: "Appearance", notifications: "Notifications",
    membersCount: "Irantify members",
  },
};

const GENRE_LABELS: Record<string, { fa: string; en: string }> = {
  "سنتی": { fa: "سنتی", en: "Traditional" },
  "پاپ": { fa: "پاپ", en: "Pop" },
  "الکترونیک": { fa: "الکترونیک", en: "Electronic" },
  "رپ": { fa: "رپ", en: "Rap" },
  "تلفیقی": { fa: "تلفیقی", en: "Fusion" },
  "آپلود": { fa: "آپلودی", en: "Uploads" },
};

const DASTGAH_LABELS: Record<string, { fa: string; en: string }> = {
  "شور": { fa: "شور", en: "Shur" },
  "دشت": { fa: "دشت", en: "Dasht" },
  "همایون": { fa: "همایون", en: "Homayun" },
  "ماهور": { fa: "ماهور", en: "Mahur" },
  "اصفهان": { fa: "اصفهان", en: "Esfahan" },
  "بیات ترک": { fa: "بیات ترک", en: "Bayat-e Tork" },
  "چهارگاه": { fa: "چهارگاه", en: "Chahargah" },
  "—": { fa: "—", en: "—" },
};

let lang: Lang = (localStorage.getItem(LS_LANG) === "en" ? "en" : "fa") as Lang;

function apply() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  localStorage.setItem(LS_LANG, lang);
}
apply();

const listeners = new Set<() => void>();

export function setLang(l: Lang) {
  if (l === lang) return;
  lang = l;
  apply();
  listeners.forEach((f) => f());
}

export function getLang() {
  return lang;
}

export function t(key: string): string {
  return STR[lang][key] ?? STR.fa[key] ?? key;
}

export function genreLabel(g: string): string {
  return GENRE_LABELS[g]?.[lang] ?? g;
}

export function dastgahLabel(d: string): string {
  return DASTGAH_LABELS[d]?.[lang] ?? d;
}

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
export function num(v: number | string): string {
  const s = String(v);
  return lang === "fa" ? s.replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]) : s;
}

export function time(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return num(`${m}:${String(s).padStart(2, "0")}`);
}

export function plays(n: number): string {
  if (n >= 1_000_000) return `${num((n / 1_000_000).toFixed(1))}M`;
  if (n >= 1000) return `${num(Math.round(n / 1000))}K`;
  return num(n);
}

export function greet(): string {
  const h = new Date().getHours();
  const key = h < 5 ? "شب‌زنده‌داری" : h < 12 ? "صبح بخیر" : h < 17 ? "ظهر بخیر" : h < 20 ? "عصر بخیر" : "شب بخیر";
  const map: Record<string, string> = {
    "شب‌زنده‌داری": "Up late, night owl",
    "صبح بخیر": "Good morning",
    "ظهر بخیر": "Good afternoon",
    "عصر بخیر": "Good evening",
    "شب بخیر": "Good night",
  };
  return lang === "fa" ? key : map[key];
}

export function useT() {
  const l = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => lang
  );
  void l;
  return { t, num, time, plays, greet, genreLabel, dastgahLabel, lang };
}
