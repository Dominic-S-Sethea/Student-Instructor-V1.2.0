import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Bookmark,
  ExternalLink,
  Calendar,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { OpportunityItem } from '../types';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { useLanguage } from '../context/LanguageContext';

interface OpportunityDirectoryProps {
  opportunities: OpportunityItem[];
  savedOpportunityIds: string[];
  onToggleSaveOpportunity: (oppId: string) => void;
}

export const OpportunityDirectory: React.FC<OpportunityDirectoryProps> = ({
  opportunities,
  savedOpportunityIds,
  onToggleSaveOpportunity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const { t } = useLanguage();
  const filterScroll = useDraggableScroll<HTMLDivElement>();

  const types = ['ALL', 'Scholarship', 'Internship', 'Bootcamp'];

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesType = selectedType === 'ALL' || opp.type === selectedType;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      opp.title.toLowerCase().includes(q) ||
      opp.provider.toLowerCase().includes(q) ||
      opp.tags.some((t) => t.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              Curated Opportunities & Scholarships
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Verified scholarships, student seed grants, internships, and skill bootcamps matched to your academic profile.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center space-x-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI Profile Matching Active</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholarships (MPTC, SmartEdu, internships)..."
            className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="relative flex items-center w-full sm:w-auto">
          {filterScroll.canScrollLeft && (
            <button
              type="button"
              onClick={filterScroll.scrollLeft}
              className="absolute -left-2 z-20 p-1 rounded-full bg-white shadow-md border border-stone-200 text-stone-700 hover:text-indigo-600"
              aria-label="Scroll filters left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          <div
            ref={filterScroll.ref}
            {...filterScroll.events}
            className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 select-none w-full sm:w-auto ${
              filterScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            title={t('nav.dragHint', 'Drag left & right to view all categories')}
          >
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedType === type
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {type === 'ALL' ? 'All Opportunities' : `${type}s`}
              </button>
            ))}
          </div>

          {filterScroll.canScrollRight && (
            <button
              type="button"
              onClick={filterScroll.scrollRight}
              className="absolute -right-2 z-20 p-1 rounded-full bg-white shadow-md border border-stone-200 text-stone-700 hover:text-indigo-600"
              aria-label="Scroll filters right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Opportunity Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredOpportunities.map((opp) => {
          const isSaved = savedOpportunityIds.includes(opp.id);
          return (
            <div
              key={opp.id}
              className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        {opp.type}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 flex items-center space-x-0.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>{opp.matchScore}% Match</span>
                      </span>
                    </div>

                    <h2 className="font-bold text-stone-900 text-base leading-snug">
                      {opp.title}
                    </h2>
                    <p className="text-xs text-stone-500 font-medium">{opp.provider}</p>
                  </div>

                  <button
                    onClick={() => onToggleSaveOpportunity(opp.id)}
                    className={`p-2 rounded-xl transition-colors shrink-0 ${
                      isSaved
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                    }`}
                    title={isSaved ? 'Saved' : 'Bookmark'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
                  </button>
                </div>

                {/* Coverage / Stipend Callout */}
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">Award / Coverage:</span>
                  <span className="font-bold text-stone-900">{opp.coverageOrStipend}</span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                  {opp.description}
                </p>

                {/* Eligibility checklist */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-stone-700 block uppercase tracking-wider">
                    Key Eligibility:
                  </span>
                  <ul className="space-y-1 text-xs text-stone-600">
                    {opp.eligibility.map((el, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{el}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opp.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Deadline: {opp.deadline}</span>
                </span>

                <a
                  href={opp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-colors flex items-center space-x-1"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
