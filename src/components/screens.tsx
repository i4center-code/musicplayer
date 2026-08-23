import { useMemo, useState } from "react";
import { genreLabel, greet, num, plays, t, useT } from "../lib/i18n";
import { MOODS, PLACES, moodById, placeById, type Story, type User } from "../lib/state";
import type { TrackRuntime } from "../lib/catalog";
import { ARTISTS, artistById, tracksOfArtist } from "../lib/catalog";
import StoryBubbles from "./StoryBubbles";
import TrackList from "./TrackList";
import { IconBack, IconMic, IconPlay, IconSearch, IconVideo } from "./icons";

interface ScreenBase {
  tracks: TrackRuntime[];
  playingId: string | null;
  isPlaying: boolean;
  liked: Set<string>;
  loadingId: string | null;
  onPlay: (id: string) => void;
  onLike: (id: string) => void;
}

/* ================= خانه ================= */

interface HomeProps extends ScreenBase {
  user: User | null;
  stories: Story[];
  onOpenStory: (i: number) => void;
  onCreateStory: () => void;
  onGoMoods: () => void;
  onGoSearch: () => void;
}

export function HomeScreen(p: HomeProps) {
  const { lang } = useT();
  const hottest = useMemo(() => [...p.tracks].filter((x) => !x.uploaded).sort((a, b) => b.plays - a.plays).slice(0, 8), [p.tracks]);
  const fresh = useMemo(() => p.tracks.filter((x) => x.uploaded).slice(0, 5), [p.tracks]);

  return (
    <div className="pb-4">
      {/* سربرگ */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-night-800 text-xl ring-2 ring-turq/40">
          {p.user ? (p.user.avatar.startsWith("data:") ? <img src={p.user.avatar} className="h-full w-full object-cover" alt="" /> : p.user.avatar) : "👤"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] tracking-[0.2em] text-dim">{greet()}</p>
          <p className="truncate text-sm font-extrabold text-foam">
            {p.user ? p.user.name : t("guestTitle")}
            {p.user?.isArtist && <span className="ms-1.5 rounded-full bg-turq/15 px-1.5 py-0.5 text-[9px] font-bold text-turq">{t("artistBadge")}</span>}
          </p>
        </div>
        <button onClick={p.onGoSearch} className="rounded-full bg-night-850 p-2.5 text-mist transition-all hover:text-turq active:scale-90" aria-label="search">
          <IconSearch size={18} />
        </button>
      </div>

      {/* ردیف استوری‌ها — اول از همه */}
      <StoryBubbles stories={p.stories} user={p.user} onOpenStory={p.onOpenStory} onCreate={p.onCreateStory} />

      {/* چیپ‌های مود */}
      <div className="mt-4 px-4">
        <SectionTitle title={t("moodsTitle")} onMore={p.onGoMoods} />
        <div className="slim-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MOODS.slice(0, 8).map((m) => (
            <button
              key={m.id}
              onClick={p.onGoMoods}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-foam/10 bg-night-850 px-3.5 py-2 text-xs font-bold text-mist transition-all duration-150 hover:border-turq/40 hover:text-foam active:scale-95"
              style={{ borderColor: `hsl(${m.hue} 60% 45% / 0.35)` }}
            >
              <span>{m.emoji}</span>
              {lang === "fa" ? m.fa : m.en}
            </button>
          ))}
        </div>
      </div>

      {/* آپلودهای تازه */}
      {fresh.length > 0 && (
        <div className="mt-5 px-4">
          <SectionTitle title={t("yourUploads")} />
          <TrackList {...trackProps(p)} tracks={fresh} />
        </div>
      )}

      {/* داغ‌ترین‌ها */}
      <div className="mt-5 px-4">
        <SectionTitle title={t("hottest")} />
        <TrackList {...trackProps(p)} tracks={hottest} />
      </div>
    </div>
  );
}

function SectionTitle({ title, onMore }: { title: string; onMore?: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-lg text-foam">{title}</h2>
      {onMore && (
        <button onClick={onMore} className="text-xs font-bold text-turq transition-opacity hover:opacity-70">
          {t("seeAll")}
        </button>
      )}
    </div>
  );
}

const trackProps = (p: ScreenBase) => ({
  playingId: p.playingId,
  isPlaying: p.isPlaying,
  liked: p.liked,
  loadingId: p.loadingId,
  onPlay: p.onPlay,
  onLike: p.onLike,
});

/* ================= مودها ================= */

interface MoodProps extends ScreenBase {
  mood: string | null;
  place: string | null;
  onMood: (id: string | null) => void;
  onPlace: (id: string | null) => void;
}

export function MoodScreen(p: MoodProps) {
  const { lang } = useT();
  const mood = p.mood ? moodById(p.mood) : null;
  const place = p.place ? placeById(p.place) : null;

  const filtered = useMemo(() => {
    let list = [...p.tracks];
    if (mood) list = list.filter((x) => mood.genres.includes(x.genre));
    if (place) {
      const byPlace = list.filter((x) => place.genres.includes(x.genre));
      if (byPlace.length) list = byPlace;
    }
    return list.sort((a, b) => b.plays - a.plays);
  }, [p.tracks, mood, place]);

  return (
    <div className="px-4 pb-4 pt-4">
      <h1 className="font-display text-2xl text-foam">{t("moodsTitle")}</h1>
      <p className="mt-1 text-xs text-mist">{t("pickMood")} · {t("pickPlace")}</p>

      {/* فضا */}
      <p className="mb-2 mt-4 text-[11px] font-extrabold tracking-wide text-dim">{t("space").toUpperCase()}</p>
      <div className="slim-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip active={!p.place} onClick={() => p.onPlace(null)} label={t("all")} />
        {PLACES.map((pl) => (
          <Chip key={pl.id} active={p.place === pl.id} onClick={() => p.onPlace(p.place === pl.id ? null : pl.id)} label={`${pl.emoji} ${lang === "fa" ? pl.fa : pl.en}`} />
        ))}
      </div>

      {/* مودها */}
      <p className="mb-2 mt-4 text-[11px] font-extrabold tracking-wide text-dim">{t("moodNow").toUpperCase()}</p>
      <div className="grid grid-cols-3 gap-2">
        {MOODS.map((m) => {
          const active = p.mood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => p.onMood(p.mood === m.id ? null : m.id)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all duration-200 active:scale-95 ${
                active ? "border-transparent text-night-950" : "border-foam/8 bg-night-850 text-mist hover:border-foam/20"
              }`}
              style={active ? { background: `linear-gradient(140deg, hsl(${m.hue} 75% 60%), hsl(${m.hue + 30} 70% 45%))` } : undefined}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className={`text-center text-[11px] font-bold leading-4 ${active ? "text-night-950" : ""}`}>{lang === "fa" ? m.fa : m.en}</span>
            </button>
          );
        })}
      </div>

      {mood && (
        <button onClick={() => p.onMood(null)} className="mt-3 text-xs font-bold text-coral transition-opacity hover:opacity-70">
          ✕ {t("resetMood")}
        </button>
      )}

      {/* نتایج */}
      <div className="mt-5">
        <SectionTitle title={`${t("matchedTracks")} · ${num(filtered.length)}`} />
        <TrackList {...trackProps(p)} tracks={filtered} />
      </div>
    </div>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-150 active:scale-95 ${
        active ? "border-turq bg-turq text-night-950" : "border-foam/12 bg-night-850 text-mist hover:border-foam/30"
      }`}
    >
      {label}
    </button>
  );
}

/* ================= هنرمندان ================= */

interface ArtistsProps {
  onOpen: (id: string) => void;
  onPlayArtist: (id: string) => void;
  user: User | null;
  onOpenMyArtist: () => void;
}

export function ArtistsScreen({ onOpen, onPlayArtist, user, onOpenMyArtist }: ArtistsProps) {
  const { lang } = useT();
  return (
    <div className="px-4 pb-4 pt-4">
      <h1 className="font-display text-2xl text-foam">{t("artistsTitle")}</h1>

      {user?.isArtist && user.artist && (
        <button onClick={onOpenMyArtist} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-saffron/40 bg-saffron/8 p-3 text-start transition-all active:scale-[0.98]">
          <span className="flex h-12 w-12 items-center justify-center rounded-full text-2xl" style={{ background: `linear-gradient(135deg, hsl(${user.artist.coverHue} 70% 50%), hsl(${user.artist.coverHue + 40} 65% 32%))` }}>
            {user.avatar}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-extrabold text-foam">{user.artist.name} <span className="text-turq">✓</span></span>
            <span className="block text-[11px] text-mist">{t("viewArtistPage")}</span>
          </span>
        </button>
      )}

      <div className="mt-4 space-y-3">
        {ARTISTS.map((a, i) => (
          <div key={a.id} className="animate-rise flex items-center gap-3 rounded-2xl border border-foam/6 bg-night-850/70 p-3 transition-all hover:border-foam/15" style={{ animationDelay: `${i * 40}ms` }}>
            <button onClick={() => onOpen(a.id)} className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-2xl" style={{ background: `linear-gradient(135deg, hsl(${a.hue} 70% 48%), hsl(${a.hue + 40} 65% 30%))` }}>
              <IconMic size={22} className="text-white/90" />
            </button>
            <button onClick={() => onOpen(a.id)} className="min-w-0 flex-1 text-start">
              <p className="flex items-center gap-1.5 truncate text-sm font-extrabold text-foam">
                {a.name} <span className="text-turq">✓</span>
              </p>
              <p className="truncate text-[11px] text-mist">{a.genres.map((g) => genreLabel(g)).join(" · ")}</p>
              <p className="font-mono text-[9px] text-dim">{plays(800_000 + a.hue * 9137)} {t("monthlyListeners")}</p>
            </button>
            <button onClick={() => onPlayArtist(a.id)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-turq text-night-950 shadow-lg shadow-turq/25 transition-transform active:scale-90" aria-label="play artist">
              <IconPlay size={17} className="ms-0.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= صفحهٔ هنرمند (لندینگ) ================= */

interface LandingProps extends ScreenBase {
  artistId: string | null; // null = هنرمندِ خود کاربر
  user: User | null;
  onBack: () => void;
}

export function ArtistLanding(p: LandingProps) {
  const { lang } = useT();
  const builtin = p.artistId ? artistById(p.artistId) : null;
  const isMine = !p.artistId && p.user?.isArtist;
  const name = builtin?.name ?? p.user?.artist?.name ?? "";
  const hue = builtin?.hue ?? p.user?.artist?.coverHue ?? 174;
  const bio = builtin?.bio ?? p.user?.artist?.bio ?? "";
  const tagline = builtin ? builtin.genres.map((g) => genreLabel(g)).join(" · ") : p.user?.artist?.tagline ?? "";
  const works = p.artistId ? tracksOfArtist(p.artistId) : [];
  const myWorks = p.user?.artist?.works ?? [];

  return (
    <div className="pb-4">
      {/* کاور */}
      <div className="relative h-52 overflow-hidden" style={{ background: `linear-gradient(150deg, hsl(${hue} 65% 30%), hsl(${hue + 50} 60% 16%))` }}>
        <div className="girih absolute inset-0 opacity-25" />
        <div className="absolute -bottom-16 start-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl" style={{ background: `hsl(${hue} 80% 55% / 0.4)` }} />
        <button onClick={p.onBack} className="absolute start-4 top-4 flex items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm transition-transform active:scale-95">
          <IconBack size={14} /> {t("back")}
        </button>
        <div className="absolute bottom-4 start-1/2 flex -translate-x-1/2 flex-col items-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-night-950 text-4xl shadow-2xl" style={{ background: `linear-gradient(135deg, hsl(${hue} 75% 55%), hsl(${hue + 40} 70% 38%))` }}>
            {isMine ? p.user?.avatar : <IconMic size={40} className="text-white/90" />}
          </span>
        </div>
      </div>

      <div className="px-4 pt-14 text-center">
        <h1 className="font-display flex items-center justify-center gap-2 text-2xl text-foam">
          {name}
          <span className="rounded-full bg-turq/15 px-2 py-0.5 text-[10px] font-bold text-turq">{t("artistBadge")} ✓</span>
        </h1>
        <p className="mt-1 text-xs font-bold text-turq">{tagline}</p>
        <p className="mt-3 font-mono text-[10px] text-dim">
          {plays(1_200_000 + hue * 4391)} {t("monthlyListeners")} · {num((isMine ? myWorks.length : works.length))} {t("tracks")}
        </p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-mist">{bio}</p>
      </div>

      {/* آثار */}
      <div className="mt-6 px-4">
        <SectionTitle title={isMine ? t("worksTitle") : t("worksTitle")} />
        {!isMine && <TrackList {...trackProps(p)} tracks={works.map((w) => ({ ...w, ready: false }) as TrackRuntime)} />}
        {isMine && (
          <div className="space-y-2">
            {myWorks.length === 0 && (
              <p className="rounded-2xl border border-dashed border-foam/12 p-6 text-center text-sm text-mist">{t("worksHint")}</p>
            )}
            {myWorks.map((w) => (
              <div key={w.id} className="flex items-center gap-3 rounded-2xl border border-foam/6 bg-night-850/70 p-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, hsl(${w.coverHue} 70% 48%), hsl(${w.coverHue + 40} 65% 30%))` }}>
                  {w.kind === "video" ? <IconVideo size={18} className="text-white" /> : w.kind === "album" ? "💿" : "🎵"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-foam">{w.title}</span>
                  {w.note && <span className="block truncate text-[11px] text-mist">{w.note}</span>}
                </span>
                {w.trackId && (
                  <button onClick={() => p.onPlay(w.trackId!)} className="flex h-9 w-9 items-center justify-center rounded-full bg-turq text-night-950 transition-transform active:scale-90" aria-label="play">
                    <IconPlay size={15} className="ms-0.5" />
                  </button>
                )}
                {w.external && (
                  <a href={w.external} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-turq underline-offset-2 hover:underline">
                    {t("externalOpen")}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
