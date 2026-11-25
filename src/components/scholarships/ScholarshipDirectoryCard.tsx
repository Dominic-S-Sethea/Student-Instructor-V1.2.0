import React from 'react';
import { AlertTriangle, Bookmark, BookmarkCheck, Clock, ExternalLink, Globe2, ShieldCheck, Eye } from 'lucide-react';
import { ScholarshipItem } from '../../types/scholarship';
import { useLanguage } from '../../context/LanguageContext';

interface ScholarshipDirectoryCardProps {
  scholarship: ScholarshipItem;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenDetail: (scholarship: ScholarshipItem) => void;
}

export const ScholarshipDirectoryCard: React.FC<ScholarshipDirectoryCardProps> = ({
  scholarship,
  isSaved,
  onToggleSave,
  onOpenDetail,
}) => {
  const { language } = useLanguage();
  const isKhmer = language === 'km';
  const n = isKhmer && scholarship.nameKm ? scholarship.nameKm : scholarship.name;
  const p = isKhmer && scholarship.providerKm ? scholarship.providerKm : scholarship.provider;
  const c = isKhmer && scholarship.countryKm ? scholarship.countryKm : scholarship.country;
  const daysLeft =
    typeof scholarship.daysRemaining === 'number'
      ? scholarship.daysRemaining
      : scholarship.deadline
        ? Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / 86400000)
        : null;
  const isRolling = scholarship.deadlineType === 'Rolling' || scholarship.deadlineStatus === 'rolling';
  const isUnknownDeadline = scholarship.deadlineStatus === 'unknown' || daysLeft === null || Number.isNaN(daysLeft);
  const isUrgent = !isRolling && !isUnknownDeadline && daysLeft >= 0 && daysLeft < 30;
  const isClosed = !isRolling && !isUnknownDeadline && daysLeft < 0;

  return (
    <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400/90 dark:hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group">
      <div className="p-4 pb-3 space-y-2 border-b border-slate-100/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              <Globe2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {c}
            </span>
            <span
              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                scholarship.fundingType === 'Fully funded'
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                  : scholarship.fundingType === 'Tuition only'
                    ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300'
                    : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
              }`}
            >
              {scholarship.fundingType}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {scholarship.qualityScore}%
            </span>
            <button
              type="button"
              onClick={() => onToggleSave(scholarship.id)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isSaved
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isSaved ? 'Remove bookmark' : 'Bookmark & track deadline'}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark scholarship'}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <h3
            onClick={() => onOpenDetail(scholarship)}
            className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 cursor-pointer line-clamp-2 leading-snug transition-colors"
          >
            {n}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">{p}</p>
        </div>
      </div>

      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between text-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Est. Grant Package:</span>
            <span className="font-bold text-emerald-900 dark:text-emerald-300 text-xs">
              {typeof scholarship.totalEstimatedValueUSD === 'number'
                ? `$${scholarship.totalEstimatedValueUSD.toLocaleString()} USD`
                : isKhmer ? 'មិនបានបញ្ជាក់' : 'Not specified'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {scholarship.degreeLevel.map((d) => (
              <span
                key={d}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                {d}
              </span>
            ))}
            {scholarship.fieldOfStudy.slice(0, 2).map((f) => (
              <span
                key={f}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300"
              >
                {f}
              </span>
            ))}
            {scholarship.fieldOfStudy.length > 2 && (
              <span className="text-[11px] text-slate-400 font-medium py-0.5">
                +{scholarship.fieldOfStudy.length - 2} more
              </span>
            )}
          </div>
        </div>

        <div
          className={`space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 rounded-xl p-3 text-xs ${
            isUrgent
              ? 'bg-amber-50/70 dark:bg-amber-950/30 ring-1 ring-amber-200 dark:ring-amber-800'
              : 'bg-slate-50/50 dark:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>
                Deadline:{' '}
                <strong className="text-slate-900 dark:text-slate-100">
                  {scholarship.deadline || (isRolling ? 'Rolling' : isKhmer ? 'មិនបានបញ្ជាក់' : 'Not specified')}
                </strong>
              </span>
            </div>
            <span
              className={`font-bold ${
                isRolling
                  ? 'text-blue-700 dark:text-blue-300'
                  : isUnknownDeadline
                    ? 'text-slate-500 dark:text-slate-400'
                    : isClosed
                      ? 'text-slate-500 dark:text-slate-400'
                      : daysLeft <= 14
                        ? 'text-rose-600 dark:text-rose-400'
                        : daysLeft < 30
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isRolling
                ? 'Rolling'
                : isUnknownDeadline
                  ? isKhmer ? 'មិនបានបញ្ជាក់' : 'Unknown'
                  : isClosed
                    ? 'Expired'
                    : daysLeft > 0
                      ? `${daysLeft} days left`
                      : 'Today'}
            </span>
          </div>
          {isUrgent && daysLeft !== null && (
            <div
              className={`flex items-center gap-1.5 text-xs font-bold rounded-md px-2 py-1 ${
                daysLeft <= 14
                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200'
                  : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3 shrink-0" />
              {daysLeft <= 14 ? 'URGENT: deadline within 14 days' : 'Urgency alert: deadline within 30 days'}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onOpenDetail(scholarship)}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            View Dossier
          </button>
          <a
            href={scholarship.applicationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            title="Open official application portal"
            aria-label={`Open official portal for ${n}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
};
