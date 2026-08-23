import { useState } from "react";
import { genreLabel, num, setLang, t, useT } from "../lib/i18n";
import type { ArtistProfile, ArtistWork, User } from "../lib/state";
import { uid } from "../lib/state";
import type { TrackRuntime } from "../lib/catalog";
import { GENRES } from "../lib/catalog";
import TrackList from "./TrackList";
import { IconArtists, IconCar, IconCheck, IconChev, IconGear, IconGlobe, IconLogout, IconMic, IconPlus, IconSliders, IconUpload, IconX } from "./icons";

interface Props {
  user: User | null;
  tracks: TrackRuntime[];
  playingId: string | null;
  isPlaying: boolean;
  liked: Set<string>;
  loadingId: string | null;
  savedIds: string[];
  onPlay: (id: string) => void;
  onLike: (id: string) => void;
  onLogin: () => void;
  onLogout: () => void;
  onSaveUser: (u: User) => void;
  onOpenEq: () => void;
  onOpenMyArtist: () => void;
  onOpenStudio: () => void;
  onUpload: () => void;
  savedTab: "files" | "likes" | "saved";
  onSavedTab: (tb: "files" | "likes" | "saved") => void;
}

export default function LibraryScreen(p: Props) {
  const { lang } = useT();
  const myUploads = p.tracks.filter((x) => x.uploaded);
  const likedTracks = p.tracks.filter((x) => p.liked.has(x.id));
  const savedTracks = p.tracks.filter((x) => p.savedIds.includes(x.id));

  const list = p.savedTab === "files" ? myUploads : p.savedTab === "likes" ? likedTracks : savedTracks;

  return (
    <div className="px-4 pb-4 pt-4">
      {/* کارت پروفایل */}
      {p.user ? (
        <div className="flex items-center gap-3 rounded-3xl border border-foam/8 bg-night-850/80 p-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-3xl ring-2 ring-turq/50">
            {p.user.avatar.startsWith("data:") ? <img src={p.user.avatar} className="h-full w-full object-cover" alt="" /> : p.user.avatar}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-base font-extrabold text-foam">
              {p.user.name}
              {p.user.isArtist && <span className="rounded-full bg-turq/15 px-1.5 py-0.5 text-[9px] font-bold text-turq">{t("artistBadge")} ✓</span>}
            </p>
            <p className="truncate font-mono text-[10px] text-dim" dir="ltr">{p.user.email}</p>
            <div className="mt-1.5 flex gap-3 font-mono text-[9px] text-mist">
              <span>{num(myUploads.length)} {t("statsUploads")}</span>
              <span>{num(likedTracks.length)} {t("statsLikes")}</span>
            </div>
          </div>
          <button onClick={p.onLogout} className="flex shrink-0 items-center gap-1 rounded-full border border-coral/40 px-3 py-1.5 text-[11px] font-bold text-coral transition-all hover:bg-coral/10 active:scale-95">
            <IconLogout size={13} /> {t("logout")}
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-turq/40 bg-turq/5 p-5 text-center">
          <p className="text-3xl">🎧</p>
          <p className="mt-2 text-sm font-extrabold text-foam">{t("guestTitle")}</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-mist">{t("guestBody")}</p>
          <button onClick={p.onLogin} className="mt-3 rounded-full bg-turq px-5 py-2 text-xs font-extrabold text-night-950 shadow-lg shadow-turq/25 transition-transform active:scale-95">
            {t("enterApp")}
          </button>
        </div>
      )}

      {/* تب‌های کتابخانه */}
      <div className="mt-4 flex rounded-full border border-foam/10 bg-night-850 p-1">
        {(
          [
            { id: "files", label: t("myUploadsSec") },
            { id: "likes", label: t("myLikesSec") },
            { id: "saved", label: t("savedTab") },
          ] as const
        ).map((tb) => (
          <button
            key={tb.id}
            onClick={() => p.onSavedTab(tb.id)}
            className={`flex-1 rounded-full py-1.5 text-[11px] font-bold transition-all ${p.savedTab === tb.id ? "bg-turq text-night-950" : "text-mist"}`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <TrackList
          tracks={list}
          playingId={p.playingId}
          isPlaying={p.isPlaying}
          liked={p.liked}
          loadingId={p.loadingId}
          onPlay={p.onPlay}
          onLike={p.onLike}
          emptyText={p.savedTab === "files" ? t("emptyLibraryBody") : p.savedTab === "likes" ? t("emptyLikesBody") : t("noResults")}
        />
      </div>

      {/* ابزارها */}
      <div className="mt-5 space-y-2">
        <ToolRow icon={<IconUpload size={18} />} title={t("uploadSound")} onClick={p.onUpload} />
        <ToolRow icon={<IconSliders size={18} />} title={t("eqTitle")} sub={t("carAudioLab")} onClick={p.onOpenEq} accent />
        {p.user && (
          <ToolRow
            icon={<IconMic size={18} />}
            title={p.user.isArtist ? t("artistStudio") : t("becomeArtist")}
            sub={t("djNote")}
            onClick={p.onOpenStudio}
          />
        )}
        {p.user?.isArtist && <ToolRow icon={<IconArtists size={18} />} title={t("viewArtistPage")} onClick={p.onOpenMyArtist} />}
      </div>

      {/* تنظیمات */}
      <div className="mt-5">
        <p className="mb-2 text-[11px] font-extrabold tracking-wide text-dim">{t("settings").toUpperCase()}</p>
        <div className="overflow-hidden rounded-2xl border border-foam/8 bg-night-850/80">
          <div className="flex items-center gap-3 border-b border-foam/6 px-4 py-3">
            <IconGlobe size={17} className="text-turq" />
            <span className="flex-1 text-sm font-bold text-foam">{t("language")}</span>
            <div className="flex rounded-full border border-foam/12 p-0.5">
              {(["fa", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${lang === l ? "bg-turq text-night-950" : "text-mist"}`}
                >
                  {l === "fa" ? "فارسی" : "EN"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <IconGear size={17} className="text-mist" />
            <span className="flex-1 text-sm font-bold text-foam">{t("aboutApp")}</span>
            <span className="font-mono text-[10px] text-dim">{t("version")} 2.0 · {t("membersCount")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- استودیوی هنرمند ---------- */

export function ArtistStudio({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: (u: User) => void }) {
  const { lang } = useT();
  const [profile, setProfile] = useState<ArtistProfile>(
    user.artist ?? {
      name: user.name,
      tagline: "",
      bio: "",
      genre: "پاپ",
      coverHue: 174,
      works: [],
    }
  );
  const [showWork, setShowWork] = useState(false);

  const set = (patch: Partial<ArtistProfile>) => setProfile((x) => ({ ...x, ...patch }));

  const save = () => {
    onSave({ ...user, isArtist: true, artist: profile });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-night-950 text-foam">
      <div className="mx-auto w-full max-w-md px-5 py-5">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="rounded-full bg-night-850 p-2 text-mist"><IconX size={16} /></button>
          <h2 className="font-display text-xl">{t("artistStudio")}</h2>
          <button onClick={save} className="ms-auto flex items-center gap-1 rounded-full bg-turq px-4 py-1.5 text-xs font-extrabold text-night-950 active:scale-95">
            <IconCheck size={14} /> {t("save")}
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-mist">{t("djNote")} · {t("badgeNote")}</p>

        <Field label={t("artistName")}>
          <input value={profile.name} onChange={(e) => set({ name: e.target.value })} className={inputCls} />
        </Field>
        <Field label={t("taglineLabel")}>
          <input value={profile.tagline} onChange={(e) => set({ tagline: e.target.value })} className={inputCls} placeholder={t("taglineLabel")} />
        </Field>
        <Field label={t("bioLabel")}>
          <textarea value={profile.bio} onChange={(e) => set({ bio: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder={t("bioLabel")} />
        </Field>
        <Field label={t("genreLabel")}>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => set({ genre: g.id })}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                  profile.genre === g.id ? "border-turq bg-turq text-night-950" : "border-foam/12 text-mist"
                }`}
              >
                {genreLabel(g.id)}
              </button>
            ))}
          </div>
        </Field>
        <Field label={`${t("coverLabel")} — ${t("coverPick")}`}>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Array.from({ length: 12 }, (_, i) => i * 30).map((h) => (
              <button
                key={h}
                onClick={() => set({ coverHue: h })}
                className={`h-10 w-10 shrink-0 rounded-xl border-2 transition-all ${profile.coverHue === h ? "border-white scale-105" : "border-transparent"}`}
                style={{ background: `linear-gradient(135deg, hsl(${h} 70% 50%), hsl(${h + 40} 65% 32%))` }}
              />
            ))}
          </div>
        </Field>

        {/* آثار */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs font-extrabold text-mist">{t("worksTitle")} · {num(profile.works.length)}</p>
          <button onClick={() => setShowWork((s) => !s)} className="flex items-center gap-1 rounded-full bg-saffron px-3 py-1.5 text-[11px] font-extrabold text-night-950 active:scale-95">
            <IconPlus size={13} /> {t("addWork")}
          </button>
        </div>

        {showWork && <WorkForm onCancel={() => setShowWork(false)} onAdd={(w) => { set({ works: [...profile.works, w] }); setShowWork(false); }} />}

        <div className="mt-3 space-y-2">
          {profile.works.map((w) => (
            <div key={w.id} className="flex items-center gap-3 rounded-2xl border border-foam/8 bg-night-850 p-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg" style={{ background: `linear-gradient(135deg, hsl(${w.coverHue} 70% 48%), hsl(${w.coverHue + 40} 65% 30%))` }}>
                {w.kind === "video" ? "🎬" : w.kind === "album" ? "💿" : "🎵"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{w.title}</span>
                <span className="block text-[10px] text-mist">{w.kind === "video" ? t("kindVideo") : w.kind === "album" ? t("kindAlbum") : t("kindTrack")}</span>
              </span>
              <button onClick={() => set({ works: profile.works.filter((x) => x.id !== w.id) })} className="text-dim hover:text-coral"><IconX size={15} /></button>
            </div>
          ))}
        </div>

        <button onClick={save} className="mt-6 w-full rounded-xl bg-turq py-3.5 text-sm font-extrabold text-night-950 shadow-xl shadow-turq/20 active:scale-[0.98]">
          {t("saveArtist")}
        </button>
      </div>
    </div>
  );
}

function WorkForm({ onAdd, onCancel }: { onAdd: (w: ArtistWork) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ArtistWork["kind"]>("track");
  const [note, setNote] = useState("");
  const [coverHue, setCoverHue] = useState(Math.floor(Math.random() * 360));
  const [external, setExternal] = useState("");
  return (
    <div className="animate-rise mt-3 space-y-3 rounded-2xl border border-turq/30 bg-night-850 p-4">
      <Field label={t("workTitle")}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </Field>
      <Field label={t("workKind")}>
        <div className="flex gap-2">
          {(
            [
              { id: "track", label: t("kindTrack") },
              { id: "video", label: t("kindVideo") },
              { id: "album", label: t("kindAlbum") },
            ] as const
          ).map((k) => (
            <button key={k.id} onClick={() => setKind(k.id)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${kind === k.id ? "border-turq bg-turq text-night-950" : "border-foam/12 text-mist"}`}>
              {k.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label={t("workNote")}>
        <input value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} />
      </Field>
      <Field label={`${t("coverWork")} — ${t("coverPick")}`}>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 12 }, (_, i) => i * 30).map((h) => (
            <button key={h} onClick={() => setCoverHue(h)} className={`h-9 w-9 shrink-0 rounded-lg border-2 ${coverHue === h ? "border-white" : "border-transparent"}`} style={{ background: `hsl(${h} 70% 45%)` }} />
          ))}
        </div>
      </Field>
      <Field label={t("externalLink")}>
        <input value={external} onChange={(e) => setExternal(e.target.value)} className={inputCls} dir="ltr" placeholder="https://…" />
      </Field>
      <div className="flex gap-2">
        <button
          onClick={() => title.trim() && onAdd({ id: uid(), title: title.trim(), kind, note, coverHue, external: external.trim() || undefined })}
          className="flex-1 rounded-xl bg-turq py-2.5 text-xs font-extrabold text-night-950 active:scale-[0.98]"
        >
          {t("addWork")}
        </button>
        <button onClick={onCancel} className="rounded-xl border border-foam/12 px-4 text-xs font-bold text-mist">{t("cancel")}</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <label className="mb-1.5 block text-xs font-bold text-mist">{label}</label>
      {children}
    </div>
  );
}

function ToolRow({ icon, title, sub, onClick, accent }: { icon: React.ReactNode; title: string; sub?: string; onClick: () => void; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-start transition-all duration-200 active:scale-[0.98] ${
        accent ? "border-saffron/40 bg-saffron/8 hover:bg-saffron/12" : "border-foam/8 bg-night-850/80 hover:border-foam/20"
      }`}
    >
      <span className={accent ? "text-saffron" : "text-turq"}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold text-foam">{title}</span>
        {sub && <span className="block truncate text-[10px] text-mist">{sub}</span>}
      </span>
      <IconChev size={16} className="rotate-180 text-dim" />
    </button>
  );
}

const inputCls =
  "w-full rounded-xl border border-foam/12 bg-night-900 px-4 py-2.5 text-sm text-foam outline-none transition-all placeholder:text-dim focus:border-turq";
