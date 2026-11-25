import React from 'react';
import {
  X,
  Bookmark,
  Clock,
  ExternalLink,
  Trash2,
  Download,
  Calendar,
  CheckSquare,
  Square,
  CloudCheck,
} from 'lucide-react';
import { ScholarshipItem } from '../../types/scholarship';
import type {
  PersistedSavedScholarship,
  SavedChecklistItem,
  SavedScholarshipStatus,
} from '../../services/savedScholarshipClient';
import { useEscapeKey } from '../../hooks/useModalAccessibility';
import { getSafeHttpUrl } from '../../utils/safeUrl';

interface ScholarshipSavedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedScholarships: ScholarshipItem[];
  savedMetadataById?: Record<string, PersistedSavedScholarship>;
  isAccountSynced?: boolean;
  onUpdateStatus?: (scholarshipId: string, status: SavedScholarshipStatus) => void;
  onToggleChecklistItem?: (scholarshipId: string, itemId: string) => void;
  onRemoveSaved: (id: string) => void;
  onSelectScholarship: (item: ScholarshipItem) => void;
  userEmail: string;
}

const STATUS_OPTIONS: Array<{ value: SavedScholarshipStatus; label: string }> = [
  { value: 'saved', label: 'Saved' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'awarded', label: 'Awarded' },
];

function formatDeadlineBadge(sch: ScholarshipItem): { text: string; toneClass: string } {
  if (sch.deadlineStatus === 'rolling') {
    return { text: 'Rolling', toneClass: 'text-blue-600 dark:text-blue-400' };
  }
  if (sch.deadlineStatus === 'unknown' || !sch.deadline) {
    return { text: 'Check official site', toneClass: 'text-slate-500 dark:text-slate-400' };
  }
  if (sch.deadlineStatus === 'expired') {
    return { text: 'Expired', toneClass: 'text-rose-600 dark:text-rose-400' };
  }
  if (typeof sch.daysRemaining === 'number') {
    if (sch.daysRemaining <= 0) {
      return { text: 'Expired', toneClass: 'text-rose-600 dark:text-rose-400' };
    }
    return {
      text: `${sch.daysRemaining}d left`,
      toneClass: sch.daysRemaining <= 14 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400',
    };
  }
  const parsed = Date.parse(sch.deadline);
  if (Number.isNaN(parsed)) {
    return { text: 'Check official site', toneClass: 'text-slate-500 dark:text-slate-400' };
  }
  const daysLeft = Math.ceil((parsed - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 0) return { text: 'Expired', toneClass: 'text-rose-600 dark:text-rose-400' };
  return {
    text: `${daysLeft}d left`,
    toneClass: daysLeft <= 14 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400',
  };
}

function buildMarkdownChecklist(
  savedScholarships: ScholarshipItem[],
  savedMetadataById: Record<string, PersistedSavedScholarship>,
  userEmail: string
): string {
  const lines = [
    '# CDES Saved Scholarships Preparation Checklist',
    '',
    `- **Student**: ${userEmail || 'Guest Student'}`,
    `- **Exported**: ${new Date().toISOString().split('T')[0]}`,
    '',
  ];
  savedScholarships.forEach((s, idx) => {
    const meta = savedMetadataById[s.id];
    const items: SavedChecklistItem[] =
      meta?.checklist && meta.checklist.length > 0
        ? meta.checklist
        : s.requiredDocuments.map((d, i) => ({ id: `d-${i}`, label: d, done: false }));
    lines.push(`## ${idx + 1}. ${s.name}`);
    lines.push(`- **Provider**: ${s.provider} (${s.country})`);
    lines.push(`- **Status**: ${meta?.status || 'saved'}`);
    lines.push(`- **Deadline**: ${s.deadline || 'Not specified'}`);
    lines.push(
      `- **Funding**: ${s.fundingType} (${s.totalEstimatedValueUSD != null ? `Est. $${s.totalEstimatedValueUSD.toLocaleString()} USD` : 'Amount not specified'})`
    );
    lines.push(`- **Application Portal**: ${getSafeHttpUrl(s.applicationLink) || 'Not specified'}`);
    lines.push('');
    lines.push('### Required Documents');
    items.forEach((item) => lines.push(`- [${item.done ? 'x' : ' '}] ${item.label}`));
    lines.push('');
  });
  return lines.join('\n');
}

export const ScholarshipSavedDrawer: React.FC<ScholarshipSavedDrawerProps> = ({
  isOpen,
  onClose,
  savedScholarships,
  savedMetadataById = {},
  isAccountSynced = false,
  onUpdateStatus,
  onToggleChecklistItem,
  onRemoveSaved,
  onSelectScholarship,
  userEmail,
}) => {
  useEscapeKey(isOpen, onClose);
  if (!isOpen) return null;

  const closingSoonCount = savedScholarships.filter(
    (s) => s.deadlineStatus === 'closing_soon' || (typeof s.daysRemaining === 'number' && s.daysRemaining > 0 && s.daysRemaining <= 30)
  ).length;

  const triggerDownload = (content: string, ext: 'md' | 'txt', mime: string): void => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-scholarships-checklist-${new Date().toISOString().split('T')[0]}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Saved Scholarships and Deadlines"
      id="scholarship-saved-drawer"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700"
      >
        <div className="p-5 border-b border-emerald-800 bg-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Saved Scholarships & Deadlines</h3>
              <p className="text-xs text-emerald-200/80 flex items-center gap-1.5">
                <span>{savedScholarships.length} bookmarked</span>
                {isAccountSynced && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-700/70 text-[10px] font-bold">
                    <CloudCheck className="w-3 h-3" /> Synced
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close saved scholarships drawer"
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60 text-xs text-slate-800 dark:text-slate-200 space-y-1.5 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-emerald-950 dark:text-emerald-200">
            <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>In-App Deadline & Checklist Tracker</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            {closingSoonCount > 0
              ? `${closingSoonCount} saved scholarship(s) close within 30 days. Track your document checklist below and verify dates on official portals.`
              : isAccountSynced
              ? 'Your saved scholarships, application status, and document checklists sync automatically to your account.'
              : 'Track saved deadlines on this device. Sign in to sync checklists across devices.'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedScholarships.length === 0 ? (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <Bookmark className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">No saved scholarships yet</div>
              <p className="text-xs max-w-xs mx-auto text-slate-500 dark:text-slate-400">
                Click the bookmark icon on any scholarship card to track deadlines and export your preparation checklist.
              </p>
            </div>
          ) : (
            savedScholarships.map((sch) => {
              const badge = formatDeadlineBadge(sch);
              const safeApplyUrl = getSafeHttpUrl(sch.applicationLink);
              const meta = savedMetadataById[sch.id];
              const checklist = meta?.checklist || [];
              const completedCount = checklist.filter((c) => c.done).length;
              return (
                <div
                  key={sch.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-2xs transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        {sch.country} • {sch.fundingType}
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectScholarship(sch)}
                        className="text-left text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer line-clamp-1"
                      >
                        {sch.name}
                      </button>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{sch.provider}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveSaved(sch.id)}
                      aria-label={`Remove ${sch.name} from saved`}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {isAccountSynced && onUpdateStatus && (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Application Stage:
                      </label>
                      <select
                        value={meta?.status || 'saved'}
                        onChange={(e) => onUpdateStatus(sch.id, e.target.value as SavedScholarshipStatus)}
                        className="text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-2 py-1"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {isAccountSynced && checklist.length > 0 && onToggleChecklistItem && (
                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Prep Checklist ({completedCount}/{checklist.length})
                      </div>
                      {checklist.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onToggleChecklistItem(sch.id, item.id)}
                          className="w-full text-left flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer"
                        >
                          {item.done ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className={item.done ? 'line-through text-slate-400' : ''}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{sch.deadline || 'Not specified'}</span>
                      <span className={`font-bold ${badge.toneClass}`}>({badge.text})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectScholarship(sch)}
                        className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Details
                      </button>
                      {safeApplyUrl && (
                        <a
                          href={safeApplyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open application portal for ${sch.name}`}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                          title="Open application link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {savedScholarships.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                triggerDownload(
                  buildMarkdownChecklist(savedScholarships, savedMetadataById, userEmail),
                  'md',
                  'text/markdown'
                )
              }
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Checklist (.md)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
