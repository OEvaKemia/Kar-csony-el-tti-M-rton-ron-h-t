import React, { useState } from 'react';
import {
  MoleculeViewer3D,
  MoleculeDefinition,
  FunctionalGroupType,
} from '../3d/MoleculeViewer3D';
import {
  CINNAMALDEHYDE_MOLECULE,
  LIMONENE_MOLECULE,
  VANILLIN_MOLECULE,
  EUGENOL_MOLECULE,
} from '../../config/molecules';
import { soundManager } from '../../utils/audio';
import { HolographicFragmentReveal } from '../HolographicFragmentReveal';
import { CheckCircle, AlertCircle, KeyRound, MousePointerClick } from 'lucide-react';

interface Lab2AromasProps {
  onComplete: (code: string) => void;
  completed: boolean;
  lowGraphics?: boolean;
}

type SampleKey = 'sample1' | 'sample2' | 'sample3' | 'sample4';

interface SampleConfig {
  key: SampleKey;
  label: string;
  displayName: string;
  molecule: MoleculeDefinition;
  formulaValue: string;
  requiredTypes: FunctionalGroupType[];
  scentSummary: string;
}

const SAMPLES: Record<SampleKey, SampleConfig> = {
  sample1: {
    key: 'sample1',
    label: '1. minta',
    displayName: 'Cinnamaldehid (fahéjaldehid)',
    molecule: CINNAMALDEHYDE_MOLECULE,
    formulaValue: 'C9H8O',
    requiredTypes: ['aldehyde', 'double_bond'],
    scentSummary: 'Cinnamaldehid (fahéjaldehid): aldehidcsoport + C=C kettős kötés',
  },
  sample2: {
    key: 'sample2',
    label: '2. minta',
    displayName: 'Vanillin',
    molecule: VANILLIN_MOLECULE,
    formulaValue: 'C8H8O3',
    requiredTypes: ['aldehyde', 'phenolic_oh', 'ether'],
    scentSummary: 'Vanillin: aldehidcsoport + fenolos hidroxilcsoport + étercsoport',
  },
  sample3: {
    key: 'sample3',
    label: '3. minta',
    displayName: 'Limonén',
    molecule: LIMONENE_MOLECULE,
    formulaValue: 'C10H16',
    requiredTypes: ['double_bond'],
    scentSummary: 'Limonén: C=C kettős kötések (oxigéntartalmú funkciós csoport nélkül)',
  },
  sample4: {
    key: 'sample4',
    label: '4. minta',
    displayName: 'Eugenol',
    molecule: EUGENOL_MOLECULE,
    formulaValue: 'C10H12O2',
    requiredTypes: ['phenolic_oh', 'ether', 'double_bond'],
    scentSummary: 'Eugenol: fenolos hidroxilcsoport + étercsoport + C=C kettős kötés',
  },
};

const SAMPLE_KEYS: SampleKey[] = ['sample1', 'sample2', 'sample3', 'sample4'];

const FORMULA_OPTIONS = [
  { value: 'C9H8O', label: 'C₉H₈O' },
  { value: 'C8H8O3', label: 'C₈H₈O₃' },
  { value: 'C10H16', label: 'C₁₀H₁₆' },
  { value: 'C10H12O2', label: 'C₁₀H₁₂O₂' },
];

const GROUP_LABELS: Record<FunctionalGroupType, string> = {
  aldehyde: 'Aldehidcsoport',
  phenolic_oh: 'Fenolos hidroxilcsoport',
  ether: 'Étercsoport',
  double_bond: 'C=C kettős kötés',
};

export const Lab2Aromas: React.FC<Lab2AromasProps> = ({
  onComplete,
  completed,
  lowGraphics = false,
}) => {
  const [selectedSampleKey, setSelectedSampleKey] = useState<SampleKey>('sample1');

  // Task 1: Matching 3D samples to formulas ONLY (no molecule names!)
  const [formulaMatches, setFormulaMatches] = useState<Record<SampleKey, string>>({
    sample1: completed ? 'C9H8O' : '',
    sample2: completed ? 'C8H8O3' : '',
    sample3: completed ? 'C10H16' : '',
    sample4: completed ? 'C10H12O2' : '',
  });
  const [task1Passed, setTask1Passed] = useState(completed);
  const [task1Error, setTask1Error] = useState('');

  // Task 2: Saboteur chemical deduction
  const [saboteurChoice, setSaboteurChoice] = useState<string>(completed ? 'b' : '');
  const [task2Passed, setTask2Passed] = useState(completed);
  const [task2Error, setTask2Error] = useState('');

  // Task 3: Interactive 3D functional group recognition
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [neutralAtomNotice, setNeutralAtomNotice] = useState(false);

  const [identifiedGroupIds, setIdentifiedGroupIds] = useState<Record<SampleKey, string[]>>(() => {
    if (!completed) {
      return { sample1: [], sample2: [], sample3: [], sample4: [] };
    }
    return {
      sample1: (CINNAMALDEHYDE_MOLECULE.functionalGroups || []).map((g) => g.id),
      sample2: (VANILLIN_MOLECULE.functionalGroups || []).map((g) => g.id),
      sample3: (LIMONENE_MOLECULE.functionalGroups || []).map((g) => g.id),
      sample4: (EUGENOL_MOLECULE.functionalGroups || []).map((g) => g.id),
    };
  });

  const [recognizedTypes, setRecognizedTypes] = useState<Record<SampleKey, FunctionalGroupType[]>>({
    sample1: completed ? ['aldehyde', 'double_bond'] : [],
    sample2: completed ? ['aldehyde', 'phenolic_oh', 'ether'] : [],
    sample3: completed ? ['double_bond'] : [],
    sample4: completed ? ['phenolic_oh', 'ether', 'double_bond'] : [],
  });
  const [task3Error, setTask3Error] = useState('');
  const [task3Feedback, setTask3Feedback] = useState('');

  // Final Code (2313)
  const [enteredCode, setEnteredCode] = useState(completed ? '2313' : '');
  const [codeError, setCodeError] = useState('');
  const [justUnlocked, setJustUnlocked] = useState(false);

  const activeSample = SAMPLES[selectedSampleKey];

  const isSampleGroupsComplete = (key: SampleKey) => {
    const req = SAMPLES[key].requiredTypes;
    const found = recognizedTypes[key];
    return req.every((t) => found.includes(t));
  };

  const task3Passed = completed || SAMPLE_KEYS.every((k) => isSampleGroupsComplete(k));

  const handleSelectSample = (key: SampleKey) => {
    soundManager.playClick();
    setSelectedSampleKey(key);
    setSelectedGroupId(null);
    setSelectedGroupName('');
    setNeutralAtomNotice(false);
    setTask3Error('');
    setTask3Feedback('');
  };

  const handleVerifyTask1 = () => {
    soundManager.playClick();
    const allCorrect = SAMPLE_KEYS.every(
      (k) => formulaMatches[k] === SAMPLES[k].formulaValue
    );
    if (allCorrect) {
      soundManager.playSuccess();
      setTask1Error('');
      setTask1Passed(true);
    } else {
      soundManager.playError();
      setTask1Error(
        'Hibás összegképlet-párosítás! Forgasd el a 3D modelleket, és számold meg a szürke (C), fehér (H) és piros (O) atomokat.'
      );
    }
  };

  const handleVerifyTask2 = () => {
    soundManager.playClick();
    if (saboteurChoice === 'b') {
      soundManager.playSuccess();
      setTask2Error('');
      setTask2Passed(true);
    } else {
      soundManager.playError();
      setTask2Error(
        'Vizsgáld meg újra mind a négy minta gyűrűjét (hány kettős kötés van a 6-tagú gyűrűben?) és az oxigénatomok jelenlétét!'
      );
    }
  };

  const handleSelect3DGroup = (groupId: string) => {
    soundManager.playClick();
    setSelectedGroupId(groupId);
    setNeutralAtomNotice(false);
    setTask3Error('');
    setTask3Feedback('');
  };

  const handleSelectNeutralAtom = () => {
    soundManager.playClick();
    setSelectedGroupId(null);
    setNeutralAtomNotice(true);
    setTask3Error('');
    setTask3Feedback('');
  };

  const handleSubmitGroupIdentification = () => {
    soundManager.playClick();
    if (!selectedGroupId) {
      soundManager.playError();
      setTask3Error('Előbb kattints közvetlenül egy atomcsoportra a 3D molekulán!');
      return;
    }
    if (!selectedGroupName) {
      soundManager.playError();
      setTask3Error('Válaszd ki a kijelölt atomcsoport nevét a legördülő listából!');
      return;
    }

    const region = activeSample.molecule.functionalGroups?.find(
      (g) => g.id === selectedGroupId
    );
    if (!region) return;

    if (region.type === selectedGroupName) {
      soundManager.playSuccess();
      setTask3Error('');

      // Add region id to highlighted identified list (for Limonene, clicking either C=C marks that group)
      setIdentifiedGroupIds((prev) => ({
        ...prev,
        [selectedSampleKey]: prev[selectedSampleKey].includes(region.id)
          ? prev[selectedSampleKey]
          : [...prev[selectedSampleKey], region.id],
      }));

      setRecognizedTypes((prev) => ({
        ...prev,
        [selectedSampleKey]: prev[selectedSampleKey].includes(region.type)
          ? prev[selectedSampleKey]
          : [...prev[selectedSampleKey], region.type],
      }));

      setSelectedGroupId(null);
      setSelectedGroupName('');
      setTask3Feedback(
        selectedSampleKey === 'sample3'
          ? '✓ Helyes! C=C kettős kötés rögzítve (ez a minta nem tartalmaz oxigéntartalmú funkciós csoportot).'
          : `✓ Helyes! „${GROUP_LABELS[region.type]}” rögzítve ennél a mintánál.`
      );
    } else {
      soundManager.playError();
      setTask3Feedback('');
      setTask3Error(
        'Ez a megnevezés nem egyezik a 3D modellen kijelölt atomcsoporttal! Nézd meg az atomokat és a kötéseket (pl. van-e -OH, -O-CH₃, -CH=O vagy C=C).'
      );
    }
  };

  const handleVerifyCode = () => {
    soundManager.playClick();
    if (!task1Passed || !task2Passed || !task3Passed) {
      soundManager.playError();
      setCodeError('Előbb teljesítsd mindhárom feladatot (összegképletek, szabotőr cáfolása, és az összes minta funkciós csoportjai)!');
      return;
    }

    if (enteredCode.trim() === '2313') {
      soundManager.playSealUnlock();
      setCodeError('');
      setJustUnlocked(true);
      onComplete('2313');
    } else {
      soundManager.playError();
      setCodeError('Hibás kód! Számold össze az 1., 2., 3. és 4. mintában felismert eltérő funkciós csoportok számát ebben a sorrendben.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Briefing banner */}
      <div className="cyber-panel rounded-2xl p-4 sm:p-5 neon-box-gold flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono-tech text-xs tracking-wider uppercase mb-1">
            <span>II. Küldetés • Szerves Kémia & Funkciós Csoportok</span>
            {completed && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-400/50 px-2 py-0.5 rounded text-[11px] font-bold">
                Pecsét Megszerezve
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
            Az Illatmolekulák Titkos Kamrája
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Forgasd és vizsgáld meg a négy ismeretlen 3D molekulát! Állapítsd meg az összegképletüket az atomok alapján, cáfold meg a szabotőr állítását, majd kattints közvetlenül a 3D modellek funkciós csoportjaira!
          </p>
        </div>

        <div className="p-3 bg-[#060c1f] border border-amber-500/50 rounded-xl text-center min-w-[100px]">
          <div className="text-[10px] text-slate-400 uppercase font-mono-tech">Kód</div>
          <div className="text-lg font-mono-tech font-bold text-amber-300 tracking-widest">
            {completed ? '2313' : '????'}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 3D Molecule Interactive View (molecule names visible, NO formulas!) */}
        <div className="lg:col-span-7 space-y-4">
          <MoleculeViewer3D
            molecule={activeSample.molecule}
            displayLabel={`${activeSample.label} • ${activeSample.displayName}`}
            height="370px"
            lowGraphics={lowGraphics}
            selectableGroups={activeSample.molecule.functionalGroups}
            selectedGroupId={selectedGroupId}
            identifiedGroupIds={identifiedGroupIds[selectedSampleKey]}
            onSelectGroup={handleSelect3DGroup}
            onSelectNeutralAtom={handleSelectNeutralAtom}
          />

          {/* Molecule Selector Buttons (names visible, NO molecular formulas) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SAMPLE_KEYS.map((key) => {
              const sample = SAMPLES[key];
              const isSelected = selectedSampleKey === key;
              const groupsDone = isSampleGroupsComplete(key);
              return (
                <button
                  key={key}
                  onClick={() => handleSelectSample(key)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 neon-box-gold'
                      : 'cyber-panel text-slate-300 hover:border-amber-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs font-mono-tech">{sample.label}</span>
                    {groupsDone && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                  <div className="text-[11px] font-medium text-amber-200/95 mt-1 leading-tight">
                    {sample.displayName}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 3D Selection Status Strip */}
          <div className="cyber-panel p-3 rounded-xl text-xs font-mono-tech flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-cyan-300">
              <MousePointerClick className="w-4 h-4 shrink-0" />
              {selectedGroupId
                ? 'Kijelölt atomcsoport aktív a 3D modellen — azonosítsd a 3. feladatban!'
                : neutralAtomNotice
                ? 'Ez az atom a gyűrű alapvázához tartozik — válassz jellemző atomcsoportot vagy kettős kötést!'
                : 'Kattints a 3D modellen egy atomcsoportra vagy kettős kötésre!'}
            </span>
            <span className="text-slate-400">
              Színek: <span className="text-cyan-300">kijelölt</span> •{' '}
              <span className="text-emerald-400">felismert</span>
            </span>
          </div>
        </div>

        {/* Right: Tasks */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 1. Feladat: Összegképlet meghatározása (ONLY formulas!) */}
          <div className={`p-4 rounded-xl border transition-all ${
            task1Passed ? 'bg-amber-950/20 border-amber-500/40' : 'cyber-panel'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-900 border border-amber-400 text-amber-300 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <h3 className="font-display font-bold text-sm text-slate-100">
                  1. Feladat: Összegképletek meghatározása
                </h3>
              </div>
              {task1Passed && <CheckCircle className="w-4 h-4 text-amber-400" />}
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Számold meg a 3D modellekben a C (szürke), H (fehér) és O (piros) atomokat, majd válaszd ki mindegyik minta összegképletét!
            </p>

            <div className="space-y-2 mb-3">
              {SAMPLE_KEYS.map((key) => (
                <div key={key} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-200 font-mono-tech font-bold">
                    {SAMPLES[key].label}:
                  </span>
                  <select
                    disabled={task1Passed}
                    value={formulaMatches[key]}
                    onChange={(e) => {
                      setFormulaMatches({ ...formulaMatches, [key]: e.target.value });
                      setTask1Error('');
                    }}
                    className="bg-[#060c1f] border border-slate-700 rounded-lg p-1.5 text-xs font-mono-tech text-slate-200 focus:border-amber-400 outline-none w-40"
                  >
                    <option value="">Összegképlet...</option>
                    {FORMULA_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors"
              >
                Összegképletek ellenőrzése
              </button>
            ) : (
              <div className="text-xs text-emerald-400 font-mono-tech">
                ✓ Mind a négy molekula összegképlete pontosan azonosítva!
              </div>
            )}
          </div>

          {/* 2. Feladat: Szabotőr állításának cáfolása */}
          <div className={`p-4 rounded-xl border transition-all ${
            task2Passed ? 'bg-amber-950/20 border-amber-500/40' : 'cyber-panel'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-900 border border-amber-400 text-amber-300 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h3 className="font-display font-bold text-sm text-slate-100">
                  2. Feladat: A szabotőr állítása
                </h3>
              </div>
              {task2Passed && <CheckCircle className="w-4 h-4 text-amber-400" />}
            </div>

            <div className="bg-[#060c1f] p-3 rounded-lg border border-amber-500/30 text-xs text-amber-200 font-mono-tech mb-3 leading-relaxed">
              „Mind a négy ünnepi minta aromás benzolgyűrűt és legalább egy oxigéntartalmú funkciós csoportot tartalmaz.”
            </div>

            <div className="space-y-2 mb-3">
              {[
                {
                  id: 'a',
                  text: 'Az állítás igaz: mind a négy mintában piros O-atom és 3 kettős kötésű benzolgyűrű látható.',
                },
                {
                  id: 'b',
                  text: 'Hamis: a 3. minta nem tartalmaz oxigént, és 6-tagú gyűrűjében csak egy C=C kettős kötés található.',
                },
                {
                  id: 'c',
                  text: 'Hamis: az 1. minta hattagú gyűrűje telített, így egyáltalán nincs benne kettős kötés.',
                },
                {
                  id: 'd',
                  text: 'Hamis: a 2. és 4. minta nem tartalmaz szén-szén kettős kötést a gyűrűben.',
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                    saboteurChoice === opt.id
                      ? 'bg-amber-500/15 border-amber-400/70 text-amber-100'
                      : 'bg-[#060c1f]/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="saboteur_aroma"
                    value={opt.id}
                    disabled={task2Passed}
                    checked={saboteurChoice === opt.id}
                    onChange={(e) => {
                      setSaboteurChoice(e.target.value);
                      setTask2Error('');
                    }}
                    className="accent-amber-500 mt-0.5 shrink-0"
                  />
                  <span>{opt.text}</span>
                </label>
              ))}
            </div>

            {task2Error && (
              <div className="flex items-start gap-1.5 text-xs text-rose-400 mb-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{task2Error}</span>
              </div>
            )}

            {!task2Passed && (
              <button
                onClick={handleVerifyTask2}
                className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors"
              >
                Értékelés rögzítése
              </button>
            )}
          </div>

          {/* 3. Feladat: Funkciós csoportok felismerése közvetlenül a 3D modellen */}
          <div className={`p-4 rounded-xl border transition-all ${
            task3Passed ? 'bg-amber-950/20 border-amber-500/40' : 'cyber-panel'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-900 border border-amber-400 text-amber-300 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <h3 className="font-display font-bold text-sm text-amber-300">
                  3. Feladat: Funkciós csoportok felismerése
                </h3>
              </div>
              {task3Passed && <CheckCircle className="w-4 h-4 text-amber-400" />}
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Válaszd ki sorban az <strong>1–4. mintát</strong>, kattints közvetlenül a 3D molekulán a jellegzetes atomcsoportokra (cián kiemelés), majd nevezd meg őket! Egy molekulán több csoport is előfordulhat.
            </p>

            {/* Current Sample Interactive Identification Controls */}
            {!task3Passed && (
              <div className="bg-[#060c1f] p-3 rounded-xl border border-slate-800 space-y-2.5 mb-3">
                <div className="flex items-center justify-between text-xs font-mono-tech">
                  <span className="text-amber-300 font-bold">
                    Aktív: {activeSample.label}
                  </span>
                  <span className={selectedGroupId ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                    {selectedGroupId ? '● Atomcsoport kijelölve' : '○ Nincs kijelölés'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedGroupName}
                    onChange={(e) => {
                      setSelectedGroupName(e.target.value);
                      setTask3Error('');
                    }}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-amber-400 outline-none"
                  >
                    <option value="">Válassz funkciós csoportot...</option>
                    <option value="aldehyde">Aldehidcsoport (-CH=O)</option>
                    <option value="phenolic_oh">Fenolos hidroxilcsoport (-OH)</option>
                    <option value="ether">Étercsoport (-O-CH₃)</option>
                    <option value="double_bond">C=C kettős kötés</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleSubmitGroupIdentification}
                    className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shrink-0"
                  >
                    Rögzítés
                  </button>
                </div>

                {task3Feedback && (
                  <div className="text-xs text-emerald-400 font-mono-tech">
                    {task3Feedback}
                  </div>
                )}

                {task3Error && (
                  <div className="flex items-start gap-1.5 text-xs text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{task3Error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Progress list of recognized groups per sample */}
            <div className="space-y-1.5 text-xs font-mono-tech mb-2">
              {SAMPLE_KEYS.map((key) => {
                const found = recognizedTypes[key];
                const sampleComplete = isSampleGroupsComplete(key);
                return (
                  <div
                    key={key}
                    className={`p-2 rounded-lg border flex flex-col gap-1 ${
                      sampleComplete
                        ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200'
                        : 'bg-[#050a18] border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300">
                        {SAMPLES[key].label} – {SAMPLES[key].displayName}:
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {found.length} felismerve {sampleComplete ? '✓' : ''}
                      </span>
                    </div>
                    {found.length > 0 && (
                      <div className="text-[11px] text-cyan-200">
                        {found.map((t) => GROUP_LABELS[t]).join(' • ')}
                        {key === 'sample3' && sampleComplete ? ' (oxigén nélkül)' : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {task3Passed && (
              <div className="p-2.5 bg-emerald-950/35 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 space-y-1 mt-2">
                <div className="font-bold font-mono-tech">
                  ✓ Minden illatmolekula funkciós csoportja azonosítva!
                </div>
                {SAMPLE_KEYS.map((k) => (
                  <div key={k} className="text-[11px] text-slate-200">
                    • {SAMPLES[k].label}: {SAMPLES[k].scentSummary}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pecsét feloldó kód */}
          <div className="p-4 rounded-xl cyber-panel neon-box-gold">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <h3 className="font-display font-bold text-sm text-amber-300">
                Pecsét feloldó kód
              </h3>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              A 4 jegyű kód az <strong>1., 2., 3. és 4. mintában</strong> felismert eltérő funkciós csoportok darabszámából áll össze ebben a sorrendben.
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
                      : 'border-amber-500/60 text-amber-300 focus:border-amber-400'
                  }`}
                />
                <KeyRound className="absolute right-3 top-2.5 w-5 h-5 text-slate-500 pointer-events-none" />
              </div>

              {!completed && (
                <button
                  onClick={handleVerifyCode}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
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
                labId="lab2"
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
