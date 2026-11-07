import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  Shirt,
  Palette,
  Package,
  DoorOpen,
  Info,
  Maximize2,
  Compass,
} from 'lucide-react';
import {
  ClientVirtualRoom,
  ClientAvatarProfile,
  ClientRoomObject,
  ClientStudentAchievement,
  ClientAvatarItem,
} from '../../types';
import { AvatarRenderer } from './AvatarRenderer';
import { RoomObjectRenderer } from './RoomObjectRenderer';
import { AchievementWallComponent } from './AchievementWallComponent';

interface VirtualRoomViewProps {
  room: ClientVirtualRoom;
  profile: ClientAvatarProfile;
  achievements: ClientStudentAchievement[];
  gritPersistence: number;
  onOpenAvatarStudio: () => void;
  onOpenRoomCustomizer: () => void;
  onOpenInventory: () => void;
  onOpenHallway: () => void;
  onSelectObject: (object: ClientRoomObject) => void;
  onSelectAchievement: (achievement: ClientStudentAchievement) => void;
  onToggleWallAchievement: (achievementId: string, display: boolean, slotIndex?: number) => void;
}

export const VirtualRoomView: React.FC<VirtualRoomViewProps> = ({
  room,
  profile,
  achievements,
  gritPersistence,
  onOpenAvatarStudio,
  onOpenRoomCustomizer,
  onOpenInventory,
  onOpenHallway,
  onSelectObject,
  onSelectAchievement,
  onToggleWallAchievement,
}) => {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Background visual themes
  const themeStyles = {
    daylight_study: {
      sky: 'from-sky-300 via-sky-100 to-amber-50/40',
      wall: room.wall_color || '#F8FAFC',
      windowGlow: 'bg-amber-100/40',
      sunColor: 'bg-amber-400',
    },
    sunset_warm: {
      sky: 'from-amber-400 via-orange-300 to-rose-400',
      wall: room.wall_color || '#FFFBEB',
      windowGlow: 'bg-orange-200/50',
      sunColor: 'bg-rose-500',
    },
    cozy_evening: {
      sky: 'from-slate-950 via-indigo-950 to-slate-900',
      wall: room.wall_color || '#0F172A',
      windowGlow: 'bg-indigo-900/40',
      sunColor: 'bg-amber-100 shadow-[0_0_20px_#FDE047]',
    },
    cyber_lab: {
      sky: 'from-cyan-950 via-slate-950 to-indigo-950',
      wall: room.wall_color || '#090D16',
      windowGlow: 'bg-cyan-900/30',
      sunColor: 'bg-cyan-400',
    },
    khmer_heritage: {
      sky: 'from-amber-200 via-stone-100 to-amber-100',
      wall: room.wall_color || '#FEF3C7',
      windowGlow: 'bg-amber-200/40',
      sunColor: 'bg-amber-500',
    },
  }[room.background_theme] || {
    sky: 'from-sky-300 via-sky-100 to-amber-50/40',
    wall: '#F8FAFC',
    windowGlow: 'bg-amber-100/40',
    sunColor: 'bg-amber-400',
  };

  // Floor styles
  const floorBg = {
    warm_wood: 'bg-amber-800 border-t-8 border-amber-900',
    stone_tile: 'bg-slate-300 border-t-8 border-slate-400',
    tech_mat: 'bg-slate-900 border-t-8 border-indigo-600',
    bamboo: 'bg-yellow-700 border-t-8 border-yellow-800',
  }[room.floor_style] || 'bg-amber-800 border-t-8 border-amber-900';

  // Group objects by layer
  const wallObjects = room.objects.filter((o) => o.layer === 'wall');
  const floorObjects = room.objects.filter((o) => o.layer === 'floor');
  const deskObjects = room.objects.filter((o) => o.layer === 'desk');

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* 1. ROOM DASHBOARD HEADER BAR */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Room Title & Scholar Meta */}
        <div className="flex items-center space-x-3.5">
          <div
            onClick={onOpenAvatarStudio}
            className="cursor-pointer group relative"
            title="Click to customize avatar"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-300 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-blue-500 transition-colors">
              <AvatarRenderer profile={profile} size="sm" showBadge={false} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 shadow">
              <Shirt className="w-2.5 h-2.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">{room.room_name}</h2>
              <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Personal Sanctuary
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>Scholar: <strong className="text-slate-700">{profile.avatar_name}</strong></span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                {room.study_streak_days}-Day Study Streak
              </span>
            </p>
          </div>
        </div>

        {/* Intelligence Linkage Pills & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Intelligence Score Pill */}
          <div className="bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Grit & Persistence</div>
              <div className="text-xs font-bold text-slate-800">{gritPersistence}% Persistence</div>
            </div>
          </div>

          {/* Merit Points Pill */}
          <div className="bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-600" />
            <div className="text-left">
              <div className="text-[10px] text-amber-700 font-medium uppercase">Learning Merit</div>
              <div className="text-xs font-bold text-amber-900">{profile.merit_points} Pts</div>
            </div>
          </div>

          {/* Action: Customize Room */}
          <button
            onClick={onOpenRoomCustomizer}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-slate-600" />
            <span>Theme & Colors</span>
          </button>

          {/* Action: Backpack Inventory */}
          <button
            onClick={onOpenInventory}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Items & Place</span>
          </button>

          {/* Action: Hallway Bridge */}
          <button
            onClick={onOpenHallway}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors"
          >
            <DoorOpen className="w-4 h-4 text-emerald-700" />
            <span>To Hallway</span>
          </button>
        </div>
      </div>

      {/* 2. THE 2D VIRTUAL ROOM ENVIRONMENT CANVAS */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800/20 bg-slate-900 min-h-[540px] flex flex-col justify-between select-none">
        {/* ROOM WALL (Upper 65%) */}
        <div
          className="relative w-full flex-1 flex flex-col justify-between p-4 sm:p-8 transition-colors duration-500 overflow-hidden"
          style={{ backgroundColor: themeStyles.wall }}
        >
          {/* Wallpaper Subtle Academic Grid Texture */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* WINDOW TO PHNOM PENH SKY / NATURE */}
          <div className="absolute top-4 left-6 sm:left-12 w-28 sm:w-44 h-36 sm:h-48 rounded-t-full border-4 border-amber-900/40 shadow-inner overflow-hidden flex flex-col z-0">
            {/* Sky Background with day/night gradient */}
            <div className={`w-full h-full bg-gradient-to-b ${themeStyles.sky} relative p-2 flex flex-col justify-between`}>
              {/* Sun / Moon */}
              <div className={`w-8 h-8 rounded-full ${themeStyles.sunColor} self-end shadow-md`} />
              {/* Distant Phnom Penh landmark silhouette */}
              <div className="w-full flex items-end justify-around opacity-30 h-10">
                <div className="w-4 h-10 bg-slate-700" />
                <div className="w-6 h-6 bg-slate-700 rounded-t" />
                <div className="w-3 h-8 bg-slate-700" />
                <div className="w-8 h-4 bg-slate-700" />
              </div>
              {/* Window Frame Panes Cross */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-1 bg-amber-950/40" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-full w-1 bg-amber-950/40" />
              </div>
            </div>
          </div>

          {/* ACHIEVEMENT WALL MOUNT (Centerpiece of the Room) */}
          <div className="relative z-10 mx-auto max-w-lg w-full mt-2">
            <AchievementWallComponent
              wallAchievements={room.wallAchievements}
              allAchievements={achievements}
              onSelectAchievement={onSelectAchievement}
              onToggleWallDisplay={onToggleWallAchievement}
            />
          </div>

          {/* WALL OBJECTS (Whiteboard, Astronomical Posters, etc.) */}
          <div className="relative z-10 flex items-center justify-around w-full mt-3">
            {wallObjects.map((obj) => (
              <div
                key={obj.id}
                onClick={() => {
                  setSelectedObjectId(obj.id);
                  onSelectObject(obj);
                }}
                className="transform transition-transform hover:scale-105 cursor-pointer max-w-[150px]"
              >
                <RoomObjectRenderer
                  item={obj.item}
                  isSelected={selectedObjectId === obj.id}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ROOM FLOOR (Lower 35%) */}
        <div className={`relative w-full h-52 sm:h-64 ${floorBg} p-4 flex items-end justify-around overflow-visible z-20`}>
          {/* Wooden Floor Perspective Lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px)] [background-size:60px_100%]" />

          {/* LEFT AREA: Bookshelf / Telescope */}
          <div className="flex items-end space-x-3 mb-2 z-20">
            {floorObjects
              .filter((o) => o.item.icon_key === 'bookshelf' || o.item.icon_key === 'telescope')
              .map((obj) => (
                <div
                  key={obj.id}
                  onClick={() => {
                    setSelectedObjectId(obj.id);
                    onSelectObject(obj);
                  }}
                  className="w-28 sm:w-36 cursor-pointer"
                >
                  <RoomObjectRenderer item={obj.item} isSelected={selectedObjectId === obj.id} />
                </div>
              ))}
          </div>

          {/* CENTER STAGE: STUDY DESK + AVATAR + DESK ITEMS */}
          <div className="relative flex flex-col items-center z-30 mb-2">
            {/* Desk Surface & Items Placed on Desk */}
            <div className="relative w-72 sm:w-96">
              {/* Desk Accessories sitting atop desk surface */}
              <div className="absolute -top-16 sm:-top-20 left-0 right-0 flex items-end justify-around px-4 z-40 pointer-events-auto">
                {deskObjects.map((obj) => (
                  <div
                    key={obj.id}
                    onClick={() => {
                      setSelectedObjectId(obj.id);
                      onSelectObject(obj);
                    }}
                    className="w-16 sm:w-20 cursor-pointer"
                  >
                    <RoomObjectRenderer item={obj.item} isSelected={selectedObjectId === obj.id} />
                  </div>
                ))}
              </div>

              {/* The Desk itself */}
              {room.objects.find((o) => o.item.icon_key === 'desk') ? (
                <div
                  onClick={() => {
                    const desk = room.objects.find((o) => o.item.icon_key === 'desk');
                    if (desk) {
                      setSelectedObjectId(desk.id);
                      onSelectObject(desk);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <RoomObjectRenderer
                    item={
                      room.objects.find((o) => o.item.icon_key === 'desk')!.item
                    }
                    isSelected={
                      selectedObjectId ===
                      room.objects.find((o) => o.item.icon_key === 'desk')?.id
                    }
                  />
                </div>
              ) : null}

              {/* The Student Avatar Standing / Seated next to the desk */}
              <div
                onClick={onOpenAvatarStudio}
                className="absolute -top-24 sm:-top-28 right-4 z-50 cursor-pointer group"
                title="Click to change outfit and appearance"
              >
                <div className="relative transform transition-transform group-hover:scale-105">
                  <AvatarRenderer profile={profile} size="xl" showBadge={true} />
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow">
                    Edit Avatar ✏️
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT AREA: Chair, Plant, Lamp, Other floor objects */}
          <div className="flex items-end space-x-3 mb-2 z-20">
            {floorObjects
              .filter(
                (o) =>
                  o.item.icon_key !== 'bookshelf' &&
                  o.item.icon_key !== 'telescope' &&
                  o.item.icon_key !== 'desk'
              )
              .map((obj) => (
                <div
                  key={obj.id}
                  onClick={() => {
                    setSelectedObjectId(obj.id);
                    onSelectObject(obj);
                  }}
                  className="w-16 sm:w-24 cursor-pointer"
                >
                  <RoomObjectRenderer item={obj.item} isSelected={selectedObjectId === obj.id} />
                </div>
              ))}
          </div>

          {/* Quick HUD Hint in corner */}
          <div className="absolute bottom-2 left-4 text-[10px] text-white/60 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5">
            <Info className="w-3 h-3" />
            <span>Click any piece of furniture or scientific apparatus to inspect its learning purpose</span>
          </div>
        </div>
      </div>
    </div>
  );
};
