/**
 * موتور سنتز ایران‌تیفای — هر اثر آرشیو به‌صورت بلادرنگ در دستگاه موسیقیایی خودش
 * (شور، همایون، ماهور، …) رندر می‌شود تا آرشیو بدون هیچ فایل صوتی، واقعاً قابل پخش باشد.
 */

export type Genre = "سنتی" | "پاپ" | "الکترونیک" | "رپ" | "تلفیقی" | "آپلود";

export const SCALES: Record<string, number[]> = {
  "شور": [0, 150, 300, 500, 700, 850, 1050],
  "دشت": [0, 150, 400, 500, 700, 850, 1050],
  "همایون": [0, 150, 350, 500, 700, 800, 1000],
  "ماهور": [0, 200, 400, 500, 700, 900, 1100],
  "اصفهان": [0, 150, 350, 500, 700, 950, 1050],
  "بیات ترک": [0, 150, 300, 500, 700, 900, 1050],
  "چهارگاه": [0, 150, 350, 550, 700, 850, 1050],
};

export interface TrackSpec {
  scaleName: string;
  root: number;
  bpm: number;
  genre: Genre;
  seed: number;
  duration: number;
}

export interface RenderedTrack {
  url: string;
  peaks: number[];
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const len = buffer.length * numCh * 2 + 44;
  const ab = new ArrayBuffer(len);
  const view = new DataView(ab);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, len - 8, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * numCh * 2, true);
  view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, len - 44, true);
  let off = 44;
  const chans: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) chans.push(buffer.getChannelData(c));
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, chans[c][i]));
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      off += 2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}

function extractPeaks(buffer: AudioBuffer, buckets: number): number[] {
  const data = buffer.getChannelData(0);
  const per = Math.max(1, Math.floor(data.length / buckets));
  const out: number[] = [];
  let max = 0.001;
  for (let b = 0; b < buckets; b++) {
    let m = 0;
    const start = b * per;
    for (let i = start; i < start + per && i < data.length; i += 4) {
      const v = Math.abs(data[i]);
      if (v > m) m = v;
    }
    out.push(m);
    if (m > max) max = m;
  }
  return out.map((v) => Math.pow(v / max, 0.82));
}

/* ---------- سازها ---------- */

interface PluckOpts {
  type?: OscillatorType;
  gain?: number;
  dur?: number;
  bright?: number;
}

function pluck(ctx: OfflineAudioContext, out: AudioNode, t: number, f: number, opts: PluckOpts = {}) {
  const { type = "triangle", gain = 0.4, dur = 0.9, bright = 5 } = opts;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const o1 = ctx.createOscillator();
  o1.type = type;
  o1.frequency.value = f;
  o1.detune.value = -5;
  const o2 = ctx.createOscillator();
  o2.type = "sawtooth";
  o2.frequency.value = f;
  o2.detune.value = 6;
  const g2 = ctx.createGain();
  g2.gain.value = 0.3;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(f * bright, t);
  lp.frequency.exponentialRampToValueAtTime(Math.max(200, f * 1.4), t + dur);
  lp.Q.value = 0.8;
  o1.connect(g);
  o2.connect(g2);
  g2.connect(g);
  g.connect(lp);
  lp.connect(out);
  o1.start(t);
  o2.start(t);
  o1.stop(t + dur + 0.05);
  o2.stop(t + dur + 0.05);
}

function kick(ctx: OfflineAudioContext, out: AudioNode, t: number, punch = 1) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.11);
  g.gain.setValueAtTime(0.85 * punch, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
  o.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + 0.28);
}

function makeNoise(ctx: OfflineAudioContext): AudioBuffer {
  const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function hat(ctx: OfflineAudioContext, out: AudioNode, t: number, noise: AudioBuffer, open = false, gain = 0.2) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 7200;
  const g = ctx.createGain();
  const d = open ? 0.22 : 0.045;
  g.gain.setValueAtTime(gain * (open ? 0.8 : 1), t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  src.connect(hp);
  hp.connect(g);
  g.connect(out);
  src.start(t, Math.random() * 0.3, d + 0.05);
}

function snare(ctx: OfflineAudioContext, out: AudioNode, t: number, noise: AudioBuffer, gain = 0.3) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1900;
  bp.Q.value = 0.7;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  src.connect(bp);
  bp.connect(g);
  g.connect(out);
  src.start(t, 0.1, 0.25);
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(210, t);
  const og = ctx.createGain();
  og.gain.setValueAtTime(gain * 0.5, t);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  o.connect(og);
  og.connect(out);
  o.start(t);
  o.stop(t + 0.12);
}

function bass808(ctx: OfflineAudioContext, out: AudioNode, t: number, f: number, decay = 0.55, gain = 0.6) {
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(f * 1.6, t);
  o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  o.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + decay + 0.05);
}

function pad(ctx: OfflineAudioContext, out: AudioNode, t: number, freqs: number[], dur: number, gain = 0.1) {
  freqs.forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = f;
    o.detune.value = i % 2 === 0 ? -7 : 7;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 950;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain / freqs.length, t + dur * 0.3);
    g.gain.setValueAtTime(gain / freqs.length, t + dur * 0.7);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(lp);
    lp.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
  });
}

function drone(ctx: OfflineAudioContext, out: AudioNode, dur: number, freqs: number[], gain = 0.05) {
  freqs.forEach((f) => {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = f;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, 0);
    g.gain.linearRampToValueAtTime(gain, 2.2);
    g.gain.setValueAtTime(gain, dur - 3);
    g.gain.linearRampToValueAtTime(0.0001, dur - 0.1);
    o.connect(lp);
    lp.connect(g);
    g.connect(out);
    o.start(0);
    o.stop(dur);
  });
}

/* ---------- الگوهای ژانر ---------- */

interface Sched {
  ctx: OfflineAudioContext;
  bus: AudioNode;
  noise: AudioBuffer;
  rnd: () => number;
  freq: (deg: number, oct?: number) => number;
  bpm: number;
  duration: number;
}

function scheduleSonati(s: Sched) {
  const beat = 60 / s.bpm;
  drone(s.ctx, s.bus, s.duration, [s.freq(0, -1), s.freq(4, -1)], 0.045);
  let deg = 4;
  for (let t = 1.4; t < s.duration - 3.5; t += beat / 2) {
    if (s.rnd() < 0.72) {
      deg = Math.max(-2, Math.min(13, deg + Math.round((s.rnd() - 0.46) * 5)));
      const long = s.rnd() < 0.18;
      pluck(s.ctx, s.bus, t, s.freq(deg), { gain: 0.42, dur: long ? 1.7 : 0.9, bright: 6 });
      if (s.rnd() < 0.22) pluck(s.ctx, s.bus, t + beat / 4, s.freq(deg - 7), { gain: 0.2, dur: 0.7 });
    }
  }
  for (let bar = 0; bar * 4 * beat < s.duration - 3; bar++) {
    const t0 = bar * 4 * beat + 0.8;
    [0, 0.75, 2, 2.5, 3.5].forEach((b) => {
      if (s.rnd() < 0.85) kick(s.ctx, s.bus, t0 + b * beat, 0.55);
    });
    [1, 3].forEach((b) => hat(s.ctx, s.bus, t0 + b * beat, s.noise, false, 0.08));
  }
}

function schedulePop(s: Sched) {
  const beat = 60 / s.bpm;
  const bar = beat * 4;
  const prog = [0, 3, 4, 2];
  const riff: number[] = [];
  let d = 7;
  for (let i = 0; i < 16; i++) {
    d = Math.max(0, Math.min(11, d + Math.round((s.rnd() - 0.5) * 4)));
    riff.push(d);
  }
  for (let t = 0, b = 0; t < s.duration - 2.5; t += beat, b++) {
    const inBar = b % 4;
    kick(s.ctx, s.bus, t, 0.9);
    if (inBar === 1 || inBar === 3) snare(s.ctx, s.bus, t, s.noise, 0.26);
    hat(s.ctx, s.bus, t + beat / 2, s.noise, false, 0.14);
    if (inBar === 0 || inBar === 2) bass808(s.ctx, s.bus, t, s.freq(prog[Math.floor(b / 4) % 4], -1), 0.4, 0.5);
    if (inBar === 0) {
      const root = prog[Math.floor(b / 4) % 4];
      pad(s.ctx, s.bus, t, [s.freq(root), s.freq(root + 2), s.freq(root + 4)], bar * 0.98, 0.16);
    }
    if (s.rnd() < 0.62) {
      const n = riff[b % 16];
      pluck(s.ctx, s.bus, t, s.freq(n), { gain: 0.26, dur: 0.42, bright: 4 });
    }
  }
}

function scheduleElectronic(s: Sched) {
  const beat = 60 / s.bpm;
  const bar = beat * 4;
  const arp: number[] = [];
  for (let i = 0; i < 8; i++) arp.push([0, 2, 4, 7, 9, 4, 2, 11][i] ?? Math.floor(s.rnd() * 10));
  const prog = [0, 4, 5, 3];
  for (let t = 0, b = 0; t < s.duration - 2.5; t += beat / 4, b++) {
    const sixteenth = b % 4 === 0;
    const eighth = b % 2 === 0;
    if (sixteenth) kick(s.ctx, s.bus, t, 1);
    if (b % 4 === 2) hat(s.ctx, s.bus, t, s.noise, true, 0.16);
    else if (eighth) hat(s.ctx, s.bus, t, s.noise, false, 0.09);
    const n = arp[b % 8] + (b % 32 < 16 ? 0 : 7);
    pluck(s.ctx, s.bus, t, s.freq(n, 0), { gain: 0.16, dur: 0.16, bright: 7, type: "square" });
    if (sixteenth && b % 2 === 0) bass808(s.ctx, s.bus, t, s.freq(prog[Math.floor(b / 16) % 4], -1), 0.22, 0.5);
    if (b % 16 === 0) {
      const root = prog[Math.floor(b / 16) % 4];
      pad(s.ctx, s.bus, t, [s.freq(root), s.freq(root + 2), s.freq(root + 4)], bar * 2, 0.13);
    }
  }
}

function scheduleRap(s: Sched) {
  const beat = 60 / s.bpm;
  const kickPat = [0, 1.75, 2.5, 3.25];
  const bassDeg = [0, 0, 5, 1];
  for (let barT = 0, bar = 0; barT < s.duration - 2.5; barT += beat * 4, bar++) {
    kickPat.forEach((b, i) => {
      const t = barT + b * beat;
      kick(s.ctx, s.bus, t, 1.05);
      bass808(s.ctx, s.bus, t, s.freq(bassDeg[(bar + i) % 4], -1), 0.6, 0.62);
    });
    snare(s.ctx, s.bus, barT + beat, s.noise, 0.3);
    snare(s.ctx, s.bus, barT + 3 * beat, s.noise, 0.3);
    for (let h = 0; h < 16; h++) {
      if (s.rnd() < 0.75) hat(s.ctx, s.bus, barT + (h / 4) * beat, s.noise, false, h % 4 === 0 ? 0.16 : 0.09);
    }
    if (bar % 2 === 0) {
      [7, 5, 4].forEach((dg, i) => {
        pluck(s.ctx, s.bus, barT + (i + 1) * 1.5 * beat, s.freq(dg), { gain: 0.14, dur: 0.8, bright: 3, type: "sawtooth" });
      });
    }
  }
}

function scheduleFusion(s: Sched) {
  const beat = 60 / s.bpm;
  drone(s.ctx, s.bus, s.duration, [s.freq(0, -1)], 0.035);
  let deg = 5;
  for (let t = 1; t < s.duration - 3; t += beat / 2) {
    if (s.rnd() < 0.6) {
      deg = Math.max(0, Math.min(12, deg + Math.round((s.rnd() - 0.5) * 4)));
      pluck(s.ctx, s.bus, t, s.freq(deg), { gain: 0.34, dur: 0.8, bright: 5 });
    }
  }
  for (let t = 0, b = 0; t < s.duration - 2.5; t += beat, b++) {
    if (b % 4 === 0 || b % 4 === 2) kick(s.ctx, s.bus, t, 0.85);
    if (b % 4 === 1 || b % 4 === 3) snare(s.ctx, s.bus, t, s.noise, 0.18);
    hat(s.ctx, s.bus, t + beat / 2, s.noise, false, 0.11);
    if (b % 2 === 0) bass808(s.ctx, s.bus, t, s.freq([0, 4, 3, 4][Math.floor(b / 2) % 4], -1), 0.35, 0.45);
  }
}

/* ---------- رندر نهایی ---------- */

async function renderSpec(spec: TrackSpec): Promise<RenderedTrack> {
  const sr = 44100;
  const ctx = new OfflineAudioContext(2, Math.ceil(spec.duration * sr), sr);
  const rnd = mulberry32(spec.seed);
  const scale = SCALES[spec.scaleName] ?? SCALES["شور"];
  const freq = (deg: number, oct = 0) => {
    const idx = ((deg % scale.length) + scale.length) % scale.length;
    const o = Math.floor(deg / scale.length) + oct;
    return spec.root * Math.pow(2, (scale[idx] + 1200 * o) / 1200);
  };

  const master = ctx.createGain();
  master.gain.value = 0.9;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.knee.value = 22;
  comp.ratio.value = 6;
  comp.attack.value = 0.004;
  comp.release.value = 0.24;
  const delay = ctx.createDelay(1.5);
  delay.delayTime.value = (60 / spec.bpm) * 0.75;
  const fb = ctx.createGain();
  fb.gain.value = 0.32;
  const wet = ctx.createGain();
  wet.gain.value = spec.genre === "سنتی" ? 0.3 : 0.15;
  delay.connect(fb);
  fb.connect(delay);
  delay.connect(wet);
  wet.connect(master);
  master.connect(comp);
  comp.connect(ctx.destination);
  const bus = ctx.createGain();
  bus.gain.value = 1;
  bus.connect(master);
  bus.connect(delay);

  const s: Sched = { ctx, bus, noise: makeNoise(ctx), rnd, freq, bpm: spec.bpm, duration: spec.duration };
  switch (spec.genre) {
    case "پاپ":
      schedulePop(s);
      break;
    case "الکترونیک":
      scheduleElectronic(s);
      break;
    case "رپ":
      scheduleRap(s);
      break;
    case "تلفیقی":
      scheduleFusion(s);
      break;
    default:
      scheduleSonati(s);
  }

  master.gain.setValueAtTime(0.9, spec.duration - 2.2);
  master.gain.linearRampToValueAtTime(0.0001, spec.duration - 0.05);

  const buffer = await ctx.startRendering();
  const wav = audioBufferToWav(buffer);
  return { url: URL.createObjectURL(wav), peaks: extractPeaks(buffer, 130) };
}

const cache = new Map<string, Promise<RenderedTrack>>();

/** رندر با کش — هر اثر فقط یک‌بار سنتز می‌شود. */
export function renderTrack(id: string, spec: TrackSpec): Promise<RenderedTrack> {
  if (!cache.has(id)) cache.set(id, renderSpec(spec));
  return cache.get(id)!;
}
