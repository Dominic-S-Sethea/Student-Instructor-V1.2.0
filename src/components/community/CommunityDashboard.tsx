import React, { useState } from 'react';
import { Users, GraduationCap, FolderKanban, CalendarDays, Building2, ShieldAlert } from 'lucide-react';
import { SafetyNoticeBanner } from './SafetyNoticeBanner';
import { CommunityHallView } from './CommunityHallView';
import { MentorCenterView } from './MentorCenterView';
import { ProjectRoomView } from './ProjectRoomView';
import { EventCenterView } from './EventCenterView';
import { OrganizationCommunityView } from './OrganizationCommunityView';
import { ReportModal } from './ReportModal';

export type CommunityWing = 'hall' | 'mentors' | 'projects' | 'events' | 'organizations';

interface Props {
  initialWing?: CommunityWing;
}

export const CommunityDashboard: React.FC<Props> = ({ initialWing = 'hall' }) => {
  const [activeWing, setActiveWing] = useState<CommunityWing>(initialWing);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportItemType, setReportItemType] = useState('post');
  const [reportItemId, setReportItemId] = useState('general');

  const handleOpenReport = (itemType: string = 'general', itemId: string = 'general') => {
    setReportItemType(itemType);
    setReportItemId(itemId);
    setReportModalOpen(true);
  };

  const navItems: { id: CommunityWing; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'hall', label: 'Academic Circles & Q&A', icon: <Users className="w-4 h-4" /> },
    { id: 'mentors', label: 'Mentor Network', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'projects', label: 'Project Incubator', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'events', label: 'Campus Events', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'organizations', label: 'Partner Directory', icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Minor Protection & Purpose-Driven Notice */}
      <SafetyNoticeBanner onOpenReportModal={() => handleOpenReport('general', 'campus-desk')} />

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveWing(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeWing === item.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => handleOpenReport('general', 'safety-desk')}
          className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1.5 flex-shrink-0"
        >
          <ShieldAlert className="w-4 h-4" />
          <span className="hidden sm:inline">Safety Desk</span>
        </button>
      </div>

      {/* Active Wing Content */}
      <div className="transition-all duration-200">
        {activeWing === 'hall' && <CommunityHallView onOpenReportModal={handleOpenReport} />}
        {activeWing === 'mentors' && <MentorCenterView onOpenReportModal={handleOpenReport} />}
        {activeWing === 'projects' && <ProjectRoomView onOpenReportModal={handleOpenReport} />}
        {activeWing === 'events' && <EventCenterView onOpenReportModal={handleOpenReport} />}
        {activeWing === 'organizations' && <OrganizationCommunityView />}
      </div>

      {/* Safety Incident & Moderation Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        defaultItemType={reportItemType}
        defaultItemId={reportItemId}
      />
    </div>
  );
};
