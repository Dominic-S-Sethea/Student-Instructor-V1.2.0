import React, { useState, useEffect } from 'react';
import {
  Zap,
  Puzzle,
  Gamepad2,
  HelpCircle,
  Flag,
  Sparkles,
  CheckCircle2,
  Award,
  Lightbulb,
  ArrowRight,
  Clock,
  Layers,
  RotateCcw,
  Check,
  X,
  Play,
  TrendingUp,
} from 'lucide-react';
import {
  LearningActivity,
  StudentActivityProgress,
} from '../../../shared/types/learningTypes';
import { learningClient, ActivityWithStatus } from '../../services/learningClient';

interface STEMActivitiesViewProps {
  studentId?: string;
  onRewardEarned?: (points: number, message: string, badgeCode?: string) => void;
  onNavigateToRoom?: () => void;
}

export const STEMActivitiesView: React.FC<STEMActivitiesViewProps> = ({
  studentId = 'usr-student-01',
  onRewardEarned,
  onNavigateToRoom,
}) => {
  const [activities, setActivities] = useState<ActivityWithStatus[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Active Runner Modal
  const [activeActivity, setActiveActivity] = useState<ActivityWithStatus | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [userSubmission, setUserSubmission] = useState<any>({});
  const [completedFeedback, setCompletedFeedback] = useState<{
    score: number;
    points: number;
    badge?: string;
  } | null>(null);

  // Puzzle state: Logic Circuit
  const [puzzleWireA, setPuzzleWireA] = useState<number>(0);
  const [puzzleWireB, setPuzzleWireB] = useState<number>(1);
  const [puzzleGate, setPuzzleGate] = useState<'AND' | 'OR' | 'XOR'>('AND');

  // Simulation state: Orbital speed slider
  const [orbitSpeed, setOrbitSpeed] = useState<number>(7.8); // km/s

  // Quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);

  // Solar microgrid project state
  const [solarPanelsCount, setSolarPanelsCount] = useState<number>(12);
  const [batteryCapacityKwh, setBatteryCapacityKwh] = useState<number>(30);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const list = await learningClient.getActivities(
        selectedSubject !== 'all' ? selectedSubject : undefined,
        selectedType !== 'all' ? selectedType : undefined,
        studentId
      );
      setActivities(list);
    } catch (err) {
      console.error('Failed to load STEM activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedType, selectedSubject]);

  const handleLaunchActivity = (act: ActivityWithStatus) => {
    setActiveActivity(act);
    setShowHint(false);
    setCompletedFeedback(null);
    setUserSubmission({});
    setSelectedQuizAnswer(null);

    // Initial configurations
    if (act.id === 'act-puzzle-logic') {
      setPuzzleWireA(0);
      setPuzzleWireB(1);
      setPuzzleGate('AND');
    } else if (act.id === 'act-sim-orbit') {
      setOrbitSpeed(7.8);
    } else if (act.id === 'act-proj-solar') {
      setSolarPanelsCount(12);
      setBatteryCapacityKwh(30);
    }

    // Log started action
    learningClient.recordActivityAction(act.id, 'started', {}, 0, studentId);
  };

  const handleUseHint = async () => {
    if (!activeActivity || showHint) return;
    setShowHint(true);
    await learningClient.recordActivityAction(activeActivity.id, 'hint_used', {}, undefined, studentId);
    learningClient.logAnalyticsEvent('HINT_USED', { activityId: activeActivity.id });
  };

  const handleSubmitActivity = async () => {
    if (!activeActivity) return;

    let score = 90;
    let responseData: any = {};

    if (activeActivity.id === 'act-puzzle-logic') {
      // Logic test: We want output = 1
      const out = puzzleGate === 'AND' ? puzzleWireA & puzzleWireB : puzzleGate === 'OR' ? puzzleWireA | puzzleWireB : puzzleWireA ^ puzzleWireB;
      score = out === 1 ? 100 : 40;
      responseData = { wireA: puzzleWireA, wireB: puzzleWireB, gate: puzzleGate, output: out };
    } else if (activeActivity.id === 'act-sim-orbit') {
      // Circular orbital velocity ~ 7.8 km/s
      const diff = Math.abs(orbitSpeed - 7.8);
      score = diff <= 0.2 ? 100 : diff <= 0.6 ? 85 : 50;
      responseData = { orbitalSpeedKmS: orbitSpeed };
    } else if (activeActivity.id === 'act-quiz-chem-eq') {
      score = selectedQuizAnswer === 1 ? 100 : 40;
      responseData = { selectedAnswerIndex: selectedQuizAnswer };
    } else if (activeActivity.id === 'act-proj-solar') {
      // Daily generation: 12 panels * 400W * 5h = 24kWh. Battery 30kWh is good!
      score = solarPanelsCount >= 10 && batteryCapacityKwh >= 20 ? 95 : 70;
      responseData = { solarPanelsCount, batteryCapacityKwh };
    }

    const res = await learningClient.recordActivityAction(
      activeActivity.id,
      'completed',
      responseData,
      score,
      studentId
    );

    if (res) {
      const pointsEarned = res.meritPointsEarned ?? 0;
      const badge = res.unlockedBadge ?? undefined;
      setCompletedFeedback({
        score,
        points: pointsEarned,
        badge,
      });

      // Update in local list
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activeActivity.id ? { ...a, student_status: 'completed', student_score: score } : a
        )
      );

      if (onRewardEarned) {
        onRewardEarned(pointsEarned, `Completed ${activeActivity.title}!`, badge);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-900/40">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-400/30 mb-3 font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive STEM Exploration Framework • សកម្មភាពសិក្សា STEM</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Interactive Puzzles, Simulations & Challenges
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Move beyond static textbooks. Solve dynamic digital circuits, calculate gravitational orbits, balance chemical equilibrium systems, and complete real-world engineering project briefs.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Activity Types */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Activities', icon: Layers },
            { id: 'puzzle', label: 'Puzzles', icon: Puzzle },
            { id: 'simulation', label: 'Simulations', icon: Gamepad2 },
            { id: 'quiz', label: 'Diagnostics', icon: HelpCircle },
            { id: 'challenge', label: 'Challenges', icon: Zap },
            { id: 'project', label: 'Projects', icon: Flag },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = selectedType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedType(item.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Subject Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Discipline:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Disciplines</option>
            <option value="sub-math">Mathematics</option>
            <option value="sub-phys">Physics</option>
            <option value="sub-chem">Chemistry</option>
            <option value="sub-bio">Biology</option>
            <option value="sub-cs">Computer Science</option>
            <option value="sub-tech">Technology</option>
          </select>
        </div>
      </div>

      {/* Activity Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Puzzle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No STEM Activities Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try switching to "All Activities" to see all available learning challenges.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((act) => {
            const isCompleted = act.student_status === 'completed';

            return (
              <div
                key={act.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-blue-300"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-blue-100 text-blue-800">
                      {act.activity_type}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {isCompleted ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{act.student_score}%</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 capitalize">
                          {act.difficulty}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Khmer */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {act.title}
                  </h3>
                  {act.title_km && (
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{act.title_km}</p>
                  )}

                  {/* Objective */}
                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {act.learning_objective}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-amber-600 font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    <span>+{act.reward_points} pts</span>
                  </div>

                  <button
                    onClick={() => handleLaunchActivity(act)}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-xl font-bold transition-colors flex items-center space-x-1"
                  >
                    <span>{isCompleted ? 'Retry / Review' : 'Launch Activity'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Activity Runner Modal */}
      {activeActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-100 text-blue-800">
                      {activeActivity.activity_type}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">
                      {activeActivity.difficulty} Level
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {activeActivity.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveActivity(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
              {/* Instructions */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
                <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-1">
                  Challenge Brief:
                </h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {activeActivity.instructions}
                </p>
              </div>

              {/* Dynamic Interactive Puzzle View */}
              {activeActivity.id === 'act-puzzle-logic' && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-purple-400 font-bold">Target Specification: Output Y must equal 1</span>
                    <span className="text-slate-400 font-mono">Current Y = {puzzleGate === 'AND' ? puzzleWireA & puzzleWireB : puzzleGate === 'OR' ? puzzleWireA | puzzleWireB : puzzleWireA ^ puzzleWireB}</span>
                  </div>

                  <div className="flex items-center justify-center space-x-6 py-4">
                    {/* Inputs */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setPuzzleWireA(puzzleWireA === 1 ? 0 : 1)}
                        className={`px-3 py-2 rounded-xl font-mono text-xs font-bold ${
                          puzzleWireA === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Input A: {puzzleWireA}
                      </button>
                      <button
                        onClick={() => setPuzzleWireB(puzzleWireB === 1 ? 0 : 1)}
                        className={`px-3 py-2 rounded-xl font-mono text-xs font-bold ${
                          puzzleWireB === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Input B: {puzzleWireB}
                      </button>
                    </div>

                    {/* Gate selection */}
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase">Gate</span>
                      <select
                        value={puzzleGate}
                        onChange={(e) => setPuzzleGate(e.target.value as any)}
                        className="bg-purple-900 border border-purple-500 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden"
                      >
                        <option value="AND">AND Gate</option>
                        <option value="OR">OR Gate</option>
                        <option value="XOR">XOR Gate</option>
                      </select>
                    </div>

                    {/* Output */}
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase">Output LED</span>
                      <div
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                          (puzzleGate === 'AND' ? puzzleWireA & puzzleWireB : puzzleGate === 'OR' ? puzzleWireA | puzzleWireB : puzzleWireA ^ puzzleWireB) === 1
                            ? 'bg-emerald-400 border-emerald-200 text-emerald-950 shadow-lg shadow-emerald-500/50'
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}
                      >
                        {puzzleGate === 'AND' ? puzzleWireA & puzzleWireB : puzzleGate === 'OR' ? puzzleWireA | puzzleWireB : puzzleWireA ^ puzzleWireB}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Interactive Orbit Simulation */}
              {activeActivity.id === 'act-sim-orbit' && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Set Orbital Tangential Velocity:</span>
                    <span className="font-mono text-blue-400 font-bold">{orbitSpeed.toFixed(1)} km/s</span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="11.2"
                    step="0.1"
                    value={orbitSpeed}
                    onChange={(e) => setOrbitSpeed(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="text-[11px] text-slate-400">
                    {orbitSpeed < 7.6 ? (
                      <span className="text-rose-400 font-bold">Sub-orbital: Trajectory intersects atmosphere (crashes).</span>
                    ) : orbitSpeed > 8.5 ? (
                      <span className="text-amber-400 font-bold">Hyperbolic / Highly Elliptical: Risk of orbital escape.</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">Stable Low Earth Orbit achieved! (Circular velocity v ~ 7.8 km/s).</span>
                    )}
                  </div>
                </div>
              )}

              {/* Dynamic Quiz Runner */}
              {activeActivity.id === 'act-quiz-chem-eq' && (
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">
                    For an exothermic reaction N₂(g) + 3H₂(g) ⇌ 2NH₃(g) + Heat, what happens when temperature is increased?
                  </p>
                  <div className="space-y-2">
                    {[
                      'Equilibrium shifts Right to produce more NH₃',
                      'Equilibrium shifts Left to absorb excess thermal energy',
                      'Equilibrium does not shift; only reaction rate increases',
                      'Catalyst is depleted instantly',
                    ].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedQuizAnswer(i)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                          selectedQuizAnswer === i
                            ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Solar Project Runner */}
              {activeActivity.id === 'act-proj-solar' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-700 font-medium">Solar PV Panels (400W each):</span>
                        <span className="font-bold text-blue-700">{solarPanelsCount} Units</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="24"
                        value={solarPanelsCount}
                        onChange={(e) => setSolarPanelsCount(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-700 font-medium">Battery Storage Bank:</span>
                        <span className="font-bold text-blue-700">{batteryCapacityKwh} kWh</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="60"
                        step="5"
                        value={batteryCapacityKwh}
                        onChange={(e) => setBatteryCapacityKwh(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                    Daily Generation: <strong>{(solarPanelsCount * 0.4 * 5).toFixed(1)} kWh/day</strong> • School Night Load Reserve:{' '}
                    <strong>{batteryCapacityKwh >= 20 ? 'Sufficient (100% Reliability)' : 'Deficit Risk'}</strong>
                  </div>
                </div>
              )}

              {/* Hint Accordion */}
              {activeActivity.hint && (
                <div className="pt-2">
                  {!showHint ? (
                    <button
                      onClick={handleUseHint}
                      className="inline-flex items-center space-x-1.5 text-xs text-amber-700 font-semibold hover:text-amber-800"
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>Need a hint? (Tracked in analytics)</span>
                    </button>
                  ) : (
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 animate-fadeIn">
                      <span className="font-bold">Pedagogical Hint: </span>
                      {activeActivity.hint}
                    </div>
                  )}
                </div>
              )}

              {/* Completion Reward Feedback */}
              {completedFeedback && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900">
                        Activity Verified! Score: {completedFeedback.score}% (+{completedFeedback.points} pts)
                      </h4>
                      {completedFeedback.badge && (
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Badge Awarded: <strong>{completedFeedback.badge}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                  {onNavigateToRoom && (
                    <button
                      onClick={onNavigateToRoom}
                      className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800"
                    >
                      Room
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Reward: +{activeActivity.reward_points} Merit Points
              </span>

              <button
                onClick={handleSubmitActivity}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Submit Solution & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
