import React, { useState } from 'react';
import { SolutionTubes3D } from '../3d/SolutionTubes3D';
import { soundManager } from '../../utils/audio';
import { HolographicFragmentReveal } from '../HolographicFragmentReveal';
import { Pipette, CheckCircle, AlertCircle, RefreshCw, KeyRound, FileWarning } from 'lucide-react';

interface Lab1ColorsProps {
  onComplete: (code: string) => void;
  completed: boolean;
  lowGraphics?: boolean;
}

type IndicatorType = 'phenolphthalein' | 'methylorange' | 'litmus';

const INDICATOR_DROP_COLORS: Record<IndicatorType, string> = {
  phenolphthalein: '#f472b6',
  methylorange: '#fb923c',
  litmus: '#a855f7',
};

interface LogEntry {
  id: string;
  statement: string;
  isFaulty: boolean;
  correctColor?: string;
}

const SABOTEUR_LOG_ENTRIES: LogEntry[] = [
  {
    id: 'log1',
    statement: '1. Savas oldatban a fenolftalein ciklámen-rózsaszínre változik.',
    isFaulty: true,
    correctColor: 'Színtelen',
  },
  {
    id: 'log2',
    statement: '2. Lúgos oldatban a lakmuszoldat kék színű lesz.',
    isFaulty: false,
  },
  {
    id: 'log3',
    statement: '3. Semleges oldatban a metilnarancs élénksárga színt mutat.',
    isFaulty: true,
    correctColor: 'Narancssárga',
  },
  {
    id: 'log4',
    statement: '4. Savas oldatban a metilnarancs piros / vörös színűvé válik.',
    isFaulty: false,
  },
  {
    id: 'log5',
    statement: '5. Semleges oldatban a lakmuszoldat pirosra színeződik.',
    isFaulty: true,
    correctColor: 'Lila',
  },
];

const COLOR_OPTIONS = [
  'Színtelen',
  'Piros / Vörös',
  'Narancssárga',
  'Sárga',
  'Lila',
  'Kék',
  'Ciklámen-rózsaszín',
];

export const Lab1Colors: React.FC<Lab1ColorsProps> = ({
  onComplete,
  completed,
  lowGraphics = false,
}) => {
  const [tubeIndicators, setTubeIndicators] = useState<Record<'A' | 'B' | 'C', IndicatorType | null>>({
    A: null,
    B: null,
    C: null,
  });

  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorType>('phenolphthalein');
  const [activeTube, setActiveTube] = useState<'A' | 'B' | 'C' | null>('A');
  const [dropTrigger, setDropTrigger] = useState(0);

  // Task 1: Identification of solutions
  const [identifications, setIdentifications] = useState<Record<'A' | 'B' | 'C', string>>({
    A: completed ? 'acid' : '',
    B: completed ? 'base' : '',
    C: completed ? 'neutral' : '',
  });
  const [task1Passed, setTask1Passed] = useState(completed);
  const [task1Error, setTask1Error] = useState('');

  // Task 2: Faulty sensor diagnosis
  const [sensorSwapped, setSensorSwapped] = useState(completed);
  const [task2Passed, setTask2Passed] = useState(completed);
  const [task2Error, setTask2Error] = useState('');

  // Task 3: Saboteur's faulty log ("A szabotőr hibás jegyzőkönyve")
  const [logVerdicts, setLogVerdicts] = useState<Record<string, 'correct' | 'faulty' | ''>>(() => {
    const init: Record<string, 'correct' | 'faulty' | ''> = {};
    SABOTEUR_LOG_ENTRIES.forEach((e) => {
      init[e.id] = completed ? (e.isFaulty ? 'faulty' : 'correct') : '';
    });
    return init;
  });
  const [logCorrections, setLogCorrections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    SABOTEUR_LOG_ENTRIES.forEach((e) => {
      init[e.id] = completed && e.correctColor ? e.correctColor : '';
    });
    return init;
  });
  const [task3Passed, setTask3Passed] = useState(completed);
  const [task3Error, setTask3Error] = useState('');

  // Final Code (2117)
  const [enteredCode, setEnteredCode] = useState(completed ? '2117' : '');
  const [codeError, setCodeError] = useState('');
  const [justUnlocked, setJustUnlocked] = useState(false);

  // Chemically accurate indicator colors:
  // A: pH 2.0 (savas), B: pH 11.0 (lúgos), C: pH 7.0 (semleges)
  const getTubeColor = (tube: 'A' | 'B' | 'C') => {
    const ind = tubeIndicators[tube];
    if (!ind) return '#94a3b8';

    if (ind === 'phenolphthalein') {
      return tube === 'B' ? '#e11d48' : '#cbd5e1';
    }
    if (ind === 'methylorange') {
      if (tube === 'A') return '#dc2626';
      if (tube === 'B') return '#eab308';
      return '#f97316';
    }
    if (ind === 'litmus') {
      if (tube === 'A') return '#ef4444';
      if (tube === 'B') return '#2563eb';
      return '#8b5cf6';
    }
    return '#94a3b8';
  };

  const handleApplyIndicator = (tube: 'A' | 'B' | 'C') => {
    soundManager.playDrop();
    setActiveTube(tube);
    setTubeIndicators((prev) => ({ ...prev, [tube]: selectedIndicator }));
    setDropTrigger((c) => c + 1);
  };

  const handleVerifyTask1 = () => {
    soundManager.playClick();
    if (
      identifications.A === 'acid' &&
      identifications.B === 'base' &&
      identifications.C === 'neutral'
    ) {
      soundManager.playSuccess();
      setTask1Error('');
      setTask1Passed(true);
    } else {
      soundManager.playError();
      setTask1Error('Nem megfelelő azonosítás! Cseppents mindhárom indikátorral, és ellenőrizd a színeket a Kutatási Naplóban.');
    }
  };

  const handleSwapSensors = () => {
    soundManager.playClick();
    setSensorSwapped(!sensorSwapped);
    setTask2Error('');
  };

  const handleVerifyTask2 = () => {
    soundManager.playClick();
    if (sensorSwapped) {
      soundManager.playSuccess();
      setTask2Error('');
      setTask2Passed(true);
    } else {
      soundManager.playError();
      setTask2Error('A szenzor adatai még mindig ellentmondanak a kísérletnek! Figyeld meg, melyik oldat lúgos és melyik semleges.');
    }
  };

  const handleVerifyTask3 = () => {
    soundManager.playClick();

    for (const entry of SABOTEUR_LOG_ENTRIES) {
      const verdict = logVerdicts[entry.id];
      if (!verdict) {
        soundManager.playError();
        setTask3Error('Minden jegyzőkönyvi sornál jelöld meg, hogy helyes vagy hibás!');
        return;
      }
      if (entry.isFaulty && verdict !== 'faulty') {
        soundManager.playError();
        setTask3Error('Van még fel nem ismert szabotált (hibás) megfigyelés a jegyzőkönyvben! Ellenőrizd a kémcsövekkel.');
        return;
      }
      if (!entry.isFaulty && verdict !== 'correct') {
        soundManager.playError();
        setTask3Error('Egy valójában helyes megfigyelést hibásnak jelöltél! Próbáld ki újra az indikátorokkal.');
        return;
      }
      if (entry.isFaulty && logCorrections[entry.id] !== entry.correctColor) {
        soundManager.playError();
        setTask3Error('A hibás soroknál még nem minden javított színváltozás pontos!');
        return;
      }
    }

    soundManager.playSuccess();
    setTask3Error('');
    setTask3Passed(true);
  };

  const handleVerifyCode = () => {
    soundManager.playClick();
    if (!task1Passed || !task2Passed || !task3Passed) {
      soundManager.playError();
      setCodeError('Előbb teljesítsd mindhárom laboratóriumi lépést (1–3. feladat) a kód feloldásához!');
      return;
    }

    if (enteredCode.trim() === '2117') {
      soundManager.playSealUnlock();
      setCodeError('');
      setJustUnlocked(true);
      onComplete('2117');
    } else {
      soundManager.playError();
      setCodeError('Hibás kód! Olvasd le a kijavított A, B és C pH-csatornák egész pH-értékeit ebben a sorrendben.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Narrative briefing banner */}
      <div className="cyber-panel rounded-2xl p-4 sm:p-5 neon-box-cyan flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono-tech text-xs tracking-wider uppercase mb-1">
            <span>I. Küldetés • Spektrofotometria</span>
            {completed && (
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 px-2 py-0.5 rounded text-[11px] font-bold">
                Pecsét Megszerezve
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
            A Színek Laboratóriuma
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            A szabotőr összekeverte az állomás oldatait, elállította a pH-érzékelőt, és meghamisította a központi jegyzőkönyvet.
            Válassz indikátort, kattints a 3D kémcsövekre a cseppentéshez, javítsd ki a hibákat, és add meg az I. pecsét kódját!
          </p>
        </div>

        <div className="p-3 bg-[#060c1f] border border-cyan-500/50 rounded-xl text-center min-w-[100px]">
          <div className="text-[10px] text-slate-400 uppercase font-mono-tech">Kód</div>
          <div className="text-lg font-mono-tech font-bold text-cyan-300 tracking-widest">
            {completed ? '2117' : '????'}
          </div>
        </div>
      </div>

      {/* Main interactive area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 3D Lab Bench & Pipette */}
        <div className="lg:col-span-7 space-y-4">
          <SolutionTubes3D
            colorA={getTubeColor('A')}
            colorB={getTubeColor('B')}
            colorC={getTubeColor('C')}
            activeTube={activeTube}
            dropTrigger={dropTrigger}
            dropColor={INDICATOR_DROP_COLORS[selectedIndicator]}
            sensorFixed={task2Passed}
            onSelectTube={handleApplyIndicator}
            lowGraphics={lowGraphics}
          />

          {/* Pipette & Reagents Control Bar */}
          <div className="cyber-panel rounded-xl p-4">
            <div className="text-xs font-mono-tech text-cyan-300 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Pipette className="w-3.5 h-3.5" />
                Válassz indikátort a virtuális pipettába, majd kattints egy kémcsőre:
              </span>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setTubeIndicators({ A: null, B: null, C: null });
                }}
                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Oldatok visszaállítása
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'phenolphthalein' as const, name: 'Fenolftalein' },
                { id: 'methylorange' as const, name: 'Metilnarancs' },
                { id: 'litmus' as const, name: 'Lakmuszoldat' },
              ].map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedIndicator(ind.id);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedIndicator === ind.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 neon-box-cyan'
                      : 'bg-[#070d1f] border-slate-800 text-slate-300 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="font-bold text-xs font-mono-tech">{ind.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: 3 Step Tasks + Seal Unlock */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 1. Feladat */}
          <div className={`p-4 rounded-xl border transition-all ${
            task1Passed ? 'bg-cyan-950/30 border-cyan-500/40' : 'cyber-panel'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-900 border border-cyan-400 text-cyan-300 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <h3 className="font-display font-bold text-sm text-slate-100">
                  1. Feladat: Oldatok azonosítása
                </h3>
              </div>
              {task1Passed && <CheckCircle className="w-4 h-4 text-cyan-400" />}
            </div>

            <p className="text-xs text-slate-300 mb-3">
              A színváltozások alapján határozd meg az A, B és C kémcsövek kémhatását!
            </p>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {(['A', 'B', 'C'] as const).map((t) => (
                <div key={t} className="space-y-1">
                  <label className="text-[11px] font-mono-tech text-slate-400">Oldat {t}:</label>
                  <select
                    disabled={task1Passed}
                    value={identifications[t]}
                    onChange={(e) => {
                      setIdentifications({ ...identifications, [t]: e.target.value });
                      setTask1Error('');
                    }}
                    className="w-full bg-[#060c1f] border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200 focus:border-cyan-400 outline-none"
                  >
                    <option value="">Válassz...</option>
                    <option value="acid">Savas</option>
                    <option value="neutral">Semleges</option>
                    <option value="base">Lúgos</option>
                  </select>
                </div>
              ))}
            </div>

            {task1Error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{task1Error}</span>
              </div>
            )}

            {!task1Passed && (
              <button
                onClick={handleVerifyTask1}
                className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors"
              >
                Azonosítás ellenőrzése
              </button>
            )}
          </div>

          {/* 2. Feladat */}
          <div className={`p-4 rounded-xl border transition-all ${
            task2Passed ? 'bg-cyan-950/30 border-cyan-500/40' : 'cyber-panel'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-900 border border-cyan-400 text-cyan-300 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h3 className="font-display font-bold text-sm text-slate-100">
                  2. Feladat: Hibás pH-érzékelő javítása
                </h3>
              </div>
              {task2Passed && <CheckCircle className="w-4 h-4 text-cyan-400" />}
            </div>

            <p className="text-xs text-slate-300 mb-2">
              Az automatikus pH-mérő két csatornája felcserélődött a kísérleti eredményekhez képest. Ellenőrizd és javítsd a hibás párosítást:
            </p>

            <div className="bg-[#060c1f] p-3 rounded-lg border border-slate-800 font-mono-tech text-xs space-y-2 mb-3">
              <div className="flex justify-between items-center text-slate-300">
                <span>Oldat A csatorna:</span>
                <span className="text-cyan-300 font-bold">pH = 2,0</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Oldat B csatorna:</span>
                <span className="text-amber-300 font-bold">
                  pH = {sensorSwapped ? '11,0' : '7,0'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Oldat C csatorna:</span>
                <span className="text-amber-300 font-bold">
                  pH = {sensorSwapped ? '7,0' : '11,0'}
                </span>
              </div>
            </div>

            {task2Error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{task2Error}</span>
              </div>
            )}

            {!task2Passed && (
              <div className="flex gap-2">
                <button
                  onClick={handleSwapSensors}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono-tech border border-slate-700"
                >
                  ⇄ B és C felcserélése
                </button>
                <button
                  onClick={handleVerifyTask2}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Rögzítés
                </button>
              </div>
            )}
          </div>

          {/* 3. Feladat: A szabotőr hibás jegyzőkönyve */}
          <div className={`p-4 rounded-xl border transition-all ${
            task3Passed ? 'bg-cyan-950/30 border-cyan-500/40' : 'cyber-panel'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-900 border border-cyan-400 text-cyan-300 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <h3 className="font-display font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <FileWarning className="w-3.5 h-3.5 text-amber-400" />
                  3. Feladat: A szabotőr hibás jegyzőkönyve
                </h3>
              </div>
              {task3Passed && <CheckCircle className="w-4 h-4 text-cyan-400" />}
            </div>

            <p className="text-xs text-slate-300 mb-3">
              A központi számítógép jegyzőkönyvébe hibás megfigyelések kerültek. A virtuális kísérletek alapján döntsd el minden sorról, hogy <strong>Helyes</strong> vagy <strong>Hibás</strong>, és a hibásaknál válaszd ki a valódi színváltozást!
            </p>

            <div className="space-y-2.5 mb-3">
              {SABOTEUR_LOG_ENTRIES.map((entry) => {
                const verdict = logVerdicts[entry.id];
                return (
                  <div
                    key={entry.id}
                    className="p-2.5 rounded-lg bg-[#060c1f] border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="text-slate-200 leading-snug">{entry.statement}</div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={task3Passed}
                        onClick={() => {
                          soundManager.playClick();
                          setLogVerdicts((prev) => ({ ...prev, [entry.id]: 'correct' }));
                          setTask3Error('');
                        }}
                        className={`px-2.5 py-1 rounded-md font-mono-tech text-[11px] border transition-colors ${
                          verdict === 'correct'
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        Helyes
                      </button>

                      <button
                        type="button"
                        disabled={task3Passed}
                        onClick={() => {
                          soundManager.playClick();
                          setLogVerdicts((prev) => ({ ...prev, [entry.id]: 'faulty' }));
                          setTask3Error('');
                        }}
                        className={`px-2.5 py-1 rounded-md font-mono-tech text-[11px] border transition-colors ${
                          verdict === 'faulty'
                            ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        Hibás
                      </button>

                      {verdict === 'faulty' && (
                        <select
                          disabled={task3Passed}
                          value={logCorrections[entry.id]}
                          onChange={(e) => {
                            setLogCorrections((prev) => ({ ...prev, [entry.id]: e.target.value }));
                            setTask3Error('');
                          }}
                          className="ml-auto bg-slate-950 border border-amber-500/50 rounded-md px-2 py-1 text-[11px] text-amber-200 outline-none focus:border-amber-400"
                        >
                          <option value="">Valódi szín...</option>
                          {COLOR_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {task3Error && (
              <div className="flex items-start gap-1.5 text-xs text-rose-400 mb-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{task3Error}</span>
              </div>
            )}

            {!task3Passed ? (
              <button
                onClick={handleVerifyTask3}
                className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors"
              >
                Jegyzőkönyv ellenőrzése
              </button>
            ) : (
              <div className="text-xs text-emerald-400 font-mono-tech">
                ✓ A szabotőr hamis bejegyzései kijavítva!
              </div>
            )}
          </div>

          {/* Pecsét feloldó kód */}
          <div className="p-4 rounded-xl cyber-panel neon-box-cyan">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display font-bold text-sm text-cyan-300">
                Pecsét feloldó kód
              </h3>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              A 4 jegyű feloldókódot a kijavított pH-mérő csatornáinak egész pH-értékei alkotják{' '}
              <strong className="text-cyan-300 font-mono-tech">A → B → C</strong> sorrendben összefűzve.
            </p>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="4 jegyű kód..."
                  value={enteredCode}
                  onChange={(e) => {
                    setEnteredCode(e.target.value);
                    setCodeError('');
                  }}
                  disabled={completed}
                  className={`w-full bg-[#060c1f] border rounded-xl py-2 px-3 text-center font-mono-tech text-lg tracking-widest outline-none transition-colors ${
                    codeError
                      ? 'border-rose-500 text-rose-400'
                      : completed
                      ? 'border-emerald-500 text-emerald-300'
                      : 'border-cyan-500/60 text-cyan-300 focus:border-cyan-400'
                  }`}
                />
                <KeyRound className="absolute right-3 top-2.5 w-5 h-5 text-slate-500 pointer-events-none" />
              </div>

              {!completed && (
                <button
                  onClick={handleVerifyCode}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20"
                >
                  Feloldás
                </button>
              )}
            </div>

            {codeError && (
              <div className="flex items-start gap-1.5 text-xs text-rose-400 mt-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{codeError}</span>
              </div>
            )}

            {completed && (
              <HolographicFragmentReveal
                labId="lab1"
                justUnlocked={justUnlocked}
                onDismissOverlay={() => setJustUnlocked(false)}
              />
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
