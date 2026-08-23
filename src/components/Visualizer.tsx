import { useEffect, useRef } from "react";
import type { VizMode } from "../lib/audio";

interface Props {
  analyser: AnalyserNode | null;
  mode: VizMode;
  playing: boolean;
  hue: number;
  onLevel?: (v: number) => void;
}

/** بومِ زندهٔ ایران‌تیفای — سه حالت: میله‌ای، مداری، موجی؛ در سکوت، نفس می‌کشد. */
export default function Visualizer({ analyser, mode, playing, hue, onLevel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ playing, hue, onLevel });
  live.current = { playing, hue, onLevel };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let needFull = true;
    const ro = new ResizeObserver(() => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.max(1, W * dpr);
      canvas.height = Math.max(1, H * dpr);
      needFull = true;
    });
    ro.observe(canvas);

    const freq = new Uint8Array(1024);
    const wave = new Uint8Array(2048);
    let level = 0;
    let mix = 0;
    let raf = 0;

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      const { playing: isPlaying, hue: h, onLevel: cb } = live.current;
      if (W === 0) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let bass = 0;
      if (analyser) {
        analyser.getByteFrequencyData(freq);
        let sum = 0;
        for (let i = 2; i < 16; i++) sum += freq[i];
        bass = sum / 14 / 255;
        analyser.getByteTimeDomainData(wave);
      }
      level += (bass - level) * 0.22;
      mix += ((isPlaying && analyser ? 1 : 0) - mix) * 0.06;
      cb?.(level * mix);

      const trails = mode !== "bars";
      if (needFull || !trails) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#08100f";
        ctx.fillRect(0, 0, W, H);
        const glow = ctx.createRadialGradient(W / 2, H * 0.95, 10, W / 2, H * 0.95, Math.max(W, H) * 0.7);
        glow.addColorStop(0, `hsla(${h}, 75%, 50%, ${0.06 + level * mix * 0.12})`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
        needFull = false;
      } else {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(8, 16, 15, 0.26)";
        ctx.fillRect(0, 0, W, H);
      }

      const idle = (i: number, n: number) =>
        (0.5 + 0.5 * Math.sin(i * 0.24 + t * 0.0018)) *
          (0.1 + 0.07 * Math.sin(t * 0.0006 + i * 0.06)) +
        0.02 * Math.sin(i * 1.7 + t * 0.004) * (1 - i / n);

      const valueAt = (f: number, i: number, n: number) => {
        const bin = Math.min(1020, 2 + Math.floor(Math.pow(f, 1.55) * 700));
        const real = analyser ? Math.pow(freq[bin] / 255, 1.2) : 0;
        return real * mix + idle(i, n) * (1 - mix);
      };

      if (mode === "bars") {
        const N = Math.max(40, Math.min(110, Math.round(W / 13)));
        const bw = W / N;
        const B = H * 0.8;
        ctx.fillStyle = "rgba(236, 246, 242, 0.07)";
        ctx.fillRect(0, B, W, 1);
        for (let i = 0; i < N; i++) {
          const v = valueAt(i / N, i, N);
          const bh = Math.max(2, v * H * 0.6);
          const x = i * bw;
          ctx.fillStyle = `hsl(${h + (i / N) * 46}, 80%, ${52 + v * 18}%)`;
          ctx.globalAlpha = 0.26;
          ctx.fillRect(x + 1, B - bh, bw - 2, bh);
          ctx.globalAlpha = 0.95;
          ctx.fillRect(x + bw * 0.24, B - bh, bw * 0.52, bh);
          ctx.globalAlpha = 0.14;
          ctx.fillRect(x + 1, B + 3, bw - 2, bh * 0.32);
        }
        ctx.globalAlpha = 1;
      } else if (mode === "orbit") {
        const cx = W / 2;
        const cy = H / 2;
        const R = Math.min(W, H) * 0.2 * (1 + level * mix * 0.2);
        const SPOKES = 150;
        const rot = t * 0.00014;
        ctx.lineCap = "round";
        for (let i = 0; i < SPOKES; i++) {
          const v = valueAt(i / SPOKES, i, SPOKES);
          const a = rot + (i / SPOKES) * Math.PI * 2;
          const r0 = R * 0.86;
          const len = 5 + v * R * 1.7;
          ctx.strokeStyle = `hsla(${h + (i / SPOKES) * 70 + t * 0.004}, 85%, ${56 + v * 16}%, ${0.22 + v * 0.75})`;
          ctx.lineWidth = v > 0.45 ? 2.2 : 1.4;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
          ctx.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len));
          ctx.stroke();
        }
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.85);
        core.addColorStop(0, `hsla(${h}, 90%, 60%, ${0.28 + level * mix * 0.3})`);
        core.addColorStop(1, "transparent");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `hsla(${h}, 75%, 62%, 0.4)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.86, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(236, 246, 242, 0.06)";
        ctx.beginPath();
        ctx.arc(cx, cy, R * 2.3, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        const mid = H / 2;
        ctx.strokeStyle = "rgba(236, 246, 242, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, mid);
        ctx.lineTo(W, mid);
        ctx.stroke();
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, `hsl(${h}, 85%, 58%)`);
        grad.addColorStop(1, `hsl(${h + 65}, 85%, 60%)`);
        const yAt = (x: number) => {
          const idl =
            Math.sin(x * 0.012 + t * 0.002) * 16 * Math.sin(t * 0.0007 + x * 0.002) +
            Math.sin(x * 0.031 - t * 0.0013) * 7;
          if (mix > 0.02 && analyser) {
            const idx = Math.floor((x / W) * (wave.length - 1));
            const real = ((wave[idx] - 128) / 128) * H * 0.3 * (0.85 + level);
            return mid + real * mix + idl * (1 - mix);
          }
          return mid + idl;
        };
        for (const [lw, alpha, mirror] of [
          [8, 0.16, false],
          [2.4, 0.95, false],
          [1.2, 0.2, true],
        ] as [number, number, boolean][]) {
          ctx.lineWidth = lw;
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = grad;
          ctx.beginPath();
          for (let x = 0; x <= W; x += 3) {
            const y = yAt(x);
            const yy = mirror ? mid - (y - mid) : y;
            if (x === 0) ctx.moveTo(x, yy);
            else ctx.lineTo(x, yy);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [analyser, mode]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
