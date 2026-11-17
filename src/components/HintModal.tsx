import React from 'react';
import { Hint, LabId } from '../types';
import { LAB_HINTS, FINALE_HINTS } from '../config/gameData';
import { soundManager } from '../utils/audio';
import { HelpCircle, X, AlertTriangle, Lock, Unlock } from 'lucide-react';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: 'hub' | LabId | 'finale' | string;
  unlockedHints: number[]; // e.g. [1, 2]
  currentLabScore: number;
  onUnlockHint: (tier: 1 | 2 | 3, penalty: number) => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  onClose,
  currentScreen,
  unlockedHints,
  currentLabScore,
  onUnlockHint,
}) => {
  if (!isOpen) return null;

  let hints: Hint[] = [];
  if (currentScreen === 'finale') {
    hints = FINALE_HINTS;
  } else if (currentScreen in LAB_HINTS) {
    hints = LAB_HINTS[currentScreen as LabId];
  }

  const handleUnlock = (hint: Hint) => {
    soundManager.playClick();
    onUnlockHint(hint.tier, hint.penalty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#040712]/90">
      <div className="relative w-full max-w-lg cyber-panel border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-950/40 overflow-hidden neon-box-gold">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/20 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-500/40">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-amber-300">
                SEGÍTSÉGRENDSZER
              </h2>
              <p className="text-xs text-slate-400">
                Labor pontszám jelenleg: <span className="text-amber-400 font-bold">{currentLabScore} pont</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>A segítség feloldása csökkenti az adott küldetés pontszámát. A pontszám 0 alá nem eshet.</span>
          </div>

          {hints.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              Ebben a nézetben nem áll rendelkezésre külön segítség.
            </div>
          ) : (
            hints.map((hint) => {
              const isUnlocked = unlockedHints.includes(hint.tier);
              const canUnlock = hint.tier === 1 || unlockedHints.includes((hint.tier - 1) as 1 | 2);

              return (
                <div
                  key={hint.tier}
                  className={`p-4 rounded-xl border transition-all ${
                    isUnlocked
                      ? 'bg-slate-950/70 border-amber-500/40 text-slate-200'
                      : 'bg-slate-950/30 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isUnlocked ? (
                        <Unlock className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-500" />
                      )}
                      <span className="font-display font-bold text-sm text-amber-300">
                        {hint.tier}. Szint: {hint.title}
                      </span>
                    </div>
                    <span className="text-xs font-mono-tech px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-400">
                      -{hint.penalty} pont
                    </span>
                  </div>

                  {isUnlocked ? (
                    <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      {hint.text}
                    </p>
                  ) : (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-500">
                        {canUnlock ? 'Még nincs feloldva' : `Előbb oldd fel a(z) ${hint.tier - 1}. szintet`}
                      </span>
                      {canUnlock && (
                        <button
                          onClick={() => handleUnlock(hint)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors"
                        >
                          Feloldás (-{hint.penalty} pont)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Bezárás
          </button>
        </div>

      </div>
    </div>
  );
};
