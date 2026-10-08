import { t } from "../lib/i18n";
import { IconArtists, IconHome, IconSliders, IconUser } from "./icons";

export type Tab = "home" | "moods" | "artists" | "library";

interface Props {
  tab: Tab;
  onTab: (tb: Tab) => void;
  onEq: () => void;
}

export default function BottomNav({ tab, onTab, onEq }: Props) {
  const items: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: t("home"), icon: <IconHome size={20} /> },
    { id: "moods", label: t("moods"), icon: <IconSliders size={20} /> },
    { id: "artists", label: t("artistsTitle"), icon: <IconArtists size={20} /> },
    { id: "library", label: t("library"), icon: <IconUser size={20} /> },
  ];
  return (
    <nav className="relative z-30 border-t border-foam/8 bg-night-900/95 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around px-2">
        {items.map((it) => {
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onTab(it.id)}
              className={`relative flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all duration-200 active:scale-90 ${
                active ? "text-turq" : "text-dim hover:text-mist"
              }`}
            >
              {active && <span className="absolute -top-2 h-1 w-6 rounded-full bg-turq shadow-lg shadow-turq/50" />}
              {it.icon}
              <span className="text-[10px] font-bold">{it.label}</span>
            </button>
          );
        })}
        {/* دسترسی سریع اکولایزر */}
        <button
          onClick={onEq}
          className="flex min-w-[56px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-saffron transition-all duration-200 active:scale-90"
        >
          <IconEqGlyph />
          <span className="text-[10px] font-bold">{t("eqBtn")}</span>
        </button>
      </div>
    </nav>
  );
}

function IconEqGlyph() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <path d="M4 20V9M8.5 20V4M13 20v-8M17.5 20V7M22 20v-5" />
    </svg>
  );
}
