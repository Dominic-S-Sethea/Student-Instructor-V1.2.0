import React from 'react';
import {
  Filter,
  RotateCcw,
  X,
  Globe,
  GraduationCap,
  Award,
  DollarSign,
  Building2,
  Sparkles,
  Check,
  ChevronDown
} from 'lucide-react';
import {
  TopUniversityRegion,
  DegreeLevelOption,
  FellowshipType,
  ApplicationMechanism
} from '../../types/topUniversityScholarships';
import { REGION_LABELS } from '../../data/topUniversities';

export interface TopUniversityFiltersState {
  region: TopUniversityRegion | 'ALL';
  rankTier: 'ALL' | 'top10' | 'top25' | 'top50' | 'top100' | 'top200';
  degree: DegreeLevelOption | 'ALL';
  fellowshipType: FellowshipType | 'ALL';
  coverage: string;
  mechanism: ApplicationMechanism | 'ALL';
  consortium: string;
  minValueUSD: number;
}

interface TopUniversityFiltersSidebarProps {
  filters: TopUniversityFiltersState;
  onFilterChange: <K extends keyof TopUniversityFiltersState>(
    key: K,
    value: TopUniversityFiltersState[K]
  ) => void;
  onReset: () => void;
  activeFilterCount: number;
  totalResultsCount: number;
  totalProgramsCount: number;
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

export const TopUniversityFiltersSidebar: React.FC<TopUniversityFiltersSidebarProps> = ({
  filters,
  onFilterChange,
  onReset,
  activeFilterCount,
  totalResultsCount,
  totalProgramsCount,
  onCloseMobile,
  isMobile = false
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-6 ${
        isMobile ? 'max-h-[85vh] overflow-y-auto' : 'sticky top-20'
      }`}
      id="top-university-filter-criteria-panel"
    >
      {/* Header: Title, Active Count Badge & Reset */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center">
            <Filter className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm tracking-tight">
                Filter Criteria
              </span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10.5px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Narrow {totalProgramsCount} institutions by institutional factors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-50 transition cursor-pointer"
              title="Reset all criteria"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* FACTOR 1: Global Ranking Tier (QS / THE League) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Global Ranking Benchmark</span>
          </label>
          <span className="text-[10.5px] font-semibold text-slate-400">QS / THE</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'ALL', label: 'All Global Ranks' },
            { id: 'top10', label: 'Global Top 10' },
            { id: 'top25', label: 'Global Top 25' },
            { id: 'top50', label: 'Global Top 50' },
            { id: 'top100', label: 'Global Top 100' },
            { id: 'top200', label: 'Global Top 200' }
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() =>
                onFilterChange(
                  'rankTier',
                  tier.id as TopUniversityFiltersState['rankTier']
                )
              }
              className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                filters.rankTier === tier.id
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs font-bold'
                  : 'bg-slate-50/80 text-slate-700 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* FACTOR 2: Target Degree Level */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
          <span>Degree & Academic Level</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'ALL', label: 'All Degrees' },
            { id: 'Undergraduate', label: 'Undergraduate' },
            { id: 'Master', label: 'Master’s' },
            { id: 'PhD', label: 'PhD / Doctoral' },
            { id: 'MBA', label: 'MBA & Exec' }
          ].map((deg) => (
            <button
              key={deg.id}
              onClick={() =>
                onFilterChange(
                  'degree',
                  deg.id as TopUniversityFiltersState['degree']
                )
              }
              className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                filters.degree === deg.id
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs font-bold'
                  : 'bg-slate-50/80 text-slate-700 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {deg.label}
            </button>
          ))}
        </div>
      </div>

      {/* FACTOR 3: Destination Hub / Region */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Destination Region / Hub</span>
        </label>
        <div className="relative">
          <select
            value={filters.region}
            onChange={(e) =>
              onFilterChange(
                'region',
                e.target.value as TopUniversityFiltersState['region']
              )
            }
            className="w-full text-xs font-semibold rounded-xl border border-slate-300 p-2.5 pr-8 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All 11 Global Hubs (Worldwide)</option>
            <option value="USA">🇺🇸 United States (Ivy League & Top 20)</option>
            <option value="UK">🇬🇧 United Kingdom (Oxbridge, Imperial, UCL, LSE)</option>
            <option value="Canada">🇨🇦 Canada (U15 Research Powerhouses)</option>
            <option value="China">🇨🇳 China (C9 League & Elite Flagships)</option>
            <option value="Hong Kong">🇭🇰 Hong Kong (Top 5 HKpPS & UGC)</option>
            <option value="South Korea">🇰🇷 South Korea (SKY & Tech Titans)</option>
            <option value="Australia">🇦🇺 Australia (Group of Eight Go8)</option>
            <option value="Europe">🇪🇺 Europe (ETH Zurich, EPFL, TUM, Sorbonne)</option>
            <option value="India">🇮🇳 India (IIT & IISc Apex INIs)</option>
            <option value="Singapore">🇸🇬 Singapore (NUS, NTU, SMU)</option>
            <option value="Japan">🇯🇵 Japan (Tokyo, Kyoto, MEXT)</option>
          </select>
        </div>
      </div>

      {/* FACTOR 4: Fellowship & Aid Model */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fellowship & Funding Model</span>
        </label>
        <div className="space-y-1.5">
          {[
            { id: 'ALL', label: 'All Funding Models' },
            {
              id: 'Need-Based Full Aid',
              label: '100% Need-Based Aid (No Loans)'
            },
            {
              id: 'Competitive Presidential Fellowship',
              label: 'Presidential & Flagship Fellowships'
            },
            {
              id: 'Merit Fellowship',
              label: 'Merit & Leadership Honors'
            },
            {
              id: 'Research/Teaching Assistantship',
              label: 'Graduate Assistantships (RA/TA)'
            },
            {
              id: 'Government-University Partnership',
              label: 'Bilateral & University Nominations'
            }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() =>
                onFilterChange(
                  'fellowshipType',
                  type.id as TopUniversityFiltersState['fellowshipType']
                )
              }
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center justify-between cursor-pointer ${
                filters.fellowshipType === type.id
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-400 font-bold'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span className="line-clamp-1">{type.label}</span>
              {filters.fellowshipType === type.id && (
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* FACTOR 5: Funding Coverage Generosity */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Funding Coverage Scope</span>
        </label>
        <div className="space-y-1.5">
          {[
            { id: 'ALL', label: 'All Coverage Scopes' },
            {
              id: '100% Full',
              label: '100% Full Ride (Tuition + Living + Airfare)'
            },
            {
              id: 'Need-Met',
              label: '100% Demonstrated Need-Met (US Model)'
            },
            {
              id: 'Waiver',
              label: 'Full Tuition Waiver + Health'
            },
            {
              id: 'Substantial',
              label: 'Substantial Honors & Research Fellowships'
            }
          ].map((cov) => (
            <button
              key={cov.id}
              onClick={() => onFilterChange('coverage', cov.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center justify-between cursor-pointer ${
                filters.coverage === cov.id
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-400 font-bold'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span className="line-clamp-1">{cov.label}</span>
              {filters.coverage === cov.id && (
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* FACTOR 6: Application Mechanism */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Application Mechanism</span>
        </label>
        <div className="space-y-1.5">
          {[
            { id: 'ALL', label: 'All Application Methods' },
            {
              id: 'Automatic with Admission',
              label: 'Automatic with Admission (No Extra Form)'
            },
            {
              id: 'CSS Profile / Financial Aid App',
              label: 'CSS Profile / Financial Aid Form'
            },
            {
              id: 'Separate Fellowship App',
              label: 'Dedicated Fellowship Application'
            },
            {
              id: 'Direct University Nomination',
              label: 'Faculty / University Nomination'
            }
          ].map((mech) => (
            <button
              key={mech.id}
              onClick={() =>
                onFilterChange(
                  'mechanism',
                  mech.id as TopUniversityFiltersState['mechanism']
                )
              }
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center justify-between cursor-pointer ${
                filters.mechanism === mech.id
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-400 font-bold'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span className="line-clamp-1">{mech.label}</span>
              {filters.mechanism === mech.id && (
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* FACTOR 7: Institutional League / Consortium */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Prestige League & Alliance</span>
        </label>
        <select
          value={filters.consortium}
          onChange={(e) => onFilterChange('consortium', e.target.value)}
          className="w-full text-xs font-semibold rounded-xl border border-slate-300 p-2.5 pr-8 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
        >
          <option value="ALL">All Institutional Alliances</option>
          <option value="ivy">Ivy League & US Top Tier</option>
          <option value="g5">UK G5 & Golden Triangle (Oxford, Cambridge, Imperial, UCL, LSE)</option>
          <option value="c9">C9 League (China Top 9)</option>
          <option value="go8">Group of Eight (Go8 Australia)</option>
          <option value="sky">SKY & Tech Titans (South Korea)</option>
          <option value="ini">Institutes of National Importance (IIT / IISc India)</option>
          <option value="u15">U15 Research Powerhouses (Canada)</option>
          <option value="euro">European Continental Apex (ETH, EPFL, TUM, PSL)</option>
        </select>
      </div>

      {/* FACTOR 8: Minimum Estimated Annual Aid Value (USD) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Minimum Annual Value (USD)</span>
          </label>
          <span className="text-xs font-bold text-emerald-700">
            {filters.minValueUSD === 0
              ? 'Any Amount'
              : `$${filters.minValueUSD.toLocaleString()}+/yr`}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[0, 40000, 60000, 80000].map((val) => (
            <button
              key={val}
              onClick={() => onFilterChange('minValueUSD', val)}
              className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold text-center border transition cursor-pointer ${
                filters.minValueUSD === val
                  ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {val === 0 ? 'Any' : `$${val / 1000}k+`}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Summary & Mobile Apply Button */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-600">
          Matches:{' '}
          <span className="font-extrabold text-slate-900">
            {totalResultsCount}
          </span>{' '}
          of {totalProgramsCount}
        </div>
        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-sm hover:bg-emerald-800 transition cursor-pointer"
          >
            Show Results ({totalResultsCount})
          </button>
        )}
      </div>
    </div>
  );
};
