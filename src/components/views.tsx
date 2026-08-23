import type { Artist, TrackRuntime } from "../lib/catalog";
import { ARTISTS, GENRES, albumsOfArtist, artistById, faNum, faPlays, faTime, faTotal, greeting, normalizeFa } from "../lib/catalog";
import { IconArtists, IconClock, IconHeart, IconNote, IconPause, IconPlay, IconSearch, IconSpark } from "./icons";

/* ---------- عناصر مشترک ---------- */

export function EqGlyph({ active, color = "#f0b445" }: { active: boolean; color?: string }) {
  return (
    <span className="flex h-3.5 items-end gap-[2.5px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-[3px] origin-bottom rounded-full ${["animate-eq-1", "animate-eq-2", "animate-eq-3"][i]} ${
            active ? "" : "[animation-play-state:paused] [transform:scaleY(0.3)]"
          }`}
          style={{ background: color }}
        />
      ))}
    </span>
  );
}

export function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-turq border-t-transparent" />;
}

export function Monogram({ name, hue, size = 44, ring }: { name: string; hue: number; size?: number; ring?: boolean }) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center rounded-full font-display text-night-950 ${ring ? "" : ""}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.46,
        background: `linear-gradient(135deg, hsl(${hue} 85% 64%), hsl(${hue + 38} 78% 52%))`,
      }}
    >
      {name.slice(0, 1)}
      {ring && <span className="absolute -inset-1 rounded-full border border-dashed border-foam/35 motion-safe:animate-spin-slow" />}
    </span>
  );
}

interface TableProps {
  tracks: TrackRuntime[];
  currentId: string | null;
  playing: boolean;
  liked: Set<string>;
  loadingId: string | null;
  onPlay: (t: TrackRuntime) => void;
  onLike: (id: string) => void;
  showAlbum?: boolean;
}

export function TrackTable({ tracks, currentId, playing, liked, loadingId, onPlay, onLike, showAlbum = true }: TableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-foam/8 bg-night-850/50">
      <div className="hidden grid-cols-[44px_1fr_1fr_64px_90px_56px_44px] items-center gap-3 border-b border-foam/8 px-4 py-2.5 font-mono text-[10px] tracking-[0.18em] text-dim sm:grid">
        <span className="text-center">#</span>
        <span>عنوان</span>
        {showAlbum ? <span>آلبوم</span> : <span>دستگاه</span>}
        <span>سال</span>
        <span>پخش</span>
        <span className="text-center">
          <IconClock size={13} className="mx-auto" />
        </span>
        <span />
      </div>
      <ul>
        {tracks.map((t, i) => {
          const artist = artistById(t.artistId);
          const active = t.id === currentId;
          const isLiked = liked.has(t.id);
          return (
            <li
              key={t.id}
              className={`group grid cursor-pointer grid-cols-[44px_1fr_44px] items-center gap-3 border-b border-foam/5 px-4 py-2.5 transition-all duration-200 last:border-0 sm:grid-cols-[44px_1fr_1fr_64px_90px_56px_44px] ${
                active ? "bg-night-800/80" : "hover:bg-foam/4"
              }`}
              onClick={() => onPlay(t)}
            >
              <span className="flex w-11 items-center justify-center">
                {loadingId === t.id ? (
                  <Spinner />
                ) : active && playing ? (
                  <EqGlyph active />
                ) : (
                  <>
                    <span className={`font-mono text-xs text-dim group-hover:hidden ${active ? "text-turq" : ""}`}>{faNum(i + 1)}</span>
                    <span className="hidden text-foam group-hover:block">
                      {active ? <IconPause size={15} /> : <IconPlay size={15} />}
                    </span>
                  </>
                )}
              </span>
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-night-950/80"
                  style={{ background: `linear-gradient(135deg, hsl(${t.hue} 70% 58%), hsl(${t.hue + 30} 65% 42%))` }}
                >
                  <IconNote size={16} />
                </span>
                <span className="min-w-0">
                  <span className={`block truncate text-sm font-bold ${active ? "text-turq" : "text-foam"}`}>{t.title}</span>
                  <span className="block truncate text-xs text-mist">{t.uploaded ? "فایل شما" : artist?.name}</span>
                </span>
              </span>
              <span className="hidden truncate text-xs text-mist sm:block">{showAlbum ? `«${t.album}»` : t.dastgah}</span>
              <span className="hidden font-mono text-xs text-dim sm:block">{t.year ? faNum(t.year) : "—"}</span>
              <span className="hidden font-mono text-xs text-dim sm:block">{t.plays ? faPlays(t.plays) : "—"}</span>
              <span className="hidden text-center font-mono text-xs text-mist sm:block">{faTime(t.duration)}</span>
              <span className="flex justify-center">
                <button
                  aria-label={isLiked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike(t.id);
                  }}
                  className={`rounded-full p-2 transition-all duration-200 active:scale-75 ${
                    isLiked ? "text-coral" : "text-dim opacity-0 hover:text-coral group-hover:opacity-100"
                  }`}
                >
                  <IconHeart size={16} filled={isLiked} />
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- خانه ---------- */

interface HomeProps extends TableProps {
  onOpenArtist: (id: string) => void;
  onOpenGenre: (g: string) => void;
  onPlayArtist: (a: Artist) => void;
  onSearch: () => void;
}

export function HomeView({ onOpenArtist, onOpenGenre, onPlayArtist, onSearch, ...table }: HomeProps) {
  const featured = ARTISTS[2];
  const trending = [...table.tracks]
    .filter((t) => !t.uploaded)
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 8);
  const fresh = [...table.tracks]
    .filter((t) => !t.uploaded)
    .sort((a, b) => b.year - a.year || b.plays - a.plays)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pb-10 pt-8 sm:px-8">
      <header className="animate-rise">
        <p className="font-mono text-[11px] tracking-[0.3em] text-turq">IRANTIFY</p>
        <h1 className="mt-1 font-display text-4xl text-foam sm:text-5xl">{greeting()}، خوش آمدی</h1>
        <p className="mt-2 max-w-xl text-sm leading-7 text-mist">
          آرشیو زندهٔ موسیقی ایران — از بداههٔ سه‌تار تا پالس‌های الکترونیک. هر اثر در دستگاه خودش رندر می‌شود و آمادهٔ
          پخش است.
        </p>
      </header>

      {/* هنرمند هفته */}
      <section
        className="animate-rise relative overflow-hidden rounded-2xl border border-foam/10 p-6 sm:p-8"
        style={{ animationDelay: "80ms", background: `linear-gradient(240deg, hsl(${featured.hue} 45% 16%), hsl(${featured.hue} 50% 8%) 70%)` }}
      >
        <div className="girih-saffron pointer-events-none absolute inset-0" />
        <div
          className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: `hsl(${featured.hue} 90% 55%)` }}
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <Monogram name={featured.name} hue={featured.hue} size={104} ring />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-saffron">
              <IconSpark size={13} /> هنرمند هفته
            </p>
            <h2 className="mt-1 font-display text-3xl text-foam sm:text-4xl">{featured.name}</h2>
            <p className="mt-1.5 max-w-md text-sm leading-6 text-mist">{featured.bio}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              onClick={() => onPlayArtist(featured)}
              className="flex items-center gap-2 rounded-full bg-turq px-6 py-2.5 text-sm font-extrabold text-night-950 shadow-lg shadow-turq/20 transition-all duration-200 hover:scale-105 hover:bg-foam active:scale-95"
            >
              <IconPlay size={16} /> پخش آثار
            </button>
            <button
              onClick={() => onOpenArtist(featured.id)}
              className="rounded-full border border-foam/20 px-5 py-2.5 text-sm font-bold text-foam transition-all duration-200 hover:border-turq hover:text-turq active:scale-95"
            >
              آرشیو
            </button>
          </div>
        </div>
      </section>

      {/* ژانرها */}
      <section className="animate-rise" style={{ animationDelay: "140ms" }}>
        <SectionTitle title="دسته‌بندی‌ها" sub="هر ژانر، یک جهان صوتی" />
        <div className="slim-scroll -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {GENRES.map((g) => {
            const count = table.tracks.filter((t) => t.genre === g.id).length;
            return (
              <button
                key={g.id}
                onClick={() => onOpenGenre(g.id)}
                className="group relative min-w-[168px] shrink-0 overflow-hidden rounded-xl border border-foam/10 p-4 text-right transition-all duration-300 hover:-translate-y-1 hover:border-foam/25 hover:shadow-xl hover:shadow-black/40"
                style={{ background: `linear-gradient(150deg, hsl(${g.hue} 42% 15%), hsl(${g.hue} 45% 8%))` }}
              >
                <div className="girih pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative block font-display text-2xl" style={{ color: `hsl(${g.hue} 85% 66%)` }}>
                  {g.id}
                </span>
                <span className="relative mt-1 block text-[11px] text-mist">{g.desc}</span>
                <span className="relative mt-3 block font-mono text-[10px] text-dim">{faNum(count)} اثر</span>
                <span
                  className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-50"
                  style={{ background: `hsl(${g.hue} 90% 55%)` }}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* پرطرفدارها */}
      <section className="animate-rise" style={{ animationDelay: "200ms" }}>
        <SectionTitle title="پرطرفدارهای این هفته" sub="بیشترین پخش در ایران‌تیفای" />
        <TrackTable {...table} tracks={trending} />
      </section>

      {/* هنرمندان */}
      <section className="animate-rise" style={{ animationDelay: "240ms" }}>
        <SectionTitle title="هنرمندان" sub="راویانِ صدا" />
        <div className="slim-scroll -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
          {ARTISTS.map((a) => (
            <button
              key={a.id}
              onClick={() => onOpenArtist(a.id)}
              className="group flex w-[118px] shrink-0 flex-col items-center gap-2.5 rounded-xl border border-transparent p-3 transition-all duration-300 hover:-translate-y-1 hover:border-foam/10 hover:bg-foam/4"
            >
              <span className="relative">
                <Monogram name={a.name} hue={a.hue} size={72} />
                <span
                  className="absolute -inset-1.5 rounded-full border border-dashed border-foam/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-safe:animate-spin-slow"
                />
              </span>
              <span className="w-full truncate text-center text-xs font-bold text-foam">{a.name}</span>
              <span className="font-mono text-[9.5px] text-dim">{a.genres.join(" · ")}</span>
            </button>
          ))}
        </div>
      </section>

      {/* تازه‌ها */}
      <section className="animate-rise" style={{ animationDelay: "280ms" }}>
        <SectionTitle title="تازه‌های آرشیو" sub="منتخب سردبیر" />
        <TrackTable {...table} tracks={fresh} showAlbum={false} />
        <p className="mt-6 text-center">
          <button
            onClick={onSearch}
            className="rounded-full border border-foam/15 px-6 py-2 text-xs font-bold text-mist transition-all duration-200 hover:border-turq/60 hover:text-turq"
          >
            جستجو در همهٔ آثار ←
          </button>
        </p>
      </section>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <h3 className="font-display text-2xl text-foam">{title}</h3>
      {sub && <span className="hidden text-[11px] text-dim sm:block">{sub}</span>}
      <span className="h-px flex-1 bg-gradient-to-l from-foam/15 to-transparent" />
    </div>
  );
}

/* ---------- جستجو ---------- */

interface SearchProps extends TableProps {
  query: string;
  setQuery: (q: string) => void;
  genre: string;
  setGenre: (g: string) => void;
}

export function SearchView({ query, setQuery, genre, setGenre, ...table }: SearchProps) {
  const nq = normalizeFa(query.trim());
  const results = table.tracks.filter((t) => {
    if (genre !== "همه" && t.genre !== genre) return false;
    if (!nq) return true;
    const artist = artistById(t.artistId)?.name ?? "";
    return normalizeFa(`${t.title} ${artist} ${t.album} ${t.dastgah}`).includes(nq);
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-10 pt-8 sm:px-8">
      <header className="animate-rise">
        <h1 className="font-display text-4xl text-foam">جستجو و کتابخانه</h1>
        <div className="relative mt-5">
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-dim">
            <IconSearch size={18} />
          </span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="نام اثر، هنرمند، آلبوم یا دستگاه…"
            className="w-full rounded-xl border border-foam/12 bg-night-850/80 py-3.5 pl-4 pr-12 text-sm text-foam placeholder:text-dim outline-none transition-all duration-200 focus:border-turq/60 focus:bg-night-850 focus:shadow-lg focus:shadow-turq/5"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["همه", ...GENRES.map((g) => g.id)].map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                genre === g
                  ? "bg-turq text-night-950 shadow-md shadow-turq/20"
                  : "border border-foam/12 text-mist hover:border-turq/50 hover:text-turq"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </header>

      <p className="font-mono text-[11px] tracking-wide text-dim">
        {faNum(results.length)} اثر پیدا شد {nq || genre !== "همه" ? "· فیلتر فعال" : "· همهٔ آرشیو"}
      </p>
      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foam/15 py-16 text-center">
          <IconSearch size={30} className="text-dim" />
          <p className="text-sm font-bold text-foam">چیزی پیدا نشد</p>
          <p className="text-xs text-mist">املای عبارت را بررسی کن یا فیلتر ژانر را بردار.</p>
        </div>
      ) : (
        <TrackTable {...table} tracks={results} />
      )}
    </div>
  );
}

/* ---------- هنرمندان ---------- */

export function ArtistsView({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-10 pt-8 sm:px-8">
      <header className="animate-rise">
        <h1 className="font-display text-4xl text-foam">هنرمندان</h1>
        <p className="mt-2 text-sm text-mist">{faNum(ARTISTS.length)} هنرمند · آرشیو کامل آثار با دسته‌بندی دقیق</p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ARTISTS.map((a, i) => (
          <button
            key={a.id}
            onClick={() => onOpen(a.id)}
            className="animate-rise group relative overflow-hidden rounded-xl border border-foam/10 p-5 text-right transition-all duration-300 hover:-translate-y-1 hover:border-foam/25 hover:shadow-2xl hover:shadow-black/40"
            style={{ animationDelay: `${i * 50}ms`, background: `linear-gradient(150deg, hsl(${a.hue} 38% 14%), hsl(${a.hue} 42% 7%))` }}
          >
            <div className="girih pointer-events-none absolute inset-0 opacity-60" />
            <div className="relative flex items-center gap-4">
              <Monogram name={a.name} hue={a.hue} size={64} />
              <div className="min-w-0">
                <h3 className="font-display text-xl text-foam transition-colors duration-200 group-hover:text-turq">{a.name}</h3>
                <p className="mt-0.5 font-mono text-[10px] text-dim">
                  {a.city} · {a.genres.join("، ")}
                </p>
                <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-5 text-mist">{a.bio}</p>
              </div>
            </div>
            <span
              className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full opacity-15 blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-40"
              style={{ background: `hsl(${a.hue} 90% 55%)` }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- صفحهٔ هنرمند ---------- */

interface ArtistProps extends TableProps {
  artist: Artist;
  onPlayAll: () => void;
}

export function ArtistView({ artist, onPlayAll, ...table }: ArtistProps) {
  const albums = albumsOfArtist(artist.id);
  const artistTracks = table.tracks.filter((t) => t.artistId === artist.id);
  const totalSec = artistTracks.reduce((s, t) => s + t.duration, 0);

  return (
    <div className="pb-10">
      <header
        className="relative overflow-hidden px-4 pb-8 pt-14 sm:px-8"
        style={{ background: `linear-gradient(200deg, hsl(${artist.hue} 45% 17%), hsl(${artist.hue} 48% 8%) 75%)` }}
      >
        <div className="girih-saffron pointer-events-none absolute inset-0" />
        <div
          className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 rounded-full opacity-25 blur-3xl"
          style={{ background: `hsl(${artist.hue} 90% 55%)` }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 sm:flex-row sm:items-end">
          <Monogram name={artist.name} hue={artist.hue} size={128} ring />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-saffron">
              <IconArtists size={13} /> هنرمند ایران‌تیفای
            </p>
            <h1 className="mt-1 font-display text-4xl text-foam sm:text-5xl">{artist.name}</h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-mist">{artist.bio}</p>
            <p className="mt-3 font-mono text-[11px] text-dim">
              {artist.city} · {faNum(artistTracks.length)} اثر · {faTotal(totalSec)}
            </p>
          </div>
          <button
            onClick={onPlayAll}
            className="flex shrink-0 items-center gap-2 rounded-full bg-turq px-7 py-3 text-sm font-extrabold text-night-950 shadow-lg shadow-turq/25 transition-all duration-200 hover:scale-105 hover:bg-foam active:scale-95"
          >
            <IconPlay size={16} /> پخش همه
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-10 px-4 pt-8 sm:px-8">
        {albums.map((al) => (
          <section key={al.album} className="animate-rise">
            <div className="mb-4 flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-lg font-display text-xl text-night-950"
                style={{ background: `linear-gradient(135deg, hsl(${artist.hue} 75% 60%), hsl(${artist.hue + 30} 70% 45%))` }}
              >
                {al.album.slice(0, 1)}
              </span>
              <div>
                <h3 className="font-display text-xl text-foam">«{al.album}»</h3>
                <p className="font-mono text-[10.5px] text-dim">آلبوم · {faNum(al.year)}</p>
              </div>
            </div>
            <TrackTable {...table} tracks={al.tracks.map((d) => table.tracks.find((t) => t.id === d.id)!).filter(Boolean)} showAlbum={false} />
          </section>
        ))}
      </div>
    </div>
  );
}

/* ---------- علاقه‌مندی‌ها ---------- */

export function LikedView({ tracks, ...table }: TableProps) {
  const likedTracks = tracks.filter((t) => table.liked.has(t.id));
  const totalSec = likedTracks.reduce((s, t) => s + t.duration, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-10 pt-8 sm:px-8">
      <header className="animate-rise relative overflow-hidden rounded-2xl border border-coral/20 p-6 sm:p-8" style={{ background: "linear-gradient(220deg, hsl(345 40% 15%), hsl(345 45% 7%))" }}>
        <div className="girih pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative flex items-center gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-coral/15 text-coral">
            <IconHeart size={30} filled />
          </span>
          <div>
            <h1 className="font-display text-3xl text-foam sm:text-4xl">علاقه‌مندی‌های تو</h1>
            <p className="mt-1 text-sm text-mist">
              {faNum(likedTracks.length)} اثر · {faTotal(totalSec)} موسیقی دلنشین
            </p>
          </div>
        </div>
      </header>
      {likedTracks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foam/15 py-16 text-center">
          <IconHeart size={30} className="text-dim" />
          <p className="text-sm font-bold text-foam">هنوز اثری را نپسندیده‌ای</p>
          <p className="text-xs text-mist">روی نشانِ قلب کنار هر اثر بزن تا اینجا جمع شوند.</p>
        </div>
      ) : (
        <TrackTable {...table} tracks={likedTracks} />
      )}
    </div>
  );
}
