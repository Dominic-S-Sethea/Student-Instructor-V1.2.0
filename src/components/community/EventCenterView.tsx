import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Video,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  ExternalLink,
  Award,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { ClientCampusEvent } from '../../types';
import { communityClient } from '../../services/communityClient';

interface Props {
  onOpenReportModal: (itemType: string, itemId: string) => void;
  studentRole?: string;
}

export const EventCenterView: React.FC<Props> = ({ onOpenReportModal, studentRole = 'Student' }) => {
  const [events, setEvents] = useState<ClientCampusEvent[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  useEffect(() => {
    void loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTypeFilter]);

  const loadEvents = async (): Promise<void> => {
    try {
      setLoading(true);
      setRsvpError(null);
      const data = await communityClient.getEvents(eventTypeFilter !== 'ALL' ? eventTypeFilter : undefined);
      setEvents(data);
    } catch (err) {
      setRsvpError(err instanceof Error ? err.message : 'Failed to load campus events.');
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (eventId: string): Promise<void> => {
    try {
      setRsvpError(null);
      await communityClient.rsvpEvent(eventId, {
        response: 'yes',
        notes: studentRole
      });

      setRegisteredEventIds(prev => new Set(prev).add(eventId));
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, current_rsvp_count: e.current_rsvp_count + 1 } : e));
    } catch (err) {
      setRsvpError(err instanceof Error ? err.message : 'Could not register for event');
    }
  };

  const getFormatBadge = (format: string) => {
    switch (format) {
      case 'virtual':
        return { label: 'Virtual Meet', icon: <Video className="w-3 h-3 text-blue-500" />, bg: 'bg-blue-50 text-blue-700' };
      case 'hybrid':
        return { label: 'Hybrid Format', icon: <Sparkles className="w-3 h-3 text-purple-500" />, bg: 'bg-purple-50 text-purple-700' };
      default:
        return { label: 'Physical Campus', icon: <MapPin className="w-3 h-3 text-emerald-500" />, bg: 'bg-emerald-50 text-emerald-700' };
    }
  };

  const parseTags = (rawTags: string | string[] | undefined): string[] => {
    if (Array.isArray(rawTags)) return rawTags;
    if (typeof rawTags !== 'string') return [];
    try {
      const parsed: unknown = JSON.parse(rawTags);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-lg">Digital Campus Event Center & Hackathons</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Participate in MoEYS-endorsed workshops, university entrance exam walkthroughs, and national STEM innovation competitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type:</span>
          <div className="flex flex-wrap gap-1">
            {['ALL', 'workshop', 'hackathon', 'competition', 'webinar', 'ama_session'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setEventTypeFilter(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition capitalize ${
                  eventTypeFilter === t
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'ALL' ? 'All Events' : t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {rsvpError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700 flex items-center justify-between gap-2"
        >
          <span>{rsvpError}</span>
          <button
            type="button"
            onClick={() => setRsvpError(null)}
            className="text-rose-800 font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {events.map((event) => {
          const isRegistered = registeredEventIds.has(event.id);
          const format = getFormatBadge(event.event_format);
          const tags = parseTags(event.tags);
          const startDate = new Date(event.start_time).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
          const startTime = new Date(event.start_time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={event.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {event.event_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${format.bg}`}>
                      {format.icon}
                      {format.label}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {startDate}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-3 leading-snug">{event.title}</h3>
                {event.title_km && (
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{event.title_km}</p>
                )}

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {event.description}
                </p>

                {/* Speaker Card */}
                {event.speaker_name && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                    <img
                      src={event.speaker_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={event.speaker_name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{event.speaker_name}</h4>
                      <p className="text-[11px] text-slate-500">{event.speaker_title} • {event.host_organization}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {tags.map((tag: string, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong className="text-slate-900">{event.current_rsvp_count}</strong> / {event.max_participants} registered
                  </span>
                </div>

                {isRegistered ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> RSVP Confirmed
                  </div>
                ) : (
                  <button
                    onClick={() => void handleRsvp(event.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    RSVP Free Registration
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
