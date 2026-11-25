import React from 'react';
import { ArrowRight, Calendar, RefreshCw } from 'lucide-react';
import type { ScholarshipItem } from '../../types/scholarship';

interface UpcomingDeadlinesStripProps {
  isKhmer: boolean;
  scholarships: ScholarshipItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onBrowseScholarships: () => void;
}

function formatDeadlinePill(sch: ScholarshipItem, isKhmer: boolean): { text: string; tone: string } {
  if (sch.deadlineType === 'Rolling' || sch.deadlineStatus === 'rolling') {
    return {
      text: isKhmer ? 'ទទួលពាក្យបន្តបន្ទាប់' : 'Rolling deadline',
      tone: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    };
  }
  const days =
    typeof sch.daysRemaining === 'number'
      ? sch.daysRemaining
      : sch.deadline
        ? Math.ceil((new Date(sch.deadline).getTime() - Date.now()) / 86400000)
        : null;
  if (days === null || Number.isNaN(days) || sch.deadlineStatus === 'unknown') {
    return {
      text: isKhmer ? 'មិនបានបញ្ជាក់' : 'Deadline not specified',
      tone: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    };
  }
  if (days < 0 || sch.deadlineStatus === 'expired') {
    return {
      text: isKhmer ? 'បានបិទ' : 'Closed',
      tone: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    };
  }
  if (days <= 30) {
    return {
      text: days === 0 ? (isKhmer ? 'ផុតកំណត់ថ្ងៃនេះ' : 'Closes today') : `${days}d left`,
      tone: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    };
  }
  return {
    text: `${days}d left`,
    tone: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  };
}

export const UpcomingDeadlinesStrip: React.FC<UpcomingDeadlinesStripProps> = ({
  isKhmer,
  scholarships,
  loading,
  error,
  onRetry,
  onBrowseScholarships,
}) => {
  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {isKhmer ? 'កាលបរិច្ឆេទអាហារូបករណ៍ជិតមកដល់' : 'Upcoming Scholarship Deadlines'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isKhmer
                ? 'ទិន្នន័យផ្ទាល់ពីបញ្ជីអាហារូបករណ៍ដែលបានផ្ទៀងផ្ទាត់'
                : 'Live deadlines from verified source records'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBrowseScholarships}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer self-start sm:self-auto"
        >
          <span>{isKhmer ? 'មើលអាហារូបករណ៍ទាំងអស់' : 'View all scholarships'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((slot) => (
            <div
              key={slot}
              className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"
            />
          ))}
        </div>
      ) : scholarships.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
          No upcoming scholarships found right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scholarships.map((sch) => {
            const badge = formatDeadlinePill(sch, isKhmer);
            return (
              <button
                key={sch.id}
                type="button"
                onClick={onBrowseScholarships}
                className="text-left rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 hover:border-emerald-400 dark:hover:border-emerald-500 p-4 space-y-2.5 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">
                      {isKhmer && sch.countryKm ? sch.countryKm : sch.country}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.tone}`}>
                      {badge.text}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                    {isKhmer && sch.nameKm ? sch.nameKm : sch.name}
                  </h3>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/70 dark:border-slate-700">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {sch.fundingType}
                  </span>
                  <span>
                    {sch.deadline || (sch.deadlineType === 'Rolling' ? 'Rolling' : 'Not specified')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
