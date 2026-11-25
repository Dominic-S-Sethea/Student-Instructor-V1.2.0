import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  Sparkles,
  Clock,
  Award,
  Layers,
  FileText,
  Activity,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  FlaskConical,
  GraduationCap,
  X,
  Play,
  RotateCcw,
  Check,
} from 'lucide-react';
import {
  Subject,
  Category,
  LearningContent,
} from '../../../shared/types/learningTypes';
import { learningClient } from '../../services/learningClient';

interface DigitalLibraryViewProps {
  studentId?: string;
  onOpenLabExperiment?: (experimentId: string) => void;
  onRewardEarned?: (points: number, message: string) => void;
}

export const DigitalLibraryView: React.FC<DigitalLibraryViewProps> = ({
  studentId = 'usr-student-01',
  onOpenLabExperiment,
  onRewardEarned,
}) => {
  const [subjects, setSubjects] = useState<(Subject & { categories?: Category[] })[]>([]);
  const [contents, setContents] = useState<(LearningContent & { subject_name?: string; subject_color?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reader Modal State
  const [activeContent, setActiveContent] = useState<
    (LearningContent & { subject_name?: string; subject_color?: string }) | null
  >(null);
  const [readerCompleted, setReaderCompleted] = useState<boolean>(false);

  // Mini-simulation states for active modal
  const [simAngle, setSimAngle] = useState<number>(30);
  const [simMedium2Index, setSimMedium2Index] = useState<number>(1.333); // water
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const [subData, contentData] = await Promise.all([
        learningClient.getSubjects(studentId),
        learningClient.getContentCatalog(
          {
            subject_id: selectedSubjectId !== 'all' ? selectedSubjectId : undefined,
            category_id: selectedCategoryId !== 'all' ? selectedCategoryId : undefined,
            content_type: selectedContentType !== 'all' ? selectedContentType : undefined,
            difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
            search: searchQuery.trim() || undefined,
          },
          studentId
        ),
      ]);
      setSubjects(subData);
      setContents(contentData);
    } catch (err) {
      console.error('Error fetching digital library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedSubjectId, selectedCategoryId, selectedContentType, selectedDifficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog();
    learningClient.logAnalyticsEvent('LIBRARY_SEARCH', { query: searchQuery });
  };

  const handleOpenContent = async (item: LearningContent) => {
    setActiveContent(item);
    setReaderCompleted(false);
    setQuizSelectedOption(null);
    setQuizSubmitted(false);
    setSimAngle(30);

    // Track in database
    await learningClient.getContentDetail(item.id, studentId);
  };

  const handleCompleteContent = async () => {
    if (!activeContent || readerCompleted) return;
    setReaderCompleted(true);

    const points = activeContent.merit_points || 25;
    if (onRewardEarned) {
      onRewardEarned(points, `Completed "${activeContent.title}"!`);
    }

    learningClient.logAnalyticsEvent('CONTENT_COMPLETED', {
      contentId: activeContent.id,
      meritPoints: points,
    });
  };

  // Current categories for active subject
  const currentCategories =
    selectedSubjectId === 'all'
      ? subjects.flatMap((s) => s.categories || [])
      : subjects.find((s) => s.id === selectedSubjectId)?.categories || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-emerald-900/40">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-400/30 mb-3 font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>National Digital Curriculum & STEM Library • បណ្ណាល័យឌីជីថលជាតិ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Digital Learning Library & Interactive Knowledge
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Aligned with the Cambodian MoEYS Bac II syllabus and international STEM standards.
            Engage with interactive simulations, analytical articles, step-by-step practice, and real-world engineering project briefs.
          </p>

          {/* Quick Metrics */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-emerald-200/90">
            <span className="bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-700/50">
              6 Core Disciplines
            </span>
            <span className="bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-700/50">
              Interactive Physics & Chemistry
            </span>
            <span className="bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-700/50">
              Bac II High-Yield Topics
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search concepts, Snell's law, titration, neural networks, Bac II calculus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Subject Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              setSelectedSubjectId('all');
              setSelectedCategoryId('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSubjectId === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Disciplines
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubjectId(sub.id);
                setSelectedCategoryId('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                selectedSubjectId === sub.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: sub.color || '#059669' }}
              />
              <span>{sub.name}</span>
            </button>
          ))}
        </div>

        {/* Category Secondary Pills if subject selected */}
        {currentCategories.length > 0 && selectedSubjectId !== 'all' && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-t border-slate-100 pt-3 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Branch:
            </span>
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                selectedCategoryId === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Branches
            </button>
            {currentCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                  selectedCategoryId === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Content Type & Difficulty Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Format:</span>
            {['all', 'simulation', 'article', 'practice', 'project'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedContentType(type)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium ${
                  selectedContentType === type
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {type === 'all' ? 'All Types' : type}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Level:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Difficulties</option>
              <option value="introductory">Introductory (Grade 10)</option>
              <option value="intermediate">Intermediate (Grade 11)</option>
              <option value="advanced">Advanced (Grade 12 Bac II)</option>
              <option value="olympiad">Olympiad / Higher Ed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Learning Content Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or discipline filters to explore other learning units.
          </p>
          <button
            onClick={() => {
              setSelectedSubjectId('all');
              setSelectedCategoryId('all');
              setSelectedContentType('all');
              setSelectedDifficulty('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {contents.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-emerald-300"
            >
              <div>
                {/* Header Tag Bar */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: item.subject_color || '#059669' }}
                  >
                    {item.subject_name || 'STEM'}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        item.content_type === 'simulation'
                          ? 'bg-purple-100 text-purple-800'
                          : item.content_type === 'project'
                          ? 'bg-amber-100 text-amber-800'
                          : item.content_type === 'quiz'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.content_type}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 capitalize">
                      {item.difficulty}
                    </span>
                  </div>
                </div>

                {/* Title & Khmer Subtitle */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {item.title}
                </h3>
                {item.title_km && (
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{item.title_km}</p>
                )}

                {/* Snippet / Markdown preview */}
                <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                  {item.body_markdown.replace(/[#*`_]/g, '')}
                </p>

                {/* Objectives */}
                {item.learning_objectives && item.learning_objectives.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {item.learning_objectives.slice(0, 2).map((obj, i) => (
                      <div key={i} className="flex items-start space-x-1.5 text-[11px] text-slate-500">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{obj}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3 text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.read_time_minutes} min</span>
                  </span>
                  <span className="flex items-center space-x-1 text-amber-600 font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    <span>+{item.merit_points} pts</span>
                  </span>
                </div>

                <button
                  onClick={() => handleOpenContent(item)}
                  className="inline-flex items-center space-x-1 font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <span>Explore</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Content Modal */}
      {activeContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: activeContent.subject_color || '#059669' }}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800">
                      {activeContent.content_type}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {activeContent.difficulty} • {activeContent.read_time_minutes} min
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {activeContent.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveContent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm leading-relaxed">
              {/* Learning Objectives Box */}
              {activeContent.learning_objectives && activeContent.learning_objectives.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4">
                  <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider mb-2">
                    Learning Competencies (MoEYS Standard):
                  </h4>
                  <ul className="space-y-1.5">
                    {activeContent.learning_objectives.map((obj, i) => (
                      <li key={i} className="flex items-start space-x-2 text-emerald-800 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dynamic Interactive Mini-Simulation (e.g. for Snell's law) */}
              {activeContent.content_type === 'simulation' && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400">
                      <Activity className="w-4 h-4" />
                      <span>Interactive Optics Canvas • Snell's Law Visualizer</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Formula: n₁ sin(θ₁) = n₂ sin(θ₂)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    {/* SVG Light Beam Visualization */}
                    <div className="bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-800 h-48 relative overflow-hidden">
                      <div className="absolute top-2 left-2 text-[10px] text-slate-400">
                        Medium 1: Air (n₁ = 1.0)
                      </div>
                      <div className="absolute bottom-2 left-2 text-[10px] text-slate-400">
                        Medium 2: {simMedium2Index === 1.333 ? 'Water (n₂ = 1.333)' : simMedium2Index === 1.5 ? 'Crown Glass (n₂ = 1.50)' : 'Dense Flint (n₂ = 1.66)'}
                      </div>

                      <svg className="w-full h-full" viewBox="-100 -60 200 120">
                        {/* Interface Line */}
                        <line x1="-90" y1="0" x2="90" y2="0" stroke="#475569" strokeWidth="1.5" />
                        {/* Normal Line (dashed) */}
                        <line x1="0" y1="-50" x2="0" y2="50" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />

                        {/* Incident Ray */}
                        {(() => {
                          const rad1 = (simAngle * Math.PI) / 180;
                          const x1 = -Math.sin(rad1) * 55;
                          const y1 = -Math.cos(rad1) * 55;

                          // Refracted angle theta2: sin(theta2) = (n1/n2) * sin(theta1)
                          const sinTheta2 = (1.0 / simMedium2Index) * Math.sin(rad1);
                          const rad2 = Math.asin(Math.min(1.0, sinTheta2));
                          const deg2 = ((rad2 * 180) / Math.PI).toFixed(1);
                          const x2 = Math.sin(rad2) * 55;
                          const y2 = Math.cos(rad2) * 55;

                          return (
                            <>
                              <line x1={x1} y1={y1} x2="0" y2="0" stroke="#ef4444" strokeWidth="2.5" />
                              <line x1="0" y1="0" x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="2.5" />
                              <text x="-40" y="-20" fill="#f87171" fontSize="9" fontWeight="bold">
                                θ₁ = {simAngle}°
                              </text>
                              <text x="15" y="30" fill="#60a5fa" fontSize="9" fontWeight="bold">
                                θ₂ = {deg2}°
                              </text>
                            </>
                          );
                        })()}
                      </svg>
                    </div>

                    {/* Simulation Controls */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300">Angle of Incidence (θ₁):</span>
                          <span className="text-purple-400 font-bold">{simAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          value={simAngle}
                          onChange={(e) => setSimAngle(Number(e.target.value))}
                          className="w-full accent-purple-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-300 block mb-1">Refractive Medium 2:</label>
                        <select
                          value={simMedium2Index}
                          onChange={(e) => setSimMedium2Index(Number(e.target.value))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        >
                          <option value={1.333}>Water (n = 1.333)</option>
                          <option value={1.5}>Crown Glass (n = 1.50)</option>
                          <option value={1.66}>Dense Flint Glass (n = 1.66)</option>
                          <option value={2.42}>Diamond (n = 2.42)</option>
                        </select>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        Notice how increasing the optical density bends the transmitted ray closer to the normal axis.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Practice Quiz Section if present */}
              {activeContent.quiz_data && activeContent.quiz_data.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Practice Exercise & Diagnostic Check</span>
                  </h4>
                  {activeContent.quiz_data.map((q, idx) => (
                    <div key={idx} className="space-y-3">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800">{q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = quizSelectedOption === optIdx;
                          const isCorrect = optIdx === q.correct_answer_index;
                          let btnClass = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';

                          if (quizSubmitted) {
                            if (isCorrect) {
                              btnClass = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnClass = 'bg-rose-50 border-rose-400 text-rose-900';
                            }
                          } else if (isSelected) {
                            btnClass = 'bg-blue-50 border-blue-500 text-blue-900 font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => !quizSubmitted && setQuizSelectedOption(optIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnClass}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && (
                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {!quizSubmitted ? (
                        <button
                          disabled={quizSelectedOption === null}
                          onClick={() => setQuizSubmitted(true)}
                          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors"
                        >
                          Verify Answer
                        </button>
                      ) : (
                        <div className="mt-3 p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900">
                          <span className="font-bold">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Main Body Markdown Content */}
              <div className="prose prose-sm max-w-none space-y-4">
                {activeContent.body_markdown.split('\n\n').map((paragraph, pIdx) => {
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h4 key={pIdx} className="text-sm font-bold text-slate-900 pt-2">
                        {paragraph.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h3 key={pIdx} className="text-base font-bold text-slate-900 pt-3 border-t border-slate-100">
                        {paragraph.replace('## ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('- ')) {
                    return (
                      <ul key={pIdx} className="list-disc pl-5 space-y-1">
                        {paragraph.split('\n').map((item, iIdx) => (
                          <li key={iIdx} className="text-slate-700">
                            {item.replace(/^- /, '')}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={pIdx} className="text-slate-700 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer with Completion & Reward */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Completion Reward: +{activeContent.merit_points} Merit Points</span>
              </div>

              <div className="flex items-center space-x-2">
                {activeContent.subject_id === 'sub-phys' && onOpenLabExperiment && (
                  <button
                    onClick={() => {
                      setActiveContent(null);
                      onOpenLabExperiment('exp-snell-01');
                    }}
                    className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Launch in Virtual Lab</span>
                  </button>
                )}

                <button
                  onClick={handleCompleteContent}
                  disabled={readerCompleted}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                    readerCompleted
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{readerCompleted ? 'Completed & Points Logged' : 'Mark as Complete'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
