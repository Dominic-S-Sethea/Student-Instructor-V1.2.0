import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  Calendar,
  DollarSign,
  Globe2,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  History,
  FileText,
  Clock,
  Building,
  Check,
  Share2,
} from 'lucide-react';
import { ScholarshipItem } from '../../types/scholarship';
import { useLanguage } from '../../context/LanguageContext';

interface ScholarshipDetailModalProps {
  scholarship: ScholarshipItem | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenReportModal: (scholarship: ScholarshipItem) => void;
}

export const ScholarshipDetailModal: React.FC<ScholarshipDetailModalProps> = ({
  scholarship,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onOpenReportModal,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'benefits' | 'process' | 'verification'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !scholarship) return null;

  const isKhmer = language === 'km';
  const name = isKhmer && scholarship.nameKm ? scholarship.nameKm : scholarship.name;
  const provider = isKhmer && scholarship.providerKm ? scholarship.providerKm : scholarship.provider;
  const country = isKhmer && scholarship.countryKm ? scholarship.countryKm : scholarship.country;
  const overview = isKhmer && scholarship.overviewKm ? scholarship.overviewKm : scholarship.overview;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Calculate days remaining
  const daysLeft = Math.ceil(
    (new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      id="scholarship-detail-modal"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close dialog"
            id="close-scholarship-detail"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              {scholarship.verificationStatus}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
              {scholarship.fundingType}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {scholarship.qualityScore}% Quality Score
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 leading-snug">
            {name}
          </h2>
          {isKhmer && scholarship.name && (
            <p className="text-sm text-emerald-200/80 mb-2 font-medium">{scholarship.name}</p>
          )}

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>{provider}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <span>{country} ({scholarship.region})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                Deadline: <strong className="text-white">{scholarship.deadline}</strong>
                {daysLeft > 0 ? ` (${daysLeft} days remaining)` : ' (Closed)'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 bg-emerald-50/70 border-b border-emerald-100 p-4 gap-4 text-center shrink-0">
          <div>
            <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Est. Grant Value</div>
            <div className="text-base font-bold text-emerald-950">
              ${scholarship.totalEstimatedValueUSD.toLocaleString()} USD
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Degrees</div>
            <div className="text-sm font-bold text-emerald-950 truncate">
              {scholarship.degreeLevel.join(', ')}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Monthly Allowance</div>
            <div className="text-sm font-bold text-emerald-950 truncate">
              {isKhmer ? scholarship.monthlyAllowanceKm : scholarship.monthlyAllowance}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Tuition Coverage</div>
            <div className="text-sm font-bold text-emerald-950 truncate">
              {scholarship.tuitionCoverage}
            </div>
          </div>
        </div>

        {/* Dossier Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/80 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: isKhmer ? 'ទិដ្ឋភាពទូទៅ' : 'Overview & Fields' },
            { id: 'eligibility', label: isKhmer ? 'លក្ខខណ្ឌតម្រូវ' : 'Eligibility & Docs' },
            { id: 'benefits', label: isKhmer ? 'អត្ថប្រយោជន៍' : 'Financial Package' },
            { id: 'process', label: isKhmer ? 'ដំណាក់កាលជ្រើសរើស' : 'Selection Timeline' },
            { id: 'verification', label: isKhmer ? 'ប្រវត្តិផ្ទៀងផ្ទាត់' : 'Verification & Audit' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Program Overview</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{overview}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Eligible Fields of Study</h4>
                <div className="flex flex-wrap gap-2">
                  {scholarship.fieldOfStudy.map((f) => (
                    <span
                      key={f}
                      className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium text-xs border border-slate-200"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Target Student Audience</h4>
                <div className="flex flex-wrap gap-2">
                  {scholarship.eligibleStudentCategories.map((c) => (
                    <span
                      key={c}
                      className="px-3 py-1 rounded-lg bg-teal-50 text-teal-800 font-semibold text-xs border border-teal-200"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                <Globe2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 space-y-1">
                  <span className="font-bold">Cambodian Applicant Note:</span>
                  <p>
                    {isKhmer
                      ? scholarship.nationalityRequirementKm
                      : scholarship.nationalityRequirement}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eligibility' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Minimum GPA</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {scholarship.minGpa ? `${scholarship.minGpa} / 4.0` : 'No hard minimum'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Language Test</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {scholarship.englishRequirement.minScore || 'Not specified'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    {scholarship.englishRequirement.testType}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Work Experience</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {scholarship.workExpYears > 0 ? `${scholarship.workExpYears}+ years` : '0 years (Fresh grads ok)'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">English Proficiency Details</h4>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  {isKhmer ? scholarship.englishRequirement.detailsKm : scholarship.englishRequirement.details}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Required Documents Checklist</h4>
                <div className="space-y-2">
                  {(isKhmer && scholarship.requiredDocumentsKm ? scholarship.requiredDocumentsKm : scholarship.requiredDocuments).map(
                    (doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-950 font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{doc}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Total Financial Coverage Package</h3>
              
              <div className="space-y-2.5">
                {[
                  { label: 'Tuition Coverage', val: isKhmer ? scholarship.tuitionCoverageKm : scholarship.tuitionCoverage, icon: DollarSign },
                  { label: 'Monthly Living Allowance', val: isKhmer ? scholarship.monthlyAllowanceKm : scholarship.monthlyAllowance, icon: DollarSign },
                  { label: 'Accommodation', val: isKhmer ? scholarship.accommodationKm : scholarship.accommodation, icon: Building },
                  { label: 'International Airfare Flight', val: isKhmer ? scholarship.flightSupportKm : scholarship.flightSupport, icon: Globe2 },
                  { label: 'Health Insurance', val: isKhmer ? scholarship.insuranceKm : scholarship.insurance, icon: ShieldCheck },
                ].map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 font-medium text-xs text-slate-600">
                      <b.icon className="w-4 h-4 text-emerald-600" />
                      <span>{b.label}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 text-right">{b.val}</span>
                  </div>
                ))}
              </div>

              {scholarship.otherBenefits.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Additional Perks & Allowances</h4>
                  <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                    {(isKhmer && scholarship.otherBenefitsKm ? scholarship.otherBenefitsKm : scholarship.otherBenefits).map((ben, idx) => (
                      <li key={idx}>{ben}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'process' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-900">Selection Stages & Key Milestones</h3>
              
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(isKhmer && scholarship.selectionStagesKm ? scholarship.selectionStagesKm : scholarship.selectionStages).map(
                  (stage, idx) => (
                    <div key={idx} className="relative flex items-start gap-3">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{stage}</div>
                        <div className="text-[11px] text-slate-500">Stage {idx + 1} of {scholarship.selectionStages.length}</div>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block mb-1">Notice on Deadlines:</span>
                Scholarship deadlines are strictly observed by embassies and committees. Please submit at least 5 business days ahead to account for timezone differences.
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-emerald-950 text-sm">Data Authenticity Guarantee</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Every entry in the Cambodia Scholarship Intelligence Platform (CSIP) is manually verified against government gazettes, university bursary pages, and embassy portals before publication.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-emerald-800">
                  <div>
                    <span className="text-emerald-600 block">Verified Date</span>
                    <strong>{scholarship.lastVerifiedDate}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-600 block">Quality Score</span>
                    <strong>{scholarship.qualityScore} / 100</strong>
                  </div>
                  <div>
                    <span className="text-emerald-600 block">Verifier</span>
                    <strong>{scholarship.verifierName}</strong>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Audit Trail & Change Detection Log</span>
                </h4>
                <div className="space-y-2">
                  {scholarship.changeHistory && scholarship.changeHistory.length > 0 ? (
                    scholarship.changeHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-800 capitalize">{item.field}</span>
                          <span className="text-slate-500 mx-1.5">•</span>
                          <span className="text-slate-600">{item.detectedBy}</span>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            From &ldquo;{item.oldValue}&rdquo; &rarr; &ldquo;{item.newValue}&rdquo;
                          </div>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">{item.date}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">No modifications recorded since initial verification.</div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <span className="text-slate-600">Official Source Reference:</span>
                <a
                  href={scholarship.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Verify at Official Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(scholarship.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isSaved
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4 text-slate-400" />}
              <span>{isSaved ? 'Saved to Bookmarks' : 'Bookmark & Track'}</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
              title="Share scholarship link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={() => onOpenReportModal(scholarship)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Report Error</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={scholarship.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
              id="apply-scholarship-button"
            >
              <span>Apply on Official Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
