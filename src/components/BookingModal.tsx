import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ExternalLink, X } from 'lucide-react';
import { Mentor, SessionBooking, StudentProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useEscapeKey } from '../hooks/useModalAccessibility';
import { getSafeHttpUrl } from '../utils/safeUrl';

interface BookingModalProps {
  mentor: Mentor;
  studentProfile: StudentProfile;
  onClose: () => void;
  onConfirmBooking: (booking: SessionBooking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  mentor,
  studentProfile,
  onClose,
  onConfirmBooking,
}) => {
  const { authenticated, user, profile: authProfile } = useAuth();
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<{ dayIdx: number; timeIdx: number }>({
    dayIdx: 0,
    timeIdx: 0,
  });
  const [selectedTopic, setSelectedTopic] = useState(mentor.mentoringTopics[0] || 'Degree & Exam Advisory');
  const [customNotes, setCustomNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<SessionBooking | null>(null);

  useEscapeKey(true, onClose);

  const currentDay = mentor.availableSlots[selectedSlotIndex.dayIdx];
  const currentTime = currentDay?.times[selectedSlotIndex.timeIdx] || '17:30';
  const resolvedStudentName =
    (authenticated && (authProfile?.name || user?.email?.split('@')[0])) || studentProfile.name || 'Student';

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking: SessionBooking = {
      id: `ses-${Date.now()}`,
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorAvatar: mentor.avatar,
      mentorTitle: mentor.title,
      studentName: resolvedStudentName,
      date: `${currentDay.day}, ${currentDay.date}`,
      time: `${currentTime} - ${parseInt(currentTime.split(':')[0], 10) + 1}:${currentTime.split(':')[1]}`,
      durationMinutes: 45,
      topic: selectedTopic,
      meetingLink: `https://meet.google.com/ais-${mentor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
      status: 'confirmed',
      notes: customNotes || 'Looking forward to learning about university curriculum and study techniques.',
    };

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setCreatedBooking(newBooking);
    setIsSuccess(true);
    onConfirmBooking(newBooking);
  };

  const safeMeetingUrl = createdBooking ? getSafeHttpUrl(createdBooking.meetingLink) : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Book mentorship session with ${mentor.name}`}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {!isSuccess ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    Book 1-on-1 with {mentor.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{mentor.title} • Session Planner Preview</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close booking dialog"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBook} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                  1. Select Day &amp; Date
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {mentor.availableSlots.map((slot, dayIdx) => (
                    <button
                      key={dayIdx}
                      type="button"
                      onClick={() => setSelectedSlotIndex({ dayIdx, timeIdx: 0 })}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedSlotIndex.dayIdx === dayIdx
                          ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 font-bold text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-600'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="block text-[11px] font-semibold">{slot.day}</span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400">{slot.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                  2. Choose Start Time (45 Mins Virtual Session)
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentDay.times.map((timeStr, timeIdx) => (
                    <button
                      key={timeIdx}
                      type="button"
                      onClick={() => setSelectedSlotIndex((prev) => ({ ...prev, timeIdx }))}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        selectedSlotIndex.timeIdx === timeIdx
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {timeStr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                  3. Select Session Objective
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {mentor.mentoringTopics.map((topic, i) => (
                    <option key={i} value={topic}>
                      {topic}
                    </option>
                  ))}
                  <option value="General Academic & Career Advice">General Academic &amp; Career Advice</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                  4. Questions or Background Notes for {mentor.name} (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. I am in Grade 12 preparing for Bac II and want to ask about ITC Tronc Commun math..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Note: This preview saves the session request to your current browser session. For live community bookings, use the Community Mentor Center.
              </p>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Save Session Request</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xl">Session Saved</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your 1-on-1 guidance request with {mentor.name} has been added for {resolvedStudentName}.
              </p>
            </div>

            {createdBooking && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Date &amp; Time:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {createdBooking.date} @ {createdBooking.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Topic:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{createdBooking.topic}</span>
                </div>
                {safeMeetingUrl && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Session Link:</span>
                    <a
                      href={safeMeetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center space-x-1 hover:underline"
                    >
                      <span>Meeting Room</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
