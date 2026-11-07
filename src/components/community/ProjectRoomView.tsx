import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Users,
  Award,
  ThumbsUp,
  CheckCircle2,
  Clock,
  ExternalLink,
  Github,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  Target
} from 'lucide-react';
import { ClientStudentProject } from '../../types';
import { communityClient } from '../../services/communityClient';

interface Props {
  onOpenReportModal: (itemType: string, itemId: string) => void;
}

export const ProjectRoomView: React.FC<Props> = ({ onOpenReportModal }) => {
  const [projects, setProjects] = useState<ClientStudentProject[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<ClientStudentProject | null>(null);
  const [loading, setLoading] = useState(true);

  // Join modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRole, setJoinRole] = useState('Frontend & Khmer NLP Contributor');
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  const studentId = 'usr-student-01';
  const studentName = 'Dara Chan';

  useEffect(() => {
    loadProjects();
  }, [selectedCategory, selectedStage]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await communityClient.getProjects({
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        stage: selectedStage !== 'ALL' ? selectedStage : undefined
      });
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = async (project: ClientStudentProject) => {
    try {
      const details = await communityClient.getProjectDetails(project.slug);
      setSelectedProject(details);
    } catch (err) {
      setSelectedProject(project);
    }
  };

  const handleUpvoteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newCount = await communityClient.upvoteProject(projectId);
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, upvotes_count: newCount || p.upvotes_count + 1 } : p));
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(prev => prev ? { ...prev, upvotes_count: newCount || prev.upvotes_count + 1 } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      setJoining(true);
      await communityClient.joinProject(selectedProject.id, {
        user_id: studentId,
        user_name: studentName,
        role_in_project: joinRole
      });

      setJoinSuccess(true);
      setTimeout(() => {
        setJoinSuccess(false);
        setShowJoinModal(false);
        // Refresh project
        handleSelectProject(selectedProject);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Could not join project');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-lg">Student Project Collab & Innovation Labs</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Build real-world Cambodian STEM solutions with peer teams, earn CDES Merit Points, and incubate for National Competitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" /> Earn up to 100 Merit Points
          </span>
        </div>
      </div>

      {/* Main Layout: Grid or Detail */}
      {selectedProject ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-start justify-between">
            <button
              onClick={() => setSelectedProject(null)}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              ← Back to Project Incubator Directory
            </button>
            <button
              onClick={() => onOpenReportModal('project', selectedProject.id)}
              className="text-xs text-slate-400 hover:text-rose-600"
            >
              Flag Project
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  {selectedProject.category.replace('_', ' ')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                  Stage: {selectedProject.stage.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedProject.title}</h2>
              {selectedProject.title_km && (
                <p className="text-sm font-semibold text-slate-500 mt-0.5">{selectedProject.title_km}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleUpvoteProject(selectedProject.id, e)}
                className="px-4 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <ThumbsUp className="w-4 h-4" /> {selectedProject.upvotes_count} Upvotes
              </button>
              {selectedProject.current_team_size < selectedProject.max_team_size && (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Join Team ({selectedProject.current_team_size}/{selectedProject.max_team_size})
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-5">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Project Overview</h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedProject.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" /> Milestones & Verification Roadmaps
                </h4>
                <div className="space-y-2">
                  {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                    selectedProject.milestones.map((ms) => (
                      <div
                        key={ms.id}
                        className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                          ms.status === 'completed'
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {ms.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 text-xs">{ms.title}</h5>
                            <p className="text-[11px] text-slate-500 mt-0.5">{ms.description}</p>
                            <span className="text-[10px] text-slate-400 mt-1 inline-block">Due: {ms.due_date}</span>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
                          +{ms.merit_points} Merit Pts
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 text-center">
                      Initial milestones in development by the team lead.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar: Skills & Team */}
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h5 className="font-bold text-xs text-slate-800 mb-2">Required Skills & Tooling</h5>
                <div className="flex flex-wrap gap-1.5">
                  {(typeof selectedProject.required_skills === 'string'
                    ? JSON.parse(selectedProject.required_skills)
                    : selectedProject.required_skills
                  ).map((skill: string, i: number) => (
                    <span key={i} className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h5 className="font-bold text-xs text-slate-800 mb-3 flex items-center justify-between">
                  <span>Collaborators</span>
                  <span className="text-[11px] text-blue-600 font-semibold">
                    {selectedProject.current_team_size} / {selectedProject.max_team_size} slots
                  </span>
                </h5>

                <div className="flex items-center gap-2.5 mb-3 p-2 bg-white rounded-lg border border-slate-200">
                  <img
                    src={selectedProject.creator_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={selectedProject.creator_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{selectedProject.creator_name}</span>
                    <span className="text-[10px] text-slate-500">Project Founder & Lead</span>
                  </div>
                </div>

                {selectedProject.members && selectedProject.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2.5 mt-2 p-2 bg-white rounded-lg border border-slate-200">
                    <img
                      src={m.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={m.user_name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{m.user_name}</span>
                      <span className="text-[10px] text-blue-600 font-medium">{m.role_in_project}</span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedProject.repository_url && (
                <a
                  href={selectedProject.repository_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Github className="w-4 h-4" /> Open Source Repository
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Projects Directory Grid */
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category:</span>
            {['ALL', 'ai_software', 'robotics_hardware', 'biotech_science', 'clean_energy', 'civic_tech'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat === 'ALL' ? 'All Domains' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const skills = typeof proj.required_skills === 'string'
                ? JSON.parse(proj.required_skills)
                : proj.required_skills;

              return (
                <div
                  key={proj.id}
                  onClick={() => handleSelectProject(proj)}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                        {proj.category.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {proj.stage}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mt-2.5 line-clamp-1">{proj.title}</h4>
                    {proj.title_km && (
                      <p className="text-xs text-slate-500 line-clamp-1">{proj.title_km}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {skills.slice(0, 3).map((s: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>{proj.current_team_size} / {proj.max_team_size} team</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Award className="w-3 h-3 text-amber-600" />
                      <span>+{proj.merit_points_reward} pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Join Project Modal */}
      {showJoinModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Join Innovation Project Team</h3>
              <button onClick={() => setShowJoinModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {joinSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Collaboration Request Accepted</h4>
                <p className="text-xs text-slate-500">You are now registered as a collaborator on {selectedProject.title}.</p>
              </div>
            ) : (
              <form onSubmit={handleJoinProject} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Contribution Role</label>
                  <input
                    type="text"
                    value={joinRole}
                    onChange={(e) => setJoinRole(e.target.value)}
                    placeholder="e.g. Model testing, Hardware prototyping, Dataset collection"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-800 border border-blue-200 leading-relaxed">
                  💡 By joining, you commit to collaborative teamwork and academic honesty under CDES project guidelines.
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={joining}
                    className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {joining ? 'Joining...' : 'Confirm Team Membership'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
