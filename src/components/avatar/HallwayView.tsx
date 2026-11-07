import React from 'react';
import {
  DoorOpen,
  BookOpen,
  FlaskConical,
  Compass,
  Users,
  Home,
  ArrowRight,
  Sparkles,
  Lock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ClientWorldLocation } from '../../types';

interface HallwayViewProps {
  locations: ClientWorldLocation[];
  onReturnToRoom: () => void;
  onNavigateDestination: (slug: string) => void;
}

export const HallwayView: React.FC<HallwayViewProps> = ({
  locations,
  onReturnToRoom,
  onNavigateDestination,
}) => {
  const destinationMeta: Record<
    string,
    {
      icon: React.ReactNode;
      color: string;
      tag: string;
      targetTab: string;
      features: string[];
      ambientBg: string;
    }
  > = {
    room: {
      icon: <Home className="w-6 h-6 text-blue-600" />,
      color: 'blue',
      tag: 'Sanctuary',
      targetTab: 'room',
      features: ['Personal Desk', 'Achievement Wall', 'Custom Room Theme'],
      ambientBg: 'from-blue-50 to-indigo-50/50',
    },
    library: {
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
      color: 'emerald',
      tag: 'MoEYS Syllabus & Digital Library',
      targetTab: 'library',
      features: ['National Curriculum Guides', 'Calculus & Organic Chemistry', 'Interactive Optics Canvas'],
      ambientBg: 'from-emerald-50 to-teal-50/50',
    },
    laboratory: {
      icon: <FlaskConical className="w-6 h-6 text-purple-600" />,
      color: 'purple',
      tag: 'Virtual STEM Workbench',
      targetTab: 'laboratory',
      features: ['Acid-Base Titration Burette', 'Harmonic Pendulum Rig', 'Cellular Osmosis Microscope'],
      ambientBg: 'from-purple-50 to-indigo-50/50',
    },
    stem_activities: {
      icon: <Sparkles className="w-6 h-6 text-blue-600" />,
      color: 'blue',
      tag: 'Interactive STEM Challenges',
      targetTab: 'stem_activities',
      features: ['Binary Logic Gate Puzzles', 'Orbital Velocity Simulator', 'Solar Microgrid Project'],
      ambientBg: 'from-blue-50 to-cyan-50/50',
    },
    learning_paths: {
      icon: <Compass className="w-6 h-6 text-indigo-600" />,
      color: 'indigo',
      tag: 'Sequential STEM Roadmaps',
      targetTab: 'learning_paths',
      features: ['AI Systems Engineer Path', 'Bac II STEM Excellence', 'Clean Energy Technologist'],
      ambientBg: 'from-indigo-50 to-purple-50/50',
    },
    career_center: {
      icon: <Compass className="w-6 h-6 text-amber-600" />,
      color: 'amber',
      tag: 'University Intelligence & Mentors',
      targetTab: 'career_center',
      features: ['Decision Engine Matrix', '1-on-1 Alumni Mentors', 'University ROI Analysis'],
      ambientBg: 'from-amber-50 to-orange-50/50',
    },
    community: {
      icon: <Users className="w-6 h-6 text-rose-600" />,
      color: 'rose',
      tag: 'Student Peer Commons',
      targetTab: 'community',
      features: ['Study Circles', 'Exam Preparation Meetups', 'Senior Student AMA Channels'],
      ambientBg: 'from-rose-50 to-pink-50/50',
    },
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-400/30 mb-3">
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Central Academic Hallway • សាលធំមជ្ឈមណ្ឌលសិក្សា</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Digital Education World Navigation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            The grand rotunda connecting your personal study sanctuary with the National Digital
            Library, STEM Simulation Laboratories, Career Intelligence, and the Student Peer Commons.
          </p>

          <div className="mt-4 flex items-center space-x-3">
            <button
              onClick={onReturnToRoom}
              className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl shadow hover:bg-slate-100 transition-colors flex items-center space-x-1.5"
            >
              <Home className="w-4 h-4 text-blue-600" />
              <span>Back to My Personal Room</span>
            </button>
            <span className="text-xs text-slate-400">All corridors safe for children & student collaboration.</span>
          </div>
        </div>
      </div>

      {/* Hallway Architectural Map Layout */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Campus Wing Corridors</h3>
            <p className="text-xs text-slate-500">
              Select any academic portal to enter or preview interactive facilities
            </p>
          </div>
          <div className="flex items-center space-x-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Protected Academic Zone</span>
          </div>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => {
            const meta = destinationMeta[loc.slug] || destinationMeta.library;

            return (
              <div
                key={loc.id}
                className="rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-5 flex flex-col justify-between bg-gradient-to-b bg-white group cursor-pointer"
                onClick={() => onNavigateDestination(loc.slug)}
              >
                <div>
                  {/* Top Header of Card */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      {meta.icon}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                      {meta.tag}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
                      <span>{loc.name}</span>
                    </h4>
                    {loc.name_km && (
                      <p className="text-[11px] text-slate-500 font-serif mt-0.5">{loc.name_km}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{loc.description}</p>
                  </div>

                  {/* Highlights */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    {meta.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center text-[11px] text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Enter Wing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] text-slate-400">Open Access</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Digital Learning World Active Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Phase 5: Digital Learning World Foundation Active
            </h4>
            <p className="text-xs text-slate-600">
              Complete Virtual Labs, explore the Digital Library, and advance sequential STEM roadmaps to earn equipable room apparatus!
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-xs">
          Interactive Learning Live
        </span>
      </div>
    </div>
  );
};
