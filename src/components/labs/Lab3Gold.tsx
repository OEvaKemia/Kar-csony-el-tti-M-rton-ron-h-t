import React, { useState } from 'react';
import { DensityScale3D } from '../3d/DensityScale3D';
import { soundManager } from '../../utils/audio';
import { HolographicFragmentReveal } from '../HolographicFragmentReveal';
import { CheckCircle, AlertCircle, KeyRound } from 'lucide-react';

interface Lab3GoldProps {
  onComplete: (code: string) => void;
  completed: boolean;
  lowGraphics?: boolean;
}

type CoinId = 'A' | 'B' | 'C';

const COIN_MASSES: Record<CoinId, number> = {
  A: 57.9,
  B: 77.2,
  C: 96.5,
};

export const Lab3Gold: React.FC<Lab3GoldProps> = ({
  onComplete,
  completed,
  lowGraphics = false,
}) => {
  const [selectedCoin, setSelectedCoin] = useState<CoinId>('A');
  const [coinLocation, setCoinLocation] = useState<'tray' | 'scale' | 'cylinder'>('tray');

  // Track which coins have actually been measured on scale & in graduated cylinder
  const [weighedCoins, setWeighedCoins] = useState<Record<CoinId, boolean>>({
    A: completed,
    B: completed,
    C: completed,
  });
  const [volumeMeasuredCoins, setVolumeMeasuredCoins] = useState<Record<CoinId, boolean>>({
    A: completed,
    B: completed,
    C: completed,
  });

  // Task 1: Identify solid gold coin (Coin C = 96.5 g / 5.0 cm3 = 19.3 g/cm3)
  const [task1Choice, setTask1Choice] = useState<string>(completed ? 'C' : '');
  const [task1Passed, setTask1Passed] = useState(completed);
  const [task1Error, setTask1Error] = useState('');

  // Task 2: Calculate cavity volume of Coin B (77.2 g)
  const [cavityInput, setCavityInput] = useState<string>(completed ? '1.0' : '');
  const [task2Passed, setTask2Passed] = useState(completed);
  const [task2Error, setTask2Error] = useState('');

  // Task 3: Final code (1931)
  const [enteredCode, setEnteredCode] = useState(completed ? '1931' : '');
  const [codeError, setCodeError] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  const allCoinsMeasured = (['A', 'B', 'C'] as const).every(
    (c) => weighedCoins[c] && volumeMeasuredCoins[c]
  );

  const handleSelectCoin = (coin: CoinId) => {
    soundManager.playClick();
    setSelectedCoin(coin);
    setCoinLocation('tray');
  };

  const handlePlaceOnScale = () => {
    soundManager.playClick();
    setCoinLocation('scale');
    setWeighedCoins((prev) => ({ ...prev, [selectedCoin]: true }));
    setTask1Error('');
  };

  const handlePlaceInCylinder = () => {
    soundManager.playDrop();
    setCoinLocation('cylinder');
    setVolumeMeasuredCoins((prev) => ({ ...prev, [selectedCoin]: true }));
    setTask1Error('');
  };

  const handleVerifyTask1 = () => {
    soundManager.playClick();
    if (!allCoinsMeasured) {
      soundManager.playError();
      setTask1Error(
        'A válasz beküldése előtt kötelező MINDHÁROM érme (A, B és C) tömegét a mérlegen, térfogatát pedig a mérőhengerben megmérni!'
      );
      return;
    }

    if (task1Choice === 'C') {
      soundManager.playSuccess();
      setTask1Error('');
      setTask1Passed(true);
    } else {
      soundManager.playError();
      setTask1Error(
        'Hibás választás! Számítsd ki mindhárom érme sűrűségét a mért adatokból: ρ = m / V.'
      );
    }
  };

  const handleVerifyTask2 = () => {
    soundManager.playClick();
    if (!weighedCoins.B || !volumeMeasuredCoins.B) {
      soundManager.playError();
      setTask2Error('Előbb mérd meg a B érme tömegét a mérlegen és térfogatát a mérőhengerben!');
      return;
    }

    const val = parseFloat(cavityInput.replace(',', '.'));
    if (!Number.isNaN(val) && Math.abs(val - 1.0) < 0.05) {
      soundManager.playSuccess();
      setTask2Error('');
      setTask2Passed(true);
    } else {
      soundManager.playError();
      setTask2Error(
        'Helytelen üregtérfogat! Számold ki először a tömör aranyrész térfogatát (V = m / ρ_arany), majd vond ki a külső térfogatból.'
      );
    }
  };

  const handleVerifyCode = () => {
    soundManager.playClick();
    if (enteredCode.trim() === '1931') {
      soundManager.playSealUnlock();
      setCodeError(false);
      setJustUnlocked(true);
      onComplete('1931');
    } else {
      soundManager.playError();
      setCodeError(true);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Briefing banner */}
      <div className="cyber-panel rounded-2xl p-4 sm:p-5 neon-box-gold flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono-tech text-xs tracking-wider uppercase mb-1">
            <span>III. Küldetés • Fizikai Kémia & Sűrűségmérés</span>
            {completed && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-400/50 px-2 py-0.5 rounded text-[11px] font-bold">
                Pecsét Megszerezve
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
            A Hamis Arany Rejtélye
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Válaszd ki az A, B és C érméket egyenként, mérd meg mindegyik tömegét az analitikai mérlegen és térfogatát a mérőhengerben! Határozd meg a tömör aranyérmét és a belső üreg térfogatát!
          </p>
        </div>

        <div className="p-3 bg-[#060c1f] border border-amber-500/50 rounded-xl text-center min-w-[100px]">
          <div className="text-[10px] text-slate-400 uppercase font-mono-tech">Kód</div>
          <div className="text-lg font-mono-tech font-bold text-amber-300 tracking-widest">
            {completed ? '1931' : '????'}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 3D Scale & Cylinder */}
        <div className="lg:col-span-7 space-y-4">
          <DensityScale3D
            selectedCoin={selectedCoin}
            coinLocation={coinLocation}
            coinMasses={COIN_MASSES}
            onSelectCoin={handleSelectCoin}
            lowGraphics={lowGraphics}
          />

          {/* Interactive controls */}
          <div className="cyber-panel rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono-tech text-amber-300">Kiválasztott érme vizsgálata:</span>
              <span className="text-[11px] font-mono-tech text-slate-400">
                Mindhárom érme mérlegelése és térfogatmérése kötelező
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {(['A', 'B', 'C'] as const).map((coin) => {
                const doneBoth = weighedCoins[coin] && volumeMeasuredCoins[coin];
                return (
                  <button
                    key={coin}
                    onClick={() => handleSelectCoin(coin)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedCoin === coin
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 neon-box-gold'
                        : 'bg-[#060c1f] border-slate-800 text-slate-300 hover:border-amber-400/50'
                    }`}
                  >
                    <div className="font-bold text-xs font-mono-tech">Érme [{coin}]</div>
                    <div className="text-[10px] font-mono-tech mt-0.5 text-slate-400">
                      {doneBoth ? (
                        <span className="text-emerald-400">✓ Kimérve</span>
                      ) : (
                        <span>
                          {weighedCoins[coin] ? 'm✓' : 'm—'} / {volumeMeasuredCoins[coin] ? 'V✓' : 'V—'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Placement action buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setCoinLocation('tray');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-mono-tech font-bold border transition-all ${
                  coinLocation === 'tray'
                    ? 'bg-slate-700/60 border-slate-400 text-white'
                    : 'bg-[#060c1f] border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                Tálcára vissza
              </button>
              <button
                onClick={handlePlaceOnScale}
                className={`px-3 py-2 rounded-xl text-xs font-mono-tech font-bold border transition-all ${
                  coinLocation === 'scale'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 neon-box-gold'
                    : 'bg-[#060c1f] border-slate-700 text-slate-300 hover:border-amber-400'
                }`}
              >
                Mérlegre
              </button>
              <button
                onClick={handlePlaceInCylinder}
                className={`px-3 py-2 rounded-xl text-xs font-mono-tech font-bold border transition-all ${
                  coinLocation === 'cylinder'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 neon-box-cyan'
                    : 'bg-[#060c1f] border-slate-700 text-slate-300 hover:border-cyan-400'
                }`}
              >
                Mérőhengerbe
              </button>
            </div>

            {/* Live Instrument Readout + Recorded Measurements Table */}
            <div className="bg-[#060c1f] p-3 rounded-xl border border-slate-800 grid grid-cols-2 gap-3 text-xs font-mono-tech">
              <div>
                <span className="text-slate-400 block">Mérleg kijelzője:</span>
                <span className="text-amber-300 font-bold text-sm">
                  {coinLocation === 'scale'
                    ? `${COIN_MASSES[selectedCoin].toFixed(1)} g`
                    : '0,00 g (üres)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Mérőhenger vízszint:</span>
                <span className="text-cyan-300 font-bold text-sm">
                  {coinLocation === 'cylinder'
                    ? '45,0 cm³ (+5,0 cm³)'
                    : '40,0 cm³ (alapállapot)'}
                </span>
              </div>
            </div>

            {/* Measurement Log (values appear ONLY after actual measurements!) */}
            <div className="bg-[#050a18] p-3 rounded-xl border border-slate-800/90 space-y-1.5 text-xs font-mono-tech">
              <div className="text-[11px] text-amber-300/90 uppercase tracking-wider mb-1">
                Rögzített mérési eredmények:
              </div>
              {(['A', 'B', 'C'] as const).map((coin) => (
                <div
                  key={coin}
                  className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-b-0"
                >
                  <span className="text-slate-300 font-bold">Érme {coin}:</span>
                  <div className="flex items-center gap-4">
                    <span className={weighedCoins[coin] ? 'text-amber-300' : 'text-slate-500'}>
                      m = {weighedCoins[coin] ? `${COIN_MASSES[coin].toFixed(1)} g` : 'Még nem mérve'}
                    </span>
                    <span className={volumeMeasuredCoins[coin] ? 'text-cyan-300' : 'text-slate-500'}>
                      V = {volumeMeasuredCoins[coin] ? '5,0 cm³' : 'Még nem mérve'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tasks */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 1. Feladat */}
          <div className={`p-4 rounded-xl border transition-all ${
            task1Passed ? 'bg-amber-950/20 border-amber-500/40' : 'cyber-panel'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-900 border border-amber-400 text-amber-300 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <h3 className="font-display font-bold text-sm text-slate-100">
                  1. Feladat: Tiszta tömör arany érme
                </h3>
              </div>
              {task1Passed && <CheckCircle className="w-4 h-4 text-amber-400" />}
            </div>

            <p className="text-xs text-slate-300 mb-3">
              A színarany sűrűsége: <span className="text-amber-300 font-mono-tech font-bold">19,3 g/cm³</span>.
              Mérd meg mindhárom érmét, majd válaszd ki, melyik készült tömör aranyból!
            </p>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {(['A', 'B', 'C'] as const).map((coin) => (
                <button
                  key={coin}
                  disabled={task1Passed}
                  onClick={() => {
                    setTask1Choice(coin);
                    setTask1Error('');
                  }}
                  className={`p-2.5 rounded-lg border text-xs font-mono-tech transition-all ${
                    task1Choice === coin
                      ? 'bg-amber-500/30 border-amber-400 text-amber-200 font-bold'
                      : 'bg-[#060c1f] border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  Érme {coin}
                </button>
              ))}
            </div>

            {task1Error && (
              <div className="flex items-start gap-1.5 text-xs text-rose-400 mb-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{task1Error}</span>
              </div>
            )}

            {!task1Passed ? (
              <button
                onClick={handleVerifyTask1}
                className={`w-full py-2 rounded-lg font-bold text-xs transition-colors ${
                  allCoinsMeasured
                    ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {allCoinsMeasured
                  ? 'Azonosítás rögzítése'
                  : 'Mérd meg mind a 3 érmét az ellenőrzéshez'}
              </button>
            ) : (
              <div className="text-xs text-emerald-400 font-mono-tech">
                ✓ Helyes! A C érme tiszta tömör arany (19,3 g/cm³).
              </div>
            )}
          </div>

          {/* 2. Feladat */}
          <div className={`p-4 rounded-xl border transition-all ${
            task2Passed ? 'bg-amber-950/20 border-amber-500/40' : 'cyber-panel'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-900 border border-amber-400 text-amber-300 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h3 className="font-display font-bold text-sm text-slate-100">
                  2. Feladat: A B érme üregtérfogata
                </h3>
              </div>
              {task2Passed && <CheckCircle className="w-4 h-4 text-amber-400" />}
            </div>

            <p className="text-xs text-slate-300 mb-3">
              A röntgenvizsgálat igazolta, hogy a B érme anyaga valódi arany (19,3 g/cm³), viszont belül üreges!
              A mért tömeg és külső térfogat segítségével számítsd ki az üreg térfogatát:
            </p>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Üreg térfogata..."
                disabled={task2Passed}
                value={cavityInput}
                onChange={(e) => {
                  setCavityInput(e.target.value);
                  setTask2Error('');
                }}
                className="flex-1 bg-[#060c1f] border border-slate-700 rounded-lg p-2 text-xs font-mono-tech text-amber-300 focus:border-amber-400 outline-none"
              />
              <span className="text-xs font-mono-tech text-slate-400">cm³</span>
              {!task2Passed && (
                <button
                  onClick={handleVerifyTask2}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Ellenőrzés
                </button>
              )}
            </div>

            {task2Error && (
              <div className="flex items-start gap-1.5 text-xs text-rose-400 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{task2Error}</span>
              </div>
            )}

            {task2Passed && (
              <div className="text-xs text-emerald-400 font-mono-tech mt-2">
                ✓ Helyes üregtérfogat rögzítve!
              </div>
            )}
          </div>

          {/* 3. Feladat */}
          <div className="p-4 rounded-xl cyber-panel neon-box-gold">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-amber-900 border border-amber-400 text-amber-300 text-xs flex items-center justify-center font-bold">
                3
              </span>
              <h3 className="font-display font-bold text-sm text-amber-300">
                3. Feladat: Pecsét feloldó kód
              </h3>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              A kód a tiszta arany sűrűségének számjegyeiből (tizedesvessző nélkül, egy tizedesjegy pontossággal) és a B érme üregtérfogatának egész részéből áll össze ebben a sorrendben.
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
                    setCodeError(false);
                  }}
                  disabled={completed}
                  className={`w-full bg-[#060c1f] border rounded-xl py-2 px-3 text-center font-mono-tech text-lg tracking-widest outline-none transition-colors ${
                    codeError
                      ? 'border-rose-500 text-rose-400'
                      : completed
                      ? 'border-emerald-500 text-emerald-300'
                      : 'border-amber-500/60 text-amber-300 focus:border-amber-400'
                  }`}
                />
                <KeyRound className="absolute right-3 top-2.5 w-5 h-5 text-slate-500 pointer-events-none" />
              </div>

              {!completed && (
                <button
                  onClick={handleVerifyCode}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
                >
                  Feloldás
                </button>
              )}
            </div>

            {codeError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Hibás kód! Kövesd a fenti kódolási szabályt.</span>
              </div>
            )}

            {completed && (
              <HolographicFragmentReveal
                labId="lab3"
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
