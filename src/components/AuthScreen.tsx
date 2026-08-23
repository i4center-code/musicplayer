import { useRef, useState } from "react";
import { setLang, t, useT } from "../lib/i18n";
import { uid, type User } from "../lib/state";
import { IconBack, IconUpload, Logo } from "./icons";

const EMOJIS = ["😎", "🎧", "🎤", "🎹", "🥁", "🎸", "🔥", "🌙", "🌊", "🦁", "🌸", "⚡", "🎭", "🪩", "💿", "🎬"];

interface Props {
  onDone: (u: User) => void;
  onSkip: () => void;
}

export default function AuthScreen({ onDone, onSkip }: Props) {
  const { lang } = useT();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>(EMOJIS[0]);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const pickImage = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(f);
  };

  const submit = () => {
    const em = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setErr(t("emailInvalid"));
      return;
    }
    const nm = mode === "signup" ? name.trim() || em.split("@")[0] : em.split("@")[0];
    onDone({ id: uid(), name: nm, email: em, avatar, isArtist: false });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-night-950 text-foam">
      {/* پس‌زمینهٔ زنده */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-drift-a absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-turq opacity-20 blur-3xl" />
        <div className="animate-drift-b absolute bottom-0 left-0 h-80 w-80 rounded-full bg-saffron opacity-10 blur-3xl" />
        <div className="girih absolute inset-0 opacity-25" />
      </div>

      <div className="relative mx-auto flex min-h-full w-full max-w-md flex-col px-6 py-8">
        <div className="flex items-center justify-between">
          <button onClick={onSkip} className="flex items-center gap-1.5 text-sm text-mist transition-colors hover:text-turq">
            <IconBack size={16} />
            <span>{t("close")}</span>
          </button>
          <button
            onClick={() => setLang(lang === "fa" ? "en" : "fa")}
            className="rounded-full border border-foam/15 px-3 py-1 font-mono text-xs text-mist transition-colors hover:border-turq hover:text-turq"
          >
            {lang === "fa" ? "EN" : "فا"}
          </button>
        </div>

        <div className="mt-10 flex flex-col items-center text-center">
          <span className="text-turq">
            <Logo size={56} />
          </span>
          <h1 className="font-display mt-4 text-4xl leading-tight">{t("appName")}</h1>
          <p className="mt-1 font-mono text-[10px] tracking-[0.3em] text-dim">IRANTIFY</p>
          <p className="mt-5 max-w-xs text-sm leading-7 text-mist">{t("authBody")}</p>
        </div>

        {/* تب‌ها */}
        <div className="mt-8 flex rounded-full border border-foam/10 bg-night-850 p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setErr("");
              }}
              className={`flex-1 rounded-full py-2 text-sm font-bold transition-all duration-200 ${
                mode === m ? "bg-turq text-night-950 shadow-lg shadow-turq/25" : "text-mist"
              }`}
            >
              {m === "login" ? t("login") : t("enterApp")}
            </button>
          ))}
        </div>

        {/* فرم */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-mist">{t("email")}</label>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={t("emailPh")}
              dir="ltr"
              className="w-full rounded-xl border border-foam/12 bg-night-850 px-4 py-3 text-left font-mono text-sm outline-none transition-all placeholder:text-dim focus:border-turq focus:shadow-lg focus:shadow-turq/10"
            />
          </div>

          {mode === "signup" && (
            <div className="animate-rise">
              <label className="mb-1.5 block text-xs font-bold text-mist">{t("name")}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={t("namePh")}
                className="w-full rounded-xl border border-foam/12 bg-night-850 px-4 py-3 text-sm outline-none transition-all placeholder:text-dim focus:border-turq focus:shadow-lg focus:shadow-turq/10"
              />
            </div>
          )}

          {/* آواتار */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-mist">{t("avatarPick")}</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-turq/50 bg-night-800 text-3xl transition-transform active:scale-90"
              >
                {avatar.startsWith("data:") ? (
                  <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  avatar
                )}
              </button>
              <div className="flex flex-wrap gap-1.5">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setAvatar(e)}
                    className={`rounded-lg p-1.5 text-lg transition-all duration-150 active:scale-90 ${
                      avatar === e ? "bg-turq/20 ring-1 ring-turq" : "hover:bg-foam/5"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-2 flex items-center gap-1.5 text-xs text-turq transition-opacity hover:opacity-70"
            >
              <IconUpload size={13} />
              {t("avatarPick")}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && pickImage(e.target.files[0])} />
          </div>

          {err && <p className="animate-rise rounded-lg bg-coral/10 px-3 py-2 text-xs font-bold text-coral">{err}</p>}

          <button
            onClick={submit}
            className="w-full rounded-xl bg-turq py-3.5 text-base font-extrabold text-night-950 shadow-xl shadow-turq/25 transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          >
            {t("enterApp")}
          </button>
        </div>

        <p className="mt-auto pt-8 text-center text-[11px] leading-6 text-dim">
          {t("guestTitle")} · {t("guestBody")}
        </p>
      </div>
    </div>
  );
}
