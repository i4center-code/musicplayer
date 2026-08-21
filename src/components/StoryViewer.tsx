import { useEffect, useRef, useState } from "react";
import type { TrackRuntime } from "../lib/catalog";
import { artistById, faNum } from "../lib/catalog";
import Visualizer from "./Visualizer";
import { IconDownload, IconPause, IconPlay, IconShare, IconX, Logo } from "./icons";

interface Props {
  items: TrackRuntime[];
  index: number;
  playing: boolean;
  analyser: AnalyserNode | null;
  onNavigate: (i: number) => void;
  onClose: () => void;
  onTogglePlay: () => void;
  onHold: (hold: boolean) => void;
  onShare: (t: TrackRuntime) => Promise<void> | void;
}

const STORY_SECONDS = 15;

function drawGirihStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeRect(-r, -r, r * 2, r * 2);
  ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-r, -r, r * 2, r * 2);
  ctx.restore();
}

function wrapTitle(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines = 3): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines) break;
    } else cur = test;
  }
  if (lines.length < maxLines && cur) lines.push(cur);
  return lines;
}

/** کارت استوری ۹:۱۶ — خروجی PNG با کیفیت برای اشتراک‌گذاری. */
async function exportStoryCard(track: TrackRuntime): Promise<Blob> {
  await document.fonts.ready.catch(() => undefined);
  const W = 1080;
  const H = 1920;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const h = track.hue;

  const bg = ctx.createLinearGradient(0, 0, W * 0.3, H);
  bg.addColorStop(0, `hsl(${h} 42% 15%)`);
  bg.addColorStop(0.55, `hsl(${h} 50% 8%)`);
  bg.addColorStop(1, "#070f0e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, H * 0.3, 40, W / 2, H * 0.3, 900);
  glow.addColorStop(0, `hsla(${h} 85% 55% / 0.35)`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(236, 246, 242, 0.06)";
  ctx.lineWidth = 2;
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 5; x++) drawGirihStar(ctx, 120 + x * 210, 120 + y * 240, 46);

  // سربرگ برند
  ctx.textAlign = "center";
  ctx.fillStyle = "#35d5bd";
  ctx.font = "700 58px Lalezar, Vazirmatn, sans-serif";
  ctx.fillText("ایران‌تیفای", W / 2, 170);
  ctx.fillStyle = "rgba(236, 246, 242, 0.55)";
  ctx.font = "500 30px 'JetBrains Mono', monospace";
  ctx.fillText("IRANTIFY · STORY", W / 2, 222);

  // عنوان اثر
  ctx.fillStyle = "#ecf6f2";
  ctx.font = "400 128px Lalezar, Vazirmatn, sans-serif";
  const lines = wrapTitle(ctx, track.title, W - 180);
  const lineH = 150;
  const startY = 880 - ((lines.length - 1) * lineH) / 2;
  lines.forEach((ln, i) => ctx.fillText(ln, W / 2, startY + i * lineH));

  const artist = artistById(track.artistId)?.name ?? "شما";
  ctx.fillStyle = `hsl(${h} 70% 70%)`;
  ctx.font = "600 56px Vazirmatn, sans-serif";
  ctx.fillText(artist, W / 2, startY + lines.length * lineH + 40);

  // برچسب‌ها
  const chips = [track.genre, track.dastgah !== "—" ? track.dastgah : null, `۱۰۸۰×۱۹۲۰`].filter(Boolean) as string[];
  const chipY = startY + lines.length * lineH + 150;
  ctx.font = "600 38px Vazirmatn, sans-serif";
  const widths = chips.map((ch) => ctx.measureText(ch).width + 70);
  const totalW = widths.reduce((s, w) => s + w, 0) + 24 * (chips.length - 1);
  let cx = W / 2 - totalW / 2;
  ctx.textAlign = "left";
  chips.forEach((ch, i) => {
    const w = widths[i];
    ctx.fillStyle = "rgba(236, 246, 242, 0.08)";
    ctx.beginPath();
    ctx.roundRect(cx, chipY - 52, w, 76, 38);
    ctx.fill();
    ctx.strokeStyle = `hsla(${h} 70% 60% / 0.6)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#ecf6f2";
    ctx.fillText(ch, cx + 35, chipY + 2);
    cx += w + 24;
  });

  // نوارهای صوتی از قلّه‌های واقعی اثر
  const bars = 56;
  const bw = (W - 200) / bars;
  const peaks = track.peaks ?? [];
  for (let i = 0; i < bars; i++) {
    const v = peaks[Math.floor((i / bars) * peaks.length)] ?? 0.2;
    const bh = 24 + v * 260;
    ctx.fillStyle = `hsla(${h + (i / bars) * 40} 85% 60% / ${0.35 + v * 0.6})`;
    ctx.fillRect(100 + i * bw + 2, 1620 - bh / 2, bw - 5, bh);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(236, 246, 242, 0.7)";
  ctx.font = "500 36px Vazirmatn, sans-serif";
  ctx.fillText("این اثر را در ایران‌تیفای گوش کن ♪", W / 2, 1830);

  return new Promise((resolve, reject) => {
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), "image/png");
  });
}

export default function StoryViewer({ items, index, playing, analyser, onNavigate, onClose, onTogglePlay, onHold, onShare }: Props) {
  const [progress, setProgress] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [held, setHeld] = useState(false);
  const live = useRef({ playing, index, count: items.length });
  live.current = { playing, index, count: items.length };

  useEffect(() => setProgress(0), [index]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = (now - last) / 1000;
      last = now;
      if (!live.current.playing || held) return;
      setProgress((p) => {
        const next = p + dt / STORY_SECONDS;
        if (next >= 1) {
          const i = live.current.index;
          if (i < live.current.count - 1) onNavigate(i + 1);
          else onClose();
          return 0;
        }
        return next;
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [held, onNavigate, onClose]);

  const track = items[index];
  if (!track) return null;
  const artist = artistById(track.artistId);
  const h = track.hue;

  const doShare = async () => {
    setSharing(true);
    try {
      await onShare(track);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-night-950/85 p-4 backdrop-blur-md" onClick={onClose}>
      <div
        className="animate-pop relative h-[min(88dvh,720px)] w-[min(94vw,400px)] overflow-hidden rounded-[26px] border border-foam/12 shadow-2xl shadow-black/70"
        style={{ background: `linear-gradient(165deg, hsl(${h} 40% 16%), hsl(${h} 48% 7%) 60%, #070f0e)` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="girih pointer-events-none absolute inset-0 opacity-60" />
        <div className="absolute inset-0 opacity-80">
          <Visualizer analyser={analyser} mode="orbit" playing={playing && !held} hue={h} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-night-950/70 via-transparent to-night-950/85" />

        {/* نوارهای پیشرفت */}
        <div className="absolute inset-x-4 top-4 z-20 flex gap-1.5">
          {items.map((it, i) => (
            <div key={it.id} className="h-1 flex-1 overflow-hidden rounded-full bg-foam/25">
              <div
                className="h-full rounded-full bg-foam"
                style={{ width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%", transition: "width 0.1s linear" }}
              />
            </div>
          ))}
        </div>

        {/* سربرگ */}
        <div className="absolute inset-x-4 top-8 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-turq">
            <Logo size={22} />
            <span className="font-display text-lg leading-none text-foam">ایران‌تیفای</span>
            <span className="mr-1 rounded-full bg-foam/10 px-2 py-0.5 font-mono text-[9px] tracking-widest text-mist">STORY</span>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن استوری"
            className="rounded-full bg-night-950/50 p-2 text-foam transition-transform duration-200 hover:rotate-90 hover:bg-coral/25 hover:text-coral"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* ناحیه‌های ضربه: قبلی / بعدی */}
        <button aria-label="استوری قبلی" className="absolute inset-y-0 right-0 z-10 w-1/3" onClick={() => index > 0 && onNavigate(index - 1)} />
        <button
          aria-label="استوری بعدی"
          className="absolute inset-y-0 left-0 z-10 w-1/3"
          onClick={() => (index < items.length - 1 ? onNavigate(index + 1) : onClose())}
        />
        {/* نگه‌داشتن = توقف */}
        <button
          aria-label="نگه‌داشتن استوری"
          className="absolute inset-y-0 left-1/3 z-10 w-1/3 cursor-grab active:cursor-grabbing"
          onPointerDown={() => {
            setHeld(true);
            onHold(true);
          }}
          onPointerUp={() => {
            setHeld(false);
            onHold(false);
          }}
          onPointerLeave={() => {
            if (held) {
              setHeld(false);
              onHold(false);
            }
          }}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* محتوای کارت */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <span
              className="relative flex h-12 w-12 items-center justify-center rounded-full font-display text-xl text-night-950"
              style={{ background: `linear-gradient(135deg, hsl(${h} 85% 62%), hsl(${h + 40} 80% 55%))` }}
            >
              {(artist?.name ?? "شما").slice(0, 1)}
              <span className="absolute -inset-1 rounded-full border border-dashed border-foam/40 motion-safe:animate-spin-slow" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foam">{artist?.name ?? "شما"}</p>
              <p className="font-mono text-[10px] tracking-wide text-mist">
                {track.genre} {track.dastgah !== "—" ? `· ${track.dastgah}` : ""} · {faNum(track.year)}
              </p>
            </div>
            {held && (
              <span className="mr-auto rounded-full bg-night-950/70 px-2.5 py-1 font-mono text-[10px] text-saffron">متوقف شد</span>
            )}
          </div>

          <div>
            <h2 className="font-display text-4xl leading-tight text-foam drop-shadow-lg">{track.title}</h2>
            <p className="mt-1 text-xs text-mist">
              آلبوم «{track.album}» · {faNum(track.plays ? Math.round(track.plays / 1000) : 0)} هزار پخش
            </p>
          </div>

          <div className="pointer-events-auto flex items-center gap-2.5">
            <button
              onClick={onTogglePlay}
              className="flex items-center gap-2 rounded-full bg-foam px-5 py-2.5 text-sm font-extrabold text-night-900 shadow-lg shadow-black/40 transition-all duration-200 hover:scale-105 hover:bg-turq active:scale-95"
            >
              {playing ? <IconPause size={16} /> : <IconPlay size={16} />}
              {playing ? "توقف" : "پخش"}
            </button>
            <button
              onClick={doShare}
              disabled={sharing}
              className="flex items-center gap-2 rounded-full border border-turq/50 bg-night-950/50 px-5 py-2.5 text-sm font-bold text-turq backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-turq hover:text-night-950 active:scale-95 disabled:opacity-50"
            >
              {sharing ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-turq border-t-transparent" />
              ) : (
                <IconShare size={16} />
              )}
              {sharing ? "در حال ساخت…" : "اشتراک‌گذاری استوری"}
            </button>
            <button
              onClick={doShare}
              aria-label="دانلود کارت استوری"
              title="دانلود PNG"
              className="rounded-full border border-foam/15 bg-night-950/50 p-2.5 text-mist backdrop-blur transition-all duration-200 hover:border-saffron/60 hover:text-saffron active:scale-90"
            >
              <IconDownload size={16} />
            </button>
          </div>
          <p className="text-center font-mono text-[9.5px] tracking-wide text-dim">
            ضربهٔ چپ/راست برای جابه‌جایی · نگه‌داشتن برای توقف
          </p>
        </div>
      </div>
    </div>
  );
}

export { exportStoryCard };
