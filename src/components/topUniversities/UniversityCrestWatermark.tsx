import React, { useState } from 'react';
import { TopUniversityAidProgram } from '../../types/topUniversityScholarships';
import { getUniversityCrestMeta, UniversityCrestMeta } from '../../data/topUniversities/universityCrestsData';

interface UniversityCrestWatermarkProps {
  program: TopUniversityAidProgram;
  className?: string;
}

export const UniversityCrestWatermark: React.FC<UniversityCrestWatermarkProps> = ({
  program,
  className = ''
}) => {
  const meta: UniversityCrestMeta = getUniversityCrestMeta(
    program.id,
    program.universityName,
    program.region
  );

  const [hasError, setHasError] = useState(false);

  // Official high-resolution crest / logo path (e.g., Harvard official coat of arms with laurels and banner)
  const officialCrestPath = `/crests/${program.id}.png`;
  // Fallback high-res institutional favicon
  const fallbackUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${meta.domain}&size=256`;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden p-4 ${className}`}
    >
      {!hasError ? (
        <img
          src={officialCrestPath}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // If primary local path fails, try fallback domain icon
            const target = e.currentTarget;
            if (target.src !== fallbackUrl) {
              target.src = fallbackUrl;
            } else {
              setHasError(true);
            }
          }}
          className="w-[82%] h-[82%] max-w-[280px] max-h-[280px] sm:max-w-[310px] sm:max-h-[310px] object-contain opacity-50 transition-all duration-500 group-hover:scale-105 group-hover:opacity-60 drop-shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          style={{ opacity: 0.5 }}
        />
      ) : (
        /* Symmetrical Heraldic Vector Crest Fallback centered at 50% opacity */
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[82%] h-[82%] max-w-[280px] max-h-[280px] sm:max-w-[310px] sm:max-h-[310px] object-contain opacity-50 transform transition-transform duration-500 group-hover:scale-105"
          style={{ color: meta.primaryColor, opacity: 0.5 }}
        >
          {renderCrestGraphics(meta, program)}
        </svg>
      )}
    </div>
  );
};

// Sub-renderer for authentic university heraldic graphics
function renderCrestGraphics(meta: UniversityCrestMeta, program: TopUniversityAidProgram) {
  const { crestCategory, primaryColor, motto, established } = meta;

  switch (crestCategory) {
    case 'harvard-books':
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* Classic Harvard Shield */}
          <path
            d="M40 30 H160 V105 C160 148 100 178 100 178 C100 178 40 148 40 105 Z"
            fill="currentColor"
            fillOpacity="0.14"
            strokeWidth="3.5"
          />
          <path
            d="M48 38 H152 V103 C152 140 100 166 100 166 C100 166 48 140 48 103 Z"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          {/* Top Left Book "VE" */}
          <rect x="58" y="52" width="36" height="26" rx="2" fill="currentColor" fillOpacity="0.22" strokeWidth="2" />
          <line x1="76" y1="52" x2="76" y2="78" strokeWidth="1.5" />
          <text x="67" y="69" fontSize="11" fontWeight="900" fill="currentColor" stroke="none" fontFamily="serif">VE</text>

          {/* Top Right Book "RI" */}
          <rect x="106" y="52" width="36" height="26" rx="2" fill="currentColor" fillOpacity="0.22" strokeWidth="2" />
          <line x1="124" y1="52" x2="124" y2="78" strokeWidth="1.5" />
          <text x="116" y="69" fontSize="11" fontWeight="900" fill="currentColor" stroke="none" fontFamily="serif">RI</text>

          {/* Bottom Center Book "TAS" */}
          <rect x="82" y="96" width="36" height="26" rx="2" fill="currentColor" fillOpacity="0.22" strokeWidth="2" />
          <line x1="100" y1="96" x2="100" y2="122" strokeWidth="1.5" />
          <text x="89" y="113" fontSize="10" fontWeight="900" fill="currentColor" stroke="none" fontFamily="serif">TAS</text>

          {/* Laurels & Text */}
          <text x="100" y="152" fontSize="9" fontWeight="800" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="2">VERITAS</text>
          <text x="100" y="192" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">EST. 1636</text>
        </g>
      );

    case 'oxford-crowns':
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* Oxford Shield */}
          <path
            d="M35 30 H165 V110 C165 152 100 182 100 182 C100 182 35 152 35 110 Z"
            fill="currentColor"
            fillOpacity="0.12"
            strokeWidth="3.5"
          />
          {/* Top Left Crown */}
          <path d="M55 60 L62 48 L70 56 L78 48 L85 60 Z" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />
          <rect x="55" y="60" width="30" height="6" rx="1" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />

          {/* Top Right Crown */}
          <path d="M115 60 L122 48 L130 56 L138 48 L145 60 Z" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />
          <rect x="115" y="60" width="30" height="6" rx="1" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />

          {/* Central Open Book: Dominus Illuminatio Mea */}
          <rect x="62" y="78" width="76" height="38" rx="3" fill="currentColor" fillOpacity="0.2" strokeWidth="2" />
          <line x1="100" y1="78" x2="100" y2="116" strokeWidth="2" />
          <line x1="72" y1="88" x2="94" y2="88" strokeWidth="1.5" />
          <line x1="72" y1="96" x2="94" y2="96" strokeWidth="1.5" />
          <line x1="72" y1="104" x2="92" y2="104" strokeWidth="1.5" />
          <line x1="106" y1="88" x2="128" y2="88" strokeWidth="1.5" />
          <line x1="106" y1="96" x2="128" y2="96" strokeWidth="1.5" />
          <line x1="106" y1="104" x2="126" y2="104" strokeWidth="1.5" />

          {/* Bottom Crown */}
          <path d="M85 138 L92 126 L100 134 L108 126 L115 138 Z" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />
          <rect x="85" y="138" width="30" height="6" rx="1" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />

          {/* Banner */}
          <text x="100" y="162" fontSize="7.5" fontWeight="800" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1">DOMINUS ILLUMINATIO MEA</text>
          <text x="100" y="194" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">OXFORD · 1096</text>
        </g>
      );

    case 'cambridge-cross-lions':
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* Cambridge Arms Shield */}
          <path
            d="M38 32 H162 V112 C162 150 100 180 100 180 C100 180 38 150 38 112 Z"
            fill="currentColor"
            fillOpacity="0.12"
            strokeWidth="3.5"
          />
          {/* Ermine Cross */}
          <line x1="100" y1="32" x2="100" y2="180" strokeWidth="14" stroke="currentColor" strokeOpacity="0.15" />
          <line x1="38" y1="96" x2="162" y2="96" strokeWidth="14" stroke="currentColor" strokeOpacity="0.15" />
          <line x1="100" y1="32" x2="100" y2="180" strokeWidth="2" />
          <line x1="38" y1="96" x2="162" y2="96" strokeWidth="2" />

          {/* 4 Lions in Quadrants */}
          <g fill="currentColor" fillOpacity="0.25" stroke="none">
            {/* Lion Q1 */}
            <circle cx="68" cy="62" r="9" />
            <path d="M56 70 C60 66 76 66 80 70 L78 78 L58 78 Z" />
            {/* Lion Q2 */}
            <circle cx="132" cy="62" r="9" />
            <path d="M120 70 C124 66 140 66 144 70 L142 78 L122 78 Z" />
            {/* Lion Q3 */}
            <circle cx="68" cy="122" r="9" />
            <path d="M56 130 C60 126 76 126 80 130 L78 138 L58 138 Z" />
            {/* Lion Q4 */}
            <circle cx="132" cy="122" r="9" />
            <path d="M120 130 C124 126 140 126 144 130 L142 138 L122 138 Z" />
          </g>

          {/* Central Closed Book with clasps */}
          <rect x="85" y="81" width="30" height="30" rx="3" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />
          <circle cx="100" cy="96" r="5" fill="currentColor" fillOpacity="0.5" stroke="none" />

          <text x="100" y="194" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">CAMBRIDGE · 1209</text>
        </g>
      );

    case 'stanford-redwood':
      return (
        <g stroke="currentColor" strokeWidth="2" fill="none">
          {/* Stanford Roundel Seal */}
          <circle cx="100" cy="96" r="76" strokeWidth="3" fill="currentColor" fillOpacity="0.08" />
          <circle cx="100" cy="96" r="68" strokeWidth="1.5" strokeDasharray="4 3" />
          <circle cx="100" cy="96" r="56" strokeWidth="2" fill="currentColor" fillOpacity="0.06" />

          {/* El Palo Alto Redwood Tree */}
          <path
            d="M100 48 L106 60 L102 60 L110 74 L105 74 L115 92 L108 92 L118 114 L104 114 L104 132 L96 132 L96 114 L82 114 L92 92 L85 92 L95 74 L90 74 L98 60 L94 60 Z"
            fill="currentColor"
            fillOpacity="0.3"
            strokeWidth="2"
          />
          {/* Roots / Mount */}
          <path d="M78 132 C90 128 110 128 122 132" strokeWidth="2.5" />

          <text x="100" y="152" fontSize="7" fontWeight="800" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1">DIE LUFT DER FREIHEIT WEHT</text>
          <text x="100" y="192" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">STANFORD · 1891</text>
        </g>
      );

    case 'mit-scholar-anvil':
      return (
        <g stroke="currentColor" strokeWidth="2" fill="none">
          {/* MIT Academic Roundel / Shield */}
          <circle cx="100" cy="94" r="74" strokeWidth="3" fill="currentColor" fillOpacity="0.08" />
          <circle cx="100" cy="94" r="66" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Central Pedestal with 3 volumes (Science, Tech, Art) */}
          <rect x="74" y="82" width="52" height="34" rx="2" fill="currentColor" fillOpacity="0.18" strokeWidth="2" />
          <line x1="74" y1="93" x2="126" y2="93" strokeWidth="1.5" />
          <line x1="74" y1="104" x2="126" y2="104" strokeWidth="1.5" />

          {/* Left Scholar Figure Silhouette */}
          <circle cx="56" cy="70" r="8" fill="currentColor" fillOpacity="0.3" stroke="none" />
          <path d="M46 116 L50 82 C54 78 60 78 64 82 L66 116 Z" fill="currentColor" fillOpacity="0.25" stroke="none" />

          {/* Right Artisan Figure with Hammer & Anvil */}
          <circle cx="144" cy="70" r="8" fill="currentColor" fillOpacity="0.3" stroke="none" />
          <path d="M134 116 L136 82 C140 78 146 78 150 82 L154 116 Z" fill="currentColor" fillOpacity="0.25" stroke="none" />
          <rect x="138" y="96" width="18" height="10" rx="1" fill="currentColor" fillOpacity="0.4" stroke="none" />

          {/* Banner: Mens et Manus */}
          <path d="M60 134 H140 L134 144 H66 Z" fill="currentColor" fillOpacity="0.2" strokeWidth="1.5" />
          <text x="100" y="141" fontSize="7.5" fontWeight="900" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1">MENS ET MANUS</text>
          <text x="100" y="190" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">MIT · 1861</text>
        </g>
      );

    case 'columbia-three-crowns':
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* Columbia King's College Shield */}
          <path
            d="M36 32 H164 V112 C164 152 100 182 100 182 C100 182 36 152 36 112 Z"
            fill="currentColor"
            fillOpacity="0.12"
            strokeWidth="3.5"
          />
          {/* Crown 1 (Top Left) */}
          <path d="M56 64 L64 48 L73 58 L82 48 L90 64 Z" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />
          <rect x="56" y="64" width="34" height="6" rx="1" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />

          {/* Crown 2 (Top Right) */}
          <path d="M110 64 L118 48 L127 58 L136 48 L144 64 Z" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />
          <rect x="110" y="64" width="34" height="6" rx="1" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />

          {/* Crown 3 (Bottom Center) */}
          <path d="M83 116 L91 100 L100 110 L109 100 L117 116 Z" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />
          <rect x="83" y="116" width="34" height="6" rx="1" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />

          <text x="100" y="154" fontSize="7.5" fontWeight="800" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1">IN LUMINE TUO</text>
          <text x="100" y="194" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">COLUMBIA · 1754</text>
        </g>
      );

    case 'yale-lux-veritas':
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* Yale Shield */}
          <path
            d="M38 32 H162 V112 C162 152 100 182 100 182 C100 182 38 152 38 112 Z"
            fill="currentColor"
            fillOpacity="0.14"
            strokeWidth="3.5"
          />
          {/* Central Open Book */}
          <rect x="58" y="60" width="84" height="52" rx="3" fill="currentColor" fillOpacity="0.22" strokeWidth="2.5" />
          <line x1="100" y1="60" x2="100" y2="112" strokeWidth="2" />
          {/* Hebrew Urim & Thummim Lines */}
          <line x1="68" y1="74" x2="92" y2="74" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="68" y1="84" x2="92" y2="84" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="68" y1="94" x2="90" y2="94" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="108" y1="74" x2="132" y2="74" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="108" y1="84" x2="132" y2="84" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="108" y1="94" x2="130" y2="94" strokeWidth="2" strokeDasharray="3 2" />

          {/* Banner: LUX ET VERITAS */}
          <path d="M52 136 H148 L142 148 H58 Z" fill="currentColor" fillOpacity="0.2" strokeWidth="1.5" />
          <text x="100" y="145" fontSize="8.5" fontWeight="900" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">LUX ET VERITAS</text>
          <text x="100" y="194" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">YALE · 1701</text>
        </g>
      );

    case 'princeton-bible-chevron':
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* Princeton Shield */}
          <path
            d="M38 32 H162 V112 C162 152 100 182 100 182 C100 182 38 152 38 112 Z"
            fill="currentColor"
            fillOpacity="0.12"
            strokeWidth="3.5"
          />
          {/* Chevron */}
          <path d="M40 106 L100 70 L160 106" strokeWidth="10" stroke="currentColor" strokeOpacity="0.2" />
          <path d="M40 106 L100 70 L160 106" strokeWidth="2" />

          {/* Open Bible at top */}
          <rect x="76" y="44" width="48" height="32" rx="2" fill="currentColor" fillOpacity="0.24" strokeWidth="2" />
          <line x1="100" y1="44" x2="100" y2="76" strokeWidth="1.5" />
          <line x1="82" y1="54" x2="94" y2="54" strokeWidth="1.5" />
          <line x1="82" y1="62" x2="94" y2="62" strokeWidth="1.5" />
          <line x1="106" y1="54" x2="118" y2="54" strokeWidth="1.5" />
          <line x1="106" y1="62" x2="118" y2="62" strokeWidth="1.5" />

          <text x="100" y="146" fontSize="7.5" fontWeight="800" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1">DEI SUB NUMINE VIGET</text>
          <text x="100" y="194" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">PRINCETON · 1746</text>
        </g>
      );

    case 'toronto-crown-beaver':
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* Toronto Shield */}
          <path
            d="M38 32 H162 V112 C162 152 100 182 100 182 C100 182 38 152 38 112 Z"
            fill="currentColor"
            fillOpacity="0.12"
            strokeWidth="3.5"
          />
          {/* Imperial Crown on top */}
          <path d="M78 54 L85 42 L100 50 L115 42 L122 54 Z" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />
          <rect x="78" y="54" width="44" height="6" rx="1" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />

          {/* Canadian Beaver on Log in center */}
          <path
            d="M74 86 C74 76 96 74 116 78 C124 80 128 86 128 92 C128 98 120 100 112 100 L74 100 Z"
            fill="currentColor"
            fillOpacity="0.26"
            strokeWidth="2"
          />
          {/* Flat Tail */}
          <path d="M64 92 C64 86 74 86 74 94 C74 100 64 100 64 92 Z" fill="currentColor" fillOpacity="0.3" />

          {/* Two Open Books at base */}
          <rect x="62" y="112" width="32" height="22" rx="2" fill="currentColor" fillOpacity="0.2" strokeWidth="1.5" />
          <rect x="106" y="112" width="32" height="22" rx="2" fill="currentColor" fillOpacity="0.2" strokeWidth="1.5" />

          <text x="100" y="156" fontSize="8" fontWeight="800" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1">VELUT ARBOR AEVO</text>
          <text x="100" y="194" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">TORONTO · 1827</text>
        </g>
      );

    case 'mcgill-martlets':
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* McGill Shield */}
          <path
            d="M38 32 H162 V112 C162 152 100 182 100 182 C100 182 38 152 38 112 Z"
            fill="currentColor"
            fillOpacity="0.12"
            strokeWidth="3.5"
          />
          {/* Royal Crown top center */}
          <path d="M82 52 L90 40 L100 48 L110 40 L118 52 Z" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />
          <rect x="82" y="52" width="36" height="5" rx="1" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />

          {/* 3 Martlets (Mythical footless birds in flight) */}
          <g fill="currentColor" fillOpacity="0.28" stroke="none">
            {/* Martlet 1 */}
            <path d="M60 76 C66 70 76 72 82 78 C76 82 66 84 60 76 Z" />
            <circle cx="80" cy="74" r="3" />
            {/* Martlet 2 */}
            <path d="M118 76 C124 70 134 72 140 78 C134 82 124 84 118 76 Z" />
            <circle cx="138" cy="74" r="3" />
            {/* Martlet 3 */}
            <path d="M88 112 C94 106 104 108 110 114 C104 118 94 120 88 112 Z" />
            <circle cx="108" cy="110" r="3" />
          </g>

          <text x="100" y="152" fontSize="7" fontWeight="800" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1">GRANDESCUNT AUCTA LABORE</text>
          <text x="100" y="194" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">MCGILL · 1821</text>
        </g>
      );

    case 'tsinghua-star-roundel':
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* Tsinghua Circular Seal */}
          <circle cx="100" cy="96" r="74" strokeWidth="3" fill="currentColor" fillOpacity="0.08" />
          <circle cx="100" cy="96" r="66" strokeWidth="1.5" />
          <circle cx="100" cy="96" r="48" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />

          {/* Central 5-pointed star */}
          <polygon
            points="100,64 109,84 130,84 113,97 120,118 100,105 80,118 87,97 70,84 91,84"
            fill="currentColor"
            fillOpacity="0.32"
            strokeWidth="2"
          />

          <text x="100" y="132" fontSize="8.5" fontWeight="900" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="2">TSINGHUA</text>
          <text x="100" y="158" fontSize="7" fontWeight="800" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1">自强不息 厚德载物</text>
          <text x="100" y="192" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">1911</text>
        </g>
      );

    case 'peking-seal':
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* Peking University Lu Xun Seal */}
          <circle cx="100" cy="96" r="74" strokeWidth="3.5" fill="currentColor" fillOpacity="0.08" />
          <circle cx="100" cy="96" r="66" strokeWidth="1.5" />

          {/* Lu Xun Calligraphic Dual Figures "北大" */}
          <circle cx="100" cy="62" r="9" fill="currentColor" fillOpacity="0.35" stroke="none" />
          <path d="M84 76 C94 72 106 72 116 76 L112 120 C104 126 96 126 88 120 Z" fill="currentColor" fillOpacity="0.25" strokeWidth="2" />
          <line x1="72" y1="92" x2="128" y2="92" strokeWidth="4" />
          <line x1="80" y1="126" x2="120" y2="126" strokeWidth="3" />

          <text x="100" y="152" fontSize="8.5" fontWeight="900" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="2">PEKING UNIVERSITY</text>
          <text x="100" y="192" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">BEIDA · 1898</text>
        </g>
      );

    case 'nus-lion-sunburst':
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* NUS Shield */}
          <path
            d="M38 32 H162 V112 C162 152 100 182 100 182 C100 182 38 152 38 112 Z"
            fill="currentColor"
            fillOpacity="0.12"
            strokeWidth="3.5"
          />
          {/* Radiant Sunburst top */}
          <circle cx="100" cy="58" r="14" fill="currentColor" fillOpacity="0.35" strokeWidth="2" />
          <path d="M100 36 V42 M100 74 V80 M78 58 H84 M116 58 H122 M84 42 L89 47 M116 74 L111 69 M84 74 L89 69 M116 42 L111 47" strokeWidth="2" />

          {/* Open 3 Books Pages & Lion Silhouette */}
          <rect x="68" y="90" width="64" height="34" rx="2" fill="currentColor" fillOpacity="0.2" strokeWidth="2" />
          <line x1="100" y1="90" x2="100" y2="124" strokeWidth="2" />
          <path d="M86 98 L94 104 L86 110" strokeWidth="1.5" />
          <path d="M114 98 L106 104 L114 110" strokeWidth="1.5" />

          <text x="100" y="150" fontSize="9" fontWeight="900" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="2">NUS</text>
          <text x="100" y="194" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">SINGAPORE · 1905</text>
        </g>
      );

    case 'tokyo-ginkgo':
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* Tokyo Ginkgo Emblem Roundel */}
          <circle cx="100" cy="96" r="74" strokeWidth="3" fill="currentColor" fillOpacity="0.08" />

          {/* Left Ginkgo Leaf */}
          <path
            d="M96 110 C86 92 68 84 62 66 C72 58 88 64 96 82 Z"
            fill="currentColor"
            fillOpacity="0.3"
            strokeWidth="2"
          />
          <line x1="96" y1="110" x2="74" y2="70" strokeWidth="1.5" />

          {/* Right Ginkgo Leaf */}
          <path
            d="M104 110 C114 92 132 84 138 66 C128 58 112 64 104 82 Z"
            fill="currentColor"
            fillOpacity="0.38"
            strokeWidth="2"
          />
          <line x1="104" y1="110" x2="126" y2="70" strokeWidth="1.5" />

          <text x="100" y="146" fontSize="8" fontWeight="900" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">THE UNIVERSITY OF TOKYO</text>
          <text x="100" y="192" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">UTOKYO · 1877</text>
        </g>
      );

    case 'eth-geometric':
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* Swiss Modernist Octagon / Geometric Seal */}
          <polygon
            points="70,36 130,36 164,70 164,130 130,164 70,164 36,130 36,70"
            fill="currentColor"
            fillOpacity="0.1"
            strokeWidth="3.5"
          />
          <polygon
            points="74,42 126,42 158,74 158,126 126,158 74,158 42,126 42,74"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Swiss Cross */}
          <path
            d="M92 66 H108 V86 H128 V102 H108 V122 H92 V102 H72 V86 H92 Z"
            fill="currentColor"
            fillOpacity="0.35"
            strokeWidth="2"
          />

          <text x="100" y="148" fontSize="9" fontWeight="900" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="2">ETH ZÜRICH</text>
          <text x="100" y="192" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">1855</text>
        </g>
      );

    case 'tum-towers':
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* TUM Munich Twin Towers & Bridge Crest */}
          <circle cx="100" cy="96" r="74" strokeWidth="3" fill="currentColor" fillOpacity="0.08" />
          <rect x="52" y="60" width="18" height="66" rx="2" fill="currentColor" fillOpacity="0.32" strokeWidth="2" />
          <rect x="80" y="46" width="18" height="80" rx="2" fill="currentColor" fillOpacity="0.32" strokeWidth="2" />
          <rect x="108" y="46" width="18" height="80" rx="2" fill="currentColor" fillOpacity="0.32" strokeWidth="2" />
          <rect x="136" y="60" width="18" height="66" rx="2" fill="currentColor" fillOpacity="0.32" strokeWidth="2" />
          {/* Horizontal Connecting Bridge */}
          <rect x="46" y="96" width="114" height="14" rx="2" fill="currentColor" fillOpacity="0.45" strokeWidth="2" />

          <text x="100" y="148" fontSize="9" fontWeight="900" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="2">TUM</text>
          <text x="100" y="192" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">MÜNCHEN · 1868</text>
        </g>
      );

    case 'melbourne-victory':
    case 'sydney-lion-cross':
    case 'general-shield-lion':
    case 'general-shield-books':
    case 'general-shield-tree':
    case 'general-tech-gear':
    case 'general-seal-roundel':
    default:
      return (
        <g stroke="currentColor" strokeWidth="2.5" fill="none">
          {/* Classical Noble Collegiate Shield */}
          <path
            d="M38 32 H162 V112 C162 152 100 182 100 182 C100 182 38 152 38 112 Z"
            fill="currentColor"
            fillOpacity="0.12"
            strokeWidth="3.5"
          />
          <path
            d="M48 40 H152 V108 C152 142 100 168 100 168 C100 168 48 142 48 108 Z"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Central Open Book & Laurel of Scholarship */}
          <rect x="64" y="66" width="72" height="44" rx="3" fill="currentColor" fillOpacity="0.22" strokeWidth="2" />
          <line x1="100" y1="66" x2="100" y2="110" strokeWidth="2" />
          <line x1="74" y1="78" x2="92" y2="78" strokeWidth="1.5" />
          <line x1="74" y1="88" x2="92" y2="88" strokeWidth="1.5" />
          <line x1="74" y1="98" x2="90" y2="98" strokeWidth="1.5" />
          <line x1="108" y1="78" x2="126" y2="78" strokeWidth="1.5" />
          <line x1="108" y1="88" x2="126" y2="88" strokeWidth="1.5" />
          <line x1="108" y1="98" x2="124" y2="98" strokeWidth="1.5" />

          {/* Torch / Star on top */}
          <polygon points="100,42 104,50 112,50 106,56 108,64 100,59 92,64 94,56 88,50 96,50" fill="currentColor" fillOpacity="0.4" stroke="none" />

          {/* Collegiate Abbreviation Banner */}
          <text x="100" y="146" fontSize="8.5" fontWeight="900" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">
            {program.universityAbbr.toUpperCase()}
          </text>
          <text x="100" y="194" fontSize="8" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none" letterSpacing="1.5">
            {established ? `EST. ${established}` : program.country.toUpperCase()}
          </text>
        </g>
      );
  }
}
