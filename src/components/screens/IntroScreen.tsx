import React, { useState } from 'react';
import { soundManager } from '../../utils/audio';
import { ChevronRight, Snowflake, ShieldCheck, RotateCcw, Play, AlertTriangle } from 'lucide-react';

export interface SavedSessionSummary {
  exists: boolean;
  teamName: string;
  completedCount: number;
  totalScore: number;
  elapsedSeconds: number;
}

interface IntroScreenProps {
  savedSummary: SavedSessionSummary;
  onStartNewMission: () => void;
  onContinueMission: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  savedSummary,
  onStartNewMission,
  onContinueMission,
}) => {
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-[86vh] flex flex-col items-center justify-center text-center px-3 sm:px-6 py-6">
      
      {/* Top Station Telemetry Tag */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#091128]/90 border border-cyan-400/45 text-cyan-300 text-[11px] sm:text-xs font-mono-tech uppercase tracking-[0.2em] mb-6 neon-box-cyan">
        <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
        <span>Kutatóállomás • Szektor 2126</span>
        <span className="text-rose-400 font-bold">•</span>
        <span className="text-amber-300">Rendszerzárlat</span>
      </div>

      {/* Main Title */}
      <div className="max-w-4xl mx-auto space-y-3 mb-6">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300 drop-shadow-[0_0_32px_rgba(6,182,212,0.45)]">
          CHRISTMAS CODE 2126
        </h1>

        <div className="text-xl sm:text-3xl md:text-4xl font-display font-bold text-amber-300 tracking-[0.22em] neon-glow-gold">
          AZ ÖT PECSÉT TITKA
        </div>
      </div>

      {/* Short Exciting Story Introduction */}
      <div className="cyber-panel rounded-2xl p-5 sm:p-6 max-w-2xl w-full mb-8 border border-cyan-500/40 neon-box-cyan space-y-2.5 text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed">
        <p className="text-cyan-300 font-semibold">
          2126 karácsonya veszélybe került.
        </p>
        <p>
          Egy ismeretlen szabotőr zárolta az öt tudományos laboratóriumot, és öt titkos pecsét mögé rejtett egy különleges üzenetet.
        </p>
        <p>
          A kutatóállomás rendszere összeomlóban van. Csak egy új kutatócsapat állíthatja helyre a működését.
        </p>
        <p className="font-mono-tech text-amber-300 font-bold tracking-wider pt-1">
          Öt labor. Öt pecsét. Egyetlen titkos üzenet.
        </p>
      </div>

      {/* Action Buttons: Fresh start vs Saved Mission Continuation */}
      {!savedSummary.exists ? (
        <div className="relative group mb-8">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-400 opacity-65 blur-md group-hover:opacity-100 transition duration-300" />
          <button
            onClick={() => {
              soundManager.playClick();
              onStartNewMission();
            }}
            className="relative px-9 sm:px-12 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-400 hover:from-cyan-400 hover:to-amber-300 text-slate-950 font-display font-black text-base sm:text-xl uppercase tracking-[0.15em] shadow-2xl transition-all transform hover:scale-[1.03] active:scale-95 flex items-center gap-3"
          >
            <span>KÜLDETÉS INDÍTÁSA</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      ) : (
        <div className="w-full max-w-xl space-y-4 mb-8">
          {/* Saved Mission Summary Strip */}
          <div className="bg-[#071026]/95 border border-amber-400/45 rounded-xl px-4 py-2.5 text-xs font-mono-tech text-slate-300 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>
              Mentett csapat:{' '}
              <strong className="text-amber-300">{savedSummary.teamName || 'Kutatócsapat'}</strong>
            </span>
            <span>•</span>
            <span>
              Pecsétek: <strong className="text-cyan-300">{savedSummary.completedCount}/5</strong>
            </span>
            <span>•</span>
            <span>
              Pont: <strong className="text-amber-300">{savedSummary.totalScore}/600</strong>
            </span>
            <span>•</span>
            <span>
              Idő: <strong className="text-slate-200">{formatDuration(savedSummary.elapsedSeconds)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              onClick={() => {
                soundManager.playClick();
                setConfirmNewOpen(true);
              }}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-display font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ÚJ KÜLDETÉS</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onContinueMission();
              }}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-display font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>KORÁBBI KÜLDETÉS FOLYTATÁSA</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Starting a New Mission when a saved one exists */}
      {confirmNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030714]/90">
          <div className="cyber-panel border border-rose-500/50 rounded-2xl p-6 max-w-md w-full text-left space-y-4 neon-box-crimson">
            <div className="flex items-center gap-2.5 text-rose-300 font-display font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>Új küldetés indítása</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Biztosan új küldetést szeretnél indítani? Ez véglegesen nullázza a korábbi csapat adatait, pontszámait, megszerzett pecsétjeit, töredékeit és az időmérőt.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setConfirmNewOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Mégse
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setConfirmNewOpen(false);
                  onStartNewMission();
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-display font-bold uppercase tracking-wider"
              >
                Igen, új küldetés indítása
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Holographic Footer Info Strip */}
      <div className="cyber-panel rounded-2xl px-5 py-3 max-w-xl w-full flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-mono-tech text-slate-300 neon-box-cyan">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-cyan-400 inline-block" />
          5 Interaktív 3D Labor
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />
          2–3 fős csapatok
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          Márton Áron Főgimnázium
        </span>
      </div>

    </div>
  );
};
