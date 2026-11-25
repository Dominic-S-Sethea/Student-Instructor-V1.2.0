import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Plus,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Eye,
  Check,
  FileSearch,
  Database,
  Search,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ScholarshipItem,
  OrganizationSubmission,
  UserErrorReport,
  ScholarshipRegion,
  DegreeLevel,
  FieldOfStudy,
  FundingType,
} from '../../types/scholarship';
import { scholarshipClient } from '../../services/scholarshipClient';
import { apiFetchRaw } from '../../services/apiClient';
import { useEscapeKey } from '../../hooks/useModalAccessibility';
import { getSafeHttpUrl } from '../../utils/safeUrl';

interface ScholarshipAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  scholarships: ScholarshipItem[];
  onRefreshData: () => void;
}

export const ScholarshipAdminModal: React.FC<ScholarshipAdminModalProps> = ({
  isOpen,
  onClose,
  scholarships,
  onRefreshData,
}) => {
  type AdminTabId = 'submissions' | 'reports' | 'database' | 'ai-extractor' | 'change-detection';
  const [adminTab, setAdminTab] = useState<AdminTabId>('submissions');
  const [submissions, setSubmissions] = useState<OrganizationSubmission[]>([]);
  const [reports, setReports] = useState<UserErrorReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEscapeKey(isOpen, onClose);

  // AI Extraction state
  const [rawText, setRawText] = useState(
    `Japan Government (MEXT) Undergraduate Scholarship 2027:
The Embassy of Japan in Cambodia invites high school graduates to apply for full scholarship in Japan.
Eligibility: Cambodian national born on or after April 2, 2002. High school diploma with minimum GPA 3.2.
Coverage: 100% Tuition fee waived, monthly stipend of 120,000 JPY, round-trip airfare included.
Fields: Engineering, Information Technology, Business Administration, Humanities.
Application Deadline: June 15, 2026.
Application forms must be submitted through Ministry of Education, Youth and Sport (MoEYS).`
  );
  const [extractedResult, setExtractedResult] = useState<Record<string, unknown> | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Change Detection simulation
  const [changeDetectionLog, setChangeDetectionLog] = useState<string | null>(null);
  const [isCheckingChanges, setIsCheckingChanges] = useState(false);

  // New scholarship form in admin
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchName, setNewSchName] = useState('');
  const [newSchProvider, setNewSchProvider] = useState('');
  const [newSchCountry, setNewSchCountry] = useState('Cambodia');
  const [newSchRegion, setNewSchRegion] = useState<ScholarshipRegion>('Cambodia');
  const [newSchFunding, setNewSchFunding] = useState<FundingType>('Fully funded');
  const [newSchDeadline, setNewSchDeadline] = useState('2026-12-31');
  const [newSchValue, setNewSchValue] = useState('20000');
  const [newSchLink, setNewSchLink] = useState('https://');

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [subs, reps] = await Promise.all([
        scholarshipClient.listSubmissions(),
        scholarshipClient.listErrorReports(),
      ]);
      setSubmissions(subs);
      setReports(reps);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const notifySuccess = (msg: string) => {
    setActionError(null);
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const notifyError = (err: unknown, fallback: string) => {
    setActionSuccess(null);
    setActionError(err instanceof Error ? err.message : fallback);
  };

  const handleApproveSubmission = async (subId: string) => {
    try {
      await scholarshipClient.reviewSubmission(subId, 'approve');
      notifySuccess('Submission approved & published with verified status!');
      void loadAdminData();
      onRefreshData();
    } catch (err) {
      notifyError(err, 'Failed to approve submission.');
    }
  };

  const handleRejectSubmission = async (subId: string) => {
    try {
      await scholarshipClient.reviewSubmission(subId, 'reject', 'Could not verify official domain');
      notifySuccess('Submission marked as rejected.');
      void loadAdminData();
    } catch (err) {
      notifyError(err, 'Failed to reject submission.');
    }
  };

  const handleResolveReport = async (repId: string, applyFix: boolean) => {
    try {
      await scholarshipClient.resolveErrorReport(
        repId,
        applyFix ? 'Verified & Fixed' : 'Dismissed',
        undefined,
        applyFix
      );
      notifySuccess(applyFix ? 'Report resolved and correction applied.' : 'Report dismissed.');
      void loadAdminData();
      onRefreshData();
    } catch (err) {
      notifyError(err, 'Failed to resolve report.');
    }
  };

  const handleVerifyScholarship = async (id: string) => {
    try {
      await scholarshipClient.verifyScholarship(id);
      notifySuccess('Scholarship verified and timestamp refreshed!');
      onRefreshData();
    } catch (err) {
      notifyError(err, 'Failed to verify scholarship.');
    }
  };

  const handleDeleteScholarship = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship entry?')) return;
    try {
      await apiFetchRaw(`/api/scholarships/${encodeURIComponent(id)}`, { method: 'DELETE' });
      notifySuccess('Scholarship removed from database.');
      onRefreshData();
    } catch (err) {
      notifyError(err, 'Failed to delete scholarship.');
    }
  };

  const handleCreateNewScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetchRaw('/api/scholarships', {
        method: 'POST',
        body: JSON.stringify({
          name: newSchName,
          provider: newSchProvider,
          country: newSchCountry,
          region: newSchRegion,
          fundingType: newSchFunding,
          deadline: newSchDeadline,
          totalEstimatedValueUSD: newSchValue ? Number(newSchValue) : null,
          applicationLink: newSchLink,
          overview: `Official scholarship provided by ${newSchProvider}.`,
        }),
      });
      notifySuccess('New scholarship published successfully!');
      setShowAddForm(false);
      setNewSchName('');
      setNewSchProvider('');
      onRefreshData();
    } catch (err) {
      notifyError(err, 'Failed to publish scholarship.');
    }
  };

  const handleRunAiExtraction = async () => {
    setIsExtracting(true);
    setActionError(null);
    try {
      const res = await apiFetchRaw<{ success: boolean; extractedData?: Record<string, unknown>; data?: Record<string, unknown> }>(
        '/api/scholarships/extract',
        { method: 'POST', body: JSON.stringify({ rawText }) }
      );
      setExtractedResult(res.extractedData || res.data || null);
    } catch (err) {
      notifyError(err, 'AI extraction failed.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRunChangeDetection = async () => {
    setIsCheckingChanges(true);
    setActionError(null);
    try {
      const data = await scholarshipClient.checkUpdates(scholarships[0]?.id || 'sch-chevening-uk');
      setChangeDetectionLog(data.message);
      onRefreshData();
    } catch (err) {
      notifyError(err, 'Source check failed.');
    } finally {
      setIsCheckingChanges(false);
    }
  };

  if (!isOpen) return null;

  const pendingSubmissionsCount = submissions.filter((s) => s.status === 'Pending Admin Review').length;
  const pendingReportsCount = reports.filter((r) => r.status === 'Pending Review').length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="CSIP Editorial and Verification Admin"
      id="scholarship-admin-modal"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">CSIP Editorial & Verification Admin</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950 uppercase">
                  Production Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cambodia Scholarship Intelligence Platform • Data Quality & Verification Governance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Toast Messages */}
        {actionSuccess && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center gap-2 shrink-0 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="bg-rose-600 text-white px-6 py-2.5 text-xs font-bold flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Nav Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 shrink-0 overflow-x-auto no-scrollbar gap-2 pt-2">
          {(
            [
              { id: 'submissions', label: 'Organization Submissions', badge: pendingSubmissionsCount, icon: Building2 },
              { id: 'reports', label: 'User Error Reports', badge: pendingReportsCount, icon: AlertTriangle },
              { id: 'database', label: `Database (${scholarships.length})`, badge: null, icon: Database },
              { id: 'ai-extractor', label: 'AI Data Collection Pipeline', badge: null, icon: Sparkles },
              { id: 'change-detection', label: 'Change Detection & Auditing', badge: null, icon: RefreshCw },
            ] as Array<{ id: AdminTabId; label: string; badge: number | null; icon: React.ComponentType<{ className?: string }> }>
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`py-3 px-3 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-1.5 transition-colors ${
                  adminTab === tab.id
                    ? 'border-emerald-600 text-emerald-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-700">
          {/* TAB 1: SUBMISSIONS */}
          {adminTab === 'submissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Pending Organization Submissions</h4>
                  <p className="text-slate-500">
                    Review and verify incoming scholarship programs submitted by universities and foundations.
                  </p>
                </div>
                <button
                  onClick={loadAdminData}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {submissions.length === 0 ? (
                <div className="py-12 text-center text-slate-400">No submissions in queue.</div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900 text-sm">{sub.scholarshipName}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.status === 'Approved & Published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : sub.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </div>
                          <div className="text-slate-600 font-medium">
                            Submitted by: <strong>{sub.organizationName}</strong> ({sub.contactPerson} • {sub.contactEmail})
                          </div>
                          <div className="text-slate-500 mt-1">
                            Destination: {sub.country} ({sub.region}) • Funding: {sub.fundingType} • Deadline: {sub.deadline}
                          </div>
                          <p className="text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {sub.fundingDetails}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        {getSafeHttpUrl(sub.officialWebsite) ? (
                          <a
                            href={getSafeHttpUrl(sub.officialWebsite)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                          >
                            <span>Official Portal ({sub.officialWebsite})</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">Invalid portal URL</span>
                        )}

                        {sub.status === 'Pending Admin Review' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRejectSubmission(sub.id)}
                              className="px-3 py-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveSubmission(sub.id)}
                              className="px-4 py-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 font-bold transition-all shadow-xs flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve & Publish to CSIP</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: USER ERROR REPORTS */}
          {adminTab === 'reports' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">User Error & Accuracy Reports</h4>
                <p className="text-slate-500">
                  Crowdsourced discrepancy reports submitted by students to ensure zero stale deadlines or dead links.
                </p>
              </div>

              {reports.length === 0 ? (
                <div className="py-12 text-center text-slate-400">No active reports.</div>
              ) : (
                <div className="space-y-3">
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900 text-sm">{rep.scholarshipName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                              Issue: {rep.reportedField}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500">{rep.status}</span>
                          </div>
                          <p className="text-slate-700 mt-1 font-medium">{rep.description}</p>
                          {rep.suggestedCorrection && (
                            <div className="mt-2 text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                              <strong>Suggested Correction:</strong> {rep.suggestedCorrection}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400 mt-1">
                            Reported by {rep.reporterEmail} on {new Date(rep.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {rep.status === 'Pending Review' && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleResolveReport(rep.id, false)}
                            className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                          >
                            Dismiss / Invalid
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep.id, true)}
                            className="px-4 py-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 font-bold flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Apply Fix & Resolve</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DATABASE MANAGEMENT */}
          {adminTab === 'database' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Scholarship Master Catalog</h4>
                  <p className="text-slate-500">{scholarships.length} published scholarship programs</p>
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddForm ? 'Close Form' : 'Add New Scholarship'}</span>
                </button>
              </div>

              {showAddForm && (
                <form
                  onSubmit={handleCreateNewScholarship}
                  className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-3"
                >
                  <h5 className="font-bold text-emerald-950">Quick-Add Verified Scholarship</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Scholarship Name</label>
                      <input
                        type="text"
                        required
                        value={newSchName}
                        onChange={(e) => setNewSchName(e.target.value)}
                        placeholder="e.g. Fulbright Foreign Student Program"
                        className="w-full p-2 bg-white rounded-lg border border-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Provider / Embassy</label>
                      <input
                        type="text"
                        required
                        value={newSchProvider}
                        onChange={(e) => setNewSchProvider(e.target.value)}
                        placeholder="e.g. U.S. Department of State"
                        className="w-full p-2 bg-white rounded-lg border border-slate-300 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Country</label>
                      <input
                        type="text"
                        value={newSchCountry}
                        onChange={(e) => setNewSchCountry(e.target.value)}
                        className="w-full p-2 bg-white rounded-lg border border-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Region</label>
                      <select
                        value={newSchRegion}
                        onChange={(e) => setNewSchRegion(e.target.value as ScholarshipRegion)}
                        className="w-full p-2 bg-white rounded-lg border border-slate-300 text-slate-900"
                      >
                        <option value="USA">USA</option>
                        <option value="Europe">Europe</option>
                        <option value="Australia">Australia</option>
                        <option value="Japan">Japan</option>
                        <option value="Korea">Korea</option>
                        <option value="China">China</option>
                        <option value="Singapore">Singapore</option>
                        <option value="ASEAN">ASEAN</option>
                        <option value="Cambodia">Cambodia</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Deadline</label>
                      <input
                        type="date"
                        required
                        value={newSchDeadline}
                        onChange={(e) => setNewSchDeadline(e.target.value)}
                        className="w-full p-2 bg-white rounded-lg border border-slate-300 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white font-bold"
                    >
                      Publish to Catalog
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {scholarships.map((sch) => (
                  <div
                    key={sch.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{sch.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {sch.qualityScore}%
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 font-medium">{sch.country}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {sch.provider} • Deadline: {sch.deadline} • Last Verified: {sch.lastVerifiedDate}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleVerifyScholarship(sch.id)}
                        className="px-2.5 py-1 rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold border border-emerald-200 transition-colors"
                        title="Re-verify and refresh timestamp"
                      >
                        Verify Now
                      </button>
                      <button
                        onClick={() => handleDeleteScholarship(sch.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete scholarship"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AI DATA COLLECTION ARCHITECTURE & EXTRACTION TEST */}
          {adminTab === 'ai-extractor' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-emerald-400">AI Data Collection System Architecture</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  The CSIP data ingestion pipeline operates in 4 strict stages to eliminate inaccuracies:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="font-bold text-emerald-300 block mb-1">1. Web Crawler</span>
                    Monitors 140+ official university portals, embassy circulars, and MoEYS announcements.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="font-bold text-emerald-300 block mb-1">2. Gemini Flash Parser</span>
                    Extracts structured JSON: eligibility, English test, stipend, deadlines, Khmer titles.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="font-bold text-emerald-300 block mb-1">3. Schema Validation</span>
                    Validates required fields, GPA numeric limits, and ISO deadline formats.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="font-bold text-emerald-300 block mb-1">4. Human Editorial Sign-Off</span>
                    Senior Cambodian verifier double-checks before publishing.
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Live AI Announcement Extraction Test</h4>
                <p className="text-slate-500">
                  Paste raw scholarship announcement text from an embassy or university. Gemini will extract clean, structured database fields.
                </p>

                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={6}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Powered by @google/genai &amp; gemini-3.5-flash-lite</span>
                  <button
                    onClick={handleRunAiExtraction}
                    disabled={isExtracting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isExtracting ? 'Extracting with Gemini...' : 'Run Live AI Extraction'}</span>
                  </button>
                </div>

                {extractedResult && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Extracted Structured JSON Result</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        Ready for Validation
                      </span>
                    </div>
                    <pre className="p-3 bg-slate-900 text-emerald-300 rounded-lg text-[11px] overflow-x-auto">
                      {JSON.stringify(extractedResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CHANGE DETECTION & AUDITING */}
          {adminTab === 'change-detection' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-teal-800" />
                  <span className="font-bold text-teal-950">Continuous Source Change Detection Bot</span>
                </div>
                <p className="text-teal-900 leading-relaxed text-xs">
                  Official scholarship websites frequently update deadlines, cancel cohorts, or revise stipends. Our change detection engine periodically performs diffs on official source pages and alerts administrators if a deadline shifts.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleRunChangeDetection}
                    disabled={isCheckingChanges}
                    className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingChanges ? 'animate-spin' : ''}`} />
                    <span>{isCheckingChanges ? 'Running Portal Diff...' : 'Simulate Source Check & Diff'}</span>
                  </button>
                </div>
              </div>

              {changeDetectionLog && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium space-y-1 animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Change Detected & Audit Record Created</span>
                  </div>
                  <p>{changeDetectionLog}</p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Recent Change Audits Across Database
                </h4>
                <div className="space-y-2">
                  {scholarships.flatMap((s) => s.changeHistory || []).slice(0, 8).map((ch) => (
                    <div
                      key={ch.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{ch.detectedBy}</span>
                        <span className="text-slate-400 mx-1.5">•</span>
                        <span className="text-slate-600 capitalize">Field: {ch.field}</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Old: &ldquo;{ch.oldValue}&rdquo; &rarr; New: &ldquo;{ch.newValue}&rdquo;
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-mono text-slate-400">{ch.date}</span>
                        <div className="text-[10px] font-bold text-emerald-700">Verified</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
