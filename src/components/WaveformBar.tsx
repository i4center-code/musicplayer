import { useEffect, useRef, useState } from "react";
import { faTime } from "../lib/catalog";

interface Props {
  peaks: number[];
  audio: HTMLAudioElement;
  hue: number;
  disabled?: boolean;
}

/** موجِ قابل‌کشیدن — در چیدمان راست‌به‌چپ، زمان از راست به چپ جاری می‌شود. */
export default function WaveformBar({ peaks, audio, hue, disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const [dragRatio, setDragRatio] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    const ro = new ResizeObserver(() => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.max(1, W * dpr);
      canvas.height = Math.max(1, H * dpr);
    });
    ro.observe(canvas);

    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (W === 0) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const dur = audio.duration || 1;
      // RTL: زمانِ سپری‌شده از سمت راست پر می‌شود
      const ratio = Math.min(1, Math.max(0, audio.currentTime / dur));
      const px = (1 - ratio) * W;
      const n = peaks.length;
      const bw = W / n;
      const mid = H / 2;
      for (let i = 0; i < n; i++) {
        const x = i * bw;
        const played = x + bw / 2 >= px;
        const v = peaks[i];
        const bh = Math.max(2, v * (H * 0.92));
        if (played) {
          ctx.fillStyle = `hsl(${hue + (1 - i / n) * 30}, 82%, ${54 + v * 10}%)`;
          ctx.globalAlpha = 0.95;
        } else {
          ctx.fillStyle = "rgba(163, 189, 181, 0.3)";
          ctx.globalAlpha = 1;
        }
        ctx.fillRect(x + Math.max(0.5, bw * 0.15), mid - bh / 2, Math.max(1, bw * 0.7), bh);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(236, 246, 242, 0.9)";
      ctx.fillRect(px - 0.5, 2, 1, H - 4);
      const knob = ctx.createRadialGradient(px, mid, 0, px, mid, 10);
      knob.addColorStop(0, `hsla(${hue}, 90%, 62%, 0.9)`);
      knob.addColorStop(1, "transparent");
      ctx.fillStyle = knob;
      ctx.beginPath();
      ctx.arc(px, mid, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0b1514";
      ctx.beginPath();
      ctx.arc(px, mid, 2.6, 0, Math.PI * 2);
      ctx.fill();
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [peaks, hue, audio]);

  const ratioAt = (clientX: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return 0;
    const rect = wrap.getBoundingClientRect();
    return Math.min(1, Math.max(0, (rect.right - clientX) / rect.width));
  };

  const seek = (clientX: number) => {
    if (disabled) return;
    const r = ratioAt(clientX);
    const dur = audio.duration;
    if (Number.isFinite(dur) && dur > 0) {
      audio.currentTime = r * dur;
      setDragTime(r * dur);
      setDragRatio(r);
    }
  };

  return (
    <div
      ref={wrapRef}
      className={`group relative h-12 ${disabled ? "opacity-40" : "cursor-pointer"}`}
      onPointerDown={(e) => {
        if (disabled) return;
        draggingRef.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        seek(e.clientX);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) seek(e.clientX);
      }}
      onPointerUp={() => {
        draggingRef.current = false;
        setTimeout(() => setDragTime(null), 350);
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
        setDragTime(null);
      }}
      role="slider"
      aria-label="موقعیت پخش"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {dragTime !== null && (
        <div
          className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded border border-turq/40 bg-night-950 px-2 py-0.5 font-mono text-[11px] text-turq shadow-lg shadow-black/50"
          style={{ left: `${(1 - dragRatio) * 100}%` }}
        >
          {faTime(dragTime)}
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-foam/5" />
    </div>
  );
}
