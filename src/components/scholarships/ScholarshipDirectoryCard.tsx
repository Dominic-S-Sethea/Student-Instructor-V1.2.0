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
  const daysLeft = Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / 86400000);
  const isUrgent = daysLeft >= 0 && daysLeft < 30;
  const isClosed = daysLeft < 0;
  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400/90 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group">
      <div className="p-4 pb-3 space-y-2 border-b border-slate-100/80 bg-slate-50/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200"><Globe2 className="w-3 h-3 text-emerald-600" />{c}</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${scholarship.fundingType === 'Fully funded' ? 'bg-emerald-100 text-emerald-800' : scholarship.fundingType === 'Tuition only' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{scholarship.fundingType}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-600" />{scholarship.qualityScore}%</span>
            <button onClick={() => onToggleSave(scholarship.id)} className={`p-1.5 rounded-lg transition-colors ${isSaved ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'}`} title={isSaved ? 'Remove bookmark' : 'Bookmark & track deadline'}>{isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}</button>
          </div>
        </div>
        <div>
          <h3 onClick={() => onOpenDetail(scholarship)} className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 cursor-pointer line-clamp-2 leading-snug transition-colors">{n}</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">{p}</p>
        </div>
      </div>
      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100"><span className="text-slate-500">Est. Grant Package:</span><span className="font-bold text-emerald-900 text-xs">${scholarship.totalEstimatedValueUSD.toLocaleString()} USD</span></div>
          <div className="flex flex-wrap gap-1">{scholarship.degreeLevel.map(d => <span key={d} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">{d}</span>)}{scholarship.fieldOfStudy.slice(0, 2).map(f => <span key={f} className="px-2 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-800">{f}</span>)}{scholarship.fieldOfStudy.length > 2 && <span className="text-[10px] text-slate-400 font-medium py-0.5">+{scholarship.fieldOfStudy.length - 2} more</span>}</div>
        </div>
        <div className={`space-y-2 pt-2 border-t border-slate-100 rounded-xl p-3 text-xs ${isUrgent ? 'bg-amber-50/70 ring-1 ring-amber-200' : 'bg-slate-50/50'}`}>
          <div className="flex items-center justify-between text-[11px]"><div className="flex items-center gap-1 text-slate-500"><Clock className="w-3.5 h-3.5 text-amber-500" /><span>Deadline: <strong>{scholarship.deadline}</strong></span></div><span className={`font-bold ${daysLeft <= 14 ? 'text-rose-600' : daysLeft < 30 ? 'text-amber-600' : 'text-emerald-700'}`}>{daysLeft > 0 ? `${daysLeft} days left` : isClosed ? 'Closed' : 'Today'}</span></div>
          {isUrgent && <div className={`flex items-center gap-1.5 text-xs font-bold rounded-md px-2 py-1 ${daysLeft <= 14 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}><AlertTriangle className="w-3 h-3 shrink-0" />{daysLeft <= 14 ? 'URGENT: deadline within 14 days' : 'Urgency alert: deadline within 30 days'}</div>}
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button onClick={() => onOpenDetail(scholarship)} className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1"><Eye className="w-3.5 h-3.5" />View Dossier</button>
          <a href={scholarship.applicationLink} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors" title="Open official application portal"><ExternalLink className="w-3.5 h-3.5" /></a>
        </div>
      </div>
    </article>
  );
};
