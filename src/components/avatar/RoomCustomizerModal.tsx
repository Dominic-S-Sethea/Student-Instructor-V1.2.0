import React, { useRef, useState } from 'react';
import { X, Home, Palette, Check, Sparkles, Layout } from 'lucide-react';
import { ClientVirtualRoom } from '../../types';
import { useAccessibleDialog } from '../../hooks/useModalAccessibility';

interface RoomCustomizerModalProps {
  room: ClientVirtualRoom;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ClientVirtualRoom>) => Promise<void>;
}

const THEMES = [
  {
    id: 'daylight_study',
    name: 'Daylight Study Oasis',
    name_km: 'ពន្លឺថ្ងៃព្រលឹម',
    desc: 'Crisp morning sunshine pouring through expansive windows over Phnom Penh skyline.',
    skyColor: 'from-sky-100 via-blue-50 to-amber-50/30',
  },
  {
    id: 'sunset_warm',
    name: 'Golden Sunset Horizon',
    name_km: 'ពេលថ្ងៃលិចកក់ក្តៅ',
    desc: 'Warm golden amber glow that inspires calm reflection and deep analytical focus.',
    skyColor: 'from-amber-100 via-orange-50 to-rose-50/40',
  },
  {
    id: 'cozy_evening',
    name: 'Cozy Evening Constellation',
    name_km: 'រាត្រីស្ងប់ស្ងាត់',
    desc: 'Night study atmosphere with twinkling celestial constellations and cozy desk radiance.',
    skyColor: 'from-slate-900 via-indigo-950 to-slate-900',
  },
  {
    id: 'cyber_lab',
    name: 'Cyber Future Academy',
    name_km: 'បណ្ឌិតសភាអនាគត',
    desc: 'High-tech learning lab with ambient cyan circuits, data nodes, and clean minimalism.',
    skyColor: 'from-cyan-950 via-slate-900 to-indigo-950',
  },
  {
    id: 'khmer_heritage',
    name: 'Angkorian Heritage Sanctuary',
    name_km: 'បេតិកភណ្ឌខ្មែរ',
    desc: 'Timeless Khmer wood warmth, lotus flower motifs, and traditional scholastic tranquility.',
    skyColor: 'from-amber-50 via-stone-100 to-amber-100/40',
  },
];

const WALL_COLORS = [
  { label: 'Cloud White', value: '#F8FAFC' },
  { label: 'Soft Sage', value: '#ECFDF5' },
  { label: 'Academic Blue', value: '#EFF6FF' },
  { label: 'Warm Cream', value: '#FEFCE8' },
  { label: 'Lilac Focus', value: '#F5F3FF' },
  { label: 'Charcoal Slate', value: '#1E293B' },
];

const FLOOR_STYLES = [
  {
    id: 'warm_wood',
    name: 'Honey Teak Hardwood',
    desc: 'Polished Cambodian teak wood planks with warm acoustic properties.',
    texture: 'bg-amber-100 border-amber-300',
  },
  {
    id: 'stone_tile',
    name: 'Modern Slate Tile',
    desc: 'Cool architectural stone pavers for a sleek research lab feel.',
    texture: 'bg-slate-200 border-slate-400',
  },
  {
    id: 'tech_mat',
    name: 'Electrostatic Tech Mat',
    desc: 'Anti-static dark grid composite for computer engineering workstations.',
    texture: 'bg-slate-800 border-indigo-500',
  },
  {
    id: 'bamboo',
    name: 'Woven River Bamboo',
    desc: 'Eco-friendly natural bamboo matting bringing nature into the study space.',
    texture: 'bg-yellow-100 border-yellow-400',
  },
];

export const RoomCustomizerModal: React.FC<RoomCustomizerModalProps> = ({
  room,
  isOpen,
  onClose,
  onSave,
}) => {
  const [roomName, setRoomName] = useState(room.room_name);
  const [backgroundTheme, setBackgroundTheme] = useState(room.background_theme);
  const [wallColor, setWallColor] = useState(room.wall_color);
  const [floorStyle, setFloorStyle] = useState(room.floor_style);
  const [isSaving, setIsSaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useAccessibleDialog(isOpen, onClose, dialogRef);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        room_name: roomName,
        background_theme: backgroundTheme,
        wall_color: wallColor,
        floor_style: floorStyle,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-customizer-modal-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden focus:outline-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 id="room-customizer-modal-title" className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>Personal Study Room Architecture</span>
                <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                  បន្ទប់សិក្សាផ្ទាល់ខ្លួន
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Design the ambiance, lighting, and environmental atmosphere of your study chamber
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close room customizer"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Room Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Room Title (ឈ្មោះបន្ទប់)
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Vannak's STEM Sanctuary"
            />
          </div>

          {/* Theme selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center justify-between">
              <span>Atmospheric Window & Lighting Theme</span>
              <span className="text-[11px] text-blue-600 font-normal">Environmental Setting</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEMES.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => setBackgroundTheme(theme.id as any)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    backgroundTheme === theme.id
                      ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{theme.name}</span>
                    </div>
                    {backgroundTheme === theme.id && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{theme.desc}</div>
                  <div className={`mt-2 h-3 rounded-md bg-gradient-to-r ${theme.skyColor} border border-black/5`} />
                </div>
              ))}
            </div>
          </div>

          {/* Wall Paint Color */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Interior Wall Tint (ពណ៌ជញ្ជាំង)
            </label>
            <div className="flex flex-wrap gap-2.5">
              {WALL_COLORS.map((col) => (
                <button
                  key={col.value}
                  onClick={() => setWallColor(col.value)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                    wallColor === col.value
                      ? 'border-blue-600 bg-blue-50 font-bold text-blue-900 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: col.value }}
                  />
                  <span>{col.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Floor Style */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Floor Materials & Texture (កម្រាលបន្ទប់)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FLOOR_STYLES.map((floor) => (
                <div
                  key={floor.id}
                  onClick={() => setFloorStyle(floor.id as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                    floorStyle === floor.id
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">{floor.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{floor.desc}</div>
                  </div>
                  {floorStyle === floor.id && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Customizations persist automatically to your profile.</span>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSaving ? <span>Saving...</span> : <span>Apply Changes</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
