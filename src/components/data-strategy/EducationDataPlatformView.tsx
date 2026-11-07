import React, { useState, useEffect } from 'react';
import {
  Database,
  Server,
  Layers,
  Sparkles,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Search,
  BookOpen,
  Award,
  Briefcase,
  Building2,
  TrendingUp,
  Brain,
  Compass,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Download,
  Play,
  Terminal,
  ChevronRight,
  BarChart3,
  GitBranch,
  Eye,
  Sliders,
  Flame,
  Binary,
  Microscope,
  Zap,
} from 'lucide-react';

type DataViewTab =
  | 'overview'
  | 'architecture'
  | 'knowledge-lake'
  | 'student-intelligence'
  | 'collection-pipeline'
  | 'improvement-flywheel'
  | 'governance'
  | 'ml-engine';

export const EducationDataPlatformView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DataViewTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Data states from APIs
  const [architectureData, setArchitectureData] = useState<any>(null);
  const [knowledgeData, setKnowledgeData] = useState<any>(null);
  const [studentDossier, setStudentDossier] = useState<any>(null);
  const [collectionMatrix, setCollectionMatrix] = useState<any>(null);
  const [pipelineStatus, setPipelineStatus] = useState<any>(null);
  const [flywheelData, setFlywheelData] = useState<any>(null);
  const [governanceData, setGovernanceData] = useState<any>(null);
  const [mlRegistry, setMlRegistry] = useState<any>(null);

  // Knowledge lake active category
  const [knowledgeCategory, setKnowledgeCategory] = useState<'universities' | 'scholarships' | 'careers' | 'industries' | 'psychometrics' | 'learning_science'>('universities');
  const [searchQuery, setSearchQuery] = useState('');

  // Pipeline Live Test state
  const [testInputText, setTestInputText] = useState('I am preparing for CADT entrance exam in Calculus and seeking Techo Digital Talent scholarship.');
  const [pipelineTestResult, setPipelineTestResult] = useState<any>(null);
  const [pipelineTesting, setPipelineTesting] = useState(false);

  // ML Inference Interactive states
  const [mockMath, setMockMath] = useState(96);
  const [mockPhysics, setMockPhysics] = useState(94);
  const [mockKhmer, setMockKhmer] = useState(88);
  const [mockChemistry, setMockChemistry] = useState(90);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [predicting, setPredicting] = useState(false);

  // University recommendation state
  const [univRecs, setUnivRecs] = useState<any>(null);
  const [careerGapResult, setCareerGapResult] = useState<any>(null);

  // Export state
  const [exportedJson, setExportedJson] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetch('/api/data-platform/overview').then((r) => r.json()).catch(() => null),
      fetch('/api/data-platform/knowledge-hub').then((r) => r.json()).catch(() => null),
      fetch('/api/data-platform/student-dossier/usr-student-01').then((r) => r.json()).catch(() => null),
      fetch('/api/data-platform/collection-matrix').then((r) => r.json()).catch(() => null),
      fetch('/api/data-platform/ai-pipeline/status').then((r) => r.json()).catch(() => null),
      fetch('/api/data-platform/improvement-flywheel').then((r) => r.json()).catch(() => null),
      fetch('/api/data-platform/governance/usr-student-01').then((r) => r.json()).catch(() => null),
      fetch('/api/data-platform/ml/registry').then((r) => r.json()).catch(() => null),
    ])
      .then(([arch, know, stu, coll, pipe, fly, gov, ml]) => {
        if (!isMounted) return;
        if (arch?.data) setArchitectureData(arch.data);
        if (know?.data) setKnowledgeData(know.data);
        if (stu?.data) setStudentDossier(stu.data);
        if (coll?.data) setCollectionMatrix(coll.data);
        if (pipe?.data) setPipelineStatus(pipe.data);
        if (fly?.data) setFlywheelData(fly.data);
        if (gov?.data) setGovernanceData(gov.data);
        if (ml?.data) setMlRegistry(ml.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load data platform:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // Handle live pipeline test
  const handleRunPipelineTest = async () => {
    setPipelineTesting(true);
    try {
      const res = await fetch('/api/data-platform/ai-pipeline/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testInputText,
          student_id: 'usr-student-01',
          category: 'diagnostic_query',
        }),
      });
      const data = await res.json();
      setPipelineTestResult(data?.data || null);
    } catch (e) {
      console.error('Pipeline test error:', e);
    } finally {
      setPipelineTesting(false);
    }
  };

  // Handle Bac II prediction
  const handlePredictBacII = async () => {
    setPredicting(true);
    try {
      const res = await fetch('/api/data-platform/ml/predict-bac2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: 'usr-student-01',
          mock_scores: {
            math: mockMath,
            physics: mockPhysics,
            khmer: mockKhmer,
            chemistry: mockChemistry,
          },
        }),
      });
      const data = await res.json();
      setPredictionResult(data?.data || null);
    } catch (e) {
      console.error('Prediction error:', e);
    } finally {
      setPredicting(false);
    }
  };

  // Handle University recommendation query
  const handleGetUniversityRecs = async () => {
    try {
      const res = await fetch('/api/data-platform/ml/recommend-university', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: 'usr-student-01' }),
      });
      const data = await res.json();
      setUnivRecs(data?.data || null);
    } catch (e) {
      console.error('University rec error:', e);
    }
  };

  // Handle Career gap analysis query
  const handleGetCareerGap = async () => {
    try {
      const res = await fetch('/api/data-platform/ml/career-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: 'usr-student-01', career_id: 'car-lake-ai-systems' }),
      });
      const data = await res.json();
      setCareerGapResult(data?.data || null);
    } catch (e) {
      console.error('Career gap error:', e);
    }
  };

  // Handle Sovereign Data Export
  const handleExportData = async () => {
    try {
      const res = await fetch('/api/data-platform/governance/export/usr-student-01');
      const data = await res.json();
      setExportedJson(JSON.stringify(data?.data || {}, null, 2));
    } catch (e) {
      console.error('Export error:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border-b border-indigo-900/40 px-4 sm:px-6 lg:px-8 py-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Phase 14 • Enterprise Data Strategy
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Operational EIDP
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Database className="w-8 h-8 text-indigo-400" />
              Education Intelligence Data Platform
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Transforming Cambodia education telemetry into predictive, personalized decision intelligence for students, universities, scholarships, and labor market mobility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-900/50 hover:bg-indigo-800 text-slate-200 text-xs font-semibold border border-indigo-700/50 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Lakehouse</span>
            </button>
            <button
              onClick={() => setActiveTab('ml-engine')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Launch ML Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto no-scrollbar py-2">
          {[
            { id: 'overview', label: 'CDO Strategy Blueprint', icon: Layers },
            { id: 'architecture', label: '1. Architecture & Storage', icon: Server },
            { id: 'knowledge-lake', label: '2. Education Knowledge', icon: BookOpen },
            { id: 'student-intelligence', label: '3. Student Intelligence', icon: Brain },
            { id: 'collection-pipeline', label: '4 & 5. Pipeline & Ingest', icon: Binary },
            { id: 'improvement-flywheel', label: '6. AI Flywheel Loop', icon: GitBranch },
            { id: 'governance', label: '7. Sovereign Governance', icon: ShieldCheck },
            { id: 'ml-engine', label: '8 & 9. ML Models & Inference', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DataViewTab)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ==================================================== */}
        {/* TAB 0: EXECUTIVE CDO STRATEGY BLUEPRINT */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Core Mission Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white shadow-md border border-indigo-800">
              <div className="max-w-4xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Chief Data Officer Directive
                  </span>
                  <span className="text-xs text-indigo-200 font-mono">VISION STATEMENT</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  "The goal is not collecting data. The goal is transforming education data into intelligence that improves student outcomes."
                </h2>
                <p className="text-sm text-indigo-100 leading-relaxed">
                  CDES competitive moat is not a generic language model wrapper. It is the proprietary Cambodia Education Knowledge Lake, the 7-pillar longitudinal Student Intelligence model, the dual-tier online feature store, and our closed-loop attribution feedback flywheel.
                </p>
              </div>

              {/* High-Level Architecture Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-800/60">
                <div className="bg-indigo-950/60 p-4 rounded-xl border border-indigo-800/40">
                  <div className="text-2xl font-black text-white">6 Lakes</div>
                  <div className="text-xs text-indigo-200 mt-0.5 font-medium">Univ, Sch, Car, Ind, Psy, Science</div>
                </div>
                <div className="bg-indigo-950/60 p-4 rounded-xl border border-indigo-800/40">
                  <div className="text-2xl font-black text-emerald-400">7 Pillars</div>
                  <div className="text-xs text-indigo-200 mt-0.5 font-medium">Student Intelligence Model</div>
                </div>
                <div className="bg-indigo-950/60 p-4 rounded-xl border border-indigo-800/40">
                  <div className="text-2xl font-black text-amber-300">&lt; 5ms</div>
                  <div className="text-xs text-indigo-200 mt-0.5 font-medium">Online Feature Store Latency</div>
                </div>
                <div className="bg-indigo-950/60 p-4 rounded-xl border border-indigo-800/40">
                  <div className="text-2xl font-black text-cyan-300">Triple-Lock</div>
                  <div className="text-xs text-indigo-200 mt-0.5 font-medium">Sovereign Consent & Privacy</div>
                </div>
              </div>
            </div>

            {/* 7-Step Implementation Flow Diagram */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    CDES Closed-Loop Intelligence Flywheel
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Continuous feedback loop powering personalized AI advising and algorithmic model refinement.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Self-Optimizing Architecture
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  { step: '1. Ingest & Profile', desc: 'Real-time telemetry, ZPD diagnostics, and psychometric assessments.', color: 'border-blue-500 bg-blue-50/50' },
                  { step: '2. Dual Feature Store', desc: 'Hydrates real-time mastery vectors and longitudinal Parquet features.', color: 'border-indigo-500 bg-indigo-50/50' },
                  { step: '3. Next-Best-Action', desc: 'Contextual bandit matches university, scholarship, or spaced drill.', color: 'border-purple-500 bg-purple-50/50' },
                  { step: '4. Outcome Capture', desc: 'Measures Bac II mock deltas, concept completion, and application admissions.', color: 'border-emerald-500 bg-emerald-50/50' },
                  { step: '5. Attribution Retrain', desc: 'Causal attribution feeds back to tune recommendation policy weights.', color: 'border-amber-500 bg-amber-50/50' },
                ].map((s, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border-l-4 ${s.color} space-y-1.5`}>
                    <div className="text-xs font-bold text-slate-800">{s.step}</div>
                    <div className="text-xs text-slate-600 leading-relaxed">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div
                onClick={() => setActiveTab('architecture')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Task 1: Enterprise Data Architecture</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Operational OLTP, Parquet Columnar Lakehouse, HNSW Dense/Sparse Vector DB, and Dual-Tier Online/Offline Feature Store.
                </p>
                <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                  <span>Explore Storage Tiers</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('knowledge-lake')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Task 2: Education Knowledge Lake</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Verified databases for Cambodian Universities, Scholarships, O*NET-aligned Careers, Key Industries, Psychometrics, and Learning Science.
                </p>
                <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                  <span>Explore 6 Knowledge Repositories</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('student-intelligence')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Brain className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Task 3: Student Intelligence Model</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The 7 Pillars of student profile: Identity, Goals, Interests, Behavioral Telemetry, Chronotype Patterns, Achievements, and Applied Projects.
                </p>
                <div className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                  <span>View Dara Chan's Intelligence Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 1: DATA ARCHITECTURE & STORAGE TIERS */}
        {/* ==================================================== */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">CDES 5-Tier Data Architecture Specification</h3>
                  <p className="text-xs text-slate-500">
                    Dual-optimized for sub-5ms interactive AI advising and massive longitudinal learning science research.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    100% In-Region / Sovereign
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(architectureData?.architecture_tiers || []).map((tier: any) => (
                  <div key={tier.tier_key} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">{tier.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {tier.health_status}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-600 bg-white p-2 rounded border border-slate-100">
                      Tech: {tier.technology}
                    </div>
                    <p className="text-xs text-slate-600">{tier.purpose}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-400 block">P99 Latency</span>
                        <span className="font-bold text-slate-800">{tier.p99_latency}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Security Guard</span>
                        <span className="font-semibold text-slate-700 text-[11px] truncate block">{tier.security}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Store Deep Dive */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Enterprise Feature Store: Online vs. Offline Parquet Dual-Tier
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
                <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-2">
                  <div className="font-bold text-indigo-900 text-sm flex items-center justify-between">
                    <span>Online Feature Store (&lt; 5ms)</span>
                    <span className="text-xs font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Redis / SQLite WAL</span>
                  </div>
                  <p>Powers real-time inference during live student tutoring sessions.</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li><strong className="text-indigo-950">Current Mastery Vector:</strong> Real-time Bayesian Knowledge Tracing scores across 18 STEM concepts.</li>
                    <li><strong className="text-indigo-950">Session Cognitive Load:</strong> Inferred from hesitation latency and dwell time anomalies.</li>
                    <li><strong className="text-indigo-950">Active Goal Urgency:</strong> Days remaining until Bac II or scholarship application deadline.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 space-y-2">
                  <div className="font-bold text-blue-900 text-sm flex items-center justify-between">
                    <span>Offline Feature Store (Parquet Lakehouse)</span>
                    <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">DuckDB / Cloud Lakehouse</span>
                  </div>
                  <p>Powers point-in-time correct batch machine learning model training without data leakage.</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li><strong className="text-blue-950">Longitudinal Growth Velocity:</strong> 180-day trajectory of problem-solving speed vs error rate.</li>
                    <li><strong className="text-blue-950">Ebbinghaus Memory Half-Life:</strong> Calibrated retention decay curve per student chronotype.</li>
                    <li><strong className="text-blue-950">Cohort Equity Percentiles:</strong> Provincial vs national achievement percentiles for MoEYS policy.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: EDUCATION KNOWLEDGE DATABASE */}
        {/* ==================================================== */}
        {activeTab === 'knowledge-lake' && (
          <div className="space-y-6">
            {/* Knowledge Category Switcher */}
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'universities', label: '1. Universities Lake', icon: Building2 },
                { id: 'scholarships', label: '2. Scholarships Lake', icon: Award },
                { id: 'careers', label: '3. Careers Lake', icon: Briefcase },
                { id: 'industries', label: '4. Industries Lake', icon: TrendingUp },
                { id: 'psychometrics', label: '5. Psychometrics Lake', icon: Brain },
                { id: 'learning_science', label: '6. Learning Science Lake', icon: Microscope },
              ].map((c) => {
                const Icon = c.icon;
                const active = knowledgeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setKnowledgeCategory(c.id as any)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Universities Lake View */}
            {knowledgeCategory === 'universities' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(knowledgeData?.universities || []).map((u: any) => (
                  <div key={u.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {u.abbr} • Est. {u.established_year}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1.5">{u.name_en}</h4>
                        <div className="text-xs text-slate-500 font-khmer">{u.name_km}</div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        {u.avg_employment_rate}% Emp.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 text-slate-600">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Tuition / Year</span>
                        <span className="font-bold text-slate-800">${u.tuition_usd_annual} USD</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Faculty Ratio</span>
                        <span className="font-semibold text-slate-700">{u.faculty_ratio}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Bac II Minimum</span>
                        <span className="font-semibold text-slate-700">{u.bac_ii_min_grade}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Type</span>
                        <span className="font-semibold text-slate-700">{u.institution_type}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Top Priority Sectors</span>
                      <div className="flex flex-wrap gap-1">
                        {(u.top_sectors || []).map((sec: string, idx: number) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Scholarships Lake View */}
            {knowledgeCategory === 'scholarships' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(knowledgeData?.scholarships || []).map((s: any) => (
                  <div key={s.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {s.code} • {s.coverage_percentage}% Coverage
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1.5">{s.title}</h4>
                        <div className="text-xs text-slate-500">{s.provider}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-blue-600 block">${s.stipend_monthly_usd}/mo</span>
                        <span className="text-[10px] text-slate-400">Stipend</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {s.coverage_details}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs py-1 border-t border-slate-100 text-slate-600">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Annual Quota</span>
                        <span className="font-bold text-slate-800">{s.annual_recipient_quota} Recipients</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Deadline</span>
                        <span className="font-semibold text-rose-600">{s.deadline}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Priority Fields</span>
                      <div className="flex flex-wrap gap-1">
                        {(s.priority_fields || []).map((f: string, idx: number) => (
                          <span key={idx} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Careers Lake View */}
            {knowledgeCategory === 'careers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(knowledgeData?.careers || []).map((c: any) => (
                  <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          SOC: {c.soc_code}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{c.title_en}</h4>
                        <div className="text-xs text-slate-500 font-khmer">{c.title_km}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-600 block">${c.median_salary_usd}/mo</span>
                        <span className="text-[10px] text-slate-400">Median Salary</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs py-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Entry Salary</span>
                        <span className="font-semibold text-slate-700">${c.entry_salary_usd}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Senior Salary</span>
                        <span className="font-semibold text-slate-700">${c.senior_salary_usd}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">5Yr Growth</span>
                        <span className="font-bold text-emerald-600">+{c.projected_growth_5yr}%</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Top In-Demand Competencies</span>
                      <div className="flex flex-wrap gap-1">
                        {(c.top_skills || []).map((skill: string, idx: number) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Industries Lake View */}
            {knowledgeCategory === 'industries' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(knowledgeData?.industries || []).map((i: any) => (
                  <div key={i.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {i.sector_code} • {i.gdp_contribution_pct}% GDP
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{i.name_en}</h4>
                        <div className="text-xs text-slate-500 font-khmer">{i.name_km}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-indigo-600 block">{i.total_formal_workforce.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">Formal Jobs</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <strong>Drivers:</strong> {i.key_growth_drivers}
                    </p>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Flagship Employers</span>
                      <div className="flex flex-wrap gap-1">
                        {(i.top_employers || []).map((emp: string, idx: number) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {emp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Psychometrics Lake View */}
            {knowledgeCategory === 'psychometrics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(knowledgeData?.psychometrics || []).map((p: any) => (
                  <div key={p.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        {p.instrument_code}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        Scale: {p.scale_range_min} - {p.scale_range_max}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{p.dimension_label}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                    <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                      <div><strong>Pedagogical Strategy:</strong> {p.pedagogical_strategy}</div>
                      <div><strong>Educational Application:</strong> {p.educational_application}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Learning Science Lake View */}
            {knowledgeCategory === 'learning_science' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(knowledgeData?.learning_science || []).map((l: any) => (
                  <div key={l.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {l.framework_name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Load: {l.cognitive_load_type}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{l.level_or_phase}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{l.definition}</p>
                    <div className="space-y-1.5 text-xs">
                      <div className="text-slate-700"><strong>Action Verbs:</strong> {(l.action_verbs || []).join(', ')}</div>
                      <div className="text-slate-700"><strong>Scaffolding Techniques:</strong> {(l.scaffolding_techniques || []).join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: STUDENT INTELLIGENCE DATABASE (7 PILLARS) */}
        {/* ==================================================== */}
        {activeTab === 'student-intelligence' && (
          <div className="space-y-6">
            {/* Student Header Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  DC
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">Dara Chan</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {studentDossier?.pillars?.identity?.sovereign_pseudonym || 'CDES-KH-STU-88219'}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Consented (Triple-Lock)
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {studentDossier?.pillars?.identity?.academic_grade} • {studentDossier?.pillars?.identity?.institution_name} • {studentDossier?.pillars?.identity?.province_origin}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Intelligence Readiness</div>
                  <div className="text-lg font-black text-indigo-700">95.8%</div>
                </div>
                <button
                  onClick={handleExportData}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Sovereign Dossier</span>
                </button>
              </div>
            </div>

            {/* 7 Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pillar 2: Academic Goals */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    Pillar 2: Explicit Academic Goals
                  </span>
                  <span className="text-xs font-normal text-slate-400">4 Active</span>
                </h4>
                <div className="space-y-2">
                  {(studentDossier?.pillars?.goals || []).map((g: any) => (
                    <div key={g.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{g.target_title}</span>
                        <span className="font-semibold text-indigo-600">{g.progress_pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${g.progress_pct}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-500 flex justify-between pt-0.5">
                        <span>Target: {g.target_deadline}</span>
                        <span className="uppercase text-amber-700 font-semibold">{g.priority_level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pillar 3: Interest Vectors */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Pillar 3: Interest Vectors (Explicit vs Inferred)
                  </span>
                  <span className="text-xs font-normal text-slate-400">Composite Score</span>
                </h4>
                <div className="space-y-2">
                  {(studentDossier?.pillars?.interests || []).map((iv: any) => (
                    <div key={iv.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-800">{iv.domain_key}</div>
                        <div className="text-[10px] text-slate-500">
                          Explicit: {(iv.explicit_weight * 100).toFixed(0)}% • Inferred: {(iv.inferred_weight * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-indigo-700 text-sm">{(iv.composite_score * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pillar 4 & 5: Behavior & Learning Patterns */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    Pillars 4 & 5: Behavior & Chronotype Pattern
                  </span>
                  <span className="text-xs font-semibold text-emerald-600">Streak: 21 Days</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 block font-bold">Chronotype Peak</span>
                    <span className="font-bold text-slate-800 text-xs">Morning (06:00 - 10:30)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 block font-bold">Stamina Half-Life</span>
                    <span className="font-bold text-slate-800 text-xs">55 Minutes</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 block font-bold">Error Recovery Velocity</span>
                    <span className="font-bold text-slate-800 text-xs">0.89 (High Resilience)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 block font-bold">Preferred Modality</span>
                    <span className="font-bold text-slate-800 text-xs">Mathematical Proofs</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Recent Behavioral Telemetry</span>
                  {(studentDossier?.pillars?.behavior || []).map((b: any) => (
                    <div key={b.id} className="text-[11px] text-slate-600 py-1 flex justify-between border-b border-slate-50 last:border-0">
                      <span>Concept: {b.concept_id}</span>
                      <span>Dwell: {Math.round(b.dwell_time_sec / 60)}m • Score: {(b.persistence_score * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pillar 6 & 7: Achievements & Projects */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    Pillars 6 & 7: Achievements & Applied Projects
                  </span>
                  <span className="text-xs font-semibold text-purple-600">Verified Artifacts</span>
                </h4>
                <div className="space-y-2">
                  {(studentDossier?.pillars?.achievements || []).map((a: any) => (
                    <div key={a.id} className="p-2.5 rounded-xl bg-purple-50/40 border border-purple-100 text-xs">
                      <div className="font-bold text-purple-900">{a.title}</div>
                      <div className="text-[10px] text-slate-500">Issued by: {a.issuing_body} • {a.credential_tier}</div>
                    </div>
                  ))}
                  {(studentDossier?.pillars?.projects || []).map((p: any) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{p.title}</span>
                        <span className="font-bold text-emerald-600">{p.rubric_score}/100</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Online Feature Store JSON Viewer */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-sm space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-indigo-400 font-bold border-b border-slate-800 pb-2">
                <span>ONLINE FEATURE STORE HYDRATION (Student: usr-student-01)</span>
                <span className="text-[10px] text-emerald-400">P99 Latency: 2.1ms</span>
              </div>
              <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300">
                {JSON.stringify(studentDossier?.online_features || [], null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4 & 5: COLLECTION SYSTEM & INGESTION PIPELINE */}
        {/* ==================================================== */}
        {activeTab === 'collection-pipeline' && (
          <div className="space-y-6">
            {/* Pipeline Stage Architecture */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Task 5: AI Data Pipeline Specification</h3>
                  <p className="text-xs text-slate-500">
                    Ingestion ➔ Sanitization ➔ Great Expectations Validation ➔ Vector Embedding ➔ Hybrid RAG
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
                  Daily Throughput: {(pipelineStatus?.daily_processed_events || 185000).toLocaleString()} Events
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {(pipelineStatus?.stages || []).map((s: any) => (
                  <div key={s.stage_id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-indigo-700">{s.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{s.technology}</div>
                    <div className="text-xs text-slate-700">
                      <strong>Throughput:</strong> {s.throughput_events_sec} evt/s
                    </div>
                    <div className="text-[10px] text-slate-500">
                      <strong>Latency:</strong> {s.p99_latency}
                    </div>
                    <div className="text-[10px] text-slate-600 bg-white p-1.5 rounded border border-slate-100">
                      {s.validations}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Pipeline Verification Harness */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                Live Pipeline Verification Harness
              </h4>
              <p className="text-xs text-slate-500">
                Execute a live simulated event through the complete ingestion, PII cleansing, validation, 768d embedding, and retrieval pipeline.
              </p>

              <div className="space-y-3">
                <textarea
                  value={testInputText}
                  onChange={(e) => setTestInputText(e.target.value)}
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  rows={2}
                  placeholder="Enter sample input query..."
                />
                <button
                  onClick={handleRunPipelineTest}
                  disabled={pipelineTesting}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{pipelineTesting ? 'Processing Pipeline...' : 'Run Pipeline Verification'}</span>
                </button>
              </div>

              {pipelineTestResult && (
                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-1">
                    <span>PIPELINE VERIFICATION OUTPUT: {pipelineTestResult.test_status}</span>
                    <span>Total Latency: {pipelineTestResult.latency_ms}ms</span>
                  </div>
                  <pre className="overflow-x-auto text-[11px] text-slate-300">
                    {JSON.stringify(pipelineTestResult.stages_executed, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Task 4: Collection Matrix Table */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Task 4: Ethical Data Collection Matrix (What, When, Why, How)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Data Category</th>
                      <th className="py-2.5 px-3">What is Collected</th>
                      <th className="py-2.5 px-3">When Collected</th>
                      <th className="py-2.5 px-3">Why Collected</th>
                      <th className="py-2.5 px-3">How Used</th>
                      <th className="py-2.5 px-3">Retention / Privacy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(collectionMatrix?.collection_points || []).map((cp: any) => (
                      <tr key={cp.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-indigo-900 whitespace-nowrap">{cp.data_category}</td>
                        <td className="py-2.5 px-3 text-[11px] leading-snug">{cp.what_collected}</td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-500">{cp.when_collected}</td>
                        <td className="py-2.5 px-3 text-[11px] leading-snug">{cp.why_collected}</td>
                        <td className="py-2.5 px-3 text-[11px] text-indigo-950 font-medium">{cp.how_used}</td>
                        <td className="py-2.5 px-3 text-[10px] text-emerald-800 font-semibold whitespace-nowrap">{cp.privacy_tier}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: CLOSED-LOOP AI IMPROVEMENT FLYWHEEL */}
        {/* ==================================================== */}
        {activeTab === 'improvement-flywheel' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Task 6: AI Improvement Flywheel</h3>
                  <p className="text-xs text-slate-500">
                    Recommendation ➔ Student Action ➔ Downstream Academic Outcome ➔ Causal Attribution ➔ Model Fine-Tuning
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                  Flywheel Status: {flywheelData?.flywheel_status || 'CONVERGING'}
                </span>
              </div>

              {/* Flywheel Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Recorded Cycles</span>
                  <span className="text-2xl font-black text-slate-900">
                    {flywheelData?.metrics?.total_feedback_loops || 20}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-bold block uppercase">Action Conversion</span>
                  <span className="text-2xl font-black text-emerald-700">
                    {flywheelData?.metrics?.conversion_rate_pct || 91.5}%
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <span className="text-[10px] text-indigo-800 font-bold block uppercase">Avg Outcome Delta</span>
                  <span className="text-2xl font-black text-indigo-700">
                    +{flywheelData?.metrics?.avg_positive_outcome_delta || 18.2} pts
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <span className="text-[10px] text-purple-800 font-bold block uppercase">Bandit Policy</span>
                  <span className="text-xs font-bold text-purple-900 block mt-1">LinUCB + Policy Gradient</span>
                </div>
              </div>

              {/* Flywheel 5-Stage Architecture */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flywheel Stage Mechanics</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {(flywheelData?.flywheel_stages || []).map((st: any) => (
                    <div key={st.stage_number} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <div className="text-xs font-bold text-indigo-700">{st.stage_number}. {st.name}</div>
                      <div className="text-[11px] text-slate-600 leading-snug">{st.description}</div>
                      <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                        {st.telemetry_captured}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Improvement Loops Table */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Recent Completed Improvement Cycles</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase">
                        <th className="py-2 px-3">Recommendation</th>
                        <th className="py-2 px-3">Action Taken</th>
                        <th className="py-2 px-3">Outcome Metric</th>
                        <th className="py-2 px-3">Baseline</th>
                        <th className="py-2 px-3">Post-Action</th>
                        <th className="py-2 px-3">Outcome Gain</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(flywheelData?.recent_loops || []).map((loop: any) => (
                        <tr key={loop.loop_id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-800">{loop.candidate_title}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              {loop.action_taken}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600">{loop.outcome_metric_name}</td>
                          <td className="py-2 px-3 text-slate-600">{loop.baseline_metric_value}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{loop.post_outcome_metric_value}</td>
                          <td className="py-2 px-3 font-bold text-emerald-600">+{loop.outcome_delta}</td>
                          <td className="py-2 px-3 font-mono text-[10px] text-slate-500">{loop.feedback_status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: DATA GOVERNANCE & SOVEREIGN PRIVACY */}
        {/* ==================================================== */}
        {activeTab === 'governance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Task 7: Sovereign Data Governance Framework</h3>
                  <p className="text-xs text-slate-500">
                    Cambodia E-Commerce Law & MoEYS Education Data Protection Charter Compliance
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Zero Third-Party Ad Trackers
                </span>
              </div>

              {/* Triple-Lock Sovereign Consent Architecture */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-400" />
                    <h4 className="font-bold text-sm">Triple-Lock Consent Engine (Student • Parent • Institution)</h4>
                  </div>
                  <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">
                    AES-GCM-256 Field-Level
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 space-y-1">
                    <div className="text-xs font-bold text-indigo-300">1. Student Sovereign Lock</div>
                    <div className="text-xs text-emerald-400 font-bold">STATUS: GRANTED</div>
                    <div className="text-[10px] text-slate-300">Student retains private key and right to full JSON data export.</div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 space-y-1">
                    <div className="text-xs font-bold text-indigo-300">2. Parent / Guardian Lock</div>
                    <div className="text-xs text-emerald-400 font-bold">STATUS: VERIFIED</div>
                    <div className="text-[10px] text-slate-300">Mandatory for high school minors under MoEYS child protection laws.</div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 space-y-1">
                    <div className="text-xs font-bold text-indigo-300">3. School Director Lock</div>
                    <div className="text-xs text-emerald-400 font-bold">STATUS: VERIFIED</div>
                    <div className="text-[10px] text-slate-300">Preah Sisowath NGS certified official academic transcript linkage.</div>
                  </div>
                </div>
              </div>

              {/* Data Quality 5-Dimension Scorecards */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Task 7.5: Data Quality Monitoring (5 Dimensions)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(governanceData?.quality_scorecards || []).map((sc: any) => (
                    <div key={sc.scorecard_id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">{sc.dataset_name}</span>
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {sc.overall_health_grade}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1">
                        <div>Completeness: <strong className="text-slate-900">{sc.completeness_pct}%</strong></div>
                        <div>Accuracy: <strong className="text-slate-900">{sc.accuracy_pct}%</strong></div>
                        <div>Consistency: <strong className="text-slate-900">{sc.consistency_pct}%</strong></div>
                        <div>Uniqueness: <strong className="text-slate-900">{sc.uniqueness_pct}%</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exported JSON Modal Display */}
              {exportedJson && (
                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-indigo-400 font-bold border-b border-slate-800 pb-1">
                    <span>SOVEREIGN EXPORT PAYLOAD (SHA-256 Verified)</span>
                    <button onClick={() => setExportedJson(null)} className="text-slate-400 hover:text-white cursor-pointer">
                      Close
                    </button>
                  </div>
                  <pre className="overflow-x-auto text-[11px] text-slate-300 max-h-60">
                    {exportedJson}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 8 & 9: FUTURE MACHINE LEARNING & PREDICTION ENGINES */}
        {/* ==================================================== */}
        {activeTab === 'ml-engine' && (
          <div className="space-y-6">
            {/* ML Models Registry */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Tasks 8 & 9: Machine Learning Model Registry</h3>
                  <p className="text-xs text-slate-500">
                    Production algorithms deployed for Bac II prediction, two-tower university matching, and DSR spaced repetition.
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                  4 Champion Models Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(mlRegistry?.models || []).map((m: any) => (
                  <div key={m.model_id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-800">{m.model_name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {m.deployment_status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono">Algorithm: {m.algorithm}</div>
                    <div className="grid grid-cols-3 gap-2 text-xs py-1 bg-white p-2 rounded border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Accuracy</span>
                        <span className="font-bold text-slate-900">{(m.accuracy_score * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Version</span>
                        <span className="font-semibold text-slate-700">{m.version}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Training Data</span>
                        <span className="font-semibold text-slate-700">{m.training_dataset_size.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Bac II Grade Predictor (Task 9.1) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Live Inference: National Bac II Grade & Composite Score Estimator
              </h4>
              <p className="text-xs text-slate-500">
                Adjust student mock exam raw scores to observe the Bayesian LightGBM model estimate the overall score (out of 500) and Grade A probability.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Math Score: {mockMath}%</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={mockMath}
                    onChange={(e) => setMockMath(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Physics Score: {mockPhysics}%</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={mockPhysics}
                    onChange={(e) => setMockPhysics(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Khmer Score: {mockKhmer}%</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={mockKhmer}
                    onChange={(e) => setMockKhmer(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Chemistry: {mockChemistry}%</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={mockChemistry}
                    onChange={(e) => setMockChemistry(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                onClick={handlePredictBacII}
                disabled={predicting}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{predicting ? 'Calculating Posterior...' : 'Execute Bac II Prediction Model'}</span>
              </button>

              {predictionResult && (
                <div className="p-5 rounded-xl bg-indigo-950 text-white space-y-3">
                  <div className="flex items-center justify-between border-b border-indigo-800/60 pb-2">
                    <div>
                      <span className="text-xs text-indigo-300">ESTIMATED BAC II OUTCOME</span>
                      <h5 className="text-xl font-black text-white">
                        Grade {predictionResult.predicted_grade} ({predictionResult.predicted_score} / 500)
                      </h5>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-indigo-300">Grade A Probability</span>
                      <div className="text-xl font-black text-emerald-400">
                        {(predictionResult.grade_a_probability * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-indigo-200">
                    <div className="font-bold text-white">Targeted Interventions:</div>
                    {(predictionResult.recommended_interventions || []).map((int: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{int}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* University Matcher & Career Gap Engines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* University Matcher */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Task 9.2: Two-Tower University Matcher</h4>
                  <button
                    onClick={handleGetUniversityRecs}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition cursor-pointer"
                  >
                    Run Matcher
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Scores student's STEM affinity against institutional entrance criteria and graduate placement rates.
                </p>

                {univRecs && (
                  <div className="space-y-2">
                    {(univRecs.recommendations || []).slice(0, 3).map((r: any) => (
                      <div key={r.university_id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{r.abbr} - {r.name_en}</span>
                          <span className="font-bold text-emerald-600">{(r.fit_score * 100).toFixed(0)}% Fit</span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Tuition: ${r.estimated_tuition_annual}/yr • Programs: {(r.recommended_programs || []).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Career Skill Gap Engine */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Task 9.4: Career Competency Gap Engine</h4>
                  <button
                    onClick={handleGetCareerGap}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition cursor-pointer"
                  >
                    Run Gap Analysis
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Projections toward target career: AI Systems & Cloud Architect ($1,850/mo median).
                </p>

                {careerGapResult && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-800">
                      Overall Readiness: {careerGapResult.overall_competency_match_pct}%
                    </div>
                    {(careerGapResult.competency_breakdown || []).slice(0, 3).map((c: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>{c.skill_name}</span>
                          <span className={c.readiness_pct > 80 ? 'text-emerald-600' : 'text-amber-600'}>
                            {c.mastery_status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">{c.recommended_curriculum_module}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
