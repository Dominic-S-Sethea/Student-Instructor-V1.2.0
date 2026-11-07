import React from 'react';
import { ClientAvatarItem } from '../../types';

interface RoomObjectRendererProps {
  item: ClientAvatarItem;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export const RoomObjectRenderer: React.FC<RoomObjectRendererProps> = ({
  item,
  className = '',
  onClick,
  isSelected = false,
}) => {
  const iconKey = item.icon_key;

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-200 group select-none ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl scale-105' : 'hover:scale-105'
      } ${className}`}
      title={`${item.name} (${item.category})`}
    >
      <div className="w-full h-full flex items-center justify-center">
        {/* 1. SMART STUDY DESK */}
        {iconKey === 'desk' && (
          <svg viewBox="0 0 220 120" className="w-full h-auto drop-shadow-lg" fill="none">
            {/* Table Surface with Woodgrain Warmth */}
            <path d="M15 45 L205 45 L190 75 L30 75 Z" fill="#D97706" />
            <path d="M15 45 L205 45 L195 50 L25 50 Z" fill="#FBBF24" fillOpacity="0.4" />
            {/* Front Lip */}
            <path d="M30 75 L190 75 L190 85 L30 85 Z" fill="#B45309" />
            {/* Power Channel Strip */}
            <rect x="70" y="47" width="80" height="4" rx="2" fill="#78350F" />
            <circle cx="100" cy="49" r="1.5" fill="#38BDF8" />
            {/* Left Legs */}
            <rect x="35" y="85" width="10" height="32" rx="1" fill="#475569" />
            <rect x="52" y="85" width="8" height="28" rx="1" fill="#334155" />
            {/* Right Legs */}
            <rect x="175" y="85" width="10" height="32" rx="1" fill="#475569" />
            <rect x="160" y="85" width="8" height="28" rx="1" fill="#334155" />
            {/* Crossbar */}
            <line x1="45" y1="102" x2="175" y2="102" stroke="#64748B" strokeWidth="3" />
          </svg>
        )}

        {/* 2. ERGONOMIC CHAIR */}
        {iconKey === 'chair' && (
          <svg viewBox="0 0 100 130" className="w-full h-auto drop-shadow-md" fill="none">
            {/* Backrest Mesh */}
            <rect x="25" y="15" width="50" height="60" rx="12" fill="#1E293B" />
            <rect x="30" y="20" width="40" height="50" rx="8" fill="#334155" />
            {/* Lumbar cushion */}
            <rect x="32" y="48" width="36" height="12" rx="4" fill="#0284C7" />
            {/* Seat Cushion */}
            <ellipse cx="50" cy="82" rx="30" ry="10" fill="#0F172A" />
            <ellipse cx="50" cy="80" rx="28" ry="9" fill="#1E293B" />
            {/* Armrests */}
            <path d="M22 60 L18 78 L25 80" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M78 60 L82 78 L75 80" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />
            {/* Hydraulic Pole & 5-Star Caster Base */}
            <rect x="47" y="88" width="6" height="24" fill="#64748B" />
            <path d="M50 112 L20 124 M50 112 L80 124 M50 112 L35 126 M50 112 L65 126" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="20" cy="124" r="3" fill="#0F172A" />
            <circle cx="80" cy="124" r="3" fill="#0F172A" />
            <circle cx="35" cy="126" r="3" fill="#0F172A" />
            <circle cx="65" cy="126" r="3" fill="#0F172A" />
          </svg>
        )}

        {/* 3. BOOKSHELF */}
        {iconKey === 'bookshelf' && (
          <svg viewBox="0 0 140 190" className="w-full h-auto drop-shadow-xl" fill="none">
            {/* Outer Wood Frame */}
            <rect x="10" y="10" width="120" height="170" rx="4" fill="#78350F" />
            <rect x="16" y="16" width="108" height="158" rx="2" fill="#451A03" />
            {/* Shelves */}
            <rect x="16" y="65" width="108" height="6" fill="#92400E" />
            <rect x="16" y="115" width="108" height="6" fill="#92400E" />
            <rect x="16" y="165" width="108" height="6" fill="#92400E" />
            {/* Top Shelf: Bac II Math & Physics Binders */}
            <rect x="22" y="30" width="12" height="35" rx="1" fill="#2563EB" />
            <rect x="36" y="26" width="14" height="39" rx="1" fill="#DC2626" />
            <rect x="52" y="32" width="10" height="33" rx="1" fill="#059669" />
            <rect x="64" y="28" width="15" height="37" rx="1" fill="#D97706" />
            <rect x="81" y="35" width="12" height="30" rx="1" fill="#7C3AED" />
            <polygon points="100,65 118,52 122,54 104,65" fill="#475569" />
            {/* Middle Shelf: Algorithms & Computer Science */}
            <rect x="24" y="80" width="16" height="35" rx="1" fill="#0284C7" />
            <rect x="42" y="84" width="14" height="31" rx="1" fill="#EA580C" />
            <rect x="58" y="76" width="18" height="39" rx="1" fill="#15803D" />
            <circle cx="95" cy="98" r="12" fill="#FBBF24" fillOpacity="0.3" stroke="#F59E0B" strokeWidth="2" />
            <text x="90" y="102" fontSize="9" fontWeight="bold" fill="#FBBF24">CS</text>
            {/* Bottom Shelf: Encyclopedia & Khmer Dictionary */}
            <rect x="22" y="128" width="22" height="37" rx="1" fill="#991B1B" />
            <rect x="46" y="132" width="18" height="33" rx="1" fill="#1E3A8A" />
            <rect x="66" y="130" width="20" height="35" rx="1" fill="#334155" />
            <rect x="88" y="135" width="16" height="30" rx="1" fill="#B45309" />
          </svg>
        )}

        {/* 4. HIGH-PERFORMANCE COMPUTER TERMINAL */}
        {iconKey === 'computer' && (
          <svg viewBox="0 0 130 90" className="w-full h-auto drop-shadow-md" fill="none">
            {/* Monitor Bezel */}
            <rect x="15" y="10" width="100" height="60" rx="4" fill="#0F172A" />
            {/* Screen Display */}
            <rect x="20" y="15" width="90" height="50" rx="2" fill="#020617" />
            {/* Code lines on screen */}
            <line x1="26" y1="23" x2="55" y2="23" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="26" y1="30" x2="75" y2="30" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="37" x2="88" y2="37" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="44" x2="62" y2="44" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
            <line x1="26" y1="51" x2="48" y2="51" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
            {/* Cursor */}
            <rect x="52" y="49" width="4" height="4" fill="#38BDF8" />
            {/* Stand */}
            <rect x="58" y="70" width="14" height="12" fill="#64748B" />
            <ellipse cx="65" cy="82" rx="20" ry="3" fill="#334155" />
          </svg>
        )}

        {/* 5. DIGITAL STEM MICROSCOPE */}
        {iconKey === 'microscope' && (
          <svg viewBox="0 0 90 110" className="w-full h-auto drop-shadow-md" fill="none">
            {/* Heavy Base */}
            <path d="M15 95 C15 90 75 90 75 95 L80 102 L10 102 Z" fill="#334155" />
            {/* Curved Arm */}
            <path d="M60 92 C60 50 50 30 35 25" stroke="#475569" strokeWidth="8" strokeLinecap="round" fill="none" />
            {/* Eyepiece / Tube */}
            <rect x="25" y="15" width="12" height="24" rx="2" transform="rotate(-25 25 15)" fill="#0284C7" />
            <rect x="20" y="10" width="16" height="6" rx="1" transform="rotate(-25 20 10)" fill="#0F172A" />
            {/* Objective Turret */}
            <circle cx="34" cy="48" r="8" fill="#1E293B" />
            <rect x="31" y="52" width="6" height="12" fill="#F59E0B" />
            {/* Stage */}
            <rect x="18" y="65" width="38" height="5" rx="1" fill="#0F172A" />
            {/* Glass Slide with glowing specimen */}
            <rect x="25" y="63" width="20" height="2" fill="#E2E8F0" />
            <circle cx="35" cy="64" r="1.5" fill="#10B981" />
            {/* Light Condenser */}
            <circle cx="35" cy="80" r="5" fill="#FBBF24" />
          </svg>
        )}

        {/* 6. MOLECULAR CHEMISTRY KIT */}
        {iconKey === 'chemistry_kit' && (
          <svg viewBox="0 0 100 85" className="w-full h-auto drop-shadow-md" fill="none">
            {/* Wooden Test Tube Rack */}
            <rect x="10" y="55" width="80" height="20" rx="3" fill="#B45309" />
            <rect x="15" y="48" width="70" height="4" fill="#D97706" />
            {/* Glass Erlenmeyer Flask */}
            <path d="M22 25 L28 25 L38 52 C39 55 21 55 22 52 Z" stroke="#CBD5E1" strokeWidth="1.5" fill="#E0F2FE" fillOpacity="0.4" />
            {/* Emerald Solution with bubbles */}
            <path d="M22 42 Q30 40 38 42 L38 52 C39 55 21 55 22 52 Z" fill="#10B981" />
            <circle cx="28" cy="46" r="1.5" fill="#FFFFFF" fillOpacity="0.7" />
            <circle cx="32" cy="49" r="1" fill="#FFFFFF" fillOpacity="0.7" />
            {/* Test Tubes in Rack */}
            <rect x="46" y="30" width="7" height="30" rx="3.5" fill="#38BDF8" fillOpacity="0.8" stroke="#94A3B8" strokeWidth="1" />
            <rect x="58" y="24" width="7" height="36" rx="3.5" fill="#EC4899" fillOpacity="0.8" stroke="#94A3B8" strokeWidth="1" />
            <rect x="70" y="28" width="7" height="32" rx="3.5" fill="#FBBF24" fillOpacity="0.8" stroke="#94A3B8" strokeWidth="1" />
          </svg>
        )}

        {/* 7. CELESTIAL TELESCOPE */}
        {iconKey === 'telescope' && (
          <svg viewBox="0 0 110 130" className="w-full h-auto drop-shadow-lg" fill="none">
            {/* Sturdy Brass/Carbon Tripod */}
            <line x1="55" y1="65" x2="20" y2="125" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
            <line x1="55" y1="65" x2="55" y2="128" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
            <line x1="55" y1="65" x2="90" y2="125" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
            <line x1="32" y1="100" x2="78" y2="100" stroke="#D97706" strokeWidth="2" />
            {/* Mount Head */}
            <circle cx="55" cy="65" r="7" fill="#1E293B" stroke="#FBBF24" strokeWidth="1.5" />
            {/* Optical Tube Assembly (Angled upward at stars) */}
            <g transform="rotate(-32 55 65)">
              <rect x="15" y="58" width="80" height="14" rx="3" fill="#1E3A8A" stroke="#38BDF8" strokeWidth="1" />
              {/* Dew shield & Front Lens */}
              <rect x="85" y="55" width="16" height="20" rx="2" fill="#172554" />
              <ellipse cx="101" cy="65" rx="2" ry="9" fill="#67E8F9" />
              {/* Eyepiece Diagonal */}
              <rect x="10" y="61" width="8" height="8" fill="#FBBF24" />
              <rect x="8" y="53" width="6" height="10" rx="1" fill="#0F172A" />
            </g>
          </svg>
        )}

        {/* 8. CERTIFICATE FRAME */}
        {iconKey === 'certificate_frame' && (
          <svg viewBox="0 0 100 80" className="w-full h-auto drop-shadow-md" fill="none">
            {/* Hanging Cord & Wall Pin */}
            <circle cx="50" cy="8" r="2.5" fill="#D97706" />
            <line x1="50" y1="8" x2="25" y2="20" stroke="#D97706" strokeWidth="1.2" />
            <line x1="50" y1="8" x2="75" y2="20" stroke="#D97706" strokeWidth="1.2" />
            {/* Ornate Gold Outer Frame */}
            <rect x="15" y="18" width="70" height="52" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            {/* Cream Parchment Certificate */}
            <rect x="20" y="23" width="60" height="42" rx="1" fill="#FFFBEB" />
            {/* MoEYS Seal / Gold Crest */}
            <circle cx="50" cy="33" r="5.5" fill="#D97706" />
            <circle cx="50" cy="33" r="4" fill="#FDE68A" />
            {/* Calligraphy lines */}
            <line x1="30" y1="44" x2="70" y2="44" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="35" y1="49" x2="65" y2="49" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="32" y1="54" x2="68" y2="54" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
            {/* Red Honor Ribbon */}
            <polygon points="50,56 46,63 50,61 54,63" fill="#DC2626" />
          </svg>
        )}

        {/* 9. ALGORITHMIC WHITEBOARD */}
        {iconKey === 'whiteboard' && (
          <svg viewBox="0 0 150 95" className="w-full h-auto drop-shadow-lg" fill="none">
            {/* Aluminum Frame */}
            <rect x="10" y="10" width="130" height="75" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
            {/* Magnetic White Surface */}
            <rect x="14" y="14" width="122" height="67" rx="2" fill="#FFFFFF" />
            {/* Marker Tray */}
            <rect x="40" y="83" width="60" height="4" rx="1" fill="#64748B" />
            <rect x="48" y="82" width="10" height="2" fill="#EF4444" />
            <rect x="62" y="82" width="10" height="2" fill="#3B82F6" />
            {/* Diagram: Binary Tree & Physics Formula */}
            <circle cx="35" cy="30" r="4" fill="#3B82F6" />
            <circle cx="26" cy="45" r="3.5" fill="#10B981" />
            <circle cx="44" cy="45" r="3.5" fill="#10B981" />
            <line x1="35" y1="34" x2="26" y2="42" stroke="#64748B" strokeWidth="1.2" />
            <line x1="35" y1="34" x2="44" y2="42" stroke="#64748B" strokeWidth="1.2" />
            <text x="65" y="32" fontSize="9" fontWeight="bold" fill="#1E293B">F = m · a</text>
            <text x="65" y="46" fontSize="8" fill="#475569">E = mc²</text>
            <line x1="65" y1="56" x2="120" y2="56" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x="65" y="68" fontSize="8" fontWeight="bold" fill="#059669">O(log n) Search</text>
          </svg>
        )}

        {/* 10. BONSAI PLANT */}
        {iconKey === 'plant' && (
          <svg viewBox="0 0 70 85" className="w-full h-auto drop-shadow-md" fill="none">
            {/* Ceramic Pot */}
            <path d="M20 58 L50 58 L46 76 L24 76 Z" fill="#78350F" />
            <rect x="18" y="55" width="34" height="4" rx="2" fill="#92400E" />
            {/* Gnarled Trunk */}
            <path d="M35 58 C35 45 42 42 32 32 C28 28 32 20 35 15" stroke="#5C330A" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            {/* Foliage Clouds */}
            <circle cx="35" cy="16" r="10" fill="#15803D" />
            <circle cx="28" cy="24" r="8" fill="#16A34A" />
            <circle cx="44" cy="28" r="9" fill="#15803D" />
            <circle cx="38" cy="22" r="7" fill="#4ADE80" fillOpacity="0.8" />
          </svg>
        )}

        {/* 11. STUDY LAMP */}
        {iconKey === 'lamp' && (
          <svg viewBox="0 0 70 90" className="w-full h-auto drop-shadow-md" fill="none">
            {/* Base */}
            <ellipse cx="35" cy="80" rx="16" ry="5" fill="#334155" />
            {/* Flexible Neck */}
            <path d="M35 80 Q25 45 42 32" stroke="#64748B" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Lamp Hood */}
            <path d="M38 24 L56 34 L46 44 L32 30 Z" fill="#0284C7" />
            {/* Soft Warm Illumination Cone */}
            <polygon points="46,44 65,85 20,85 38,38" fill="#FEF08A" fillOpacity="0.25" />
            <circle cx="44" cy="38" r="4" fill="#FBBF24" />
          </svg>
        )}

        {/* 12. ASTROPHYSICS DEEP SPACE CHART */}
        {iconKey === 'poster' && (
          <svg viewBox="0 0 95 125" className="w-full h-auto drop-shadow-md" fill="none">
            {/* Poster Sheet */}
            <rect x="10" y="10" width="75" height="105" rx="3" fill="#090D16" stroke="#38BDF8" strokeWidth="1.5" />
            {/* Sun */}
            <circle cx="47" cy="35" r="12" fill="#F59E0B" />
            <circle cx="47" cy="35" r="16" fill="#FBBF24" fillOpacity="0.25" />
            {/* Orbital rings */}
            <ellipse cx="47" cy="65" rx="32" ry="12" stroke="#64748B" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
            <ellipse cx="47" cy="78" rx="24" ry="9" stroke="#64748B" strokeWidth="0.8" fill="none" />
            {/* Planets */}
            <circle cx="68" cy="65" r="4" fill="#38BDF8" />
            <circle cx="28" cy="78" r="3" fill="#EF4444" />
            <circle cx="58" cy="84" r="5" fill="#F97316" />
            {/* Constellation stars */}
            <circle cx="22" cy="22" r="1" fill="#FFFFFF" />
            <circle cx="70" cy="25" r="1.2" fill="#FFFFFF" />
            <circle cx="30" cy="98" r="1" fill="#FFFFFF" />
            <circle cx="65" cy="102" r="1" fill="#FFFFFF" />
            <text x="24" y="112" fontSize="6.5" fontWeight="bold" fill="#93C5FD">DEEP SPACE</text>
          </svg>
        )}
      </div>

      {/* Floating Hover Badge */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-20 shadow">
        {item.name}
      </div>
    </div>
  );
};
