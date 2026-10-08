import { useCallback, useEffect, useRef, useState } from "react";
import AuthScreen from "./components/AuthScreen";
import BottomNav, { type Tab } from "./components/BottomNav";
import CreateStory from "./components/CreateStory";
import EqualizerScreen from "./components/EqualizerScreen";
import LibraryScreen, { ArtistStudio } from "./components/LibraryScreen";
import MobilePlayer from "./components/MobilePlayer";
import StoryViewer from "./components/StoryViewer";
import { ArtistLanding, ArtistsScreen, HomeScreen, MoodScreen } from "./components/screens";
import { num, t, useT } from "./lib/i18n";
import type { CarConfig, Story, User } from "./lib/state";
import {
  loadSaved,
  loadStories,
  loadUser,
  optimizeCarGains,
  saveSaved,
  saveStories,
  saveUser,
  uid,
} from "./lib/state";
import type { TrackRuntime } from "./lib/catalog";
import { TRACKS, toSpec, tracksOfArtist } from "./lib/catalog";
import { decodeFile, extractPeaks, type VizMode } from "./lib/audio";
import { presetById } from "./lib/state";
import { renderTrack } from "./lib/synth";

const REAL_FREQS = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const LS_LIKED = "irantify_liked";
const LS_LAST = "irantify_last";
const LS_GAINS = "irantify_gains";
const LS_PRESET = "irantify_preset";
const LS_CAR = "irantify_car";
const LS_SAVEDCARS = "irantify_savedcars";

const toRuntime = (tr: (typeof TRACKS)[number]): TrackRuntime => ({ ...tr, ready: false });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface UploadState {
  name: string;
  step: number; // 0..2
  pct: number;
  done: number;
  total: number;
}

export default function App() {
  const { lang } = useT();

  /* ---------- کاربر ---------- */
  const [user, setUser] = useState<User | null>(() => loadUser());
  const [authOpen, setAuthOpen] = useState(false);

  /* ---------- ناوبری ---------- */
  const [tab, setTab] = useState<Tab>("home");
  const [landing, setLanding] = useState<string | "me" | null>(null);
  const [eqOpen, setEqOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createTrackId, setCreateTrackId] = useState<string | null>(null);
  const [storyIndex, setStoryIndex] = useState<number | null>(null);

  /* ---------- داده ---------- */
  const [tracks, setTracks] = useState<TrackRuntime[]>(() => TRACKS.map(toRuntime));
  const [liked, setLiked] = useState<Set<string>>(() => {
    try {
      return new Set<string>(JSON.parse(localStorage.getItem(LS_LIKED) ?? "[]"));
    } catch {
      return new Set();
    }
  });
  const [savedIds, setSavedIds] = useState<string[]>(() => loadSaved());
  const [stories, setStories] = useState<Story[]>(() => loadStories());
  const [mood, setMood] = useState<string | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [savedTab, setSavedTab] = useState<"files" | "likes" | "saved">("files");
  const [upload, setUpload] = useState<UploadState | null>(null);

  /* ---------- اکولایزر ---------- */
  const [gains, setGainsState] = useState<number[]>(() => {
    try {
      const g = JSON.parse(localStorage.getItem(LS_GAINS) ?? "null");
      if (Array.isArray(g) && g.length === 10) return g;
    } catch { /* ignore */ }
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  });
  const [presetId, setPresetId] = useState<string>(() => localStorage.getItem(LS_PRESET) ?? "flat");
  const [car, setCar] = useState<CarConfig>(() => {
    try {
      const c = JSON.parse(localStorage.getItem(LS_CAR) ?? "null");
      if (c) return c as CarConfig;
    } catch { /* ignore */ }
    return { headunit: "pioneer", hasSub: true, subLocation: "trunk", frontCount: 2, rearCount: 2, hasTweeter: false };
  });
  const [savedCars, setSavedCars] = useState<{ name: string; gains: number[]; car: CarConfig }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_SAVEDCARS) ?? "[]");
    } catch {
      return [];
    }
  });

  /* ---------- پخش ---------- */
  const [queue, setQueue] = useState<string[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "all" | "one">("off");
  const [vizMode, setVizMode] = useState<VizMode>("bars");
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const [audio] = useState(() => new Audio());
  const graphRef = useRef<{ ctx: AudioContext; filters: BiquadFilterNode[] } | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const toastId = useRef(0);

  const currentId = queue[qIndex] ?? null;
  const current = tracks.find((x) => x.id === currentId) ?? null;

  /* ---------- توست ---------- */
  const toast = useCallback((msg: string) => {
    const id = ++toastId.current;
    setToasts((p) => [...p.slice(-1), { id, msg }]);
    window.setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 2600);
  }, []);

  /* ---------- گراف صدا با اکولایزر ---------- */
  const ensureGraph = useCallback(() => {
    if (graphRef.current) return graphRef.current;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const src = ctx.createMediaElementSource(audio);
    const filters = REAL_FREQS.map((f, i) => {
      const b = ctx.createBiquadFilter();
      b.type = i === 0 ? "lowshelf" : i === REAL_FREQS.length - 1 ? "highshelf" : "peaking";
      b.frequency.value = f;
      b.Q.value = 1.2;
      b.gain.value = 0;
      return b;
    });
    const an = ctx.createAnalyser();
    an.fftSize = 2048;
    an.smoothingTimeConstant = 0.82;
    src.connect(filters[0]);
    for (let i = 0; i < filters.length - 1; i++) filters[i].connect(filters[i + 1]);
    filters[filters.length - 1].connect(an);
    an.connect(ctx.destination);
    filtersRef.current = filters;
    graphRef.current = { ctx, filters };
    setAnalyser(an);
    return graphRef.current;
  }, [audio]);

  const applyGains = useCallback((g: number[]) => {
    setGainsState(g);
    localStorage.setItem(LS_GAINS, JSON.stringify(g));
    filtersRef.current.forEach((f, i) => {
      f.gain.value = g[i] ?? 0;
    });
  }, []);

  useEffect(() => {
    filtersRef.current.forEach((f, i) => {
      f.gain.value = gains[i] ?? 0;
    });
  }, [gains]);

  /* ---------- آماده‌سازی اثر ---------- */
  const ensureReady = useCallback(async (tr: TrackRuntime): Promise<TrackRuntime> => {
    if (tr.ready && tr.url) return tr;
    setLoadingId(tr.id);
    try {
      const rendered = await renderTrack(tr.id, toSpec(tr));
      const ready = { ...tr, ready: true, url: rendered.url, peaks: rendered.peaks };
      setTracks((prev) => prev.map((x) => (x.id === tr.id ? ready : x)));
      return ready;
    } finally {
      setLoadingId((c) => (c === tr.id ? null : c));
    }
  }, []);

  const startTrack = useCallback(
    async (tr: TrackRuntime) => {
      try {
        const ready = await ensureReady(tr);
        ensureGraph();
        void graphRef.current?.ctx.resume();
        if (audio.src !== ready.url) audio.src = ready.url!;
        audio.currentTime = 0;
        await audio.play();
        localStorage.setItem(LS_LAST, tr.id);
      } catch {
        toast(lang === "fa" ? "پخش ممکن نشد" : "Playback failed");
      }
    },
    [audio, ensureGraph, ensureReady, toast, lang]
  );

  const playFromList = useCallback(
    (list: TrackRuntime[], id: string) => {
      if (!list.length) return;
      let ids = list.map((x) => x.id);
      let idx = ids.indexOf(id);
      if (shuffle) {
        const rest = ids.filter((x) => x !== id).sort(() => Math.random() - 0.5);
        ids = [id, ...rest];
        idx = 0;
      }
      setQueue(ids);
      setQIndex(Math.max(0, idx));
      const tr = tracks.find((x) => x.id === id);
      if (tr) void startTrack(tr);
    },
    [shuffle, tracks, startTrack]
  );

  const playTrack = useCallback(
    (id: string) => {
      const tr = tracks.find((x) => x.id === id);
      if (!tr) return;
      if (id === currentId) {
        togglePlayRef.current();
        return;
      }
      const list = tr.uploaded ? tracks.filter((x) => x.uploaded) : tracks.filter((x) => x.album === tr.album && !x.uploaded);
      playFromList(list.length ? list : [tr], id);
    },
    [tracks, currentId, playFromList]
  );
  const playTrackRef = useRef(playTrack);
  playTrackRef.current = playTrack;

  const selectIndex = useCallback(
    (i: number) => {
      const id = queue[i];
      if (!id) return;
      setQIndex(i);
      const tr = tracks.find((x) => x.id === id);
      if (tr) void startTrack(tr);
    },
    [queue, tracks, startTrack]
  );

  const goNext = useCallback(
    (auto = false) => {
      if (!queue.length) return;
      if (qIndex < queue.length - 1) selectIndex(qIndex + 1);
      else if (repeat === "all" || !auto) selectIndex(0);
      else {
        audio.pause();
        setPlaying(false);
      }
    },
    [queue, qIndex, repeat, selectIndex, audio]
  );

  const goPrev = useCallback(() => {
    if (!queue.length) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    selectIndex(qIndex > 0 ? qIndex - 1 : queue.length - 1);
  }, [queue, qIndex, audio, selectIndex]);

  const togglePlay = useCallback(() => {
    if (!current) {
      const first = [...tracks].sort((a, b) => b.plays - a.plays)[0];
      if (first) playTrackRef.current(first.id);
      return;
    }
    if (audio.paused) void startTrack(current);
    else audio.pause();
  }, [current, tracks, audio, startTrack]);
  const togglePlayRef = useRef(togglePlay);
  togglePlayRef.current = togglePlay;

  useEffect(() => {
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      if (repeat === "one") {
        audio.currentTime = 0;
        void audio.play();
        return;
      }
      goNext(true);
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audio, repeat, goNext]);

  /* بازیابی آخرین اثر */
  useEffect(() => {
    const last = localStorage.getItem(LS_LAST);
    if (!last) return;
    const tr = TRACKS.find((x) => x.id === last);
    if (!tr) return;
    const ids = TRACKS.filter((x) => x.album === tr.album).map((x) => x.id);
    setQueue(ids);
    setQIndex(Math.max(0, ids.indexOf(last)));
    void (async () => {
      const ready = await ensureReady(toRuntime(tr));
      audio.src = ready.url!;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- آپلود با پیشرفت ---------- */
  const ingest = useCallback(
    async (files: FileList | File[]) => {
      const list = [...files].filter((f) => f.type.startsWith("audio") || f.type.startsWith("video") || /\.(mp3|wav|ogg|m4a|flac|aac|mp4|webm)$/i.test(f.name));
      if (!list.length) {
        toast(t("notMedia"));
        return;
      }
      for (let i = 0; i < list.length; i++) {
        const f = list[i];
        setUpload({ name: f.name, step: 0, pct: 8, done: i, total: list.length });
        await sleep(250);
        setUpload({ name: f.name, step: 0, pct: 34, done: i, total: list.length });
        try {
          const { buffer, url } = await decodeFile(f);
          setUpload({ name: f.name, step: 1, pct: 66, done: i, total: list.length });
          await sleep(220);
          const peaks = extractPeaks(buffer, 130);
          setUpload({ name: f.name, step: 2, pct: 90, done: i, total: list.length });
          await sleep(200);
          const rt: TrackRuntime = {
            id: `u-${uid()}`,
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
            peaks,
            uploaded: true,
          };
          setTracks((prev) => [rt, ...prev]);
          setUpload({ name: f.name, step: 2, pct: 100, done: i + 1, total: list.length });
          await sleep(350);
        } catch {
          toast(`${f.name} ✗`);
        }
      }
      setUpload(null);
      toast(t("uploadDoneAll"));
    },
    [toast]
  );

  /* ---------- احراز هویت ---------- */
  const requireAuth = useCallback(
    (fn: () => void) => {
      if (!user) {
        setAuthOpen(true);
        return;
      }
      fn();
    },
    [user]
  );

  const handleLogin = (u: User) => {
    setUser(u);
    saveUser(u);
    setAuthOpen(false);
    toast(`${t("welcome")} ${u.name} 👋`);
  };
  const handleLogout = () => {
    setUser(null);
    saveUser(null);
    toast(t("logoutConfirm"));
  };
  const saveUserFn = (u: User) => {
    setUser(u);
    saveUser(u);
    toast(t("artistSaved"));
  };

  /* ---------- استوری‌ها ---------- */
  const updateStories = (fn: (s: Story[]) => Story[]) => {
    setStories((prev) => {
      const nx = fn(prev);
      saveStories(nx);
      return nx;
    });
  };
  const likeStory = (id: string) =>
    requireAuth(() =>
      updateStories((s) =>
        s.map((x) => {
          if (x.id !== id) return x;
          const has = x.likes.includes(user!.id);
          return { ...x, likes: has ? x.likes.filter((l) => l !== user!.id) : [...x.likes, user!.id] };
        })
      )
    );
  const commentStory = (id: string, text: string) =>
    requireAuth(() =>
      updateStories((s) =>
        s.map((x) =>
          x.id === id
            ? { ...x, comments: [...x.comments, { id: uid(), userId: user!.id, name: user!.name, avatar: user!.avatar, text, ts: Date.now() }] }
            : x
        )
      )
    );
  const saveStory = (id: string) => {
    setSavedIds((prev) => {
      const has = prev.includes(id);
      const nx = has ? prev.filter((x) => x !== id) : [...prev, id];
      saveSaved(nx);
      if (!has) toast(t("savedStory"));
      return nx;
    });
  };
  const postStory = (data: { trackId: string; isVideo: boolean; theme: string; caption: string }) => {
    if (!user) return;
    const st: Story = {
      id: uid(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userIsArtist: user.isArtist,
      trackId: data.trackId,
      isVideo: data.isVideo,
      theme: data.theme,
      caption: data.caption,
      likes: [],
      comments: [],
      saves: [],
      ts: Date.now(),
    };
    updateStories((s) => [st, ...s]);
    setCreateOpen(false);
    toast(t("storyPosted"));
    setStoryIndex(0);
  };

  /* ---------- لایک ---------- */
  const toggleLike = (id: string) =>
    requireAuth(() => {
      setLiked((prev) => {
        const nx = new Set(prev);
        if (nx.has(id)) nx.delete(id);
        else {
          nx.add(id);
          toast(t("addedToFav"));
        }
        localStorage.setItem(LS_LIKED, JSON.stringify([...nx]));
        return nx;
      });
    });

  /* ---------- اکولایزر ---------- */
  const applyPreset = (id: string) => {
    const pr = presetById(id);
    if (!pr) return;
    setPresetId(id);
    localStorage.setItem(LS_PRESET, id);
    applyGains([...pr.gains]);
  };
  const handleGains = (g: number[]) => {
    setPresetId("custom");
    localStorage.setItem(LS_PRESET, "custom");
    applyGains(g);
  };
  const optimizeCar = () => {
    const g = optimizeCarGains(car);
    localStorage.setItem(LS_CAR, JSON.stringify(car));
    setPresetId("custom");
    applyGains(g);
  };
  const saveCarPreset = (name: string) => {
    const nx = [...savedCars, { name, gains: optimizeCarGains(car), car }];
    setSavedCars(nx);
    localStorage.setItem(LS_SAVEDCARS, JSON.stringify(nx));
    localStorage.setItem(LS_CAR, JSON.stringify(car));
    toast(t("carSaved"));
  };

  /* ---------- هنرمند ---------- */
  const playArtist = (id: string) => {
    const list = tracksOfArtist(id).map((x) => tracks.find((tr) => tr.id === x.id)).filter(Boolean) as TrackRuntime[];
    if (list.length) playFromList(list, list[0].id);
  };

  const screenBase = {
    tracks,
    playingId: currentId,
    isPlaying: playing,
    liked,
    loadingId,
    onPlay: playTrack,
    onLike: toggleLike,
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-night-900 text-foam">
      {/* پس‌زمینهٔ محیطی */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="girih absolute inset-0 opacity-40" />
        <div className="animate-drift-a absolute -top-24 start-1/4 h-72 w-72 rounded-full bg-turq opacity-[0.07] blur-3xl" />
        <div className="animate-drift-b absolute -end-20 bottom-1/4 h-64 w-64 rounded-full bg-saffron opacity-[0.05] blur-3xl" />
      </div>
      <div className="slim-scroll relative z-10 min-h-0 flex-1 overflow-y-auto">
        {tab === "home" && (
          <HomeScreen
            {...screenBase}
            user={user}
            stories={stories}
            onOpenStory={(i) => setStoryIndex(i)}
            onCreateStory={() =>
              requireAuth(() => {
                setCreateTrackId(null);
                setCreateOpen(true);
              })
            }
            onGoMoods={() => setTab("moods")}
            onGoSearch={() => setTab("moods")}
          />
        )}
        {tab === "moods" && <MoodScreen {...screenBase} mood={mood} place={place} onMood={setMood} onPlace={setPlace} />}
        {tab === "artists" && (
          <ArtistsScreen
            onOpen={(id) => setLanding(id)}
            onPlayArtist={playArtist}
            user={user}
            onOpenMyArtist={() => setLanding("me")}
          />
        )}
        {tab === "library" && (
          <LibraryScreen
            user={user}
            tracks={tracks}
            playingId={currentId}
            isPlaying={playing}
            liked={liked}
            loadingId={loadingId}
            savedIds={savedIds}
            onPlay={playTrack}
            onLike={toggleLike}
            onLogin={() => setAuthOpen(true)}
            onLogout={handleLogout}
            onSaveUser={saveUserFn}
            onOpenEq={() => setEqOpen(true)}
            onOpenMyArtist={() => setLanding("me")}
            onOpenStudio={() => requireAuth(() => setStudioOpen(true))}
            onUpload={() => requireAuth(() => fileRef.current?.click())}
            savedTab={savedTab}
            onSavedTab={setSavedTab}
          />
        )}
      </div>

      {/* پخش‌کننده */}
      <MobilePlayer
        current={current}
        playing={playing}
        loading={loadingId === currentId}
        audio={audio}
        analyser={analyser}
        shuffle={shuffle}
        repeat={repeat}
        vizMode={vizMode}
        onTogglePlay={() => togglePlayRef.current()}
        onNext={() => goNext()}
        onPrev={goPrev}
        onToggleShuffle={() => setShuffle((s) => !s)}
        onCycleRepeat={() => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"))}
        onVizMode={setVizMode}
        onOpenStory={() =>
          current
            ? setCreateOpenWithData()
            : requireAuth(() => {
                setCreateTrackId(null);
                setCreateOpen(true);
              })
        }
        onOpenEq={() => setEqOpen(true)}
      />

      <BottomNav tab={tab} onTab={(tb) => { setTab(tb); setLanding(null); }} onEq={() => setEqOpen(true)} />

      {/* نوار پیشرفت آپلود */}
      {upload && (
        <div className="fixed bottom-24 left-1/2 z-50 w-[88%] max-w-sm -translate-x-1/2">
          <div className="animate-rise rounded-2xl border border-turq/30 bg-night-850/98 p-3.5 shadow-2xl shadow-turq/10 backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-turq/25 border-t-turq" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-extrabold text-foam">{upload.name}</p>
                <p className="text-[10px] text-mist">
                  {[t("reading"), t("decoding"), t("analyzing")][upload.step]} · {num(upload.done + 1)} {t("of")} {num(upload.total)} {t("filesInQueue")}
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-turq">{num(upload.pct)}{lang === "fa" ? "٪" : "%"}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-night-700">
              <div className="h-full rounded-full bg-gradient-to-r from-turq to-saffron transition-all duration-300" style={{ width: `${upload.pct}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* توست */}
      <div className="pointer-events-none fixed bottom-32 left-1/2 z-[60] -translate-x-1/2">
        {toasts.map((x) => (
          <div key={x.id} className="animate-toast-in rounded-full border border-turq/40 bg-night-850/95 px-4 py-2 text-xs font-bold text-foam shadow-xl shadow-black/50 backdrop-blur-md">
            {x.msg}
          </div>
        ))}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="audio/*,video/*,.mp3,.wav,.ogg,.m4a,.flac,.mp4,.webm"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void ingest(e.target.files);
          e.target.value = "";
        }}
      />

      {/* اورلی‌ها */}
      {authOpen && <AuthScreen onDone={handleLogin} onSkip={() => setAuthOpen(false)} />}

      {storyIndex !== null && (
        <StoryViewer
          stories={stories}
          index={storyIndex}
          onNavigate={setStoryIndex}
          onClose={() => setStoryIndex(null)}
          user={user}
          tracks={tracks}
          playingId={currentId}
          isPlaying={playing}
          onPlayTrack={(id) => playTrackRef.current(id)}
          onLike={likeStory}
          onComment={commentStory}
          onSave={saveStory}
          savedIds={savedIds}
          onRequireAuth={() => setAuthOpen(true)}
          onToast={toast}
        />
      )}

      {createOpen && user && (
        <CreateStory tracks={tracks} user={user} initialTrackId={createTrackId} onClose={() => setCreateOpen(false)} onPost={postStory} />
      )}

      {eqOpen && (
        <EqualizerScreen
          gains={gains}
          onGains={handleGains}
          activePreset={presetId}
          onPreset={applyPreset}
          car={car}
          onCar={(c) => {
            setCar(c);
            localStorage.setItem(LS_CAR, JSON.stringify(c));
          }}
          onOptimize={optimizeCar}
          savedCars={savedCars}
          onSaveCar={saveCarPreset}
          onClose={() => setEqOpen(false)}
          onToast={toast}
        />
      )}

      {studioOpen && user && <ArtistStudio user={user} onClose={() => setStudioOpen(false)} onSave={saveUserFn} />}

      {landing && (
        <ArtistLanding
          {...screenBase}
          artistId={landing === "me" ? null : landing}
          user={user}
          onBack={() => setLanding(null)}
        />
      )}
    </div>
  );

  /* استوری از پخش‌کننده: با اثر جاری */
  function setCreateOpenWithData() {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setCreateTrackId(currentId);
    setCreateOpen(true);
  }
}
