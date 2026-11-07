import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Mentor, SessionBooking, StudentProfile } from '../types';

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
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<{ dayIdx: number; timeIdx: number }>({
    dayIdx: 0,
    timeIdx: 0,
  });
  const [selectedTopic, setSelectedTopic] = useState(mentor.mentoringTopics[0] || 'Degree & Exam Advisory');
  const [customNotes, setCustomNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<SessionBooking | null>(null);

  const currentDay = mentor.availableSlots[selectedSlotIndex.dayIdx];
  const currentTime = currentDay?.times[selectedSlotIndex.timeIdx] || '17:30';

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();

    const newBooking: SessionBooking = {
      id: `ses-${Date.now()}`,
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorAvatar: mentor.avatar,
      mentorTitle: mentor.title,
      studentName: studentProfile.name,
      date: `${currentDay.day}, ${currentDay.date}`,
      time: `${currentTime} - ${parseInt(currentTime.split(':')[0]) + 1}:${currentTime.split(':')[1]}`,
      durationMinutes: 45,
      topic: selectedTopic,
      meetingLink: `https://meet.google.com/ais-${mentor.name.toLowerCase().replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`,
      status: 'confirmed',
      notes: customNotes || 'Looking forward to learning about university curriculum and study techniques.',
    };

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });

    setCreatedBooking(newBooking);
    setIsSuccess(true);
    onConfirmBooking(newBooking);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
        {!isSuccess ? (
          <>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-3">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                />
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    Book 1-on-1 with {mentor.name}
                  </h3>
                  <p className="text-xs text-stone-500">{mentor.title} • Free Mentorship</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-stone-400 hover:text-stone-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBook} className="space-y-4 text-xs">
              {/* Day selection */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5 uppercase tracking-wider text-[10px]">
                  1. Select Day & Date
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {mentor.availableSlots.map((slot, dayIdx) => (
                    <button
                      key={dayIdx}
                      type="button"
                      onClick={() => setSelectedSlotIndex({ dayIdx, timeIdx: 0 })}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedSlotIndex.dayIdx === dayIdx
                          ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-900 ring-1 ring-indigo-600'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span className="block text-[11px] font-semibold">{slot.day}</span>
                      <span className="block text-[10px] text-stone-500">{slot.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slot selection */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5 uppercase tracking-wider text-[10px]">
                  2. Choose Start Time (45 Mins Virtual Session)
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentDay.times.map((timeStr, timeIdx) => (
                    <button
                      key={timeIdx}
                      type="button"
                      onClick={() => setSelectedSlotIndex((prev) => ({ ...prev, timeIdx }))}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        selectedSlotIndex.timeIdx === timeIdx
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      {timeStr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic picker */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5 uppercase tracking-wider text-[10px]">
                  3. Select Session Objective
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none"
                >
                  {mentor.mentoringTopics.map((topic, i) => (
                    <option key={i} value={topic}>
                      {topic}
                    </option>
                  ))}
                  <option value="General Academic & Career Advice">General Academic & Career Advice</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5 uppercase tracking-wider text-[10px]">
                  4. Questions or Background Notes for {mentor.name} (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. I am in Grade 12 preparing for Bac II and want to ask about ITC Tronc Commun math..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-50 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <span>Confirm Free Booking</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className="py-4 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-stone-900 text-xl">Session Booked! 🎉</h3>
              <p className="text-xs text-stone-600">
                Your 1-on-1 guidance with {mentor.name} is confirmed.
              </p>
            </div>

            {createdBooking && (
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-left text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Date & Time:</span>
                  <span className="font-bold text-stone-900">
                    {createdBooking.date} @ {createdBooking.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Topic:</span>
                  <span className="font-bold text-stone-900 line-clamp-1">{createdBooking.topic}</span>
                </div>
                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Virtual Link:</span>
                  <a
                    href={createdBooking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 font-semibold flex items-center space-x-1 hover:underline"
                  >
                    <span>Google Meet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
