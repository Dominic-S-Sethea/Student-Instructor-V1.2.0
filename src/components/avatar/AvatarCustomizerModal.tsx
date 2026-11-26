import React, { useRef, useState } from 'react';
import { X, Sparkles, Check, User, Shirt, Glasses, Smile, ShieldAlert } from 'lucide-react';
import { ClientAvatarProfile } from '../../types';
import { AvatarRenderer } from './AvatarRenderer';
import { useAccessibleDialog } from '../../hooks/useModalAccessibility';

interface AvatarCustomizerModalProps {
  initialProfile: ClientAvatarProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<ClientAvatarProfile>) => Promise<void>;
}

const SKIN_TONES = [
  { label: 'Warm Caramel', value: '#E0AC69' },
  { label: 'Golden Honey', value: '#F1C27D' },
  { label: 'Deep Tan', value: '#C68642' },
  { label: 'Bronze Glow', value: '#8D5524' },
  { label: 'Fair Ivory', value: '#FFDBAC' },
];

const HAIR_STYLES = [
  { id: 'short_wavy', label: 'Short Wavy' },
  { id: 'parted_smooth', label: 'Parted Smooth' },
  { id: 'curly_bun', label: 'Curly Top Bun' },
  { id: 'long_straight', label: 'Long Straight' },
  { id: 'braids', label: 'Scholastic Braids' },
  { id: 'slick_fade', label: 'Modern Fade' },
];

const HAIR_COLORS = [
  { label: 'Obsidian Black', value: '#2A2421' },
  { label: 'Dark Chestnut', value: '#4A3728' },
  { label: 'Espresso Brown', value: '#362B28' },
  { label: 'Midnight Blue', value: '#1E293B' },
  { label: 'Auburn Wood', value: '#78350F' },
];

const EYE_COLORS = [
  { label: 'Deep Brown', value: '#3B2F2F' },
  { label: 'Warm Hazel', value: '#5C4033' },
  { label: 'Dark Amber', value: '#78350F' },
  { label: 'Obsidian Gray', value: '#334155' },
];

const OUTFITS = [
  {
    id: 'cdes_uniform',
    name: 'National School Uniform',
    name_km: 'ឯកសណ្ឋានសាលារដ្ឋ',
    desc: 'Crisp white collared shirt, navy tie, and CDES golden academy crest pocket.',
  },
  {
    id: 'lab_coat',
    name: 'STEM Scientific Coat',
    name_km: 'អាវមន្ទីរពិសោធន៍',
    desc: 'Clean research lab coat with precision pens and analytical pocket instruments.',
  },
  {
    id: 'scholar_casual',
    name: 'Scholar Knit Cardigan',
    name_km: 'អាវរងាសិក្សា',
    desc: 'Mustard warm sweater over collegiate crewneck for relaxed study sessions.',
  },
  {
    id: 'tech_hoodie',
    name: 'Digital Society Tech Hoodie',
    name_km: 'អាវក្រណាត់ឌីជីថល',
    desc: 'Cyber indigo tech fleece bearing the central STEM geometric node.',
  },
  {
    id: 'traditional_krama',
    name: 'Khmer Heritage Silk Krama',
    name_km: 'ក្រមាសូត្រខ្មែរប្រពៃណី',
    desc: 'Ceremonial red-checkered Cambodian krama honoring national educational roots.',
  },
  {
    id: 'math_olympiad',
    name: 'National Olympiad Jacket',
    name_km: 'អាវក្រុមអូឡាំព្យាដ',
    desc: 'Deep forest green jacket with golden ∑ Euler summation crest.',
  },
];

const ACCESSORIES = [
  { id: 'none', label: 'No Accessory', icon: '—' },
  { id: 'glasses_round', label: 'Round Scholar Glasses', icon: '👓' },
  { id: 'graduation_cap', label: 'Honor Mortarboard Cap', icon: '🎓' },
  { id: 'cdes_badge', label: 'CDES Excellence Pin', icon: '🏅' },
  { id: 'tech_headset', label: 'Virtual Lab Headset', icon: '🎧' },
  { id: 'backpack', label: 'Academic Book Backpack', icon: '🎒' },
];

const EXPRESSIONS = [
  { id: 'smiling', label: 'Warm Smile', desc: 'Approachable & enthusiastic' },
  { id: 'curious', label: 'Curious Inquirer', desc: 'Always questioning & observing' },
  { id: 'confident', label: 'Confident Scholar', desc: 'Ready for challenging problems' },
  { id: 'thoughtful', label: 'Thoughtful Analyst', desc: 'Deep contemplation mode' },
];

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  initialProfile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [tab, setTab] = useState<'appearance' | 'clothing' | 'accessories' | 'identity'>('appearance');
  const [profile, setProfile] = useState<ClientAvatarProfile>({ ...initialProfile });
  const [isSaving, setIsSaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useAccessibleDialog(isOpen, onClose, dialogRef);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(profile);
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
      aria-labelledby="avatar-customizer-modal-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden focus:outline-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 id="avatar-customizer-modal-title" className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>Student Avatar Identity Studio</span>
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                  អត្តសញ្ញាណនិស្សិត
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Craft your personalized digital learning persona for the CDES Education Network
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close avatar customizer"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Preview Pane */}
          <div className="md:col-span-5 p-6 bg-gradient-to-b from-blue-50/60 via-slate-50 to-white flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div className="w-full flex justify-between items-center text-xs text-slate-500 font-medium">
              <span className="bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-200/80">
                Level {profile.level} Scholar
              </span>
              <span className="text-blue-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {profile.merit_points} Merit Pts
              </span>
            </div>

            {/* Avatar Preview Figure */}
            <div className="my-4 relative">
              <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-2xl transform scale-90" />
              <AvatarRenderer profile={profile} size="2xl" showBadge={false} />
            </div>

            {/* Identity Card */}
            <div className="w-full bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm text-center">
              <div className="font-bold text-slate-800 text-sm">{profile.avatar_name}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {OUTFITS.find((o) => o.id === profile.clothing_outfit)?.name}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-around text-[11px] text-slate-600">
                <span>Hair: {profile.hair_style.replace('_', ' ')}</span>
                <span>•</span>
                <span>Mood: {profile.expression}</span>
              </div>
            </div>
          </div>

          {/* Right Customization Controls */}
          <div className="md:col-span-7 flex flex-col overflow-hidden bg-white">
            {/* Customization Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-4 pt-3 space-x-2 bg-slate-50/50">
              <button
                onClick={() => setTab('appearance')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                  tab === 'appearance'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Appearance</span>
              </button>
              <button
                onClick={() => setTab('clothing')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                  tab === 'clothing'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Uniform & Outfits</span>
              </button>
              <button
                onClick={() => setTab('accessories')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                  tab === 'accessories'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Glasses className="w-3.5 h-3.5" />
                <span>Accessories</span>
              </button>
              <button
                onClick={() => setTab('identity')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                  tab === 'identity'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Identity & Mood</span>
              </button>
            </div>

            {/* Scrollable Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* TAB 1: APPEARANCE */}
              {tab === 'appearance' && (
                <div className="space-y-6">
                  {/* Skin Tone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Skin Tone (សម្បុរ)
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {SKIN_TONES.map((tone) => (
                        <button
                          key={tone.value}
                          onClick={() => setProfile({ ...profile, skin_tone: tone.value })}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                            profile.skin_tone === tone.value
                              ? 'border-blue-600 bg-blue-50 text-blue-800 font-semibold shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: tone.value }}
                          />
                          <span>{tone.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Style */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Hair Style (ម៉ូតសក់)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {HAIR_STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setProfile({ ...profile, hair_style: style.id as any })}
                          className={`p-3 rounded-xl border text-left text-xs transition-all ${
                            profile.hair_style === style.id
                              ? 'border-blue-600 bg-blue-50/70 text-blue-800 font-semibold'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Color */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Hair Color (ពណ៌សក់)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {HAIR_COLORS.map((hc) => (
                        <button
                          key={hc.value}
                          onClick={() => setProfile({ ...profile, hair_color: hc.value })}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs ${
                            profile.hair_color === hc.value
                              ? 'border-blue-600 bg-blue-50 font-semibold text-blue-800'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: hc.value }}
                          />
                          <span>{hc.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Eye Color */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Eye Tone (ពណ៌ភ្នែក)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {EYE_COLORS.map((ec) => (
                        <button
                          key={ec.value}
                          onClick={() => setProfile({ ...profile, eye_color: ec.value })}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs ${
                            profile.eye_color === ec.value
                              ? 'border-blue-600 bg-blue-50 font-semibold text-blue-800'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: ec.value }}
                          />
                          <span>{ec.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLOTHING */}
              {tab === 'clothing' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Select an official educational outfit aligned with your scholastic path and cultural identity:
                  </p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {OUTFITS.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setProfile({ ...profile, clothing_outfit: item.id as any })}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                          profile.clothing_outfit === item.id
                            ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                            <span>{item.name}</span>
                            <span className="text-[10px] text-slate-500 font-serif font-normal">
                              ({item.name_km})
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{item.desc}</div>
                        </div>
                        {profile.clothing_outfit === item.id && (
                          <div className="text-blue-600 p-1 bg-white rounded-full shadow-sm">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ACCESSORIES */}
              {tab === 'accessories' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Scholastic accessories reflect study habits, honors, and specialized learning gear:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {ACCESSORIES.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setProfile({ ...profile, accessory: acc.id as any })}
                        className={`p-3.5 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                          profile.accessory === acc.id
                            ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="text-xl">{acc.icon}</span>
                        <span className="text-xs">{acc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: IDENTITY & MOOD */}
              {tab === 'identity' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Avatar Display Name (ឈ្មោះតំណាង)
                    </label>
                    <input
                      type="text"
                      value={profile.avatar_name}
                      onChange={(e) => setProfile({ ...profile, avatar_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="e.g. Vannak Sam"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Academic Expression & Mindset (អារម្មណ៍សិក្សា)
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {EXPRESSIONS.map((exp) => (
                        <button
                          key={exp.id}
                          onClick={() => setProfile({ ...profile, expression: exp.id as any })}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            profile.expression === exp.id
                              ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold">{exp.label}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{exp.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>All avatars comply with CDES Safe Learning Environment policies.</span>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Avatar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
