import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Globe2,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  History,
  Tag,
  Search,
  BookOpen,
} from 'lucide-react';

interface PatchNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToScholarships?: () => void;
}

export const PatchNotesModal: React.FC<PatchNotesModalProps> = ({
  isOpen,
  onClose,
  onNavigateToScholarships,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<'v1.2.0' | 'v1.1.3' | 'v1.1.2' | 'v1.1.1' | 'v1.1.0'>('v1.2.0');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      id="patch-notes-modal"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-fadeIn">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 relative overflow-hidden shrink-0">
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500 text-white tracking-wider">
                  RELEASE NOTES
                </span>
                <span className="text-xs text-indigo-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Platform Version V1.2.0</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                What&apos;s New in Version V1.2.0
              </h2>
              <p className="text-xs text-slate-300">
                High School Pilot Validation Suite & Education Intelligence Platform (EIDP) • September 2026
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              aria-label="Close patch notes"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Version Selector Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 gap-3 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'v1.2.0', label: 'V1.2.0 (Current Release)', badge: 'Pilot & EIDP Suite', active: selectedVersion === 'v1.2.0' },
            { id: 'v1.1.3', label: 'V1.1.3', badge: 'EIDP Foundation', active: selectedVersion === 'v1.1.3' },
            { id: 'v1.1.2', label: 'V1.1.2', badge: 'Scholarship Search', active: selectedVersion === 'v1.1.2' },
            { id: 'v1.1.1', label: 'V1.1.1', badge: 'University Decision Engine', active: selectedVersion === 'v1.1.1' },
            { id: 'v1.1.0', label: 'V1.1.0', badge: 'Mentorship & STEM Lab', active: selectedVersion === 'v1.1.0' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVersion(v.id as any)}
              className={`py-3 px-3 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
                v.active
                  ? 'border-indigo-600 text-indigo-900 bg-white font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{v.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${v.active ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'}`}>
                {v.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-700 text-xs sm:text-sm space-y-6">
          {selectedVersion === 'v1.2.0' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span>Platform Version V1.2.0 — Milestone Release</span>
                </div>
                <p className="text-indigo-950 leading-relaxed text-xs">
                  Version <strong>V1.2.0</strong> is the major operational release uniting the <strong>Grade 10–12 High School Pilot Validation Suite</strong> and the <strong>Education Intelligence Data Platform (EIDP)</strong>. Designed for real-world deployment across Cambodian high schools, this version delivers sovereign data governance, school director analytics, and longitudinal student decision support.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">1</span>
                    Grade 10–12 Pilot Program & User Acquisition Playbook
                  </h5>
                  <p className="text-xs text-slate-600 pl-8">
                    Turnkey 8-week school pilot structure, First 100/500/1,000 user acquisition channels, student ambassador playbook, and live Bac II mock prediction algorithms for high school seniors.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">2</span>
                    Education Intelligence Data Platform (EIDP)
                  </h5>
                  <p className="text-xs text-slate-600 pl-8">
                    Tiered storage architecture comprising an Operational SQLite/WAL transactional database, Columnar Lakehouse for longitudinal analysis, Vector Engine for semantic matching, and Dual-Tier online/offline Feature Store.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">3</span>
                    Triple-Lock Sovereign Privacy & Child Safety
                  </h5>
                  <p className="text-xs text-slate-600 pl-8">
                    Multi-party consent protocol across student, parent, and school director with zero behavioral tracking, sovereign JSON export, and full Cambodian E-Commerce Law compliance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedVersion === 'v1.1.3' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span>Platform Version V1.1.3</span>
                </div>
                <p className="text-indigo-950 leading-relaxed text-xs">
                  Delivered the core Education Intelligence Data Platform (EIDP) architectural specifications and preliminary data pipelines.
                </p>
              </div>
            </div>
          )}

          {selectedVersion === 'v1.1.2' && (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Platform Version Updated to V1.1.2</span>
                </div>
                <p className="text-emerald-950 leading-relaxed text-xs">
                  Version <strong>V1.1.2</strong> introduces the <strong>Cambodia Scholarship Intelligence Platform (CSIP)</strong>, fulfilling the CTO product strategy for a trusted, structured, and regularly verified global scholarship search platform.
                </p>
              </div>

              {/* Detailed Pillars */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Key Features & Architecture in V1.1.2</span>
                </h4>

                {/* Feature 1 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">1</span>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Fixed &ldquo;Scholarship&rdquo; Header Tab (Bilingual English & Khmer)
                    </h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-8">
                    Placed adjacent to the &ldquo;University Intel&rdquo; header across both desktop and mobile navigation bars. Fully translated into Khmer Unicode (<strong>អាហារូបករណ៍</strong>) and English, supporting draggable navigation with visible scroll controls.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">2</span>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Dedicated Scholarship Search Engine (Phase 1 Strategy)
                    </h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-8">
                    Built as a laser-focused search and discovery engine rather than an AI counselor or marketplace. Enforces strict data reliability with a <strong>98%+ verification score guarantee</strong>.
                  </p>
                  <ul className="text-xs text-slate-600 list-disc list-inside pl-8 space-y-1">
                    <li><strong>Global & Domestic Coverage</strong>: 150+ verified opportunities including Chevening UK, Fulbright USA, Australia Awards, CADT MPTC Talent, Japan MEXT, Korea GKS, France Eiffel, Erasmus+, and Singapore ASEAN scholarships.</li>
                    <li><strong>Estimated Funding Value</strong>: Displays total grant pool ($12.5M+ USD in tuition waivers, monthly living allowances, flight tickets, and health coverage).</li>
                  </ul>
                </div>

                {/* Feature 3 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">3</span>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Option C User Registration & Live Deadline Reminders
                    </h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-8">
                    Students can search and filter the entire catalog freely without login friction. Optional 1-click student account allows saving favorites, tracking deadlines (<span className="text-rose-600 font-bold">&lt; 14 days</span> urgent badge), and managing notification preferences.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">4</span>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Multi-Dimensional Filter Suite
                    </h5>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 text-xs text-slate-600">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <strong>Region:</strong> Cambodia, ASEAN, Japan, Korea, China, Singapore, Australia, Europe, USA, Canada, Global.
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <strong>Degree Level:</strong> Bachelor, Master, PhD.
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <strong>Funding Scope:</strong> Fully funded (100% + stipend), Tuition only, Partial grant.
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <strong>Field of Study:</strong> CS & AI, Engineering, Business, Medicine, Agriculture, Education.
                    </div>
                  </div>
                </div>

                {/* Feature 5 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">5</span>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Data Quality Governance & Verification Architecture
                    </h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-8">
                    Implemented the complete 4-stage data pipeline and community accountability workflows:
                  </p>
                  <ul className="text-xs text-slate-600 list-disc list-inside pl-8 space-y-1">
                    <li><strong>AI Data Collection</strong>: Gemini Flash parser converts unstructured embassy text into validated scholarship records.</li>
                    <li><strong>Change Detection Bot</strong>: Continuous portal diff simulations that detect shifted deadlines and generate audit trail records.</li>
                    <li><strong>Organization Submissions Portal</strong>: Allows universities and foundations to submit programs subject to editorial sign-off.</li>
                    <li><strong>User Error Reporting Modal</strong>: Crowdsourced reporting tool for students to report broken links or modified criteria.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedVersion === 'v1.1.1' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
                <div className="font-bold text-sm text-blue-900">Version V1.1.1 Highlights</div>
                <p>Delivered the Student Decision Intelligence System and University Intelligence Matrix.</p>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
                <li>6-Stage Guided Cognitive Fit Assessment Engine.</li>
                <li>Comprehensive Profiles for 12 Top Cambodian Universities (CADT, ITC, RUPP, Paragon, AUPP, PUC, Norton, etc.).</li>
                <li>Interactive 4-Year Tuition & Graduate ROI Calculator Modal.</li>
                <li>Side-by-side University Comparison Engine across accreditation, faculty, and starting salaries.</li>
              </ul>
            </div>
          )}

          {selectedVersion === 'v1.1.0' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-1">
                <div className="font-bold text-sm text-purple-900">Version V1.1.0 Highlights</div>
                <p>Initial foundation for student mentorship, AI advising, and career discovery.</p>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
                <li>1-on-1 Senior Student & Alumni Mentorship Booking system.</li>
                <li>STEM Self-Discovery Quests & Interactive Career Roadmaps.</li>
                <li>Bac II Study Meetups & Community Discussion Forum.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-medium">
            Platform: <strong>Remix Remix Student Instructor V1.2.0</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
            {onNavigateToScholarships && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToScholarships();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-all"
              >
                <span>Explore Scholarships</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
