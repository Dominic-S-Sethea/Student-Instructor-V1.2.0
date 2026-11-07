import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Users,
  Calendar,
  Clock,
  Video,
  MapPin,
  MessageSquare,
  Plus,
  Send,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { StudentMeetup, StudentProfile } from '../types';

interface StudentMeetupsViewProps {
  meetups: StudentMeetup[];
  studentProfile: StudentProfile;
  onToggleJoinMeetup: (meetupId: string) => void;
  onHostMeetup: (newMeetup: Partial<StudentMeetup>) => void;
  onAddChatMessage: (meetupId: string, text: string) => void;
}

export const StudentMeetupsView: React.FC<StudentMeetupsViewProps> = ({
  meetups,
  studentProfile,
  onToggleJoinMeetup,
  onHostMeetup,
  onAddChatMessage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeMeetup, setActiveMeetup] = useState<StudentMeetup | null>(meetups[0] || null);
  const [showHostModal, setShowHostModal] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const categories = ['ALL', 'Exam Review', 'University Prep', 'Coding & Tech', 'Language / IELTS'];

  const filteredMeetups = selectedCategory === 'ALL'
    ? meetups
    : meetups.filter((m) => m.category === selectedCategory);

  const handleJoinClick = (m: StudentMeetup) => {
    onToggleJoinMeetup(m.id);
    if (!m.isJoined) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeMeetup) return;
    onAddChatMessage(activeMeetup.id, chatInput.trim());
    setChatInput('');
  };

  // Form state for host meetup
  const [hostForm, setHostForm] = useState({
    title: '',
    category: 'Exam Review' as StudentMeetup['category'],
    topic: '',
    objective: '',
    date: 'Saturday, Sep 13',
    time: '2:00 PM - 3:30 PM',
    format: 'online' as 'online' | 'in-person' | 'hybrid',
    location: 'Google Meet',
    meetingLink: 'https://meet.google.com/ais-study-circle',
    maxParticipants: 20,
    materialsOrPrep: 'Review calculus past exam papers.',
  });

  const handleCreateMeetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostForm.title.trim()) return;

    const studentAvatarFallback =
      studentProfile?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

    onHostMeetup({
      ...hostForm,
      hostStudentId: studentProfile?.id || 'stu-001',
      hostName: studentProfile?.name || 'Student',
      hostAvatar: studentAvatarFallback,
      hostGradeLevel: studentProfile?.educationLevel || 'Grade 12',
      currentParticipantsCount: 1,
      isJoined: true,
      participants: [
        {
          id: studentProfile?.id || 'stu-001',
          name: studentProfile?.name || 'Student',
          avatar: studentAvatarFallback,
          role: 'Host',
        },
      ],
      chatMessages: [
        {
          id: 'welcome',
          senderId: studentProfile?.id || 'stu-001',
          senderName: studentProfile?.name || 'Student',
          senderAvatar: studentAvatarFallback,
          timestamp: 'Just now',
          text: `Welcome to ${hostForm.title}! Feel free to post study questions and resources here.`,
          isHost: true,
        },
      ],
      status: 'upcoming',
      tags: [hostForm.category, 'Study Group'],
      duration: '90 mins',
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setShowHostModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              Peer Student Meetups & Study Groups
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Never revise alone. Join student-led Bac II exam marathons, ITC Tronc Commun mechanics groups, and coding study circles.
          </p>
        </div>

        <button
          onClick={() => setShowHostModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Host a Study Meetup</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2-Column: Meetups on Left, Room/Chat on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-6 space-y-4">
          {filteredMeetups.map((meetup) => {
            const isCurrent = activeMeetup?.id === meetup.id;
            return (
              <div
                key={meetup.id}
                onClick={() => setActiveMeetup(meetup)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isCurrent
                    ? 'bg-white border-indigo-600 shadow-md ring-1 ring-indigo-600'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-800">
                    {meetup.category}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    👥 {meetup.currentParticipantsCount}/{meetup.maxParticipants} joined
                  </span>
                </div>

                <div>
                  <h2 className="font-bold text-stone-900 text-base leading-snug">
                    {meetup.title}
                  </h2>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                    {meetup.objective}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{meetup.date}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{meetup.time}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Video className="w-3.5 h-3.5" />
                    <span className="capitalize">{meetup.format}</span>
                  </span>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={meetup.hostAvatar}
                      alt={meetup.hostName}
                      className="w-6 h-6 rounded-full object-cover border border-stone-200"
                    />
                    <span className="text-xs text-stone-600 font-medium">Host: {meetup.hostName}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinClick(meetup);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      meetup.isJoined
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                    }`}
                  >
                    {meetup.isJoined ? 'Joined ✓' : 'Join Session'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Active Meetup Room & Live Discussion */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 flex flex-col h-[650px] shadow-xs">
          {activeMeetup ? (
            <div className="flex flex-col h-full space-y-4">
              {/* Meetup Room Header */}
              <div className="border-b border-stone-100 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    {activeMeetup.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    {activeMeetup.isJoined ? (
                      <a
                        href={activeMeetup.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs flex items-center space-x-1"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Launch Google Meet</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    ) : (
                      <button
                        onClick={() => handleJoinClick(activeMeetup)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs"
                      >
                        Join This Group
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="text-lg font-bold text-stone-900 leading-snug">
                  {activeMeetup.title}
                </h2>

                <div className="bg-stone-50 p-2.5 rounded-xl text-xs text-stone-700 flex items-start space-x-2">
                  <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900">Preparation & Materials: </span>
                    <span>{activeMeetup.materialsOrPrep}</span>
                  </div>
                </div>
              </div>

              {/* In-Meetup Live Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                    Study Group Chat Room
                  </span>
                </div>

                {activeMeetup.chatMessages.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-xs text-stone-400">
                    No messages yet. Be the first to share notes or questions!
                  </div>
                ) : (
                  activeMeetup.chatMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start space-x-2.5 text-xs">
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                      />
                      <div className="flex-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 flex items-center space-x-1">
                            <span>{msg.senderName}</span>
                            {msg.isHost && (
                              <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-semibold">
                                Host
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-stone-400">{msg.timestamp}</span>
                        </div>
                        <p className="text-stone-700 leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="flex items-center space-x-2 pt-2 border-t border-stone-100">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Share a past exam question, note, or problem..."
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-stone-400">
              Select a study meetup to view room details and live chat.
            </div>
          )}
        </div>
      </div>

      {/* Host a Meetup Modal */}
      {showHostModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Host a Student Study Meetup</span>
              </h3>
              <button
                onClick={() => setShowHostModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeetup} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Meetup Title</label>
                <input
                  type="text"
                  required
                  value={hostForm.title}
                  onChange={(e) => setHostForm({ ...hostForm, title: e.target.value })}
                  placeholder="e.g. Bac II Grade 12 Physics Mechanics Sprint"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={hostForm.category}
                    onChange={(e) => setHostForm({ ...hostForm, category: e.target.value as any })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900"
                  >
                    <option>Exam Review</option>
                    <option>University Prep</option>
                    <option>Coding & Tech</option>
                    <option>Language / IELTS</option>
                    <option>General STEM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Max Students</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={hostForm.maxParticipants}
                    onChange={(e) => setHostForm({ ...hostForm, maxParticipants: parseInt(e.target.value) || 20 })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Session Objective</label>
                <textarea
                  required
                  rows={2}
                  value={hostForm.objective}
                  onChange={(e) => setHostForm({ ...hostForm, objective: e.target.value })}
                  placeholder="What will peers accomplish during this session?"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Date</label>
                  <input
                    type="text"
                    value={hostForm.date}
                    onChange={(e) => setHostForm({ ...hostForm, date: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={hostForm.time}
                    onChange={(e) => setHostForm({ ...hostForm, time: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowHostModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Publish Meetup ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
