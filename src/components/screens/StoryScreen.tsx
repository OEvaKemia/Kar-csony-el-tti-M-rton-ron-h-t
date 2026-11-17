import React, { useEffect, useState } from 'react';
import { soundManager } from '../../utils/audio';
import { ChevronRight, FastForward, Cpu } from 'lucide-react';

interface StoryScreenProps {
  onContinue: () => void;
}

const STORY_LINES = [
  '2126. december 16.',
  'A Karácsonyi Kutatóállomás központi rendszere váratlanul leállt.',
  'Valaki feltörte az öt tudományos laboratórium biztonsági rendszerét, és öt titkos pecsét mögé zárt egy különleges üzenetet.',
  'Az állomás mesterséges intelligenciája már csak néhány töredékes információt képes továbbítani.',
  'A rendszer helyreállításához öt tudományos küldetést kell teljesítenetek.',
  'Minden sikeres küldetés egy pecsétet és egy titkos üzenettöredéket szabadít fel.',
  'A végső üzenet jelentősége azonban messze túlmutat a 2126-os kutatóállomáson.',
];

export const StoryScreen: React.FC<StoryScreenProps> = ({ onContinue }) => {
  const [visibleLines, setVisibleLines] = useState<number>(1);

  useEffect(() => {
    if (visibleLines >= STORY_LINES.length) return;
    const timer = setTimeout(() => {
      setVisibleLines((prev) => prev + 1);
    }, 1500);
    return () => clearTimeout(timer);
  }, [visibleLines]);

  const allShown = visibleLines >= STORY_LINES.length;

  return (
    <div className="relative min-h-[82vh] flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-3xl cyber-panel rounded-3xl p-6 sm:p-10 neon-box-cyan relative overflow-hidden">
        
        {/* Top Terminal Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-cyan-500/30">
          <div className="flex items-center gap-2.5 text-cyan-300 font-mono-tech text-xs uppercase tracking-widest">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Központi AI Adás • Vészjelzés</span>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onContinue();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono-tech text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <span>Átugrás</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Animated Story Lines */}
        <div className="space-y-4 min-h-[300px] sm:min-h-[320px]">
          {STORY_LINES.slice(0, visibleLines).map((line, index) => {
            const isDate = index === 0;
            const isImportant = index === STORY_LINES.length - 1;

            return (
              <p
                key={index}
                className={`animate-story-line leading-relaxed ${
                  isDate
                    ? 'font-mono-tech text-amber-300 text-sm sm:text-base font-bold tracking-widest uppercase'
                    : isImportant
                    ? 'text-amber-200 font-semibold text-sm sm:text-base pt-1'
                    : 'text-slate-200 text-sm sm:text-base'
                }`}
              >
                {line}
              </p>
            );
          })}
        </div>

        {/* Action Footer */}
        <div className="mt-8 pt-5 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
          {!allShown ? (
            <button
              onClick={() => {
                soundManager.playClick();
                setVisibleLines(STORY_LINES.length);
              }}
              className="text-xs font-mono-tech text-cyan-400 hover:text-cyan-200 underline"
            >
              Teljes üzenet megjelenítése azonnal
            </button>
          ) : (
            <span className="text-xs font-mono-tech text-emerald-400">
              ✓ Adás vége – Csatorna nyitva a regisztrációhoz
            </span>
          )}

          <button
            onClick={() => {
              soundManager.playClick();
              onContinue();
            }}
            className="ml-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <span>Tovább a csapatregisztrációhoz</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
