import { TelemetryEvent } from '../types';

type EventListener = (event: TelemetryEvent) => void;

class AnalyticsTracker {
  private events: TelemetryEvent[] = [];
  private listeners: Set<EventListener> = new Set();
  private userId: string = 'stu-001';

  constructor() {
    // Seed initial realistic events to show rich historical event tracking
    this.events = [
      {
        id: 'evt-init-1',
        eventName: 'search_university',
        data: { keyword: 'Computer Science', filter_used: 'Engineering & Tech', results_count: 5 },
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString(),
        userId: 'stu-001',
      },
      {
        id: 'evt-init-2',
        eventName: 'view_university',
        data: { university_id: 'univ-cadt', university_name: 'CADT', tuition: 1600 },
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toLocaleTimeString(),
        userId: 'stu-001',
      },
      {
        id: 'evt-init-3',
        eventName: 'calculate_roi',
        data: {
          university: 'CADT',
          scholarship_percent: 100,
          degree_cost: 0,
          starting_salary_monthly: 850,
          payback_months: 0,
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toLocaleTimeString(),
        userId: 'stu-001',
      },
    ];
  }

  public setUserId(id: string) {
    this.userId = id;
  }

  public track(eventName: TelemetryEvent['eventName'], data: Record<string, any>) {
    const event: TelemetryEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventName,
      data,
      timestamp: new Date().toLocaleTimeString(),
      userId: this.userId,
    };

    this.events.unshift(event);
    if (this.events.length > 50) {
      this.events.pop();
    }

    // Notify UI listeners
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Analytics listener error:', err);
      }
    });

    // Optional beacon to backend server
    try {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {
        // Silently ignore if offline
      });
    } catch {
      // ignore
    }

    return event;
  }

  public getRecentEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  public subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public clear() {
    this.events = [];
    this.listeners.forEach((listener) => listener({
      id: 'clear',
      eventName: 'filter_universities',
      data: { action: 'cleared' },
      timestamp: new Date().toLocaleTimeString(),
      userId: this.userId,
    }));
  }
}

export const analytics = new AnalyticsTracker();
