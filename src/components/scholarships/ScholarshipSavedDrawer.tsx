import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Bell,
  Clock,
  ExternalLink,
  Trash2,
  Calendar,
  CheckCircle2,
  Download,
  AlertCircle,
} from 'lucide-react';
import { ScholarshipItem } from '../../types/scholarship';

interface ScholarshipSavedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedScholarships: ScholarshipItem[];
  onRemoveSaved: (id: string) => void;
  onSelectScholarship: (item: ScholarshipItem) => void;
  userEmail: string;
}

export const ScholarshipSavedDrawer: React.FC<ScholarshipSavedDrawerProps> = ({
  isOpen,
  onClose,
  savedScholarships,
  onRemoveSaved,
  onSelectScholarship,
  userEmail,
}) => {
  const [remindersEnabled, setRemindersEnabled] = useState<Record<string, boolean>>({
    '30days': true,
    '14days': true,
    '7days': true,
  });
  const [showReminderSuccess, setShowReminderSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveReminders = () => {
    setShowReminderSuccess(true);
    setTimeout(() => setShowReminderSuccess(false), 2500);
  };

  const handleExportChecklist = () => {
    const textContent = [
      `CAMBODIA SCHOLARSHIP INTELLIGENCE PLATFORM (CSIP) - SAVED CHECKLIST`,
      `Generated for: ${userEmail || 'Guest Student'}`,
      `Date: ${new Date().toLocaleDateString()}`,
      `------------------------------------------------------------`,
      '',
      ...savedScholarships.map((s, idx) => [
        `[${idx + 1}] ${s.name}`,
        `Provider: ${s.provider} | Country: ${s.country}`,
        `Deadline: ${s.deadline}`,
        `Funding: ${s.fundingType} (${s.totalEstimatedValueUSD != null ? `Est. $${s.totalEstimatedValueUSD.toLocaleString()} USD` : 'Amount not specified'})`,
        `Required Documents:`,
        ...s.requiredDocuments.map((d) => `   [ ] ${d}`),
        `Application Portal: ${s.applicationLink}`,
        `Official Source: ${s.officialSourceUrl}`,
        `------------------------------------------------------------`,
        '',
      ].join('\n')),
    ].join('\n');

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-scholarships-checklist-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      id="scholarship-saved-drawer"
    >
      <div className="bg-white dark:bg-slate-900 dark:text-slate-100 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Saved Scholarships & Deadlines</h3>
              <p className="text-xs text-emerald-200/80">{savedScholarships.length} opportunity(ies) bookmarked</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deadline Reminders Settings Ribbon */}
        <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 text-xs text-slate-800 space-y-3 shrink-0">
          <div className="flex items-center justify-between font-bold text-emerald-950">
            <div className="flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-emerald-700" />
              <span>Automated Deadline Reminders</span>
            </div>
            <button
              onClick={handleSaveReminders}
              className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-colors"
            >
              Update Settings
            </button>
          </div>

          <p className="text-[11px] text-slate-600">
            Receive email notifications to <strong>{userEmail || 'student@cambodia.edu.kh'}</strong> before application closes:
          </p>

          <div className="flex items-center gap-3">
            {[
              { id: '30days', label: '30 Days before' },
              { id: '14days', label: '14 Days before' },
              { id: '7days', label: '7 Days before' },
            ].map((r) => (
              <label key={r.id} className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={remindersEnabled[r.id]}
                  onChange={(e) =>
                    setRemindersEnabled({ ...remindersEnabled, [r.id]: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>

          {showReminderSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-100 p-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Reminder preferences saved successfully!</span>
            </div>
          )}
        </div>

        {/* Saved List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedScholarships.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Bookmark className="w-10 h-10 mx-auto text-slate-300" />
              <div className="text-sm font-semibold text-slate-600">No saved scholarships yet</div>
              <p className="text-xs max-w-xs mx-auto text-slate-400">
                Click the bookmark icon on any scholarship card to track deadlines and receive alert notifications.
              </p>
            </div>
          ) : (
            savedScholarships.map((sch) => {
              const daysLeft = Math.ceil(
                (new Date(sch.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={sch.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 shadow-2xs transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                        {sch.country} • {sch.fundingType}
                      </div>
                      <h4
                        onClick={() => onSelectScholarship(sch)}
                        className="text-xs font-bold text-slate-900 hover:text-emerald-700 cursor-pointer line-clamp-1"
                      >
                        {sch.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{sch.provider}</p>
                    </div>
                    <button
                      onClick={() => onRemoveSaved(sch.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{sch.deadline}</span>
                      <span className={`font-bold ${daysLeft <= 14 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        ({daysLeft > 0 ? `${daysLeft}d left` : 'Expired'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectScholarship(sch)}
                        className="text-[11px] font-bold text-emerald-700 hover:underline"
                      >
                        Details
                      </button>
                      <a
                        href={sch.applicationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Open application link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {savedScholarships.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={handleExportChecklist}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Prep Checklist (.txt)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
