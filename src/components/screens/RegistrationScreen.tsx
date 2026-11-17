import React, { useState } from 'react';
import { TeamData, PlayerInfo } from '../../types';
import { soundManager } from '../../utils/audio';
import { Users, User, ChevronRight, HelpCircle, AlertCircle, Shield } from 'lucide-react';

interface RegistrationScreenProps {
  initialTeam: TeamData;
  onSubmit: (team: TeamData) => void;
  onOpenTutorial: () => void;
}

const GRADE_LEVELS = ['9.', '10.', '11.', '12.'] as const;
const CLASS_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

function parsePlayerGrade(p?: PlayerInfo): { level: string; letter: string } {
  if (!p) return { level: '', letter: '' };
  if (p.gradeLevel && p.classLetter) {
    return { level: p.gradeLevel, letter: p.classLetter };
  }
  if (p.grade) {
    const match = p.grade.match(/^(9|10|11|12)\.?([A-F])$/i);
    if (match) {
      return { level: `${match[1]}.`, letter: match[2].toUpperCase() };
    }
  }
  return { level: '', letter: '' };
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  initialTeam,
  onSubmit,
  onOpenTutorial,
}) => {
  const initP1 = parsePlayerGrade(initialTeam.players[0]);
  const initP2 = parsePlayerGrade(initialTeam.players[1]);
  const initP3 = parsePlayerGrade(initialTeam.players[2]);

  const [teamName, setTeamName] = useState(initialTeam.teamName || '');

  const [p1Name, setP1Name] = useState(initialTeam.players[0]?.name || '');
  const [p1Level, setP1Level] = useState(initP1.level);
  const [p1Letter, setP1Letter] = useState(initP1.letter);

  const [p2Name, setP2Name] = useState(initialTeam.players[1]?.name || '');
  const [p2Level, setP2Level] = useState(initP2.level);
  const [p2Letter, setP2Letter] = useState(initP2.letter);

  const [p3Name, setP3Name] = useState(initialTeam.players[2]?.name || '');
  const [p3Level, setP3Level] = useState(initP3.level);
  const [p3Letter, setP3Letter] = useState(initP3.letter);

  const [hasThirdPlayer, setHasThirdPlayer] = useState(Boolean(initialTeam.players[2]?.name));
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();

    if (!teamName.trim()) {
      setError('Kérlek, adj meg egy csapatnevet!');
      return;
    }
    if (!p1Name.trim() || !p1Level || !p1Letter) {
      setError('Az 1. játékos nevét, évfolyamát és osztályának betűjelét kötelező megadni!');
      return;
    }
    if (!p2Name.trim() || !p2Level || !p2Letter) {
      setError('A 2. játékos nevét, évfolyamát és osztályának betűjelét kötelező megadni!');
      return;
    }

    if (hasThirdPlayer && p3Name.trim() && (!p3Level || !p3Letter)) {
      setError('A 3. játékosnál is válaszd ki az évfolyamot és az osztály betűjelét (vagy távolítsd el a 3. tagot)!');
      return;
    }

    const players: PlayerInfo[] = [
      {
        name: p1Name.trim(),
        grade: `${p1Level}${p1Letter}`,
        gradeLevel: p1Level,
        classLetter: p1Letter,
      },
      {
        name: p2Name.trim(),
        grade: `${p2Level}${p2Letter}`,
        gradeLevel: p2Level,
        classLetter: p2Letter,
      },
    ];

    if (hasThirdPlayer && p3Name.trim()) {
      players.push({
        name: p3Name.trim(),
        grade: `${p3Level}${p3Letter}`,
        gradeLevel: p3Level,
        classLetter: p3Letter,
      });
    }

    setError('');
    onSubmit({ teamName: teamName.trim(), players });
  };

  return (
    <div className="max-w-3xl mx-auto py-4 px-4">
      
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#09142f] border border-cyan-400/40 text-cyan-300 text-xs font-mono-tech uppercase tracking-widest mb-3 neon-box-cyan">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Holografikus Személyazonosító Konzol</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-display font-black text-white neon-glow-cyan mb-2">
          KUTATÓCSAPAT REGISZTRÁCIÓ
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="cyber-panel rounded-3xl p-5 sm:p-8 neon-box-cyan space-y-5"
      >
        
        {/* Team Name */}
        <div className="p-4 rounded-2xl bg-[#050a18]/90 border border-cyan-500/30">
          <label className="flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider text-cyan-300 mb-2 font-bold">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Csapat kódneve *</span>
          </label>
          <input
            type="text"
            required
            placeholder="Pl. Kvantum Kobaltok, Foton Farkasok..."
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full bg-[#091126] border border-cyan-500/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-300 outline-none transition-colors font-mono-tech"
          />
        </div>

        {/* Player 1 */}
        <div className="p-4 rounded-2xl bg-[#060c1d]/90 border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-tech text-cyan-300">
            <span className="flex items-center gap-2 font-bold">
              <User className="w-4 h-4 text-cyan-400" />
              1. Játékos (Csapatkapitány) *
            </span>
            <span className="text-[11px] text-amber-300/90">Kötelező</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-[10px] font-mono-tech uppercase text-slate-400 mb-1">
                Teljes név
              </label>
              <input
                type="text"
                required
                placeholder="Játékos neve"
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                className="w-full bg-[#091126] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[10px] font-mono-tech uppercase text-slate-400 mb-1">
                Évfolyam
              </label>
              <select
                required
                value={p1Level}
                onChange={(e) => setP1Level(e.target.value)}
                className="w-full bg-[#091126] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-cyan-200 focus:border-cyan-400 outline-none font-mono-tech"
              >
                <option value="">Válassz...</option>
                {GRADE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl} évfolyam</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[10px] font-mono-tech uppercase text-slate-400 mb-1">
                Osztály betűjele
              </label>
              <select
                required
                value={p1Letter}
                onChange={(e) => setP1Letter(e.target.value)}
                className="w-full bg-[#091126] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-amber-200 focus:border-cyan-400 outline-none font-mono-tech"
              >
                <option value="">Betűjel...</option>
                {CLASS_LETTERS.map((lettr) => (
                  <option key={lettr} value={lettr}>{lettr} osztály</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Player 2 */}
        <div className="p-4 rounded-2xl bg-[#060c1d]/90 border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-tech text-cyan-300">
            <span className="flex items-center gap-2 font-bold">
              <User className="w-4 h-4 text-purple-400" />
              2. Játékos *
            </span>
            <span className="text-[11px] text-amber-300/90">Kötelező</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-[10px] font-mono-tech uppercase text-slate-400 mb-1">
                Teljes név
              </label>
              <input
                type="text"
                required
                placeholder="Játékos neve"
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                className="w-full bg-[#091126] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[10px] font-mono-tech uppercase text-slate-400 mb-1">
                Évfolyam
              </label>
              <select
                required
                value={p2Level}
                onChange={(e) => setP2Level(e.target.value)}
                className="w-full bg-[#091126] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-cyan-200 focus:border-cyan-400 outline-none font-mono-tech"
              >
                <option value="">Válassz...</option>
                {GRADE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl} évfolyam</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[10px] font-mono-tech uppercase text-slate-400 mb-1">
                Osztály betűjele
              </label>
              <select
                required
                value={p2Letter}
                onChange={(e) => setP2Letter(e.target.value)}
                className="w-full bg-[#091126] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-amber-200 focus:border-cyan-400 outline-none font-mono-tech"
              >
                <option value="">Betűjel...</option>
                {CLASS_LETTERS.map((lettr) => (
                  <option key={lettr} value={lettr}>{lettr} osztály</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Player 3 (Optional) */}
        {hasThirdPlayer ? (
          <div className="p-4 rounded-2xl bg-[#060c1d]/90 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-tech text-amber-300">
              <span className="flex items-center gap-2 font-bold">
                <User className="w-4 h-4 text-amber-400" />
                3. Játékos (Opcionális)
              </span>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setHasThirdPlayer(false);
                  setP3Name('');
                  setP3Level('');
                  setP3Letter('');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 underline"
              >
                Eltávolítás
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-[10px] font-mono-tech uppercase text-slate-400 mb-1">
                  Teljes név
                </label>
                <input
                  type="text"
                  placeholder="Játékos neve"
                  value={p3Name}
                  onChange={(e) => setP3Name(e.target.value)}
                  className="w-full bg-[#091126] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-mono-tech uppercase text-slate-400 mb-1">
                  Évfolyam
                </label>
                <select
                  value={p3Level}
                  onChange={(e) => setP3Level(e.target.value)}
                  className="w-full bg-[#091126] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-cyan-200 focus:border-amber-400 outline-none font-mono-tech"
                >
                  <option value="">Válassz...</option>
                  {GRADE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl} évfolyam</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-mono-tech uppercase text-slate-400 mb-1">
                  Osztály betűjele
                </label>
                <select
                  value={p3Letter}
                  onChange={(e) => setP3Letter(e.target.value)}
                  className="w-full bg-[#091126] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-amber-200 focus:border-amber-400 outline-none font-mono-tech"
                >
                  <option value="">Betűjel...</option>
                  {CLASS_LETTERS.map((lettr) => (
                    <option key={lettr} value={lettr}>{lettr} osztály</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setHasThirdPlayer(true);
            }}
            className="w-full py-3 rounded-2xl border border-dashed border-cyan-500/40 hover:border-cyan-400 bg-[#050a18]/50 text-xs text-cyan-300 hover:text-cyan-200 font-mono-tech transition-colors"
          >
            + 3. csapattag hozzáadása (opcionális)
          </button>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Tutorial & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenTutorial();
            }}
            className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 font-mono-tech underline"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Irányítási és játék útmutató</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Belépés az Állomásra</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
};
