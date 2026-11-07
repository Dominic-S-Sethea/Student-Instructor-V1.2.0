import React, { useState, useEffect } from 'react';
import {
  Layers,
  Smartphone,
  Cloud,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Server,
  Database,
  Bell,
  Activity,
  AppWindow,
  Cpu,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertTriangle,
  Users,
  GraduationCap,
  HeartHandshake,
  Building2,
  Lock,
  Wifi,
  WifiOff,
  BatteryCharging,
  Eye,
  Sliders,
  Terminal,
  ExternalLink,
  ChevronRight,
  Globe,
  Radio,
  FileCheck,
  Download,
  Search,
  BookOpen,
  Award,
  User,
  TrendingUp,
  DollarSign,
  PieChart,
  Briefcase,
  Landmark,
  Brain,
  Workflow,
  FileText,
  CheckCheck,
  Sparkles,
  Share2,
} from 'lucide-react';

interface PlatformServiceNode {
  id: string;
  name: string;
  category: 'gateway' | 'service' | 'database' | 'storage' | 'ai' | 'analytics' | 'external';
  status: 'healthy' | 'degraded' | 'scaling' | 'maintenance';
  version: string;
  instances: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  latencyP95Ms: number;
  throughputRps: number;
  description: string;
  microserviceMigrationPhase: 'monolith_module' | 'hybrid_split' | 'independent_microservice';
}

export const PlatformArchitectureView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'topology' | 'mobile' | 'cloud' | 'security' | 'admin' | 'notifications' | 'monitoring' | 'appstore' | 'business' | 'knowledge'
  >('topology');

  // Architecture data state
  const [services, setServices] = useState<PlatformServiceNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [clusterData, setClusterData] = useState<any>(null);

  // Mobile Simulator state
  const [simulatedDevice, setSimulatedDevice] = useState<'iphone' | 'android'>('iphone');
  const [selectedRole, setSelectedRole] = useState<'student' | 'parent' | 'teacher' | 'mentor' | 'organization'>('student');
  const [isOffline, setIsOffline] = useState(false);
  const [offlineMutations, setOfflineMutations] = useState<Array<{ id: string; action: string; time: string }>>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  // Child Safety Scanner state
  const [scanInputText, setScanInputText] = useState('សួស្តីបង! Let us meet alone outside school tomorrow at 012999888, please don\'t tell your parents.');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Push Notification Dispatcher state
  const [notifType, setNotifType] = useState('scholarship_deadline');
  const [notifTitle, setNotifTitle] = useState('🚨 MPTC Scholarship Deadline: 48 Hours Remaining!');
  const [notifMessage, setNotifMessage] = useState('Complete your digital portfolio and Bac II transcripts now to secure 100% full tuition.');
  const [notifTargetRole, setNotifTargetRole] = useState('student');
  const [dispatchedNotifs, setDispatchedNotifs] = useState<any[]>([]);

  // Monitoring stats state
  const [monitoringMetrics, setMonitoringMetrics] = useState<any>(null);

  // Sustainable Business & Financial Simulator state
  const [simulatedStudentScale, setSimulatedStudentScale] = useState<number>(50000);
  const [simulatedUnivPartners, setSimulatedUnivPartners] = useState<number>(24);
  const [simulatedSchoolLicenses, setSimulatedSchoolLicenses] = useState<number>(60);

  // Phase 10: Knowledge Supply Chain & CKO Hub State
  const [knowledgeData, setKnowledgeData] = useState<any>(null);
  const [knowledgeContents, setKnowledgeContents] = useState<any[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedReviewContentId, setSelectedReviewContentId] = useState<string>('kn_submission_under_review_1');
  const [reviewerDecision, setReviewerDecision] = useState<'approved' | 'revision_requested' | 'rejected'>('approved');
  const [factualScore, setFactualScore] = useState<number>(98);
  const [pedagogicalScore, setPedagogicalScore] = useState<number>(95);
  const [childSafetyScore, setChildSafetyScore] = useState<number>(100);
  const [reviewAuditFeedback, setReviewAuditFeedback] = useState<string | null>(null);
  const [isSyncingRag, setIsSyncingRag] = useState<boolean>(false);
  const [ragSyncResult, setRagSyncResult] = useState<string | null>(null);

  // Fetch live architecture stats on mount
  useEffect(() => {
    fetchArchitecture();
    fetchMonitoring();
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    try {
      const [resOverview, resContent] = await Promise.all([
        fetch('/api/knowledge/overview'),
        fetch('/api/knowledge/content')
      ]);
      if (resOverview.ok) {
        const dOverview = await resOverview.json();
        if (dOverview.success) setKnowledgeData(dOverview.data);
      }
      if (resContent.ok) {
        const dContent = await resContent.json();
        if (dContent.success) setKnowledgeContents(dContent.data);
      }
    } catch (e) {
      console.warn('Knowledge supply chain fetch error:', e);
    }
  };

  const handleVerifySubmission = async () => {
    try {
      setReviewAuditFeedback(null);
      const res = await fetch('/api/knowledge/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: selectedReviewContentId,
          decision: reviewerDecision,
          factualAccuracyScore: factualScore,
          pedagogicalScore: pedagogicalScore,
          safetyComplianceScore: childSafetyScore,
          comments: `Verified by CKO Curriculum Council: Pedagogy ${pedagogicalScore}%, Accuracy ${factualScore}%, Safety ${childSafetyScore}%.`
        })
      });
      if (res.ok) {
        const data = await res.json();
        setReviewAuditFeedback(`Verification audit executed! Content status changed to "${data.content.status.toUpperCase()}" with recalculated Trust Score: ${data.content.trustScore}%`);
        await fetchKnowledge();
      }
    } catch (e) {
      setReviewAuditFeedback('Verification failed. Check network or server.');
    }
  };

  const handleTriggerRagSync = async (contentId: string) => {
    try {
      setIsSyncingRag(true);
      setRagSyncResult(null);
      const res = await fetch('/api/knowledge/rag-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId })
      });
      if (res.ok) {
        const data = await res.json();
        setRagSyncResult(`Vector RAG upsert complete: ${data.data.chunkCount} chunks vectorized with ${data.data.embeddingModel}. Similarity cluster: ${data.data.similaritySearchNamespace}`);
        await fetchKnowledge();
      }
    } catch (e) {
      setRagSyncResult('Failed to sync vector RAG embeddings.');
    } finally {
      setIsSyncingRag(false);
    }
  };

  const fetchArchitecture = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/platform/architecture');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setServices(data.services || []);
          setClusterData(data.cluster || null);
        }
      }
    } catch (e) {
      console.warn('Failed to load architecture from backend, using robust fallback state:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonitoring = async () => {
    try {
      const res = await fetch('/api/platform/monitoring/metrics');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMonitoringMetrics(data.metrics);
        }
      }
    } catch (e) {
      console.warn('Monitoring fetch error:', e);
    }
  };

  // Trigger offline action simulation
  const handleSimulateOfflineAction = (actionName: string) => {
    const newMut = {
      id: `mut-${Date.now()}`,
      action: actionName,
      time: new Date().toLocaleTimeString(),
    };
    setOfflineMutations(prev => [newMut, ...prev]);
  };

  const handleSyncOfflineQueue = async () => {
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/platform/mobile/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: simulatedDevice === 'iphone' ? 'dev-ios-001' : 'dev-and-002',
          mutations: offlineMutations,
        }),
      });
      if (res.ok) {
        setTimeout(() => {
          setOfflineMutations([]);
          setSyncStatus('synced');
          setTimeout(() => setSyncStatus('idle'), 2500);
        }, 800);
      }
    } catch {
      setSyncStatus('idle');
    }
  };

  // Trigger child safety scan
  const handleRunSafetyScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/platform/child-safety/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scanInputText,
          senderAge: 24,
          recipientAge: 15,
          channelType: 'community_chat',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setScanResult(data.scanResult);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  // Trigger notification dispatch
  const handleDispatchNotification = async () => {
    try {
      const res = await fetch('/api/platform/notifications/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notifType,
          title: notifTitle,
          message: notifMessage,
          targetRole: notifTargetRole,
          priority: 'high',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDispatchedNotifs(prev => [data.notification, ...prev]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>Phase 9: Platform Architecture & Mobile Engineering Lead</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              CDES Enterprise Platform Architecture & Multi-Role Mobile Hub
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Architectural master control center engineered for national Cambodian adoption (millions of users) across Web, iOS, and Android. Featuring high-concurrency API Gateway, sharded PostgreSQL cluster, offline sync engine, automated COPPA child safety filter, and cross-portal administration.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-xl px-4 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Scalability SLA</span>
              <span className="text-lg font-black text-emerald-400">99.98% Uptime</span>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-xl px-4 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Max Autoscale</span>
              <span className="text-lg font-black text-indigo-300">1,000 Pods</span>
            </div>
          </div>
        </div>

        {/* Live Cluster Health Ribbon */}
        {clusterData && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Region: <strong className="text-white">{clusterData.region}</strong></span>
            </div>
            <div>
              Active Pods: <strong className="text-white">{clusterData.activePods}</strong> (Kubernetes {clusterData.kubernetesVersion})
            </div>
            <div>
              Total Ingress: <strong className="text-emerald-400">{clusterData.totalThroughputRps?.toLocaleString()} RPS</strong>
            </div>
            <div>
              P95 Latency: <strong className="text-indigo-300">{clusterData.averageP95LatencyMs} ms</strong>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>{clusterData.ddosProtectionStatus}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200">
        {[
          { id: 'topology', label: '1. Platform Architecture & Diagram', icon: Layers },
          { id: 'mobile', label: '2. Mobile Apps (5 Roles & Offline)', icon: Smartphone },
          { id: 'cloud', label: '3. Cloud & CI/CD Pipeline', icon: Cloud },
          { id: 'security', label: '4. Security & Child Safety', icon: Shield },
          { id: 'admin', label: '5. Admin Ecosystem Portals', icon: Building2 },
          { id: 'notifications', label: '6. Push Notification Engine', icon: Bell },
          { id: 'monitoring', label: '7. SRE Observability & APM', icon: Activity },
          { id: 'appstore', label: '8. App Store & Release Hub', icon: AppWindow },
          { id: 'business', label: '9. Sustainable Business Ecosystem', icon: TrendingUp },
          { id: 'knowledge', label: '10. Knowledge Supply Chain & CKO Hub', icon: Brain },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: GLOBAL PLATFORM ARCHITECTURE & TOPOLOGY
         ========================================================================= */}
      {activeSubTab === 'topology' && (
        <div className="space-y-6">
          {/* Interactive Topology Diagram */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>Interactive High-Concurrency Platform Topology Diagram</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual mapping of traffic flow from multi-platform clients through Cloudflare Edge, Kong API Gateway, microservice mesh, and distributed storage.
                </p>
              </div>
              <button
                onClick={fetchArchitecture}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Telemetry</span>
              </button>
            </div>

            {/* Architecture Visual Grid */}
            <div className="space-y-4">
              {/* Layer 1: Client Tier */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                  Layer 1: Unified Client Tier (PWA, Android Native, iOS Native)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-3">
                    <Globe className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Web SPA / PWA</div>
                      <div className="text-[11px] text-slate-500">React 19 + Vite + Tailwind (Offline Service Worker)</div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-3">
                    <Smartphone className="w-6 h-6 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Android Application</div>
                      <div className="text-[11px] text-slate-500">Kotlin / Jetpack Compose / Room SQLite Sync</div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-3">
                    <Smartphone className="w-6 h-6 text-indigo-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">iOS Application</div>
                      <div className="text-[11px] text-slate-500">SwiftUI / CoreData Sync / APNs Background Refresh</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Traffic Flow Arrow */}
              <div className="flex justify-center -my-2 text-indigo-400">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>

              {/* Layer 2: Edge & API Gateway */}
              <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 block mb-2">
                  Layer 2: Edge Security & API Gateway Tier (Rate Limiting, mTLS, JWT, WAF)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-indigo-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Cloudflare Magic Transit & CDN</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Edge Tier</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Anycast DNS, DDoS mitigation (Layer 3/4/7), SSL termination, and static asset edge caching in Phnom Penh & Singapore.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-indigo-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Kong Enterprise API Gateway</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">Ingress</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Token bucket rate limiting (1,200 req/min/school), JWT validation, mTLS between internal pods, and path-based microservice routing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Traffic Flow Arrow */}
              <div className="flex justify-center -my-2 text-indigo-400">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>

              {/* Layer 3: Backend Modules & Microservices Mesh */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block mb-2">
                  Layer 3: Decoupled Backend Microservices & Domain Modules
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { name: 'Identity & IAM', desc: 'OAuth2/OIDC, Multi-Role, Dual-Key Consent', status: 'Healthy', p95: '22ms' },
                    { name: 'Scholarship Intel', desc: 'Matching Engine, MoEYS Quotas, ROI Calc', status: 'Healthy', p95: '31ms' },
                    { name: 'STEM Learning & BKT', desc: 'Bayesian Mastery, ZPD Load, Ebbinghaus', status: 'Healthy', p95: '38ms' },
                    { name: 'Avatar World Engine', desc: 'WebGL Sprites, Room State, P2P Broadcast', status: 'Healthy', p95: '25ms' },
                    { name: 'Socratic AI & RAG', desc: 'Gemini 3.1/3.8 Flash, Qdrant Vector DB', status: 'Healthy', p95: '420ms' },
                    { name: 'Community Hub', desc: 'Study Wings, Peer Meetups, AMAs', status: 'Healthy', p95: '28ms' },
                    { name: 'Child Safety Shield', desc: 'Khmer/EN Profanity, Predatory Scan', status: 'Active', p95: '18ms' },
                    { name: 'Notification Dispatch', desc: 'APNs, FCM, WebPush, SMS/Telegram', status: 'Healthy', p95: '19ms' },
                  ].map((m, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{m.name}</span>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                          {m.p95}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic Flow Arrow */}
              <div className="flex justify-center -my-2 text-indigo-400">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>

              {/* Layer 4: Storage & Data Persistence */}
              <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block mb-2">
                  Layer 4: Distributed Database, Cache & Asset Storage Tier
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-xs">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                      <Database className="w-4 h-4 text-emerald-600" />
                      <span>PostgreSQL 16 Multi-Region Cluster</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      1 Primary (Singapore) + 3 Read Replicas sharded by Cambodian provinces (Phnom Penh, Siem Reap, Battambang). Automated PITR backups.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-xs">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                      <Cpu className="w-4 h-4 text-red-600" />
                      <span>Redis Cluster v7.2 (Distributed Cache)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Sub-2ms cache for student BKT knowledge states, active JWT revocation lists, session tickets, and sliding window rate limiters.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-xs">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                      <Cloud className="w-4 h-4 text-blue-600" />
                      <span>Google Cloud Storage + Cloud CDN</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Multi-region GCS bucket with AES-256 server-side encryption storing PhET simulations, avatar WebGL bundles, and Bac II PDF exams.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Microservices Mesh Detail Table */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Server className="w-5 h-5 text-indigo-600" />
              <span>Active Service Mesh Telemetry & Microservices Migration Matrix</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">Service Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Instances / Pods</th>
                    <th className="py-2.5 px-3">Throughput (RPS)</th>
                    <th className="py-2.5 px-3">P95 Latency</th>
                    <th className="py-2.5 px-3">CPU / Mem</th>
                    <th className="py-2.5 px-3">Microservice Stage</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((svc) => (
                    <tr key={svc.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        <div>{svc.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{svc.id} • {svc.version}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {svc.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{svc.instances} pods</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{svc.throughputRps.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{svc.latencyP95Ms} ms</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {svc.cpuUsagePercent}% / {svc.memoryUsagePercent}%
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          svc.microserviceMigrationPhase === 'independent_microservice'
                            ? 'bg-emerald-100 text-emerald-800'
                            : svc.microserviceMigrationPhase === 'hybrid_split'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {svc.microserviceMigrationPhase.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{svc.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MOBILE APPLICATIONS (5 ROLES & OFFLINE ENGINE)
         ========================================================================= */}
      {activeSubTab === 'mobile' && (
        <div className="space-y-6">
          {/* Multi-Role Mobile Emulator Workbench */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <span>Cross-Platform Mobile Architecture & Multi-Role Emulator</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate native iOS (SwiftUI) & Android (Jetpack Compose) applications across 5 dedicated roles with offline sync queue and conflict reconciliation.
                </p>
              </div>

              {/* Controls: Device and Offline Toggle */}
              <div className="flex items-center space-x-3">
                <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                  <button
                    onClick={() => setSimulatedDevice('iphone')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                      simulatedDevice === 'iphone' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    iPhone 16 Pro (iOS)
                  </button>
                  <button
                    onClick={() => setSimulatedDevice('android')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                      simulatedDevice === 'android' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Google Pixel 9 (Android)
                  </button>
                </div>

                <button
                  onClick={() => setIsOffline(!isOffline)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    isOffline
                      ? 'bg-amber-500 text-white shadow-xs animate-pulse'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                  <span>{isOffline ? 'Mode: OFFLINE' : 'Mode: ONLINE'}</span>
                </button>
              </div>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2 mb-6">
              {[
                { id: 'student', name: 'Student App', icon: GraduationCap, badge: 'Grades 7–12' },
                { id: 'parent', name: 'Parent App', icon: Users, badge: 'Guardians' },
                { id: 'teacher', name: 'Teacher App', icon: BookOpen, badge: 'Educators' },
                { id: 'mentor', name: 'Mentor App', icon: HeartHandshake, badge: 'Seniors' },
                { id: 'organization', name: 'Organization App', icon: Building2, badge: 'Unis / MoEYS' },
              ].map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id as any)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{r.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500">
                      {r.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Hardware Emulator Frame & Screen */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Phone Mockup Frame (5 Cols) */}
              <div className="lg:col-span-5 flex justify-center">
                <div
                  className={`w-full max-w-[340px] bg-slate-950 p-3 shadow-2xl border-4 ${
                    simulatedDevice === 'iphone'
                      ? 'rounded-[46px] border-slate-800 ring-4 ring-slate-900'
                      : 'rounded-[36px] border-slate-700'
                  }`}
                >
                  {/* Speaker / Dynamic Island */}
                  <div className="flex justify-center mb-2">
                    {simulatedDevice === 'iphone' ? (
                      <div className="w-24 h-4 bg-black rounded-full flex items-center justify-between px-2">
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                      </div>
                    ) : (
                      <div className="w-3 h-3 bg-black rounded-full" />
                    )}
                  </div>

                  {/* Phone Screen Canvas */}
                  <div className="bg-slate-50 rounded-[32px] overflow-hidden border border-slate-200 min-h-[520px] flex flex-col justify-between">
                    {/* Status Bar */}
                    <div className="bg-white px-4 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-800 border-b border-slate-100">
                      <span>9:41</span>
                      <div className="flex items-center space-x-1.5">
                        {isOffline ? (
                          <span className="text-[10px] text-amber-600 font-semibold flex items-center space-x-0.5">
                            <WifiOff className="w-3 h-3" />
                            <span>Offline</span>
                          </span>
                        ) : (
                          <Wifi className="w-3 h-3 text-slate-700" />
                        )}
                        <span className="text-[10px]">5G</span>
                        <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                    </div>

                    {/* App Bar */}
                    <div className="bg-indigo-900 text-white p-3 flex items-center justify-between shadow-xs">
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-indigo-300">CDES Mobile</div>
                        <div className="text-xs font-extrabold capitalize">{selectedRole} Workspace</div>
                      </div>
                      <span className="text-[10px] bg-indigo-800 px-2 py-0.5 rounded font-mono">v2.1</span>
                    </div>

                    {/* App Content Body based on Selected Role */}
                    <div className="p-3 flex-1 overflow-y-auto space-y-2.5 text-left text-xs">
                      {isOffline && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2 text-[11px] flex items-center space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                          <span>Offline Mode active. All progress is cached locally in SQLite.</span>
                        </div>
                      )}

                      {selectedRole === 'student' && (
                        <div className="space-y-2">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                              <span>Daily STEM Quest</span>
                              <span className="text-indigo-600 text-[10px]">80% Complete</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                              <div className="bg-indigo-600 h-1.5 rounded-full w-4/5" />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Calculus: Limits & Bac II 2024 Exam Prep</p>
                          </div>

                          <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl">
                            <span className="text-[10px] font-bold text-indigo-800 uppercase block">BKT Mastery Status</span>
                            <div className="text-xs font-extrabold text-indigo-950">Mastery Prob: P(L) = 0.89</div>
                            <div className="text-[10px] text-indigo-700 mt-0.5">ZPD Level: Accelerated Challenge</div>
                          </div>

                          <button
                            onClick={() => handleSimulateOfflineAction('Completed Bac II Physics Trial Quiz')}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                          >
                            + Log Quiz Response
                          </button>
                        </div>
                      )}

                      {selectedRole === 'parent' && (
                        <div className="space-y-2">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                            <div className="text-xs font-bold text-slate-900">Child: Keo Ratha (Grade 12)</div>
                            <div className="text-[10px] text-slate-500">Hun Sen Kampong Cham High School</div>
                            <div className="mt-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-1.5 rounded">
                              ✓ 4.2 Hours STEM Lab this week (+18% vs peers)
                            </div>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                            <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                              <span>Parental Consent Request</span>
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">Pending</span>
                            </div>
                            <p className="text-[10px] text-slate-600">
                              Ratha requested a 1-on-1 online mentorship session with Dalin Chhem (Software Engineer @ Smart).
                            </p>
                            <button
                              onClick={() => handleSimulateOfflineAction('Parent Approved Online Mentorship Slot')}
                              className="w-full py-1.5 bg-emerald-600 text-white rounded-md text-[11px] font-bold"
                            >
                              Approve with Dual-Key SMS
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedRole === 'teacher' && (
                        <div className="space-y-2">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                            <div className="text-xs font-bold text-slate-900">Grade 12A STEM Cohort (42 Students)</div>
                            <div className="text-[10px] text-slate-500">Average Class BKT Mastery: 76.4%</div>
                          </div>

                          <div className="bg-red-50 border border-red-200 p-2 rounded-xl text-red-900">
                            <div className="text-[11px] font-bold">⚠️ 3 Students at Misconception Risk</div>
                            <div className="text-[10px] text-red-700 mt-0.5">Topic: Trigonometric Integration</div>
                          </div>

                          <button
                            onClick={() => handleSimulateOfflineAction('Dispatched Differentiated Homework to 12A')}
                            className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold"
                          >
                            Dispatch Tailored Scaffolds
                          </button>
                        </div>
                      )}

                      {selectedRole === 'mentor' && (
                        <div className="space-y-2">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                            <div className="text-xs font-bold text-slate-900">Senior Mentor Dashboard</div>
                            <div className="text-[10px] text-slate-500">Verified ITC Alumni • 14 Sessions Completed</div>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 p-2 rounded-xl">
                            <div className="text-[11px] font-bold text-blue-900">2 Guidance Requests</div>
                            <div className="text-[10px] text-blue-700">CADT vs ITC Foundation Year comparison</div>
                          </div>
                          <button
                            onClick={() => handleSimulateOfflineAction('Accepted Senior Mentorship Request')}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                          >
                            Accept Next Available Slot
                          </button>
                        </div>
                      )}

                      {selectedRole === 'organization' && (
                        <div className="space-y-2">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                            <div className="text-xs font-bold text-slate-900">Institutional Scholarship Queue</div>
                            <div className="text-[10px] text-slate-500">MoEYS & MPTC Digital Talent Program</div>
                          </div>
                          <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-emerald-900">
                            <div className="text-[11px] font-bold">124 Verified Applicants</div>
                            <div className="text-[10px] text-emerald-700">Battambang & Siem Reap priority pool</div>
                          </div>
                          <button
                            onClick={() => handleSimulateOfflineAction('Batch Approved 10 Top Scholarship Candidates')}
                            className="w-full py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold"
                          >
                            Batch Review Applicants
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom Navigation Bar */}
                    <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around text-[9px] text-slate-500 font-semibold">
                      <div className="flex flex-col items-center text-indigo-600">
                        <GraduationCap className="w-4 h-4" />
                        <span>Learn</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Award className="w-4 h-4" />
                        <span>Awards</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Users className="w-4 h-4" />
                        <span>Network</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Architecture Specs & Offline Queue Management (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Offline Sync State Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                      <Database className="w-4 h-4 text-indigo-600" />
                      <span>Offline Storage & Conflict-Free Sync Engine</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {offlineMutations.length} Pending Mutations
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-3">
                    In rural Cambodian provinces where 4G/5G connections may drop intermittently, CDES utilizes a local SQLite/IndexedDB mutation queue with optimistic updates and deterministic vector clocks for conflict resolution.
                  </p>

                  <div className="bg-white rounded-lg p-3 border border-slate-200 max-h-36 overflow-y-auto space-y-1.5 text-xs">
                    {offlineMutations.length === 0 ? (
                      <div className="text-slate-400 text-center py-2 text-[11px]">
                        Queue is clean. Click buttons in the phone emulator to record offline mutations.
                      </div>
                    ) : (
                      offlineMutations.map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-1.5 rounded bg-slate-50 text-[11px]">
                          <span className="font-semibold text-slate-800">{m.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{m.time}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Storage footprint: ~3.4 MB (Encrypted AES-GCM)
                    </span>
                    <button
                      onClick={handleSyncOfflineQueue}
                      disabled={offlineMutations.length === 0 || syncStatus === 'syncing'}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      <span>{syncStatus === 'syncing' ? 'Reconciling...' : syncStatus === 'synced' ? 'Synced!' : 'Sync with Server'}</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Technical Stack Matrix */}
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <span className="text-xs font-bold text-slate-900 block mb-2">Native Mobile Engineering Stack</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50/50">
                      <div className="font-bold text-slate-900">iOS Native Architecture</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        • SwiftUI + Observation Framework<br />
                        • CoreData with SQLite encryption<br />
                        • APNs silent background fetch<br />
                        • Privacy Manifest (PrivacyInfo.xcprivacy)
                      </div>
                    </div>
                    <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50/50">
                      <div className="font-bold text-slate-900">Android Native Architecture</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        • Kotlin + Jetpack Compose UI<br />
                        • Room Database + SQLCipher<br />
                        • WorkManager background synchronization<br />
                        • targetSdk 35 & Google Play Data Safety
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CLOUD INFRASTRUCTURE & CI/CD PIPELINE
         ========================================================================= */}
      {activeSubTab === 'cloud' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <Cloud className="w-5 h-5 text-indigo-600" />
              <span>National Scale Cloud Infrastructure & Multi-Region Topology</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Production container orchestration, automated autoscaling from 0 to 1,000 pods, automated disaster recovery, and point-in-time recovery (PITR).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                  <Server className="w-4 h-4 text-indigo-600" />
                  <span>Compute & Autoscaling</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>• Google Cloud Run / GKE 1.30</div>
                  <div>• HPA based on CPU & RPS thresholds</div>
                  <div>• Min Pods: 6 | Max Pods: 1,000</div>
                  <div>• Scale-to-zero during quiet hours</div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Database & Disaster Recovery</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>• Cloud SQL PostgreSQL 16 (HA)</div>
                  <div>• Automatic cross-zone failover (&lt;2 min)</div>
                  <div>• Continuous WAL archiving (PITR 35 days)</div>
                  <div>• Daily snapshot replicas in Singapore & Tokyo</div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Disaster Recovery SLA</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>• <strong>RTO</strong> (Recovery Time): &lt; 15 mins</div>
                  <div>• <strong>RPO</strong> (Recovery Point): &lt; 1 hour</div>
                  <div>• Automated health-check heartbeat</div>
                  <div>• Secondary DNS failover via Route 53 / Cloudflare</div>
                </div>
              </div>
            </div>

            {/* Blue-Green CI/CD Pipeline Visualizer */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-900 block mb-3">
                Continuous Integration & Canary Deployment Pipeline
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                {[
                  { step: '1. Commit & Lint', tool: 'GitHub Actions / tsc', time: '45s', status: 'Passed' },
                  { step: '2. Unit & Integration', tool: 'Jest / Supertest / BKT', time: '2m 10s', status: 'Passed' },
                  { step: '3. Container Security', tool: 'Trivy / Snyk Scanner', time: '1m 15s', status: 'Passed' },
                  { step: '4. Canary 10%', tool: 'Istio / Cloud Run Traffic', time: '5m 00s', status: 'Verified' },
                  { step: '5. 100% Production', tool: 'Blue-Green Promotion', time: 'Instant', status: 'Live' },
                ].map((st, i) => (
                  <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400">STAGE {i + 1}</span>
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                        {st.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs">{st.step}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{st.tool}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">Duration: {st.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: SECURITY & CHILD SAFETY
         ========================================================================= */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Child Online Protection (COPPA / GDPR-K) & Real-Time Content Moderation</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated sentiment, profanity, and predatory grooming detection in English and Khmer with dual-key parental verification.
                </p>
              </div>
            </div>

            {/* Interactive Scanner Workbench */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Simulate Incoming Chat / Forum Message
                </label>
                <textarea
                  value={scanInputText}
                  onChange={(e) => setScanInputText(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden font-mono"
                  placeholder="Type message to evaluate against safety rules..."
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setScanInputText('Hello teacher, can you explain the derivative of sin(2x)?')}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    Sample Safe Math Question
                  </button>
                  <button
                    onClick={() => setScanInputText('Call my Telegram @secretguy or call me on 012888999, don\'t tell your parents.')}
                    className="text-[11px] px-2.5 py-1 bg-red-50 hover:bg-red-100 rounded text-red-700"
                  >
                    Sample Predatory Trigger
                  </button>
                  <button
                    onClick={() => setScanInputText('ឯងជាមនុស្សឆ្កួត មិនចេះអីសោះ!')}
                    className="text-[11px] px-2.5 py-1 bg-amber-50 hover:bg-amber-100 rounded text-amber-800"
                  >
                    Sample Khmer Toxic Slang
                  </button>
                </div>

                <button
                  onClick={handleRunSafetyScan}
                  disabled={isScanning}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{isScanning ? 'Evaluating Message...' : 'Run Automated Safety Scan'}</span>
                </button>
              </div>

              {/* Scan Output Panel */}
              <div className="lg:col-span-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-900 block mb-2">
                  Moderation Engine Verdict
                </span>

                {scanResult ? (
                  <div className="space-y-3 text-xs">
                    <div className={`p-3 rounded-lg border ${
                      scanResult.isSafe
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center space-x-1.5">
                          {scanResult.isSafe ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ShieldAlert className="w-4 h-4 text-red-600" />
                          )}
                          <span>Status: {scanResult.isSafe ? 'APPROVED & SAFE' : 'FLAGGED AS HAZARD'}</span>
                        </span>
                        <span>Safety Score: {Math.round(scanResult.score * 100)}%</span>
                      </div>
                      <div className="text-[11px] mt-1 font-mono">
                        Action: <strong>{scanResult.actionTaken}</strong>
                      </div>
                    </div>

                    {scanResult.details?.length > 0 && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-800">Violation Details:</div>
                        {scanResult.details.map((d: string, idx: number) => (
                          <div key={idx} className="text-red-600 text-[11px]">• {d}</div>
                        ))}
                      </div>
                    )}

                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-800">Sanitized Output for Minor:</div>
                      <div className="text-slate-600 font-mono text-[11px] bg-slate-50 p-2 rounded">
                        {scanResult.redactedText}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-8 text-xs">
                    Click "Run Automated Safety Scan" to inspect live filtering heuristics.
                  </div>
                )}
              </div>
            </div>

            {/* Child Safety Privacy Pillars */}
            <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Zero Unmoderated Adult DMs</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  All mentorship communications between minors and verified adults take place inside supervised group wings or recorded study sessions.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dual-Key Parental Consent</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Parents receive SMS verification codes before their child can join online study sessions or connect external Google Drive portfolios.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Salted Pseudonymized PII</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Research telemetry automatically strips Cambodian national IDs and phone numbers using salted SHA-256 before analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: ADMIN ECOSYSTEM PORTALS
         ========================================================================= */}
      {activeSubTab === 'admin' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>Cross-Institution Governance & Administration Ecosystem</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Dedicated governance portals tailored for Central MoEYS Administrators, University Admissions Directors, STEM School Teachers, and Academic Researchers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Portal 1: Central Admin */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span>National CDES Central Administration</span>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">MoEYS Level</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-slate-500 text-[10px]">Registered Students</div>
                    <div className="font-black text-slate-900 text-sm">428,900</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-slate-500 text-[10px]">Province Coverage</div>
                    <div className="font-black text-emerald-700 text-sm">25 / 25 Provinces</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Controls national emergency broadcasts, API rate-limit policies, curriculum revision freezes, and university verification approvals.
                </p>
              </div>

              {/* Portal 2: University Portal */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>University Partner & Admissions Portal</span>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">48 Universities</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-slate-500 text-[10px]">Pending Applicants</div>
                    <div className="font-black text-slate-900 text-sm">1,240 Students</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-slate-500 text-[10px]">Scholarships Live</div>
                    <div className="font-black text-blue-700 text-sm">124 Programs</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Empowers CADT, ITC, RUPP, and AUPP admission officers to review candidate profiles, verify Bac II transcripts, and disburse grants.
                </p>
              </div>

              {/* Portal 3: Teacher Portal */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Teacher Cohort & Classroom Portal</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">840 Schools</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-slate-500 text-[10px]">Active STEM Classes</div>
                    <div className="font-black text-slate-900 text-sm">2,410 Cohorts</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-slate-500 text-[10px]">ZPD Misconceptions</div>
                    <div className="font-black text-amber-700 text-sm">142 Flagged</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Live classroom dashboard tracking individual student struggle areas with 1-click generation of differentiated homework.
                </p>
              </div>

              {/* Portal 4: Research Portal */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span>MoEYS Policy & Learning Science Portal</span>
                  </div>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">IRB Verified</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-slate-500 text-[10px]">A/B Trials Live</div>
                    <div className="font-black text-slate-900 text-sm">8 Studies</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-slate-500 text-[10px]">Anonymized Logs</div>
                    <div className="font-black text-purple-700 text-sm">1.4M Events</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Empirical educational research workbench generating policy papers on normalized learning gains across rural and urban Cambodian schools.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: NOTIFICATION SYSTEM
         ========================================================================= */}
      {activeSubTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <span>Multi-Channel Push Notification & Engagement Pipeline</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Dispatch high-priority push notifications across Apple Push Notification Service (APNs), Google Firebase Cloud Messaging (FCM), and SMS fallback.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Notification Dispatch Form */}
              <div className="lg:col-span-6 space-y-3 text-xs">
                <span className="font-bold text-slate-900 block">Notification Configuration</span>

                <div>
                  <label className="text-slate-600 block mb-1">Notification Category</label>
                  <select
                    value={notifType}
                    onChange={(e) => {
                      setNotifType(e.target.value);
                      if (e.target.value === 'scholarship_deadline') {
                        setNotifTitle('🚨 MPTC Scholarship Deadline: 48 Hours Remaining!');
                        setNotifMessage('Complete your digital portfolio and Bac II transcripts now to secure 100% full tuition.');
                      } else if (e.target.value === 'ai_recommendation') {
                        setNotifTitle('💡 Socratic AI: New Calculus Scaffold Ready');
                        setNotifMessage('Based on your trial results, we prepared a 3-step visualization for Integration by Parts.');
                      } else if (e.target.value === 'learning_reminder') {
                        setNotifTitle('🔥 Keep Your 12-Day STEM Streak Alive!');
                        setNotifMessage('Spend 10 minutes solving today\'s PhET circuit puzzle to earn 150 Avatar points.');
                      } else if (e.target.value === 'achievement') {
                        setNotifTitle('🏆 Bac II Mastery Badge Unlocked!');
                        setNotifMessage('Congratulations! You placed in the top 5% of Cambodian students in High School Calculus.');
                      }
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="scholarship_deadline">Scholarship Deadline Alert</option>
                    <option value="ai_recommendation">AI Socratic Recommendation</option>
                    <option value="learning_reminder">Daily Learning & Streak Reminder</option>
                    <option value="achievement">Achievement & Avatar Quest Reward</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1">Target Audience</label>
                  <select
                    value={notifTargetRole}
                    onChange={(e) => setNotifTargetRole(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="student">All Students (428k active)</option>
                    <option value="parent">All Parents / Guardians (184k active)</option>
                    <option value="teacher">High School STEM Teachers (14k active)</option>
                    <option value="mentor">Verified Mentors</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1">Notification Title</label>
                  <input
                    type="text"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-600 block mb-1">Message Body</label>
                  <textarea
                    rows={2}
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>

                <button
                  onClick={handleDispatchNotification}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Push Notification</span>
                </button>
              </div>

              {/* Live Dispatch Log */}
              <div className="lg:col-span-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-900 block mb-2">
                  Dispatched Push History & Device Payload Simulation
                </span>

                <div className="space-y-2 max-h-[320px] overflow-y-auto">
                  {dispatchedNotifs.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      No notifications dispatched yet. Configure and click "Dispatch Push Notification".
                    </div>
                  ) : (
                    dispatchedNotifs.map((n) => (
                      <div key={n.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                            APNs + FCM ✓
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{n.message}</p>
                        <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          <span>Target: {n.targetRole}</span>
                          <span>Delivered: {n.deliveredCount} devices</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: APM OBSERVABILITY & SRE MONITORING
         ========================================================================= */}
      {activeSubTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <span>Real-Time SRE Observability & Performance Monitoring (APM)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Track real-time p50, p95, and p99 latencies, error budget consumption, Redis cache hit ratios, and database connection pool saturation.
            </p>

            {monitoringMetrics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Throughput</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{monitoringMetrics.rps.toLocaleString()} RPS</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1">Normal Ingress Rate</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">P99 Latency</div>
                  <div className="text-xl font-black text-indigo-600 mt-0.5">{monitoringMetrics.p99LatencyMs} ms</div>
                  <div className="text-[10px] text-slate-500 mt-1">P50: {monitoringMetrics.p50LatencyMs}ms | P95: {monitoringMetrics.p95LatencyMs}ms</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Error Budget</div>
                  <div className="text-xl font-black text-emerald-700 mt-0.5">{monitoringMetrics.errorBudgetRemainingPercent}%</div>
                  <div className="text-[10px] text-emerald-600 mt-1">Burn Rate: 0.012% (Safe)</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Redis Cache Hit Ratio</div>
                  <div className="text-xl font-black text-purple-700 mt-0.5">{monitoringMetrics.redisHitRatio}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Pool: {monitoringMetrics.databaseConnectionPoolUtilization} used</div>
                </div>
              </div>
            )}

            {/* Error Tracking / Sentry Circuit Breaker Log */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-900 block mb-3">
                Circuit Breaker & Fallback Incident Timeline
              </span>
              <div className="space-y-2 text-xs font-mono">
                <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-2.5 rounded-lg flex items-center justify-between">
                  <span>[CIRCUIT_BREAKER] All 8 microservices report CLOSED state (0 errors in last 10,000 requests).</span>
                  <span className="text-[10px] text-emerald-700 font-bold">100% HEALTHY</span>
                </div>
                <div className="bg-slate-50 text-slate-700 border border-slate-200 p-2.5 rounded-lg flex items-center justify-between">
                  <span>[AI_FALLBACK] Gemini 3.1 Flash Lite active with 3.8 Flash secondary failover route configured.</span>
                  <span className="text-[10px] text-slate-500">READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: APP STORE & PLAY STORE RELEASE HUB
         ========================================================================= */}
      {activeSubTab === 'appstore' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <AppWindow className="w-5 h-5 text-indigo-600" />
              <span>Apple App Store & Google Play Store Production Release Hub</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Production deployment checklist, Privacy Manifest disclosures, COPPA compliance self-declarations, and automated fastlane CI/CD distribution.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* iOS App Store Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>Apple iOS App Store Checklist</span>
                  </span>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">iOS 18+</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2 bg-white p-2 rounded border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">PrivacyInfo.xcprivacy Manifest</div>
                      <div className="text-[11px] text-slate-500">Declared zero cross-app tracking. User identification restricted to verified student accounts.</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 bg-white p-2 rounded border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">App Store Review Guideline 1.2 & 5.1.1 (Kids Category)</div>
                      <div className="text-[11px] text-slate-500">Parental Gate implemented before external links. Zero behavioral advertising.</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 bg-white p-2 rounded border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">Account Deletion Self-Service</div>
                      <div className="text-[11px] text-slate-500">Instant in-app account & telemetry erasure flow compliant with GDPR-K and Apple requirements.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Android Google Play Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Google Play Store Data Safety Checklist</span>
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">targetSdk 35</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2 bg-white p-2 rounded border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">Data Safety Section Declarations</div>
                      <div className="text-[11px] text-slate-500">Disclosed collection of name, grade level, and educational progress. All data encrypted in transit (TLS 1.3).</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 bg-white p-2 rounded border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">Google Play Families Policy Compliance</div>
                      <div className="text-[11px] text-slate-500">Certified for students ages 13+. Neutral age gate on registration.</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 bg-white p-2 rounded border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">Android App Bundle (AAB) & Proguard</div>
                      <div className="text-[11px] text-slate-500">Compressed package size (&lt;24MB download) optimized for rural Cambodian 3G/4G connectivity.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fastlane CI/CD Automation Box */}
            <div className="mt-6 pt-6 border-t border-slate-200 bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs">
              <div className="text-indigo-400 font-bold mb-1"># Automated Fastlane Deployment Command</div>
              <div className="text-emerald-400">bundle exec fastlane deploy_cambodia_staged_rollout</div>
              <div className="text-slate-400 mt-1">
                // Builds AAB & IPA, runs automated UI tests, submits to TestFlight & Google Play Internal Track, increments version to 2.1.0
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 9: SUSTAINABLE BUSINESS ECOSYSTEM & STRATEGY
         ========================================================================= */}
      {activeSubTab === 'business' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>CDES Sustainable Business Ecosystem & Multi-Sided Value Exchange</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Long-term financial sustainability model for Cambodia Digital Education Society, balancing 100% free national student access with enterprise B2B, B2G, and institutional monetization.
                </p>
              </div>
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Landmark className="w-4 h-4 text-emerald-600" />
                <span>Multi-Sided Platform Model (B2C Free / B2B & B2G Monetized)</span>
              </div>
            </div>

            {/* Interactive Unit Economics & Revenue Projection Simulator */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 mb-8 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive Unit Economics & Financial Scale Simulator
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Real-time cloud + operational margin modeling
                </span>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1">
                    <span>Active Student Cohort:</span>
                    <span className="text-emerald-400 font-bold">{simulatedStudentScale.toLocaleString()} Students</span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={250000}
                    step={5000}
                    value={simulatedStudentScale}
                    onChange={(e) => setSimulatedStudentScale(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>5k (Pilot)</span>
                    <span>50k (Phase 1)</span>
                    <span>250k (National)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1">
                    <span>Partner Universities:</span>
                    <span className="text-indigo-400 font-bold">{simulatedUnivPartners} Universities</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={48}
                    step={2}
                    value={simulatedUnivPartners}
                    onChange={(e) => setSimulatedUnivPartners(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>4 Flagship</span>
                    <span>24 Mid-tier</span>
                    <span>48 All Cambodia</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1">
                    <span>School STEM SaaS Licenses:</span>
                    <span className="text-blue-400 font-bold">{simulatedSchoolLicenses} High Schools</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={300}
                    step={10}
                    value={simulatedSchoolLicenses}
                    onChange={(e) => setSimulatedSchoolLicenses(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>10 Pilot</span>
                    <span>100 Provincial</span>
                    <span>300 National</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Financial Outputs */}
              {(() => {
                const infraCostAnnual = Math.round(simulatedStudentScale * 0.18);
                const univRevenueAnnual = simulatedUnivPartners * 4800;
                const schoolRevenueAnnual = simulatedSchoolLicenses * 1200;
                const b2bEmployerSponsorship = Math.round((simulatedStudentScale / 10000) * 8000);
                const totalRevenue = univRevenueAnnual + schoolRevenueAnnual + b2bEmployerSponsorship;
                const netOperating = totalRevenue - infraCostAnnual;
                const grossMarginPercent = totalRevenue > 0 ? Math.round((netOperating / totalRevenue) * 100) : 0;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs">
                    <div className="border-r border-slate-800 pr-2">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Total Annual Revenue</div>
                      <div className="text-lg font-black text-emerald-400 mt-0.5">
                        ${totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        B2B Univ (${univRevenueAnnual.toLocaleString()}) + Schools (${schoolRevenueAnnual.toLocaleString()}) + B2B Talent (${b2bEmployerSponsorship.toLocaleString()})
                      </div>
                    </div>

                    <div className="border-r border-slate-800 pr-2">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Annual Cloud & AI Cost</div>
                      <div className="text-lg font-black text-amber-400 mt-0.5">
                        ${infraCostAnnual.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        $0.18/student/yr (GKE, Redis, Gemini cache)
                      </div>
                    </div>

                    <div className="border-r border-slate-800 pr-2">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Gross Operational Profit</div>
                      <div className="text-lg font-black text-indigo-300 mt-0.5">
                        ${netOperating.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Funds curriculum R&D and rural bursaries
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Platform Gross Margin</div>
                      <div className="text-lg font-black text-emerald-300 mt-0.5">
                        {grossMarginPercent}%
                      </div>
                      <div className="text-[10px] text-emerald-500 mt-0.5 font-semibold">
                        SaaS-Class Operational Efficiency
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 7 Stakeholder Value-Exchange Matrix */}
            <div className="mb-8">
              <span className="text-xs font-bold text-slate-900 block mb-3 uppercase tracking-wider">
                Comprehensive Stakeholder Analysis & Value Exchange (7 Dimensions)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* 1. Students */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span>1. High School Students</span>
                    </span>
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      100% Free
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <div><strong>Pain:</strong> Career uncertainty, opaque university fees, missed scholarships.</div>
                    <div><strong>Value:</strong> Personalized Bac II roadmaps, AI guidance, verified scholarships.</div>
                    <div><strong>GTM Strategy:</strong> High school clubs, peer referral avatar quests, Telegram bot.</div>
                    <div><strong>Revenue:</strong> $0 direct fee (ensuring universal rural Cambodian equity).</div>
                  </div>
                </div>

                {/* 2. Parents */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>2. Parents & Guardians</span>
                    </span>
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Freemium
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <div><strong>Pain:</strong> Fear of wasted tuition, lack of progress visibility, safety concerns.</div>
                    <div><strong>Value:</strong> Weekly learning digests, dual-key consent, verified ROI reports.</div>
                    <div><strong>GTM Strategy:</strong> Parent-Teacher Association (PTA) workshops & SMS invites.</div>
                    <div><strong>Revenue:</strong> Optional $2.99/mo premium family counseling & 1-on-1 advisor slots.</div>
                  </div>
                </div>

                {/* 3. High Schools */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>3. High Schools (Public/Private)</span>
                    </span>
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      B2B SaaS
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <div><strong>Pain:</strong> High student-to-counselor ratio (1:800), lack of STEM tools.</div>
                    <div><strong>Value:</strong> Cohort BKT mastery heatmaps, automated homework differentiation.</div>
                    <div><strong>GTM Strategy:</strong> MoEYS-endorsed pilot across 15 flagship provincial high schools.</div>
                    <div><strong>Revenue:</strong> $800 – $2,500/yr school subscription for classroom management tier.</div>
                  </div>
                </div>

                {/* 4. Universities */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      <span>4. Universities & Colleges</span>
                    </span>
                    <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      B2B Enterprise
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <div><strong>Pain:</strong> High student dropouts due to mismatched majors; high marketing CAC ($80–$150/lead).</div>
                    <div><strong>Value:</strong> Direct matching with pre-qualified Bac II candidates; verified profile review.</div>
                    <div><strong>GTM Strategy:</strong> Direct partnerships with CADT, ITC, RUPP, Paragon, AUPP.</div>
                    <div><strong>Revenue:</strong> $4,800/yr verified admissions SaaS + $120 per successfully matriculated scholarship candidate.</div>
                  </div>
                </div>

                {/* 5. Companies & Employers */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <Briefcase className="w-4 h-4 text-amber-600" />
                      <span>5. Companies & Tech Employers</span>
                    </span>
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      B2B Talent Sourcing
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <div><strong>Pain:</strong> Acute shortage of qualified STEM & digital talent in Cambodia.</div>
                    <div><strong>Value:</strong> Early talent pipeline from Grade 12; branded STEM challenges & scholarships.</div>
                    <div><strong>GTM Strategy:</strong> Smart Axiata, Wing Bank, ABA, Cellcard corporate CSR & tech hiring teams.</div>
                    <div><strong>Revenue:</strong> $5,000 – $15,000/yr corporate scholarship hosting & talent recruitment pipeline.</div>
                  </div>
                </div>

                {/* 6. Government (MoEYS / MPTC) */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <Landmark className="w-4 h-4 text-red-600" />
                      <span>6. Government & Ministries</span>
                    </span>
                    <span className="text-[9px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                      B2G Partnership
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <div><strong>Pain:</strong> Disparity between rural & urban STEM outcomes; slow paper surveys.</div>
                    <div><strong>Value:</strong> Real-time national learning intelligence, digital economy KPI fulfillment.</div>
                    <div><strong>GTM Strategy:</strong> MoEYS Center for Digital Education alignment & MPTC CBRD grant.</div>
                    <div><strong>Revenue:</strong> Annual public grant subsidies & national research analytics contracts.</div>
                  </div>
                </div>

                {/* 7. NGOs & Development Partners */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 md:col-span-2 lg:col-span-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <HeartHandshake className="w-4 h-4 text-emerald-600" />
                      <span>7. NGOs & International Development Partners (USAID, JICA, UNESCO, ADB)</span>
                    </span>
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Impact Grants & Research
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600 text-[11px] pt-1">
                    <div><strong>Pain:</strong> Difficulty measuring direct impact of educational funding in rural areas.</div>
                    <div><strong>Value:</strong> Transparent, verifiable digital logs of student scholarship uptake and STEM mastery gains.</div>
                    <div><strong>Revenue Potential:</strong> $50,000 – $200,000 program grants for targeted girls-in-STEM and rural student access programs.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Three-Horizon Revenue Roadmap */}
            <div className="border-t border-slate-200 pt-6 mb-8">
              <span className="text-xs font-bold text-slate-900 block mb-3 uppercase tracking-wider">
                Three-Horizon Monetization & Ecosystem Expansion Roadmap
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Horizon 1: Launch & Validation</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Months 1–6</span>
                  </div>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <div>• <strong>Primary Revenue:</strong> University Partner Verification Subscriptions (CADT, ITC, RUPP).</div>
                    <div>• <strong>Secondary:</strong> MPTC / MoEYS innovation pilot grant funding.</div>
                    <div>• <strong>Target ARR:</strong> $45,000 (covers baseline server & developer costs).</div>
                    <div>• <strong>Student Price:</strong> $0 (100% Free Core access).</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Horizon 2: B2B Expansion & Schools</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Months 6–18</span>
                  </div>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <div>• <strong>Primary Revenue:</strong> High School STEM Lab & BKT Analytics SaaS licenses ($1,200/school/yr).</div>
                    <div>• <strong>Secondary:</strong> Corporate scholarship sponsorship (Smart, ABA Bank, Wing).</div>
                    <div>• <strong>Target ARR:</strong> $180,000 – $320,000.</div>
                    <div>• <strong>Breakeven:</strong> Achieved at 12 partner universities + 40 licensed schools.</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Horizon 3: National Education Marketplace</span>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Months 18–36</span>
                  </div>
                  <div className="text-slate-600 text-[11px] space-y-1">
                    <div>• <strong>Primary Revenue:</strong> Tech Employer Talent Sourcing & University Enrollment Matching Fees.</div>
                    <div>• <strong>Secondary:</strong> Anonymized Learning Science Research Data APIs for international research.</div>
                    <div>• <strong>Target ARR:</strong> $650,000 – $1,200,000+.</div>
                    <div>• <strong>Net Margin:</strong> 65%+ reinvested into national education endowments.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitive Moat & Positioning Canvas */}
            <div className="border-t border-slate-200 pt-6">
              <span className="text-xs font-bold text-slate-900 block mb-3 uppercase tracking-wider">
                Defensible Moats & Strategic Competitive Matrix
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-2.5 px-3">Dimension</th>
                      <th className="py-2.5 px-3">Static Scholarship Blogs</th>
                      <th className="py-2.5 px-3">Generic LMS / Videos</th>
                      <th className="py-2.5 px-3">General Job Portals</th>
                      <th className="py-2.5 px-3 text-indigo-700 bg-indigo-50/50">CDES Student Future Navigator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">Personalization</td>
                      <td className="py-2.5 px-3 text-slate-500">None (Static lists)</td>
                      <td className="py-2.5 px-3 text-slate-500">Course completion only</td>
                      <td className="py-2.5 px-3 text-slate-500">Keyword search</td>
                      <td className="py-2.5 px-3 font-bold text-indigo-700 bg-indigo-50/50">5-Pillar Student Identity + Bayesian Mastery</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">Local Grounding</td>
                      <td className="py-2.5 px-3 text-slate-500">Generic overseas links</td>
                      <td className="py-2.5 px-3 text-slate-500">Translated foreign curricula</td>
                      <td className="py-2.5 px-3 text-slate-500">Adult jobs only</td>
                      <td className="py-2.5 px-3 font-bold text-indigo-700 bg-indigo-50/50">48 Cambodian Universities + MoEYS Bac II Syllabi</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">AI Socratic Guidance</td>
                      <td className="py-2.5 px-3 text-slate-500">None</td>
                      <td className="py-2.5 px-3 text-slate-500">Generic ChatGPT wrapper</td>
                      <td className="py-2.5 px-3 text-slate-500">Basic search bar</td>
                      <td className="py-2.5 px-3 font-bold text-indigo-700 bg-indigo-50/50">RAG Grounded in 128 Cambodian Education Vectors</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">Child Safety & Ethics</td>
                      <td className="py-2.5 px-3 text-slate-500">Unmoderated ads</td>
                      <td className="py-2.5 px-3 text-slate-500">Standard privacy terms</td>
                      <td className="py-2.5 px-3 text-slate-500">Not designed for minors</td>
                      <td className="py-2.5 px-3 font-bold text-indigo-700 bg-indigo-50/50">COPPA/GDPR-K + Dual-Key Parental SMS Sentinel</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">Offline Resilience</td>
                      <td className="py-2.5 px-3 text-slate-500">Requires 4G web browser</td>
                      <td className="py-2.5 px-3 text-slate-500">Heavy video streaming</td>
                      <td className="py-2.5 px-3 text-slate-500">Online only</td>
                      <td className="py-2.5 px-3 font-bold text-indigo-700 bg-indigo-50/50">Local SQLite / IndexedDB Mutation Reconciler</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 10: KNOWLEDGE SUPPLY CHAIN & CKO ECOSYSTEM HUB  */}
      {/* ======================================================== */}
      {activeSubTab === 'knowledge' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-teal-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-teal-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Brain className="w-4 h-4 text-teal-300" />
                  <span>Chief Knowledge Officer & Content Architecture Blueprint</span>
                  <span className="bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded text-[10px]">Phase 10 Core</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  CDES Knowledge Supply Chain & Ecosystem Platform
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  CDES is not merely a content library—it is a decentralized, verified knowledge ecosystem where accredited universities, senior high school teachers, tech leaders, educational psychologists, and AI co-produce authoritative, verified learning intelligence for Cambodian youth.
                </p>
              </div>

              <div className="flex items-center space-x-2 self-start md:self-auto">
                <button
                  onClick={() => fetchKnowledge()}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-teal-600/30 hover:bg-teal-600/50 border border-teal-400/40 rounded-lg text-xs font-semibold text-teal-200 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Supply Chain</span>
                </button>
              </div>
            </div>

            {/* Top KPI Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-teal-500/20">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[11px] text-teal-300 font-medium">Verified Knowledge Articles</div>
                <div className="text-xl font-extrabold text-white mt-0.5">
                  {knowledgeData?.summary?.totalArticles ?? 663}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-1">
                  <CheckCheck className="w-3 h-3 text-emerald-400" />
                  <span>100% MoEYS / Faculty Audited</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[11px] text-teal-300 font-medium">Average Trust Score</div>
                <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                  {knowledgeData?.summary?.avgTrustScore ?? 97.4}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">4-Factor Cryptographic Audit</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[11px] text-teal-300 font-medium">AI RAG Vector Index</div>
                <div className="text-xl font-extrabold text-indigo-300 mt-0.5">
                  {knowledgeData?.summary?.totalRAGIndexed ?? 128} Vectors
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">text-embedding-004 (768-dim)</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[11px] text-teal-300 font-medium">Contributing Institutions</div>
                <div className="text-xl font-extrabold text-amber-300 mt-0.5">48 Universities + 60 Schools</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Decentralized Creator Network</div>
              </div>
            </div>
          </div>

          {/* Section 1: The 6-Stage Knowledge Supply Chain Pipeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Workflow className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  The End-to-End Knowledge Supply Chain Lifecycle
                </h3>
              </div>
              <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-semibold border border-teal-200">
                Supply Chain SLA: &lt; 72 Hours Ingestion-to-Vector
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {[
                {
                  step: '01. Creation',
                  owner: 'Universities / Teachers / Industry',
                  desc: 'Structured authoring in Creator Portal with Bloom taxonomy & BKT mapping.',
                  badge: 'Standard Markdown',
                  color: 'border-blue-200 bg-blue-50/50 text-blue-900'
                },
                {
                  step: '02. Submission',
                  owner: 'Decentralized Contributors',
                  desc: 'Automated syntax, link provenance, and child safety heuristic scan.',
                  badge: 'Pre-flight Scanner',
                  color: 'border-indigo-200 bg-indigo-50/50 text-indigo-900'
                },
                {
                  step: '03. Verification',
                  owner: 'CKO Editorial Council',
                  desc: '3-way blind review: pedagogical rigor, factual truth, child safety.',
                  badge: 'Multi-Tier Audit',
                  color: 'border-amber-200 bg-amber-50/50 text-amber-900'
                },
                {
                  step: '04. Vectorization',
                  owner: 'AI Knowledge Pipeline',
                  desc: 'Semantic chunking, Gemini embedding, upsert into Qdrant vector cluster.',
                  badge: 'RAG Grounding',
                  color: 'border-purple-200 bg-purple-50/50 text-purple-900'
                },
                {
                  step: '05. Publishing',
                  owner: 'Student Future Navigator',
                  desc: 'Immediate dispatch to web/mobile PWAs, AI Advisor, and STEM labs.',
                  badge: 'High Availability',
                  color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                },
                {
                  step: '06. Analytics Loop',
                  owner: 'BKT Telemetry & Students',
                  desc: 'Student helpfulness votes + Bayesian mastery feedback drive content revision.',
                  badge: 'Closed-Loop CI/CD',
                  color: 'border-teal-200 bg-teal-50/50 text-teal-900'
                }
              ].map((stage, idx) => (
                <div key={idx} className={`p-3.5 rounded-lg border flex flex-col justify-between ${stage.color}`}>
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span>{stage.step}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 font-mono">
                        {stage.badge}
                      </span>
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 mt-1">{stage.owner}</div>
                    <p className="text-[11px] text-slate-700 mt-2 leading-tight">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: 5 Content Architecture Domains Interactive Explorer */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>The 5 Core Content Architecture Domains</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Filter and examine live verified knowledge assets mapped to Cambodian high school and career pathways.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All Domains' },
                  { id: 'cat_decision', label: '1. Education Decisions' },
                  { id: 'cat_learning', label: '2. STEM & Bac II' },
                  { id: 'cat_psychology', label: '3. Cognitive Psychology' },
                  { id: 'cat_career', label: '4. Career Pathways' },
                  { id: 'cat_professional', label: '5. Professional Skills' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategoryFilter === cat.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles List Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Title & Cambodian Topic</th>
                    <th className="py-2.5 px-3">Domain Category</th>
                    <th className="py-2.5 px-3">Author & Affiliation</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Trust Score</th>
                    <th className="py-2.5 px-3 text-center">Vector RAG</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {knowledgeContents
                    .filter(
                      (c) =>
                        selectedCategoryFilter === 'all' ||
                        c.categoryId === selectedCategoryFilter
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-bold text-slate-900 line-clamp-1">{item.titleEn}</div>
                          <div className="text-[11px] text-slate-500 font-khmer line-clamp-1">{item.titleKm}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                              v{item.version}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {item.viewCount?.toLocaleString()} views • {item.helpfulVotes} helpful
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {item.contentType.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{item.authorId.replace('auth_', '').replace('_', ' ')}</div>
                          <div className="text-[10px] text-slate-400">Institutional Provenance Verified</div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : item.status === 'under_review'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center space-x-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <span>{item.trustScore}%</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {item.vectorIndexedAt ? (
                            <span className="inline-flex items-center space-x-1 text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                              <Sparkles className="w-3 h-3 text-indigo-500" />
                              <span>Indexed</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Pending</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleTriggerRagSync(item.id)}
                            disabled={isSyncingRag}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 rounded text-[11px] font-semibold transition-all"
                          >
                            Sync Vector
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {ragSyncResult && (
              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-800 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>{ragSyncResult}</span>
              </div>
            )}
          </div>

          {/* Section 3: Live Content Review & Verification System (CKO Council Console) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Content Review System & Verification Console
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Dual-Auditor Standard
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Execute formal editorial reviews. Approving an item automatically binds its cryptographic audit hash, updates the trust score, and indexes it into the Gemini AI RAG knowledge vector store.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Target Submission for Audit:
                  </label>
                  <select
                    value={selectedReviewContentId}
                    onChange={(e) => setSelectedReviewContentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-indigo-500"
                  >
                    {knowledgeContents.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.status.toUpperCase()}] {c.titleEn} (Current Trust: {c.trustScore}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Score Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Factual Accuracy</span>
                      <span className="text-indigo-600 font-bold">{factualScore}%</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={100}
                      value={factualScore}
                      onChange={(e) => setFactualScore(Number(e.target.value))}
                      className="w-full accent-indigo-600 h-1.5"
                    />
                    <div className="text-[10px] text-slate-400 mt-1">Cross-checked with MoEYS syllabi</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Pedagogical Rigor</span>
                      <span className="text-indigo-600 font-bold">{pedagogicalScore}%</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={100}
                      value={pedagogicalScore}
                      onChange={(e) => setPedagogicalScore(Number(e.target.value))}
                      className="w-full accent-indigo-600 h-1.5"
                    />
                    <div className="text-[10px] text-slate-400 mt-1">Bloom taxonomy & ZPD depth</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Child Safety & Ethics</span>
                      <span className="text-emerald-600 font-bold">{childSafetyScore}%</span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={100}
                      value={childSafetyScore}
                      onChange={(e) => setChildSafetyScore(Number(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5"
                    />
                    <div className="text-[10px] text-slate-400 mt-1">COPPA/GDPR-K compliance</div>
                  </div>
                </div>

                {/* Decision Radio */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Audit Decision:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'approved', label: 'Approve & Publish', desc: 'Auto-vectorize into RAG', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                      { id: 'revision_requested', label: 'Request Revision', desc: 'Send feedback to author', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                      { id: 'rejected', label: 'Reject / Archive', desc: 'Fails quality threshold', color: 'border-red-500 bg-red-50 text-red-800' },
                    ].map((dec) => (
                      <button
                        key={dec.id}
                        type="button"
                        onClick={() => setReviewerDecision(dec.id as any)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          reviewerDecision === dec.id
                            ? `${dec.color} font-bold shadow-xs`
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs">{dec.label}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">{dec.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleVerifySubmission}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Execute Verification Audit & Recalculate Trust Score</span>
                </button>

                {reviewAuditFeedback && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                    {reviewAuditFeedback}
                  </div>
                )}
              </div>
            </div>

            {/* Trust Score Mathematical Formula & Weight Breakdown */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-5 text-white border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Trust Score Mathematical Formula</span>
                </div>
                <h4 className="text-base font-bold text-white">4-Factor Cryptographic Trust Index</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Every knowledge item in CDES receives a continuous trust score governed by a deterministic weighting model to prevent misinformation.
                </p>

                <div className="mt-4 bg-white/10 p-3 rounded-lg font-mono text-[11px] text-teal-200 border border-teal-500/30">
                  TrustScore = (0.35 × SourceTier) + (0.35 × AuditorAccuracy) + (0.15 × StudentHelpfulness) + (0.15 × AuthorReputation)
                </div>

                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-slate-300">1. Source Reliability (35%)</span>
                    <span className="text-teal-300 font-bold">Tier 1 = 100 | Tier 2 = 92</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-slate-300">2. Auditor Accuracy (35%)</span>
                    <span className="text-teal-300 font-bold">Double-blind Faculty Peer Review</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-slate-300">3. Student Helpfulness (15%)</span>
                    <span className="text-teal-300 font-bold">Post-Learning Clarity Rating</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-slate-300">4. Author Reputation (15%)</span>
                    <span className="text-teal-300 font-bold">Historical Track Record (0-100)</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 text-[11px] text-slate-400">
                Threshold for AI RAG ground retrieval: <strong className="text-emerald-400 font-bold">&ge; 85.0% Trust Score</strong>. Content below 75% is automatically removed from the Socratic bot vector index.
              </div>
            </div>
          </div>

          {/* Section 4: Partnership Strategy & Creator Ecosystem Revenue Sharing */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Share2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Partnership Content Strategy & Revenue-Sharing Models
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                {
                  partner: '1. Universities',
                  onboarding: 'MOU with Academic Affairs & Admission Office',
                  contribution: 'Verified admission matrices, scholarship exams, foundation year syllabi',
                  incentive: 'Direct qualified Bac II candidate recruitment leads + 80% rev share on verified micro-courses'
                },
                {
                  partner: '2. High Schools',
                  onboarding: 'MoEYS Department of General Education alignment',
                  contribution: 'Bac II practice papers, exam grading rubrics, provincial school tests',
                  incentive: 'Free institutional analytics dashboard + school reputation recognition'
                },
                {
                  partner: '3. Master Teachers',
                  onboarding: 'Verified teacher credentialing & Bac II Grade A track record',
                  contribution: 'Interactive STEM exercises, Socratic hint scripts, video micro-lessons',
                  incentive: '70% creator revenue share on premium question banks + national Master Mentor badge'
                },
                {
                  partner: '4. Tech Companies',
                  onboarding: 'Corporate CSR & Tech Talent Acquisition partnership',
                  contribution: 'Industry roadmaps (Cloud, AI, Fintech, Cyber), real-world coding challenges',
                  incentive: 'Direct access to top 5% Grade 12 STEM talent + branded recruitment hackathons'
                },
                {
                  partner: '5. Researchers',
                  onboarding: 'Academic Research Affiliation (CADT, RUPP, International)',
                  contribution: 'Learning science studies, cognitive load telemetry analysis',
                  incentive: 'Access to anonymized national BKT mastery datasets + publication co-authorship'
                }
              ].map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-xs text-indigo-700">{p.partner}</div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-1">Onboarding Process:</div>
                    <p className="text-[11px] text-slate-600 leading-snug">{p.onboarding}</p>

                    <div className="text-[10px] text-slate-500 font-semibold mt-2">Knowledge Delivered:</div>
                    <p className="text-[11px] text-slate-700 leading-snug">{p.contribution}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <span className="text-[9px] font-bold uppercase text-emerald-700 block">Monetization / Perk:</span>
                    <p className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5">{p.incentive}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Launch Content Priority Matrix (Day 1 vs Deferred) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-3 flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Launch Content Priority: Day 1 Must-Haves vs. Deferred Horizons</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs uppercase tracking-wider mb-2">
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  <span>Day 1 Mandatory Launch Assets (Pre-Seeded & Verified)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Top 48 Cambodian Universities</strong>: Verified entrance matrix, tuition fees, faculty accreditation, and campus locations.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Top 25 National Scholarships</strong>: CADT Techo Digital, MPTC CBRD, Chevening, Fulbright, and MoEYS national quotas with real deadlines.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Bac II STEM Core Curriculum</strong>: Grade 12 Advanced Calculus (limits, derivatives, integrals) & Physics (electromagnetism, optics).</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Cognitive Stress Management</strong>: Khmer-language exam anxiety reframing and 4-cycle spaced repetition schedule.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>128 Vector RAG Seed Embeddings</strong>: Pre-embedded in Gemini text-embedding-004 for immediate zero-hallucination student advice.</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-2">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <span>Deferred to Horizon 2 & 3 (Expansion After Critical Mass)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-slate-400 font-bold">•</span>
                    <span><strong>Primary & Lower Secondary (Grades 1–9)</strong>: Focus remains strictly on Grades 10–12 until Bac II student market is captured.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-slate-400 font-bold">•</span>
                    <span><strong>Heavy 3D WebGL / VR Virtual Labs</strong>: High bandwidth requirement impedes rural 3G/4G smartphone accessibility.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-slate-400 font-bold">•</span>
                    <span><strong>Adult Career Pivot Modules</strong>: Kept secondary until university student center transitions in Year 2.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-slate-400 font-bold">•</span>
                    <span><strong>Full Video Lecture Streaming</strong>: Text, markdown, interactive equations, and lightweight vector graphics prioritize low data usage.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

