import React from 'react';
import { ClientAvatarProfile } from '../../types';

interface AvatarRendererProps {
  profile: Partial<ClientAvatarProfile>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showBadge?: boolean;
  className?: string;
  isAnimated?: boolean;
}

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  profile,
  size = 'lg',
  showBadge = true,
  className = '',
  isAnimated = true,
}) => {
  const skinTone = profile.skin_tone || '#E0AC69';
  const hairStyle = profile.hair_style || 'short_wavy';
  const hairColor = profile.hair_color || '#2A2421';
  const eyeColor = profile.eye_color || '#3B2F2F';
  const outfit = profile.clothing_outfit || 'cdes_uniform';
  const accessory = profile.accessory || 'glasses_round';
  const expression = profile.expression || 'smiling';

  const sizePixels = {
    sm: 64,
    md: 96,
    lg: 140,
    xl: 190,
    '2xl': 260,
  }[size];

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center ${className}`}
      style={{ width: sizePixels, height: sizePixels }}
    >
      <svg
        viewBox="0 0 200 240"
        className={`w-full h-full drop-shadow-md ${isAnimated ? 'transition-transform duration-300 hover:scale-105' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="faceShading" cx="50%" cy="40%" r="50%">
            <stop offset="60%" stopColor={skinTone} />
            <stop offset="100%" stopColor="#8C5824" stopOpacity="0.25" />
          </radialGradient>
          <linearGradient id="blush" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF8E8E" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="tieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
          <linearGradient id="kramaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#991B1B" />
            <stop offset="50%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>
        </defs>

        {/* 1. Base Shadow */}
        <ellipse cx="100" cy="232" rx="55" ry="7" fill="#0F172A" fillOpacity="0.12" />

        {/* 2. Body / Clothing Layer */}
        {outfit === 'cdes_uniform' && (
          <g id="outfit-uniform">
            {/* Shoulders & Torso */}
            <path d="M40 185 C40 155 70 145 100 145 C130 145 160 155 160 185 L165 230 L35 230 Z" fill="#1E293B" />
            {/* White Dress Shirt V-cut */}
            <path d="M82 145 L100 195 L118 145 Z" fill="#FFFFFF" />
            {/* White Collar Wings */}
            <path d="M78 145 L100 170 L88 180 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            <path d="M122 145 L100 170 L112 180 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* CDES Royal Navy Tie */}
            <path d="M96 168 L104 168 L107 205 L100 215 L93 205 Z" fill="url(#tieGrad)" />
            {/* CDES Crest Badge on Pocket */}
            <rect x="52" y="180" width="16" height="14" rx="2" fill="#334155" />
            <circle cx="60" cy="187" r="3.5" fill="#38BDF8" />
          </g>
        )}

        {outfit === 'lab_coat' && (
          <g id="outfit-labcoat">
            {/* Inner Dark Shirt */}
            <path d="M40 185 C40 155 70 145 100 145 C130 145 160 155 160 185 L165 230 L35 230 Z" fill="#0284C7" />
            <path d="M85 145 L100 205 L115 145 Z" fill="#E0F2FE" />
            {/* Lab Coat Left Lapel */}
            <path d="M38 185 C38 152 75 145 88 152 L95 230 L35 230 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            {/* Lab Coat Right Lapel */}
            <path d="M162 185 C162 152 125 145 112 152 L105 230 L165 230 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
            {/* Pen in pocket */}
            <rect x="50" y="185" width="18" height="16" rx="2" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="55" y1="181" x2="55" y2="190" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="60" y1="179" x2="60" y2="190" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {outfit === 'scholar_casual' && (
          <g id="outfit-casual">
            <path d="M40 185 C40 155 70 145 100 145 C130 145 160 155 160 185 L165 230 L35 230 Z" fill="#475569" />
            {/* Mustard Knit Sweater */}
            <path d="M42 185 C42 155 72 147 100 147 C128 147 158 155 158 185 L162 230 L38 230 Z" fill="#D97706" />
            {/* White undershirt crewneck */}
            <ellipse cx="100" cy="148" rx="18" ry="8" fill="#FFFFFF" />
          </g>
        )}

        {outfit === 'tech_hoodie' && (
          <g id="outfit-techhoodie">
            {/* Dark Indigo Cyber Hoodie */}
            <path d="M38 185 C38 153 68 145 100 145 C132 145 162 153 162 185 L166 230 L34 230 Z" fill="#312E81" />
            {/* Drawstrings */}
            <path d="M88 150 Q85 185 82 205" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" />
            <path d="M112 150 Q115 185 118 205" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" />
            {/* Center STEM emblem */}
            <circle cx="100" cy="190" r="10" fill="#4338CA" />
            <path d="M96 190 L100 184 L104 190 L100 196 Z" fill="#67E8F9" />
          </g>
        )}

        {outfit === 'traditional_krama' && (
          <g id="outfit-krama">
            <path d="M40 185 C40 155 70 145 100 145 C130 145 160 155 160 185 L165 230 L35 230 Z" fill="#F8FAFC" />
            {/* Cambodian Checkered Krama scarf wrapped across shoulders */}
            <path d="M60 148 C75 142 125 142 140 148 L148 185 L52 185 Z" fill="url(#kramaGrad)" />
            {/* Scarf fold draping down front */}
            <path d="M88 165 L112 165 L108 230 L92 230 Z" fill="#B91C1C" stroke="#FEE2E2" strokeWidth="1" strokeDasharray="3 2" />
          </g>
        )}

        {outfit === 'math_olympiad' && (
          <g id="outfit-olympiad">
            <path d="M40 185 C40 155 70 145 100 145 C130 145 160 155 160 185 L165 230 L35 230 Z" fill="#14532D" />
            {/* Gold piping */}
            <path d="M45 190 L98 148 L102 148 L155 190" stroke="#FBBF24" strokeWidth="3" />
            <circle cx="100" cy="195" r="9" fill="#FBBF24" />
            <text x="96" y="199" fontSize="10" fontWeight="bold" fill="#78350F">∑</text>
          </g>
        )}

        {/* 3. Neck */}
        <rect x="86" y="125" width="28" height="26" rx="4" fill={skinTone} />
        {/* Neck shadow */}
        <path d="M86 125 L114 125 L114 135 C105 140 95 140 86 135 Z" fill="#5C330A" fillOpacity="0.2" />

        {/* 4. Head & Face */}
        <ellipse cx="100" cy="85" rx="44" ry="48" fill="url(#faceShading)" />

        {/* Ears */}
        <ellipse cx="56" cy="88" rx="7" ry="11" fill={skinTone} />
        <ellipse cx="144" cy="88" rx="7" ry="11" fill={skinTone} />

        {/* Cheeks / Warmth */}
        <ellipse cx="74" cy="98" rx="9" ry="5" fill="url(#blush)" />
        <ellipse cx="126" cy="98" rx="9" ry="5" fill="url(#blush)" />

        {/* Eyebrows */}
        {expression === 'curious' ? (
          <>
            <path d="M72 65 Q82 60 92 67" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M108 67 Q118 64 128 66" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
          </>
        ) : expression === 'thoughtful' ? (
          <>
            <path d="M72 67 Q82 66 92 68" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M108 68 Q118 64 128 64" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M72 66 Q82 62 92 66" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M108 66 Q118 62 128 66" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
          </>
        )}

        {/* Eyes */}
        <g id="eyes">
          {/* Left Eye */}
          <ellipse cx="80" cy="78" rx="6.5" ry="7.5" fill="#FFFFFF" />
          <circle cx="81" cy="78" r="4.5" fill={eyeColor} />
          <circle cx="82.5" cy="76.5" r="1.8" fill="#FFFFFF" />

          {/* Right Eye */}
          <ellipse cx="120" cy="78" rx="6.5" ry="7.5" fill="#FFFFFF" />
          <circle cx="119" cy="78" r="4.5" fill={eyeColor} />
          <circle cx="120.5" cy="76.5" r="1.8" fill="#FFFFFF" />
        </g>

        {/* Nose */}
        <path d="M98 84 Q100 92 103 92" stroke="#8C5824" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Mouth / Expression */}
        {expression === 'smiling' && (
          <path d="M88 103 Q100 115 112 103" stroke="#991B1B" strokeWidth="2.5" strokeLinecap="round" fill="#DC2626" fillOpacity="0.2" />
        )}
        {expression === 'curious' && (
          <ellipse cx="100" cy="106" rx="4" ry="5.5" fill="#991B1B" />
        )}
        {expression === 'confident' && (
          <path d="M89 104 Q101 113 113 102" stroke="#991B1B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        )}
        {expression === 'thoughtful' && (
          <path d="M92 107 Q100 106 108 107" stroke="#991B1B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        )}

        {/* 5. Hair Styles */}
        {hairStyle === 'short_wavy' && (
          <g id="hair-short-wavy">
            <path
              d="M58 80 C54 42 75 32 100 32 C125 32 146 42 142 80 C140 65 130 50 120 54 C110 58 100 48 90 52 C78 56 68 64 58 80 Z"
              fill={hairColor}
            />
            <path d="M68 50 Q85 40 102 44" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.25" strokeLinecap="round" fill="none" />
          </g>
        )}

        {hairStyle === 'parted_smooth' && (
          <g id="hair-parted">
            <path
              d="M57 82 C54 40 76 34 100 34 C124 34 146 40 143 82 C135 60 115 50 100 52 C85 54 70 65 57 82 Z"
              fill={hairColor}
            />
            {/* Side part clean line */}
            <path d="M85 36 Q115 48 138 68" stroke="#000000" strokeWidth="1" strokeOpacity="0.3" fill="none" />
          </g>
        )}

        {hairStyle === 'curly_bun' && (
          <g id="hair-curly-bun">
            {/* Top Bun */}
            <circle cx="100" cy="24" r="22" fill={hairColor} />
            <circle cx="108" cy="22" r="14" fill="#000000" fillOpacity="0.15" />
            {/* Side hair framing */}
            <path
              d="M57 82 C55 45 74 38 100 38 C126 38 145 45 143 82 C136 68 126 56 100 56 C74 56 64 68 57 82 Z"
              fill={hairColor}
            />
          </g>
        )}

        {hairStyle === 'long_straight' && (
          <g id="hair-long">
            {/* Back long hair */}
            <path d="M54 75 L48 165 C48 175 60 180 70 180 L70 95 Z" fill={hairColor} />
            <path d="M146 75 L152 165 C152 175 140 180 130 180 L130 95 Z" fill={hairColor} />
            {/* Front bang */}
            <path
              d="M56 80 C54 40 75 34 100 34 C125 34 146 40 144 80 C132 58 118 52 100 52 C82 52 68 58 56 80 Z"
              fill={hairColor}
            />
          </g>
        )}

        {hairStyle === 'braids' && (
          <g id="hair-braids">
            <path
              d="M58 80 C55 42 75 35 100 35 C125 35 145 42 142 80 C135 62 120 54 100 54 C80 54 65 62 58 80 Z"
              fill={hairColor}
            />
            {/* Hanging Braids */}
            <rect x="50" y="85" width="12" height="70" rx="6" fill={hairColor} />
            <rect x="138" y="85" width="12" height="70" rx="6" fill={hairColor} />
            {/* Colorful bands */}
            <rect x="50" y="145" width="12" height="4" fill="#38BDF8" />
            <rect x="138" y="145" width="12" height="4" fill="#38BDF8" />
          </g>
        )}

        {hairStyle === 'slick_fade' && (
          <g id="hair-slick">
            <path
              d="M62 76 C60 44 78 30 100 30 C122 30 140 44 138 76 C134 56 120 44 100 44 C80 44 66 56 62 76 Z"
              fill={hairColor}
            />
            <path d="M64 78 L64 92 C60 92 58 85 64 78 Z" fill={hairColor} fillOpacity="0.4" />
            <path d="M136 78 L136 92 C140 92 142 85 136 78 Z" fill={hairColor} fillOpacity="0.4" />
          </g>
        )}

        {/* 6. Accessories */}
        {accessory === 'glasses_round' && (
          <g id="acc-glasses">
            <circle cx="80" cy="78" r="14" stroke="#1E293B" strokeWidth="2.5" fill="#FFFFFF" fillOpacity="0.1" />
            <circle cx="120" cy="78" r="14" stroke="#1E293B" strokeWidth="2.5" fill="#FFFFFF" fillOpacity="0.1" />
            <line x1="94" y1="78" x2="106" y2="78" stroke="#1E293B" strokeWidth="2.5" />
            <line x1="66" y1="78" x2="56" y2="75" stroke="#1E293B" strokeWidth="2" />
            <line x1="134" y1="78" x2="144" y2="75" stroke="#1E293B" strokeWidth="2" />
            {/* Lens Glare */}
            <line x1="75" y1="71" x2="83" y2="79" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
          </g>
        )}

        {accessory === 'graduation_cap' && (
          <g id="acc-gradcap">
            {/* Mortarboard Diamond */}
            <polygon points="100,10 162,28 100,45 38,28" fill="#0F172A" />
            <polygon points="100,10 162,28 100,29 38,28" fill="#1E293B" />
            {/* Cap Skull Base */}
            <path d="M65 35 L65 52 C65 62 135 62 135 52 L135 35 Z" fill="#0F172A" />
            {/* Golden Button & Tassel */}
            <circle cx="100" cy="28" r="3.5" fill="#FBBF24" />
            <path d="M100 28 Q140 32 145 55" stroke="#FBBF24" strokeWidth="2" fill="none" />
            <rect x="142" y="55" width="6" height="12" rx="2" fill="#F59E0B" />
          </g>
        )}

        {accessory === 'cdes_badge' && (
          <g id="acc-badge">
            <circle cx="60" cy="184" r="8" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
            <circle cx="60" cy="184" r="6" fill="#1E3A8A" />
            <text x="56" y="187" fontSize="8" fontWeight="bold" fill="#FFFFFF">★</text>
          </g>
        )}

        {accessory === 'tech_headset' && (
          <g id="acc-headset">
            {/* Headset Arc */}
            <path d="M52 86 C50 35 150 35 148 86" stroke="#0F172A" strokeWidth="5" fill="none" />
            {/* Left Ear Cushion */}
            <rect x="46" y="78" width="10" height="20" rx="5" fill="#0284C7" stroke="#0F172A" strokeWidth="1.5" />
            {/* Right Ear Cushion */}
            <rect x="144" y="78" width="10" height="20" rx="5" fill="#0284C7" stroke="#0F172A" strokeWidth="1.5" />
            {/* Mic boom */}
            <path d="M50 94 Q48 112 70 114" stroke="#0F172A" strokeWidth="2" fill="none" />
            <circle cx="72" cy="114" r="3" fill="#38BDF8" />
          </g>
        )}

        {accessory === 'backpack' && (
          <g id="acc-backpack">
            {/* Straps visible over shoulders */}
            <path d="M50 155 L52 225" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
            <path d="M150 155 L148 225" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
            <circle cx="51" cy="190" r="2.5" fill="#E2E8F0" />
            <circle cx="149" cy="190" r="2.5" fill="#E2E8F0" />
          </g>
        )}
      </svg>

      {/* Level / Merit Badge */}
      {showBadge && (
        <div className="absolute -bottom-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center space-x-1 border border-white/50">
          <span>Lv.{profile.level || 1}</span>
          <span className="text-amber-300">★</span>
        </div>
      )}
    </div>
  );
};
