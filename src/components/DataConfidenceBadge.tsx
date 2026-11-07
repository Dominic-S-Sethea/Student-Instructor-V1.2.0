import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Users, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { DataConfidenceBadge as DataConfidenceBadgeType } from '../types';

interface Props {
  confidence: DataConfidenceBadgeType;
  showDetailsButton?: boolean;
}

export const DataConfidenceBadge: React.FC<Props> = ({ confidence, showDetailsButton = true }) => {
  const [showModal, setShowModal] = useState(false);

  const getBadgeStyle = () => {
    switch (confidence.level) {
      case 'official':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: ShieldCheck,
          text: 'Official Ministry / University Source',
          starColor: 'text-amber-500',
        };
      case 'verified':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: CheckCircle2,
          text: 'University Verified Partner',
          starColor: 'text-amber-500',
        };
      case 'community':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Users,
          text: 'Student Reported & Audited',
          starColor: 'text-amber-500',
        };
      default:
        return {
          bg: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: AlertCircle,
          text: 'Unverified Community Data',
          starColor: 'text-gray-400',
        };
    }
  };

  const style = getBadgeStyle();
  const IconComponent = style.icon;

  return (
    <>
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowModal(true)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-left space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Data Reliability System</h3>
                  <p className="text-xs text-gray-500">Quality over quantity verification framework</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 text-lg rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Confidence Tier:</span>
                  <span className="font-bold text-gray-900 capitalize flex items-center gap-1">
                    {confidence.level} ({confidence.stars}/5 Stars)
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-gray-700">Source:</span>
                  <span className="font-medium text-gray-800 text-right">{confidence.sourceLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Last Verified:</span>
                  <span className="text-gray-800 font-medium">{confidence.lastVerifiedDate}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-semibold text-gray-800">Verification Protocol:</div>
                <p className="text-gray-600 leading-relaxed bg-blue-50/60 p-3 rounded-lg border border-blue-100 text-xs">
                  {confidence.verificationMethod}
                </p>
              </div>

              {confidence.sourceUrl && (
                <a
                  href={confidence.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium pt-1 text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect primary source publication</span>
                </a>
              )}

              <div className="pt-2 border-t border-gray-100 text-gray-500 text-[11px] leading-normal">
                <span className="font-semibold text-gray-700">Platform Guarantee:</span> We do not scrape unverified forum rumors. Every university record undergoes three-tier validation across Ministry decrees, registrar publications, and student alumni audits.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Close Verification Audit
            </button>
          </div>
        </div>
      )}
    </>
  );
};
