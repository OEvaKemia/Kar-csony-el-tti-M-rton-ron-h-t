import React from 'react';
import { LabId } from '../types';
import { LAB_METADATA } from '../config/gameData';
import { soundManager } from '../utils/audio';
import { Sparkles, CheckCircle, X } from 'lucide-react';

interface HolographicFragmentRevealProps {
  labId: LabId;
  justUnlocked: boolean;
  onDismissOverlay: () => void;
}

const SEAL_ICONS: Record<LabId, string> = {
  lab1: '🎨',
  lab2: '🌸',
  lab3: '🪙',
  lab4: '❄️',
  lab5: '🧬',
};

export const HolographicFragmentReveal: React.FC<HolographicFragmentRevealProps> = ({
  labId,
  justUnlocked,
  onDismissOverlay,
}) => {
  const meta = LAB_METADATA[labId];
  const icon = SEAL_ICONS[labId];

  return (
    <>
      {/* Inline persistent holographic card at the bottom of the completed lab */}
      <div className="mt-3 relative overflow-hidden rounded-xl border border-cyan-400/50 bg-[#050c20] p-3.5 neon-box-cyan animate-holo-reveal">
        <div
          className="pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-holo-scan"
          aria-hidden="true"
        />
        <div className="relative flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono-tech uppercase tracking-wider text-emerald-400 font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{meta.sealName} feloldva</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Kinyert titkos töredék (elmentve a Pecsétek közé):
            </div>
          </div>

          <div className="px-4 py-2 rounded-lg bg-cyan-950/90 border border-cyan-400/70 text-center shrink-0 neon-box-cyan">
            <div className="text-[9px] font-mono-tech uppercase text-cyan-400 tracking-widest">
              Töredék
            </div>
            <div className="text-lg font-display font-black tracking-widest text-amber-300 neon-glow-gold">
              {meta.fragment}
            </div>
          </div>
        </div>
      </div>

      {/* Spectacular Fullscreen Holographic Overlay triggered immediately on solve */}
      {justUnlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030714]/90">
          <div className="relative w-full max-w-md cyber-panel border-2 border-cyan-400/70 rounded-3xl p-6 sm:p-8 text-center neon-box-cyan overflow-hidden animate-holo-reveal">
            {/* Animated hologram scan beam */}
            <div
              className="pointer-events-none absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent animate-holo-scan"
              aria-hidden="true"
            />

            <button
              onClick={() => {
                soundManager.playClick();
                onDismissOverlay();
              }}
              aria-label="Bezárás"
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative flex flex-col items-center">
              <div className="text-xs font-mono-tech uppercase tracking-[0.25em] text-cyan-300 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Holografikus Adatátvitel</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>

              {/* Rotating dual hologram rings around Seal */}
              <div className="relative w-28 h-28 flex items-center justify-center my-2">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/60 animate-holo-spin" />
                <div className="absolute inset-2 rounded-full border border-amber-400/50" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-950 via-[#1a0b2e] to-slate-950 border border-cyan-300/70 flex items-center justify-center text-4xl shadow-lg shadow-cyan-500/30">
                  {icon}
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-display font-black text-white mt-3">
                {meta.sealName} Megszerezve!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {meta.title} sikeresen helyreállítva. Az alábbi kódtöredék került a Pecsétek adatbankjába:
              </p>

              {/* Single Fragment Projection */}
              <div className="my-5 px-8 py-4 rounded-2xl bg-[#040a1d] border-2 border-amber-400/75 neon-box-gold">
                <div className="text-[10px] font-mono-tech uppercase tracking-[0.25em] text-cyan-300 mb-1">
                  Feloldott töredék
                </div>
                <div className="text-3xl sm:text-4xl font-display font-black tracking-[0.2em] text-amber-300 neon-glow-gold">
                  {meta.fragment}
                </div>
              </div>

              <p className="text-[11px] font-mono-tech text-slate-400 mb-5">
                A megszerzett töredékeket a felső menü „Pecsétek” pontjában bármikor visszanézheted.
              </p>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onDismissOverlay();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-transform hover:scale-[1.02]"
              >
                Rendben, mentés a Pecsétek közé
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
