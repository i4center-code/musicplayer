import { useState } from "react";
import { genreLabel, t, time as fmtTime, useT } from "../lib/i18n";
import type { User } from "../lib/state";
import { THEMES, isVideoTrack, themeById, uid } from "../lib/state";
import type { TrackRuntime } from "../lib/catalog";
import { IconBack, IconCheck, IconMusic, IconVideo } from "./icons";

interface Props {
  tracks: TrackRuntime[];
  user: User;
  initialTrackId?: string | null;
  onClose: () => void;
  onPost: (s: { trackId: string; isVideo: boolean; theme: string; caption: string }) => void;
}

export default function CreateStory({ tracks, user, initialTrackId, onClose, onPost }: Props) {
  const { lang } = useT();
  const [step, setStep] = useState<0 | 1>(initialTrackId ? 1 : 0);
  const [trackId, setTrackId] = useState<string | null>(initialTrackId ?? null);
  const [theme, setTheme] = useState(THEMES[1].id);
  const [caption, setCaption] = useState("");

  const sel = tracks.find((x) => x.id === trackId);
  const th = themeById(theme);

  const post = () => {
    if (!sel) return;
    onPost({ trackId: sel.id, isVideo: isVideoTrack(sel.id), theme, caption: caption.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-night-950 text-foam">
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 py-5">
        <div className="flex items-center gap-3">
          <button onClick={step === 0 ? onClose : () => setStep(0)} className="rounded-full bg-night-850 p-2 text-mist transition-transform active:scale-90">
            <IconBack size={18} />
          </button>
          <h2 className="font-display text-xl">{t("sendStory")}</h2>
          <span className="ms-auto font-mono text-[10px] text-dim">{step === 0 ? "1/2" : "2/2"}</span>
        </div>

        {step === 0 && (
          <>
            <p className="mt-4 text-xs font-bold text-mist">{t("chooseTrack")}</p>
            <div className="slim-scroll mt-3 space-y-2 overflow-y-auto pb-24">
              {tracks.map((tr) => {
                const activeSel = tr.id === trackId;
                return (
                  <button
                    key={tr.id}
                    onClick={() => setTrackId(tr.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition-all duration-200 active:scale-[0.98] ${
                      activeSel ? "border-turq bg-turq/10" : "border-foam/8 bg-night-850 hover:border-foam/20"
                    }`}
                  >
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg"
                      style={{ background: `linear-gradient(135deg, hsl(${tr.hue} 70% 45%), hsl(${tr.hue + 35} 65% 30%))` }}
                    >
                      {isVideoTrack(tr.id) ? <IconVideo size={18} className="text-white" /> : <IconMusic size={18} className="text-white" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{tr.title}</span>
                      <span className="block text-[11px] text-mist">
                        {genreLabel(tr.genre)} · {fmtTime(tr.duration)}
                      </span>
                    </span>
                    {activeSel && <IconCheck size={18} className="text-turq" />}
                  </button>
                );
              })}
            </div>
            <div className="sticky bottom-0 mt-auto bg-night-950 pb-2 pt-3">
              <button
                disabled={!trackId}
                onClick={() => setStep(1)}
                className="w-full rounded-xl bg-turq py-3.5 text-sm font-extrabold text-night-950 shadow-xl shadow-turq/20 transition-all enabled:hover:brightness-110 enabled:active:scale-[0.98] disabled:opacity-30"
              >
                {t("chooseTheme")}
              </button>
            </div>
          </>
        )}

        {step === 1 && sel && (
          <>
            {/* پیش‌نمایش کارت */}
            <div className="relative mx-auto mt-5 flex h-[340px] w-[190px] flex-col items-center justify-between overflow-hidden rounded-3xl p-4 shadow-2xl" style={{ background: th.css }}>
              <span className="text-4xl">{user.avatar}</span>
              <div className="text-center">
                <p className="font-display text-lg leading-snug text-white drop-shadow">{sel.title}</p>
                {caption && <p className="mt-1 text-[10px] leading-4 text-white/85">{caption}</p>}
              </div>
              <MiniEq hue={sel.hue} />
              <p className="font-mono text-[8px] tracking-[0.25em]" style={{ color: th.accent }}>IRANTIFY</p>
            </div>

            <p className="mt-5 text-xs font-bold text-mist">{t("chooseTheme")}</p>
            <div className="mt-2 flex gap-2.5 overflow-x-auto pb-1">
              {THEMES.map((x) => (
                <button
                  key={x.id}
                  onClick={() => setTheme(x.id)}
                  className={`h-14 w-14 shrink-0 rounded-2xl border-2 transition-all duration-150 active:scale-90 ${
                    theme === x.id ? "border-turq scale-105" : "border-transparent"
                  }`}
                  style={{ background: x.css }}
                  title={lang === "fa" ? x.label_fa : x.label_en}
                >
                  {theme === x.id && <IconCheck size={18} className="mx-auto text-white drop-shadow" />}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-bold text-mist">{t("captionPh")}</p>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              maxLength={120}
              className="mt-2 w-full resize-none rounded-xl border border-foam/12 bg-night-850 px-4 py-3 text-sm outline-none focus:border-turq"
              placeholder={t("captionPh")}
            />

            <button
              onClick={post}
              className="mt-5 w-full rounded-xl bg-saffron py-3.5 text-sm font-extrabold text-night-950 shadow-xl shadow-saffron/20 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              {t("postStory")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function MiniEq({ hue }: { hue: number }) {
  return (
    <div className="flex h-8 items-end gap-[3px]">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className="animate-eq-2 w-[4px] origin-bottom rounded-full"
          style={{ background: `hsl(${hue} 85% 70%)`, animationDelay: `${i * 0.08}s`, height: `${30 + (i % 4) * 18}%` }}
        />
      ))}
    </div>
  );
}

export const newStoryId = uid;
