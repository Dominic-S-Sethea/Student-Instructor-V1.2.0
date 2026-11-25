import React from 'react';
import { TopUniversityAidProgram } from '../../types/topUniversityScholarships';
import { X, ExternalLink, Award, DollarSign, Calendar, CheckCircle2, GraduationCap, Lightbulb, Globe, MapPin } from 'lucide-react';

interface TopUniversityDossierModalProps {
  program: TopUniversityAidProgram | null;
  onClose: () => void;
}

export const TopUniversityDossierModal: React.FC<TopUniversityDossierModalProps> = ({ program, onClose }) => {
  if (!program) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Calm Emerald Gradient Accent */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 p-6 text-white relative overflow-hidden">
          {/* Subtle Watermark of Official Crest in Modal Header */}
          <div className="absolute right-12 -bottom-6 w-36 h-36 opacity-25 pointer-events-none select-none flex items-center justify-center">
            <img
              src={`/crests/${program.id}.png`}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain filter brightness-110 drop-shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-black/20 rounded-full transition z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2 relative z-10">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-black/30 backdrop-blur-sm text-emerald-100 border border-emerald-400/30">
              {program.badge}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white">
              QS Rank: #{program.qsWorldRank} | THE Rank: #{program.theWorldRank}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white">
              {program.region}
            </span>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/95 p-1.5 shadow-md flex items-center justify-center shrink-0 border border-white">
              <img
                src={`/crests/${program.id}.png`}
                alt={`${program.universityName} Crest`}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-sm">
                {program.universityName}
              </h2>
              <div className="flex items-center gap-2 text-emerald-100 mt-0.5 text-sm font-medium">
                <MapPin className="w-4 h-4 inline shrink-0" />
                <span>{program.city}, {program.country}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-sm sm:text-base">
          {/* Main Fellowship Highlight Box */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 rounded-xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                <Award className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                  Flagship Fellowship &amp; Aid Scheme
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-100 mt-0.5">
                  {program.fellowshipName}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300/60 dark:border-emerald-700">
                    <DollarSign className="w-3.5 h-3.5" />
                    Coverage: {program.fundingCoverage}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-800">
                    Estimated Value: ~${program.estimatedAnnualValueUSD.toLocaleString()} / year
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 border border-blue-300/60 dark:border-blue-800">
                    Type: {program.fellowshipType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Global Standing & Ranking Benchmark Card */}
          <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                  Global Ranking Benchmark & Institutional Standing
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                World-Class Tier
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {/* QS World Ranking */}
              <div className="bg-slate-800/90 rounded-lg p-3 border border-slate-700/80">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                  QS World University Rankings
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                  #{program.qsWorldRank} <span className="text-xs font-normal text-slate-400">worldwide</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Evaluates global academic reputation, employer reputation, research citations per faculty, and international faculty ratio.
                </p>
              </div>

              {/* Times Higher Education Ranking */}
              <div className="bg-slate-800/90 rounded-lg p-3 border border-slate-700/80">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                  Times Higher Education (THE) World Rankings
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                  #{program.theWorldRank} <span className="text-xs font-normal text-slate-400">worldwide</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Evaluates teaching environment, research volume, citation influence, international outlook, and industry knowledge transfer.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              <span className="font-semibold text-emerald-300">Methodology Note:</span> Different global league tables use distinct assessment criteria. QS places higher weight on international academic peer review and employer esteem, whereas THE emphasizes research citations and funding. Providing both rankings gives applicants an objective, multi-dimensional view of university prestige.
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Applicable Degree Levels</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {program.degreeLevels.map((lvl) => (
                  <span key={lvl} className="px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    {lvl}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Application Deadline &amp; Cycle</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {program.applicationDeadline}
              </p>
            </div>
          </div>

          {/* Application Mechanism & Test Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Application Mechanism
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {program.applicationMechanism}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {program.applicationMechanism === 'Automatic with Admission' && 'Evaluated automatically with your application; no secondary form needed.'}
                {program.applicationMechanism === 'CSS Profile / Financial Aid App' && 'Requires submission of College Board CSS Profile or institutional financial dossier.'}
                {program.applicationMechanism === 'Separate Fellowship App' && 'Requires a distinct fellowship application essay and references.'}
                {program.applicationMechanism === 'Direct University Nomination' && 'Selected by academic faculty committee based on professor agreement.'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Standardized Testing &amp; Language
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {program.standardizedTests}
              </p>
            </div>
          </div>

          {/* Program Key Highlights */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Key Benefits &amp; Institutional Strengths
            </h4>
            <ul className="space-y-2">
              {program.keyHighlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strategic Advice for Cambodian Students */}
          <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800 rounded-xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wide">
                  Strategic Guidance for Cambodian Applicants
                </h4>
                <p className="text-sm text-amber-900 dark:text-amber-100 mt-1.5 leading-relaxed">
                  {program.strategicTipsForCambodians}
                </p>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-2 italic">
                  Note: {program.cambodianEligibilityNotes}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Always verify specific departmental requirements on the official website.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Close
            </button>
            <a
              href={program.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition"
            >
              <span>Visit University Financial Aid Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
