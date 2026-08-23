import { useCallback, useEffect, useRef, useState } from "react";
import { num, t, time as fmtTime, useT } from "../lib/i18n";
import type { Story, User } from "../lib/state";
import { themeById, uid } from "../lib/state";
import type { TrackRuntime } from "../lib/catalog";
import { IconBookmark, IconComment, IconHeart, IconMusic, IconPause, IconPlay, IconSend, IconShare, IconVideo, IconX } from "./icons";

interface Props {
  stories: Story[];
  index: number;
  onNavigate: (i: number) => void;
  onClose: () => void;
  user: User | null;
  tracks: TrackRuntime[];
  playingId: string | null;
  isPlaying: boolean;
  onPlayTrack: (id: string) => void;
  onLike: (id: string) => void;
  onComment: (id: string, text: string) => void;
  onSave: (id: string) => void;
  savedIds: string[];
  onRequireAuth: () => void;
  onToast: (msg: string) => void;
}

const STORY_MS = 15000;

export default function StoryViewer(p: Props) {
  const { stories, index } = p;
  const { lang } = useT();
  const story = stories[index];
  const [progress, setProgress] = useState(0);
  const [held, setHeld] = useState(false);
  const [sheet, setSheet] = useState<"none" | "comment" | "share">("none");
  const [commentText, setCommentText] = useState("");
  const rafRef = useRef(0);
  const lastRef = useRef(performance.now());

  const theme = story ? themeById(story.theme) : null;
  const track = story ? p.tracks.find((tr) => tr.id === story.trackId) : null;
  const liked = story ? story.likes.includes(p.user?.id ?? "") : false;
  const saved = story ? p.savedIds.includes(story.id) : false;
  const isCurrent = story ? p.playingId === story.trackId : false;

  /* پیشرفت خودکار */
  useEffect(() => {
    setProgress(0);
    lastRef.current = performance.now();
    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (held || sheet !== "none") {
        lastRef.current = now;
        return;
      }
      const dt = now - lastRef.current;
      lastRef.current = now;
      setProgress((pr) => {
        const nx = pr + dt / STORY_MS;
        if (nx >= 1) {
          if (index < stories.length - 1) p.onNavigate(index + 1);
          else p.onClose();
          return 0;
        }
        return nx;
      });
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, held, sheet, stories.length]);

  const requireAuth = useCallback(
    (fn: () => void) => {
      if (!p.user) {
        p.onRequireAuth();
        return;
      }
      fn();
    },
    [p]
  );

  const submitComment = () => {
    const txt = commentText.trim();
    if (!txt || !story) return;
    requireAuth(() => {
      p.onComment(story.id, txt);
      setCommentText("");
      setSheet("none");
    });
  };

  /* ---------- ساخت کارت استوری ---------- */
  const buildCard = useCallback(async (): Promise<Blob> => {
    const W = 1080;
    const H = 1920;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const c = cv.getContext("2d")!;
    const th = themeById(story!.theme);
    const grd = c.createLinearGradient(0, 0, W * 0.4, H);
    const stops = th.css.match(/#[0-9a-fA-F]{6}/g) ?? ["#123a3f", "#35d5bd"];
    stops.forEach((s, i) => grd.addColorStop(i / (stops.length - 1), s));
    c.fillStyle = grd;
    c.fillRect(0, 0, W, H);
    // نویز ملایم
    c.globalAlpha = 0.05;
    for (let i = 0; i < 1200; i++) {
      c.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
      c.fillRect(Math.random() * W, Math.random() * H, 2, 2);
    }
    c.globalAlpha = 1;
    // اکولایزر تزئینی
    const bars = 48;
    for (let i = 0; i < bars; i++) {
      const h = 60 + Math.random() * 420;
      c.fillStyle = "rgba(255,255,255,0.28)";
      const bw = W / bars;
      c.fillRect(i * bw + bw * 0.2, H * 0.62 - h, bw * 0.6, h);
      c.globalAlpha = 0.35;
      c.fillRect(i * bw + bw * 0.2, H * 0.62 + 12, bw * 0.6, h * 0.28);
      c.globalAlpha = 1;
    }
    c.fillStyle = "rgba(0,0,0,0.28)";
    c.fillRect(0, 0, W, H * 0.34);
    c.textAlign = "center";
    c.fillStyle = th.accent;
    c.font = "700 42px sans-serif";
    c.fillText(story!.userIsArtist ? "🎵 ARTIST STORY" : "🎵 STORY", W / 2, 140);
    c.font = "900 120px sans-serif";
    c.fillText(story!.userAvatar.length <= 4 ? story!.userAvatar : "🎧", W / 2, H * 0.42);
    c.fillStyle = "#ffffff";
    c.font = "800 88px sans-serif";
    wrapText(c, track?.title ?? story!.trackId, W / 2, H * 0.5, W - 160, 100);
    if (story!.caption) {
      c.font = "500 44px sans-serif";
      c.fillStyle = "rgba(255,255,255,0.9)";
      wrapText(c, story!.caption, W / 2, H * 0.78, W - 200, 58);
    }
    c.fillStyle = th.accent;
    c.font = "700 40px sans-serif";
    c.fillText("IRANTIFY · ایران‌تیفای", W / 2, H - 120);
    return new Promise((res) => cv.toBlob((b) => res(b!), "image/png"));
  }, [story, track]);

  const shareText = `${track?.title ?? ""} — ${story?.userName} | Irantify`;
  const shareUrl = `https://irantify.app/s/${story?.id}`;

  const doShare = async (target: string) => {
    if (target === "copy") {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        p.onToast(t("copyLink") + " ✓");
      } catch {
        p.onToast(shareUrl);
      }
      setSheet("none");
      return;
    }
    if (target === "download") {
      const blob = await buildCard();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `irantify-story-${story?.id}.png`;
      a.click();
      p.onToast(t("shareDone"));
      setSheet("none");
      return;
    }
    const enc = encodeURIComponent(`${shareText}\n${shareUrl}`);
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${enc}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${enc}`,
    };
    if (target === "native" && navigator.share) {
      try {
        await navigator.share({ title: shareText, text: shareText, url: shareUrl });
      } catch {
        /* cancelled */
      }
      setSheet("none");
      return;
    }
    if (urls[target]) window.open(urls[target], "_blank", "noopener");
    setSheet("none");
  };

  if (!story || !theme) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-950">
      <div
        className="relative h-full w-full max-w-md overflow-hidden select-none"
        style={{ background: theme.css }}
        onPointerDown={() => setHeld(true)}
        onPointerUp={() => setHeld(false)}
        onPointerLeave={() => setHeld(false)}
      >
        {/* بصری‌ساز پس‌زمینه */}
        <BgEqualizer hue={track?.hue ?? 174} active={isCurrent && p.isPlaying && !held} />

        {/* نوارهای پیشرفت */}
        <div className="absolute inset-x-3 top-3 z-20 flex gap-1.5">
          {stories.map((s, i) => (
            <div key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-white/95"
                style={{ width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%" }}
              />
            </div>
          ))}
        </div>

        {/* سربرگ */}
        <div className="absolute inset-x-0 top-8 z-20 flex items-center gap-3 px-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/60 bg-black/20 text-xl backdrop-blur-sm">
            {story.userAvatar.startsWith("data:") ? (
              <img src={story.userAvatar} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              story.userAvatar
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-extrabold text-white drop-shadow">
              {story.userName}
              {story.userIsArtist && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold backdrop-blur-sm">{t("artistBadge")}</span>
              )}
            </p>
            <p className="font-mono text-[10px] text-white/70">
              {timeAgo(story.ts, lang)} · {story.isVideo ? t("video") : t("audioBadge")}
            </p>
          </div>
          <button onClick={p.onClose} className="rounded-full bg-black/25 p-2 text-white backdrop-blur-sm transition-transform active:scale-90">
            <IconX size={18} />
          </button>
        </div>

        {/* مرکز: اطلاعات اثر */}
        <div className="absolute inset-x-0 bottom-40 z-20 px-6 text-center">
          {story.isVideo && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
              <IconVideo size={12} /> {t("videoNow")}
            </span>
          )}
          <h2 className="font-display text-3xl leading-snug text-white drop-shadow-lg">{track?.title ?? "—"}</h2>
          {story.caption && <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-white/90">{story.caption}</p>}
          <button
            onClick={() => p.onPlayTrack(story.trackId)}
            className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-night-950 shadow-xl transition-all active:scale-95"
          >
            {isCurrent && p.isPlaying ? <IconPause size={16} /> : <IconPlay size={16} />}
            {isCurrent && p.isPlaying ? t("pause") : t("play")}
          </button>
        </div>

        {/* اکشن‌بار */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent px-4 pb-8 pt-10">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onFocus={() => setSheet("comment")}
            placeholder={p.user ? t("writeComment") : t("commentLogin")}
            readOnly={!p.user}
            className="h-11 min-w-0 flex-1 rounded-full border border-white/25 bg-black/25 px-4 text-sm text-white outline-none backdrop-blur-sm placeholder:text-white/60 focus:border-white/60"
          />
          <button onClick={() => requireAuth(() => p.onLike(story.id))} className="transition-transform active:scale-90">
            <IconHeart size={26} filled={liked} className={liked ? "text-[#ff5c7a]" : "text-white"} />
          </button>
          <button onClick={() => setSheet("comment")} className="transition-transform active:scale-90">
            <IconComment size={25} className="text-white" />
          </button>
          <button onClick={() => requireAuth(() => p.onSave(story.id))} className="transition-transform active:scale-90">
            <IconBookmark size={24} filled={saved} className={saved ? "text-saffron" : "text-white"} />
          </button>
          <button onClick={() => setSheet("share")} className="transition-transform active:scale-90">
            <IconShare size={24} className="text-white" />
          </button>
        </div>

        {/* شمارندهٔ لایک/کامنت */}
        <div className="absolute bottom-24 z-20 flex w-full items-center justify-center gap-4 text-[11px] font-bold text-white/90">
          <span className="flex items-center gap-1">
            <IconHeart size={13} filled className="text-[#ff5c7a]" /> {num(story.likes.length)} {t("likesWord")}
          </span>
          <span className="flex items-center gap-1">
            <IconComment size={13} /> {num(story.comments.length)}
          </span>
        </div>

        {/* ناحیهٔ ناوبری */}
        <button aria-label="prev" onClick={() => index > 0 && p.onNavigate(index - 1)} className="absolute inset-y-0 start-0 z-10 w-1/3" />
        <button aria-label="next" onClick={() => (index < stories.length - 1 ? p.onNavigate(index + 1) : p.onClose())} className="absolute inset-y-0 end-0 z-10 w-1/3" />
      </div>

      {/* شیت کامنت‌ها */}
      {sheet === "comment" && (
        <div className="absolute inset-x-0 bottom-0 z-30 mx-auto max-w-md">
          <div className="animate-rise rounded-t-3xl border-t border-foam/10 bg-night-900/98 p-4 shadow-2xl backdrop-blur-xl" dir={lang === "fa" ? "rtl" : "ltr"}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-foam">{t("comments")} · {num(story.comments.length)}</h3>
              <button onClick={() => setSheet("none")} className="text-mist"><IconX size={16} /></button>
            </div>
            <div className="slim-scroll max-h-56 space-y-3 overflow-y-auto">
              {story.comments.length === 0 && <p className="py-4 text-center text-xs text-dim">{t("noComments")}</p>}
              {story.comments.map((cm) => (
                <div key={cm.id} className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-night-700 text-sm">{cm.avatar}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foam">{cm.name}</p>
                    <p className="text-xs leading-5 text-mist">{cm.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                placeholder={t("yourComment")}
                className="h-10 flex-1 rounded-full border border-foam/12 bg-night-850 px-4 text-xs text-foam outline-none focus:border-turq"
              />
              <button onClick={submitComment} className="flex h-10 w-10 items-center justify-center rounded-full bg-turq text-night-950 transition-transform active:scale-90">
                <IconSend size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* شیت اشتراک */}
      {sheet === "share" && (
        <div className="absolute inset-x-0 bottom-0 z-30 mx-auto max-w-md" dir={lang === "fa" ? "rtl" : "ltr"}>
          <div className="animate-rise rounded-t-3xl border-t border-foam/10 bg-night-900/98 p-5 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-foam">{t("shareTo")}</h3>
              <button onClick={() => setSheet("none")} className="text-mist"><IconX size={16} /></button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <ShareBtn emoji="💬" label={t("whatsapp")} onClick={() => doShare("whatsapp")} />
              <ShareBtn emoji="✈️" label={t("telegram")} onClick={() => doShare("telegram")} />
              <ShareBtn emoji="📷" label={t("instagram")} onClick={() => doShare("download")} />
              <ShareBtn emoji="🐦" label={t("twitter")} onClick={() => doShare("twitter")} />
              <ShareBtn emoji="🔗" label={t("copyLink")} onClick={() => doShare("copy")} />
              <ShareBtn emoji="⬇️" label={t("downloadCard")} onClick={() => doShare("download")} />
              <ShareBtn emoji="📤" label={t("share")} onClick={() => doShare("native")} />
              <ShareBtn emoji="🎵" label={t("listenOnApp")} onClick={() => { p.onPlayTrack(story.trackId); setSheet("none"); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShareBtn({ emoji, label, onClick }: { emoji: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 rounded-2xl border border-foam/8 bg-night-850 py-3 transition-all duration-150 hover:border-turq/40 active:scale-90">
      <span className="text-2xl">{emoji}</span>
      <span className="text-[10px] font-bold text-mist">{label}</span>
    </button>
  );
}

function wrapText(c: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line + w + " ";
    if (c.measureText(test).width > maxW && line) {
      c.fillText(line.trim(), x, yy);
      line = w + " ";
      yy += lh;
    } else line = test;
  }
  c.fillText(line.trim(), x, yy);
}

function timeAgo(ts: number, lang: string): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return lang === "fa" ? "همین حالا" : "just now";
  if (m < 60) return lang === "fa" ? `${num(m)} دقیقه پیش` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return lang === "fa" ? `${num(h)} ساعت پیش` : `${h}h ago`;
  return lang === "fa" ? `${num(Math.floor(h / 24))} روز پیش` : `${Math.floor(h / 24)}d ago`;
}

/** اکولایزر متحرک پس‌زمینهٔ استوری */
function BgEqualizer({ hue, active }: { hue: number; active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const c = cv.getContext("2d")!;
    let raf = 0;
    const resize = () => {
      cv.width = cv.clientWidth * 2;
      cv.height = cv.clientHeight * 2;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    const N = 40;
    const levels = new Array(N).fill(0.2);
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const W = cv.width;
      const H = cv.height;
      c.clearRect(0, 0, W, H);
      const bw = W / N;
      for (let i = 0; i < N; i++) {
        const target = active ? 0.15 + 0.75 * Math.abs(Math.sin(i * 0.7 + now * 0.004)) * Math.abs(Math.sin(now * 0.0013 + i)) : 0.08 + 0.05 * Math.sin(i + now * 0.001);
        levels[i] += (target - levels[i]) * 0.12;
        const h = levels[i] * H * 0.42;
        c.fillStyle = `hsla(${hue + (i / N) * 40}, 85%, 65%, 0.5)`;
        c.fillRect(i * bw + bw * 0.22, H * 0.72 - h, bw * 0.56, h);
        c.globalAlpha = 0.4;
        c.fillRect(i * bw + bw * 0.22, H * 0.72 + 8, bw * 0.56, h * 0.3);
        c.globalAlpha = 1;
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [hue, active]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full opacity-70" />;
}

export { uid as _storyUid };
