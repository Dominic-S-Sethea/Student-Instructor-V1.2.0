import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders,
  FileText,
  Award,
  Zap,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Gift,
  HelpCircle,
} from 'lucide-react';
import {
  LabExperiment,
  LabExperimentResult,
} from '../../../shared/types/learningTypes';
import { learningClient, ExperimentWithStatus } from '../../services/learningClient';
import { useAuth } from '../../context/AuthContext';

interface VirtualLabViewProps {
  studentId?: string;
  initialExperimentId?: string;
  onRewardEarned?: (points: number, message: string, badgeName?: string, itemName?: string) => void;
  onNavigateToRoom?: () => void;
}

export const VirtualLabView: React.FC<VirtualLabViewProps> = ({
  studentId: propStudentId,
  initialExperimentId,
  onRewardEarned,
  onNavigateToRoom,
}) => {
  const { user } = useAuth();
  const studentId = user?.id || propStudentId || '';
  const [experiments, setExperiments] = useState<ExperimentWithStatus[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<string>(initialExperimentId || 'exp-chem-01');
  const [activeExp, setActiveExp] = useState<LabExperiment | null>(null);
  const [userSession, setUserSession] = useState<LabExperimentResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulation parameters for each experiment type
  // 1. Titration
  const [titrantVolume, setTitrantVolume] = useState<number>(0); // 0 to 50 mL
  const [isDripping, setIsDripping] = useState<boolean>(false);
  const [dripRate, setDripRate] = useState<number>(0.5); // mL per tick

  // 2. Pendulum
  const [pendulumLength, setPendulumLength] = useState<number>(1.0); // meters
  const [pendulumAngle, setPendulumAngle] = useState<number>(15); // degrees
  const [isOscillating, setIsOscillating] = useState<boolean>(false);
  const [oscillationTime, setOscillationTime] = useState<number>(0);

  // 3. Snell's Law
  const [incidentAngle, setIncidentAngle] = useState<number>(45); // degrees
  const [refractiveIndex, setRefractiveIndex] = useState<number>(1.5); // Crown glass

  // 4. Plant Cell Osmosis
  const [sucroseConcentration, setSucroseConcentration] = useState<number>(0.2); // Molar

  // 5. Binary Logic Gate
  const [inputA, setInputA] = useState<number>(0);
  const [inputB, setInputB] = useState<number>(1);
  const [gateType, setGateType] = useState<'AND' | 'OR' | 'XOR' | 'NAND'>('AND');

  // Observation notes & Submission feedback
  const [observationNotes, setObservationNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [completionReward, setCompletionReward] = useState<{
    score: number;
    points: number;
    badge?: string;
    item?: string;
  } | null>(null);

  // Load experiments
  const loadExperiments = async (): Promise<void> => {
    try {
      setLoading(true);
      const list = await learningClient.getLabExperiments();
      setExperiments(list);
      if (list.length > 0) {
        const toSelect = initialExperimentId && list.some((e) => e.id === initialExperimentId)
          ? initialExperimentId
          : list[0].id;
        setSelectedExpId(toSelect);
      }
    } catch (err) {
      console.error('Failed to load lab experiments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadExperiments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  // Load active experiment detail
  useEffect(() => {
    if (!selectedExpId) return;
    let active = true;
    const fetchDetail = async (): Promise<void> => {
      try {
        const data = await learningClient.getExperimentDetail(selectedExpId, studentId);
        if (!active || !data) return;
        setActiveExp(data.experiment);
        setUserSession(data.user_session);
        setObservationNotes(data.user_session?.observation_notes || '');
        setCompletionReward(null);
        resetParametersFor(selectedExpId);
      } catch (err) {
        console.error('Failed to load experiment detail:', err);
      }
    };
    void fetchDetail();
    return () => {
      active = false;
    };
  }, [selectedExpId, studentId]);

  const resetParametersFor = (expId: string) => {
    if (expId === 'exp-chem-01') {
      setTitrantVolume(0);
      setIsDripping(false);
    } else if (expId === 'exp-physics-01') {
      setPendulumLength(1.0);
      setPendulumAngle(15);
      setIsOscillating(false);
      setOscillationTime(0);
    } else if (expId === 'exp-snell-01') {
      setIncidentAngle(45);
      setRefractiveIndex(1.5);
    } else if (expId === 'exp-bio-01') {
      setSucroseConcentration(0.2);
    } else if (expId === 'exp-cs-01') {
      setInputA(0);
      setInputB(1);
      setGateType('AND');
    }
  };

  // Titration Interval animation
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isDripping && selectedExpId === 'exp-chem-01') {
      timer = setInterval(() => {
        setTitrantVolume((prev) => {
          const next = Math.min(50, Math.round((prev + dripRate) * 10) / 10);
          if (next >= 50) setIsDripping(false);
          return next;
        });
      }, 100);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isDripping, dripRate, selectedExpId]);

  // Pendulum Oscillation Interval
  useEffect(() => {
    let animTimer: ReturnType<typeof setInterval> | undefined;
    if (isOscillating && selectedExpId === 'exp-physics-01') {
      animTimer = setInterval(() => {
        setOscillationTime((prev) => prev + 0.05);
      }, 50);
    }
    return () => {
      if (animTimer) clearInterval(animTimer);
    };
  }, [isOscillating, selectedExpId]);

  // Calculate simulated values
  const calcTitrationPH = (vol: number) => {
    if (vol < 25) {
      const remainingMoles = (25 - vol) * 0.0001;
      const totalVolL = (25 + vol) / 1000;
      const hConc = remainingMoles / totalVolL;
      return Math.max(1.0, Math.min(6.5, -Math.log10(hConc)));
    } else if (Math.abs(vol - 25) < 0.1) {
      return 7.0;
    } else {
      const excessMoles = (vol - 25) * 0.0001;
      const totalVolL = (25 + vol) / 1000;
      const ohConc = excessMoles / totalVolL;
      const pOH = -Math.log10(ohConc);
      return Math.min(13.0, 14.0 - pOH);
    }
  };

  const currentPH = calcTitrationPH(titrantVolume);
  const isPhenolphthaleinPink = currentPH >= 8.2;

  const pendulumPeriod = 2 * Math.PI * Math.sqrt(pendulumLength / 9.81);
  const experimentalG = (4 * Math.PI * Math.PI * pendulumLength) / (pendulumPeriod * pendulumPeriod);

  const rad1 = (incidentAngle * Math.PI) / 180;
  const sinTheta2 = (1.0 / refractiveIndex) * Math.sin(rad1);
  const theta2Deg = ((Math.asin(Math.min(1.0, sinTheta2)) * 180) / Math.PI).toFixed(1);

  const plasmolysisPercent =
    sucroseConcentration <= 0.2
      ? 0
      : sucroseConcentration >= 0.8
      ? 100
      : Math.round(((sucroseConcentration - 0.2) / 0.6) * 100);

  const logicOutput =
    gateType === 'AND'
      ? inputA & inputB
      : gateType === 'OR'
      ? inputA | inputB
      : gateType === 'XOR'
      ? inputA ^ inputB
      : (inputA & inputB) === 1
      ? 0
      : 1;

  // Verify and Submit Experiment
  const handleVerifyExperiment = async (): Promise<void> => {
    if (!activeExp) return;
    try {
      setSubmitting(true);

      let score = 90;
      let parametersUsed: Record<string, unknown> = {};
      let outcomeData: Record<string, unknown> = {};

      if (activeExp.id === 'exp-chem-01') {
        const errorMargin = Math.abs(titrantVolume - 25.0);
        score = errorMargin <= 0.5 ? 98 : errorMargin <= 1.5 ? 88 : errorMargin <= 3.0 ? 75 : 60;
        parametersUsed = { titrantVolume, dripRate };
        outcomeData = { finalPH: currentPH.toFixed(2), equivalenceReached: titrantVolume >= 24.5 && titrantVolume <= 25.5 };
      } else if (activeExp.id === 'exp-physics-01') {
        score = Math.abs(experimentalG - 9.81) < 0.1 ? 95 : 85;
        parametersUsed = { pendulumLength, pendulumAngle };
        outcomeData = { calculatedG: experimentalG.toFixed(3), measuredPeriod: pendulumPeriod.toFixed(2) };
      } else if (activeExp.id === 'exp-snell-01') {
        score = 92;
        parametersUsed = { incidentAngle, refractiveIndex };
        outcomeData = { refractedAngle: theta2Deg };
      } else if (activeExp.id === 'exp-bio-01') {
        score = sucroseConcentration >= 0.4 ? 94 : 80;
        parametersUsed = { sucroseConcentration };
        outcomeData = { plasmolysisPercent };
      } else if (activeExp.id === 'exp-cs-01') {
        score = 100;
        parametersUsed = { inputA, inputB, gateType };
        outcomeData = { logicOutput };
      }

      const res = await learningClient.completeLabExperiment(
        activeExp.id,
        parametersUsed,
        outcomeData,
        score,
        studentId,
        observationNotes
      );

      if (res) {
        const pointsEarned = res.meritPointsEarned ?? 0;
        const badge = res.unlockedBadge ?? undefined;
        const itemReward = res.itemRewardName ?? undefined;
        setUserSession(res.result ?? null);
        setCompletionReward({
          score,
          points: pointsEarned,
          badge,
          item: itemReward,
        });

        // Update list status
        setExperiments((prev) =>
          prev.map((e) => (e.id === activeExp.id ? { ...e, student_status: 'completed', best_score: score } : e))
        );

        if (onRewardEarned) {
          onRewardEarned(
            pointsEarned,
            `Verified ${activeExp.title}!`,
            badge,
            itemReward
          );
        }
      }
    } catch (err) {
      console.error('Failed to verify experiment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-purple-900/40">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-400/30 mb-3 font-semibold">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>CDES STEM Virtual Simulation Laboratory • បន្ទប់ពិសោធន៍ STEM និម្មិត</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Scientific Inquiry & Apparatus Workbench
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Conduct precision laboratory experiments aligned with national Bac II curricula.
            Adjust parameters in real time, record analytical observations, and submit empirical data to earn merit points and equipable room apparatus!
          </p>
        </div>
      </div>

      {/* Main Workbench Layout: Left Experiment Selector, Right Interactive Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Experiments Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Laboratory Modules
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {experiments.length} Protocols
              </span>
            </div>

            <div className="space-y-2">
              {experiments.map((exp) => {
                const isSelected = exp.id === selectedExpId;
                const isCompleted = exp.student_status === 'completed';

                return (
                  <button
                    key={exp.id}
                    onClick={() => setSelectedExpId(exp.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-purple-50 border-purple-400 text-purple-950 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <FlaskConical className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-purple-700">
                          {exp.category}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {exp.best_score}%
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold truncate mt-0.5">{exp.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{exp.title_km}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safety & Learning Connection Info */}
          {activeExp && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Standard Protocol & Safety</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                {activeExp.safety_notes ||
                  'Wear protective eye-goggles and handle glassware with steady laboratory technique.'}
              </p>
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-900 font-medium">
                <span>Merit Reward: +{activeExp.merit_points} pts</span>
                {activeExp.badge_reward_code && (
                  <span className="bg-amber-200/60 px-2 py-0.5 rounded text-amber-950 font-bold">
                    Badge Unlock
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Simulation Stage (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {activeExp ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Bench Header */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-purple-100 text-purple-800">
                      {activeExp.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 capitalize">
                      {activeExp.difficulty} Level
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {activeExp.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => resetParametersFor(activeExp.id)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Reset apparatus"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleVerifyExperiment}
                    disabled={submitting}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submitting ? 'Verifying...' : 'Verify & Record Outcome'}</span>
                  </button>
                </div>
              </div>

              {/* Apparatus Visual Workbench */}
              <div className="p-5 sm:p-6 bg-slate-950 text-white relative min-h-[320px] flex flex-col items-center justify-center border-b border-slate-800">
                {/* 1. ACID-BASE TITRATION INTERACTIVE APPARATUS */}
                {activeExp.id === 'exp-chem-01' && (
                  <div className="w-full max-w-lg flex flex-col items-center space-y-4">
                    <div className="text-center text-xs text-slate-400">
                      Burette Dispenser (0.1M NaOH) → Flask (25.0 mL 0.1M HCl + Phenolphthalein)
                    </div>

                    <div className="flex items-center justify-center space-x-12">
                      {/* Burette Graphic */}
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-40 bg-slate-800/80 border border-slate-600 rounded-b-md relative overflow-hidden flex flex-col justify-end">
                          {/* Fluid Level */}
                          <div
                            className="w-full bg-blue-400/80 transition-all duration-200"
                            style={{ height: `${Math.max(0, 100 - (titrantVolume / 50) * 100)}%` }}
                          />
                          {/* Graduation markings */}
                          <div className="absolute inset-0 flex flex-col justify-between py-1 px-0.5 text-[7px] text-slate-400 pointer-events-none">
                            <span>0mL</span>
                            <span>25mL</span>
                            <span>50mL</span>
                          </div>
                        </div>

                        {/* Stopcock valve */}
                        <div
                          onClick={() => setIsDripping(!isDripping)}
                          className={`w-8 h-4 mt-1 rounded cursor-pointer transition-colors flex items-center justify-center text-[8px] font-bold ${
                            isDripping ? 'bg-emerald-500 text-slate-900' : 'bg-rose-500 text-white'
                          }`}
                        >
                          {isDripping ? 'OPEN' : 'SHUT'}
                        </div>

                        {/* Dripping droplet */}
                        {isDripping && (
                          <div className="w-1.5 h-2 bg-blue-400 rounded-full animate-bounce mt-1" />
                        )}
                      </div>

                      {/* Erlenmeyer Flask */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-24 h-24 border-2 border-slate-500 rounded-b-3xl rounded-t-lg relative overflow-hidden flex flex-col justify-end p-2 transition-colors duration-500"
                          style={{
                            backgroundColor: isPhenolphthaleinPink
                              ? 'rgba(244, 114, 182, 0.45)'
                              : 'rgba(59, 130, 246, 0.08)',
                          }}
                        >
                          {/* Fluid volume inside */}
                          <div
                            className="w-full rounded-b-2xl transition-all duration-300 flex items-center justify-center text-[10px] font-bold"
                            style={{
                              height: '55%',
                              backgroundColor: isPhenolphthaleinPink ? '#f472b6' : '#93c5fd',
                              color: isPhenolphthaleinPink ? '#831843' : '#1e3a8a',
                            }}
                          >
                            {isPhenolphthaleinPink ? 'Pink (pH > 8.2)' : 'Clear (Acidic)'}
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 mt-2 font-mono">
                          Flask pH: <strong className="text-white">{currentPH.toFixed(2)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Telemetry Indicator */}
                    <div className="flex items-center space-x-6 text-xs bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-400">NaOH Dispensed: </span>
                        <span className="font-mono text-purple-400 font-bold">{titrantVolume.toFixed(1)} mL</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Equivalence Target: </span>
                        <span className="font-mono text-emerald-400 font-bold">25.0 mL</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SIMPLE HARMONIC PENDULUM */}
                {activeExp.id === 'exp-physics-01' && (
                  <div className="w-full max-w-md flex flex-col items-center space-y-3">
                    <div className="text-center text-xs text-slate-400">
                      Rigid Pivot Support • Harmonic Length L = {pendulumLength.toFixed(2)}m
                    </div>

                    <svg className="w-64 h-48" viewBox="-80 0 160 140">
                      {/* Ceiling beam */}
                      <line x1="-70" y1="5" x2="70" y2="5" stroke="#94a3b8" strokeWidth="4" />
                      <circle cx="0" cy="5" r="4" fill="#38bdf8" />

                      {(() => {
                        const currentAngleRad = isOscillating
                          ? ((pendulumAngle * Math.PI) / 180) *
                            Math.cos((2 * Math.PI * oscillationTime) / pendulumPeriod)
                          : (pendulumAngle * Math.PI) / 180;

                        const pixelLen = 30 + pendulumLength * 50;
                        const bobX = Math.sin(currentAngleRad) * pixelLen;
                        const bobY = 5 + Math.cos(currentAngleRad) * pixelLen;

                        return (
                          <>
                            <line x1="0" y1="5" x2={bobX} y2={bobY} stroke="#e2e8f0" strokeWidth="1.5" />
                            <circle cx={bobX} cy={bobY} r="9" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setIsOscillating(!isOscillating)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          isOscillating ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isOscillating ? 'Stop Motion' : 'Start Oscillation'}
                      </button>
                      <span className="text-xs font-mono text-slate-300">
                        Period T: <strong className="text-purple-400">{pendulumPeriod.toFixed(2)}s</strong>
                      </span>
                      <span className="text-xs font-mono text-slate-300">
                        g: <strong className="text-emerald-400">{experimentalG.toFixed(2)} m/s²</strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. SNELL'S LAW REFRACTION */}
                {activeExp.id === 'exp-snell-01' && (
                  <div className="w-full max-w-md flex flex-col items-center space-y-3">
                    <div className="text-xs text-slate-400">
                      Optical Acrylic Block (n = {refractiveIndex}) • Incident Angle θ₁ = {incidentAngle}°
                    </div>

                    <svg className="w-64 h-44" viewBox="-100 -50 200 100">
                      {/* Boundary Line */}
                      <line x1="-90" y1="0" x2="90" y2="0" stroke="#64748b" strokeWidth="2" />
                      {/* Normal Line (dashed) */}
                      <line x1="0" y1="-45" x2="0" y2="45" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />

                      {(() => {
                        const radIn = (incidentAngle * Math.PI) / 180;
                        const xIn = -Math.sin(radIn) * 55;
                        const yIn = -Math.cos(radIn) * 55;

                        const sinR = (1.0 / refractiveIndex) * Math.sin(radIn);
                        const radR = Math.asin(Math.min(1.0, sinR));
                        const xOut = Math.sin(radR) * 55;
                        const yOut = Math.cos(radR) * 55;

                        return (
                          <>
                            <line x1={xIn} y1={yIn} x2="0" y2="0" stroke="#ef4444" strokeWidth="2.5" />
                            <line x1="0" y1="0" x2={xOut} y2={yOut} stroke="#38bdf8" strokeWidth="2.5" />
                            <text x="-45" y="-15" fill="#f87171" fontSize="9">
                              θ₁ = {incidentAngle}°
                            </text>
                            <text x="15" y="25" fill="#38bdf8" fontSize="9">
                              θ₂ = {theta2Deg}°
                            </text>
                          </>
                        );
                      })()}
                    </svg>

                    <div className="text-xs font-mono text-emerald-400">
                      Snell's Equation: 1.00 × sin({incidentAngle}°) = {refractiveIndex} × sin({theta2Deg}°)
                    </div>
                  </div>
                )}

                {/* 4. PLANT CELL OSMOSIS */}
                {activeExp.id === 'exp-bio-01' && (
                  <div className="w-full max-w-md flex flex-col items-center space-y-3">
                    <div className="text-xs text-slate-400">
                      Microscopic Slide: Allium cepa (Red Onion) • Sucrose Solution: {sucroseConcentration} M
                    </div>

                    <div className="w-48 h-36 bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-3 flex flex-col justify-center items-center relative overflow-hidden">
                      {/* Cell Wall */}
                      <div className="w-36 h-24 border-2 border-emerald-600 rounded-md relative flex items-center justify-center bg-slate-950">
                        {/* Vacuole / Protoplast shrinking away based on plasmolysisPercent */}
                        <div
                          className="bg-purple-700/80 rounded-sm transition-all duration-500 flex items-center justify-center text-[9px] font-bold text-white"
                          style={{
                            width: `${Math.max(30, 100 - plasmolysisPercent * 0.65)}%`,
                            height: `${Math.max(30, 100 - plasmolysisPercent * 0.65)}%`,
                          }}
                        >
                          Vacuole
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-purple-300">
                      Plasmolysis: <strong>{plasmolysisPercent}%</strong> • Turgor State:{' '}
                      <strong>{plasmolysisPercent > 20 ? 'Plasmolysed (Hypertonic)' : 'Turgid (Normal)'}</strong>
                    </div>
                  </div>
                )}

                {/* 5. BINARY LOGIC CIRCUIT */}
                {activeExp.id === 'exp-cs-01' && (
                  <div className="w-full max-w-md flex flex-col items-center space-y-3">
                    <div className="text-xs text-slate-400">
                      TTL 7400 Series Logic Workbench • Gate: {gateType}
                    </div>

                    <div className="flex items-center space-x-6 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                      {/* Inputs */}
                      <div className="space-y-2 text-xs">
                        <button
                          onClick={() => setInputA(inputA === 1 ? 0 : 1)}
                          className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${
                            inputA === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          Input A: {inputA}
                        </button>
                        <button
                          onClick={() => setInputB(inputB === 1 ? 0 : 1)}
                          className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${
                            inputB === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          Input B: {inputB}
                        </button>
                      </div>

                      {/* Gate Display */}
                      <div className="w-16 h-16 bg-purple-900/80 rounded-xl border border-purple-500 flex items-center justify-center font-bold text-purple-200 text-sm">
                        {gateType}
                      </div>

                      {/* Output LED */}
                      <div className="flex flex-col items-center space-y-1">
                        <div
                          className={`w-8 h-8 rounded-full border-2 transition-all shadow-md ${
                            logicOutput === 1
                              ? 'bg-emerald-400 border-emerald-200 shadow-emerald-500/50'
                              : 'bg-slate-800 border-slate-700'
                          }`}
                        />
                        <span className="text-[10px] font-mono text-slate-400">
                          LED = {logicOutput}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Simulation Controls Strip */}
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  <span>Interactive Apparatus Parameters</span>
                </div>

                {activeExp.id === 'exp-chem-01' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-600 font-medium">Burette Dispense Slider:</span>
                        <span className="font-mono font-bold text-purple-700">{titrantVolume} mL</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="0.1"
                        value={titrantVolume}
                        onChange={(e) => setTitrantVolume(Number(e.target.value))}
                        className="w-full accent-purple-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-600 font-medium">Drop Dispense Rate:</span>
                        <span className="font-mono font-bold text-purple-700">{dripRate} mL/tick</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={dripRate}
                        onChange={(e) => setDripRate(Number(e.target.value))}
                        className="w-full accent-purple-600"
                      />
                    </div>
                  </div>
                )}

                {activeExp.id === 'exp-physics-01' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-600 font-medium">String Length (L):</span>
                        <span className="font-mono font-bold text-purple-700">{pendulumLength} m</span>
                      </div>
                      <input
                        type="range"
                        min="0.3"
                        max="2.0"
                        step="0.05"
                        value={pendulumLength}
                        onChange={(e) => setPendulumLength(Number(e.target.value))}
                        className="w-full accent-purple-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-600 font-medium">Release Angle (θ):</span>
                        <span className="font-mono font-bold text-purple-700">{pendulumAngle}°</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="1"
                        value={pendulumAngle}
                        onChange={(e) => setPendulumAngle(Number(e.target.value))}
                        className="w-full accent-purple-600"
                      />
                    </div>
                  </div>
                )}

                {activeExp.id === 'exp-snell-01' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-600 font-medium">Incident Angle (θ₁):</span>
                        <span className="font-mono font-bold text-purple-700">{incidentAngle}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={incidentAngle}
                        onChange={(e) => setIncidentAngle(Number(e.target.value))}
                        className="w-full accent-purple-600"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Refractive Medium:</label>
                      <select
                        value={refractiveIndex}
                        onChange={(e) => setRefractiveIndex(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                      >
                        <option value={1.333}>Water (n = 1.333)</option>
                        <option value={1.5}>Crown Glass (n = 1.50)</option>
                        <option value={1.66}>Dense Flint Glass (n = 1.66)</option>
                        <option value={2.42}>Diamond (n = 2.42)</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeExp.id === 'exp-bio-01' && (
                  <div className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600 font-medium">Sucrose Solution Concentration:</span>
                      <span className="font-mono font-bold text-purple-700">{sucroseConcentration} Molar</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={sucroseConcentration}
                      onChange={(e) => setSucroseConcentration(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                )}

                {activeExp.id === 'exp-cs-01' && (
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-600 font-medium">Gate Logic Function:</span>
                    {(['AND', 'OR', 'XOR', 'NAND'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGateType(g)}
                        className={`px-3 py-1 rounded-lg font-bold ${
                          gateType === g
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Observation Notes & Verified Result Box */}
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>Student Laboratory Notebook & Empirical Observations</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Log your qualitative observations: color transition at equivalence volume, meniscus readings, oscillation dampening, or gate logic truth values..."
                    value={observationNotes}
                    onChange={(e) => setObservationNotes(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Celebratory Reward Box after completion */}
                {completionReward && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-emerald-900">
                            Experiment Verified! Score: {completionReward.score}%
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                            +{completionReward.points} Merit Points
                          </span>
                        </div>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          {completionReward.badge ? (
                            <span>
                              Unlocked Badge: <strong>{completionReward.badge}</strong>
                              {completionReward.item && ` & Room Object: ${completionReward.item}`}
                            </span>
                          ) : (
                            'Empirical protocol completed and logged into your permanent CDES learning history.'
                          )}
                        </p>
                      </div>
                    </div>

                    {onNavigateToRoom && (
                      <button
                        onClick={onNavigateToRoom}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center space-x-1"
                      >
                        <span>View in Room</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">Select an experiment to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
