/** ابزارهای صوتی مشترک: خواندن آپلود کاربر، استخراج قلّه‌ها و حالت‌های بصری‌ساز. */

export type VizMode = "bars" | "orbit" | "pulse";

export const VIZ_MODES: { id: VizMode; label: string }[] = [
  { id: "bars", label: "میله‌ای" },
  { id: "orbit", label: "مداری" },
  { id: "pulse", label: "موجی" },
];

export function extractPeaks(buffer: AudioBuffer, buckets: number): number[] {
  const data = buffer.getChannelData(0);
  const per = Math.max(1, Math.floor(data.length / buckets));
  const out: number[] = [];
  let max = 0.001;
  for (let b = 0; b < buckets; b++) {
    let m = 0;
    const start = b * per;
    for (let i = start; i < start + per && i < data.length; i++) {
      const v = Math.abs(data[i]);
      if (v > m) m = v;
    }
    out.push(m);
    if (m > max) max = m;
  }
  return out.map((v) => Math.pow(v / max, 0.82));
}

/** خواندن فایل صوتی آپلودشده و تبدیل آن به AudioBuffer و URL قابل پخش. */
export async function decodeFile(
  file: File
): Promise<{ buffer: AudioBuffer; url: string }> {
  const ab = await file.arrayBuffer();
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  try {
    const buffer = await ctx.decodeAudioData(ab);
    return { buffer, url: URL.createObjectURL(file) };
  } finally {
    void ctx.close();
  }
}
