import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Building2,
  GraduationCap,
  Award,
  BookOpen,
  Layers,
  DollarSign,
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ImageIcon,
  Sparkles,
  Globe,
  MapPin,
  Clock,
  ShieldCheck,
  Calculator,
  Check,
  Compass,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  Info,
  HardDrive,
  Upload,
} from 'lucide-react';
import { ComprehensiveUniversityProfile, UniversityGalleryImage } from '../types';
import { DataConfidenceBadge } from './DataConfidenceBadge';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { UniversityDataChecklistView, BlankBadge } from './UniversityDataChecklistView';
import { getSafeHttpUrl } from '../utils/safeUrl';
const GoogleDriveHubModal = lazy(() =>
  import('./GoogleDriveHubModal').then((m) => ({ default: m.GoogleDriveHubModal }))
);

interface UniversityDossierModalProps {
  university: ComprehensiveUniversityProfile | null;
  allUniversities: ComprehensiveUniversityProfile[];
  onClose: () => void;
  onSelectUniversity: (u: ComprehensiveUniversityProfile) => void;
  onOpenROI: (univId: string) => void;
  onAskAdvisor?: (prompt: string) => void;
}

type TabType =
  | 'checklist'
  | 'basic-info'
  | 'faculties'
  | 'majors'
  | 'courses'
  | 'tuition'
  | 'scholarships'
  | 'admissions'
  | 'facilities'
  | 'accreditation'
  | 'reputation'
  | 'careers'
  | 'photos'
  | 'fit';

export const UniversityDossierModal: React.FC<UniversityDossierModalProps> = ({
  university,
  allUniversities,
  onClose,
  onSelectUniversity,
  onOpenROI,
  onAskAdvisor,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('checklist');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedMajorIndex, setSelectedMajorIndex] = useState(0);
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState<string>('all');
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [customPhotos, setCustomPhotos] = useState<{ [univId: string]: string[] }>({});
  const [directPhotoUrl, setDirectPhotoUrl] = useState('');

  const navScroll = useDraggableScroll<HTMLDivElement>();
  const univSelectorScroll = useDraggableScroll<HTMLDivElement>();

  // Reset indices when university changes
  useEffect(() => {
    setActivePhotoIndex(0);
    setSelectedMajorIndex(0);
  }, [university?.id]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!university) return null;

  // Build photo gallery fallback if gallery array is empty
  const galleryItems: UniversityGalleryImage[] =
    university.gallery && university.gallery.length > 0
      ? university.gallery
      : [
          {
            url: university.coverImage,
            caption: `${university.abbr} Main Campus Facility & Academic Complex`,
            category: 'Campus & Architecture',
          },
          ...(university.photos?.map((p, idx) => ({
            url: p,
            caption: `${university.abbr} Campus Facility ${idx + 1}`,
            category: 'Labs & Tech Centers' as const,
          })) || []),
        ];

  const filteredGallery =
    selectedPhotoCategory === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedPhotoCategory);

  const currentMajor = university.majors[selectedMajorIndex] || university.majors[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-gray-200 my-4 sm:my-8 text-left max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* 1. TOP STICKY UNIVERSITY SWITCHER & CLOSE HEADER */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          {/* Quick University Rectangle Switcher */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 hidden md:inline">
              Switch University:
            </span>
            <div
              ref={univSelectorScroll.ref}
              {...univSelectorScroll.events}
              className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 select-none w-full ${
                univSelectorScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {allUniversities.map((u) => {
                const isCurrent = u.id === university.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      onSelectUniversity(u);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-white/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{u.abbr}</span>
                    {isCurrent && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google Drive & Close Modal Buttons */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsDriveModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-xs"
              title="Open Google Drive Hub to sync dossiers or browse campus photos"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Google Drive</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
              aria-label="Close dossier modal"
            >
              <span className="hidden sm:inline">Close</span>
              <span className="text-base leading-none">✕</span>
            </button>
          </div>
        </div>

        {/* 2. UNIVERSITY HERO BANNER & IDENTITY */}
        <div className="relative bg-slate-950 text-white shrink-0 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={galleryItems[activePhotoIndex]?.url || university.coverImage}
              alt={university.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60" />
          </div>

          <div className="relative z-10 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {university.abbr}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {university.type} University
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Est. {university.foundedYear}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {university.accreditation.status}
                  </span>
                </div>

                <h1 id="dossier-modal-title" className="text-lg sm:text-xl font-bold text-slate-100">
                  {university.name}
                </h1>

                {university.khmerName && (
                  <div className="text-xs text-slate-300 font-medium">{university.khmerName}</div>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{university.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <a
                      href={getSafeHttpUrl(university.website) ?? undefined}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-indigo-300 hover:underline inline-flex items-center gap-0.5"
                    >
                      {university.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Overall Score Badge */}
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center shrink-0 min-w-[140px]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
                  Overall Score
                </div>
                <div className="text-3xl font-black text-white mt-0.5">
                  {university.profileScore.overall}
                  <span className="text-xs font-semibold text-slate-400">/100</span>
                </div>
                <div className="text-[10px] text-emerald-300 font-bold mt-1">
                  {university.dataConfidence.level.toUpperCase()} DATA
                </div>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/10">
              <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="text-[10px] uppercase font-bold text-slate-400">Annual Tuition</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  ${university.annualTuitionUSD.toLocaleString()} / yr
                </div>
              </div>

              <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="text-[10px] uppercase font-bold text-slate-400">Starting Salary</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  ${university.averageGraduateSalaryMonthlyUSD} / mo
                </div>
              </div>

              <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="text-[10px] uppercase font-bold text-slate-400">6-Mo Placement</div>
                <div className="text-sm font-bold text-indigo-300 mt-0.5">
                  {university.employmentRate6Months}% Employed
                </div>
              </div>

              <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="text-[10px] uppercase font-bold text-slate-400">Scholarships</div>
                <div className="text-sm font-bold text-amber-300 mt-0.5 truncate">
                  {university.scholarships.hasFullScholarship ? '100% Full-Ride' : 'Partial Aid'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SUB-NAVIGATION TABS (Draggable Scroll) */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-2 shrink-0">
          <div
            ref={navScroll.ref}
            {...navScroll.events}
            className={`flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 select-none text-xs ${
              navScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {[
              { id: 'checklist', label: 'Infrastructure & Checklist', icon: Layers },
              { id: 'basic-info', label: '1. Basic Info', icon: Building2 },
              { id: 'faculties', label: `2. Faculties (${university.facultiesList?.length || university.facultyCount})`, icon: Layers },
              { id: 'majors', label: `3. Majors (${university.majors.length})`, icon: GraduationCap },
              { id: 'courses', label: '4. Courses', icon: BookOpen },
              { id: 'tuition', label: '5. Tuition', icon: DollarSign },
              { id: 'scholarships', label: '6. Scholarships', icon: Award },
              { id: 'admissions', label: '7. Admission Req.', icon: Calendar },
              { id: 'facilities', label: '8. Facilities', icon: Compass },
              { id: 'accreditation', label: '9. Accreditation', icon: ShieldCheck },
              { id: 'reputation', label: '10. Ranking & Reputation', icon: Sparkles },
              { id: 'careers', label: '11. Career Outcomes', icon: Briefcase },
              { id: 'photos', label: `Photos (${galleryItems.length})`, icon: ImageIcon },
              { id: 'fit', label: 'Student Fit', icon: CheckCircle2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. MODAL BODY SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB: DATA INFRASTRUCTURE & CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <UniversityDataChecklistView
                university={university}
                onNavigateSection={(sectionId) => setActiveTab(sectionId as TabType)}
              />
            </div>
          )}

          {/* TAB 1: BASIC INFORMATION (UNIVERSITY PROFILE) */}
          {activeTab === 'basic-info' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>1. University Profile & Basic Information</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Core institutional identity, legal status, physical campus coordinates, and verified direct contact channels.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Institutional Identity Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center justify-between">
                    <span>Institutional Identity</span>
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {university.type}
                    </span>
                  </div>

                  <div className="space-y-2 text-gray-700">
                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Official English Name</div>
                      <div className="font-bold text-gray-900 text-sm">{university.name}</div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Khmer Name</div>
                      <div className="font-semibold text-indigo-900 font-khmer text-xs">{university.khmerName}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <div className="text-gray-400 text-[10px] uppercase font-semibold">Abbreviation</div>
                        <div className="font-bold text-gray-800">{university.abbr}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[10px] uppercase font-semibold">Founded Year</div>
                        <div className="font-bold text-gray-800">{university.foundedYear || 'Blank'}</div>
                      </div>
                    </div>

                    <div className="pt-1">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Institutional Status</div>
                      <div className="font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{university.type} Higher Education Institution</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verified Contact & Admissions Channels */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center justify-between">
                    <span>Direct Campus Contact & Location</span>
                    <Globe className="w-4 h-4 text-gray-400" />
                  </div>

                  <div className="space-y-2.5 text-gray-700">
                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-600" />
                        <span>Campus Location / Physical Address</span>
                      </div>
                      <div className="font-medium text-gray-800 mt-0.5">
                        {university.contact?.address && university.contact.address !== 'Blank' ? (
                          university.contact.address
                        ) : university.location ? (
                          university.location
                        ) : (
                          <BlankBadge />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <div className="text-gray-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                          <Phone className="w-3 h-3 text-indigo-600" />
                          <span>Phone Hotline</span>
                        </div>
                        <div className="font-medium text-gray-800 mt-0.5">
                          {university.contact?.phone && university.contact.phone !== 'Blank' ? (
                            <a href={`tel:${university.contact.phone}`} className="text-indigo-600 hover:underline">
                              {university.contact.phone}
                            </a>
                          ) : (
                            <BlankBadge />
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                          <Mail className="w-3 h-3 text-indigo-600" />
                          <span>Official Email</span>
                        </div>
                        <div className="font-medium text-gray-800 mt-0.5">
                          {university.contact?.email && university.contact.email !== 'Blank' ? (
                            <a href={`mailto:${university.contact.email}`} className="text-indigo-600 hover:underline">
                              {university.contact.email}
                            </a>
                          ) : (
                            <BlankBadge />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-1">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Admissions Office Inquiries</div>
                      <div className="font-medium text-gray-800 mt-0.5">
                        {university.contact?.admissionsOffice && university.contact.admissionsOffice !== 'Blank' ? (
                          university.contact.admissionsOffice
                        ) : (
                          <BlankBadge />
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Official Portal:</span>
                      <a
                        href={getSafeHttpUrl(university.website) ?? undefined}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <span>{university.website.replace('https://', '')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regulatory Line Ministry & Accreditation Summary */}
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Regulatory Line Ministry & Official Charter</span>
                  </div>
                  <div className="text-indigo-800">
                    Supervised under <span className="font-bold">{university.accreditation.governmentRecognition}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('accreditation')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-50 transition-colors shrink-0 cursor-pointer"
                >
                  View Full Accreditation Details →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FACULTIES & DEPARTMENTS */}
          {activeTab === 'faculties' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>2. Faculties & Academic Departments</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Full hierarchical structure of constituent faculties, academic leadership, and constituent departments.
                </p>
              </div>

              {university.facultiesList && university.facultiesList.length > 0 ? (
                <div className="space-y-4">
                  {university.facultiesList.map((faculty, fIdx) => (
                    <div
                      key={fIdx}
                      className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-100 pb-2.5">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Faculty {fIdx + 1}
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm mt-1">{faculty.name}</h4>
                          {faculty.khmerName && (
                            <div className="text-gray-500 font-khmer text-xs">{faculty.khmerName}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-gray-400 uppercase font-semibold">Leadership / Dean</div>
                          <div className="font-semibold text-gray-800">
                            {faculty.dean && faculty.dean !== 'Blank' ? faculty.dean : <BlankBadge />}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-400 text-[10px] uppercase font-semibold">Description</div>
                        <p className="text-gray-700 leading-relaxed mt-0.5">
                          {faculty.description && faculty.description !== 'Blank' ? (
                            faculty.description
                          ) : (
                            <BlankBadge />
                          )}
                        </p>
                      </div>

                      <div>
                        <div className="text-gray-400 text-[10px] uppercase font-semibold">Constituent Departments:</div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {faculty.departments.map((dept, dIdx) => (
                            <span
                              key={dIdx}
                              className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 font-medium text-[11px]"
                            >
                              {dept}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(university.departments || []).map((dept, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {dept.faculty}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{dept.name}</h4>
                      {dept.description && (
                        <p className="text-gray-600 text-[11px] leading-relaxed">{dept.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MAJORS OFFERED */}
          {activeTab === 'majors' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>3. Majors & Degree Programs Offered</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Comprehensive listing of authorized undergraduate, graduate, and engineering majors with language and starting pay insights.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(university.programs && university.programs.length > 0
                  ? university.programs
                  : university.majors.map((m) => ({
                      name: m.name,
                      level: m.level,
                      degreeAwarded: `${m.level} in ${m.name}`,
                      duration: `${m.durationYears} Years`,
                      language: m.languageOfInstruction,
                      description: m.description,
                    }))
                ).map((prog, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-indigo-300 transition-all shadow-2xs space-y-2.5 text-xs flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {prog.level}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {prog.duration}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-900 text-sm">{prog.name}</h4>

                      <div className="text-gray-600 text-[11px]">
                        <span className="font-semibold text-gray-700">Degree Awarded: </span>
                        {prog.degreeAwarded}
                      </div>

                      <div className="text-gray-600 text-[11px]">
                        <span className="font-semibold text-gray-700">Instruction Language: </span>
                        <span className="font-medium text-indigo-700">{prog.language}</span>
                      </div>

                      {prog.description && (
                        <p className="text-gray-600 text-[11px] leading-relaxed pt-1">
                          {prog.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-emerald-700">Accredited Program</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('courses')}
                        className="text-indigo-600 font-bold hover:underline cursor-pointer"
                      >
                        View Course Syllabus →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SCHOLARSHIPS & FINANCIAL AID */}
          {activeTab === 'scholarships' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>6. Scholarships & Financial Aid Infrastructure</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Full 100% tuition waivers, government quota grants, corporate partner sponsorships, and need-based financial aid.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Available Scholarships */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center justify-between">
                    <span>Available Scholarship Schemes</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {university.scholarships.hasFullScholarship ? '100% Full-Ride Available' : 'Partial / Quota'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <ul className="space-y-2">
                      {university.scholarships.scholarshipNames.map((name, i) => (
                        <li key={i} className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-semibold text-emerald-950">{name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-gray-400 text-[10px] uppercase font-semibold">Eligibility Criteria</div>
                    <p className="text-gray-700 leading-relaxed mt-1">
                      {university.scholarships.requirements}
                    </p>
                  </div>
                </div>

                {/* Financial Aid & Policy */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
                    Need-Based Financial Aid & Timelines
                  </div>

                  <div className="space-y-3 text-gray-700">
                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Financial Aid Availability</div>
                      <div className="mt-1">
                        {university.financialInfo?.financialAid && university.financialInfo.financialAid !== 'Blank' ? (
                          <div className="font-medium text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-200">
                            {university.financialInfo.financialAid}
                          </div>
                        ) : (
                          <BlankBadge />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Application Window & Deadline</div>
                      <div className="font-bold text-indigo-900 mt-0.5">
                        {university.scholarships.applicationDeadline || 'Blank'}
                      </div>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                      <span className="font-bold">Student Advice: </span>
                      Ensure high-school transcripts and national BacII certificates are submitted at least 2 weeks before the published scholarship test date.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: FACILITIES & STUDENT EXPERIENCE */}
          {activeTab === 'facilities' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span>8. Facilities & Student Experience Infrastructure</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Comprehensive audit of academic libraries, high-technology laboratories, residential dormitories, and student clubs.
                </p>
              </div>

              {/* Library & Laboratories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Library Profile */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center justify-between">
                    <span>Academic Library</span>
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                  </div>

                  <div className="space-y-2 text-gray-700">
                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Library Facility</div>
                      <div className="font-bold text-gray-900 mt-0.5">
                        {university.studentExperience?.library?.name && university.studentExperience.library.name !== 'Blank' ? (
                          university.studentExperience.library.name
                        ) : (
                          <BlankBadge />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Facility Description</div>
                      <p className="text-gray-600 leading-relaxed mt-0.5">
                        {university.studentExperience?.library?.description && university.studentExperience.library.description !== 'Blank' ? (
                          university.studentExperience.library.description
                        ) : (
                          <BlankBadge />
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                      <div>
                        <div className="text-gray-400 text-[10px] uppercase font-semibold">Digital Library Access</div>
                        <div className="font-medium text-gray-800 mt-0.5">
                          {university.studentExperience?.library?.digitalAccess && university.studentExperience.library.digitalAccess !== 'Blank' ? (
                            university.studentExperience.library.digitalAccess
                          ) : (
                            <BlankBadge />
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[10px] uppercase font-semibold">Study Spaces</div>
                        <div className="font-medium text-gray-800 mt-0.5">
                          {university.studentExperience?.library?.studySpaces && university.studentExperience.library.studySpaces !== 'Blank' ? (
                            university.studentExperience.library.studySpaces
                          ) : (
                            <BlankBadge />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Laboratories */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center justify-between">
                    <span>Specialized Laboratories</span>
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>

                  <div className="space-y-2">
                    {university.studentExperience?.laboratories && university.studentExperience.laboratories.length > 0 ? (
                      <div className="space-y-2">
                        {university.studentExperience.laboratories.map((lab, lIdx) => (
                          <div key={lIdx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                            <div className="font-bold text-gray-900">{lab.name}</div>
                            <div className="text-gray-600 text-[11px] mt-0.5">{lab.specialization}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <BlankBadge />
                    )}
                  </div>
                </div>
              </div>

              {/* Campus Facilities List & Dormitory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Campus Facilities & Clubs */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
                    Campus Facilities & Student Societies
                  </div>

                  <div>
                    <div className="text-gray-400 text-[10px] uppercase font-semibold">Campus Facilities:</div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {university.facilities.map((fac, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium">
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-gray-400 text-[10px] uppercase font-semibold">Active Student Clubs:</div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {university.studentClubs.map((club, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 font-medium">
                          {club}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dormitory & Residential Options */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center justify-between">
                    <span>Campus Dormitory & Housing</span>
                    <Building2 className="w-4 h-4 text-gray-400" />
                  </div>

                  <div className="space-y-2 text-gray-700">
                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Availability</div>
                      <div className="font-bold text-gray-900 mt-0.5">
                        {university.studentExperience?.dormitory?.available ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>On-Campus Dormitory Available</span>
                          </span>
                        ) : (
                          <span className="text-gray-500 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-gray-400" />
                            <span>No On-Campus Dormitory (Off-Campus Rental)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Housing Description</div>
                      <p className="text-gray-600 leading-relaxed mt-0.5">
                        {university.studentExperience?.dormitory?.description && university.studentExperience.dormitory.description !== 'Blank' ? (
                          university.studentExperience.dormitory.description
                        ) : (
                          <BlankBadge />
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                      <div>
                        <div className="text-gray-400 text-[10px] uppercase font-semibold">Dormitory Type</div>
                        <div className="font-medium text-gray-800 mt-0.5">
                          {university.studentExperience?.dormitory?.type && university.studentExperience.dormitory.type !== 'Blank' ? (
                            university.studentExperience.dormitory.type
                          ) : (
                            <BlankBadge />
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[10px] uppercase font-semibold">Pricing / Eligibility</div>
                        <div className="font-medium text-gray-800 mt-0.5">
                          {university.studentExperience?.dormitory?.pricing && university.studentExperience.dormitory.pricing !== 'Blank' ? (
                            university.studentExperience.dormitory.pricing
                          ) : (
                            <BlankBadge />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ACCREDITATION */}
          {activeTab === 'accreditation' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>9. Accreditation & Ministry Governance</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Official royal decrees, line ministry oversight, and international quality certifications.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
                    Government Line Ministry & Charter
                  </div>

                  <div className="space-y-2 text-gray-700">
                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Line Ministry Recognition</div>
                      <div className="font-bold text-gray-900 mt-0.5">{university.accreditation.governmentRecognition}</div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">National Accreditation Status</div>
                      <div className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{university.accreditation.status}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Accreditation Committee of Cambodia (ACC)</div>
                      <div className="font-medium text-gray-800 mt-0.5">
                        {university.accreditation.accAccreditation || 'Fully Recognized'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
                    International Quality & Auditing
                  </div>

                  <div className="space-y-2 text-gray-700">
                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">International Certifications / Partners</div>
                      <div className="font-medium text-gray-800 mt-0.5">
                        {university.accreditation.internationalAccreditation && university.accreditation.internationalAccreditation !== 'Blank' ? (
                          university.accreditation.internationalAccreditation
                        ) : (
                          <BlankBadge />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Audit Verification Source</div>
                      <div className="font-medium text-gray-800 mt-0.5">
                        {university.accreditation.verificationSource}
                      </div>
                    </div>

                    <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-indigo-900 text-[11px] mt-2">
                      <span className="font-bold">Institutional Quality Guarantee: </span>
                      All degrees conferred adhere to the Cambodian National Qualifications Framework (CNQF).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: RANKING / REPUTATION */}
          {activeTab === 'reputation' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>10. Ranking & Academic Reputation</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Empirical weighted evaluation, national league tables, and industry employer reputation standing.
                </p>
              </div>

              {/* Profile Score Empirical 30/20/20/30 Breakdown */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>Audited Profile Score (Weighted Empirical Evaluation)</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">
                    Total: {university.profileScore.overall} / 100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <div className="text-gray-500 font-medium">Academic Rigor (30%)</div>
                    <div className="text-xl font-black text-gray-900 mt-1">
                      {university.profileScore.academicReputation}
                      <span className="text-xs text-gray-400 font-normal"> / 100</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Faculty credentials & standards</div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <div className="text-gray-500 font-medium">Industry Links (20%)</div>
                    <div className="text-xl font-black text-gray-900 mt-1">
                      {university.profileScore.industryConnection}
                      <span className="text-xs text-gray-400 font-normal"> / 100</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Corporate recruitment & internships</div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <div className="text-gray-500 font-medium">Campus Labs (20%)</div>
                    <div className="text-xl font-black text-gray-900 mt-1">
                      {university.profileScore.facilities}
                      <span className="text-xs text-gray-400 font-normal"> / 100</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">High-tech labs & libraries</div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <div className="text-gray-500 font-medium">Graduate Outcome (30%)</div>
                    <div className="text-xl font-black text-gray-900 mt-1">
                      {university.profileScore.graduateOutcome}
                      <span className="text-xs text-gray-400 font-normal"> / 100</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Starting salary & placement</div>
                  </div>
                </div>
              </div>

              {/* National & Regional Standing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
                    Rankings & Reputation League
                  </div>

                  <div className="space-y-2 text-gray-700">
                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">National Ranking</div>
                      <div className="font-bold text-gray-900 mt-0.5">
                        {university.rankingInfo?.nationalRanking && university.rankingInfo.nationalRanking !== 'Blank' ? (
                          university.rankingInfo.nationalRanking
                        ) : (
                          <BlankBadge />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Regional Standing</div>
                      <div className="font-medium text-gray-800 mt-0.5">
                        {university.rankingInfo?.regionalStanding && university.rankingInfo.regionalStanding !== 'Blank' ? (
                          university.rankingInfo.regionalStanding
                        ) : (
                          <BlankBadge />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Reputation Highlights</div>
                      <div className="font-medium text-indigo-900 mt-0.5">
                        {university.rankingInfo?.reputationHighlights && university.rankingInfo.reputationHighlights !== 'Blank' ? (
                          university.rankingInfo.reputationHighlights
                        ) : (
                          <BlankBadge />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
                    Pedagogical Model & Student Experience
                  </div>

                  <div className="space-y-2 text-gray-700">
                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Theory vs Practice Ratio</div>
                      <div className="font-bold text-emerald-800 mt-0.5">{university.theoryVsPracticeRatio}</div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Student-to-Faculty Ratio</div>
                      <div className="font-bold text-gray-900 mt-0.5">{university.studentToFacultyRatio}</div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Curriculum Philosophy</div>
                      <div className="italic text-gray-700 mt-0.5">"{university.curriculumHighlight}"</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PHOTOS & GALLERY */}
          {activeTab === 'photos' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Up-to-Date Photo Gallery & Campus Environment
                  </h3>
                  <p className="text-xs text-gray-500">
                    Verified photo captures of academic buildings, high-tech labs, amphitheaters, and student areas.
                  </p>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                  {['all', 'Campus & Architecture', 'Labs & Tech Centers', 'Classrooms & Libraries', 'Student Life & Events'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedPhotoCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        selectedPhotoCategory === cat
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat === 'all' ? 'All Photos' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Photo Showcase */}
              {filteredGallery.length > 0 && (
                <div className="space-y-3">
                  <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-900 border border-gray-200 group">
                    <img
                      src={filteredGallery[activePhotoIndex]?.url || filteredGallery[0]?.url}
                      alt={filteredGallery[activePhotoIndex]?.caption || university.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Navigation Buttons on Photo */}
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIndex((prev) =>
                          prev > 0 ? prev - 1 : filteredGallery.length - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer backdrop-blur-xs"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIndex((prev) =>
                          prev < filteredGallery.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer backdrop-blur-xs"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Caption Overlay */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      {filteredGallery[activePhotoIndex]?.category && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600/90 backdrop-blur-xs">
                          {filteredGallery[activePhotoIndex].category}
                        </span>
                      )}
                      <div className="text-sm sm:text-base font-bold mt-1">
                        {filteredGallery[activePhotoIndex]?.caption}
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Row */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {filteredGallery.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`relative h-16 w-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activePhotoIndex === idx
                            ? 'border-indigo-600 ring-2 ring-indigo-600/30'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.caption}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Campus Life & Facilities Information */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Campus Atmosphere & Facilities</h4>
                  <p className="text-gray-700 leading-relaxed mt-1">
                    {university.campusDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <span className="font-bold text-gray-900">Key Verified Facilities:</span>
                    <ul className="list-disc pl-4 text-gray-600 mt-1.5 space-y-1">
                      {university.facilities.map((fac, i) => (
                        <li key={i}>{fac}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-gray-900">Active Student Clubs & Societies:</span>
                    <ul className="list-disc pl-4 text-gray-600 mt-1.5 space-y-1">
                      {university.studentClubs.map((club, i) => (
                        <li key={i}>{club}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: 4-YEAR SYLLABI & COURSES */}
          {activeTab === 'courses' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Comprehensive Course Syllabi (Year 1 to Year {currentMajor.durationYears})
                  </h3>
                  <p className="text-xs text-gray-500">
                    Detailed subject lists, Tronc Commun / Foundation year subjects, and capstone milestones.
                  </p>
                </div>
                <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                  Ratio: {university.theoryVsPracticeRatio}
                </div>
              </div>

              {/* Major Selection Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {university.majors.map((major, idx) => (
                  <button
                    key={major.id}
                    type="button"
                    onClick={() => setSelectedMajorIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMajorIndex === idx
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {major.name.split('(')[0].trim()}
                  </button>
                ))}
              </div>

              {/* Major Deep Dive Container */}
              <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-gray-900">{currentMajor.name}</h4>
                    <div className="text-xs text-gray-500">
                      {currentMajor.faculty} • {currentMajor.degreeType} • {currentMajor.durationYears} Years
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
                      Difficulty: {'★'.repeat(Math.round(currentMajor.difficultyRating))} ({currentMajor.difficultyRating}/5)
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900">
                      {currentMajor.jobMarketDemand} Demand
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-800">Difficulty Reality Check: </span>
                  {currentMajor.difficultyReason}
                </div>

                {/* Course Structure by Year */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Year-by-Year Academic Curriculum:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentMajor.courseStructure.map((cYear) => (
                      <div
                        key={cYear.year}
                        className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-1.5 shadow-2xs"
                      >
                        <div className="font-bold text-indigo-700 text-xs">
                          Year {cYear.year}: {cYear.title}
                        </div>
                        <p className="text-gray-500 text-[11px] leading-tight">{cYear.focus}</p>
                        <div className="pt-1 border-t border-gray-100">
                          <div className="text-[10px] font-semibold text-gray-400 uppercase">
                            Core Subjects Taught:
                          </div>
                          <div className="text-gray-800 text-[11px] font-medium mt-1 leading-relaxed">
                            {cYear.subjects.join(' • ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Acquired & Career Pathways */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <span className="font-bold text-gray-800">Technical Skills Acquired:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentMajor.technicalSkillsGained.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-medium text-[11px]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-gray-800">Direct Career Pathways:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentMajor.careerPathways.map((path, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium text-[11px]"
                        >
                          {path}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ADMISSIONS & TESTING */}
          {activeTab === 'admissions' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Admissions Criteria & Entrance Exam Information
                </h3>
                <p className="text-xs text-gray-500">
                  National High School Bac II grade requirements, entrance test format, and application deadlines.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-gray-500 font-semibold">National Bac II Grade:</span>
                    <div className="font-bold text-gray-900 text-sm">
                      {university.admissionRequirements.nationalExamRequirement}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-gray-500 font-semibold">Entrance Exam Requirement:</span>
                    <div className="font-bold text-indigo-900 text-sm">
                      {university.admissionRequirements.entranceExamRequired
                        ? 'Mandatory Competitive Entrance Exam'
                        : 'Direct Admission / Interview'}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-1.5">
                  <span className="font-bold text-gray-900">Exam Details & Format:</span>
                  <p className="text-gray-600 leading-relaxed">
                    {university.admissionRequirements.entranceExamDetails}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-gray-500 font-semibold">English Language Requirement:</span>
                    <div className="font-medium text-gray-800">
                      {university.admissionRequirements.englishRequirement}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-gray-500 font-semibold">Competition Level:</span>
                    <div className="font-bold text-amber-800">
                      {university.applicationDifficulty}
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-indigo-900 font-medium">
                  <div>
                    <span className="font-bold">Application Deadline: </span>
                    {university.importantDates.applicationDeadline}
                  </div>
                  <div>
                    <span className="font-bold">Exam Date: </span>
                    {university.importantDates.examDate}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TUITION & FINANCIAL INFORMATION */}
          {activeTab === 'tuition' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>5. Tuition & Financial Information Infrastructure</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Tuition fees, payment schedules, scholarship opportunities, financial aid, and itemized other costs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenROI(university.id)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Tuition & Salary ROI Simulator</span>
                </button>
              </div>

              {/* Core Tuition & Payback Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-1">
                  <div className="text-gray-500 font-semibold">Annual Tuition Fee:</div>
                  <div className="text-2xl font-black text-emerald-900">
                    ${university.annualTuitionUSD.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-gray-600 font-medium mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>Payment: {university.paymentSchedule}</span>
                  </div>
                </div>

                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-1">
                  <div className="text-gray-500 font-semibold">Total 4-Year Degree Tuition:</div>
                  <div className="text-2xl font-black text-emerald-900">
                    ${university.totalDegreeCostUSD.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-gray-500">Base tuition without living costs</div>
                </div>

                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-1">
                  <div className="text-gray-500 font-semibold">Estimated Salary Payback:</div>
                  <div className="text-2xl font-black text-emerald-900">
                    {university.estimatedROIPaybackMonths} Months
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium">Rapid ROI recovery</div>
                </div>
              </div>

              {/* Other Costs Itemized Checklist Table */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Itemized Other Costs & Institutional Fees</h4>
                    <p className="text-[11px] text-gray-500">
                      Standard student checklist fees outside standard course tuition.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                    Checklist Section 3
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200">
                    <div className="text-gray-400 text-[10px] uppercase font-semibold">1. Registration Fee</div>
                    <div className="font-bold text-gray-900 mt-1">
                      {university.financialInfo?.otherCosts?.registrationFee &&
                      university.financialInfo.otherCosts.registrationFee !== 'Blank' ? (
                        university.financialInfo.otherCosts.registrationFee
                      ) : (
                        <BlankBadge />
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200">
                    <div className="text-gray-400 text-[10px] uppercase font-semibold">2. Laboratory Fee</div>
                    <div className="font-bold text-gray-900 mt-1">
                      {university.financialInfo?.otherCosts?.laboratoryFee &&
                      university.financialInfo.otherCosts.laboratoryFee !== 'Blank' ? (
                        university.financialInfo.otherCosts.laboratoryFee
                      ) : (
                        <BlankBadge />
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200">
                    <div className="text-gray-400 text-[10px] uppercase font-semibold">3. Books & Materials</div>
                    <div className="font-bold text-gray-900 mt-1">
                      {university.financialInfo?.otherCosts?.booksAndMaterials &&
                      university.financialInfo.otherCosts.booksAndMaterials !== 'Blank' ? (
                        university.financialInfo.otherCosts.booksAndMaterials
                      ) : (
                        <BlankBadge />
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200">
                    <div className="text-gray-400 text-[10px] uppercase font-semibold">4. Student Uniform</div>
                    <div className="font-bold text-gray-900 mt-1">
                      {university.financialInfo?.otherCosts?.uniform &&
                      university.financialInfo.otherCosts.uniform !== 'Blank' ? (
                        university.financialInfo.otherCosts.uniform
                      ) : (
                        <BlankBadge />
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200">
                    <div className="text-gray-400 text-[10px] uppercase font-semibold">5. Dormitory / Housing Cost</div>
                    <div className="font-bold text-gray-900 mt-1">
                      {university.financialInfo?.otherCosts?.dormitoryCost &&
                      university.financialInfo.otherCosts.dormitoryCost !== 'Blank' ? (
                        university.financialInfo.otherCosts.dormitoryCost
                      ) : (
                        <BlankBadge />
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200">
                    <div className="text-gray-400 text-[10px] uppercase font-semibold">6. Graduation Fee</div>
                    <div className="font-bold text-gray-900 mt-1">
                      {university.financialInfo?.otherCosts?.graduationFee &&
                      university.financialInfo.otherCosts.graduationFee !== 'Blank' ? (
                        university.financialInfo.otherCosts.graduationFee
                      ) : (
                        <BlankBadge />
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="text-gray-400 text-[10px] uppercase font-semibold">Fee Transparency Notes</div>
                  <p className="text-gray-700 leading-relaxed mt-0.5">
                    {university.financialInfo?.otherCosts?.details &&
                    university.financialInfo.otherCosts.details !== 'Blank' ? (
                      university.financialInfo.otherCosts.details
                    ) : (
                      <BlankBadge />
                    )}
                  </p>
                </div>
              </div>

              {/* Financial Aid & Scholarship Quick Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-600" />
                      <span>Scholarships</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('scholarships')}
                      className="text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      View All Schemes →
                    </button>
                  </div>
                  <p className="text-gray-600">
                    {university.scholarships.scholarshipNames.join(' • ')}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                  <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Need-Based Financial Aid</span>
                  </div>
                  <p className="text-gray-600">
                    {university.financialInfo?.financialAid && university.financialInfo.financialAid !== 'Blank' ? (
                      university.financialInfo.financialAid
                    ) : (
                      <BlankBadge />
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CAREERS & OUTCOMES */}
          {activeTab === 'careers' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Estimated Graduate Outcomes &amp; Recruiting Partners (Planning Reference)
                </h3>
                <p className="text-xs text-gray-500">
                  Reference estimates for employment velocity, entry-level pay, and industry hiring partners. Verify current figures directly with the institution.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <div className="text-gray-500 font-semibold">Est. 6-Month Placement:</div>
                    <div className="text-2xl font-black text-emerald-700 mt-1">
                      {university.employmentRate6Months > 0 ? `${university.employmentRate6Months}%` : 'Not specified'}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <div className="text-gray-500 font-semibold">Est. Time to First Role:</div>
                    <div className="text-2xl font-black text-gray-900 mt-1">
                      {university.averageTimeToJobMonths > 0 ? `${university.averageTimeToJobMonths} Months` : 'Not specified'}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <div className="text-gray-500 font-semibold">Structured Internship Track:</div>
                    <div className="text-lg font-black text-indigo-700 mt-1">
                      {university.hasGuaranteedInternship ? 'Structured Curriculum Track' : 'Supported Placement'}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-gray-900">Top Alumni Employers & Corporate Recruiters:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {university.topAlumniCompanies.map((comp, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-800 font-medium text-xs shadow-2xs"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PHOTOS & MEDIA INFRASTRUCTURE */}
          {activeTab === 'photos' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>Campus Photos & Visual Verification Media</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    High-resolution campus photography, facilities gallery, and photo synchronization tools.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDriveModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Import from Google Drive</span>
                  </button>
                </div>
              </div>

              {/* Photo Extraction & Sourcing Explanatory Card */}
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>How Campus Photos Are Sourced & Online Extraction Rules</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  <strong>Source Methodology:</strong> Initial visuals use curated high-resolution educational
                  architecture imagery representing campus facilities, digital labs, and lecture halls.
                </p>
                <div className="text-[11px] leading-relaxed text-amber-800 space-y-1 bg-white/60 p-3 rounded-xl border border-amber-200/60">
                  <div className="font-semibold text-amber-950">Why direct browser scraping has strict technical barriers:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>
                      <strong>CORS Security Policy:</strong> Web browsers enforce Cross-Origin Resource Sharing (CORS),
                      which blocks front-end apps from reading or scraping arbitrary third-party web pages without server
                      headers.
                    </li>
                    <li>
                      <strong>Social Media Authentication Walls:</strong> Facebook pages, Instagram, and Telegram
                      require logged-in user sessions, JavaScript hydration, and active anti-bot protections that block
                      automated crawler access.
                    </li>
                    <li>
                      <strong>Hotlinking & CDN Protections:</strong> Many university websites forbid external hotlinking
                      of images.
                    </li>
                  </ul>
                </div>
                <div className="text-[11px] text-amber-950 pt-0.5">
                  <strong>Solution:</strong> You can link real campus photos directly from your <strong>Google Drive</strong>{' '}
                  or paste a direct verified image URL below to update this university&apos;s photo in real-time!
                </div>
              </div>

              {/* Custom Image URL Updater */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs space-y-3">
                <div className="font-bold text-gray-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Update University Photo via Direct URL</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/university_campus.jpg"
                    value={directPhotoUrl}
                    onChange={(e) => setDirectPhotoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (directPhotoUrl.trim() && university) {
                        setCustomPhotos((prev) => ({
                          ...prev,
                          [university.id]: [directPhotoUrl.trim(), ...(prev[university.id] || [])],
                        }));
                        setDirectPhotoUrl('');
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Add Photo
                  </button>
                </div>
              </div>

              {/* Photo Gallery Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-sm">
                    {university.abbr} Campus & Facility Gallery ({galleryItems.length + (customPhotos[university.id]?.length || 0)} Photos)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Custom photos if added */}
                  {(customPhotos[university.id] || []).map((url, idx) => (
                    <div
                      key={`custom-${idx}`}
                      className="group relative rounded-2xl overflow-hidden border border-indigo-200 shadow-2xs bg-slate-900 aspect-video"
                    >
                      <img
                        src={url}
                        alt={`${university.abbr} Custom Photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3 text-white">
                        <div className="text-[11px] font-bold">User-Uploaded / Drive Campus Photo</div>
                      </div>
                    </div>
                  ))}

                  {/* Standard gallery items */}
                  {galleryItems.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`group relative rounded-2xl overflow-hidden border transition-all cursor-pointer aspect-video ${
                        activePhotoIndex === idx
                          ? 'ring-2 ring-indigo-600 border-indigo-600 shadow-md'
                          : 'border-gray-200 hover:border-indigo-300 shadow-2xs'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                          {item.category || 'Facility'}
                        </span>
                        <div className="text-xs font-semibold leading-tight line-clamp-1">{item.caption}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: STUDENT FIT */}
          {activeTab === 'fit' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Student Fit Reality Check
                </h3>
                <p className="text-xs text-gray-500">
                  Honest appraisal of who will thrive at {university.abbr} versus who should consider alternative paths.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Best suited for students who:</span>
                  </div>
                  <ul className="list-disc pl-4 text-emerald-800 space-y-1 text-[11px] leading-relaxed">
                    {university.studentFit.bestFor.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 space-y-2">
                  <div className="font-bold text-rose-900 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>NOT recommended for students who:</span>
                  </div>
                  <ul className="list-disc pl-4 text-rose-800 space-y-1 text-[11px] leading-relaxed">
                    {university.studentFit.notRecommendedFor.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. MODAL BOTTOM ACTIONS BAR */}
        <div className="bg-white border-t border-gray-200 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium">Data Confidence:</span>
            <DataConfidenceBadge confidence={university.dataConfidence} showDetailsButton={false} />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <a
              href={getSafeHttpUrl(university.website) ?? undefined}
              target="_blank"
              rel="noreferrer noopener"
              className="py-2.5 px-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              <span>Admissions Website</span>
            </a>

            {onAskAdvisor && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAskAdvisor(
                    `Can you compare ${university.abbr} (${university.name}) with alternative universities in Cambodia, analyze its major course strengths, and explain how to apply for scholarships?`
                  );
                }}
                className="py-2.5 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ask AI Advisor</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const id = university.id;
                onClose();
                onOpenROI(id);
              }}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulate ROI</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

        {/* Google Drive Hub Modal */}
        {isDriveModalOpen && (
          <Suspense fallback={null}>
            <GoogleDriveHubModal
              isOpen={isDriveModalOpen}
              onClose={() => setIsDriveModalOpen(false)}
              currentUniversity={university}
              onSelectPhotoForUniversity={(newPhoto) => {
                if (university) {
                  setCustomPhotos((prev) => ({
                    ...prev,
                    [university.id]: [newPhoto, ...(prev[university.id] || [])],
                  }));
                }
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};
