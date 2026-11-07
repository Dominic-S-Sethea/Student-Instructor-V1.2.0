import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { UniversityMajorInsight, Mentor } from '../types';

interface UniversityAlumniViewProps {
  majorInsights: UniversityMajorInsight[];
  mentors: Mentor[];
  onOpenBooking: (mentor: Mentor) => void;
  onAskAIAboutMajor: (majorName: string, university: string) => void;
}

export const UniversityAlumniView: React.FC<UniversityAlumniViewProps> = ({
  majorInsights,
  mentors,
  onOpenBooking,
  onAskAIAboutMajor,
}) => {
  const [selectedUniv, setSelectedUniv] = useState<string>('ALL');
  const [activeMajor, setActiveMajor] = useState<UniversityMajorInsight>(majorInsights[0]);

  const filteredMajors = selectedUniv === 'ALL'
    ? majorInsights
    : majorInsights.filter((m) => m.universityAbbr === selectedUniv);

  const matchedMentor = mentors.find((m) => m.university.includes(activeMajor.universityAbbr));

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              University Curricula & Alumni Insights
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Unbiased curriculum breakdowns, Tronc Commun (Foundation Year) realities, and genuine senior advice from top institutions.
          </p>
        </div>

        {/* Institution Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 shrink-0">
          {['ALL', 'ITC', 'CADT', 'RUPP', 'UHS'].map((abbr) => (
            <button
              key={abbr}
              onClick={() => {
                setSelectedUniv(abbr);
                const firstMatch = abbr === 'ALL'
                  ? majorInsights[0]
                  : majorInsights.find((m) => m.universityAbbr === abbr) || majorInsights[0];
                setActiveMajor(firstMatch);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedUniv === abbr
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {abbr}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Major List on Left, Deep-Dive Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Major selector list */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 px-1 flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>Select Degree Program ({filteredMajors.length})</span>
          </div>

          <div className="space-y-2">
            {filteredMajors.map((major) => {
              const isSelected = activeMajor.id === major.id;
              return (
                <div
                  key={major.id}
                  onClick={() => setActiveMajor(major)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-indigo-600 shadow-md ring-1 ring-indigo-600'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-stone-900 text-white text-[10px] font-bold">
                      {major.universityAbbr}
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium">{major.durationYears}</span>
                  </div>

                  <h2 className="font-bold text-stone-900 text-sm mt-2">
                    {major.majorName}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">{major.universityName}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Deep Dive Dossier */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold">
                  {activeMajor.universityAbbr}
                </span>
                <span className="text-xs text-stone-500 font-semibold">{activeMajor.faculty}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-2">
                {activeMajor.majorName}
              </h2>
              <p className="text-sm text-stone-600">{activeMajor.universityName} • {activeMajor.degreeType}</p>
            </div>

            <button
              onClick={() => onAskAIAboutMajor(activeMajor.majorName, activeMajor.universityName)}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shrink-0 border border-indigo-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ask AI About This Program</span>
            </button>
          </div>

          {/* Foundation Year / Tronc Commun Callout Box */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-2">
            <h3 className="text-amber-900 font-bold text-sm flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Foundation Year / Tronc Commun Reality:</span>
            </h3>
            <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
              {activeMajor.troncCommunOrFoundationYearInfo}
            </p>
          </div>

          {/* Entrance Exam Requirements & Key Subjects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Entrance Requirements</span>
              </h4>
              <ul className="space-y-2">
                {activeMajor.entranceExamRequirements.map((req, i) => (
                  <li key={i} className="text-xs text-stone-700 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Core Academic Subjects</span>
              </h4>
              <ul className="space-y-2">
                {activeMajor.keySubjects.map((sub, i) => (
                  <li key={i} className="text-xs text-stone-700 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{sub}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Career Outcomes */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Target Post-Graduation Career Outcomes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeMajor.careerOutcomes.map((career, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-stone-50 text-stone-800 text-xs font-medium">
                  💼 {career}
                </div>
              ))}
            </div>
          </div>

          {/* Authentic Senior Student Review */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={
                  activeMajor.seniorStudentReview?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                }
                alt={activeMajor.seniorStudentReview?.reviewerName || 'Senior Reviewer'}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                }}
                className="w-11 h-11 rounded-full object-cover border border-stone-300"
              />
              <div>
                <h4 className="font-bold text-stone-900 text-sm">
                  {activeMajor.seniorStudentReview?.reviewerName || 'Senior Student'}
                </h4>
                <p className="text-xs text-stone-500">{activeMajor.seniorStudentReview?.reviewerYear}</p>
              </div>
            </div>

            <blockquote className="italic text-xs sm:text-sm text-stone-700 border-l-2 border-indigo-500 pl-3 leading-relaxed">
              "{activeMajor.seniorStudentReview?.quote}"
            </blockquote>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
              <div className="space-y-1.5 bg-white p-3 rounded-xl border border-stone-100">
                <span className="font-bold text-emerald-800 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>The Real Advantages:</span>
                </span>
                <ul className="space-y-1 text-stone-600">
                  {(activeMajor.seniorStudentReview?.pros || []).map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 bg-white p-3 rounded-xl border border-stone-100">
                <span className="font-bold text-rose-800 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>The Honest Challenges:</span>
                </span>
                <ul className="space-y-1 text-stone-600">
                  {(activeMajor.seniorStudentReview?.challenges || []).map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-950">
              <strong className="font-bold block text-indigo-900 mb-0.5">Advice for Freshmen:</strong>
              {activeMajor.seniorStudentReview?.tipsForFreshmen}
            </div>
          </div>

          {/* Action Footer: Connect with Mentor */}
          {matchedMentor && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-stone-100">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    matchedMentor?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={matchedMentor.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                  }}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Want to talk to {matchedMentor.name}?</h4>
                  <p className="text-[11px] text-stone-500">{matchedMentor.title} • Rated ★ {matchedMentor.rating}</p>
                </div>
              </div>

              <button
                onClick={() => onOpenBooking(matchedMentor)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Book 1-on-1 Advice Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
