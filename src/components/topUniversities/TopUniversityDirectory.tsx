import React, { useState, useMemo, useRef, useEffect } from 'react';
import { allTopUniversityPrograms, REGION_LABELS } from '../../data/topUniversities';
import {
  TopUniversityAidProgram,
  TopUniversityRegion,
  DegreeLevelOption,
  FellowshipType,
  ApplicationMechanism
} from '../../types/topUniversityScholarships';
import { TopUniversityDossierModal } from './TopUniversityDossierModal';
import { UniversityCrestWatermark } from './UniversityCrestWatermark';
import {
  TopUniversityFiltersSidebar,
  TopUniversityFiltersState
} from './TopUniversityFiltersSidebar';
import {
  Search,
  Award,
  DollarSign,
  GraduationCap,
  Calendar,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  MoveHorizontal,
  Sparkles,
  HelpCircle,
  Filter,
  CheckCircle,
  Building2,
  MapPin,
  Globe,
  SlidersHorizontal,
  RotateCcw,
  X,
  ArrowUpDown,
  CheckCircle2
} from 'lucide-react';

const getRankingTierBadge = (qs: number | string) => {
  const rank = typeof qs === 'number' ? qs : parseInt(String(qs), 10);
  if (isNaN(rank)) return { label: 'Global Elite', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  if (rank <= 10) return { label: 'Global Top 10', color: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold' };
  if (rank <= 25) return { label: 'Global Top 25', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' };
  if (rank <= 50) return { label: 'Global Top 50', color: 'bg-blue-100 text-blue-900 border-blue-300 font-bold' };
  if (rank <= 100) return { label: 'Global Top 100', color: 'bg-indigo-50 text-indigo-900 border-indigo-200 font-semibold' };
  if (rank <= 200) return { label: 'Global Top 200', color: 'bg-slate-100 text-slate-800 border-slate-200 font-semibold' };
  return { label: 'National Apex INI', color: 'bg-slate-100 text-slate-700 border-slate-200 font-medium' };
};

export const TopUniversityDirectory: React.FC = () => {
  // Filter state based on institutional components/factors
  const [filters, setFilters] = useState<TopUniversityFiltersState>({
    region: 'ALL',
    rankTier: 'ALL',
    degree: 'ALL',
    fellowshipType: 'ALL',
    coverage: 'ALL',
    mechanism: 'ALL',
    consortium: 'ALL',
    minValueUSD: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'qs_rank' | 'the_rank' | 'highest_value' | 'name_asc'>('qs_rank');
  const [selectedProgram, setSelectedProgram] = useState<TopUniversityAidProgram | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const [showFiltersSidebar, setShowFiltersSidebar] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Region tabs horizontal scroll and drag state
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);
  const didDragRef = useRef(false);

  const checkScrollBounds = () => {
    if (!tabsScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsScrollRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  };

  useEffect(() => {
    checkScrollBounds();
    const handleResize = () => checkScrollBounds();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScrollLeft = () => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tabsScrollRef.current) return;
    setIsDragging(true);
    didDragRef.current = false;
    dragStartXRef.current = e.pageX - tabsScrollRef.current.offsetLeft;
    dragScrollLeftRef.current = tabsScrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tabsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsScrollRef.current.offsetLeft;
    const walk = x - dragStartXRef.current;
    if (Math.abs(walk) > 4) {
      didDragRef.current = true;
    }
    tabsScrollRef.current.scrollLeft = dragScrollLeftRef.current - walk;
    checkScrollBounds();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => {
      didDragRef.current = false;
    }, 50);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setTimeout(() => {
        didDragRef.current = false;
      }, 50);
    }
  };

  const handleFilterChange = <K extends keyof TopUniversityFiltersState>(
    key: K,
    value: TopUniversityFiltersState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      region: 'ALL',
      rankTier: 'ALL',
      degree: 'ALL',
      fellowshipType: 'ALL',
      coverage: 'ALL',
      mechanism: 'ALL',
      consortium: 'ALL',
      minValueUSD: 0
    });
    setSearchQuery('');
    setSortBy('qs_rank');
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.region !== 'ALL') count++;
    if (filters.rankTier !== 'ALL') count++;
    if (filters.degree !== 'ALL') count++;
    if (filters.fellowshipType !== 'ALL') count++;
    if (filters.coverage !== 'ALL') count++;
    if (filters.mechanism !== 'ALL') count++;
    if (filters.consortium !== 'ALL') count++;
    if (filters.minValueUSD > 0) count++;
    if (searchQuery.trim() !== '') count++;
    return count;
  }, [filters, searchQuery]);

  // Filter & Sort logic based on all institutional components/factors
  const filteredPrograms = useMemo(() => {
    const list = allTopUniversityPrograms.filter((prog) => {
      // 1. Region Factor
      if (filters.region !== 'ALL' && prog.region !== filters.region) {
        return false;
      }

      // 2. Global Ranking Tier Factor
      if (filters.rankTier !== 'ALL') {
        const qs = typeof prog.qsWorldRank === 'number' ? prog.qsWorldRank : parseInt(String(prog.qsWorldRank), 10);
        if (isNaN(qs)) {
          if (filters.rankTier !== 'top200') return false;
        } else {
          if (filters.rankTier === 'top10' && qs > 10) return false;
          if (filters.rankTier === 'top25' && qs > 25) return false;
          if (filters.rankTier === 'top50' && qs > 50) return false;
          if (filters.rankTier === 'top100' && qs > 100) return false;
          if (filters.rankTier === 'top200' && qs > 200) return false;
        }
      }

      // 3. Degree Level Factor
      if (filters.degree !== 'ALL' && !prog.degreeLevels.includes(filters.degree)) {
        return false;
      }

      // 4. Fellowship & Funding Model Factor
      if (filters.fellowshipType !== 'ALL' && prog.fellowshipType !== filters.fellowshipType) {
        return false;
      }

      // 5. Funding Coverage Scope Factor
      if (filters.coverage !== 'ALL') {
        if (filters.coverage === '100% Full' && !prog.fundingCoverage.includes('100% Full')) return false;
        if (filters.coverage === 'Need-Met' && !prog.fundingCoverage.includes('Need-Met')) return false;
        if (filters.coverage === 'Waiver' && !prog.fundingCoverage.includes('Waiver')) return false;
        if (filters.coverage === 'Substantial' && !prog.fundingCoverage.includes('Substantial') && !prog.fundingCoverage.includes('Waiver')) return false;
      }

      // 6. Application Mechanism Factor
      if (filters.mechanism !== 'ALL' && prog.applicationMechanism !== filters.mechanism) {
        return false;
      }

      // 7. Institutional League / Consortium Factor
      if (filters.consortium !== 'ALL') {
        const b = prog.badge.toLowerCase();
        if (filters.consortium === 'ivy' && !b.includes('ivy')) return false;
        if (filters.consortium === 'g5' && prog.region !== 'UK' && !b.includes('g5') && !b.includes('oxbridge')) return false;
        if (filters.consortium === 'c9' && !prog.badge.includes('C9')) return false;
        if (filters.consortium === 'go8' && !b.includes('group of eight') && !b.includes('go8')) return false;
        if (filters.consortium === 'sky' && !b.includes('sky') && prog.region !== 'South Korea') return false;
        if (filters.consortium === 'ini' && !b.includes('ini') && !b.includes('iit') && !b.includes('nirf')) return false;
        if (filters.consortium === 'u15' && !b.includes('u15') && prog.region !== 'Canada') return false;
        if (filters.consortium === 'euro' && prog.region !== 'Europe' && !b.includes('euro')) return false;
      }

      // 8. Minimum Estimated Annual Value (USD)
      if (filters.minValueUSD > 0 && prog.estimatedAnnualValueUSD < filters.minValueUSD) {
        return false;
      }

      // 9. Instant Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = prog.universityName.toLowerCase().includes(query);
        const matchAbbr = prog.universityAbbr.toLowerCase().includes(query);
        const matchFellowship = prog.fellowshipName.toLowerCase().includes(query);
        const matchCity = prog.city.toLowerCase().includes(query);
        const matchCountry = prog.country.toLowerCase().includes(query);
        const matchBadge = prog.badge.toLowerCase().includes(query);
        const matchHighlights = prog.keyHighlights.some((h) => h.toLowerCase().includes(query));

        if (!matchName && !matchAbbr && !matchFellowship && !matchCity && !matchCountry && !matchBadge && !matchHighlights) {
          return false;
        }
      }

      return true;
    });

    // Sort order
    return list.sort((a, b) => {
      if (sortBy === 'qs_rank') {
        const rankA = typeof a.qsWorldRank === 'number' ? a.qsWorldRank : parseInt(String(a.qsWorldRank), 10);
        const rankB = typeof b.qsWorldRank === 'number' ? b.qsWorldRank : parseInt(String(b.qsWorldRank), 10);
        const valA = isNaN(rankA) ? 9999 : rankA;
        const valB = isNaN(rankB) ? 9999 : rankB;
        return valA - valB;
      }
      if (sortBy === 'the_rank') {
        const rankA = typeof a.theWorldRank === 'number' ? a.theWorldRank : parseInt(String(a.theWorldRank), 10);
        const rankB = typeof b.theWorldRank === 'number' ? b.theWorldRank : parseInt(String(b.theWorldRank), 10);
        const valA = isNaN(rankA) ? 9999 : rankA;
        const valB = isNaN(rankB) ? 9999 : rankB;
        return valA - valB;
      }
      if (sortBy === 'highest_value') {
        return b.estimatedAnnualValueUSD - a.estimatedAnnualValueUSD;
      }
      if (sortBy === 'name_asc') {
        return a.universityName.localeCompare(b.universityName);
      }
      return 0;
    });
  }, [filters, searchQuery, sortBy]);

  const regionTabs: (TopUniversityRegion | 'ALL')[] = [
    'ALL',
    'USA',
    'UK',
    'Canada',
    'China',
    'Hong Kong',
    'South Korea',
    'Australia',
    'Europe',
    'India',
    'Singapore',
    'Japan'
  ];

  return (
    <div className="space-y-6" id="top-university-directory-section">
      {/* Sub-Header / Intro Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-700/60">
                Direct Institutional Aid
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {allTopUniversityPrograms.length} Elite Universities Across 11 Global Hubs
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Top Global University Fellowships &amp; Financial Aid Directory
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Explore direct institutional fellowships, 100% need-based financial aid, and endowed graduate assistantships from top-tier universities worldwide for Cambodian and international scholars.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowExplainer(!showExplainer)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition shrink-0 self-start lg:self-auto cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>{showExplainer ? 'Hide Funding Guide' : 'How Top University Aid Works'}</span>
          </button>
        </div>

        {/* Expandable Educational Funding Guide */}
        {showExplainer && (
          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                1. Need-Based Financial Aid (US Elite)
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Institutions like Harvard, Princeton, MIT, Yale, and Columbia determine aid via your family's economic standing (CSS Profile). If admitted and family income is below $85,000, tuition, room, and board are covered at 100% with zero student loans.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                2. Endowed Merit &amp; Presidential Fellowships
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Fellowships like Stanford’s Knight-Hennessy, Toronto’s Lester B. Pearson, HKU’s Presidential PhD, Tsinghua’s Schwarzman, and Oxford’s Clarendon evaluate leadership and academic merit, granting full funding with living stipends.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                3. Assistantships &amp; University Nominated Aid
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                In Canada (UBC 4YF, U of T Doctoral Stream), Australia (Go8 RTP), Hong Kong (HKPFS), China (CSC Type B), and India (IIT Assistantships), aid is allocated directly through academic faculty and university departments without embassy tests.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Region Switcher Pills: Movable Left and Right with Arrow Controls, Touch & Drag Support */}
      <div className="relative group bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-2.5 px-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Select Region ({allTopUniversityPrograms.length} Elite Institutions)</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <MoveHorizontal className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Movable panel: Scroll or drag left &amp; right</span>
            </span>
          </div>

          {/* Left & Right Interactive Movement Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              aria-label="Move left"
              title="Move left to see earlier regions"
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                canScrollLeft
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 shadow-2xs hover:shadow-xs active:scale-95'
                  : 'bg-slate-50 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              aria-label="Move right"
              title="Move right to see more regions"
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                canScrollRight
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 shadow-2xs hover:shadow-xs active:scale-95'
                  : 'bg-slate-50 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Movable Region Pills Container */}
        <div className="relative">
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />
          )}

          <div
            ref={tabsScrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onScroll={checkScrollBounds}
            className={`flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 px-0.5 select-none no-scrollbar ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {regionTabs.map((reg) => {
              const info = REGION_LABELS[reg];
              const isSelected = filters.region === reg;
              return (
                <button
                  key={reg}
                  type="button"
                  onClick={(e) => {
                    if (didDragRef.current) {
                      e.preventDefault();
                      return;
                    }
                    handleFilterChange('region', reg);
                  }}
                  className={`inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/40 border border-slate-700 dark:border-emerald-500'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white border border-slate-200/90 dark:border-slate-700 shadow-2xs'
                  }`}
                >
                  <span className="text-sm sm:text-base leading-none">{info.flag}</span>
                  <span className="tracking-tight">{info.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                      isSelected
                        ? 'bg-white/20 text-white border border-white/20'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-600'
                    }`}
                  >
                    {info.count}
                  </span>
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />
          )}
        </div>
      </div>

      {/* Main Workspace Layout: Filter Criteria Sidebar + University Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Criteria Sidebar */}
        {showFiltersSidebar && (
          <div className="hidden lg:block lg:col-span-1">
            <TopUniversityFiltersSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              activeFilterCount={activeFilterCount}
              totalResultsCount={filteredPrograms.length}
              totalProgramsCount={allTopUniversityPrograms.length}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div
          className={`${
            showFiltersSidebar ? 'lg:col-span-3' : 'lg:col-span-4'
          } space-y-4`}
        >
          {/* Top Search, Sort & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search university, fellowship, city, or discipline..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Controls: Sort Dropdown & Filter Toggle */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {/* Sort selector */}
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as 'qs_rank' | 'the_rank' | 'highest_value' | 'name_asc'
                      )
                    }
                    className="w-full sm:w-auto text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 pl-3 pr-8 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer shadow-2xs"
                  >
                    <option value="qs_rank">QS World Rank (Best First)</option>
                    <option value="the_rank">THE World Rank (Best First)</option>
                    <option value="highest_value">Annual Value (Highest USD)</option>
                    <option value="name_asc">University Name (A–Z)</option>
                  </select>
                </div>

                {/* Mobile Filter Trigger Button */}
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Filter Criteria</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Desktop Toggle Sidebar Button */}
                <button
                  type="button"
                  onClick={() => setShowFiltersSidebar(!showFiltersSidebar)}
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                  title={showFiltersSidebar ? 'Hide Filter Criteria sidebar' : 'Show Filter Criteria sidebar'}
                >
                  <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{showFiltersSidebar ? 'Hide Criteria' : 'Filter Criteria'}</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Filter Presets Ribbon */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
              <span className="text-slate-400 font-bold shrink-0 text-[11px] uppercase tracking-wider">
                Quick Criteria:
              </span>

              <button
                type="button"
                onClick={() => handleFilterChange('coverage', '100% Full')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  filters.coverage === '100% Full'
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                100% Full Ride (Tuition+Stipend)
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('rankTier', 'top10')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  filters.rankTier === 'top10'
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Global Top 10
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('mechanism', 'Automatic with Admission')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  filters.mechanism === 'Automatic with Admission'
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Automatic with Admission
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('fellowshipType', 'Need-Based Full Aid')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  filters.fellowshipType === 'Need-Based Full Aid'
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                100% Need-Based Aid
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('fellowshipType', 'Research/Teaching Assistantship')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  filters.fellowshipType === 'Research/Teaching Assistantship'
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Graduate Assistantship (RA/TA)
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('consortium', 'c9')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  filters.consortium === 'c9'
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                C9 League (China)
              </button>
            </div>
          </div>

          {/* Active Filter Badges Bar */}
          {activeFilterCount > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="font-bold text-emerald-900 mr-1 text-[11px] uppercase tracking-wider">
                  Active Criteria:
                </span>

                {filters.region !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-emerald-900 border border-emerald-300 font-medium text-xs shadow-2xs">
                    Region: {REGION_LABELS[filters.region].label}
                    <button
                      onClick={() => handleFilterChange('region', 'ALL')}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.rankTier !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-emerald-900 border border-emerald-300 font-medium text-xs shadow-2xs">
                    Rank: {filters.rankTier.toUpperCase()}
                    <button
                      onClick={() => handleFilterChange('rankTier', 'ALL')}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.degree !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-emerald-900 border border-emerald-300 font-medium text-xs shadow-2xs">
                    Degree: {filters.degree}
                    <button
                      onClick={() => handleFilterChange('degree', 'ALL')}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.fellowshipType !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-emerald-900 border border-emerald-300 font-medium text-xs shadow-2xs">
                    Model: {filters.fellowshipType}
                    <button
                      onClick={() => handleFilterChange('fellowshipType', 'ALL')}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.coverage !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-emerald-900 border border-emerald-300 font-medium text-xs shadow-2xs">
                    Coverage: {filters.coverage}
                    <button
                      onClick={() => handleFilterChange('coverage', 'ALL')}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.mechanism !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-emerald-900 border border-emerald-300 font-medium text-xs shadow-2xs">
                    Process: {filters.mechanism}
                    <button
                      onClick={() => handleFilterChange('mechanism', 'ALL')}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.consortium !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-emerald-900 border border-emerald-300 font-medium text-xs shadow-2xs">
                    Alliance: {filters.consortium.toUpperCase()}
                    <button
                      onClick={() => handleFilterChange('consortium', 'ALL')}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.minValueUSD > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-emerald-900 border border-emerald-300 font-medium text-xs shadow-2xs">
                    Min: ${filters.minValueUSD.toLocaleString()}/yr
                    <button
                      onClick={() => handleFilterChange('minValueUSD', 0)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-emerald-900 border border-emerald-300 font-medium text-xs shadow-2xs">
                    Query: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer shrink-0"
              >
                Clear All Criteria
              </button>
            </div>
          )}

          {/* Results Count Header */}
          <div className="flex items-center justify-between px-1">
            <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              Showing <span className="font-bold text-slate-900 dark:text-slate-100">{filteredPrograms.length}</span> of {allTopUniversityPrograms.length} elite institutions
              {filters.region !== 'ALL' && <span> in {REGION_LABELS[filters.region].label}</span>}
              {filters.degree !== 'ALL' && <span> for {filters.degree}</span>}
            </div>
          </div>

          {/* University Programs Card Grid */}
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No university programs match your criteria</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Try loosening your filter criteria, such as choosing all degree levels or resetting ranking tiers.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition cursor-pointer"
              >
                Reset All Criteria
              </button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 ${
                showFiltersSidebar ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'
              } gap-5`}
            >
              {filteredPrograms.map((program) => (
                <div
                  key={program.id}
                  onClick={() => setSelectedProgram(program)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedProgram(program);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open financial aid dossier for ${program.universityName}`}
                  className="group study-glass-card relative rounded-3xl border border-slate-200/90 dark:border-slate-700/90 hover:border-emerald-400 dark:hover:border-emerald-500 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 select-none"
                >
                  {/* Top Specular Liquid Curvature Reflection (Light Mode subtle tint) */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/70 via-white/15 to-transparent dark:from-white/5 dark:via-transparent rounded-t-3xl z-0" />

                  {/* University Crest / Logo as Background Watermark */}
                  <UniversityCrestWatermark program={program} />

                  {/* Card Header Content */}
                  <div className="p-5 pb-3.5 space-y-2.5 relative z-10">
                    {/* Global Ranking & Position Ribbon */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-950 text-white shadow-xs text-[11px] font-bold tracking-tight border border-slate-700/60">
                          <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>QS #{program.qsWorldRank}</span>
                          {program.theWorldRank && (
                            <>
                              <span className="text-slate-400 text-[10px]">/</span>
                              <span className="text-slate-200 font-semibold text-[11px]">THE #{program.theWorldRank}</span>
                            </>
                          )}
                        </div>
                        {(() => {
                          const tier = getRankingTierBadge(program.qsWorldRank);
                          return (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-white/90 dark:bg-slate-800/90 text-emerald-950 dark:text-emerald-300 border border-slate-200 dark:border-slate-700">
                              {tier.label}
                            </span>
                          );
                        })()}
                      </div>

                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 shrink-0 bg-white/90 dark:bg-slate-800/90 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {program.region === 'South Korea' ? 'Korea' : program.region}
                      </span>
                    </div>

                    {/* Institutional Badge */}
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-400/30 dark:border-emerald-700/60">
                        <Award className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        <span>{program.badge}</span>
                      </span>
                    </div>

                    {/* University Name */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 tracking-tight">
                        {program.universityName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                        <span>{program.city}, {program.country}</span>
                      </div>
                    </div>

                    {/* Flagship Fellowship Container */}
                    <div className="mt-3 p-3 rounded-2xl border transition-all bg-slate-50/80 dark:bg-slate-800/70 border-slate-200/80 dark:border-slate-700">
                      <div className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        Flagship Aid Program
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mt-0.5 leading-snug">
                        {program.fellowshipName}
                      </div>
                    </div>

                    {/* Badges: Coverage & Estimated Value */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-400/30 dark:border-emerald-700/60">
                        <DollarSign className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        {program.fundingCoverage}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-amber-400/20 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 border border-amber-400/40 dark:border-amber-700/60">
                        ~${program.estimatedAnnualValueUSD.toLocaleString()} / yr
                      </span>
                    </div>

                    {/* Degree Levels Pills */}
                    <div className="mt-3 flex items-center gap-1 flex-wrap">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                      {program.degreeLevels.map((lvl) => (
                        <span
                          key={lvl}
                          className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                        >
                          {lvl}
                        </span>
                      ))}
                    </div>

                    {/* Deadline */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Deadline: {program.applicationDeadline}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-800/70 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-2 relative z-10">
                    <div className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-950 dark:text-emerald-100 bg-emerald-100/90 dark:bg-emerald-700/80 hover:bg-emerald-200 dark:hover:bg-emerald-600 flex items-center gap-1.5 transition-all select-none border border-emerald-200 dark:border-emerald-600">
                      <span>View Aid Dossier</span>
                      <ChevronRight className="w-4 h-4 text-emerald-700 dark:text-emerald-200 transition-transform" />
                    </div>

                    <a
                      href={program.officialPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center"
                      title="Visit University Aid Website"
                      aria-label={`Visit official financial aid portal for ${program.universityName}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Criteria Modal / Slide-over */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            <TopUniversityFiltersSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              activeFilterCount={activeFilterCount}
              totalResultsCount={filteredPrograms.length}
              totalProgramsCount={allTopUniversityPrograms.length}
              onCloseMobile={() => setShowMobileFilters(false)}
              isMobile
            />
          </div>
        </div>
      )}

      {/* Modal for Program Details */}
      <TopUniversityDossierModal
        program={selectedProgram}
        onClose={() => setSelectedProgram(null)}
      />
    </div>
  );
};

