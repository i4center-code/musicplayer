import { genreLabel, plays, t, time as fmtTime, useT } from "../lib/i18n";
import { isVideoTrack } from "../lib/state";
import type { TrackRuntime } from "../lib/catalog";
import { artistById } from "../lib/catalog";
import { IconHeart, IconPause, IconPlay, IconVideo } from "./icons";

interface Props {
  tracks: TrackRuntime[];
  playingId: string | null;
  isPlaying: boolean;
  liked: Set<string>;
  loadingId: string | null;
  onPlay: (id: string) => void;
  onLike: (id: string) => void;
  compact?: boolean;
  emptyText?: string;
}

export default function TrackList(p: Props) {
  const { lang } = useT();
  if (p.tracks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-foam/12 p-8 text-center">
        <p className="text-3xl">🎧</p>
        <p className="mt-2 text-sm font-bold text-mist">{p.emptyText ?? t("noResults")}</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {p.tracks.map((tr, i) => {
        const active = tr.id === p.playingId;
        const artist = artistById(tr.artistId);
        const isVid = isVideoTrack(tr.id);
        return (
          <div
            key={tr.id}
            className={`group animate-rise flex items-center gap-3 rounded-2xl border p-2.5 transition-all duration-200 active:scale-[0.985] ${
              active ? "border-turq/50 bg-turq/8" : "border-foam/6 bg-night-850/70 hover:border-foam/15 hover:bg-night-800"
            }`}
            style={{ animationDelay: `${Math.min(i * 35, 350)}ms` }}
          >
            <button onClick={() => p.onPlay(tr.id)} className="relative flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-transform active:scale-90" style={{ width: 52, height: 52 }}>
              <span
                className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, hsl(${tr.hue} 72% 46%), hsl(${tr.hue + 40} 68% 28%))` }}
              />
              {active && p.isPlaying ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45">
                  <EqMini />
                </span>
              ) : (
                <span className="relative text-white">
                  {isVid ? <IconVideo size={20} /> : <IconPlay size={20} className="ms-0.5" />}
                </span>
              )}
              {isVid && !active && (
                <span className="absolute bottom-1 end-1 rounded bg-black/50 px-1 font-mono text-[7px] font-bold text-white">
                  {t("video")}
                </span>
              )}
            </button>

            <button onClick={() => p.onPlay(tr.id)} className="min-w-0 flex-1 text-start">
              <p className={`truncate text-sm font-bold ${active ? "text-turq" : "text-foam"}`}>{tr.title}</p>
              <p className="truncate text-[11px] text-mist">
                {artist?.name ?? t("yourUploads")} · {genreLabel(tr.genre)}
              </p>
              <p className="font-mono text-[9px] text-dim">
                {fmtTime(tr.duration)} · {plays(tr.plays)} {t("listens")}
              </p>
            </button>

            {p.loadingId === tr.id && <Spinner />}

            <button
              onClick={() => p.onLike(tr.id)}
              className={`shrink-0 rounded-full p-2 transition-all duration-200 active:scale-75 ${p.liked.has(tr.id) ? "text-[#ff5c7a]" : "text-dim hover:text-mist"}`}
              aria-label="like"
            >
              <IconHeart size={19} filled={p.liked.has(tr.id)} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function EqMini() {
  return (
    <span className="flex h-4 items-end gap-[3px]">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`w-[3.5px] origin-bottom rounded-full bg-turq ${["animate-eq-1", "animate-eq-2", "animate-eq-3"][i]}`} />
      ))}
    </span>
  );
}

export function Spinner() {
  return (
    <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-turq/25 border-t-turq" aria-label="loading" />
  );
}
