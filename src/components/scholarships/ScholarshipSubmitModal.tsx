import React, { useState } from 'react';
import { X, Building2, CheckCircle2, Send, ShieldCheck, Info } from 'lucide-react';
import { OrganizationSubmission, ScholarshipRegion, DegreeLevel, FieldOfStudy, FundingType } from '../../types/scholarship';

interface ScholarshipSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmissionSuccess: (submission: OrganizationSubmission) => void;
}

export const ScholarshipSubmitModal: React.FC<ScholarshipSubmitModalProps> = ({
  isOpen,
  onClose,
  onSubmissionSuccess,
}) => {
  const [orgName, setOrgName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [officialWebsite, setOfficialWebsite] = useState('');
  const [scholarshipName, setScholarshipName] = useState('');
  const [scholarshipNameKm, setScholarshipNameKm] = useState('');
  const [country, setCountry] = useState('Cambodia');
  const [region, setRegion] = useState<ScholarshipRegion>('Cambodia');
  const [degreeLevels, setDegreeLevels] = useState<DegreeLevel[]>(['Bachelor']);
  const [fields, setFields] = useState<FieldOfStudy[]>(['Computer Science', 'Engineering']);
  const [fundingType, setFundingType] = useState<FundingType>('Fully funded');
  const [fundingDetails, setFundingDetails] = useState('');
  const [eligibilitySummary, setEligibilitySummary] = useState('');
  const [deadline, setDeadline] = useState('2026-11-30');
  const [applicationLink, setApplicationLink] = useState('');
  const [officialSourceUrl, setOfficialSourceUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleDegree = (deg: DegreeLevel) => {
    if (degreeLevels.includes(deg)) {
      if (degreeLevels.length > 1) setDegreeLevels(degreeLevels.filter((d) => d !== deg));
    } else {
      setDegreeLevels([...degreeLevels, deg]);
    }
  };

  const toggleField = (f: FieldOfStudy) => {
    if (fields.includes(f)) {
      if (fields.length > 1) setFields(fields.filter((item) => item !== f));
    } else {
      setFields([...fields, f]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !scholarshipName || !contactEmail || !deadline) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/scholarships/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: orgName,
          contactPerson,
          contactEmail,
          officialWebsite,
          scholarshipName,
          scholarshipNameKm,
          country,
          region,
          degreeLevel: degreeLevels,
          fieldOfStudy: fields,
          fundingType,
          fundingDetails: fundingDetails || 'Complete tuition fee waiver and academic stipend.',
          eligibilitySummary: eligibilitySummary || 'Open to qualified Cambodian citizens.',
          deadline,
          applicationLink: applicationLink || officialWebsite,
          officialSourceUrl: officialSourceUrl || officialWebsite,
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        onSubmissionSuccess(resData.submission);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2200);
      }
    } catch (err) {
      console.error('Submission error:', err);
      // Fallback local submission
      const fallback: OrganizationSubmission = {
        id: `sub-${Date.now()}`,
        organizationName: orgName,
        contactPerson,
        contactEmail,
        officialWebsite,
        scholarshipName,
        scholarshipNameKm,
        country,
        region,
        degreeLevel: degreeLevels,
        fieldOfStudy: fields,
        fundingType,
        fundingDetails,
        eligibilitySummary,
        deadline,
        applicationLink,
        officialSourceUrl,
        submittedAt: new Date().toISOString(),
        status: 'Pending Admin Review',
      };
      onSubmissionSuccess(fallback);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      id="scholarship-submit-modal"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Submit a Scholarship Opportunity</h3>
              <p className="text-xs text-slate-300">
                For Universities, Embassies, Foundations, and NGOs
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

        {/* Verification Note */}
        <div className="bg-emerald-50 border-b border-emerald-100 p-3 px-6 text-xs text-emerald-900 flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Editorial Rule:</strong> All submissions are reviewed and cross-verified against official institutional domains before publishing.
          </span>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Submission Received Successfully</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you for listing your scholarship opportunity. Our verification team will review your submission and contact <strong>{contactEmail}</strong> once published to the Cambodia Scholarship Intelligence Platform.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Organization / University Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Paragon International University"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Official Contact Work Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="admissions@university.edu.kh"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Person / Office</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Scholarships Committee Office"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Website</label>
                <input
                  type="url"
                  value={officialWebsite}
                  onChange={(e) => setOfficialWebsite(e.target.value)}
                  placeholder="https://institution.edu.kh"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <label className="block font-bold text-slate-700 mb-1">
                Scholarship Program Title (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={scholarshipName}
                onChange={(e) => setScholarshipName(e.target.value)}
                placeholder="e.g. 2026 Paragon Merit Scholarship"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Scholarship Program Title (Khmer Unicode)
              </label>
              <input
                type="text"
                value={scholarshipNameKm}
                onChange={(e) => setScholarshipNameKm(e.target.value)}
                placeholder="ឧ. អាហារូបករណ៍សិស្សឆ្នើមឆ្នាំ ២០២៦"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-khmer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 p-2 bg-white text-slate-900"
                >
                  <option value="Cambodia">Cambodia</option>
                  <option value="ASEAN">ASEAN</option>
                  <option value="Japan">Japan</option>
                  <option value="Korea">Korea</option>
                  <option value="China">China</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Australia">Australia</option>
                  <option value="Europe">Europe</option>
                  <option value="USA">USA</option>
                  <option value="Canada">Canada</option>
                  <option value="Global">Global</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Funding Type</label>
                <select
                  value={fundingType}
                  onChange={(e) => setFundingType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 p-2 bg-white text-slate-900"
                >
                  <option value="Fully funded">Fully funded (100%)</option>
                  <option value="Tuition only">Tuition only</option>
                  <option value="Partial funding">Partial funding</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Target Degree Level(s)</label>
              <div className="flex flex-wrap gap-2">
                {(['Bachelor', 'Master', 'PhD'] as DegreeLevel[]).map((deg) => (
                  <button
                    type="button"
                    key={deg}
                    onClick={() => toggleDegree(deg)}
                    className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                      degreeLevels.includes(deg)
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {deg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Eligible Fields of Study</label>
              <div className="flex flex-wrap gap-1.5">
                {(['Business', 'Engineering', 'Computer Science', 'Medicine', 'Agriculture', 'Education', 'Other'] as FieldOfStudy[]).map((f) => (
                  <button
                    type="button"
                    key={f}
                    onClick={() => toggleField(f)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                      fields.includes(f)
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Funding & Grant Details</label>
              <textarea
                value={fundingDetails}
                onChange={(e) => setFundingDetails(e.target.value)}
                rows={2}
                placeholder="e.g. 100% full 4-year tuition waiver, monthly stipend of $300, textbook allowance."
                className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Application Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Direct Application Portal Link</label>
                <input
                  type="url"
                  value={applicationLink}
                  onChange={(e) => setApplicationLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !orgName || !scholarshipName || !contactEmail}
                className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting for Review...' : 'Submit Opportunity'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
