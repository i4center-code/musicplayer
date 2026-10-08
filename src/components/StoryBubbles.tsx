import { num, t, useT } from "../lib/i18n";
import type { Story, User } from "../lib/state";
import { themeById } from "../lib/state";
import { IconPlus } from "./icons";

interface Props {
  stories: Story[];
  user: User | null;
  onOpenStory: (index: number) => void;
  onCreate: () => void;
}

/** ردیف استوری‌ها — اولین چیزی که کاربر در خانه می‌بیند */
export default function StoryBubbles({ stories, user, onOpenStory, onCreate }: Props) {
  const { lang } = useT();
  const myIds = stories.filter((s) => s.userId === user?.id);

  return (
    <div className="slim-scroll flex gap-3 overflow-x-auto px-4 pb-1 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* حباب ساخت استوری */}
      <button onClick={onCreate} className="group flex w-[72px] shrink-0 flex-col items-center gap-1.5">
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-turq/50 bg-night-800 transition-all duration-200 group-active:scale-90 group-hover:border-turq group-hover:bg-turq/10">
          <span className="text-2xl">{user ? user.avatar : "👤"}</span>
          <span className="absolute -bottom-1 -end-1 flex h-6 w-6 items-center justify-center rounded-full bg-turq text-night-950 shadow-lg shadow-turq/40 ring-2 ring-night-950">
            <IconPlus size={13} />
          </span>
        </span>
        <span className="w-full truncate text-center text-[10px] font-bold text-turq">{t("storyAdd")}</span>
      </button>

      {stories.map((s, i) => {
        const th = themeById(s.theme);
        const seen = false;
        return (
          <button key={s.id} onClick={() => onOpenStory(i)} className="group flex w-[72px] shrink-0 flex-col items-center gap-1.5">
            <span
              className={`flex h-[68px] w-[68px] items-center justify-center rounded-full p-[3px] transition-transform duration-200 group-active:scale-90 ${
                seen ? "bg-foam/20" : "bg-[conic-gradient(from_210deg,#35d5bd,#f0b445,#ff6d55,#35d5bd)]"
              }`}
            >
              <span
                className="flex h-full w-full items-center justify-center rounded-full border-2 border-night-950 text-2xl"
                style={{ background: th.css }}
              >
                {s.userAvatar.startsWith("data:") ? (
                  <img src={s.userAvatar} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  s.userAvatar
                )}
              </span>
            </span>
            <span className="w-full truncate text-center text-[10px] font-semibold text-mist group-hover:text-foam">
              {s.userId === user?.id ? (lang === "fa" ? "استوری تو" : "Your story") : s.userName}
              {s.userIsArtist && <span className="ms-1 text-turq">✓</span>}
            </span>
            {myIds.length > 0 && s.userId === user?.id && (
              <span className="-mt-1 font-mono text-[8px] text-dim">{num(myIds.length)}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
