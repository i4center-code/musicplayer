import { useState } from "react";
import { num, t, useT } from "../lib/i18n";
import {
  CAR_HEADUNITS,
  EQ_FREQS,
  EQ_FREQS_EN,
  EQ_PRESETS,
  optimizeCarGains,
  type CarConfig,
} from "../lib/state";
import { IconBack, IconCar, IconCheck, IconSliders, IconX } from "./icons";

interface Props {
  gains: number[];
  onGains: (g: number[]) => void;
  activePreset: string;
  onPreset: (id: string) => void;
  car: CarConfig;
  onCar: (c: CarConfig) => void;
  onOptimize: () => void;
  savedCars: { name: string; gains: number[]; car: CarConfig }[];
  onSaveCar: (name: string) => void;
  onClose: () => void;
  onToast: (m: string) => void;
}

export default function EqualizerScreen(p: Props) {
  const { lang } = useT();
  const [tab, setTab] = useState<"eq" | "car">("eq");
  const [carName, setCarName] = useState("");

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-night-950 text-foam">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-drift-a absolute -top-20 left-1/3 h-64 w-64 rounded-full bg-saffron opacity-10 blur-3xl" />
        <div className="girih absolute inset-0 opacity-15" />
      </div>

      <div className="relative mx-auto w-full max-w-md px-5 py-5">
        <div className="flex items-center gap-3">
          <button onClick={p.onClose} className="rounded-full bg-night-850 p-2 text-mist active:scale-90"><IconBack size={18} /></button>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl">{t("eqTitle")}</h2>
            <p className="truncate text-[10px] text-dim">{t("eqSub")}</p>
          </div>
        </div>

        {/* تب‌ها */}
        <div className="mt-4 flex rounded-full border border-foam/10 bg-night-850 p-1">
          <button onClick={() => setTab("eq")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-extrabold transition-all ${tab === "eq" ? "bg-turq text-night-950" : "text-mist"}`}>
            <IconSliders size={15} /> {t("eqTitle")}
          </button>
          <button onClick={() => setTab("car")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-extrabold transition-all ${tab === "car" ? "bg-saffron text-night-950" : "text-mist"}`}>
            <IconCar size={16} /> {t("carTitle")}
          </button>
        </div>

        {tab === "eq" && (
          <>
            {/* پریست‌ها */}
            <p className="mb-2 mt-4 text-[11px] font-extrabold tracking-wide text-dim">{t("presets").toUpperCase()}</p>
            <div className="slim-scroll -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {EQ_PRESETS.map((pr) => {
                const active = p.activePreset === pr.id;
                return (
                  <button
                    key={pr.id}
                    onClick={() => p.onPreset(pr.id)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-150 active:scale-95 ${
                      active ? "border-turq bg-turq text-night-950 shadow-lg shadow-turq/25" : "border-foam/12 bg-night-850 text-mist hover:border-foam/30"
                    }`}
                  >
                    {lang === "fa" ? pr.fa : pr.en}
                  </button>
                );
              })}
            </div>

            {/* اسلایدرهای ۱۰ باند */}
            <div className="mt-5 rounded-3xl border border-foam/8 bg-night-850/80 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-foam">{t("manual")} · ۱۰ {t("bandCount")}</p>
                <span className="rounded-full bg-turq/12 px-2.5 py-0.5 font-mono text-[9px] font-bold text-turq">
                  {p.activePreset === "custom" ? t("custom") : (lang === "fa" ? EQ_PRESETS.find((x) => x.id === p.activePreset)?.fa : EQ_PRESETS.find((x) => x.id === p.activePreset)?.en) ?? "—"}
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between gap-1" dir="ltr">
                {p.gains.map((g, i) => (
                  <BandSlider
                    key={i}
                    value={g}
                    label={(lang === "fa" ? EQ_FREQS : EQ_FREQS_EN)[i]}
                    onChange={(v) => {
                      const ng = [...p.gains];
                      ng[i] = v;
                      p.onGains(ng);
                    }}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-center gap-4 font-mono text-[9px] text-dim" dir="ltr">
                <span>+12dB</span>
                <span className="h-px flex-1 bg-foam/10" />
                <span>0</span>
                <span className="h-px flex-1 bg-foam/10" />
                <span>-12dB</span>
              </div>
            </div>

            <button onClick={() => p.onGains([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])} className="mt-3 text-xs font-bold text-coral transition-opacity hover:opacity-70">
              ✕ {t("pFlat")}
            </button>
          </>
        )}

        {tab === "car" && (
          <>
            <p className="mt-4 text-xs leading-6 text-mist">{t("carSub")}</p>

            <div className="mt-4 space-y-3">
              <CarField label={t("headunit")}>
                <div className="flex flex-wrap gap-2">
                  {CAR_HEADUNITS.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => p.onCar({ ...p.car, headunit: h.id })}
                      className={`rounded-full border px-3 py-1.5 font-mono text-[11px] font-bold transition-all ${
                        p.car.headunit === h.id ? "border-saffron bg-saffron text-night-950" : "border-foam/12 text-mist"
                      }`}
                    >
                      {h.name}
                    </button>
                  ))}
                </div>
              </CarField>

              <CarField label={t("hasSub")}>
                <Toggle on={p.car.hasSub} onChange={(v) => p.onCar({ ...p.car, hasSub: v })} />
              </CarField>

              {p.car.hasSub && (
                <CarField label={t("subLocation")}>
                  <div className="flex gap-2">
                    {(
                      [
                        { id: "trunk", label: t("subTrunk") },
                        { id: "seat", label: t("subSeat") },
                        { id: "deck", label: t("subDeck") },
                      ] as const
                    ).map((s) => (
                      <button key={s.id} onClick={() => p.onCar({ ...p.car, subLocation: s.id })} className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${p.car.subLocation === s.id ? "border-saffron bg-saffron text-night-950" : "border-foam/12 text-mist"}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </CarField>
              )}

              <CarField label={`${t("frontCount")} — ${num(p.car.frontCount)}`}>
                <Counter value={p.car.frontCount} onChange={(v) => p.onCar({ ...p.car, frontCount: v })} />
              </CarField>
              <CarField label={`${t("rearCount")} — ${num(p.car.rearCount)}`}>
                <Counter value={p.car.rearCount} onChange={(v) => p.onCar({ ...p.car, rearCount: v })} />
              </CarField>
              <CarField label={t("hasTweeter")}>
                <Toggle on={p.car.hasTweeter} onChange={(v) => p.onCar({ ...p.car, hasTweeter: v })} />
              </CarField>
            </div>

            <button
              onClick={() => {
                p.onOptimize();
                p.onToast(t("optimized"));
                setTab("eq");
              }}
              className="mt-5 w-full rounded-xl bg-saffron py-3.5 text-sm font-extrabold text-night-950 shadow-xl shadow-saffron/20 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              ⚙️ {t("optimize")}
            </button>

            <div className="mt-4 flex gap-2">
              <input value={carName} onChange={(e) => setCarName(e.target.value)} placeholder={t("presetNamePh")} className="h-11 flex-1 rounded-xl border border-foam/12 bg-night-850 px-4 text-xs outline-none focus:border-saffron" />
              <button
                onClick={() => {
                  p.onSaveCar(carName.trim() || `${CAR_HEADUNITS.find((h) => h.id === p.car.headunit)?.name} — ${t("carTitle")}`);
                  setCarName("");
                }}
                className="rounded-xl border border-saffron/50 px-4 text-xs font-extrabold text-saffron active:scale-95"
              >
                {t("saveCarPreset")}
              </button>
            </div>

            {p.savedCars.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-extrabold tracking-wide text-dim">{t("savedCarPresets").toUpperCase()}</p>
                <div className="space-y-2">
                  {p.savedCars.map((sc, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        p.onCar(sc.car);
                        p.onGains(sc.gains);
                        p.onToast(t("apply") + " ✓");
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl border border-foam/8 bg-night-850 p-3 text-start transition-all hover:border-saffron/40 active:scale-[0.98]"
                    >
                      <IconCar size={18} className="text-saffron" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-extrabold text-foam">{sc.name}</span>
                        <span className="block font-mono text-[9px] text-dim">
                          {CAR_HEADUNITS.find((h) => h.id === sc.car.headunit)?.name} · {sc.car.frontCount + sc.car.rearCount} {t("bandCount")} · {sc.car.hasSub ? "SUB" : "—"}
                        </span>
                      </span>
                      <IconCheck size={16} className="text-saffron" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- اجزا ---------- */

function BandSlider({ value, label, onChange }: { value: number; label: string; onChange: (v: number) => void }) {
  const H = 150;
  const pct = ((value + 12) / 24) * 100;
  const setFromY = (clientY: number, el: HTMLDivElement) => {
    const r = el.getBoundingClientRect();
    const ratio = 1 - Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    onChange(Math.round((ratio * 24 - 12) * 2) / 2);
  };
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <span className="font-mono text-[8px] text-turq">{value > 0 ? `+${value}` : value}</span>
      <div
        className="relative w-7 cursor-pointer touch-none select-none rounded-full bg-night-900"
        style={{ height: H }}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          setFromY(e.clientY, e.currentTarget);
        }}
        onPointerMove={(e) => {
          if (e.buttons) setFromY(e.clientY, e.currentTarget);
        }}
      >
        {/* خط صفر */}
        <span className="absolute left-1 right-1 top-1/2 h-px bg-foam/15" />
        {/* پرشدگی */}
        <span
          className="absolute left-1.5 right-1.5 rounded-full bg-gradient-to-t from-turq/60 to-turq"
          style={value >= 0 ? { bottom: "50%", height: `${(value / 12) * 50}%` } : { top: "50%", height: `${(-value / 12) * 50}%` }}
        />
        {/* دستگیره */}
        <span
          className="absolute left-1/2 h-4 w-4 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-night-950 bg-turq shadow-lg shadow-turq/40"
          style={{ bottom: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[8px] text-dim">{label}</span>
    </div>
  );
}

function CarField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-foam/8 bg-night-850 p-3.5">
      <p className="mb-2.5 text-xs font-extrabold text-foam">{label}</p>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative h-7 rounded-full transition-colors duration-200"
      style={{ width: 52, background: on ? "#35d5bd" : "#1b2531" }}
      aria-pressed={on}
    >
      <span
        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-200"
        style={{ insetInlineStart: on ? 28 : 4 }}
      />
    </button>
  );
}

function Counter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-foam/15 text-lg font-bold text-mist active:scale-90">−</button>
      <span className="w-8 text-center font-mono text-base font-bold text-turq">{num(value)}</span>
      <button onClick={() => onChange(Math.min(8, value + 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-foam/15 text-lg font-bold text-mist active:scale-90">+</button>
    </div>
  );
}
