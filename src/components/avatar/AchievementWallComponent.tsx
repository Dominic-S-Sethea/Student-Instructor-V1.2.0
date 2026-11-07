import React from 'react';
import { Award, CheckCircle2, Pin, Sparkles, ExternalLink } from 'lucide-react';
import { ClientStudentAchievement } from '../../types';

interface AchievementWallProps {
  wallAchievements: ClientStudentAchievement[];
  allAchievements: ClientStudentAchievement[];
  onSelectAchievement: (achievement: ClientStudentAchievement) => void;
  onToggleWallDisplay: (achievementId: string, display: boolean, slotIndex?: number) => void;
}

export const AchievementWallComponent: React.FC<AchievementWallProps> = ({
  wallAchievements,
  allAchievements,
  onSelectAchievement,
  onToggleWallDisplay,
}) => {
  // Slots 1 through 4
  const slots = [1, 2, 3, 4].map((slotNumber) => {
    const pinned = wallAchievements.find((a) => a.wall_slot_index === slotNumber) || wallAchievements[slotNumber - 1];
    return {
      slotNumber,
      achievement: pinned,
    };
  });

  return (
    <div className="bg-gradient-to-b from-amber-950/80 to-amber-900/90 p-3 sm:p-4 rounded-2xl border-4 border-amber-800/80 shadow-2xl backdrop-blur-md max-w-xl mx-auto select-none">
      {/* Wall Header Ribbon */}
      <div className="flex items-center justify-between border-b border-amber-700/60 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-300">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold tracking-wide text-amber-100 flex items-center gap-1.5">
              <span>National Achievement & Honor Wall</span>
              <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1.5 py-0.2 rounded font-normal">
                ជញ្ជាំងកិត្តិយស
              </span>
            </h4>
            <p className="text-[10px] text-amber-300/80">
              {wallAchievements.length} of 4 honor plaques displayed in personal room
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-[11px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-700/40">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>MoEYS Verified</span>
        </div>
      </div>

      {/* 4 Plaque Wall Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {slots.map(({ slotNumber, achievement }) => (
          <div
            key={slotNumber}
            onClick={() => achievement && onSelectAchievement(achievement)}
            className={`relative rounded-xl p-2.5 flex flex-col items-center justify-between text-center transition-all cursor-pointer min-h-[110px] ${
              achievement
                ? 'bg-gradient-to-b from-amber-900/50 to-amber-950/80 border-2 border-amber-600/70 hover:border-amber-400 shadow-md hover:scale-[1.03]'
                : 'bg-black/30 border-2 border-dashed border-amber-800/50 hover:border-amber-600/60'
            }`}
          >
            {/* Hanging cord pin icon */}
            <div className="w-2 h-2 rounded-full bg-amber-400/90 shadow mb-1" />

            {achievement ? (
              <>
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shadow-inner my-1">
                  {achievement.achievement.badge_icon || '🏅'}
                </div>

                <div className="w-full">
                  <div className="text-[11px] font-bold text-amber-100 line-clamp-1">
                    {achievement.achievement.title}
                  </div>
                  {achievement.achievement.title_km && (
                    <div className="text-[9px] text-amber-300/80 font-serif line-clamp-1">
                      {achievement.achievement.title_km}
                    </div>
                  )}
                  <div className="text-[9px] text-amber-400/90 font-medium mt-0.5">
                    +{achievement.achievement.merit_points} Merit Pts
                  </div>
                </div>

                <div className="absolute top-1.5 right-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-2 text-amber-400/50">
                <Pin className="w-4 h-4 mb-1" />
                <span className="text-[10px] font-medium">Slot {slotNumber}</span>
                <span className="text-[8px] text-amber-500/40">Empty Mount</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
