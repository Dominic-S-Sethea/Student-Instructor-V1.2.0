import React, { useState, useEffect } from 'react';
import {
  Compass,
  Home,
  BookOpen,
  FlaskConical,
  Briefcase,
  Wrench,
  Trees,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Sparkles,
  Trophy,
  Users,
  Award,
  Send,
  MessageSquare,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Zap,
  Activity,
  Layers,
  Terminal,
  Shield,
  Star,
  Info,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface DigitalCampusWorldHubProps {
  studentId?: string;
  onNavigateTab?: (tab: string) => void;
}

export const DigitalCampusWorldHub: React.FC<DigitalCampusWorldHubProps> = ({
  studentId = 'usr-student-01',
}) => {
  // Top-level Navigation within the Digital Campus World
  const [activeHubView, setActiveHubView] = useState<'world_map' | 'simulation_games' | 'companion_mith' | 'growth_identity' | 'tech_architecture'>('world_map');

  // World Simulation Environment State
  const [activeZoneKey, setActiveZoneKey] = useState<string>('campus_plaza');
  const [lightingPreset, setLightingPreset] = useState<'golden_hour' | 'tropical_noon' | 'twilight_glow' | 'night_nebula'>('golden_hour');
  const [weatherState, setWeatherState] = useState<'tropical_breeze' | 'sunny' | 'monsoon_rain'>('tropical_breeze');

  // Backend state
  const [worldData, setWorldData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Companion Chat state
  const [companionInput, setCompanionInput] = useState('');
  const [companionMessages, setCompanionMessages] = useState<Array<{ id: string; speaker: string; text: string; time: string; tone?: string }>>([
    {
      id: 'm1',
      speaker: 'mith',
      text: 'ជំរាបសួរ Dara! Welcome to the CDES Digital Campus. The Knowledge Sundial shows your study streak is active for 4 days.',
      time: '08:45 AM',
      tone: 'encouraging',
    },
    {
      id: 'm2',
      speaker: 'mith',
      text: 'Have you calibrated your kinematics equations inside Animal Racing or checked the hydraulic gradient in Angkor Adventure today?',
      time: '08:46 AM',
      tone: 'socratic_hint',
    },
  ]);
  const [isMithTyping, setIsMithTyping] = useState(false);
  const [mithAffinity, setMithAffinity] = useState(860);

  // Game Simulator state
  const [selectedGameKey, setSelectedGameKey] = useState<string>('animal_racing_physics');
  const [activeSimulationTrial, setActiveSimulationTrial] = useState<{
    running: boolean;
    variableA: number; // e.g., angle or gradient
    variableB: number; // e.g., friction or flow rate
    resultMetrics: any | null;
  }>({
    running: false,
    variableA: 45,
    variableB: 12,
    resultMetrics: null,
  });
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);

  // Load backend world overview
  useEffect(() => {
    fetchWorldOverview();
  }, []);

  const fetchWorldOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/digital-world/overview');
      const json = await res.json();
      if (json.success) {
        setWorldData(json.data);
      }
    } catch (err) {
      console.error('Failed to load digital world data', err);
    } finally {
      setLoading(false);
    }
  };

  // Send message to Mith
  const handleSendMith = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!companionInput.trim()) return;

    const userText = companionInput;
    setCompanionInput('');

    const newMsg = {
      id: `usr-${Date.now()}`,
      speaker: 'student',
      text: userText,
      time: 'Just now',
    };
    setCompanionMessages((prev) => [...prev, newMsg]);
    setIsMithTyping(true);

    try {
      const res = await fetch('/api/digital-world/companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, studentId }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCompanionMessages((prev) => [
          ...prev,
          {
            id: `mith-${Date.now()}`,
            speaker: 'mith',
            text: data.data.reply,
            time: 'Just now',
            tone: 'motivational',
          },
        ]);
        setMithAffinity((prev) => Math.min(1000, prev + 25));
      }
    } catch (err) {
      setCompanionMessages((prev) => [
        ...prev,
        {
          id: `mith-err-${Date.now()}`,
          speaker: 'mith',
          text: 'The campus neural network is momentarily calibrating, but remember: every setback in learning is an opportunity for cognitive reframing.',
          time: 'Just now',
        },
      ]);
    } finally {
      setIsMithTyping(false);
    }
  };

  // Run educational simulation
  const handleRunSimulation = async () => {
    setActiveSimulationTrial((prev) => ({ ...prev, running: true, resultMetrics: null }));

    setTimeout(async () => {
      let outcome: any = {};
      let bktSkill = 'kinematic_trajectory_calculation';

      if (selectedGameKey === 'animal_racing_physics') {
        const optimalApex = Math.sin((2 * activeSimulationTrial.variableA * Math.PI) / 180) * 100;
        const dragPenalty = activeSimulationTrial.variableB * 1.5;
        const finalDistance = Math.max(10, Math.round(optimalApex * 1.8 - dragPenalty));
        const efficiency = Math.min(99, Math.round((finalDistance / 180) * 100));

        outcome = {
          label: 'Race Velocity Optimization',
          primaryMetric: `${finalDistance} meters traveled`,
          efficiencyPercent: efficiency,
          bktProbability: Math.min(0.95, 0.65 + efficiency * 0.003),
          feedback: efficiency > 80
            ? 'Outstanding aerodynamic angle and stamina pacing! Kinematics trajectory matched ideal theoretical parabolic curve.'
            : 'Sub-optimal launch angle. Remember that in projectile physics under gravity, θ=45° yields maximum range in vacuum, but with air resistance drag, 40°–42° is optimal.',
        };
      } else if (selectedGameKey === 'angkor_adventure_hydraulics') {
        bktSkill = 'bernoulli_fluid_gradient';
        const flowDischarge = Math.round(activeSimulationTrial.variableA * 3.14 * (activeSimulationTrial.variableB / 10));
        const barayReplenishment = Math.min(100, Math.round((flowDischarge / 450) * 100));

        outcome = {
          label: 'West Baray Reservoir Inflow',
          primaryMetric: `${flowDischarge} m³/s discharge flow`,
          efficiencyPercent: barayReplenishment,
          bktProbability: 0.88,
          feedback: barayReplenishment >= 75
            ? 'Monsoon flood mitigated! The stone sluice gate gradient successfully dissipated kinetic turbulence while maintaining reservoir storage.'
            : 'Excess velocity causing embankment erosion! Check Bernoulli’s continuity equation: reduce inlet cross-sectional gradient.',
        };
      } else if (selectedGameKey === 'phnom_penh_smart_city') {
        bktSkill = 'urban_systems_resource_elasticity';
        const cleanGridPercent = activeSimulationTrial.variableA;
        const transitBudget = activeSimulationTrial.variableB * 2;
        const liveabilityIndex = Math.min(98, Math.round(cleanGridPercent * 0.6 + transitBudget * 0.8 + 25));

        outcome = {
          label: 'District Liveability & Carbon Index',
          primaryMetric: `Liveability Score: ${liveabilityIndex}/100`,
          efficiencyPercent: liveabilityIndex,
          bktProbability: 0.91,
          feedback: 'Balancing solar micro-grids with automated bus rapid transit (BRT) lowered municipal emissions by 34% while spurring private tech investments.',
        };
      } else {
        bktSkill = 'quantum_logic_gate_synthesis';
        const propagationDelay = Math.max(2, 48 - activeSimulationTrial.variableA);
        outcome = {
          label: 'Boolean 8-Bit ALU Circuit',
          primaryMetric: `${propagationDelay} ns propagation delay`,
          efficiencyPercent: 94,
          bktProbability: 0.94,
          feedback: 'NAND-gate logic optimization complete. Logic gates synthesized with zero hazard race conditions.',
        };
      }

      setActiveSimulationTrial((prev) => ({
        ...prev,
        running: false,
        resultMetrics: outcome,
      }));

      // Log to backend telemetry
      try {
        const res = await fetch('/api/digital-world/game-telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            gameKey: selectedGameKey,
            eventType: 'solution_optimized',
            bktInferredSkill: bktSkill,
            trialCount: 1,
            priorProbability: 0.72,
            posteriorProbability: outcome.bktProbability,
            gameStatePayload: {
              paramA: activeSimulationTrial.variableA,
              paramB: activeSimulationTrial.variableB,
              outcome,
            },
          }),
        });
        const logData = await res.json();
        if (logData.success && logData.data) {
          setTelemetryLogs((prev) => [logData.data, ...prev.slice(0, 4)]);
        }
      } catch (err) {
        console.error('Failed to dispatch telemetry', err);
      }
    }, 1200);
  };

  const zonesList = worldData?.zones || [];
  const currentZone = zonesList.find((z: any) => z.zoneKey === activeZoneKey) || zonesList[1];
  const gamesList = worldData?.games || [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Identity Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle Ambient Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>CDES Digital Campus World • Phase 12 Life Simulation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>CDES Digital Campus World</span>
              <span className="text-xs font-bold px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full">
                {worldData?.currentSeason || 'Season 2026: Bac II National Champions'}
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
              An educational life simulation universe where learning, science, and career exploration become a lived experience. Crafted with modern game fidelity—representing who you are becoming.
            </p>
          </div>

          {/* Quick World Stats Cards */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 px-4 py-3 rounded-2xl">
              <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>Active Scholars</span>
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                {worldData?.totalActiveLearners ? worldData.totalActiveLearners.toLocaleString() : '39,100'}
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 px-4 py-3 rounded-2xl">
              <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Scholar Currency</span>
              </div>
              <div className="text-lg font-black text-amber-300 mt-0.5 flex items-center gap-1">
                <span>1,450 Merit</span>
                <span className="text-xs text-indigo-300 font-normal">• 12 Crystals</span>
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 px-4 py-3 rounded-2xl">
              <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Environment</span>
              </div>
              <div className="text-xs font-bold text-slate-200 mt-1 capitalize">
                {lightingPreset.replace('_', ' ')} • {weatherState.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Global Navigation Hub Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          {[
            { id: 'world_map', label: '1. 7-Zone Campus World', icon: Compass },
            { id: 'simulation_games', label: '2. Educational Simulation Games', icon: Play },
            { id: 'companion_mith', label: '3. AI Companion "Mith"', icon: MessageSquare },
            { id: 'growth_identity', label: '4. Avatar & Identity Progression', icon: Trophy },
            { id: 'tech_architecture', label: '5. Technical & Unity Migration Plan', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeHubView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveHubView(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          VIEW 1: 7-ZONE DIGITAL CAMPUS WORLD MAP
      ========================================================= */}
      {activeHubView === 'world_map' && (
        <div className="space-y-6">
          {/* Environmental Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Atmosphere & Lighting:</span>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'golden_hour', label: 'Golden Hour', icon: Sun },
                  { id: 'tropical_noon', label: 'Tropical Noon', icon: Sun },
                  { id: 'twilight_glow', label: 'Monsoonal Twilight', icon: Wind },
                  { id: 'night_nebula', label: 'Starry Nebula', icon: Moon },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setLightingPreset(preset.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      lightingPreset === preset.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <preset.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weather Cycle:</span>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'tropical_breeze', label: 'Breeze', icon: Wind },
                  { id: 'sunny', label: 'Clear Sky', icon: Sun },
                  { id: 'monsoon_rain', label: 'Monsoon', icon: CloudRain },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWeatherState(w.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      weatherState === w.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <w.icon className="w-3.5 h-3.5" />
                    <span>{w.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Campus World Map Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Zone Selectors */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
                7 Architectural Campus Zones
              </div>
              {zonesList.map((z: any) => {
                const isSelected = activeZoneKey === z.zoneKey;
                const getZoneIcon = (key: string) => {
                  switch (key) {
                    case 'student_home': return Home;
                    case 'campus_plaza': return Compass;
                    case 'grand_library': return BookOpen;
                    case 'stem_laboratory': return FlaskConical;
                    case 'career_center': return Briefcase;
                    case 'innovation_workshop': return Wrench;
                    case 'community_commons': return Trees;
                    default: return Compass;
                  }
                };
                const Icon = getZoneIcon(z.zoneKey);

                return (
                  <div
                    key={z.zoneKey}
                    onClick={() => setActiveZoneKey(z.zoneKey)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/30'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span>{z.nameEn}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                            isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {z.nameKm}
                          </span>
                        </div>
                        <div className={`text-xs mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {z.tagline}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
                        isSelected ? 'bg-indigo-900/60 text-indigo-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {z.activeLearnersCount?.toLocaleString() || '4,200'} live
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Zone Visual Stage & Interactive Canvas Preview */}
            <div className="lg:col-span-7 space-y-6">
              {currentZone && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                  {/* Dynamic 3D / Isometric Viewport Simulation */}
                  <div className={`relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between p-6 ${
                    lightingPreset === 'night_nebula'
                      ? 'bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900'
                      : lightingPreset === 'twilight_glow'
                      ? 'bg-gradient-to-b from-indigo-950 via-purple-900 to-amber-950'
                      : lightingPreset === 'tropical_noon'
                      ? 'bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-100'
                      : 'bg-gradient-to-b from-amber-600 via-rose-800 to-indigo-950'
                  }`}>
                    {/* Simulated 3D Environment Horizon */}
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

                    {/* Zone Header in Viewport */}
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 text-white">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                          3D Spatial Render • {lightingPreset}
                        </span>
                        <div className="text-sm font-bold">{currentZone.nameEn}</div>
                      </div>

                      <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-bold text-slate-200">
                        <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span>60 FPS WebGL / WebGPU</span>
                      </div>
                    </div>

                    {/* Ground Plane Visual Indicators */}
                    <div className="relative z-10 grid grid-cols-3 gap-2">
                      {(currentZone.interactiveHotspots || []).map((spot: any) => (
                        <button
                          key={spot.id}
                          className="bg-slate-900/85 hover:bg-indigo-600 transition-all text-white p-2.5 rounded-xl border border-slate-700 text-left group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase text-indigo-300 group-hover:text-white">
                              Interactive Spot
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                          </div>
                          <div className="text-xs font-bold mt-1 text-white truncate">{spot.labelEn}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Zone Architectural Dossier */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        {currentZone.nameEn} ({currentZone.nameKm})
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                        {currentZone.description}
                      </p>
                    </div>

                    {/* Pedagogical Purpose & Style */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100">
                        <div className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
                          Pedagogical Anchor
                        </div>
                        <div className="text-xs text-indigo-950 font-semibold mt-1">
                          {currentZone.pedagogicalFocus}
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Architectural Language
                        </div>
                        <div className="text-xs text-slate-800 font-semibold mt-1">
                          {currentZone.visualTheme?.architecturalStyle}
                        </div>
                      </div>
                    </div>

                    {/* Zone NPC Guide Dialog */}
                    {currentZone.keyNPC && (
                      <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-start space-x-3.5">
                        <img
                          src={currentZone.keyNPC.avatarUrl}
                          alt={currentZone.keyNPC.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-amber-300"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-slate-900">{currentZone.keyNPC.name}</span>
                            <span className="text-[11px] px-2 py-0.5 bg-amber-200/60 text-amber-900 rounded-md font-semibold">
                              {currentZone.keyNPC.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 italic mt-1 leading-relaxed">
                            "{currentZone.keyNPC.greetingEn}"
                          </p>
                          <p className="text-xs text-slate-600 font-khmer mt-0.5">
                            "{currentZone.keyNPC.greetingKm}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 2: EDUCATIONAL SIMULATION GAMES ARCHITECTURE & TRIAL
      ========================================================= */}
      {activeHubView === 'simulation_games' && (
        <div className="space-y-6">
          {/* Game Selector Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {gamesList.map((game: any) => {
              const isSelected = selectedGameKey === game.gameKey;
              return (
                <div
                  key={game.gameKey}
                  onClick={() => {
                    setSelectedGameKey(game.gameKey);
                    setActiveSimulationTrial({
                      running: false,
                      variableA: 45,
                      variableB: 12,
                      resultMetrics: null,
                    });
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/30'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {game.genre.split('&')[0]}
                      </span>
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {game.currentHighLevelMetrics?.avgMasteryLiftPercent}% Lift
                      </span>
                    </div>
                    <h4 className="font-bold text-sm">{game.titleEn}</h4>
                    <p className={`text-xs mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {game.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/20 text-xs font-semibold flex items-center justify-between">
                    <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>
                      {game.estimatedSessionMin} min loop
                    </span>
                    <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      <span>Launch Sandbox</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Game Deep Dive & Interactive Simulation Terminal */}
          {(() => {
            const currentGame = gamesList.find((g: any) => g.gameKey === selectedGameKey) || gamesList[0];
            if (!currentGame) return null;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Dossier */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      Pedagogical Game Specification
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">
                      {currentGame.titleEn}
                    </h3>
                    <p className="text-xs font-khmer text-slate-600 mt-0.5">
                      {currentGame.titleKm}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="font-bold text-slate-800">Learning Objective & Core Principle:</div>
                    <p className="text-slate-600 leading-relaxed">
                      {currentGame.learningObjective}
                    </p>
                  </div>

                  {/* STEM Competencies */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Connected MoEYS & BKT Competencies
                    </div>
                    <div className="space-y-1.5">
                      {(currentGame.stemCompetencies || []).map((comp: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center space-x-2 text-xs text-slate-700 bg-indigo-50/60 px-3 py-1.5 rounded-xl border border-indigo-100"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{comp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs">
                    <span className="font-bold text-amber-900">Game Design Heritage: </span>
                    <span className="text-amber-800">{currentGame.inspiration}</span>
                  </div>
                </div>

                {/* Right Interactive Mechanics Experimentation Terminal */}
                <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-6 text-white shadow-xl flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center space-x-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Simulation Parameter Sandbox
                        </span>
                      </div>
                      <span className="text-xs font-mono text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-800">
                        Target Engine: Three.js / WebGPU
                      </span>
                    </div>

                    {/* Interactive Sliders based on selected game */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                          <span>
                            {selectedGameKey === 'animal_racing_physics'
                              ? 'Launch Angle (θ)'
                              : selectedGameKey === 'angkor_adventure_hydraulics'
                              ? 'Canal Elevation Gradient (%)'
                              : 'Renewable Solar/Hydro Mix (%)'}
                          </span>
                          <span className="text-indigo-400 font-mono text-sm font-black">
                            {activeSimulationTrial.variableA}
                            {selectedGameKey === 'animal_racing_physics' ? '°' : '%'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={activeSimulationTrial.variableA}
                          onChange={(e) =>
                            setActiveSimulationTrial({
                              ...activeSimulationTrial,
                              variableA: Number(e.target.value),
                            })
                          }
                          className="w-full mt-3 accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                          <span>
                            {selectedGameKey === 'animal_racing_physics'
                              ? 'Drag Coefficient (Cd)'
                              : selectedGameKey === 'angkor_adventure_hydraulics'
                              ? 'Sluice Aperture Width (m)'
                              : 'Public Transit Infrastructure Budget'}
                          </span>
                          <span className="text-emerald-400 font-mono text-sm font-black">
                            {activeSimulationTrial.variableB}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="40"
                          value={activeSimulationTrial.variableB}
                          onChange={(e) =>
                            setActiveSimulationTrial({
                              ...activeSimulationTrial,
                              variableB: Number(e.target.value),
                            })
                          }
                          className="w-full mt-3 accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Simulation Run Button */}
                    <div className="mt-5">
                      <button
                        onClick={handleRunSimulation}
                        disabled={activeSimulationTrial.running}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                      >
                        {activeSimulationTrial.running ? (
                          <>
                            <RotateCcw className="w-4 h-4 animate-spin" />
                            <span>Computing Differential Equation Physics...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-white" />
                            <span>Execute Simulation & Transmit Telemetry</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Result Output Display */}
                    {activeSimulationTrial.resultMetrics && (
                      <div className="mt-5 p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-amber-400">
                            {activeSimulationTrial.resultMetrics.label}
                          </span>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-800">
                            BKT Mastery: {(activeSimulationTrial.resultMetrics.bktProbability * 100).toFixed(1)}%
                          </span>
                        </div>

                        <div className="text-lg font-black text-white">
                          {activeSimulationTrial.resultMetrics.primaryMetric}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {activeSimulationTrial.resultMetrics.feedback}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Telemetry Log Stream */}
                  {telemetryLogs.length > 0 && (
                    <div className="pt-4 border-t border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
                      <div className="text-slate-500 uppercase tracking-wider font-bold">
                        Latest Telemetry to Student Intelligence Platform:
                      </div>
                      {telemetryLogs.map((log) => (
                        <div key={log.id} className="text-emerald-400/90 truncate">
                          [{new Date(log.recordedAt).toLocaleTimeString()}] Event: {log.eventType} • Skill: {log.bktInferredSkill} • Posterior P(L): {log.posteriorProbability}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* =========================================================
          VIEW 3: AI COMPANION "MITH" (មិត្ត) SOCRATIC LIFE GUIDE
      ========================================================= */}
      {activeHubView === 'companion_mith' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Companion Persona & Mood Status */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-400 to-amber-300 p-1 shadow-lg mx-auto">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                    <Sparkles className="w-10 h-10 text-amber-300 animate-pulse" />
                  </div>
                </div>
                <span className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white" />
              </div>

              <h3 className="text-xl font-black text-slate-900 mt-3">
                Mith (មិត្ត)
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Socratic Education Companion & Life Guide
              </p>
            </div>

            {/* Affinity Meter */}
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                <span>Affinity & Bond Level</span>
                <span className="text-indigo-700">Level 4 ({mithAffinity}/1000 XP)</span>
              </div>
              <div className="w-full bg-indigo-200/60 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(mithAffinity / 1000) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-indigo-800 mt-1 leading-normal">
                Higher affinity unlocks personalized scholarship deadlines, voice synthesis tonality, and emotional resilience checks.
              </p>
            </div>

            {/* Core Capabilities */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Companion Capabilities
              </div>
              {[
                { title: '1. Socratic Guidance', desc: 'Never gives away direct answers; prompts first-principles thinking.' },
                { title: '2. Deep Explanation', desc: 'Bridges abstract formulas into Khmer cultural & real-world analogies.' },
                { title: '3. Strategic Recommendation', desc: 'Points student to specific lab games or university scholarship portals.' },
                { title: '4. Emotional Motivation', desc: 'Mitigates exam burnout and encourages growth mindset reframing.' },
              ].map((cap, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800">{cap.title}</div>
                  <div className="text-slate-600 mt-0.5">{cap.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Live Socratic Dialogue Console */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-bold text-sm text-slate-800">
                  Live Neural Conversation with Mith
                </span>
              </div>
              <span className="text-xs font-medium text-slate-500">
                Grounding: CDES Knowledge Corpus
              </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {companionMessages.map((msg) => {
                const isMith = msg.speaker === 'mith';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-3 ${isMith ? 'justify-start' : 'justify-end'}`}
                  >
                    {isMith && (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                        M
                      </div>
                    )}
                    <div
                      className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMith
                          ? 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                          : 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className={`block text-[10px] mt-1.5 ${isMith ? 'text-slate-400' : 'text-indigo-200'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isMithTyping && (
                <div className="flex items-center space-x-2 text-slate-400 text-xs italic">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200" />
                  <span>Mith is formulating a Socratic question...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMith} className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
              <input
                type="text"
                value={companionInput}
                onChange={(e) => setCompanionInput(e.target.value)}
                placeholder="Ask Mith about Bac II physics, feeling stressed, or CADT scholarships..."
                className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-50 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="submit"
                disabled={!companionInput.trim() || isMithTyping}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 4: AVATAR & IDENTITY PROGRESSION SYSTEM
      ========================================================= */}
      {activeHubView === 'growth_identity' && (
        <div className="space-y-6">
          {/* 5 Growth Stages Pipeline */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Identity Evolution Spectrum
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                "This Represents Who I Am Becoming"
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm">
                Avatar progression in CDES is not cosmetic vanity—it is a visual mirror of empirical learning milestones, resilience under failure, and civic contribution to the Cambodian digital society.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              {[
                { stage: '1. Novice Scholar', level: 'Level 1–5', desc: 'Baseline curiosity, initial diagnostic quiz passed, study sanctuary unlocked.' },
                { stage: '2. Curious Explorer', level: 'Level 6–15', desc: 'Visited all 7 campus zones, tested 10 simulation hypotheses in STEM Lab.' },
                { stage: '3. STEM Apprentice', level: 'Level 16–30', desc: 'Mastered Grade 11 Bac II physics kinematics & genetic trait inheritance.' },
                { stage: '4. Innovation Fellow', level: 'Level 31–50', desc: 'Constructed working smart-city model; peer-reviewed 5 student research drafts.' },
                { stage: '5. Society Architect', level: 'Level 50+', desc: 'National scholarship awardee; mentor to 50+ junior students across Cambodia.' },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border text-xs flex flex-col justify-between ${
                    i === 2
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/40'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        i === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {s.level}
                      </span>
                      {i === 2 && <span className="text-[10px] text-amber-400 font-bold">Current</span>}
                    </div>
                    <div className="font-bold text-sm">{s.stage}</div>
                    <p className={`mt-2 text-[11px] leading-relaxed ${i === 2 ? 'text-slate-300' : 'text-slate-500'}`}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Constellations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Empirical STEM & Physics',
                progress: 74,
                points: '740 / 1000',
                color: 'bg-indigo-600',
                desc: 'Mechanics, calculus limits, circuit logic & fluid dynamics in Angkor Baray simulation.',
              },
              {
                title: 'Algorithmic Systems Thinking',
                progress: 68,
                points: '680 / 1000',
                color: 'bg-sky-600',
                desc: 'Systems dynamics, microeconomics tradeoffs, and smart-city grid balancing.',
              },
              {
                title: 'Grit & Failure Resilience',
                progress: 88,
                points: '880 / 1000',
                color: 'bg-emerald-600',
                desc: 'Measured by trial recovery time and re-attempting difficult Bac II math problems.',
              },
              {
                title: 'Civic & Peer Leadership',
                progress: 55,
                points: '550 / 1000',
                color: 'bg-amber-600',
                desc: 'Study group facilitation, community forum upvotes, and knowledge feedback reviews.',
              },
            ].map((skill, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{skill.title}</h4>
                  <span className="text-xs font-black text-slate-700">{skill.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`${skill.color} h-full rounded-full`} style={{ width: `${skill.progress}%` }} />
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  {skill.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 5: TECHNICAL ARCHITECTURE & UNITY / UNREAL MIGRATION
      ========================================================= */}
      {activeHubView === 'tech_architecture' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Full Technical Blueprint
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                4-Stage Development Roadmap & Engine Migration Plan
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                How CDES scales from WebGL/React into a AAA-grade multi-platform digital education world across Web, Android, iOS, and PC.
              </p>
            </div>

            {/* 4 Version Roadmap */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  version: 'Version 1 (Current)',
                  title: 'Avatar Room & Small Campus',
                  tech: 'Three.js / React 18 / Vite / WebGL',
                  scope: 'Personal study sanctuary, 7 zone previews, basic 2D/3D physics sandbox, and Socratic AI Companion text chat.',
                  status: 'Operational in Production',
                },
                {
                  version: 'Version 2 (Horizon 1)',
                  title: 'Full 3D Campus World',
                  tech: 'WebGPU / Babylon.js / glTF PBR',
                  scope: 'Fully walk-able 3D stylized campus, avatar movement with collision mesh, Angkor Adventure 3D water shaders, and spatial audio.',
                  status: 'Q3–Q4 2026',
                },
                {
                  version: 'Version 3 (Horizon 2)',
                  title: 'Multiplayer Social Ecosystem',
                  tech: 'Unity WebGL / Colyseus WebSocket State Sync',
                  scope: 'Real-time multiplayer peer study circles, synchronized animal racing lobbies, avatar emoticons, and student guild housing.',
                  status: '2027',
                },
                {
                  version: 'Version 4 (Horizon 3)',
                  title: 'Digital Education Society (National)',
                  tech: 'Unreal Engine 5 Pixel Streaming & Native Mobile (iOS/Android)',
                  scope: 'Photorealistic stylized Angkorian universe, VR headset support, national Bac II tournament stadiums, and university metaverse campuses.',
                  status: '2028',
                },
              ].map((ver, i) => (
                <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {ver.version}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{ver.status}</span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">{ver.title}</div>
                    <div className="text-[11px] font-mono text-slate-600 mt-1">{ver.tech}</div>
                    <p className="text-slate-600 mt-2.5 leading-relaxed">
                      {ver.scope}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Unity / Unreal Migration Architecture Plan */}
            <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-4">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Future Engine Migration Architecture: Unity & Unreal Engine
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                  <div className="font-bold text-amber-400">Unity WebGL & Native Mobile Pipeline</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    <li>Asset Pipeline: glTF 2.0 with Universal Render Pipeline (URP) for lightweight Android devices in rural Cambodia (sub-2GB RAM).</li>
                    <li>State Bridge: JSON-RPC over WebSocket connecting Unity C# scripts to the CDES Express/SQLite backend.</li>
                    <li>Game Logic: Deterministic physics calculations for Animal Racing and Angkor Hydraulics executed client-side with server-side validation.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                  <div className="font-bold text-sky-400">Unreal Engine 5 Pixel Streaming (High-End PC/VR)</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    <li>Cloud Deployment: UE5 Linux containerized on AWS G5/G6 GPU instances with WebRTC signaling server.</li>
                    <li>Immersion: Lumen global illumination and Nanite geometry recreating ancient Angkor Wat and Phnom Penh 2035 at 4K resolution.</li>
                    <li>Zero Client Footprint: Students stream via standard mobile browser without needing heavy game installation.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
