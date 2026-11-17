import React, { useState } from 'react';
import { MoleculeViewer3D } from '../3d/MoleculeViewer3D';
import {
  BUTANE_CONFORMER_A,
  ISOBUTANE_ORIENTATION_A,
  PENTANE_MOLECULE,
  ISOPENTANE_MOLECULE,
  NEOPENTANE_MOLECULE,
  ISOOCTANE_MOLECULE,
} from '../../config/molecules';
import { soundManager } from '../../utils/audio';
import { HolographicFragmentReveal } from '../HolographicFragmentReveal';
import { CheckCircle, AlertCircle, KeyRound } from 'lucide-react';

interface Lab5MoleculesProps {
  onComplete: (code: string) => void;
  completed: boolean;
  lowGraphics?: boolean;
}

type ModelKey = 'A' | 'B' | 'C' | 'D' | 'X' | 'Y' | 'Z';

const PRIMARY_MODELS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

export const Lab5Molecules: React.FC<Lab5MoleculesProps> = ({
  onComplete,
  completed,
  lowGraphics = false,
}) => {
  const [activeModelKey, setActiveModelKey] = useState<ModelKey>('A');

  // Task 1: Identify A, B, C, D 3D alkane structures
  const [pairs, setPairs] = useState<Record<'A' | 'B' | 'C' | 'D', string>>({
    A: completed ? 'n-butane' : '',
    B: completed ? 'neopentane' : '',
    C: completed ? 'isobutane' : '',
    D: completed ? 'isooctane' : '',
  });
  const [task1Passed, setTask1Passed] = useState(completed);
  const [task1Error, setTask1Error] = useState('');

  // Task 2: C5H12 matching (X, Y, Z) & most branched structure
  const [c5Matches, setC5Matches] = useState<Record<'modelX' | 'modelY' | 'modelZ', string>>({
    modelX: completed ? 'one_branch' : '',
    modelY: completed ? 'quaternary' : '',
    modelZ: completed ? 'straight' : '',
  });
  const [mostBranched, setMostBranched] = useState<string>(completed ? 'quaternary' : '');
  const [task2Passed, setTask2Passed] = useState(completed);
  const [task2Error, setTask2Error] = useState('');

  // Final code input (4234)
  const [enteredCode, setEnteredCode] = useState(completed ? '4234' : '');
  const [codeError, setCodeError] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  // Neutral identifiers ONLY (no formulas or molecule names below the 3D models)
  const modelsCatalog: Record<ModelKey, typeof BUTANE_CONFORMER_A> = {
    A: BUTANE_CONFORMER_A,       // n-bután
    B: NEOPENTANE_MOLECULE,      // neopentán (2,2-dimetilpropán)
    C: ISOBUTANE_ORIENTATION_A,  // 2-metilpropán (izobután)
    D: ISOOCTANE_MOLECULE,       // 2,2,4-trimetilpentán (izooktán)
    X: ISOPENTANE_MOLECULE,
    Y: NEOPENTANE_MOLECULE,
    Z: PENTANE_MOLECULE,
  };

  const handleVerifyTask1 = () => {
    soundManager.playClick();
    if (
      pairs.A === 'n-butane' &&
      pairs.B === 'neopentane' &&
      pairs.C === 'isobutane' &&
      pairs.D === 'isooctane'
    ) {
      soundManager.playSuccess();
      setTask1Error('');
      setTask1Passed(true);
    } else {
      soundManager.playError();
      setTask1Error(
        'Hibás azonosítás! Forgasd körbe az A, B, C és D 3D modellt, számold meg a szénatomokat (fekete gömbök) és figyeld az elágazásokat!'
      );
    }
  };

  const handleVerifyTask2 = () => {
    soundManager.playClick();
    if (
      c5Matches.modelX === 'one_branch' &&
      c5Matches.modelY === 'quaternary' &&
      c5Matches.modelZ === 'straight' &&
      mostBranched === 'quaternary'
    ) {
      soundManager.playSuccess();
      setTask2Error('');
      setTask2Passed(true);
    } else {
      soundManager.playError();
      setTask2Error(
        'Hibás társítás vagy választás! Vizsgáld meg az X, Y és Z 3D-s szénvázat, és figyeld meg, hány szénatom kapcsolódik közvetlenül a középső szénatomhoz!'
      );
    }
  };

  const handleVerifyCode = () => {
    soundManager.playClick();
    if (enteredCode.trim() === '4234') {
      soundManager.playSealUnlock();
      setCodeError(false);
      setJustUnlocked(true);
      onComplete('4234');
    } else {
      soundManager.playError();
      setCodeError(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Briefing banner */}
      <div className="cyber-panel border border-purple-500/40 rounded-2xl p-4 sm:p-5 neon-box-violet flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-mono-tech text-xs tracking-wider uppercase mb-1">
            <span>V. Küldetés • Szénhidrogének & Szerkezeti Izoméria</span>
            {completed && (
              <span className="bg-purple-500/20 text-purple-300 border border-purple-400/50 px-2 py-0.5 rounded text-[11px] font-bold">
                Pecsét Megszerezve
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
            A Molekulák Titkos Kódja
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            A szabotőr az alkánok térbeli elrendeződésével rejtette el a reaktor zárját.
            Forgasd meg és elemezd a 3D szénvázakat, különböztesd meg a főláncot és az elágazásokat, és határozd meg a 4 jegyű kódot!
          </p>
        </div>

        <div className="p-3 bg-purple-950/80 border border-purple-500/50 rounded-xl text-center min-w-[100px]">
          <div className="text-[10px] text-slate-400 uppercase font-mono-tech">Célkód</div>
          <div className="text-lg font-mono-tech font-bold text-purple-300 tracking-widest">
            {completed ? '4234' : '????'}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Molecule Viewer (ONLY A, B, C, D identifiers below, zero formulas!) */}
        <div className="lg:col-span-7 space-y-4">
          <MoleculeViewer3D
            molecule={modelsCatalog[activeModelKey]}
            displayLabel={activeModelKey}
            height="360px"
            lowGraphics={lowGraphics}
          />

          <div className="cyber-panel border border-purple-500/30 rounded-xl p-3">
            <span className="text-xs font-mono-tech text-purple-300 block mb-2">
              Válassz modellt a 3D vizsgálathoz (szén: szürke, hidrogén: fehér):
            </span>
            <div className="grid grid-cols-4 gap-2">
              {PRIMARY_MODELS.map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    soundManager.playClick();
                    setActiveModelKey(id);
                  }}
                  className={`py-3 px-2 rounded-lg border text-center font-display font-bold text-base transition-all ${
                    activeModelKey === id
                      ? 'bg-purple-500/25 border-purple-400 text-purple-200 neon-box-violet'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tasks */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Feladat: A, B, C, D 3D molekulák azonosítása */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              task1Passed ? 'bg-purple-950/35 border-purple-400/50' : 'cyber-panel border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-900 border border-purple-400 text-purple-300 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <h3 className="font-display font-bold text-sm text-slate-100">
                  1. Feladat: Térbeli molekulák azonosítása
                </h3>
              </div>
              {task1Passed && <CheckCircle className="w-4 h-4 text-purple-400" />}
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Vizsgáld meg és forgasd el az <strong>A, B, C és D</strong> 3D modellt! Számold meg a szénatomokat és figyeld az elágazásokat, majd rendeld hozzájuk a helyes nevet:
            </p>

            <div className="space-y-2 mb-3 text-xs">
              {PRIMARY_MODELS.map((id) => (
                <div key={id} className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-purple-300 min-w-[70px]">
                    {id} modell:
                  </span>
                  <select
                    disabled={task1Passed}
                    value={pairs[id]}
                    onChange={(e) => {
                      setPairs({ ...pairs, [id]: e.target.value });
                      setTask1Error('');
                    }}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200 outline-none focus:border-purple-400"
                  >
                    <option value="">Válassz molekulanevet...</option>
                    <option value="n-butane">n-bután</option>
                    <option value="neopentane">neopentán (2,2-dimetilpropán)</option>
                    <option value="isobutane">2-metilpropán (izobután)</option>
                    <option value="isooctane">2,2,4-trimetilpentán (izooktán)</option>
                  </select>
                </div>
              ))}
            </div>

            {!task1Passed && (
              <button
                onClick={handleVerifyTask1}
                className="w-full py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Azonosítás ellenőrzése
              </button>
            )}

            {task1Error && (
              <div className="mt-2 p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{task1Error}</span>
              </div>
            )}

            {task1Passed && (
              <div className="text-xs text-emerald-400 font-mono-tech mt-1">
                ✓ Helyes! Mind a 4 3D molekula pontosan azonosítva.
              </div>
            )}
          </div>

          {/* 2. Feladat: C5H12 izomerek & legelágazóbb */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              task2Passed ? 'bg-purple-950/35 border-purple-400/50' : 'cyber-panel border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-900 border border-purple-400 text-purple-300 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h3 className="font-display font-bold text-sm text-slate-100">
                  2. Feladat: C₅H₁₂ izomerek (X, Y, Z)
                </h3>
              </div>
              {task2Passed && <CheckCircle className="w-4 h-4 text-purple-400" />}
            </div>

            <p className="text-xs text-slate-300 mb-2">
              Kattints az X, Y vagy Z gombra a 3D megtekintéshez, majd társítsd mindegyiket a megfelelő szerkezethez:
            </p>

            {/* Compact X / Y / Z 3D inspection switches */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {(['X', 'Y', 'Z'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setActiveModelKey(key);
                  }}
                  className={`py-1.5 rounded-lg border text-xs font-display font-bold transition-all ${
                    activeModelKey === key
                      ? 'bg-purple-500/25 border-purple-400 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            <div className="space-y-2 mb-3 text-xs">
              {(
                [
                  { key: 'modelX', label: 'X' },
                  { key: 'modelY', label: 'Y' },
                  { key: 'modelZ', label: 'Z' },
                ] as const
              ).map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-2">
                  <span className="text-purple-300 font-display font-bold">{item.label}:</span>
                  <select
                    disabled={task2Passed}
                    value={c5Matches[item.key]}
                    onChange={(e) => {
                      setC5Matches({ ...c5Matches, [item.key]: e.target.value });
                      setTask2Error('');
                    }}
                    className="bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200 outline-none w-56 focus:border-purple-400"
                  >
                    <option value="">Válassz szerkezetet...</option>
                    <option value="straight">CH₃–CH₂–CH₂–CH₂–CH₃ (n-pentán)</option>
                    <option value="one_branch">CH₃–CH(CH₃)–CH₂–CH₃ (2-metilbután)</option>
                    <option value="quaternary">C(CH₃)₄ (2,2-dimetilpropán)</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 mb-3">
              <span className="text-xs text-slate-300 block mb-1.5">
                Melyik a legelágazóbb szerkezet (központi kvaterner C-atommal)?
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { id: 'straight', label: 'n-Pentán' },
                  { id: 'one_branch', label: '2-Metilbután' },
                  { id: 'quaternary', label: '2,2-Dimetilpropán' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="mostBranched"
                      disabled={task2Passed}
                      checked={mostBranched === opt.id}
                      onChange={() => {
                        setMostBranched(opt.id);
                        setTask2Error('');
                      }}
                      className="accent-purple-500"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {!task2Passed && (
              <button
                onClick={handleVerifyTask2}
                className="w-full py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Rögzítés
              </button>
            )}

            {task2Error && (
              <div className="mt-2 p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{task2Error}</span>
              </div>
            )}

            {task2Passed && (
              <div className="text-xs text-emerald-400 font-mono-tech mt-1">
                ✓ Helyes! A három C₅H₁₂ izomer és a legelágazóbb szerkezet sikeresen azonosítva.
              </div>
            )}
          </div>

          {/* 3. Feladat: Kódmeghatározás */}
          <div className="p-4 rounded-xl border border-purple-500/40 cyber-panel neon-box-violet">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <h3 className="font-display font-bold text-sm text-purple-300">
                3. Feladat: A 4 számjegy meghatározása
              </h3>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 mb-3 font-mono-tech">
              <div className="flex justify-between gap-2">
                <span>1. A bután szénatomszáma:</span>
                <span className="text-purple-300 font-bold">{completed ? '4' : '?'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>2. A C₄H₁₀ szerkezeti izomerjeinek száma:</span>
                <span className="text-purple-300 font-bold">{completed ? '2' : '?'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>3. A C₅H₁₂ szerkezeti izomerjeinek száma:</span>
                <span className="text-purple-300 font-bold">{completed ? '3' : '?'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>4. A 2,2-dimetilpropán központi C-hez kötött C-k száma:</span>
                <span className="text-purple-300 font-bold">{completed ? '4' : '?'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="4 jegyű kód..."
                  value={enteredCode}
                  onChange={(e) => {
                    setEnteredCode(e.target.value);
                    setCodeError(false);
                  }}
                  disabled={completed}
                  className={`w-full bg-slate-950 border rounded-xl py-2 px-3 text-center font-mono-tech text-lg tracking-widest outline-none transition-colors ${
                    codeError
                      ? 'border-rose-500 text-rose-400'
                      : completed
                      ? 'border-emerald-500 text-emerald-300'
                      : 'border-purple-500/60 text-purple-300 focus:border-purple-400'
                  }`}
                />
              </div>

              {!completed && (
                <button
                  onClick={handleVerifyCode}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-500/20"
                >
                  Feloldás
                </button>
              )}
            </div>

            {codeError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Hibás kód! Válaszolj egymás után a fenti négy kérdésre a 4 számjegyhez.</span>
              </div>
            )}

            {completed && (
              <HolographicFragmentReveal
                labId="lab5"
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
