import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, ChevronUp, ChevronDown, Trash2, Radio, Server, Check } from 'lucide-react';
import { TelemetryEvent } from '../types';
import { analytics } from '../utils/analytics';

export const AnalyticsTelemetryDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<TelemetryEvent[]>(analytics.getRecentEvents());
  const [selectedEvent, setSelectedEvent] = useState<TelemetryEvent | null>(null);

  useEffect(() => {
    const unsubscribe = analytics.subscribe((newEvent) => {
      setEvents(analytics.getRecentEvents());
    });
    return () => unsubscribe();
  }, []);

  const getEventBadge = (name: TelemetryEvent['eventName']) => {
    switch (name) {
      case 'view_university':
        return 'bg-blue-100 text-blue-800';
      case 'compare_university':
        return 'bg-purple-100 text-purple-800';
      case 'calculate_roi':
        return 'bg-emerald-100 text-emerald-800';
      case 'complete_decision_assessment':
        return 'bg-amber-100 text-amber-900';
      case 'search_university':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed bottom-3 right-4 z-40">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 text-white text-xs font-bold shadow-lg hover:bg-slate-800 border border-slate-700/60 backdrop-blur-xs transition-all cursor-pointer group"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Activity className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span>Live Telemetry Stream</span>
          <span className="bg-indigo-600 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {events.length}
          </span>
          <ChevronUp className="w-3.5 h-3.5 opacity-70" />
        </button>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-96 max-w-[95vw] p-4 text-left space-y-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>Decision Intelligence Telemetry</span>
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  analytics.clear();
                  setEvents([]);
                  setSelectedEvent(null);
                }}
                title="Clear Event Log"
                className="text-gray-400 hover:text-rose-500 p-1 rounded-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Server className="w-3 h-3 text-emerald-600" /> Layer 4 Event Stream
            </span>
            <span className="text-[10px] text-emerald-700 font-bold">API Ingestion Live</span>
          </div>

          {/* Events List */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {events.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">
                No events captured yet. Navigate tabs, compare universities, or calculate ROI to stream events.
              </div>
            ) : (
              events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt === selectedEvent ? null : evt)}
                  className={`p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedEvent?.id === evt.id
                      ? 'border-indigo-500 bg-indigo-50/50'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${getEventBadge(evt.eventName)}`}>
                      {evt.eventName}
                    </span>
                    <span className="text-[10px] text-gray-400">{evt.timestamp}</span>
                  </div>

                  {selectedEvent?.id === evt.id && (
                    <div className="mt-2 bg-slate-900 text-slate-100 p-2 rounded-lg text-[10px] font-mono overflow-x-auto">
                      <pre>{JSON.stringify(evt.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="text-[10px] text-gray-400 text-center pt-1 border-t border-gray-100">
            Capturing user decisions to refine student fit recommendations
          </div>
        </div>
      )}
    </div>
  );
};
