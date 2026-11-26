import React, { useEffect, useState } from 'react';
import { AlertCircle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { communityClient } from '../../services/communityClient';
import { useAuth } from '../../context/AuthContext';
import { useEscapeKey } from '../../hooks/useModalAccessibility';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultItemType?: string;
  defaultItemId?: string;
}

export const ReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultItemType = 'post',
  defaultItemId = 'item-general',
}) => {
  const { user } = useAuth();
  const [itemType, setItemType] = useState(defaultItemType);
  const [itemId, setItemId] = useState(defaultItemId);
  const [reason, setReason] = useState<string>('unsafe_contact_request');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEscapeKey(isOpen, onClose);

  useEffect(() => {
    setItemType(defaultItemType);
    setItemId(defaultItemId);
    setError(null);
  }, [defaultItemType, defaultItemId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a brief description of the safety or policy concern.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await communityClient.submitReport({
        reporter_id: user?.id,
        reported_item_type: itemType,
        reported_item_id: itemId || 'unspecified-item',
        reason,
        description,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDescription('');
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="CDES Safety Desk Incident Report"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">CDES Safety Desk & Incident Report</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">All reports are confidential and reviewed by CDES safety officers.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close safety report modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Report Received Securely</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Thank you for keeping CDES safe. Our student protection desk has logged this incident with priority audit ID.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Violation Category</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="unsafe_contact_request">Unsafe Direct Contact / Telegram or Phone Solicitation</option>
                <option value="inappropriate_content">Inappropriate / Harmful Content</option>
                <option value="harassment">Harassment / Bullying / Intimidation</option>
                <option value="false_information">Academic Dishonesty / Fake Bac II Exam Key Sales</option>
                <option value="spam">Commercial Spam / Unsolicited Promotion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reported Item Type</label>
              <div className="grid grid-cols-4 gap-2">
                {['post', 'comment', 'mentor', 'project'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setItemType(type)}
                    className={`py-1.5 text-xs font-medium rounded-lg capitalize border ${
                      itemType === type
                        ? 'bg-blue-50 text-blue-600 border-blue-200 font-semibold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Details & Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, including any specific messages or links..."
                rows={3}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting Report...' : 'Submit Incident Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
