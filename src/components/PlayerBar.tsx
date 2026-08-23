import { useEffect, useRef } from "react";
import type { VizMode } from "../lib/audio";
import { VIZ_MODES } from "../lib/audio";
import type { TrackRuntime } from "../lib/catalog";
import { artistById, faNum, faTime } from "../lib/catalog";
import { EqGlyph, Monogram, Spinner } from "./views";
import Visualizer from "./Visualizer";
import WaveformBar from "./WaveformBar";
import {
  IconHeart,
  IconMute,
  IconNext,
  IconPause,
  IconPlay,
  IconPrev,
  IconQueue,
  IconRepeat,
  IconShuffle,
  IconStory,
  IconUpload,
  IconVolume,
  IconX,
} from "./icons";

interface Props {
  current: TrackRuntime | null;
  playing: boolean;
  loading: boolean;
  audio: HTMLAudioElement;
  analyser: AnalyserNode | null;
  shuffle: boolean;
  repeat: "off" | "all" | "one";
  liked: Set<string>;
  volume: number;
  muted: boolean;
  vizMode: VizMode;
  showQueue: boolean;
  queueTracks: TrackRuntime[];
  queueIndex: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onLike: (id: string) => void;
  onVolume: (v: number) => void;
  onToggleMute: () => void;
  onVizMode: (m: VizMode) => void;
  onToggleQueue: () => void;
  onSelectQueue: (i: number) => void;
  onRemoveQueue: (i: number) => void;
  onOpenStory: () => void;
  onUpload: () => void;
}

export default function PlayerBar(p: Props) {
  const curT = useRef<HTMLSpanElement>(null);
  const durT = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (curT.current) curT.current.textContent = faTime(p.audio.currentTime || 0);
      if (durT.current) durT.current.textContent = faTime(p.audio.duration || p.current?.duration || 0);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [p.audio, p.current]);

  const h = p.current?.hue ?? 174;
  const artist = p.current ? artistById(p.current.artistId) : undefined;
  const peaks = p.current?.peaks ?? new Array(90).fill(0.12) as number[];
  const isLiked = p.current ? p.liked.has(p.current.id) : false;
  const hasTrack = !!p.current;

  return (
    <div className="relative z-40 border-t border-foam/10 bg-night-900/95 backdrop-blur-md">
      {/* پنل صف پخش */}
      {p.showQueue && (
        <div className="animate-rise absolute bottom-full left-2 z-50 mb-2 w-[min(92vw,340px)] overflow-hidden rounded-xl border border-foam/12 bg-night-850/95 shadow-2xl shadow-black/60 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-foam/8 px-4 py-3">
            <h4 className="flex items-center gap-2 font-display text-base text-foam">
              <IconQueue size={15} className="text-turq" /> صف پخش
              <span className="font-mono text-[10px] text-dim">{faNum(p.queueTracks.length)} اثر</span>
            </h4>
            <button
              onClick={p.onToggleQueue}
              aria-label="بستن صف"
              className="rounded-full p-1.5 text-dim transition-colors hover:bg-coral/15 hover:text-coral"
            >
              <IconX size={14} />
            </button>
          </div>
          <ul className="slim-scroll max-h-[46dvh] overflow-y-auto p-1.5">
            {p.queueTracks.length === 0 && (
              <li className="px-4 py-8 text-center text-xs text-dim">صف خالی است — اثری را پخش کن.</li>
            )}
            {p.queueTracks.map((t, i) => (
              <li key={`${t.id}-${i}`}>
                <button
                  onClick={() => p.onSelectQueue(i)}
                  className={`group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-right transition-colors duration-150 ${
                    i === p.queueIndex ? "bg-night-700/70" : "hover:bg-foam/5"
                  }`}
                >
                  <span className="w-5 text-center">
                    {i === p.queueIndex ? <EqGlyph active={p.playing} color="#35d5bd" /> : <span className="font-mono text-[10px] text-dim">{faNum(i + 1)}</span>}
                  </span>
                  <span
                    className="h-8 w-8 shrink-0 rounded-md"
                    style={{ background: `linear-gradient(135deg, hsl(${t.hue} 70% 55%), hsl(${t.hue + 30} 65% 40%))` }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-xs font-bold ${i === p.queueIndex ? "text-turq" : "text-foam"}`}>{t.title}</span>
                    <span className="block truncate text-[10.5px] text-mist">{t.uploaded ? "فایل شما" : artistById(t.artistId)?.name}</span>
                  </span>
                  <span className="font-mono text-[10px] text-dim">{faTime(t.duration)}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="حذف از صف"
                    onClick={(e) => {
                      e.stopPropagation();
                      p.onRemoveQueue(i);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && p.onRemoveQueue(i)}
                    className="rounded p-1 text-dim opacity-0 transition-all hover:bg-coral/15 hover:text-coral group-hover:opacity-100 [li:hover_&]:opacity-100"
                  >
                    <IconX size={12} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mx-auto grid max-w-[1500px] grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-3 py-3 sm:grid-cols-[minmax(0,280px)_1fr_minmax(0,280px)] sm:px-5">
        {/* اطلاعات اثر */}
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-foam/10" style={{ background: `linear-gradient(135deg, hsl(${h} 55% 20%), hsl(${h} 60% 9%))` }}>
            <Visualizer analyser={p.analyser} mode="bars" playing={p.playing} hue={h} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foam">{p.current?.title ?? "ایران‌تیفای"}</p>
            <p className="truncate text-[11.5px] text-mist">
              {p.current ? (p.current.uploaded ? "فایل آپلودشدهٔ شما" : artist?.name ?? "—") : "اثری را برای پخش انتخاب کن"}
            </p>
          </div>
          {p.current && (
            <button
              onClick={() => {
                const id = p.current?.id;
                if (id) p.onLike(id);
              }}
              aria-label="علاقه‌مندی"
              className={`hidden shrink-0 rounded-full p-2 transition-all duration-200 active:scale-75 sm:block ${isLiked ? "text-coral" : "text-dim hover:text-coral"}`}
            >
              <IconHeart size={16} filled={isLiked} />
            </button>
          )}
        </div>

        {/* کنترل‌ها + موج */}
        <div className="col-span-2 order-3 flex flex-col items-center gap-1 sm:order-none sm:col-span-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={p.onToggleShuffle}
              aria-label="پخش تصادفی"
              title="پخش تصادفی"
              className={`rounded-full p-2 transition-all duration-200 active:scale-90 ${p.shuffle ? "bg-turq/15 text-turq" : "text-dim hover:text-foam"}`}
            >
              <IconShuffle size={15} />
            </button>
            <button
              onClick={p.onPrev}
              disabled={!hasTrack}
              aria-label="اثر قبلی"
              className="-scale-x-100 rounded-full p-2 text-mist transition-all duration-200 hover:scale-110 hover:text-foam active:scale-95 disabled:opacity-30"
            >
              <IconPrev size={18} />
            </button>
            <button
              onClick={p.onTogglePlay}
              disabled={!hasTrack || p.loading}
              aria-label={p.playing ? "توقف" : "پخش"}
              className="mx-1 flex h-11 w-11 items-center justify-center rounded-full bg-foam text-night-950 shadow-lg shadow-black/40 transition-all duration-200 hover:scale-108 hover:bg-turq active:scale-95 disabled:opacity-40"
            >
              {p.loading ? <Spinner /> : p.playing ? <IconPause size={19} /> : <IconPlay size={19} className="-translate-x-px" />}
            </button>
            <button
              onClick={p.onNext}
              disabled={!hasTrack}
              aria-label="اثر بعدی"
              className="-scale-x-100 rounded-full p-2 text-mist transition-all duration-200 hover:scale-110 hover:text-foam active:scale-95 disabled:opacity-30"
            >
              <IconNext size={18} />
            </button>
            <button
              onClick={p.onCycleRepeat}
              aria-label="تکرار"
              title={p.repeat === "off" ? "تکرار خاموش" : p.repeat === "all" ? "تکرار همه" : "تکرار یک اثر"}
              className={`relative rounded-full p-2 transition-all duration-200 active:scale-90 ${p.repeat !== "off" ? "bg-turq/15 text-turq" : "text-dim hover:text-foam"}`}
            >
              <IconRepeat size={15} />
              {p.repeat === "one" && (
                <span className="absolute -left-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-turq font-mono text-[8px] font-bold text-night-950">
                  ۱
                </span>
              )}
            </button>
          </div>
          <div className="flex w-full max-w-[620px] items-center gap-2.5">
            <span ref={curT} className="w-9 shrink-0 text-center font-mono text-[10.5px] text-turq">
              {faTime(0)}
            </span>
            <div className="min-w-0 flex-1">
              <WaveformBar peaks={peaks} audio={p.audio} hue={h} disabled={!hasTrack} />
            </div>
            <span ref={durT} className="w-9 shrink-0 text-center font-mono text-[10.5px] text-dim">
              {faTime(p.current?.duration ?? 0)}
            </span>
          </div>
        </div>

        {/* ابزارهای کناری */}
        <div className="row-span-2 flex flex-col items-start justify-center gap-2 sm:row-span-1 sm:flex-row sm:items-center sm:justify-end">
          <button
            onClick={p.onOpenStory}
            disabled={!hasTrack}
            className="flex items-center gap-2 rounded-full border border-turq/45 px-4 py-2 text-xs font-extrabold text-turq transition-all duration-200 hover:scale-105 hover:bg-turq hover:text-night-950 hover:shadow-lg hover:shadow-turq/25 active:scale-95 disabled:opacity-35 disabled:hover:scale-100"
          >
            <IconStory size={15} /> استوری
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-full border border-foam/10 p-1 md:flex" role="group" aria-label="حالت بصری‌ساز">
              {VIZ_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => p.onVizMode(m.id)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all duration-200 ${
                    p.vizMode === m.id ? "bg-saffron text-night-950" : "text-dim hover:text-saffron"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <button
              onClick={p.onToggleQueue}
              aria-label="صف پخش"
              title="صف پخش"
              className={`rounded-full p-2 transition-all duration-200 active:scale-90 ${p.showQueue ? "bg-turq/15 text-turq" : "text-dim hover:text-foam"}`}
            >
              <IconQueue size={16} />
            </button>
            <button
              onClick={p.onUpload}
              aria-label="آپلود صدا"
              title="آپلود فایل صوتی"
              className="rounded-full p-2 text-dim transition-all duration-200 hover:rotate-6 hover:text-turq active:scale-90"
            >
              <IconUpload size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={p.onToggleMute}
              aria-label={p.muted ? "بازکردن صدا" : "بی‌صدا"}
              className="rounded-full p-1.5 text-mist transition-colors hover:text-foam"
            >
              {p.muted || p.volume === 0 ? <IconMute size={16} /> : <IconVolume size={16} />}
            </button>
            <div dir="ltr" className="hidden w-24 sm:block">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={p.muted ? 0 : p.volume}
                onChange={(e) => p.onVolume(Number(e.target.value))}
                className="deck-range w-full"
                style={{ "--fill": `${(p.muted ? 0 : p.volume) * 100}%` } as React.CSSProperties}
                aria-label="بلندی صدا"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
