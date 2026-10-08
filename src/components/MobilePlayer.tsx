import { useEffect, useRef, useState } from "react";
import { genreLabel, t, time as fmtTime, useT } from "../lib/i18n";
import { isVideoTrack } from "../lib/state";
import type { TrackRuntime } from "../lib/catalog";
import { artistById } from "../lib/catalog";
import Visualizer from "./Visualizer";
import type { VizMode } from "../lib/audio";
import {
  IconEq,
  IconNext,
  IconPause,
  IconPlay,
  IconPrev,
  IconRepeat,
  IconShuffle,
  IconStory,
  IconVideo,
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
  vizMode: VizMode;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onVizMode: (m: VizMode) => void;
  onOpenStory: () => void;
  onOpenEq: () => void;
}

export default function MobilePlayer(p: Props) {
  const { lang } = useT();
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      setCur(p.audio.currentTime || 0);
      setDur(Number.isFinite(p.audio.duration) ? p.audio.duration : 0);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [p.audio]);

  if (!p.current) return null;
  const tr = p.current;
  const artist = artistById(tr.artistId);
  const isVid = isVideoTrack(tr.id);
  const pct = dur > 0 ? (cur / dur) * 100 : 0;

  /* ---------- نوار مینی ---------- */
  if (!open) {
    return (
      <div className="relative z-30 border-t border-foam/8 bg-night-900/95 px-3 pb-2 pt-1.5 backdrop-blur-xl">
        <div className="absolute inset-x-3 top-0 h-[2.5px] overflow-hidden rounded-full bg-foam/8">
          <div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${pct}%`, background: `linear-gradient(90deg, hsl(${tr.hue} 80% 55%), #35d5bd)` }} />
        </div>
        <button onClick={() => setOpen(true)} className="flex w-full items-center gap-3 py-1 text-start">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl" style={{ background: `linear-gradient(135deg, hsl(${tr.hue} 72% 46%), hsl(${tr.hue + 40} 68% 28%))` }}>
            {isVid ? <IconVideo size={17} className="text-white" /> : <EqBars playing={p.playing} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-extrabold text-foam">{tr.title}</span>
            <span className="block truncate text-[10px] text-mist">{artist?.name ?? t("yourUploads")} · {genreLabel(tr.genre)}</span>
          </span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              p.onTogglePlay();
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-turq text-night-950 shadow-lg shadow-turq/25 transition-transform active:scale-90"
          >
            {p.loading ? <Spin /> : p.playing ? <IconPause size={17} /> : <IconPlay size={17} className="ms-0.5" />}
          </span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              p.onNext();
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-mist transition-colors hover:text-foam active:scale-90"
          >
            <IconNext size={16} />
          </span>
        </button>
      </div>
    );
  }

  /* ---------- شیت تمام ---------- */
  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-night-950 text-foam">
      {/* پس‌زمینه */}
      <div className="absolute inset-0 opacity-40">
        <Visualizer analyser={p.analyser} mode={p.vizMode} playing={p.playing} hue={tr.hue} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-night-950/40 via-transparent to-night-950/90" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col px-6 pb-6 pt-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setOpen(false)} className="rounded-full bg-black/25 p-2 text-foam backdrop-blur-sm active:scale-90" aria-label="collapse">
            <IconX size={18} />
          </button>
          <p className="text-[11px] font-extrabold tracking-wide text-mist">
            {isVid ? t("videoNow") : t("nowPlaying")}
            {isVid && <IconVideo size={12} className="ms-1.5 inline text-saffron" />}
          </p>
          <button onClick={p.onOpenEq} className="rounded-full bg-black/25 p-2 text-saffron backdrop-blur-sm active:scale-90" aria-label="eq">
            <IconEq size={17} />
          </button>
        </div>

        {/* کاور */}
        <div className="flex flex-1 items-center justify-center">
          <div
            className={`relative flex aspect-square w-[78%] items-center justify-center overflow-hidden rounded-[2rem] shadow-2xl transition-transform duration-500 ${p.playing ? "scale-100" : "scale-90"}`}
            style={{ background: `linear-gradient(140deg, hsl(${tr.hue} 70% 42%), hsl(${tr.hue + 45} 65% 22%))` }}
          >
            <div className="girih absolute inset-0 opacity-20" />
            <div className="absolute inset-0 opacity-60">
              <Visualizer analyser={p.analyser} mode={p.vizMode === "bars" ? "orbit" : p.vizMode} playing={p.playing} hue={tr.hue} />
            </div>
            <span className="relative z-10 text-7xl drop-shadow-2xl">{isVid ? "🎬" : "🎵"}</span>
            {p.loading && (
              <span className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <Spin big />
              </span>
            )}
          </div>
        </div>

        <div className="text-center">
          <h2 className="font-display truncate text-2xl">{tr.title}</h2>
          <p className="mt-1 text-sm text-mist">{artist?.name ?? t("yourUploads")} · {genreLabel(tr.genre)}</p>
        </div>

        {/* اسلایدر */}
        <div className="mt-5">
          <input
            type="range"
            dir="ltr"
            min={0}
            max={dur || 1}
            step={0.1}
            value={Math.min(cur, dur || 1)}
            onChange={(e) => {
              p.audio.currentTime = Number(e.target.value);
            }}
            className="deck-range w-full"
            style={{ ["--fill" as string]: `${pct}%` }}
          />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-dim" dir="ltr">
            <span>{fmtTime(cur)}</span>
            <span>{fmtTime(dur)}</span>
          </div>
        </div>

        {/* کنترل‌ها */}
        <div className="mt-3 flex items-center justify-center gap-5">
          <button onClick={p.onToggleShuffle} className={`transition-all active:scale-90 ${p.shuffle ? "text-turq" : "text-dim"}`} aria-label="shuffle">
            <IconShuffle size={20} />
          </button>
          <button onClick={p.onPrev} className="text-foam transition-transform active:scale-90" aria-label="prev">
            <IconPrev size={26} />
          </button>
          <button onClick={p.onTogglePlay} className="flex h-16 w-16 items-center justify-center rounded-full bg-turq text-night-950 shadow-2xl shadow-turq/30 transition-all hover:brightness-110 active:scale-90" aria-label="play">
            {p.playing ? <IconPause size={26} /> : <IconPlay size={26} className="ms-1" />}
          </button>
          <button onClick={p.onNext} className="text-foam transition-transform active:scale-90" aria-label="next">
            <IconNext size={26} />
          </button>
          <button onClick={p.onCycleRepeat} className={`relative transition-all active:scale-90 ${p.repeat !== "off" ? "text-turq" : "text-dim"}`} aria-label="repeat">
            <IconRepeat size={20} />
            {p.repeat === "one" && <span className="absolute -top-1.5 -end-1 rounded-full bg-turq px-1 font-mono text-[8px] font-bold text-night-950">1</span>}
          </button>
        </div>

        {/* ردیف ابزار */}
        <div className="mt-5 flex items-center justify-center gap-2.5">
          <VizToggle mode="bars" label="▮▮" active={p.vizMode === "bars"} onClick={() => p.onVizMode("bars")} />
          <VizToggle mode="orbit" label="◎" active={p.vizMode === "orbit"} onClick={() => p.onVizMode("orbit")} />
          <VizToggle mode="pulse" label="∿" active={p.vizMode === "pulse"} onClick={() => p.onVizMode("pulse")} />
          <span className="mx-1 h-5 w-px bg-foam/12" />
          <button onClick={p.onOpenStory} className="flex items-center gap-1.5 rounded-full bg-saffron px-4 py-2 text-xs font-extrabold text-night-950 shadow-lg shadow-saffron/25 transition-all hover:brightness-110 active:scale-95">
            <IconStory size={15} /> {t("storyBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}

function VizToggle({ label, active, onClick }: { mode: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`h-9 w-9 rounded-full border font-mono text-sm transition-all active:scale-90 ${active ? "border-turq bg-turq/15 text-turq" : "border-foam/12 text-dim"}`}>
      {label}
    </button>
  );
}

function EqBars({ playing }: { playing: boolean }) {
  return (
    <span className="flex h-4 items-end gap-[3px]">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`w-[3.5px] origin-bottom rounded-full bg-white ${["animate-eq-1", "animate-eq-2", "animate-eq-3"][i]} ${playing ? "" : "[animation-play-state:paused] [transform:scaleY(0.3)]"}`} />
      ))}
    </span>
  );
}

function Spin({ big }: { big?: boolean }) {
  return <span className={`animate-spin rounded-full border-2 border-white/25 border-t-white ${big ? "h-10 w-10" : "h-5 w-5"}`} />;
}
