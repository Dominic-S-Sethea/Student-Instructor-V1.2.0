import React, { useState, lazy, Suspense } from 'react';
import {
  Search,
  Filter,
  Building2,
  Award,
  DollarSign,
  TrendingUp,
  BookOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Scale,
  Calculator,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Info,
  Clock,
  Briefcase,
  Layers,
  ChevronLeft,
  ImageIcon,
  HardDrive,
} from 'lucide-react';
import { ComprehensiveUniversityProfile, TabView } from '../types';
import { DataConfidenceBadge } from './DataConfidenceBadge';
import { UniversityComparisonEngine } from './UniversityComparisonEngine';
import { ROICalculatorModal } from './ROICalculatorModal';
import { UniversityDossierModal } from './UniversityDossierModal';
const GoogleDriveHubModal = lazy(() =>
  import('./GoogleDriveHubModal').then((m) => ({ default: m.GoogleDriveHubModal }))
);
import { analytics } from '../utils/analytics';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  universities: ComprehensiveUniversityProfile[];
  onNavigateTab?: (tab: TabView) => void;
  onOpenBookingWithSenior?: (universityAbbr: string) => void;
  isLoadingLive?: boolean;
  liveError?: string | null;
  onRetryLive?: () => void;
}

export const UniversityIntelligenceView: React.FC<Props> = ({
  universities,
  onNavigateTab,
  liveError,
  onRetryLive,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profiles' | 'compare' | 'roi'>('profiles');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'Public' | 'Private'>('all');
  const [onlyScholarships, setOnlyScholarships] = useState(false);
  const [selectedUniForModal, setSelectedUniForModal] = useState<ComprehensiveUniversityProfile | null>(null);
  const [roiModalUnivId, setRoiModalUnivId] = useState<string | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  const { t } = useLanguage();
  const subtabScroll = useDraggableScroll<HTMLDivElement>();
  const filterScroll = useDraggableScroll<HTMLDivElement>();
  const univChipsScroll = useDraggableScroll<HTMLDivElement>();

  // Filtered universities
  const filteredUniversities = universities.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.abbr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.khmerName && u.khmerName.includes(searchQuery)) ||
      u.majors.some((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || u.type === selectedType;
    const matchesScholarship = !onlyScholarships || u.scholarships.hasFullScholarship;

    return matchesSearch && matchesType && matchesScholarship;
  });

  const handleOpenDossier = (univ: ComprehensiveUniversityProfile) => {
    setSelectedUniForModal(univ);
    analytics.track('view_university', {
      university_id: univ.id,
      university_name: univ.name,
      university_abbr: univ.abbr,
      annual_tuition: univ.annualTuitionUSD,
    });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      analytics.track('search_university', {
        keyword: query,
        filter_used: selectedType,
        results_count: filteredUniversities.length,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-blue-950/30 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-blue-200" />
            <span>Cambodian University Explorer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Compare Universities, Tuition &amp; Majors
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Explore Year 1–4 degree curricula, annual tuition fees, scholarship tracks, and campus details across major Cambodian universities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('decision-engine')}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>2-Min Major Fit Quiz</span>
          </button>
          <button
            type="button"
            onClick={() => setRoiModalUnivId(universities[0]?.id || 'univ-cadt')}
            className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-emerald-300" />
            <span>Tuition ROI Calculator</span>
          </button>
        </div>
      </div>

      {liveError && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <span>Showing bundled directory because live server refresh failed ({liveError}).</span>
          {onRetryLive && (
            <button
              type="button"
              onClick={onRetryLive}
              className="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 cursor-pointer shrink-0"
            >
              Retry Live Sync
            </button>
          )}
        </div>
      )}

      {/* Subtab Navigation: Profiles vs Comparison Matrix */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
        <div className="relative flex-1 min-w-0 flex items-center">
          <div
            ref={subtabScroll.ref}
            {...subtabScroll.events}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 w-full"
          >
            <button
              type="button"
              onClick={() => setActiveSubTab('profiles')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeSubTab === 'profiles'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t('uni.allProfiles', 'All University Profiles')} ({filteredUniversities.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('compare')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeSubTab === 'compare'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{t('uni.compareMatrix', 'Side-by-Side Comparison Matrix')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRoiModalUnivId(universities[0]?.id || 'univ-cadt')}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('roi.title', 'Tuition & Salary ROI Calculator')}</span>
            </button>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Catalog synced with /api/universities</span>
        </div>
      </div>

      {/* Interactive Sticky Quick-Access Header of University Rectangles */}
      <div className="sticky top-16 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Click any university to open campus details, majors &amp; admission dates:
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold hidden md:inline shrink-0">
            {universities.length} Universities
          </span>
        </div>

        <div className="relative flex items-center">
          {univChipsScroll.canScrollLeft && (
            <button
              type="button"
              onClick={univChipsScroll.scrollLeft}
              className="absolute left-0 z-30 p-1.5 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-indigo-600 cursor-pointer"
              aria-label="Scroll universities left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          <div
            ref={univChipsScroll.ref}
            {...univChipsScroll.events}
            className={`flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 select-none w-full ${
              univChipsScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            title="Click or drag to view and select any university"
          >
            {universities.map((u) => {
              const isSelected = selectedUniForModal?.id === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleOpenDossier(u)}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all shrink-0 cursor-pointer shadow-2xs hover:shadow-md hover:border-indigo-500 hover:-translate-y-0.5 ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20'
                      : 'bg-white border-gray-200 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={u.coverImage || u.logo}
                    alt={u.abbr}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                  />
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {u.abbr}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          u.type === 'Public' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {u.type}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium truncate max-w-[130px]">
                      {u.name.split('(')[0].trim()}
                    </div>
                  </div>
                  <div className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0">
                    {u.profileScore.overall}
                  </div>
                </button>
              );
            })}
          </div>

          {univChipsScroll.canScrollRight && (
            <button
              type="button"
              onClick={univChipsScroll.scrollRight}
              className="absolute right-0 z-30 p-1.5 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-indigo-600 cursor-pointer"
              aria-label="Scroll universities right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'compare' ? (
        <UniversityComparisonEngine
          universities={universities}
          onOpenROI={(id) => setRoiModalUnivId(id)}
          onOpenUniversityDetails={(u) => handleOpenDossier(u)}
        />
      ) : (
        <>
          {/* Search and Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('uni.searchPlaceholder', 'Search university name, Khmer name, acronym (CADT, ITC, CamEd), or major...')}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filter Pills */}
            <div
              ref={filterScroll.ref}
              {...filterScroll.events}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs"
            >
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                {(['all', 'Public', 'Private'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      selectedType === type
                        ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {type === 'all' ? t('uni.allTypes', 'All Types') : type === 'Public' ? t('uni.public', 'Public') : t('uni.private', 'Private')}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setOnlyScholarships(!onlyScholarships);
                  analytics.track('filter_universities', { only_scholarships: !onlyScholarships });
                }}
                className={`px-3 py-2 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  onlyScholarships
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${onlyScholarships ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span>{t('uni.scholarshipsFilter', 'Full Scholarships Available')}</span>
              </button>
            </div>
          </div>

          {/* Universities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((univ) => (
              <div
                key={univ.id}
                onClick={() => handleOpenDossier(univ)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenDossier(univ);
                  }
                }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-xs hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Card Cover & Logo */}
                  <div className="h-36 bg-slate-900 relative overflow-hidden">
                    <img
                      src={univ.coverImage}
                      alt={univ.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-gray-900 backdrop-blur-xs shadow-xs">
                        {univ.type}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-600/90 text-white backdrop-blur-xs shadow-xs group-hover:bg-indigo-500 transition-colors flex items-center gap-1">
                        <span>Click to view details</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div>
                        <span className="text-xl font-black text-white">{univ.abbr}</span>
                        {univ.khmerName && (
                          <div className="text-[11px] text-gray-200 font-medium truncate max-w-[200px]">{univ.khmerName}</div>
                        )}
                      </div>
                      {/* Overall Profile Score Badge */}
                      <div className="bg-indigo-600 text-white px-2.5 py-1 rounded-xl text-center shadow-xs">
                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Score</div>
                        <div className="text-base font-black leading-none">{univ.profileScore.overall}</div>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3.5">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate" title={univ.name}>
                      {univ.name}
                    </div>

                    {/* Data Confidence & Accreditation */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <DataConfidenceBadge confidence={univ.dataConfidence} />
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {univ.accreditation.status}
                      </span>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Annual Tuition</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          ${univ.annualTuitionUSD.toLocaleString()}{' '}
                          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">/ yr</span>
                        </div>
                      </div>

                      <div className="bg-emerald-50/70 dark:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800">
                        <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Est. Starting Pay</div>
                        <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">
                          {univ.averageGraduateSalaryMonthlyUSD > 0
                            ? `$${univ.averageGraduateSalaryMonthlyUSD}/mo`
                            : 'Not specified'}
                        </div>
                      </div>
                    </div>

                    {/* Curriculum Highlight */}
                    <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed bg-blue-50/40 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-100/60 dark:border-blue-900">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Focus: </span>
                      {univ.curriculumHighlight}
                    </div>

                    {/* Top Majors Tags */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Featured Majors:</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:underline">
                          {univ.programs?.length || univ.majors.length} Programs →
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {univ.majors.slice(0, 4).map((m) => (
                          <span
                            key={m.id}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-medium"
                          >
                            {m.name.split('(')[0].trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-3 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRoiModalUnivId(univ.id);
                    }}
                    className="flex-1 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center transition-colors cursor-pointer"
                  >
                    Simulate ROI
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDossier(univ);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-bold text-center transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>Full Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* COMPREHENSIVE UNIVERSITY DOSSIER MODAL WITH PHOTOS, PROGRAMS & DEPARTMENTS */}
      {selectedUniForModal && (
        <UniversityDossierModal
          university={selectedUniForModal}
          allUniversities={universities}
          onClose={() => setSelectedUniForModal(null)}
          onSelectUniversity={(u) => handleOpenDossier(u)}
          onOpenROI={(id) => setRoiModalUnivId(id)}
          onAskAdvisor={() => {
            if (onNavigateTab) {
              onNavigateTab('advisor');
            }
          }}
        />
      )}

      {/* ROI Calculator Modal */}
      {roiModalUnivId && (
        <ROICalculatorModal
          isOpen={!!roiModalUnivId}
          onClose={() => setRoiModalUnivId(null)}
          universities={universities}
          initialUniversityId={roiModalUnivId}
        />
      )}

      {/* Google Drive Workspace Hub Modal */}
      {isDriveModalOpen && (
        <Suspense fallback={null}>
          <GoogleDriveHubModal
            isOpen={isDriveModalOpen}
            onClose={() => setIsDriveModalOpen(false)}
            currentUniversity={selectedUniForModal || universities[0]}
          />
        </Suspense>
      )}
    </div>
  );
};
