import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { ScholarshipItem, UserErrorReport } from '../../types/scholarship';
import { scholarshipClient } from '../../services/scholarshipClient';
import { useAuth } from '../../context/AuthContext';
import { useEscapeKey } from '../../hooks/useModalAccessibility';

type ReportedField = UserErrorReport['reportedField'];

interface ScholarshipErrorReportModalProps {
  scholarship: ScholarshipItem | null;
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: (report: UserErrorReport) => void;
}

export const ScholarshipErrorReportModal: React.FC<ScholarshipErrorReportModalProps> = ({
  scholarship,
  isOpen,
  onClose,
  onReportSubmitted,
}) => {
  const { authenticated, user } = useAuth();
  const [field, setField] = useState<ReportedField>('deadline');
  const [description, setDescription] = useState('');
  const [suggestedCorrection, setSuggestedCorrection] = useState('');
  const [officialSourceUrl, setOfficialSourceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  useEscapeKey(isOpen && Boolean(scholarship), onClose);

  if (!isOpen || !scholarship) return null;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!authenticated || !description.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const resData = await scholarshipClient.reportError({
        scholarshipId: scholarship.id,
        scholarshipName: scholarship.name,
        reportedField: field,
        description: description.trim(),
        suggestedCorrection: suggestedCorrection.trim() || undefined,
        officialSourceUrl: officialSourceUrl.trim() || undefined,
      });

      onReportSubmitted(resData.report);
      setSuccessMsg(true);
      setDescription('');
      setSuggestedCorrection('');
      setOfficialSourceUrl('');
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1500);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to submit error report. Please check your session and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Report Inaccurate Scholarship Information"
      id="scholarship-error-report-modal"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="bg-rose-50 dark:bg-rose-950/50 border-b border-rose-100 dark:border-rose-900/60 p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Report Inaccurate Information</h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                Report outdated or inaccurate scholarship details for editorial review
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close error report modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Report recorded for review</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              Our editorial verification team will review this report against the official source before updating the scholarship record.
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 dark:text-slate-400 block">Target Scholarship:</span>
              <strong className="text-slate-900 dark:text-slate-100 font-semibold">{scholarship.name}</strong>
            </div>

            {!authenticated && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-900 dark:text-amber-200">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
                <span>Sign in is required to submit a scholarship error report so editorial updates can be audited.</span>
              </div>
            )}

            {submitError && (
              <div role="alert" className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 p-3 text-xs font-medium text-rose-800 dark:text-rose-200">
                {submitError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Which information is inaccurate or changed?
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value as ReportedField)}
                className={inputClass}
              >
                <option value="deadline">Deadline changed or expired</option>
                <option value="eligibility">Eligibility or GPA criteria changed</option>
                <option value="link_broken">Broken or invalid application link</option>
                <option value="funding">Funding / Stipend amounts differ</option>
                <option value="other">Other general issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Description of the issue <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="e.g., The official website updated the deadline to Nov 15th instead of Nov 4th."
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Suggested Correction (Optional)
              </label>
              <input
                type="text"
                value={suggestedCorrection}
                onChange={(e) => setSuggestedCorrection(e.target.value)}
                placeholder="e.g., Deadline is now 2026-11-15"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Official Source URL (Optional verification link)
              </label>
              <input
                type="url"
                value={officialSourceUrl}
                onChange={(e) => setOfficialSourceUrl(e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>

            {authenticated && user?.email && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Reporting as <strong className="text-slate-700 dark:text-slate-200">{user.email}</strong>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!authenticated || isSubmitting || !description.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 transition-all shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
