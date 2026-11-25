import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Users, AlertCircle, Info, ExternalLink, X } from 'lucide-react';
import { DataConfidenceBadge as DataConfidenceBadgeType } from '../types';
import { useEscapeKey } from '../hooks/useModalAccessibility';
import { getSafeHttpUrl } from '../utils/safeUrl';

interface Props {
  confidence: DataConfidenceBadgeType;
  showDetailsButton?: boolean;
}

export const DataConfidenceBadge: React.FC<Props> = ({ confidence, showDetailsButton = true }) => {
  const [showModal, setShowModal] = useState(false);

  useEscapeKey(showModal, () => setShowModal(false));

  const getBadgeStyle = () => {
    switch (confidence.level) {
      case 'official':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: ShieldCheck,
          text: 'Official Ministry / University Source',
        };
      case 'verified':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          icon: CheckCircle2,
          text: 'University Verified Partner',
        };
      case 'community':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: Users,
          text: 'Student Reported & Audited',
        };
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          icon: AlertCircle,
          text: 'Unverified Community Data',
        };
    }
  };

  const style = getBadgeStyle();
  const IconComponent = style.icon;
  const safeSourceUrl = getSafeHttpUrl(confidence.sourceUrl);

  return (
    <>
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          title="Click to inspect data reliability score and audit records"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:shadow-xs cursor-pointer ${style.bg}`}
        >
          <IconComponent className="w-3.5 h-3.5 shrink-0" />
          <span>{style.text}</span>
          <span className="flex items-center text-xs tracking-tighter ml-0.5">
            {'★'.repeat(confidence.stars)}
            {'☆'.repeat(5 - confidence.stars)}
          </span>
          {showDetailsButton && <Info className="w-3 h-3 opacity-60 ml-0.5" />}
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Data Reliability Audit"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(false);
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-left space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Data Reliability System</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quality over quantity verification framework</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close data reliability audit"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Confidence Tier:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 capitalize">
                    {confidence.level} ({confidence.stars}/5 Stars)
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Source:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{confidence.sourceLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Last Verified:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{confidence.lastVerifiedDate}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Verification Protocol:</div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-blue-50/60 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-100 dark:border-blue-900 text-xs">
                  {confidence.verificationMethod}
                </p>
              </div>

              {safeSourceUrl && (
                <a
                  href={safeSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium pt-1 text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect primary source publication</span>
                </a>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] leading-normal">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Platform Policy:</span> Catalog records reference official ministry circulars, registrar publications, and community audits — verify current cycle deadlines directly with the institution.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Close Verification Audit
            </button>
          </div>
        </div>
      )}
    </>
  );
};
