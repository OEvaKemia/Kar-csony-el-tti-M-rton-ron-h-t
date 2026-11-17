import React from 'react';
import { soundManager } from '../../utils/audio';
import { X, HelpCircle, RotateCcw, BookOpen, KeyRound, Smartphone, MousePointer } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#040712]/90">
      <div className="relative w-full max-w-2xl cyber-panel border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/40 overflow-hidden neon-box-cyan flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-cyan-300">
                IRÁNYÍTÁSI ÉS JÁTÉK ÚTMUTATÓ
              </h2>
              <p className="text-xs text-slate-400">
                Minden, amit a virtuális kísérletekről tudnod kell
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300">
          
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono-tech">
              <RotateCcw className="w-4 h-4" />
              <span>3D Nézet és Molekula Forgatás</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Minden 3D-s tér forgatható és nagyítható egérrel és érintőképernyővel is:
            </p>
            <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
              <li><strong>Forgatás:</strong> Kattints/érintsd meg és húzd a mutatót.</li>
              <li><strong>Nagyítás / Kicsinyítés:</strong> Görgess az egérgörgővel, vagy csippents két ujjal.</li>
              <li><strong>Alaphelyzet:</strong> A jobb felső gombbal bármikor visszaállíthatod a modellt.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono-tech">
              <BookOpen className="w-4 h-4" />
              <span>Kutatási Napló (0 pont levonás!)</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              A felső sávban található <strong className="text-cyan-300">Napló</strong> gomb megnyitásával bármikor elérheted a képleteket, indikátortáblázatokat, funkciós csoportokat és gáztörvényeket. Ennek használata <strong>teljesen ingyenes</strong>, nem von le pontot!
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-mono-tech">
              <KeyRound className="w-4 h-4" />
              <span>Segítségrendszer (3 szint)</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Ha elakadnátok, kérhettek segítséget a felső sáv <strong className="text-amber-300">Segítség</strong> gombjával:
            </p>
            <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
              <li>1. Szint: Apró nyom (-5 pont)</li>
              <li>2. Szint: Kémiai segítség (-10 pont)</li>
              <li>3. Szint: Részletesebb megoldási segítség (-15 pont)</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono-tech">
              <Smartphone className="w-4 h-4" />
              <span>Mentés és Eszközkompatibilitás</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Az előrehaladásotokat a böngésző automatikusan menti, így egy véletlen oldalfrissítés nem veszíti el a megszerzett pecséteket!
              Gyengébb telefonokon és táblagépeken a villám ikonnal bekapcsolhatjátok az <strong>Alacsony Grafikai Mód</strong>ot.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors"
          >
            Értem, kezdjük a küldetést!
          </button>
        </div>

      </div>
    </div>
  );
};
