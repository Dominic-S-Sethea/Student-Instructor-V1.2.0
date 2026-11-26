import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Home,
  DoorOpen,
  Shirt,
  Palette,
  Package,
  Award,
  AlertCircle,
  BookOpen,
  FlaskConical,
  Zap,
  Compass,
  Brain,
  CheckCircle2,
  X,
  Globe,
} from 'lucide-react';
import {
  ClientWorldState,
  ClientAvatarProfile,
  ClientVirtualRoom,
  ClientRoomObject,
  ClientAvatarItem,
  ClientStudentAchievement,
  TabView,
} from '../../types';
import { avatarWorldClient } from '../../services/avatarWorldClient';
import { VirtualRoomView } from './VirtualRoomView';
import { HallwayView } from './HallwayView';
import { DigitalCampusWorldHub } from './DigitalCampusWorldHub';
import { AvatarCustomizerModal } from './AvatarCustomizerModal';
import { RoomCustomizerModal } from './RoomCustomizerModal';
import { InventoryModal } from './InventoryModal';
import { ItemDetailModal } from './ItemDetailModal';
import { AchievementDetailModal } from './AchievementDetailModal';
import { DigitalLibraryView } from '../learning/DigitalLibraryView';
import { VirtualLabView } from '../learning/VirtualLabView';
import { STEMActivitiesView } from '../learning/STEMActivitiesView';
import { LearningPathsView } from '../learning/LearningPathsView';
import { AIEducationProfileModal } from '../learning/AIEducationProfileModal';

interface AvatarWorldViewProps {
  studentId?: string;
  onNavigateTab?: (tab: TabView) => void;
}

export const AvatarWorldView: React.FC<AvatarWorldViewProps> = ({
  studentId = 'usr-student-01',
  onNavigateTab,
}) => {
  const [worldState, setWorldState] = useState<ClientWorldState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sub-navigation: 'campus-world' | 'room' | 'hallway' | 'library' | 'laboratory' | 'stem-activities' | 'learning-paths'
  const [activeArea, setActiveArea] = useState<
    'campus-world' | 'room' | 'hallway' | 'library' | 'laboratory' | 'stem-activities' | 'learning-paths'
  >('campus-world');

  // Lab experiment launch parameter
  const [activeExperimentId, setActiveExperimentId] = useState<string>('exp-chem-01');

  // Modals state
  const [isAvatarStudioOpen, setIsAvatarStudioOpen] = useState(false);
  const [isRoomCustomizerOpen, setIsRoomCustomizerOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isAIEducationProfileOpen, setIsAIEducationProfileOpen] = useState(false);

  // Inspector modals
  const [inspectedItem, setInspectedItem] = useState<ClientAvatarItem | null>(null);
  const [inspectedObject, setInspectedObject] = useState<ClientRoomObject | null>(null);
  const [inspectedAchievement, setInspectedAchievement] =
    useState<ClientStudentAchievement | null>(null);

  // Real-time reward toast
  const [rewardToast, setRewardToast] = useState<{
    points: number;
    message: string;
    badge?: string;
    item?: string;
  } | null>(null);

  // Time tracking ref
  const enterTimeRef = useRef<number>(Date.now());

  // Load world state
  const loadWorld = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await avatarWorldClient.getWorldState(studentId);
      setWorldState(data);
    } catch (err: any) {
      console.error('Failed to load Avatar World:', err);
      setError(err?.message || 'Could not load your digital study room.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorld();
    avatarWorldClient.trackRoomEntry(studentId);

    const interval = setInterval(() => {
      const elapsedSeconds = Math.round((Date.now() - enterTimeRef.current) / 1000);
      avatarWorldClient.trackTimeSpent(studentId, elapsedSeconds, activeArea);
    }, 60000);

    return () => {
      clearInterval(interval);
      const totalSeconds = Math.round((Date.now() - enterTimeRef.current) / 1000);
      if (totalSeconds > 5) {
        avatarWorldClient.trackTimeSpent(studentId, totalSeconds, activeArea);
      }
    };
  }, [studentId, activeArea]);

  // Avatar Profile Update
  const handleSaveAvatar = async (updated: Partial<ClientAvatarProfile>) => {
    if (!worldState) return;
    const saved = await avatarWorldClient.saveAvatarProfile(studentId, updated);
    setWorldState({
      ...worldState,
      avatarProfile: saved,
    });
  };

  // Room Customization Update
  const handleCustomizeRoom = async (roomData: Partial<ClientVirtualRoom>) => {
    if (!worldState) return;
    const updated = await avatarWorldClient.customizeRoom(studentId, roomData);
    setWorldState({
      ...worldState,
      room: {
        ...worldState.room,
        ...updated,
      },
    });
  };

  // Place Item
  const handlePlaceItem = async (item: ClientAvatarItem) => {
    if (!worldState) return;

    // Default layer based on slot
    const layer = item.default_slot;
    let posX = 45;
    let posY = 50;

    if (layer === 'wall') {
      posX = 20 + Math.random() * 60;
      posY = 30;
    } else if (layer === 'floor') {
      posX = 25 + Math.random() * 50;
      posY = 70;
    } else if (layer === 'desk') {
      posX = 35 + Math.random() * 30;
      posY = 50;
    }

    const placed = await avatarWorldClient.placeObject(studentId, {
      item_id: item.id,
      layer,
      position_x: Math.round(posX),
      position_y: Math.round(posY),
    });

    setWorldState({
      ...worldState,
      room: {
        ...worldState.room,
        objects: [...worldState.room.objects, { ...placed, item }],
      },
    });
  };

  // Remove Item
  const handleRemoveObject = async (objectId: string) => {
    if (!worldState) return;
    await avatarWorldClient.removeObject(studentId, objectId);
    setWorldState({
      ...worldState,
      room: {
        ...worldState.room,
        objects: worldState.room.objects.filter((o) => o.id !== objectId),
      },
    });
  };

  // Reposition Item
  const handleRepositionObject = async (objectId: string, newX: number, newY: number) => {
    if (!worldState) return;
    await avatarWorldClient.repositionObject(studentId, objectId, newX, newY);
    setWorldState({
      ...worldState,
      room: {
        ...worldState.room,
        objects: worldState.room.objects.map((o) =>
          o.id === objectId ? { ...o, position_x: newX, position_y: newY } : o
        ),
      },
    });
  };

  // Toggle Wall Achievement
  const handleToggleWallAchievement = async (
    achievementId: string,
    display: boolean,
    slotIndex?: number
  ) => {
    if (!worldState) return;
    await avatarWorldClient.toggleWallAchievement(studentId, achievementId, display, slotIndex);

    // Refresh state
    const refreshed = await avatarWorldClient.getWorldState(studentId);
    setWorldState(refreshed);
  };

  // Reward toast handler for learning achievements & experiments
  const handleRewardEarned = (
    points: number,
    message: string,
    badgeName?: string,
    itemName?: string
  ) => {
    setRewardToast({
      points,
      message,
      badge: badgeName,
      item: itemName,
    });

    // Refresh world state so newly acquired room items, merit points, and level update immediately
    loadWorld();

    setTimeout(() => {
      setRewardToast(null);
    }, 7000);
  };

  // Destination Navigation from Hallway
  const handleNavigateDestination = (slug: string) => {
    avatarWorldClient.trackLocationClick(studentId, slug);

    if (slug === 'room') {
      setActiveArea('room');
      return;
    }
    if (slug === 'library' || slug === 'digital-library') {
      setActiveArea('library');
      return;
    }
    if (slug === 'laboratory' || slug === 'virtual-lab') {
      setActiveArea('laboratory');
      return;
    }
    if (slug === 'stem_activities' || slug === 'stem-activities') {
      setActiveArea('stem-activities');
      return;
    }
    if (slug === 'learning_paths' || slug === 'learning-paths') {
      setActiveArea('learning-paths');
      return;
    }

    // Direct tab bridges
    if (onNavigateTab) {
      if (slug === 'career_center') onNavigateTab('decision-engine');
      else if (slug === 'community') onNavigateTab('community');
      else if (slug === 'scholarships') onNavigateTab('scholarships');
    }
  };

  // Inspect item trigger
  const handleInspectItem = (item: ClientAvatarItem) => {
    avatarWorldClient.trackItemView(studentId, item.id);
    const placedObj = worldState?.room.objects.find((o) => o.item_id === item.id) || null;
    setInspectedItem(item);
    setInspectedObject(placedObj);
  };

  // Inspect room object trigger
  const handleInspectObject = (obj: ClientRoomObject) => {
    avatarWorldClient.trackItemView(studentId, obj.item.id);
    setInspectedItem(obj.item);
    setInspectedObject(obj);
  };

  if (loading) {
    return (
      <div className="w-full min-h-[500px] flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">
          Entering Digital Education World... កំពុងផ្ទុកបន្ទប់សិក្សា
        </p>
      </div>
    );
  }

  if (error || !worldState || !worldState.room || !Array.isArray(worldState.room.objects)) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        <div className="max-w-md">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Virtual Study Room Requires Live Server Session
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {error || 'Sign in against the live study backend to enter your personalized 2D study room and achievements wall.'}
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <button
            type="button"
            onClick={loadWorld}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
            >
              Return Home
            </button>
          )}
        </div>
      </div>
    );
  }

  const placedItemIds = worldState.room.objects.map((o) => o.item_id);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 animate-in fade-in">
      {/* Real-time Reward Celebratory Banner */}
      {rewardToast && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-2xl shadow-lg border border-emerald-400/40 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold">{rewardToast.message}</span>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  +{rewardToast.points} Merit Points
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                {rewardToast.badge && (
                  <span>
                    Unlocked Badge: <strong>{rewardToast.badge}</strong>
                  </span>
                )}
                {rewardToast.item && (
                  <span>
                    {' '}
                    • Room Object Added: <strong>{rewardToast.item}</strong> (Visit Personal Room to equip!)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            {activeArea !== 'room' && (
              <button
                onClick={() => setActiveArea('room')}
                className="px-3 py-1 bg-white text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors"
              >
                Go to Room
              </button>
            )}
            <button
              onClick={() => setRewardToast(null)}
              className="p-1 rounded-lg text-emerald-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sub-navigation Switcher between Digital Education World Wings */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'campus-world', label: 'Digital Campus World', icon: Globe, color: 'indigo' },
            { id: 'room', label: 'Study Sanctuary', icon: Home, color: 'blue' },
            { id: 'hallway', label: 'Hallway', icon: DoorOpen, color: 'slate' },
            { id: 'library', label: 'Digital Library', icon: BookOpen, color: 'emerald' },
            { id: 'laboratory', label: 'Virtual Lab', icon: FlaskConical, color: 'purple' },
            { id: 'stem-activities', label: 'STEM Activities', icon: Zap, color: 'blue' },
            { id: 'learning-paths', label: 'Roadmaps', icon: Compass, color: 'indigo' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeArea === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveArea(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action Bar: AI Profile Button & Merit Points */}
        <div className="flex items-center justify-between sm:justify-end space-x-3 text-xs shrink-0">
          <button
            onClick={() => setIsAIEducationProfileOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 font-bold transition-all shadow-xs"
          >
            <Brain className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Learning Profile</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 hidden sm:inline">
              Level <strong className="text-slate-900 font-bold">{worldState.avatarProfile.level}</strong>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>{worldState.avatarProfile.merit_points} Pts</span>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Area Render */}
      {activeArea === 'campus-world' && (
        <DigitalCampusWorldHub
          studentId={studentId}
          onNavigateTab={onNavigateTab as any}
        />
      )}

      {activeArea === 'room' && (
        <VirtualRoomView
          room={worldState.room}
          profile={worldState.avatarProfile}
          achievements={worldState.achievements}
          gritPersistence={worldState.intelligenceSnippet.gritPersistence}
          onOpenAvatarStudio={() => setIsAvatarStudioOpen(true)}
          onOpenRoomCustomizer={() => setIsRoomCustomizerOpen(true)}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenHallway={() => setActiveArea('hallway')}
          onSelectObject={handleInspectObject}
          onSelectAchievement={(ach) => setInspectedAchievement(ach)}
          onToggleWallAchievement={handleToggleWallAchievement}
        />
      )}

      {activeArea === 'hallway' && (
        <HallwayView
          locations={worldState.locations}
          onReturnToRoom={() => setActiveArea('room')}
          onNavigateDestination={handleNavigateDestination}
        />
      )}

      {activeArea === 'library' && (
        <DigitalLibraryView
          studentId={studentId}
          onOpenLabExperiment={(expId) => {
            setActiveExperimentId(expId);
            setActiveArea('laboratory');
          }}
          onRewardEarned={handleRewardEarned}
        />
      )}

      {activeArea === 'laboratory' && (
        <VirtualLabView
          studentId={studentId}
          initialExperimentId={activeExperimentId}
          onRewardEarned={handleRewardEarned}
          onNavigateToRoom={() => setActiveArea('room')}
        />
      )}

      {activeArea === 'stem-activities' && (
        <STEMActivitiesView
          studentId={studentId}
          onRewardEarned={handleRewardEarned}
          onNavigateToRoom={() => setActiveArea('room')}
        />
      )}

      {activeArea === 'learning-paths' && (
        <LearningPathsView
          studentId={studentId}
          onOpenExperiment={(expId) => {
            setActiveExperimentId(expId);
            setActiveArea('laboratory');
          }}
          onOpenContent={() => setActiveArea('library')}
          onRewardEarned={handleRewardEarned}
        />
      )}

      {/* MODAL 1: Avatar Customization Studio */}
      <AvatarCustomizerModal
        initialProfile={worldState.avatarProfile}
        isOpen={isAvatarStudioOpen}
        onClose={() => setIsAvatarStudioOpen(false)}
        onSave={handleSaveAvatar}
      />

      {/* MODAL 2: Room Architectural Customizer */}
      <RoomCustomizerModal
        room={worldState.room}
        isOpen={isRoomCustomizerOpen}
        onClose={() => setIsRoomCustomizerOpen(false)}
        onSave={handleCustomizeRoom}
      />

      {/* MODAL 3: Inventory & Backpack */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={worldState.inventory}
        availableItems={worldState.availableItems}
        placedItemIds={placedItemIds}
        onPlaceItem={handlePlaceItem}
        onInspectItem={handleInspectItem}
      />

      {/* MODAL 4: Item Detail & Inspection */}
      <ItemDetailModal
        item={inspectedItem}
        placedObject={inspectedObject}
        isOpen={!!inspectedItem}
        onClose={() => {
          setInspectedItem(null);
          setInspectedObject(null);
        }}
        onPlace={handlePlaceItem}
        onRemove={handleRemoveObject}
        onReposition={handleRepositionObject}
      />

      {/* MODAL 5: Achievement Detail & Wall Mount */}
      <AchievementDetailModal
        achievement={inspectedAchievement}
        isOpen={!!inspectedAchievement}
        onClose={() => setInspectedAchievement(null)}
        onToggleWall={handleToggleWallAchievement}
      />

      {/* MODAL 6: AI Cognitive Education Profile Modal */}
      <AIEducationProfileModal
        studentId={studentId}
        isOpen={isAIEducationProfileOpen}
        onClose={() => setIsAIEducationProfileOpen(false)}
        onSelectRecommendedAction={(actionId, actionType) => {
          setIsAIEducationProfileOpen(false);
          if (actionType === 'experiment') {
            setActiveExperimentId(actionId);
            setActiveArea('laboratory');
          } else if (actionType === 'activity') {
            setActiveArea('stem-activities');
          } else {
            setActiveArea('library');
          }
        }}
      />
    </div>
  );
};
