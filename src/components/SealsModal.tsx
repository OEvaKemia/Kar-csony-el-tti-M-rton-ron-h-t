import React from 'react';
import { GameState, LabId } from '../types';
import { LAB_METADATA } from '../config/gameData';
import { soundManager } from '../utils/audio';
import { X, Award, Lock, CheckCircle, Sparkles } from 'lucide-react';

interface SealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
}

export const SealsModal: React.FC<SealsModalProps> = ({ isOpen, onClose, state }) => {
  if (!isOpen) return null;

  const labIds: LabId[] = ['lab1', 'lab2', 'lab3', 'lab4', 'lab5'];
  const unlockedCount = labIds.filter((id) => state.labs[id].completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#040712]/90">
      <div className="relative w-full max-w-2xl cyber-panel border border-amber-400/50 rounded-2xl shadow-2xl shadow-amber-950/40 overflow-hidden neon-box-gold flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/25 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-500/50">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-amber-300">
                PECSÉTEK ÉS TÖREDÉKEK
              </h2>
              <p className="text-xs text-slate-400 font-mono-tech">
                Megszerzett pecsétek: <span className="text-cyan-300 font-bold">{unlockedCount} / 5</span>
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

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          <p className="text-xs text-slate-300 mb-2 leading-relaxed">
            Az egyes laboratóriumok sikeres teljesítése után kinyert pecsétek és az azokhoz tartozó nyers szótöredékek az alábbi sorrendben kerültek rögzítésre.
            Mind az öt megszerzése után a végső küldetésben tudjátok összerakni belőlük a titkos üzenetet.
          </p>

          <div className="space-y-2.5">
            {labIds.map((labId, idx) => {
              const lab = state.labs[labId];
              const meta = LAB_METADATA[labId];
              const unlocked = lab.completed;

              return (
                <div
                  key={labId}
                  className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                    unlocked
                      ? 'bg-[#081229] border-amber-400/55 neon-box-gold'
                      : 'bg-slate-950/60 border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border shrink-0 ${
                        unlocked
                          ? 'bg-amber-950/80 border-amber-400/60 text-amber-200'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      {unlocked ? lab.sealIcon : <Lock className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] font-mono-tech uppercase text-cyan-400">
                        <span>{idx + 1}. laboratórium</span>
                        {unlocked && (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCircle className="w-3 h-3" />
                            Feloldva
                          </span>
                        )}
                      </div>
                      <div className="font-display font-bold text-sm text-white truncate">
                        {meta.sealName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {meta.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Fragment Display */}
                  <div className="shrink-0">
                    {unlocked ? (
                      <div className="px-4 py-2 rounded-lg bg-[#040a1d] border border-cyan-400/60 text-center neon-box-cyan">
                        <div className="text-[9px] font-mono-tech uppercase text-cyan-400 tracking-wider flex items-center justify-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Töredék
                        </div>
                        <div className="text-base sm:text-lg font-display font-black tracking-widest text-amber-300">
                          {meta.fragment}
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                        <div className="text-[9px] font-mono-tech uppercase text-slate-500 tracking-wider">
                          Zárolva
                        </div>
                        <div className="text-sm font-mono-tech font-bold text-slate-600 tracking-widest">
                          ???
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all"
          >
            Bezárás
          </button>
        </div>

      </div>
    </div>
  );
};
