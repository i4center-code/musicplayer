import { useCallback, useEffect, useRef, useState } from "react";
import PlayerBar from "./components/PlayerBar";
import StoryViewer, { exportStoryCard } from "./components/StoryViewer";
import Visualizer from "./components/Visualizer";
import {
  IconArtists,
  IconHeart,
  IconHome,
  IconSearch,
  IconUpload,
  Logo,
} from "./components/icons";
import { ArtistView, ArtistsView, HomeView, LikedView, SearchView } from "./components/views";
import { decodeFile, extractPeaks, type VizMode } from "./lib/audio";
import { TRACKS, artistById, faNum, toSpec, type Artist, type TrackRuntime } from "./lib/catalog";
import { renderTrack } from "./lib/synth";

type View =
  | { name: "home" }
  | { name: "search" }
  | { name: "artists" }
  | { name: "artist"; id: string }
  | { name: "liked" };

interface Toast {
  id: number;
  msg: string;
  kind: "ok" | "err";
}

const LS_LIKED = "irantify_liked";
const LS_VOL = "irantify_vol";
const LS_LAST = "irantify_last";

const toRuntime = (t: (typeof TRACKS)[number]): TrackRuntime => ({ ...t, ready: false });

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  /* ---------- داده و پخش ---------- */
  const [tracks, setTracks] = useState<TrackRuntime[]>(() => TRACKS.map(toRuntime));
  const [queue, setQueue] = useState<string[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "all" | "one">("off");
  const [liked, setLiked] = useState<Set<string>>(() => {
    try {
      return new Set<string>(JSON.parse(localStorage.getItem(LS_LIKED) ?? "[]"));
    } catch {
      return new Set();
    }
  });
  const [volume, setVolume] = useState(() => {
    const v = Number(localStorage.getItem(LS_VOL));
    return Number.isFinite(v) && v > 0 ? v : 0.85;
  });
  const [muted, setMuted] = useState(false);
  const [vizMode, setVizMode] = useState<VizMode>("bars");
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  /* ---------- رابط ---------- */
  const [view, setView] = useState<View>({ name: "home" });
  const [showQueue, setShowQueue] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("همه");

  const [audio] = useState(() => new Audio());
  const graphRef = useRef<{ ctx: AudioContext; analyser: AnalyserNode } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const contextRef = useRef<{ ids: string[] } | null>(null);
  const dragDepth = useRef(0);
  const toastId = useRef(0);

  const currentId = queue[qIndex] ?? null;
  const current = tracks.find((t) => t.id === currentId) ?? null;
  const hue = current?.hue ?? 174;
  const queueTracks = queue.map((id) => tracks.find((t) => t.id === id)).filter(Boolean) as TrackRuntime[];

  /* ---------- توست ---------- */
  const toast = useCallback((msg: string, kind: Toast["kind"] = "ok") => {
    const id = ++toastId.current;
    setToasts((p) => [...p.slice(-2), { id, msg, kind }]);
    window.setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3400);
  }, []);

  /* ---------- موتور صدا ---------- */
  const ensureGraph = useCallback(() => {
    if (graphRef.current) return graphRef.current;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const src = ctx.createMediaElementSource(audio);
    const an = ctx.createAnalyser();
    an.fftSize = 2048;
    an.smoothingTimeConstant = 0.82;
    src.connect(an);
    an.connect(ctx.destination);
    graphRef.current = { ctx, analyser: an };
    setAnalyser(an);
    return graphRef.current;
  }, [audio]);

  const ensureReady = useCallback(
    async (t: TrackRuntime): Promise<TrackRuntime> => {
      if (t.ready && t.url) return t;
      setLoadingId(t.id);
      try {
        const rendered = await renderTrack(t.id, toSpec(t));
        const ready = { ...t, ready: true, url: rendered.url, peaks: rendered.peaks };
        setTracks((prev) => prev.map((x) => (x.id === t.id ? ready : x)));
        return ready;
      } finally {
        setLoadingId((cur) => (cur === t.id ? null : cur));
      }
    },
    []
  );

  const startTrack = useCallback(
    async (t: TrackRuntime) => {
      try {
        const ready = await ensureReady(t);
        ensureGraph();
        void graphRef.current?.ctx.resume();
        if (audio.src !== ready.url) audio.src = ready.url!;
        audio.currentTime = 0;
        await audio.play();
        localStorage.setItem(LS_LAST, t.id);
      } catch {
        toast("پخش ممکن نشد — دوباره تلاش کن", "err");
      }
    },
    [audio, ensureGraph, ensureReady, toast]
  );

  const playContext = useCallback(
    (ids: string[], startId: string) => {
      if (!ids.length) return;
      contextRef.current = { ids };
      if (shuffle) {
        const rest = shuffleArr(ids.filter((i) => i !== startId));
        setQueue([startId, ...rest]);
        setQIndex(0);
      } else {
        setQueue(ids);
        setQIndex(Math.max(0, ids.indexOf(startId)));
      }
      const t = tracks.find((x) => x.id === startId);
      if (t) void startTrack(t);
    },
    [shuffle, tracks, startTrack]
  );

  const playTrack = useCallback(
    (t: TrackRuntime) => {
      if (t.id === currentId) {
        togglePlayRef.current();
        return;
      }
      const ids = t.uploaded
        ? tracks.filter((x) => x.uploaded).map((x) => x.id)
        : tracks.filter((x) => x.album === t.album && !x.uploaded).map((x) => x.id);
      playContext(ids.length ? ids : [t.id], t.id);
    },
    [currentId, tracks, playContext]
  );

  const selectQueueIndex = useCallback(
    (i: number) => {
      const id = queue[i];
      if (!id) return;
      setQIndex(i);
      const t = tracks.find((x) => x.id === id);
      if (t) void startTrack(t);
    },
    [queue, tracks, startTrack]
  );

  const goNext = useCallback(
    (auto = false) => {
      if (!queue.length) return;
      if (qIndex < queue.length - 1) selectQueueIndex(qIndex + 1);
      else if (repeat === "all" || !auto) selectQueueIndex(0);
      else {
        audio.pause();
        setPlaying(false);
      }
    },
    [queue, qIndex, repeat, selectQueueIndex, audio]
  );

  const goPrev = useCallback(() => {
    if (!queue.length) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    selectQueueIndex(qIndex > 0 ? qIndex - 1 : queue.length - 1);
  }, [queue, qIndex, audio, selectQueueIndex]);

  const togglePlay = useCallback(() => {
    if (!current) {
      const first = [...tracks].sort((a, b) => b.plays - a.plays)[0];
      if (first) playTrack(first);
      return;
    }
    if (audio.paused) void startTrack(current);
    else audio.pause();
  }, [current, tracks, audio, playTrack, startTrack]);
  const togglePlayRef = useRef(togglePlay);
  togglePlayRef.current = togglePlay;

  const handleEnded = useCallback(() => {
    if (repeat === "one") {
      audio.currentTime = 0;
      void audio.play();
      return;
    }
    goNext(true);
  }, [repeat, audio, goNext]);

  /* رویدادهای عنصر صوتی */
  useEffect(() => {
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audio, handleEnded]);

  useEffect(() => {
    audio.volume = muted ? 0 : volume;
    localStorage.setItem(LS_VOL, String(volume));
  }, [audio, volume, muted]);

  useEffect(() => {
    localStorage.setItem(LS_LIKED, JSON.stringify([...liked]));
  }, [liked]);

  /* بازگردانی آخرین اثر */
  useEffect(() => {
    const last = localStorage.getItem(LS_LAST);
    if (!last) return;
    const t = TRACKS.find((x) => x.id === last);
    if (!t) return;
    const ids = TRACKS.filter((x) => x.album === t.album).map((x) => x.id);
    contextRef.current = { ids };
    setQueue(ids);
    setQIndex(Math.max(0, ids.indexOf(last)));
    void (async () => {
      const rt = toRuntime(t);
      const ready = await ensureReady({ ...rt });
      audio.src = ready.url!;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- آپلود ---------- */
  const ingest = useCallback(
    async (files: FileList | File[]) => {
      const list = [...files].filter((f) => f.type.startsWith("audio") || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(f.name));
      if (!list.length) {
        toast("این فایل‌ها صوتی نیستند", "err");
        return;
      }
      const newIds: string[] = [];
      for (const f of list) {
        try {
          const { buffer, url } = await decodeFile(f);
          const rt: TrackRuntime = {
            id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title: f.name.replace(/\.[^.]+$/, ""),
            artistId: "you",
            album: "فایل‌های شما",
            genre: "آپلود",
            dastgah: "—",
            root: 0,
            bpm: 0,
            seed: 0,
            duration: buffer.duration,
            year: 0,
            hue: Math.floor(Math.random() * 360),
            plays: 0,
            ready: true,
            url,
            peaks: extractPeaks(buffer, 130),
            uploaded: true,
          };
          newIds.push(rt.id);
          setTracks((prev) => [rt, ...prev]);
        } catch {
          toast(`خواندن «${f.name}» ممکن نشد`, "err");
        }
      }
      if (!newIds.length) return;
      toast(`${faNum(newIds.length)} اثر به آرشیو تو اضافه شد`);
      if (!currentId) playContext(newIds, newIds[0]);
      else {
        setQueue((prev) => {
          const q = [...newIds, ...prev];
          setQIndex((i) => i + newIds.length);
          return q;
        });
      }
    },
    [toast, currentId, playContext]
  );

  /* درگ و دراپ سراسری */
  useEffect(() => {
    const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes("Files");
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      dragDepth.current++;
      setDragOver(true);
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragOver(false);
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current = 0;
      setDragOver(false);
      if (e.dataTransfer?.files.length) void ingest(e.dataTransfer.files);
    };
    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("dragover", (e) => e.preventDefault());
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [ingest]);

  /* ---------- میان‌برهای کیبورد ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      const seekBy = (d: number) => {
        if (audio.duration) audio.currentTime = Math.min(audio.duration, Math.max(0, audio.currentTime + d));
      };
      switch (e.code) {
        case "Space":
          if (el && (el.tagName === "BUTTON" || el.getAttribute("role") === "button")) return;
          e.preventDefault();
          togglePlayRef.current();
          break;
        case "ArrowRight":
          seekBy(-5);
          break;
        case "ArrowLeft":
          seekBy(5);
          break;
        case "ArrowUp":
          e.preventDefault();
          setMuted(false);
          setVolume((v) => Math.min(1, +(v + 0.05).toFixed(2)));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((v) => Math.max(0, +(v - 0.05).toFixed(2)));
          break;
        case "KeyN":
          goNext();
          break;
        case "KeyB":
          goPrev();
          break;
        case "KeyM":
          setMuted((m) => !m);
          break;
        case "KeyS":
          if (currentId) setStoryOpen((s) => !s);
          break;
        case "Digit1":
          setVizMode("bars");
          break;
        case "Digit2":
          setVizMode("orbit");
          break;
        case "Digit3":
          setVizMode("pulse");
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [audio, goNext, goPrev, currentId]);

  /* ---------- علاقه‌مندی و صف ---------- */
  const toggleLike = useCallback(
    (id: string) => {
      setLiked((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
          toast("به علاقه‌مندی‌ها اضافه شد ♥");
        }
        return next;
      });
    },
    [toast]
  );

  const removeFromQueue = useCallback(
    (i: number) => {
      if (i === qIndex) {
        toast("اثر در حال پخش را نمی‌شود حذف کرد", "err");
        return;
      }
      setQueue((prev) => prev.filter((_, x) => x !== i));
      if (i < qIndex) setQIndex((x) => x - 1);
    },
    [qIndex, toast]
  );

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => {
      const next = !s;
      if (currentId) {
        if (next) {
          setQueue((prev) => [currentId, ...shuffleArr(prev.filter((id) => id !== currentId))]);
          setQIndex(0);
        } else if (contextRef.current) {
          const ids = contextRef.current.ids.filter((id) => tracks.some((t) => t.id === id));
          setQueue(ids);
          setQIndex(Math.max(0, ids.indexOf(currentId)));
        }
        toast(next ? "پخش تصادفی روشن شد" : "پخش به ترتیب آرشیو برگشت");
      }
      return next;
    });
  }, [currentId, tracks, toast]);

  /* ---------- اشتراک‌گذاری استوری ---------- */
  const shareStory = useCallback(
    async (t: TrackRuntime) => {
      const ready = await ensureReady(t);
      const blob = await exportStoryCard(ready);
      const file = new File([blob], `irantify-story-${t.id}.png`, { type: "image/png" });
      let shared = false;
      try {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "استوری ایران‌تیفای", text: `${t.title} — در ایران‌تیفای گوش کن` });
          shared = true;
        }
      } catch {
        /* کاربر لغو کرد */
      }
      if (!shared) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }
      toast("استوری ساخته و ذخیره شد");
    },
    [ensureReady, toast]
  );

  /* ---------- نمای جاری ---------- */
  const tableProps = {
    tracks,
    currentId,
    playing,
    liked,
    loadingId,
    onPlay: playTrack,
    onLike: toggleLike,
  };

  const openGenre = (g: string) => {
    setGenreFilter(g);
    setQuery("");
    setView({ name: "search" });
  };

  const playArtist = (a: Artist) => {
    const ids = tracks.filter((t) => t.artistId === a.id).map((t) => t.id);
    if (ids.length) playContext(ids, ids[0]);
  };

  let content: React.ReactNode;
  switch (view.name) {
    case "search":
      content = (
        <SearchView {...tableProps} query={query} setQuery={setQuery} genre={genreFilter} setGenre={setGenreFilter} />
      );
      break;
    case "artists":
      content = <ArtistsView onOpen={(id) => setView({ name: "artist", id })} />;
      break;
    case "artist": {
      const artist = artistById(view.id);
      content = artist ? (
        <ArtistView {...tableProps} artist={artist} onPlayAll={() => playArtist(artist)} />
      ) : null;
      break;
    }
    case "liked":
      content = <LikedView {...tableProps} />;
      break;
    default:
      content = (
        <HomeView
          {...tableProps}
          onOpenArtist={(id) => setView({ name: "artist", id })}
          onOpenGenre={openGenre}
          onPlayArtist={playArtist}
          onSearch={() => setView({ name: "search" })}
        />
      );
  }

  const NAV: { key: View["name"]; label: string; icon: React.ReactNode }[] = [
    { key: "home", label: "خانه", icon: <IconHome size={17} /> },
    { key: "search", label: "جستجو", icon: <IconSearch size={17} /> },
    { key: "artists", label: "هنرمندان", icon: <IconArtists size={17} /> },
    { key: "liked", label: "علاقه‌مندی‌ها", icon: <IconHeart size={17} /> },
  ];

  const navBtn = (n: (typeof NAV)[number], compact = false) => {
    const active = view.name === n.key || (n.key === "artists" && view.name === "artist");
    return (
      <button
        key={n.key}
        onClick={() => setView({ name: n.key } as View)}
        title={n.label}
        className={`flex items-center gap-3 rounded-lg transition-all duration-200 active:scale-95 ${
          compact ? "p-2.5" : "w-full px-3.5 py-2.5"
        } ${active ? "bg-turq/12 text-turq shadow-inner" : "text-mist hover:bg-foam/5 hover:text-foam"}`}
      >
        {n.icon}
        {!compact && <span className="text-sm font-bold">{n.label}</span>}
        {!compact && n.key === "liked" && liked.size > 0 && (
          <span className="mr-auto rounded-full bg-coral/15 px-2 py-0.5 font-mono text-[10px] text-coral">{faNum(liked.size)}</span>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-night-900 text-foam">
      {/* سربرگ موبایل */}
      <header className="flex items-center gap-1 border-b border-foam/8 bg-night-900/90 px-3 py-2.5 lg:hidden">
        <span className="flex items-center gap-2 text-turq">
          <Logo size={24} />
          <span className="font-display text-lg leading-none text-foam">ایران‌تیفای</span>
        </span>
        <span className="mx-2 h-5 w-px bg-foam/10" />
        <div className="flex flex-1 items-center gap-1">
          {NAV.map((n) => navBtn(n, true))}
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          aria-label="آپلود صدا"
          className="rounded-full bg-turq/12 p-2.5 text-turq transition-transform active:scale-90"
        >
          <IconUpload size={16} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* سایدبار */}
        <aside className="hidden w-[228px] shrink-0 flex-col border-l border-foam/8 bg-night-900/80 lg:flex">
          <div className="flex items-center gap-2.5 px-5 pb-6 pt-6 text-turq">
            <Logo size={30} />
            <span>
              <span className="block font-display text-xl leading-none text-foam">ایران‌تیفای</span>
              <span className="mt-0.5 block font-mono text-[8.5px] tracking-[0.34em] text-dim">IRANTIFY</span>
            </span>
          </div>
          <nav className="space-y-1 px-3">{NAV.map((n) => navBtn(n))}</nav>

          <div className="mx-4 my-5 h-px bg-foam/8" />

          <button
            onClick={() => fileRef.current?.click()}
            className="group mx-4 rounded-xl border border-dashed border-turq/30 p-4 text-right transition-all duration-300 hover:border-turq/70 hover:bg-turq/6"
          >
            <span className="flex items-center gap-2 text-turq">
              <IconUpload size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span className="text-sm font-extrabold">آپلود صدا</span>
            </span>
            <span className="mt-1.5 block text-[11px] leading-5 text-mist">
              فایل‌های خودت را رها کن تا به داستان اضافه شوند — یا همین‌جا بزن.
            </span>
          </button>

          <div className="mt-auto px-5 py-4">
            <p className="font-mono text-[9px] leading-5 text-dim">
              Space پخش · N بعدی · S استوری
              <br />
              M بی‌صدا · ۱۲۳ حالت بصری‌ساز
            </p>
            <p className="mt-2 font-mono text-[9px] text-dim/70">ساخته‌شده با Web Audio — رندر زندهٔ دستگاه‌ها</p>
          </div>
        </aside>

        {/* صحنهٔ اصلی */}
        <main className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.13]">
              <Visualizer analyser={analyser} mode={vizMode} playing={playing} hue={hue} />
            </div>
            <div
              className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl animate-drift-a"
              style={{ background: `hsl(${hue} 70% 45%)` }}
            />
            <div className="absolute -bottom-32 -left-20 h-[380px] w-[380px] rounded-full bg-saffron opacity-[0.07] blur-3xl animate-drift-b" />
            <div className="girih absolute inset-0 opacity-30" />
            <div className="absolute inset-0 bg-night-900/45" />
          </div>
          <div className="slim-scroll relative z-10 h-full overflow-y-auto">{content}</div>
        </main>
      </div>

      {/* نوار پخش */}
      <PlayerBar
        current={current}
        playing={playing}
        loading={loadingId === currentId}
        audio={audio}
        analyser={analyser}
        shuffle={shuffle}
        repeat={repeat}
        liked={liked}
        volume={volume}
        muted={muted}
        vizMode={vizMode}
        showQueue={showQueue}
        queueTracks={queueTracks}
        queueIndex={qIndex}
        onTogglePlay={() => togglePlayRef.current()}
        onNext={() => goNext()}
        onPrev={goPrev}
        onToggleShuffle={toggleShuffle}
        onCycleRepeat={() => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"))}
        onLike={toggleLike}
        onVolume={(v) => {
          setVolume(v);
          setMuted(false);
        }}
        onToggleMute={() => setMuted((m) => !m)}
        onVizMode={setVizMode}
        onToggleQueue={() => setShowQueue((s) => !s)}
        onSelectQueue={selectQueueIndex}
        onRemoveQueue={removeFromQueue}
        onOpenStory={() => setStoryOpen(true)}
        onUpload={() => fileRef.current?.click()}
      />

      {/* استوری */}
      {storyOpen && current && queueTracks.length > 0 && (
        <StoryViewer
          items={queueTracks}
          index={qIndex}
          playing={playing}
          analyser={analyser}
          onNavigate={selectQueueIndex}
          onClose={() => setStoryOpen(false)}
          onTogglePlay={() => togglePlayRef.current()}
          onHold={(h) => {
            if (h) audio.pause();
            else if (playing) void audio.play().catch(() => undefined);
          }}
          onShare={shareStory}
        />
      )}

      {/* پوشش درگ */}
      {dragOver && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-night-950/80 p-6 backdrop-blur-sm">
          <div className="animate-pop flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-turq/70 bg-night-850/90 px-8 py-14 text-center shadow-2xl shadow-turq/10">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-turq/12 text-turq">
              <IconUpload size={28} />
            </span>
            <p className="font-display text-2xl text-foam">فایل‌های صوتی را رها کن</p>
            <p className="text-xs text-mist">MP3 · WAV · OGG · M4A · FLAC — به داستانِ پخش اضافه می‌شوند</p>
          </div>
        </div>
      )}

      {/* توست‌ها */}
      <div className="pointer-events-none fixed bottom-28 left-1/2 z-80 flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in rounded-full border px-4 py-2 text-xs font-bold shadow-xl shadow-black/50 backdrop-blur-md ${
              t.kind === "err" ? "border-coral/50 bg-night-850/95 text-coral" : "border-turq/40 bg-night-850/95 text-foam"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void ingest(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
