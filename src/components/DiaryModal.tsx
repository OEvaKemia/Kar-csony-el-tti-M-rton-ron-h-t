import React, { useState } from 'react';
import { DIARY_ENTRIES } from '../config/gameData';
import { soundManager } from '../utils/audio';
import { X, BookOpen, FlaskConical, Sparkles, Scale, Wind, Boxes } from 'lucide-react';

interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiaryModal: React.FC<DiaryModalProps> = ({ isOpen, onClose }) => {
  const [selectedEntryId, setSelectedEntryId] = useState<string>(DIARY_ENTRIES[0].id);

  if (!isOpen) return null;

  const currentEntry = DIARY_ENTRIES.find((e) => e.id === selectedEntryId) || DIARY_ENTRIES[0];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FlaskConical':
        return <FlaskConical className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Scale':
        return <Scale className="w-4 h-4" />;
      case 'Wind':
        return <Wind className="w-4 h-4" />;
      case 'Boxes':
        return <Boxes className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#040712]/90">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col cyber-panel border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/40 overflow-hidden neon-box-cyan">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-cyan-300">
                KUTATÁSI NAPLÓ – MÁFG 2126
              </h2>
              <p className="text-xs text-slate-400">
                Kémiai adattár és összefüggések (0 pont levonás)
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

        {/* Content body with sidebar navigation */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Sidebar tabs */}
          <div className="md:col-span-4 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {DIARY_ENTRIES.map((entry) => {
              const active = entry.id === selectedEntryId;
              return (
                <button
                  key={entry.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedEntryId(entry.id);
                  }}
                  className={`text-left p-3 rounded-xl border text-xs transition-all flex items-center gap-2.5 shrink-0 md:shrink ${
                    active
                      ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 neon-box-cyan font-semibold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className={`p-1.5 rounded-md ${active ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                    {getIcon(entry.icon)}
                  </span>
                  <div className="truncate">
                    <div className="truncate font-medium">{entry.title}</div>
                    <div className="text-[10px] text-slate-500">{entry.category}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active entry details */}
          <div className="md:col-span-8 bg-slate-950/60 border border-slate-800 rounded-xl p-5 overflow-y-auto">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono-tech uppercase tracking-wider mb-1">
              <span>{currentEntry.category}</span>
            </div>
            <h3 className="text-xl font-display font-bold text-slate-100 mb-3">
              {currentEntry.title}
            </h3>

            <p className="text-sm text-cyan-200/90 bg-cyan-950/40 border-l-2 border-cyan-400 p-3 rounded-r-lg mb-4">
              {currentEntry.summary}
            </p>

            {currentEntry.formula && (
              <div className="mb-4 p-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-center font-mono-tech text-amber-300 text-sm">
                {currentEntry.formula}
              </div>
            )}

            <div className="space-y-2 mb-5">
              {currentEntry.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            {/* Table if exists */}
            {currentEntry.table && (
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-cyan-300 border-b border-slate-800">
                    <tr>
                      {currentEntry.table.headers.map((h, i) => (
                        <th key={i} className="p-2.5 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono-tech">
                    {currentEntry.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/40">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2.5 text-slate-300">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all"
          >
            Napló bezárása
          </button>
        </div>

      </div>
    </div>
  );
};
