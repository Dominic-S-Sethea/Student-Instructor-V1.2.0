import React from 'react';
import { ShieldCheck, Lock, AlertCircle, HeartHandshake } from 'lucide-react';

interface Props {
  onOpenReportModal?: () => void;
}

export const SafetyNoticeBanner: React.FC<Props> = ({ onOpenReportModal }) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm tracking-wide text-white uppercase">
                CDES Protected Academic Environment
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Minor Safety Protocol Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              CDES is a purpose-driven learning campus. All discussions are peer-reviewed for academic honesty. Unmonitored private contact requests and commercial spam are strictly blocked to protect student privacy and minor safety.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-slate-400 mr-2 hidden sm:flex">
            <HeartHandshake className="w-4 h-4 text-blue-400" />
            <span>Safe Mentorship Sessions</span>
          </div>
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Safety Desk & Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
