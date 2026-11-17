import React, { useState } from 'react';
import { GasChamber3D } from '../3d/GasChamber3D';
import { soundManager } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { HolographicFragmentReveal } from '../HolographicFragmentReveal';
import { CheckCircle, AlertCircle, KeyRound, Sliders } from 'lucide-react';

interface Lab4SnowProps {
  onComplete: (code: string) => void;
  completed: boolean;
  lowGraphics?: boolean;
}

export const Lab4Snow: React.FC<Lab4SnowProps> = ({
  onComplete,
  completed,
  lowGraphics = false,
}) => {
  // Piston simulation state
  const [sliderVolume, setSliderVolume] = useState<number>(6.0); // 4.0 to 10.0 L
  const [chamberTemp, setChamberTemp] = useState<number>(300); // Kelvin

  // Task 1: Isothermal expansion
  const [task1Passed, setTask1Passed] = useState(completed);
  const [task1Error, setTask1Error] = useState('');

  // Task 2: Isochoric cooling
  const [task2Input, setTask2Input] = useState<string>('');
  const [task2Passed, setTask2Passed] = useState(completed);
  const [task2Error, setTask2Error] = useState('');

  // Task 3: Identify faulty sensor & calculate correct volume
  const [faultySensorChoice, setFaultySensorChoice] = useState<string>('');
  const [correctVolInput, setCorrectVolInput] = useState<string>('');
  const [task3Passed, setTask3Passed] = useState(completed);
  const [task3Error, setTask3Error] = useState('');

  // Final code input (81048)
  const [enteredCode, setEnteredCode] = useState(completed ? '81048' : '');
  const [codeError, setCodeError] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  // Compute live pressure based on ideal gas law simulation
  // At 300K, p * V = 12.0 atm*L => p = 12.0 / V
  const livePressure = (12.0 / sliderVolume) * (chamberTemp / 300);

  const handleSliderChange = (newVal: number) => {
    soundManager.playHiss();
    setSliderVolume(newVal);
    setTask1Error('');
  };

  const handleVerifyTask1 = () => {
    soundManager.playClick();
    if (chamberTemp !== 300) {
      setChamberTemp(300);
    }
    if (Math.abs(sliderVolume - 8.0) <= 0.15) {
      soundManager.playSuccess();
      setTask1Error('');
      setTask1Passed(true);
    } else {
      soundManager.playError();
      setTask1Error(
        `A dugattyú jelenleg ${sliderVolume.toFixed(1)} L-en áll (p = ${(12.0 / sliderVolume).toFixed(2)} atm). Alkalmazd a Boyle–Mariotte-törvényt (p₁·V₁ = p₂·V₂), és állítsd be a helyes V₂ térfogatot!`
      );
    }
  };

  const handleVerifyTask2 = () => {
    soundManager.playClick();
    const val = parseFloat(task2Input.replace(',', '.'));
    if (!Number.isNaN(val) && Math.abs(val - 1.0) < 0.05) {
      soundManager.playSuccess();
      setTask2Error('');
      setTask2Passed(true);
      setChamberTemp(250);
    } else {
      soundManager.playError();
      setTask2Error(
        'Helytelen nyomásérték! Izochor állapotváltozásnál használd a p₁ / T₁ = p₂ / T₂ összefüggést!'
      );
    }
  };

  const handleVerifyTask3 = () => {
    soundManager.playClick();
    const vol = parseFloat(correctVolInput.replace(',', '.'));
    if (faultySensorChoice === 'C' && !Number.isNaN(vol) && Math.abs(vol - 4.8) < 0.1) {
      soundManager.playSuccess();
      setTask3Error('');
      setTask3Passed(true);
    } else {
      soundManager.playError();
      setTask3Error(
        'Nem megfelelő adatok! Ellenőrizd mindhárom érzékelő p·V szorzatát: amelyik eltér a 12,0 atm·L értéktől, az a hibás, és számítsd ki hozzá a pontos térfogatot!'
      );
    }
  };

  const handleVerifyCode = () => {
    soundManager.playClick();
    if (enteredCode.trim() === '81048') {
      soundManager.playSealUnlock();
      setCodeError(false);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#e0f2fe', '#ffffff', '#0ea5e9'],
        });
      } catch {}
      setJustUnlocked(true);
      onComplete('81048');
    } else {
      soundManager.playError();
      setCodeError(true);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Briefing banner */}
      <div className="cyber-panel border border-sky-500/40 rounded-2xl p-4 sm:p-5 neon-box-cyan flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-mono-tech text-xs tracking-wider uppercase mb-1">
            <span>IV. Küldetés • Gáztörvények & Kriogenika</span>
            {completed && (
              <span className="bg-sky-500/20 text-sky-300 border border-sky-400/50 px-2 py-0.5 rounded text-[11px] font-bold">
                Pecsét Megszerezve
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
            A Hógolyógyár
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            A szabotőr elállította a hókristály-képző sűrítőhengerek vezérlését.
            Mozgasd a 3D dugattyút, alkalmazd a Boyle–Mariotte és a Gay-Lussac törvényeket, és azonosítsd a hibás érzékelőt!
          </p>
        </div>

        <div className="p-3 bg-sky-950/80 border border-sky-500/50 rounded-xl text-center min-w-[100px]">
          <div className="text-[10px] text-slate-400 uppercase font-mono-tech">Célkód</div>
          <div className="text-lg font-mono-tech font-bold text-sky-300 tracking-widest">
            {completed ? '81048' : '?????'}
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Gas Chamber & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 3D Piston & Particle System */}
        <div className="lg:col-span-7 space-y-4">
          <GasChamber3D
            volume={sliderVolume}
            pressure={livePressure}
            temperature={chamberTemp}
            snowEffectActive={completed}
            lowGraphics={lowGraphics}
          />

          {/* Interactive slider for Piston Volume */}
          <div className="cyber-panel border border-sky-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-tech">
              <span className="text-sky-300 flex items-center gap-1.5 font-bold">
                <Sliders className="w-4 h-4" />
                Dugattyú pozíciója (Térfogat):
              </span>
              <span className="text-amber-300 font-bold text-sm bg-slate-950 px-2.5 py-0.5 rounded border border-slate-700">
                V = {sliderVolume.toFixed(1)} L
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono-tech text-slate-500">4,0 L</span>
              <input
                type="range"
                min="4.0"
                max="10.0"
                step="0.1"
                value={sliderVolume}
                onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-400 border border-slate-700"
              />
              <span className="text-xs font-mono-tech text-slate-500">10,0 L</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-mono-tech text-slate-400 border-t border-slate-800">
              <div>
                Nyomás:{' '}
                <span className="text-cyan-300 font-bold">{livePressure.toFixed(2)} atm</span>
              </div>
              <div className="text-center">
                p · V:{' '}
                <span className="text-sky-300 font-bold">{(livePressure * sliderVolume).toFixed(1)} atm·L</span>
              </div>
              <div className="text-right">
                Hőmérséklet: <span className="text-amber-400 font-bold">{chamberTemp} K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tasks */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 1. Feladat: Izoterm állapotváltozás */}
          <div className={`p-4 rounded-xl border transition-all ${
            task1Passed ? 'bg-sky-950/35 border-sky-400/50' : 'cyber-panel border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-900 border border-sky-400 text-sky-300 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <h3 className="font-display font-bold text-sm text-slate-100">
                  1. Feladat: Izoterm állapotváltozás
                </h3>
              </div>
              {task1Passed && <CheckCircle className="w-4 h-4 text-sky-400" />}
            </div>

            <p className="text-xs text-slate-300 mb-2">
              Kezdeti állapot: <span className="font-mono-tech text-sky-300 font-bold">p₁ = 2,0 atm</span>,{' '}
              <span className="font-mono-tech text-sky-300 font-bold">V₁ = 6,0 L</span> (300 K).
              A nyomást csökkentjük <span className="font-mono-tech text-sky-300 font-bold">p₂ = 1,5 atm</span> értékre állandó hőmérsékleten.
              Számítsd ki és állítsd be a dugattyúval az új térfogatot (V₂)!
            </p>

            <div className="flex items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono-tech mb-3">
              <span>Beállított állapot:</span>
              <span className="text-sky-300 font-bold">
                V = {sliderVolume.toFixed(1)} L • p = {livePressure.toFixed(2)} atm
              </span>
            </div>

            {!task1Passed && (
              <button
                onClick={handleVerifyTask1}
                className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Beállított térfogat rögzítése
              </button>
            )}

            {task1Error && (
              <div className="mt-2 p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{task1Error}</span>
              </div>
            )}

            {task1Passed && (
              <div className="text-xs text-emerald-400 font-mono-tech">
                ✓ Helyes! Az izoterm térfogat sikeresen rögzítve (8,0 L).
              </div>
            )}
          </div>

          {/* 2. Feladat: Izochor állapotváltozás */}
          <div className={`p-4 rounded-xl border transition-all ${
            task2Passed ? 'bg-sky-950/35 border-sky-400/50' : 'cyber-panel border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-900 border border-sky-400 text-sky-300 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h3 className="font-display font-bold text-sm text-slate-100">
                  2. Feladat: Izochor állapotváltozás
                </h3>
              </div>
              {task2Passed && <CheckCircle className="w-4 h-4 text-sky-400" />}
            </div>

            <p className="text-xs text-slate-300 mb-2">
              Állandó térfogat mellett a gázt lehűtjük: <span className="font-mono-tech text-sky-300 font-bold">T₁ = 300 K</span>-ről{' '}
              <span className="font-mono-tech text-sky-300 font-bold">T₂ = 250 K</span>-re.
              Kezdeti nyomás: <span className="font-mono-tech text-sky-300 font-bold">p₁ = 1,2 atm</span>.
              Mekkora lesz az új nyomás (p₂)?
            </p>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Nyomás (atm)"
                disabled={task2Passed}
                value={task2Input}
                onChange={(e) => {
                  setTask2Input(e.target.value);
                  setTask2Error('');
                }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-mono-tech text-sky-300 focus:border-sky-400 outline-none"
              />
              <span className="text-xs font-mono-tech text-slate-400">atm</span>
              {!task2Passed && (
                <button
                  onClick={handleVerifyTask2}
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                >
                  Rögzítés
                </button>
              )}
            </div>

            {task2Error && (
              <div className="mt-2 p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{task2Error}</span>
              </div>
            )}

            {task2Passed && (
              <div className="text-xs text-emerald-400 font-mono-tech mt-1">
                ✓ Helyes! A hűtés utáni nyomás pontosan rögzítve (1,0 atm).
              </div>
            )}
          </div>

          {/* 3. Feladat: Hibás érzékelő keresése */}
          <div className={`p-4 rounded-xl border transition-all ${
            task3Passed ? 'bg-sky-950/35 border-sky-400/50' : 'cyber-panel border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-900 border border-sky-400 text-sky-300 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <h3 className="font-display font-bold text-sm text-slate-100">
                  3. Feladat: Hibás érzékelő & Helyes térfogat
                </h3>
              </div>
              {task3Passed && <CheckCircle className="w-4 h-4 text-sky-400" />}
            </div>

            <p className="text-xs text-slate-300 mb-2">
              Az izoterm hógolyógyár rendszerében a szorzatnak állandónak kell lennie: <span className="font-mono-tech text-sky-300 font-bold">p·V = 12,0 atm·L</span>.
              Melyik érzékelő hibás, és mekkora a helyes térfogata?
            </p>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { id: 'A', text: 'A: 1,5 atm, 8,0 L' },
                { id: 'B', text: 'B: 3,0 atm, 4,0 L' },
                { id: 'C', text: 'C: 2,5 atm, 5,0 L' },
              ].map((sensor) => (
                <button
                  key={sensor.id}
                  disabled={task3Passed}
                  onClick={() => {
                    soundManager.playClick();
                    setFaultySensorChoice(sensor.id);
                    setTask3Error('');
                  }}
                  className={`p-2 rounded-lg border text-xs font-mono-tech transition-all ${
                    faultySensorChoice === sensor.id
                      ? 'bg-sky-500/30 border-sky-400 text-sky-200 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {sensor.text}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-slate-400">Helyes térfogat:</span>
              <input
                type="text"
                placeholder="Térfogat (L)"
                disabled={task3Passed}
                value={correctVolInput}
                onChange={(e) => {
                  setCorrectVolInput(e.target.value);
                  setTask3Error('');
                }}
                className="w-28 bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs font-mono-tech text-sky-300 focus:border-sky-400 outline-none"
              />
              <span className="text-xs font-mono-tech text-slate-400">L</span>
              {!task3Passed && (
                <button
                  onClick={handleVerifyTask3}
                  className="ml-auto px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                >
                  Javítás
                </button>
              )}
            </div>

            {task3Error && (
              <div className="mt-2 p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{task3Error}</span>
              </div>
            )}

            {task3Passed && (
              <div className="text-xs text-emerald-400 font-mono-tech mt-1">
                ✓ Helyes! A hibás érzékelő kalibrálva (4,8 L).
              </div>
            )}
          </div>

          {/* Kód megadása */}
          <div className="p-4 rounded-xl border border-sky-500/40 cyber-panel neon-box-cyan">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-sky-400" />
              <h3 className="font-display font-bold text-sm text-sky-300">
                Pecsét feloldó kódképzés
              </h3>
            </div>

            <p className="text-xs text-slate-300 mb-2">
              A kód szabálya a három feladat eredményeiből:
            </p>
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono-tech text-sky-300 space-y-1 mb-3">
              <div>• 1. feladat eredményének egész része</div>
              <div>• 2. feladat eredménye tizedesvessző nélkül (egy tizedesjegyig)</div>
              <div>• 3. feladat eredménye tizedesvessző nélkül (egy tizedesjegyig)</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="5 jegyű kód..."
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
                      : 'border-sky-500/60 text-sky-300 focus:border-sky-400'
                  }`}
                />
              </div>

              {!completed && (
                <button
                  onClick={handleVerifyCode}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-sky-500/20"
                >
                  Feloldás
                </button>
              )}
            </div>

            {codeError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Hibás kód! Ellenőrizd a három feladat eredményét és a kódképzési szabályt.</span>
              </div>
            )}

            {completed && (
              <HolographicFragmentReveal
                labId="lab4"
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
