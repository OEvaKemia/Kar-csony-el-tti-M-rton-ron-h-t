import React from 'react';
import { GameState, LabId } from '../types';
import { soundManager } from '../utils/audio';
import { BookOpen, HelpCircle, Volume2, VolumeX, Zap, Home, Award } from 'lucide-react';

interface NavbarHUDProps {
  state: GameState;
  onOpenSeals: () => void;
  onOpenDiary: () => void;
  onOpenHints: () => void;
  onToggleSound: () => void;
  onToggleGraphics: () => void;
  onNavigateHub: () => void;
}

export const NavbarHUD: React.FC<NavbarHUDProps> = ({
  state,
  onOpenSeals,
  onOpenDiary,
  onOpenHints,
  onToggleSound,
  onToggleGraphics,
  onNavigateHub,
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sealKeys: LabId[] = ['lab1', 'lab2', 'lab3', 'lab4', 'lab5'];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#040712]/95 border-b border-cyan-500/35 px-3 py-2.5 shadow-lg shadow-cyan-950/30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Branding & Team */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigateHub();
            }}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-950 to-purple-950 border border-cyan-400/60 flex items-center justify-center text-cyan-300 font-bold group-hover:scale-105 transition-transform">
              ❄️
            </div>
            <div>
              <div className="text-xs font-display font-bold text-cyan-300 tracking-wider flex items-center gap-1.5">
                CHRISTMAS CODE 2126
                <span className="hidden md:inline-block text-[10px] bg-purple-950/80 text-purple-200 px-1.5 py-0.5 rounded border border-purple-500/40">
                  MÁFG
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono-tech truncate max-w-[130px] sm:max-w-[200px]">
                {state.team.teamName || 'Kutatócsapat'}
              </div>
            </div>
          </button>

          {/* 5 Seal Badges */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-800">
            {sealKeys.map((id, idx) => {
              const lab = state.labs[id];
              const isDone = lab.completed;
              return (
                <div
                  key={id}
                  title={`${lab.title}: ${lab.sealName} ${isDone ? '(Megszerezve)' : '(Zárolva)'}`}
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all ${
                    isDone
                      ? 'bg-amber-500/20 border border-amber-400 text-amber-300 neon-box-gold scale-105'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-600 opacity-70'
                  }`}
                >
                  {isDone ? lab.sealIcon : idx + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center / Stats: Score & Time */}
        <div className="flex items-center gap-3 bg-[#0a1026] border border-cyan-500/30 px-3 py-1 rounded-xl text-xs font-mono-tech">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Pontszám:</span>
            <span className="text-cyan-300 font-bold text-sm">
              {state.totalScore}
              <span className="text-slate-500 text-[10px] font-normal">/600</span>
            </span>
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Idő:</span>
            <span className="text-amber-300 font-bold">
              {formatTime(state.elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Pecsétek menu item */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSeals();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-950/80 border border-purple-500/45 text-purple-200 hover:bg-purple-900/80 text-xs font-medium transition-all"
            title="Megszerzett Pecsétek és Töredékek"
          >
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Pecsétek</span>
          </button>

          {/* Research Diary */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenDiary();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/45 text-cyan-300 hover:bg-cyan-900/80 text-xs font-medium transition-all"
            title="Kutatási Napló (0 pont levonás)"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Napló</span>
          </button>

          {/* Hints (if inside a lab or finale) */}
          {state.activeScreen !== 'intro' &&
            state.activeScreen !== 'story' &&
            state.activeScreen !== 'registration' &&
            state.activeScreen !== 'tutorial' &&
            state.activeScreen !== 'victory' && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenHints();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/70 border border-amber-500/45 text-amber-300 hover:bg-amber-900/70 text-xs font-medium transition-all"
                title="Segítségkérés"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Segítség</span>
              </button>
            )}

          {/* Hub Home */}
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigateHub();
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
            title="Állomás Központ (Hub)"
          >
            <Home className="w-4 h-4" />
          </button>

          {/* Graphics toggle */}
          <button
            onClick={onToggleGraphics}
            className={`p-1.5 rounded-lg border transition-colors ${
              state.lowGraphicsMode
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={state.lowGraphicsMode ? 'Grafika: Alacsony (Akkumulátorkímélő)' : 'Grafika: Magas (PBR)'}
          >
            <Zap className="w-4 h-4" />
          </button>

          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
            title={state.soundEnabled ? 'Hanghatások némítása' : 'Hanghatások bekapcsolása'}
          >
            {state.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
