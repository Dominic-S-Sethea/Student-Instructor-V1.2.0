import React, { useRef } from 'react';
import { X, Award, CheckCircle2, Pin, Sparkles, ExternalLink } from 'lucide-react';
import { ClientStudentAchievement } from '../../types';
import { useAccessibleDialog } from '../../hooks/useModalAccessibility';

interface AchievementDetailModalProps {
  achievement: ClientStudentAchievement | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleWall: (achievementId: string, display: boolean, slotIndex?: number) => void;
}

export const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
  achievement,
  isOpen,
  onClose,
  onToggleWall,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useAccessibleDialog(isOpen && Boolean(achievement), onClose, dialogRef);

  if (!isOpen || !achievement) return null;

  const ach = achievement.achievement;
  const isPinned = achievement.is_displayed_on_wall === 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-detail-modal-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col focus:outline-hidden"
      >
        {/* Top Banner with Achievement Theme */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 p-6 text-white relative flex flex-col items-center text-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close achievement details"
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-4xl shadow-xl mb-3">
            {ach.badge_icon || '🏅'}
          </div>

          <span className="text-[11px] font-bold tracking-wider uppercase bg-black/20 px-3 py-1 rounded-full text-amber-100">
            {ach.category}
          </span>
          <h3 id="achievement-detail-modal-title" className="text-xl font-bold mt-2">{ach.title}</h3>
          {ach.title_km && (
            <p className="text-sm font-serif text-amber-100 mt-0.5">{ach.title_km}</p>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-center">
            {ach.description}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
              <span className="text-[11px] text-amber-700 font-semibold block">Academic Merit Points</span>
              <span className="text-lg font-bold text-amber-900">+{ach.merit_points} Pts</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <span className="text-[11px] text-emerald-700 font-semibold block">Verification Status</span>
              <span className="text-xs font-bold text-emerald-900 flex items-center justify-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> MoEYS Verified
              </span>
            </div>
          </div>

          {/* Wall Status */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Pin className={`w-4 h-4 ${isPinned ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="font-semibold text-slate-700">
                {isPinned
                  ? `Mounted on Personal Room Wall (Slot ${achievement.wall_slot_index || 1})`
                  : 'Currently stored in Academic Vault'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Close
          </button>

          <div className="flex space-x-2">
            {isPinned ? (
              <button
                onClick={() => {
                  onToggleWall(ach.id, false);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors"
              >
                Unpin from Wall
              </button>
            ) : (
              <button
                onClick={() => {
                  onToggleWall(ach.id, true, 1);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition-colors flex items-center space-x-1.5"
              >
                <Pin className="w-3.5 h-3.5" />
                <span>Pin to Achievement Wall</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
