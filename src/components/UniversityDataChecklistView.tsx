import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  BookOpen,
  DollarSign,
  Briefcase,
  Compass,
  GraduationCap,
  Globe,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  Award,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ComprehensiveUniversityProfile } from '../types';

interface UniversityDataChecklistViewProps {
  university: ComprehensiveUniversityProfile;
  onNavigateSection?: (sectionId: string) => void;
}

export interface ChecklistItem {
  id: string;
  label: string;
  value: string;
  isBlank: boolean;
  isLink?: boolean;
  count?: number;
}

export const BlankBadge: React.FC<{ label?: string }> = ({ label = 'Blank' }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs">
    {label}
  </span>
);

export const UniversityDataChecklistView: React.FC<UniversityDataChecklistViewProps> = ({
  university,
  onNavigateSection,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'filled' | 'blank'>('all');

  const contact = university.contact || {
    phone: 'Blank',
    email: 'Blank',
    address: university.location || 'Blank',
    website: university.website,
  };

  const financial = university.financialInfo;
  const studentExp = university.studentExperience;
  const career = university.careerInfo;
  const ranking = university.rankingReputation;

  // 1. University Profile Checklist
  const profileChecklist: ChecklistItem[] = [
    {
      id: 'name',
      label: 'University Name',
      value: `${university.name} (${university.abbr})${university.khmerName ? ` - ${university.khmerName}` : ''}`,
      isBlank: !university.name || university.name === 'Blank',
    },
    {
      id: 'type',
      label: 'Public / Private',
      value: `${university.type} Higher Education Institution`,
      isBlank: !university.type || (university.type as any) === 'Blank',
    },
    {
      id: 'location',
      label: 'Location',
      value: contact.address || university.location,
      isBlank: !contact.address || contact.address === 'Blank',
    },
    {
      id: 'foundedYear',
      label: 'Founded Year',
      value: university.foundedYear ? `Est. ${university.foundedYear}` : 'Blank',
      isBlank: !university.foundedYear,
    },
    {
      id: 'website',
      label: 'Website',
      value: university.website || 'Blank',
      isBlank: !university.website || university.website === 'Blank',
      isLink: true,
    },
    {
      id: 'contact',
      label: 'Contact Information',
      value: `Tel: ${contact.phone} | Email: ${contact.email} | Address: ${contact.address}`,
      isBlank: contact.phone === 'Blank' && contact.email === 'Blank',
    },
    {
      id: 'accreditation',
      label: 'Accreditation',
      value: `${university.accreditation.governmentRecognition} | Status: ${university.accreditation.status}${
        university.accreditation.internationalAccreditation
          ? ` | International: ${university.accreditation.internationalAccreditation}`
          : ''
      }`,
      isBlank: !university.accreditation.governmentRecognition,
    },
  ];

  // 2. Academic Information Checklist
  const academicChecklist: ChecklistItem[] = [
    {
      id: 'faculties',
      label: 'Faculties',
      value: university.facultiesList && university.facultiesList.length > 0
        ? university.facultiesList.map((f) => f.name).join('; ')
        : 'Blank',
      isBlank: !university.facultiesList || university.facultiesList.length === 0,
      count: university.facultiesList?.length || university.facultyCount,
    },
    {
      id: 'departments',
      label: 'Departments',
      value: university.departments && university.departments.length > 0
        ? university.departments.map((d) => d.name).join('; ')
        : 'Blank',
      isBlank: !university.departments || university.departments.length === 0,
      count: university.departments?.length,
    },
    {
      id: 'majorsOffered',
      label: 'Majors Offered',
      value: university.majors.map((m) => m.name).join(', '),
      isBlank: university.majors.length === 0,
      count: university.majors.length,
    },
    {
      id: 'degreeTypes',
      label: 'Degree Types',
      value: Array.from(new Set(university.majors.map((m) => m.degreeType))).join(', ') || 'Bachelor, Master, Doctoral',
      isBlank: false,
    },
    {
      id: 'studyDuration',
      label: 'Study Duration',
      value: `${university.majors[0]?.durationYears || 4} Years (8 Semesters)${
        university.abbr === 'ITC' ? ' (5 Years for State Diplôme d’Ingénieur)' : ''
      }${university.abbr === 'UHS' ? ' (8 Years for Medical Doctor / 7 Years Dentistry)' : ''}`,
      isBlank: false,
    },
    {
      id: 'courseStructure',
      label: 'Course Structure',
      value: `Year 1 Foundation & General Education -> Year 2 Core Theory -> Year 3 Advanced Labs & Electives -> Year 4 Capstone & Internship (${university.majors.length} major syllabi catalogued)`,
      isBlank: false,
    },
  ];

  // 3. Financial Information Checklist
  const otherCostsText = financial?.otherCosts
    ? `Registration: ${financial.otherCosts.registrationFee || 'Blank'} | Lab: ${
        financial.otherCosts.laboratoryFee || 'Blank'
      } | Books: ${financial.otherCosts.booksAndMaterials || 'Blank'} | Uniform: ${
        financial.otherCosts.uniform || 'Blank'
      } | Dormitory: ${financial.otherCosts.dormitoryCost || 'Blank'} | Graduation: ${
        financial.otherCosts.graduationFee || 'Blank'
      }`
    : 'Blank';

  const financialChecklist: ChecklistItem[] = [
    {
      id: 'tuitionFee',
      label: 'Tuition Fee',
      value: `$${university.annualTuitionUSD.toLocaleString()} / year (Degree total: $${university.totalDegreeCostUSD.toLocaleString()})`,
      isBlank: !university.annualTuitionUSD,
    },
    {
      id: 'paymentSchedule',
      label: 'Payment Schedule',
      value: financial?.paymentSchedule || university.paymentSchedule || 'Blank',
      isBlank: !financial?.paymentSchedule && !university.paymentSchedule,
    },
    {
      id: 'scholarship',
      label: 'Scholarships',
      value: university.scholarships.scholarshipNames.join('; ') || 'Blank',
      isBlank: university.scholarships.scholarshipNames.length === 0,
    },
    {
      id: 'financialAid',
      label: 'Financial Aid',
      value: financial?.scholarshipDetails?.financialAidDetails || (university.scholarships.financialAidAvailable ? 'Available upon application' : 'Blank'),
      isBlank: financial?.scholarshipDetails?.financialAidAvailable === false || financial?.scholarshipDetails?.financialAidAvailable === 'Blank',
    },
    {
      id: 'otherCosts',
      label: 'Other Costs',
      value: otherCostsText,
      isBlank: otherCostsText === 'Blank',
    },
  ];

  // 4. Student Experience Checklist
  const studentExperienceChecklist: ChecklistItem[] = [
    {
      id: 'campusFacilities',
      label: 'Campus Facilities',
      value: studentExp?.campusFacilities?.join('; ') || university.facilities.join('; ') || 'Blank',
      isBlank: (!studentExp?.campusFacilities || studentExp.campusFacilities.length === 0) && university.facilities.length === 0,
    },
    {
      id: 'library',
      label: 'Library',
      value: typeof studentExp?.library === 'object'
        ? `${studentExp.library.name}: ${studentExp.library.description} (Digital Library: ${studentExp.library.digitalLibrary || 'Blank'})`
        : studentExp?.library || 'Blank',
      isBlank: !studentExp?.library || (studentExp.library as any) === 'Blank',
    },
    {
      id: 'laboratory',
      label: 'Laboratory',
      value: studentExp?.laboratory && studentExp.laboratory.length > 0
        ? studentExp.laboratory.map((l) => `${l.name} (${l.specialization})`).join('; ')
        : 'Blank',
      isBlank: !studentExp?.laboratory || studentExp.laboratory.length === 0,
    },
    {
      id: 'studentClubs',
      label: 'Student Clubs',
      value: studentExp?.studentClubs?.join(', ') || university.studentClubs.join(', ') || 'Blank',
      isBlank: (!studentExp?.studentClubs || studentExp.studentClubs.length === 0) && university.studentClubs.length === 0,
    },
    {
      id: 'dormitory',
      label: 'Dormitory',
      value: studentExp?.dormitory
        ? studentExp.dormitory.available
          ? `${studentExp.dormitory.description} (Type: ${studentExp.dormitory.type || 'Blank'} | Pricing: ${studentExp.dormitory.pricingOrEligibility || 'Blank'})`
          : 'Blank'
        : 'Blank',
      isBlank: !studentExp?.dormitory || studentExp.dormitory.available === false || studentExp.dormitory.description === 'Blank',
    },
  ];

  // 5. Career Information Checklist
  const careerChecklist: ChecklistItem[] = [
    {
      id: 'graduateEmployment',
      label: 'Graduate Employment',
      value: career?.graduateEmploymentRate || `${university.employmentRate6Months}% employed within 6 months`,
      isBlank: !career?.graduateEmploymentRate && !university.employmentRate6Months,
    },
    {
      id: 'industryConnection',
      label: 'Industry Connection',
      value: career?.industryConnections?.join(', ') || university.industryPartnerships.join(', ') || 'Blank',
      isBlank: (!career?.industryConnections || career.industryConnections.length === 0) && university.industryPartnerships.length === 0,
    },
    {
      id: 'internshipOpportunity',
      label: 'Internship Opportunity',
      value: career?.internshipOpportunity?.status
        ? `${career.internshipOpportunity.status}: ${career.internshipOpportunity.details}`
        : university.hasGuaranteedInternship ? 'Mandatory/Guaranteed Capstone Internship' : 'Blank',
      isBlank: false,
    },
    {
      id: 'alumniNetwork',
      label: 'Alumni Network',
      value: career?.alumniNetwork?.overview
        ? `${career.alumniNetwork.associationName || 'Alumni Association'}: ${career.alumniNetwork.overview} (Top Employers: ${career.alumniNetwork.topCompanies?.join(', ') || 'Blank'})`
        : university.topAlumniCompanies.join(', ') || 'Blank',
      isBlank: !career?.alumniNetwork && university.topAlumniCompanies.length === 0,
    },
  ];

  const allSections = [
    { title: '1. University Profile', icon: Building2, items: profileChecklist, sectionId: 'basic-info' },
    { title: '2. Academic Information', icon: GraduationCap, items: academicChecklist, sectionId: 'faculties' },
    { title: '3. Financial Information', icon: DollarSign, items: financialChecklist, sectionId: 'tuition' },
    { title: '4. Student Experience', icon: Compass, items: studentExperienceChecklist, sectionId: 'facilities' },
    { title: '5. Career Information', icon: Briefcase, items: careerChecklist, sectionId: 'careers' },
  ];

  const totalItems = allSections.reduce((acc, s) => acc + s.items.length, 0);
  const totalFilled = allSections.reduce((acc, s) => acc + s.items.filter((i) => !i.isBlank).length, 0);
  const totalBlank = totalItems - totalFilled;
  const completionPercentage = Math.round((totalFilled / totalItems) * 100);

  return (
    <div className="space-y-6 text-left">
      {/* 1. UNIVERSITY DATA INFRASTRUCTURE HIERARCHICAL MAP */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Standardized University Data Infrastructure</span>
            </div>
            <h2 className="text-base font-bold text-slate-100">
              {university.abbr} Architecture & 10 Core Infrastructure Branches
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Audited Elements:</span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
              {totalFilled} / {totalItems} Active ({completionPercentage}%)
            </span>
            {totalBlank > 0 && (
              <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800">
                {totalBlank} "Blank"
              </span>
            )}
          </div>
        </div>

        {/* Interactive Tree Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          {[
            { name: 'Basic Information', tab: 'basic-info', icon: Building2, status: 'Audited' },
            { name: 'Faculties', tab: 'faculties', icon: Layers, status: `${university.facultiesList?.length || university.facultyCount} Faculties` },
            { name: 'Majors', tab: 'majors', icon: GraduationCap, status: `${university.majors.length} Majors` },
            { name: 'Courses', tab: 'courses', icon: BookOpen, status: '4-Year Syllabi' },
            { name: 'Tuition', tab: 'tuition', icon: DollarSign, status: `$${university.annualTuitionUSD}/yr` },
            { name: 'Scholarships', tab: 'scholarships', icon: Award, status: university.scholarships.hasFullScholarship ? '100% Full-Ride' : 'Partial' },
            { name: 'Admission Req.', tab: 'admissions', icon: Calendar, status: 'Requirements' },
            { name: 'Facilities', tab: 'facilities', icon: Compass, status: 'Labs & Library' },
            { name: 'Accreditation', tab: 'accreditation', icon: ShieldCheck, status: university.accreditation.status },
            { name: 'Ranking/Reputation', tab: 'reputation', icon: Sparkles, status: `${university.profileScore.overall}/100 Score` },
            { name: 'Career Outcomes', tab: 'careers', icon: Briefcase, status: `${university.employmentRate6Months}% Placed` },
          ].map((branch, idx) => {
            const Icon = branch.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onNavigateSection && onNavigateSection(branch.tab)}
                className="bg-slate-800/90 hover:bg-indigo-900/60 hover:border-indigo-500/50 p-2.5 rounded-xl border border-slate-700/80 transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-400 group-hover:text-indigo-300">
                  <Icon className="w-3.5 h-3.5" />
                  <ChevronRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="font-bold text-slate-200 group-hover:text-white mt-1.5 leading-tight">
                  {branch.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  {branch.status}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. FILTER & CHECKLIST AUDIT CONTROL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
            University Data Collection Checklist Filter:
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Items ({totalItems})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('filled')}
            className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
              filterMode === 'filled'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            Available Data ({totalFilled})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('blank')}
            className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
              filterMode === 'blank'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-700 hover:bg-amber-50 border border-gray-200'
            }`}
          >
            Displaying "Blank" ({totalBlank})
          </button>
        </div>
      </div>

      {/* 3. THE 5 DATA COLLECTION CHECKLIST SECTIONS */}
      <div className="space-y-5">
        {allSections.map((section, sIdx) => {
          const Icon = section.icon;
          const filteredItems = section.items.filter((item) => {
            if (filterMode === 'filled') return !item.isBlank;
            if (filterMode === 'blank') return item.isBlank;
            return true;
          });

          if (filteredItems.length === 0) return null;

          return (
            <div
              key={sIdx}
              className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden transition-all"
            >
              {/* Section Header */}
              <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
                </div>
                {onNavigateSection && (
                  <button
                    type="button"
                    onClick={() => onNavigateSection(section.sectionId)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Section Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Checklist Items Table */}
              <div className="divide-y divide-gray-100 text-xs">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 flex flex-col md:flex-row md:items-start justify-between gap-2 hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Checkbox & Item Label */}
                    <div className="flex items-center gap-2.5 min-w-[220px] shrink-0">
                      {item.isBlank ? (
                        <div className="w-4 h-4 rounded border border-amber-400 bg-amber-50 flex items-center justify-center shrink-0">
                          <span className="text-[10px] text-amber-700 font-bold">!</span>
                        </div>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span className="font-bold text-gray-800">{item.label}</span>
                    </div>

                    {/* Value or "Blank" Display */}
                    <div className="flex-1 text-gray-700 pl-6 md:pl-0">
                      {item.isBlank ? (
                        <div className="flex items-center gap-2">
                          <BlankBadge />
                          <span className="text-gray-400 italic text-[11px]">
                            No publicly published record available online
                          </span>
                        </div>
                      ) : item.isLink && item.value.startsWith('http') ? (
                        <a
                          href={item.value}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-indigo-600 font-medium hover:underline inline-flex items-center gap-1"
                        >
                          <span>{item.value}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="font-normal text-gray-900 leading-relaxed">
                          {item.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
