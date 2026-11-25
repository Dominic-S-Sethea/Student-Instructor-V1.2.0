import { TelemetryEvent } from '../types';
import { apiPost } from '../services/apiClient';

type EventListener = (event: TelemetryEvent) => void;

class AnalyticsTracker {
  private events: TelemetryEvent[] = [];
  private listeners: Set<EventListener> = new Set();
  private userId: string = 'guest';

  public setUserId(id: string) {
    this.userId = id || 'guest';
  }

  public track(eventName: TelemetryEvent['eventName'], data: Record<string, unknown>) {
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

    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch {
        // ignore listener failure
      }
    });

    if (this.userId !== 'guest') {
      apiPost('/api/analytics/track', {
        eventType: eventName,
        metadata: data,
      }).catch(() => {
        // Ignore unauthenticated/unconsented telemetry errors
      });
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
  }
}

export const analytics = new AnalyticsTracker();
