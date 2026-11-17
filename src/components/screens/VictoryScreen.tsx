import React, { useEffect, useRef, useState } from 'react';
import { GameState, LabId } from '../../types';
import { GOOGLE_FORM_CONFIG, LAB_METADATA } from '../../config/gameData';
import { soundManager } from '../../utils/audio';
import { FinaleHologram3D } from '../3d/FinaleHologram3D';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Download,
  Send,
  RotateCcw,
  Clock,
  Sparkles,
  HelpCircle,
  CheckCircle,
  Volume2,
  RefreshCw,
} from 'lucide-react';

interface VictoryScreenProps {
  state: GameState;
  onReset: () => void;
}

const LAB_KEYS: LabId[] = ['lab1', 'lab2', 'lab3', 'lab4', 'lab5'];

export const VictoryScreen: React.FC<VictoryScreenProps> = ({ state, onReset }) => {
  const certificateCanvasRef = useRef<HTMLCanvasElement>(null);
  const [favoriteLab, setFavoriteLab] = useState('IV. Laboratórium – A Hógolyógyár');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [replayTrigger, setReplayTrigger] = useState(0);

  const totalHintsUsed =
    LAB_KEYS.reduce((acc, k) => acc + state.labs[k].hintsUnlocked.length, 0) +
    state.finale.hintsUnlocked.length;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins} perc ${secs} mp`;
  };

  const getRating = (score: number) => {
    if (score >= 580) return 'MÁFG Kvantumkémiai Főkutató (Gyémánt fokozat)';
    if (score >= 520) return 'Mester Kémikus & Kódfejtő (Arany fokozat)';
    if (score >= 450) return 'Kiváló Laboratóriumi Kutató (Ezüst fokozat)';
    return 'Állomási Kutatóasszisztens (Bronz fokozat)';
  };

  // Launch celebratory instrumental music (if sound enabled) and festive confetti on screen entry
  useEffect(() => {
    if (state.soundEnabled) {
      soundManager.playCelebrationMusic();
    }

    let intervalId: number | undefined;
    try {
      const duration = 3200;
      const animationEnd = Date.now() + duration;
      intervalId = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          if (intervalId !== undefined) window.clearInterval(intervalId);
          return;
        }
        confetti({
          particleCount: Math.max(12, Math.floor(38 * (timeLeft / duration))),
          startVelocity: 28,
          spread: 360,
          ticks: 65,
          colors: ['#22d3ee', '#facc15', '#fb7185', '#e0f2fe'],
          origin: { x: Math.random(), y: Math.random() * 0.65 },
        });
      }, 420);
    } catch {}

    return () => {
      if (intervalId !== undefined) window.clearInterval(intervalId);
      soundManager.stopCelebrationMusic();
    };
  }, []);

  // Stop celebration music immediately if user mutes audio via HUD
  useEffect(() => {
    if (!state.soundEnabled) {
      soundManager.stopCelebrationMusic();
    }
  }, [state.soundEnabled]);

  // Generate high-resolution downloadable digital certificate on canvas
  const drawCertificate = () => {
    const canvas = certificateCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 850;

    // Deep luxury dark navy background with subtle cyan & gold frame
    const grad = ctx.createLinearGradient(0, 0, 1200, 850);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.5, '#0c1631');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 850);

    // Subtle corner snow/star glints
    ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
    for (let i = 0; i < 36; i++) {
      const sx = ((i * 197) % 1080) + 60;
      const sy = ((i * 131) % 730) + 60;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3) + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gold outer border & cyan inner frame
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, 1140, 790);

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(46, 46, 1108, 758);

    // School Header
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MÁRTON ÁRON FŐGIMNÁZIUM • CSÍKSZEREDA', 600, 108);

    // Title
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('CHRISTMAS CODE 2126', 600, 160);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DIGITÁLIS ELISMERŐ OKLEVÉL', 600, 220);

    // Motto
    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'italic bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('„NON RECUSO LABOREM”', 600, 270);

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(330, 296);
    ctx.lineTo(870, 296);
    ctx.stroke();

    // Body text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Ezennel tanúsítjuk, hogy a(z)', 600, 346);

    // Team name
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 40px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(state.team.teamName || 'Kutatócsapat', 600, 400);

    // Members
    const membersText = state.team.players
      .map((p) => `${p.name} (${p.grade})`)
      .join(' • ');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 23px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(membersText, 600, 450);

    // Achievement text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      'sikeresen teljesítette az öt tudományos laboratórium küldetését, és feloldotta az öt pecsét titkát!',
      600,
      502
    );

    // Stats badge box
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.fillRect(230, 536, 740, 114);
    ctx.strokeRect(230, 536, 740, 114);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Végső Pontszám: ${state.totalScore} / 600 pont`, 600, 578);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `Teljesítési idő: ${formatTime(state.elapsedSeconds)}   |   Segítségek: ${totalHintsUsed} db   |   ${getRating(state.totalScore)}`,
      600,
      620
    );

    // Signatures
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Kémiai Laboratóriumi Zsűri', 350, 732);
    ctx.fillText('Márton Áron Főgimnázium Vezetősége', 850, 732);

    ctx.strokeStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(250, 702);
    ctx.lineTo(450, 702);
    ctx.moveTo(750, 702);
    ctx.lineTo(950, 702);
    ctx.stroke();

    // Date
    ctx.fillStyle = '#64748b';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    const dateStr = new Date().toLocaleDateString('hu-HU');
    ctx.fillText(`Kelt: Csíkszereda, ${dateStr}`, 600, 772);
  };

  useEffect(() => {
    drawCertificate();
  }, [state]);

  const handleDownloadCertificate = () => {
    soundManager.playClick();
    const canvas = certificateCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Oklevel_${(state.team.teamName || 'Csapat').replace(/\s+/g, '_')}_2126.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReplayScene = () => {
    soundManager.playClick();
    setReplayTrigger((n) => n + 1);
    if (state.soundEnabled) {
      soundManager.playCelebrationMusic();
    }
  };

  const handleReplayMusic = () => {
    soundManager.playClick();
    if (state.soundEnabled) {
      soundManager.playCelebrationMusic();
    }
  };

  const handleGoogleFormSubmit = () => {
    soundManager.playClick();
    const membersText = state.team.players
      .map((p) => `${p.name} (${p.grade})`)
      .join(', ');

    const labBreakdown =
      LAB_KEYS.map((k) => `${state.labs[k].title}: ${state.labs[k].score}p`).join('; ') +
      `; Finálé: ${state.finale.score}p`;

    const params = new URLSearchParams();
    params.append(GOOGLE_FORM_CONFIG.entries.teamName, state.team.teamName);
    params.append(GOOGLE_FORM_CONFIG.entries.members, membersText);
    params.append(GOOGLE_FORM_CONFIG.entries.totalScore, `${state.totalScore} / 600`);
    params.append(GOOGLE_FORM_CONFIG.entries.labScores, labBreakdown);
    params.append(GOOGLE_FORM_CONFIG.entries.elapsedTime, formatTime(state.elapsedSeconds));
    params.append(GOOGLE_FORM_CONFIG.entries.hintsCount, `${totalHintsUsed} db`);
    params.append(GOOGLE_FORM_CONFIG.entries.favoriteLab, favoriteLab);

    const fullUrl = `${GOOGLE_FORM_CONFIG.baseUrl}?${params.toString()}`;
    window.open(fullUrl, '_blank');
  };

  const schoolBgUrl = `${import.meta.env.BASE_URL}assets/aistudio/image_99bdef4b.png`;

  return (
    <div className="relative min-h-[calc(100vh-5rem)]">
      {/* Full-screen snowy Márton Áron Főgimnázium background (fixed cover behind entire finale view) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#040816]">
        <div
          key={replayTrigger}
          className="absolute inset-0 finale-school-bg animate-finale-school"
          style={{ backgroundImage: `url(${schoolBgUrl})` }}
        />
        {/* Subtle atmospheric gradient so architecture stays crisp and hologram/text read cleanly */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(4, 8, 22, 0.36) 0%, rgba(4, 8, 22, 0.16) 38%, rgba(4, 8, 22, 0.62) 72%, rgba(4, 8, 22, 0.90) 100%)',
          }}
        />
      </div>

      {/* Foreground interactive celebration content */}
      <div className="relative z-10 max-w-5xl mx-auto py-4 sm:py-6 px-2 sm:px-4 space-y-6">
        {/* 1. Foreground Bishop Márton Áron 3D Hologram + 5 Seals + Christmas Lights & Snowfall directly in front of the snowy school */}
        <div className="space-y-2.5">
          <FinaleHologram3D
            unlockedSealsCount={5}
            phase="celebration"
            transparentBackdrop={true}
            lowGraphics={state.lowGraphicsMode}
            replayTrigger={replayTrigger}
            heightClassName="h-[360px] sm:h-[450px] lg:h-[520px]"
          />

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleReplayScene}
              className="px-3 py-1.5 rounded-lg bg-slate-950/90 border border-cyan-500/45 hover:border-cyan-400 text-xs font-mono-tech text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Átmenet újrajátszása</span>
            </button>

            {state.soundEnabled && (
              <button
                type="button"
                onClick={handleReplayMusic}
                className="px-3 py-1.5 rounded-lg bg-slate-950/90 border border-amber-500/45 hover:border-amber-400 text-xs font-mono-tech text-amber-300 flex items-center gap-1.5 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Ünnepi zene lejátszása</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Required Ceremonial Victory Headline & Motto */}
        <div className="cyber-panel border border-amber-500/45 rounded-3xl p-6 sm:p-8 text-center space-y-3 neon-box-gold">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono-tech uppercase tracking-widest">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Ünnepélyes Befejezés</span>
          </div>

          <h1 className="text-2xl sm:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-cyan-200 drop-shadow-lg">
            KÜLDETÉS TELJESÍTVE!
          </h1>

          <div className="text-lg sm:text-2xl font-display font-bold tracking-widest text-cyan-300 neon-glow-cyan">
            CHRISTMAS CODE 2126
          </div>

          <p className="text-base sm:text-xl text-amber-100 font-medium italic max-w-2xl mx-auto pt-1">
            „A jövő titkának megfejtése a saját iskolátokhoz vezetett.”
          </p>

          {/* Illuminated 5 Seals Holographic Strip */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {LAB_KEYS.map((k) => {
              const meta = LAB_METADATA[k];
              const labState = state.labs[k];
              return (
                <div
                  key={k}
                  className="p-2.5 rounded-xl bg-cyan-950/75 border border-cyan-400/50 neon-box-cyan flex flex-col items-center justify-center gap-1 text-center"
                >
                  <span className="text-xl" aria-hidden="true">
                    {labState.sealIcon}
                  </span>
                  <span className="text-[11px] font-display font-bold text-amber-200 leading-tight">
                    {meta.sealName}
                  </span>
                  <span className="text-[10px] font-mono-tech text-cyan-300 tracking-wider">
                    {meta.fragment}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Team Name, Score & Completion Time Card */}
        <div className="cyber-panel border border-amber-500/40 rounded-3xl p-6 sm:p-8 neon-box-gold space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
              <span className="text-xs font-mono-tech text-amber-400 uppercase tracking-widest">
                Csapat neve
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
                {state.team.teamName}
              </h2>
              <div className="text-xs text-slate-300 mt-1 font-mono-tech">
                Tagok: {state.team.players.map((p) => `${p.name} (${p.grade})`).join(' • ')}
              </div>
            </div>

            <div className="p-4 bg-amber-950/80 border border-amber-500/50 rounded-2xl text-center min-w-[170px]">
              <div className="text-xs text-slate-300 font-mono-tech uppercase">Pontszám</div>
              <div className="text-3xl sm:text-4xl font-display font-black text-amber-300 neon-glow-gold">
                {state.totalScore}
                <span className="text-sm font-normal text-slate-400"> / 600</span>
              </div>
              <div className="text-[11px] text-amber-300/95 font-mono-tech mt-1">
                {getRating(state.totalScore)}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-tech">
            <div className="p-3.5 rounded-xl bg-slate-950/85 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Teljesítési idő
              </span>
              <span className="text-slate-100 font-bold text-sm">
                {formatTime(state.elapsedSeconds)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/85 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Segítségek
              </span>
              <span className="text-slate-100 font-bold text-sm">{totalHintsUsed} db</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/85 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Feloldott Pecsét
              </span>
              <span className="text-amber-300 font-bold text-sm">5 / 5 db</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/85 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Titkos üzenet
              </span>
              <span className="text-emerald-300 font-bold text-sm">Megfejtve</span>
            </div>
          </div>

          {/* Per-lab Score breakdown */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-mono-tech text-slate-300 uppercase tracking-wider block">
              Laboratóriumi pontbontás:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-mono-tech">
              {LAB_KEYS.map((k) => (
                <div
                  key={k}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/90 border border-slate-800"
                >
                  <span className="text-slate-200">{state.labs[k].title}:</span>
                  <span className="text-amber-300 font-bold">{state.labs[k].score} / 100 p</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/90 border border-slate-800">
                <span className="text-slate-200">Nagy Finálé:</span>
                <span className="text-amber-300 font-bold">{state.finale.score} / 100 p</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Digital Certificate Preview & Download */}
        <div className="cyber-panel border border-cyan-500/35 rounded-3xl p-6 sm:p-8 neon-box-cyan flex flex-col items-center text-center space-y-5">
          <div className="p-3 bg-cyan-950/90 rounded-2xl text-cyan-400 border border-cyan-500/40">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white">
              Digitális Oklevél
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
              Elkészült a csapat névre szóló digitális oklevele a pontszámmal, teljesítési idővel és
              a Márton Áron Főgimnázium jelmondatával.
            </p>
          </div>

          <canvas
            ref={certificateCanvasRef}
            className="w-full max-w-2xl h-auto rounded-xl border border-amber-500/40 shadow-2xl"
          />

          <button
            onClick={handleDownloadCertificate}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Oklevél Mentése Képként (PNG)</span>
          </button>
        </div>

        {/* 5. Google Form Submission Section */}
        <div className="cyber-panel border border-emerald-500/35 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-mono-tech text-xs uppercase font-bold">
            <Send className="w-4 h-4" />
            <span>Tanári Eredménygyűjtő Űrlap</span>
          </div>

          <h3 className="text-lg font-display font-bold text-white">
            Eredmény továbbítása a tanárnak
          </h3>

          <p className="text-xs text-slate-300">
            Küldjétek be a csapat eredményét az előre kitöltött Google Űrlap segítségével a tanári
            értékeléshez:
          </p>

          <div>
            <label className="text-xs font-mono-tech text-slate-300 block mb-1.5">
              Melyik küldetés tetszett a legjobban?
            </label>
            <select
              value={favoriteLab}
              onChange={(e) => setFavoriteLab(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400"
            >
              <option value="I. Laboratórium – Színek">
                I. Laboratórium – A Színek Laboratóriuma (Sav-bázis indikátorok)
              </option>
              <option value="II. Laboratórium – Illatmolekulák">
                II. Laboratórium – Az Illatmolekulák Titkos Kamrája (3D aromák)
              </option>
              <option value="III. Laboratórium – Hamis Arany">
                III. Laboratórium – A Hamis Arany Rejtélye (Sűrűségmérés)
              </option>
              <option value="IV. Laboratórium – A Hógolyógyár">
                IV. Laboratórium – A Hógolyógyár (Gáztörvények)
              </option>
              <option value="V. Laboratórium – Molekulák Kódja">
                V. Laboratórium – A Molekulák Titkos Kódja (Izoméria)
              </option>
              <option value="Nagy Finálé – Márton Áron Üzenete">
                A Nagy Finálé – Márton Áron Üzenete
              </option>
            </select>
          </div>

          <button
            onClick={handleGoogleFormSubmit}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Eredmény Elküldése (Google Űrlap Megnyitása)</span>
          </button>
        </div>

        {/* Reset game confirmation */}
        <div className="pt-4 pb-6 flex justify-center">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-slate-300 hover:text-white bg-slate-950/75 px-3.5 py-2 rounded-lg border border-slate-700/70 flex items-center gap-1.5 font-mono-tech transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Új játék kezdése (Új csapat regisztrációja)</span>
            </button>
          ) : (
            <div className="p-4 bg-slate-900 border border-rose-500/40 rounded-xl text-center space-y-3">
              <p className="text-xs text-rose-300">
                Biztosan újra szeretnéd kezdeni a játékot? Ez törli az eddigi mentést.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Mégse
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    soundManager.stopCelebrationMusic();
                    onReset();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  Igen, újrakezdés
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
