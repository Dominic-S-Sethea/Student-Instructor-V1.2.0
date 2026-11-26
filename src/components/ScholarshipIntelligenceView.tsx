import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Award,
  Filter,
  ShieldCheck,
  Calendar,
  Globe2,
  DollarSign,
  GraduationCap,
  Bookmark,
  BookmarkCheck,
  Building2,
  ExternalLink,
  Clock,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  User,
  Plus,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Briefcase,
} from 'lucide-react';
import {
  ScholarshipItem,
  ScholarshipFilters,
  ScholarshipRegion,
  DegreeLevel,
  FieldOfStudy,
  FundingType,
  StudentCategory,
} from '../types/scholarship';
import { initialScholarships } from '../data/scholarshipData';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { scholarshipClient } from '../services/scholarshipClient';
import { ScholarshipDetailModal } from './scholarships/ScholarshipDetailModal';
import { ScholarshipDirectoryCard } from './scholarships/ScholarshipDirectoryCard';
import { ScholarshipErrorReportModal } from './scholarships/ScholarshipErrorReportModal';
import { ScholarshipSubmitModal } from './scholarships/ScholarshipSubmitModal';
import { ScholarshipSavedDrawer } from './scholarships/ScholarshipSavedDrawer';
import { ScholarshipAdminModal } from './scholarships/ScholarshipAdminModal';
import { TopUniversityDirectory } from './topUniversities/TopUniversityDirectory';
import { allTopUniversityPrograms } from '../data/topUniversities';
import { useSavedScholarships } from '../hooks/useSavedScholarships';

export const ScholarshipIntelligenceView: React.FC<{ onOpenAuthModal?: () => void }> = ({ onOpenAuthModal }) => {
  const { language, t } = useLanguage();
  const { authenticated, user, profile: authProfile, logout } = useAuth();
  const isKhmer = language === 'km';

  // Directory View Mode
  const [directoryView, setDirectoryView] = useState<'top_universities' | 'flagship'>('flagship');

  // Data state
  const [scholarships, setScholarships] = useState<ScholarshipItem[]>(initialScholarships);
  const [catalogById, setCatalogById] = useState<Record<string, ScholarshipItem>>(() =>
    Object.fromEntries(initialScholarships.map((item) => [item.id, item]))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [accessNotice, setAccessNotice] = useState<string | null>(null);

  const {
    savedIds,
    savedMetadataById,
    isAccountSynced,
    error: savedError,
    clearError: clearSavedError,
    toggleSaveScholarship,
    updateSavedStatus,
    toggleChecklistItem,
  } = useSavedScholarships(authenticated, user?.id, (hydrated) => {
    setCatalogById((prev) => {
      const next = { ...prev };
      for (const item of hydrated) next[item.id] = item;
      return next;
    });
  });

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<ScholarshipRegion | 'all'>('all');
  const [selectedDegree, setSelectedDegree] = useState<DegreeLevel | 'all'>('all');
  const [selectedField, setSelectedField] = useState<FieldOfStudy | 'all'>('all');
  const [selectedFunding, setSelectedFunding] = useState<FundingType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<StudentCategory | 'all'>('all');
  const [onlyVerified, setOnlyVerified] = useState(true);
  const [sortBy, setSortBy] = useState<'latest_updated' | 'deadline_approaching' | 'fully_funded' | 'most_popular'>('latest_updated');

  // Modals state
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipItem | null>(null);
  const [reportingScholarship, setReportingScholarship] = useState<ScholarshipItem | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Fetch from API with AbortController + recoverable error state
  const fetchScholarships = async (signal?: AbortSignal): Promise<void> => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await scholarshipClient.list({
        q: searchQuery || undefined,
        region: selectedRegion,
        degree: selectedDegree,
        field: selectedField,
        funding: selectedFunding,
        studentCategory: selectedCategory,
        onlyVerified,
        sortBy,
        signal,
      });
      if (!signal?.aborted && data.success && Array.isArray(data.scholarships)) {
        setScholarships(data.scholarships);
        setCatalogById((prev) => {
          const next = { ...prev };
          for (const item of data.scholarships) {
            next[item.id] = item;
          }
          return next;
        });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (!signal?.aborted) {
        setFetchError(err instanceof Error ? err.message : 'Unable to load scholarships from server.');
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const delayDebounce = setTimeout(() => {
      void fetchScholarships(controller.signal);
    }, 250);
    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchQuery,
    selectedRegion,
    selectedDegree,
    selectedField,
    selectedFunding,
    selectedCategory,
    onlyVerified,
    sortBy,
  ]);

  const savedList = useMemo(() => {
    return savedIds
      .map((id) => catalogById[id])
      .filter((item): item is ScholarshipItem => Boolean(item));
  }, [catalogById, savedIds]);

  // Popular search chips
  const searchChips = [
    'Chevening UK',
    'Fulbright USA',
    'Australia Awards',
    'CADT MPTC Talent',
    'Japan MEXT',
    'Korea GKS',
    'Computer Science',
    'Fully funded',
  ];

  // Quick reset
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('all');
    setSelectedDegree('all');
    setSelectedField('all');
    setSelectedFunding('all');
    setSelectedCategory('all');
    setOnlyVerified(false);
    setSortBy('latest_updated');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedRegion !== 'all' ||
    selectedDegree !== 'all' ||
    selectedField !== 'all' ||
    selectedFunding !== 'all' ||
    selectedCategory !== 'all' ||
    onlyVerified;

  // Aggregate metrics derived strictly from loaded catalog records
  const catalogStats = useMemo(() => {
    const verifiedCount = scholarships.filter((s) => s.verifiedBadge).length;
    const knownValues = scholarships.filter((s) => typeof s.totalEstimatedValueUSD === 'number');
    const totalFundingUSD = knownValues.reduce((acc, curr) => acc + (curr.totalEstimatedValueUSD || 0), 0);
    const avgQualityScore =
      scholarships.length > 0
        ? Math.round((scholarships.reduce((acc, curr) => acc + curr.qualityScore, 0) / scholarships.length) * 10) / 10
        : null;
    return { verifiedCount, knownValueCount: knownValues.length, totalFundingUSD, avgQualityScore };
  }, [scholarships]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-16 transition-colors" id="scholarship-intelligence-view">
      {/* 1. Header Banner & Mission Statement */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900 text-white border-b border-emerald-950/30 dark:border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 border border-white/30 text-white text-xs font-bold tracking-wide backdrop-blur-xs shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Cambodia Scholarship Intelligence Platform (CSIP)</span>
                <span className="bg-white/25 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                  Verified Data
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
                {isKhmer
                  ? 'ស្វែងរកអាហារូបករណ៍សកលដែលបានផ្ទៀងផ្ទាត់សម្រាប់សិស្ស-និស្សិតកម្ពុជា'
                  : 'Verified Global & Cambodian Scholarships for Students'}
              </h1>

              <p className="text-sm sm:text-base text-emerald-50 leading-relaxed font-medium drop-shadow-xs">
                {isKhmer
                  ? 'ស្វែងរកឱកាសអាហារូបករណ៍ពិតប្រាកដទូទាំងពិភពលោក ព័ត៌មានលម្អិតច្បាស់លាស់ លក្ខខណ្ឌតម្រូវមិនភ័ន្តច្រឡំ និងតាមដានកាលបរិច្ឆេទផុតកំណត់ផ្ទាល់។'
                  : 'A trusted scholarship intelligence search engine helping Cambodian students discover verified opportunities through structured requirements, live deadlines, and verified source links.'}
              </p>
            </div>

            {/* Account & Quick Action Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              {/* Account & Auth Toolbar */}
              <div className="bg-slate-950/35 backdrop-blur-md p-2.5 rounded-2xl border border-white/25 text-xs flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-400/30 border border-emerald-200/50 flex items-center justify-center text-white font-bold">
                  {authenticated ? (authProfile?.name || user?.email || 'U').slice(0, 2).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-bold text-white leading-tight">
                    {authenticated ? (authProfile?.name || user?.email) : 'Guest Explorer'}
                  </div>
                  <div className="text-[11px] text-emerald-100 font-medium">
                    {authenticated ? `${user?.role} session` : 'Search freely without login'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (authenticated) {
                      void logout();
                    } else if (onOpenAuthModal) {
                      onOpenAuthModal();
                    }
                  }}
                  className="ml-1 text-[10px] font-bold px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                >
                  {authenticated ? 'Sign Out' : 'Sign In'}
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsSavedDrawerOpen(true)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                  id="open-saved-scholarships"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Saved & Deadlines</span>
                  {savedIds.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-slate-950 text-white text-[10px] flex items-center justify-center font-extrabold ml-0.5">
                      {savedIds.length}
                    </span>
                  )}
                </button>

                <button
                  id="open-submit-scholarship-btn"
                  onClick={() => {
                    setAccessNotice(null);
                    if (user && (user.role === 'organization' || user.role === 'admin')) {
                      setIsSubmitOpen(true);
                    } else {
                      setAccessNotice('Organization or Admin account required to submit a scholarship opportunity.');
                    }
                  }}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-950/35 hover:bg-slate-950/50 border border-white/25 text-white font-bold text-xs shadow-xs transition-all cursor-pointer backdrop-blur-xs"
                >
                  <Building2 className="w-4 h-4 text-emerald-200" />
                  <span>Submit Opportunity</span>
                </button>

                {user?.role === 'admin' && (
                  <button
                    id="open-scholarship-admin-btn"
                    onClick={() => setIsAdminOpen(true)}
                    className="p-2.5 rounded-xl bg-slate-950/35 hover:bg-slate-950/50 border border-white/25 text-white/90 hover:text-white cursor-pointer shadow-xs backdrop-blur-xs"
                    title="Admin & Verification Console"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {(fetchError || savedError || accessNotice) && (
            <div
              role="alert"
              className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300/60 bg-slate-950/50 px-4 py-2.5 text-xs text-amber-100"
            >
              <span>{fetchError || savedError || accessNotice}</span>
              <div className="flex items-center gap-2">
                {fetchError && (
                  <button
                    type="button"
                    onClick={() => void fetchScholarships()}
                    className="rounded-lg bg-white/20 px-3 py-1 font-bold text-white hover:bg-white/30 cursor-pointer"
                  >
                    Retry
                  </button>
                )}
                {savedError && (
                  <button
                    type="button"
                    onClick={clearSavedError}
                    className="rounded-lg bg-white/20 px-3 py-1 font-bold text-white hover:bg-white/30 cursor-pointer"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. Catalog Metrics Ribbon (computed from live SQLite records) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/20">
            <div className="p-3 rounded-xl bg-slate-950/25 border border-white/20 backdrop-blur-xs shadow-xs">
              <div className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
                Verified Programs
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {catalogStats.verifiedCount} / {scholarships.length} Verified
              </div>
              <div className="text-[11px] text-emerald-50 mt-0.5 font-medium">Checked against official portals</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/25 border border-white/20 backdrop-blur-xs shadow-xs">
              <div className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
                Known Grant Pool
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {catalogStats.knownValueCount > 0
                  ? `$${(catalogStats.totalFundingUSD / 1000000).toFixed(1)}M+ USD`
                  : 'Not specified'}
              </div>
              <div className="text-[11px] text-emerald-50 mt-0.5 font-medium">Sum of published estimates only</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/25 border border-white/20 backdrop-blur-xs shadow-xs">
              <div className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
                Avg. Completeness Score
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5 flex items-center gap-1.5">
                <span>{catalogStats.avgQualityScore !== null ? `${catalogStats.avgQualityScore}%` : 'N/A'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              </div>
              <div className="text-[11px] text-emerald-50 mt-0.5 font-medium">Editorial source-verified metadata</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/25 border border-white/20 backdrop-blur-xs shadow-xs">
              <div className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
                Bilingual Coverage
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                English &amp; Khmer
              </div>
              <div className="text-[11px] text-emerald-50 mt-0.5 font-medium">Official source links on dossiers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Category Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0">
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-2">
          <button
            type="button"
            onClick={() => setDirectoryView('top_universities')}
            className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              directoryView === 'top_universities'
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>Top Global University Fellowships &amp; Aid</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                directoryView === 'top_universities'
                  ? 'bg-black/25 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {allTopUniversityPrograms.length} Elite
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDirectoryView('flagship')}
            className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              directoryView === 'flagship'
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>National &amp; Bilateral Flagship Scholarships</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                directoryView === 'flagship'
                  ? 'bg-black/25 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {scholarships.length} Grants
            </span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Filters & Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {directoryView === 'top_universities' ? (
          <TopUniversityDirectory />
        ) : (
          <>
            {/* Search Bar & Quick Chips */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-4 sm:p-5 mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isKhmer
                    ? 'ស្វែងរកតាមឈ្មោះអាហារូបករណ៍ ប្រទេស មុខវិជ្ជា ឬស្ថាប័នផ្តល់...'
                    : 'Search scholarships by name, country, major, or provider (e.g. Chevening, CADT, CS)...'
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
                id="scholarship-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as
                        | 'latest_updated'
                        | 'deadline_approaching'
                        | 'fully_funded'
                        | 'most_popular'
                    )
                  }
                  className="w-full sm:w-auto text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 p-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden pr-8 cursor-pointer"
                >
                  <option value="latest_updated">Latest Updated</option>
                  <option value="deadline_approaching">Deadline Approaching</option>
                  <option value="fully_funded">Fully Funded First</option>
                  <option value="most_popular">Most Popular</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                className="md:hidden inline-flex items-center gap-1.5 px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Quick Search Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
            <span className="text-slate-400 font-semibold shrink-0 text-[11px]">Popular:</span>
            {searchChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setSearchQuery(chip)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout: Sidebar Filters + Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Filters Sidebar */}
          <div
            className={`md:block ${
              showFiltersMobile ? 'block' : 'hidden'
            } md:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-6 sticky top-20`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
                <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Filter Criteria</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Destination Region */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                Destination Region / Country
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as ScholarshipRegion | 'all')}
                className="w-full text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Regions (Global)</option>
                <option value="Cambodia">Cambodia (Domestic)</option>
                <option value="ASEAN">ASEAN Region</option>
                <option value="Japan">Japan</option>
                <option value="Korea">Korea</option>
                <option value="China">China</option>
                <option value="Singapore">Singapore</option>
                <option value="Australia">Australia &amp; NZ</option>
                <option value="Europe">Europe (UK, EU, France)</option>
                <option value="USA">United States (USA)</option>
                <option value="Canada">Canada</option>
              </select>
            </div>

            {/* Degree Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                Degree Level
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'all', label: 'All Degrees' },
                    { id: 'Bachelor', label: 'Bachelor' },
                    { id: 'Master', label: 'Master' },
                    { id: 'PhD', label: 'PhD' },
                  ] as const
                ).map((deg) => (
                  <button
                    key={deg.id}
                    type="button"
                    onClick={() => setSelectedDegree(deg.id)}
                    className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                      selectedDegree === deg.id
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {deg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Funding Coverage */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                Funding Coverage
              </label>
              <div className="space-y-1.5">
                {(
                  [
                    { id: 'all', label: 'All Funding Types' },
                    { id: 'Fully funded', label: 'Fully Funded (Tuition + Stipend)' },
                    { id: 'Tuition only', label: 'Tuition Waiver Only' },
                    { id: 'Partial funding', label: 'Partial Grants & Subsidy' },
                  ] as const
                ).map((fund) => (
                  <button
                    key={fund.id}
                    type="button"
                    onClick={() => setSelectedFunding(fund.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedFunding === fund.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {fund.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field of Study */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                Field of Study
              </label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value as FieldOfStudy | 'all')}
                className="w-full text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Fields &amp; Disciplines</option>
                <option value="Computer Science">Computer Science &amp; AI</option>
                <option value="Engineering">Engineering &amp; Robotics</option>
                <option value="Business">Business, Finance &amp; Econ</option>
                <option value="Medicine">Medicine &amp; Public Health</option>
                <option value="Agriculture">Agriculture &amp; Environment</option>
                <option value="Education">Education &amp; Social Sciences</option>
                <option value="Other">Other Multidisciplinary</option>
              </select>
            </div>

            {/* Target Student Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
                Target Applicant
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as StudentCategory | 'all')}
                className="w-full text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Applicants</option>
                <option value="High School Students">High School Graduates (Bac II)</option>
                <option value="University Students">University Undergrads</option>
                <option value="Graduates & Professionals">Graduates &amp; Professionals</option>
              </select>
            </div>

            {/* Verified Only Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified Official Only</span>
                </span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-6">
                Excludes unverified or speculative announcements.
              </p>
            </div>
          </div>

          {/* Results Grid */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>
                Showing <strong>{scholarships.length}</strong> verified opportunities
              </span>
              {onlyVerified && (
                <span className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Official Source Verified</span>
                </span>
              )}
            </div>

            {scholarships.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs">
                <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No scholarships matched your filter</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try clearing your search query or selecting &ldquo;All Regions&rdquo; to explore all verified opportunities.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {scholarships.map((sch) => (
                  <ScholarshipDirectoryCard
                    key={sch.id}
                    scholarship={sch}
                    isSaved={savedIds.includes(sch.id)}
                    onToggleSave={toggleSaveScholarship}
                    onOpenDetail={setSelectedScholarship}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </div>

      {/* Modal Dossiers & Drawers */}
      <ScholarshipDetailModal
        scholarship={selectedScholarship}
        isOpen={Boolean(selectedScholarship)}
        onClose={() => setSelectedScholarship(null)}
        isSaved={selectedScholarship ? savedIds.includes(selectedScholarship.id) : false}
        onToggleSave={toggleSaveScholarship}
        onOpenReportModal={(sch) => setReportingScholarship(sch)}
      />

      <ScholarshipErrorReportModal
        scholarship={reportingScholarship}
        isOpen={Boolean(reportingScholarship)}
        onClose={() => setReportingScholarship(null)}
        onReportSubmitted={() => {
          // Refresh list or notify
          fetchScholarships();
        }}
      />

      <ScholarshipSubmitModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSubmissionSuccess={() => {
          fetchScholarships();
        }}
      />

      <ScholarshipSavedDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedScholarships={savedList}
        savedMetadataById={savedMetadataById}
        isAccountSynced={isAccountSynced}
        onUpdateStatus={updateSavedStatus}
        onToggleChecklistItem={toggleChecklistItem}
        onRemoveSaved={toggleSaveScholarship}
        onSelectScholarship={(sch) => {
          setSelectedScholarship(sch);
          setIsSavedDrawerOpen(false);
        }}
        userEmail={user?.email || ''}
      />

      <ScholarshipAdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        scholarships={scholarships}
        onRefreshData={fetchScholarships}
      />
    </div>
  );
};
