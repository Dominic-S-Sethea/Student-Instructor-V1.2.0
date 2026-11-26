import React, { useEffect, useState } from 'react';
import {
  Search,
  Building2,
  CheckCircle2,
  Scale,
  Calculator,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ComprehensiveUniversityProfile, TabView } from '../types';
import { UniversityComparisonEngine } from './UniversityComparisonEngine';
import { ROICalculatorModal } from './ROICalculatorModal';
import { UniversityDossierModal } from './UniversityDossierModal';
import { UniversityQuickStrip } from './universities/UniversityQuickStrip';
import { UniversityCatalogCard } from './universities/UniversityCatalogCard';
import { analytics } from '../utils/analytics';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { useLanguage } from '../context/LanguageContext';

type UniversityTypeFilter = 'all' | 'Public' | 'Private' | 'Semi-Autonomous';

interface Props {
  universities: ComprehensiveUniversityProfile[];
  initialSelectedUniversityId?: string | null;
  onConsumeInitialSelection?: () => void;
  onNavigateTab?: (tab: TabView) => void;
  onStartAIChatWithPrompt?: (prompt: string) => void;
  onOpenBookingWithSenior?: (universityAbbr: string) => void;
  isLoadingLive?: boolean;
  liveError?: string | null;
  onRetryLive?: () => void;
  externalSubTab?: 'profiles' | 'compare';
  externalSubTabNonce?: number;
}

export const UniversityIntelligenceView: React.FC<Props> = ({
  universities,
  initialSelectedUniversityId,
  onConsumeInitialSelection,
  onNavigateTab,
  onStartAIChatWithPrompt,
  liveError,
  onRetryLive,
  externalSubTab,
  externalSubTabNonce,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profiles' | 'compare' | 'roi'>(
    externalSubTab || 'profiles'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<UniversityTypeFilter>('all');
  const [onlyScholarships, setOnlyScholarships] = useState(false);
  const [selectedUniForModal, setSelectedUniForModal] = useState<ComprehensiveUniversityProfile | null>(null);
  const [roiModalUnivId, setRoiModalUnivId] = useState<string | null>(null);

  useEffect(() => {
    if (externalSubTab && externalSubTabNonce) {
      setActiveSubTab(externalSubTab);
    }
  }, [externalSubTab, externalSubTabNonce]);

  const { t } = useLanguage();
  const subtabScroll = useDraggableScroll<HTMLDivElement>();
  const filterScroll = useDraggableScroll<HTMLDivElement>();

  useEffect(() => {
    if (!initialSelectedUniversityId) return;
    const match = universities.find((u) => u.id === initialSelectedUniversityId);
    if (match) {
      setSelectedUniForModal(match);
      onConsumeInitialSelection?.();
    }
  }, [initialSelectedUniversityId, universities, onConsumeInitialSelection]);

  const filteredUniversities = universities.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.abbr.toLowerCase().includes(q) ||
      (u.khmerName && u.khmerName.includes(searchQuery)) ||
      u.majors.some((m) => m.name.toLowerCase().includes(q));
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
            onClick={() => onNavigateTab?.('decision-engine')}
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

      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
        <div className="relative flex-1 min-w-0 flex items-center">
          <div ref={subtabScroll.ref} {...subtabScroll.events} className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 w-full">
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

      <UniversityQuickStrip
        universities={universities}
        selectedId={selectedUniForModal?.id}
        onSelect={handleOpenDossier}
      />

      {activeSubTab === 'compare' ? (
        <UniversityComparisonEngine
          universities={universities}
          onOpenROI={(id) => setRoiModalUnivId(id)}
          onOpenUniversityDetails={handleOpenDossier}
        />
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
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

            <div ref={filterScroll.ref} {...filterScroll.events} className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                {(['all', 'Public', 'Private', 'Semi-Autonomous'] as const).map((type) => (
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
                    {type === 'all'
                      ? t('uni.allTypes', 'All Types')
                      : type === 'Public'
                        ? t('uni.public', 'Public')
                        : type === 'Private'
                          ? t('uni.private', 'Private')
                          : 'Semi-Autonomous'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((univ) => (
              <UniversityCatalogCard
                key={univ.id}
                univ={univ}
                onOpenDossier={handleOpenDossier}
                onOpenROI={(id) => setRoiModalUnivId(id)}
              />
            ))}
          </div>
        </>
      )}

      {selectedUniForModal && (
        <UniversityDossierModal
          university={selectedUniForModal}
          allUniversities={universities}
          onClose={() => setSelectedUniForModal(null)}
          onSelectUniversity={handleOpenDossier}
          onOpenROI={(id) => setRoiModalUnivId(id)}
          onAskAdvisor={(prompt) => {
            setSelectedUniForModal(null);
            if (prompt && onStartAIChatWithPrompt) {
              onStartAIChatWithPrompt(prompt);
            } else {
              onNavigateTab?.('advisor');
            }
          }}
        />
      )}

      {roiModalUnivId && (
        <ROICalculatorModal
          isOpen={!!roiModalUnivId}
          onClose={() => setRoiModalUnivId(null)}
          universities={universities}
          initialUniversityId={roiModalUnivId}
        />
      )}
    </div>
  );
};
