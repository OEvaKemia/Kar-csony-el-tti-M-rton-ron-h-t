import React, { useState } from 'react';
import { FinaleHologram3D, FinaleStagePhase } from '../3d/FinaleHologram3D';
import { soundManager } from '../../utils/audio';
import { LAB_METADATA } from '../../config/gameData';
import { FinaleProgress } from '../../types';
import {
  CheckCircle,
  HelpCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  Space,
  Link2,
  RotateCcw,
} from 'lucide-react';

interface GrandFinaleProps {
  unlockedSealsCount: number;
  finaleState: FinaleProgress;
  onUpdateFinale: (update: Partial<FinaleProgress>) => void;
  onFinishGame: () => void;
  lowGraphics?: boolean;
}

interface FragmentTile {
  id: string;
  labLabel: string;
  text: string;
}

const INITIAL_TILES: FragmentTile[] = [
  { id: 'lab1', labLabel: '1. labor', text: LAB_METADATA.lab1.fragment }, // CUSO
  { id: 'lab2', labLabel: '2. labor', text: LAB_METADATA.lab2.fragment }, // OREM
  { id: 'lab3', labLabel: '3. labor', text: LAB_METADATA.lab3.fragment }, // NON
  { id: 'lab4', labLabel: '4. labor', text: LAB_METADATA.lab4.fragment }, // RE
  { id: 'lab5', labLabel: '5. labor', text: LAB_METADATA.lab5.fragment }, // LAB
];

const SOLVED_TILES: FragmentTile[] = [
  { id: 'lab3', labLabel: '3. labor', text: LAB_METADATA.lab3.fragment }, // NON
  { id: 'lab4', labLabel: '4. labor', text: LAB_METADATA.lab4.fragment }, // RE
  { id: 'lab1', labLabel: '1. labor', text: LAB_METADATA.lab1.fragment }, // CUSO
  { id: 'lab5', labLabel: '5. labor', text: LAB_METADATA.lab5.fragment }, // LAB
  { id: 'lab2', labLabel: '2. labor', text: LAB_METADATA.lab2.fragment }, // OREM
];

export const GrandFinale: React.FC<GrandFinaleProps> = ({
  unlockedSealsCount,
  finaleState,
  onUpdateFinale,
  onFinishGame,
  lowGraphics = false,
}) => {
  // Step 1: Drag / tap ordering + word boundaries (szóhatárok)
  const [tiles, setTiles] = useState<FragmentTile[]>(
    finaleState.latinPhraseRevealed ? SOLVED_TILES : INITIAL_TILES
  );
  const [spacesAfter, setSpacesAfter] = useState<boolean[]>(
    finaleState.latinPhraseRevealed
      ? [true, false, true, false]
      : [false, false, false, false]
  );
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [latinErrorMsg, setLatinErrorMsg] = useState('');

  // Step 2: Independent Hungarian translation interpretation (auto-finishes on valid meaning!)
  const [translationInput, setTranslationInput] = useState('');
  const [showVocabHelp, setShowVocabHelp] = useState(false);
  const [translationError, setTranslationError] = useState(false);

  const stagePhase: FinaleStagePhase = finaleState.latinPhraseRevealed ? 'hologram' : 'vault';

  // Build assembled string from current tiles + word boundary toggles
  const assembledSentence = tiles
    .map((tile, idx) => tile.text + (idx < tiles.length - 1 && spacesAfter[idx] ? ' ' : ''))
    .join('');

  const swapTiles = (fromIdx: number, toIdx: number) => {
    if (finaleState.latinPhraseRevealed || fromIdx === toIdx) return;
    if (fromIdx < 0 || toIdx < 0 || fromIdx >= tiles.length || toIdx >= tiles.length) return;
    soundManager.playClick();
    setLatinErrorMsg('');
    setTiles((prev) => {
      const next = [...prev];
      const temp = next[fromIdx];
      next[fromIdx] = next[toIdx];
      next[toIdx] = temp;
      return next;
    });
  };

  const handleTileTap = (index: number) => {
    if (finaleState.latinPhraseRevealed) return;
    if (selectedTileIndex === null) {
      soundManager.playClick();
      setSelectedTileIndex(index);
    } else if (selectedTileIndex === index) {
      soundManager.playClick();
      setSelectedTileIndex(null);
    } else {
      swapTiles(selectedTileIndex, index);
      setSelectedTileIndex(null);
    }
  };

  const handleShiftTile = (e: React.MouseEvent, index: number, direction: -1 | 1) => {
    e.stopPropagation();
    const target = index + direction;
    if (target < 0 || target >= tiles.length) return;
    setSelectedTileIndex(null);
    swapTiles(index, target);
  };

  const handleToggleSpace = (gapIndex: number) => {
    if (finaleState.latinPhraseRevealed) return;
    soundManager.playClick();
    setLatinErrorMsg('');
    setSpacesAfter((prev) => {
      const next = [...prev];
      next[gapIndex] = !next[gapIndex];
      return next;
    });
  };

  const handleResetAssembly = () => {
    if (finaleState.latinPhraseRevealed) return;
    soundManager.playClick();
    setTiles(INITIAL_TILES);
    setSpacesAfter([false, false, false, false]);
    setSelectedTileIndex(null);
    setLatinErrorMsg('');
  };

  // Step 1 Verification: ONLY accepts exact "NON RECUSO LABOREM"
  const handleVerifyLatin = () => {
    soundManager.playClick();
    const joinedNoSpaces = tiles.map((t) => t.text).join('');
    if (assembledSentence === 'NON RECUSO LABOREM') {
      soundManager.playHologramReveal();
      setLatinErrorMsg('');
      setSelectedTileIndex(null);
      onUpdateFinale({ latinPhraseRevealed: true });
    } else if (joinedNoSpaces === 'NONRECUSOLABOREM') {
      soundManager.playError();
      setLatinErrorMsg(
        'A töredékek sorrendje már helyes, de a szóhatárok (szóközök) még nem megfelelőek! Érintsd meg a blokkok közötti kötőelemeket a szavak elválasztásához.'
      );
    } else {
      soundManager.playError();
      setLatinErrorMsg(
        'A töredékek sorrendje vagy a szóhatárok még nem alkotnak helyes latin mondatot. Rendezd át a töredékeket, majd állítsd be a szóközöket!'
      );
    }
  };

  // Step 2: Independent Hungarian interpretation check -> immediately launches the full-screen celebratory finale!
  const evaluateHungarianMeaning = (text: string): boolean => {
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (lower.length < 6) return false;

    const hasNegation =
      lower.includes('nem') || lower.includes('soha') || lower.includes('ne ');
    const hasWork =
      lower.includes('munk') ||
      lower.includes('feladat') ||
      lower.includes('teher') ||
      lower.includes('terh') ||
      lower.includes('dolg') ||
      lower.includes('faradsag') ||
      lower.includes('kotelesseg') ||
      lower.includes('szolgalat');
    const hasRefuseVerb =
      lower.includes('utasit') ||
      lower.includes('elutasit') ||
      lower.includes('visszautasit') ||
      lower.includes('vonakod') ||
      lower.includes('hatral') ||
      lower.includes('futamod') ||
      lower.includes('terek ki') ||
      lower.includes('kiterek') ||
      lower.includes('vetem el') ||
      lower.includes('elvet') ||
      lower.includes('felek') ||
      lower.includes('kerul') ||
      lower.includes('zarkoz') ||
      lower.includes('tagad') ||
      lower.includes('huzod') ||
      lower.includes('huzodoz') ||
      lower.includes('ijed') ||
      lower.includes('retten') ||
      lower.includes('hagyom') ||
      lower.includes('dobom');

    const hasCommitment =
      (lower.includes('vallal') || lower.includes('elfogad') || lower.includes('keszen all')) &&
      hasWork;

    return (hasNegation && hasWork && hasRefuseVerb) || hasCommitment;
  };

  const handleVerifyTranslation = () => {
    soundManager.playClick();
    if (evaluateHungarianMeaning(translationInput)) {
      soundManager.playSceneTransition();
      setTranslationError(false);
      onUpdateFinale({
        meaningAccepted: true,
        locationIdentified: true,
        verifiedAtSchool: true,
        completed: true,
      });
      onFinishGame();
    } else {
      soundManager.playError();
      setTranslationError(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Briefing banner (spoiler-free until decoded) */}
      <div className="cyber-panel border border-amber-500/50 rounded-2xl p-5 neon-box-gold flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono-tech text-xs tracking-wider uppercase mb-1">
            <span>A Nagy Finálé • Kvantum-Dekódolás</span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-400/50 px-2 py-0.5 rounded text-[11px] font-bold">
              {unlockedSealsCount}/5 Pecsét elhelyezve
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-display font-bold text-white neon-glow-gold">
            Az Öt Pecsét Titkos Üzenete
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Mind az öt laboratórium pecsétje és nyers szótöredéke megérkezett a központi zárba.
            Rendezzétek helyes sorrendbe a töredékeket, jelöljétek ki a szóhatárokat, majd értelmezzétek az üzenetet!
          </p>
        </div>

        <div className="p-3 bg-amber-950/80 border border-amber-500/50 rounded-xl text-center min-w-[120px]">
          <div className="text-[10px] text-slate-400 uppercase font-mono-tech">Központi Zár</div>
          <div className="text-lg font-mono-tech font-bold text-amber-300">
            {finaleState.completed ? 'FELOLDVA' : finaleState.latinPhraseRevealed ? 'NYITOTT' : 'AKTÍV'}
          </div>
        </div>
      </div>

      {/* Pure Visual 3D Hologram Stage (ZERO captions about portrait/school images) */}
      <FinaleHologram3D
        unlockedSealsCount={unlockedSealsCount}
        phase={stagePhase}
        lowGraphics={lowGraphics}
        heightClassName="h-[310px] sm:h-[380px] lg:h-[420px]"
      />

      {/* Interactive Deciphering Steps */}
      <div className="space-y-4">
        {/* Step 1: Drag / Touch Ordering + Word Boundaries */}
        <div
          className={`p-4 sm:p-5 rounded-xl border transition-all ${
            finaleState.latinPhraseRevealed
              ? 'bg-amber-950/25 border-amber-500/45'
              : 'cyber-panel border-cyan-500/35'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-900 border border-amber-400 text-amber-300 text-xs flex items-center justify-center font-bold">
                1
              </span>
              <h3 className="font-display font-bold text-sm text-slate-100">
                1. Lépés: Töredékek sorrendje és szóhatárok
              </h3>
            </div>
            {finaleState.latinPhraseRevealed ? (
              <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <button
                type="button"
                onClick={handleResetAssembly}
                className="text-[11px] font-mono-tech text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                title="Alaphelyzet"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Alaphelyzet</span>
              </button>
            )}
          </div>

          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            <strong>Rendezés:</strong> Húzd a kártyákat egymásra egérrel, vagy mobilon/tableten
            érintsd meg egymás után a két cserélendő töredéket (vagy használd a nyilakat).
            <br />
            <strong>Szóhatárok:</strong> Érintsd meg a kártyák közötti kapcsolót a szóköz (
            <span className="text-cyan-300 font-mono-tech font-bold">␣</span>) be- vagy
            kikapcsolásához!
          </p>

          {/* Interactive Tiles + Gap Word-Boundary Toggles */}
          <div className="bg-[#050b1c] border border-slate-800 rounded-xl p-3 sm:p-4 mb-3">
            <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-1.5">
              {tiles.map((tile, idx) => {
                const isSelected = selectedTileIndex === idx;
                const isDragged = draggedIndex === idx;

                return (
                  <React.Fragment key={tile.id}>
                    <div
                      draggable={!finaleState.latinPhraseRevealed}
                      onDragStart={() => {
                        setDraggedIndex(idx);
                        setSelectedTileIndex(null);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedIndex !== null && draggedIndex !== idx) {
                          swapTiles(draggedIndex, idx);
                        }
                        setDraggedIndex(null);
                      }}
                      onDragEnd={() => setDraggedIndex(null)}
                      onClick={() => handleTileTap(idx)}
                      className={`select-none rounded-xl border px-2.5 py-2 transition-all flex flex-col items-center min-w-[78px] sm:min-w-[92px] ${
                        finaleState.latinPhraseRevealed
                          ? 'bg-amber-950/60 border-amber-400/60 text-amber-200 cursor-default'
                          : isSelected
                          ? 'bg-cyan-500/25 border-cyan-300 text-white scale-105 neon-box-cyan cursor-pointer'
                          : isDragged
                          ? 'opacity-40 border-purple-400 bg-purple-950/40 cursor-grabbing'
                          : 'bg-slate-900/95 border-purple-500/45 hover:border-cyan-400 text-amber-300 cursor-grab active:scale-95'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full text-[9px] font-mono-tech text-slate-400 mb-1">
                        <GripVertical className="w-3 h-3 text-slate-500" />
                        <span>{tile.labLabel}</span>
                      </div>

                      <div className="font-display font-black text-base sm:text-lg tracking-wider">
                        {tile.text}
                      </div>

                      {!finaleState.latinPhraseRevealed && (
                        <div className="flex items-center justify-between w-full mt-1.5 gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => handleShiftTile(e, idx, -1)}
                            aria-label="Balra mozgatás"
                            className="p-1 rounded bg-slate-950 border border-slate-800 hover:border-cyan-400 text-slate-300 disabled:opacity-25"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === tiles.length - 1}
                            onClick={(e) => handleShiftTile(e, idx, 1)}
                            aria-label="Jobbra mozgatás"
                            className="p-1 rounded bg-slate-950 border border-slate-800 hover:border-cyan-400 text-slate-300 disabled:opacity-25"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {idx < tiles.length - 1 && (
                      <button
                        type="button"
                        disabled={finaleState.latinPhraseRevealed}
                        onClick={() => handleToggleSpace(idx)}
                        title={
                          spacesAfter[idx]
                            ? 'Szóhatár (szóköz) aktív — kattints az összekapcsoláshoz'
                            : 'Összekapcsolva — kattints a szóköz beillesztéséhez'
                        }
                        className={`flex flex-col items-center justify-center rounded-lg border px-2 py-2 min-w-[42px] min-h-[54px] transition-all ${
                          spacesAfter[idx]
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 neon-box-cyan'
                            : 'bg-slate-950/90 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                        } disabled:opacity-80`}
                      >
                        {spacesAfter[idx] ? (
                          <>
                            <Space className="w-4 h-4 text-cyan-300" />
                            <span className="text-[9px] font-mono-tech font-bold mt-0.5 text-cyan-300">
                              SZÓKÖZ
                            </span>
                          </>
                        ) : (
                          <>
                            <Link2 className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-mono-tech mt-0.5">EGYBE</span>
                          </>
                        )}
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {selectedTileIndex !== null && !finaleState.latinPhraseRevealed && (
              <div className="mt-2.5 text-center text-[11px] font-mono-tech text-cyan-300">
                Kijelölve: <strong>{tiles[selectedTileIndex].text}</strong> — érintsd meg azt a
                kártyát, amellyel fel szeretnéd cserélni!
              </div>
            )}
          </div>

          <div className="bg-[#040816] border border-amber-500/35 rounded-xl p-3 mb-3 text-center">
            <div className="text-[10px] font-mono-tech uppercase tracking-widest text-slate-400 mb-1">
              Összeállított karaktersor:
            </div>
            <div className="font-display font-bold text-base sm:text-xl tracking-widest text-amber-300 break-words">
              {assembledSentence}
            </div>
          </div>

          {!finaleState.latinPhraseRevealed ? (
            <button
              onClick={handleVerifyLatin}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
            >
              Összeállított mondat ellenőrzése
            </button>
          ) : (
            <div className="text-xs text-emerald-400 font-mono-tech">
              ✓ Helyes latin mondat összeállítva!
            </div>
          )}

          {latinErrorMsg && (
            <div className="flex items-start gap-1.5 text-xs text-rose-400 mt-2.5 bg-rose-950/40 border border-rose-500/30 rounded-lg p-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{latinErrorMsg}</span>
            </div>
          )}
        </div>

        {/* Step 2: Independent Hungarian Meaning Interpretation -> Auto-completes & launches celebratory finale */}
        {finaleState.latinPhraseRevealed && (
          <div className="p-4 sm:p-5 rounded-xl border cyber-panel border-cyan-500/35 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-900 border border-amber-400 text-amber-300 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h3 className="font-display font-bold text-sm text-slate-100">
                  2. Lépés: A latin üzenet értelmezése
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-2">
              Mit jelent a megfejtett <strong>NON RECUSO LABOREM</strong> latin mondat?
              Értelmezzétek és írjátok le magyarul a saját szavaitokkal a küldetés befejezéséhez!
            </p>

            {/* Optional root-word dictionary (never prints full Hungarian sentence) */}
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setShowVocabHelp(!showVocabHelp)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline"
              >
                <HelpCircle className="w-3 h-3" />
                {showVocabHelp
                  ? 'Szótövek súgójának elrejtése'
                  : 'Szótári szótövek megtekintése (opcionális)'}
              </button>

              {showVocabHelp && (
                <div className="mt-2 p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono-tech text-slate-300 space-y-1">
                  <div>
                    • <strong>NON:</strong> tagadószó
                  </div>
                  <div>
                    • <strong>RECUSO:</strong> visszautasítani, vonakodni (1. személy)
                  </div>
                  <div>
                    • <strong>LABOREM:</strong> munka, feladat (tárgyeset)
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <textarea
                rows={2}
                placeholder="Írjátok le magyarul a latin jelmondat jelentését..."
                value={translationInput}
                onChange={(e) => {
                  setTranslationInput(e.target.value);
                  setTranslationError(false);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-amber-400 outline-none"
              />
              <button
                onClick={handleVerifyTranslation}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
              >
                Jelentés ellenőrzése & Finálé indítása
              </button>
            </div>

            {translationError && (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-rose-400 bg-rose-950/35 border border-rose-500/30 rounded-lg p-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  A megfogalmazás még nem pontos. Gondoljátok át mindhárom szó (<em>non</em>,{' '}
                  <em>recuso</em>, <em>laborem</em>) összefüggő jelentését!
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
