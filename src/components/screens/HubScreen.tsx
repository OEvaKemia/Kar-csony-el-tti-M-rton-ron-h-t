import React, { useState } from 'react';
import { GameState, LabId } from '../../types';
import { LAB_METADATA } from '../../config/gameData';
import { soundManager } from '../../utils/audio';
import { CommandCenter3D, HubTargetId } from '../3d/CommandCenter3D';
import { Lock, Unlock, CheckCircle, ChevronRight, Sparkles, AlertCircle, Award } from 'lucide-react';

interface HubScreenProps {
  state: GameState;
  onSelectLab: (labId: LabId) => void;
  onSelectFinale: () => void;
  onOpenSeals: () => void;
}

const LAB_IDS: LabId[] = ['lab1', 'lab2', 'lab3', 'lab4', 'lab5'];

export const HubScreen: React.FC<HubScreenProps> = ({
  state,
  onSelectLab,
  onSelectFinale,
  onOpenSeals,
}) => {
  const completedCount = LAB_IDS.filter((id) => state.labs[id].completed).length;
  const allLabsCompleted = completedCount === 5;

  // Default focus on first incomplete lab (or finale if all 5 completed)
  const firstOpenLab = LAB_IDS.find((id) => !state.labs[id].completed) || 'lab1';
  const [selectedTarget, setSelectedTarget] = useState<HubTargetId>(
    allLabsCompleted ? 'finale' : firstOpenLab
  );
  const [lockedWarning, setLockedWarning] = useState(false);

  const handleActivateTarget = (target: HubTargetId) => {
    if (target === 'finale') {
      if (allLabsCompleted) {
        soundManager.playClick();
        onSelectFinale();
      } else {
        soundManager.playError();
        setSelectedTarget('finale');
        setLockedWarning(true);
      }
      return;
    }
    soundManager.playClick();
    onSelectLab(target);
  };

  const isFinaleSelected = selectedTarget === 'finale';
  const activeLabState = !isFinaleSelected ? state.labs[selectedTarget] : null;
  const activeLabMeta = !isFinaleSelected ? LAB_METADATA[selectedTarget] : null;

  return (
    <div className="max-w-6xl mx-auto w-full py-2 sm:py-4 px-1 sm:px-3 space-y-4">
      
      {/* Interactive 3D Central Control Room with 5 Holographic Doors + Central Quantum Vault */}
      <CommandCenter3D
        state={state}
        selectedTarget={selectedTarget}
        onSelectTarget={(t) => {
          soundManager.playClick();
          setLockedWarning(false);
          setSelectedTarget(t);
        }}
        onActivateTarget={handleActivateTarget}
      />

      {lockedWarning && !allLabsCompleted && (
        <div className="cyber-panel border border-rose-500/50 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-rose-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              A központi kvantumzár nyitásához mind az öt laboratóriumi pecsét szükséges ({completedCount}/5 megszerzve). Lépj be egy nyitott 3D kapun!
            </span>
          </div>
          <button
            onClick={() => setLockedWarning(false)}
            className="text-xs font-mono-tech text-slate-400 hover:text-white underline shrink-0"
          >
            Bezárás
          </button>
        </div>
      )}

      {/* Sleek Holographic Terminal Console Dock (replaces flat multi-card grid) */}
      <div className="cyber-panel border border-cyan-500/40 rounded-2xl p-4 sm:p-5 neon-box-cyan space-y-4">
        
        {/* 6 Terminal Selector Buttons synchronized with the 3D Control Room portals */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {LAB_IDS.map((labId, idx) => {
            const lab = state.labs[labId];
            const isSelected = selectedTarget === labId;
            return (
              <button
                key={labId}
                onClick={() => {
                  soundManager.playClick();
                  setLockedWarning(false);
                  setSelectedTarget(labId);
                }}
                className={`px-2.5 py-2 rounded-xl border text-left transition-all flex items-center justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-300 text-white neon-box-cyan'
                    : lab.completed
                    ? 'bg-amber-950/35 border-amber-500/45 text-amber-200 hover:border-amber-400'
                    : 'bg-[#060c1f] border-slate-800 text-slate-300 hover:border-cyan-500/40'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-mono-tech uppercase text-cyan-400">
                    0{idx + 1}. Kapu
                  </div>
                  <div className="text-xs font-display font-bold truncate">
                    {lab.completed ? LAB_METADATA[labId].fragment : `Labor ${idx + 1}`}
                  </div>
                </div>
                <span className="text-sm shrink-0">
                  {lab.completed ? lab.sealIcon : '🔓'}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => {
              soundManager.playClick();
              setLockedWarning(false);
              setSelectedTarget('finale');
            }}
            className={`px-2.5 py-2 rounded-xl border text-left transition-all flex items-center justify-between gap-1.5 ${
              isFinaleSelected
                ? 'bg-amber-500/20 border-amber-300 text-amber-100 neon-box-gold'
                : allLabsCompleted
                ? 'bg-amber-950/45 border-amber-500/50 text-amber-200 hover:border-amber-300'
                : 'bg-[#060c1f] border-slate-800 text-slate-400 hover:border-purple-500/40'
            }`}
          >
            <div className="min-w-0">
              <div className="text-[10px] font-mono-tech uppercase text-amber-400">
                Központ
              </div>
              <div className="text-xs font-display font-bold truncate">
                Finálé
              </div>
            </div>
            <span className="text-sm shrink-0">
              {allLabsCompleted ? '★' : '🔒'}
            </span>
          </button>
        </div>

        {/* Active Portal Telemetry & Direct Entry Action */}
        <div className="pt-3 border-t border-slate-800/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {!isFinaleSelected && activeLabState && activeLabMeta ? (
            <>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech">
                  <span className="text-cyan-400 uppercase font-bold">
                    {activeLabMeta.title}
                  </span>
                  {activeLabState.completed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[11px] font-bold">
                      <CheckCircle className="w-3 h-3" />
                      {activeLabState.sealIcon} {activeLabMeta.sealName} • Töredék: {activeLabMeta.fragment}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px]">
                      <Unlock className="w-3 h-3" />
                      Nyitott 3D laboratórium ({activeLabState.score}/100 pont)
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-white">
                  {activeLabMeta.subtitle}
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {activeLabMeta.lore}
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onOpenSeals();
                  }}
                  className="px-3.5 py-3 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-500/45 text-purple-200 text-xs font-mono-tech font-bold flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Pecsétek ({completedCount}/5)</span>
                </button>

                <button
                  onClick={() => handleActivateTarget(selectedTarget)}
                  className="flex-1 md:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  <span>{activeLabState.completed ? 'Labor megtekintése' : 'Belépés a 3D laborba'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono-tech text-amber-400 uppercase font-bold">
                  {allLabsCompleted ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Központi Kvantumzár • Mind az 5 pecsét a helyén!</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Központi Kvantumzár • Zárolva ({5 - completedCount} pecsét hiányzik)</span>
                    </>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-amber-200">
                  A Nagy Finálé
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  {allLabsCompleted
                    ? 'Az öt laboratóriumból származó pecsétek és szótöredékek készen állnak a végső dekódolásra.'
                    : 'Szerezd meg az öt laboratórium pecsétjeit és szótöredékeit a központi kvantumzár aktiválásához.'}
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onOpenSeals();
                  }}
                  className="px-3.5 py-3 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-500/45 text-purple-200 text-xs font-mono-tech font-bold flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Pecsétek ({completedCount}/5)</span>
                </button>

                <button
                  onClick={() => handleActivateTarget('finale')}
                  className={`flex-1 md:flex-initial px-6 py-3 rounded-xl font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    allLabsCompleted
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/25 hover:scale-[1.02]'
                      : 'bg-slate-800/90 text-slate-400 border border-slate-700'
                  }`}
                >
                  <span>{allLabsCompleted ? 'Végső Zár Megnyitása' : 'Zárolva'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
};
