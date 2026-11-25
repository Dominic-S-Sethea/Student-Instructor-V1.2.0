import type { Request, Response, NextFunction } from 'express';

export interface RouteMetricSummary {
  count: number;
  errors4xx: number;
  errors5xx: number;
  p50Ms: number;
  p95Ms: number;
}

class HttpMetricsStore {
  private static readonly MAX_TRACKED_ROUTES = 300;
  private totalRequests = 0;
  private status4xx = 0;
  private status5xx = 0;
  private latencies: number[] = [];
  private routes = new Map<string, { count: number; errors4xx: number; errors5xx: number; latencies: number[] }>();

  public record(method: string, routePath: string, statusCode: number, durationMs: number): void {
    this.totalRequests += 1;
    if (statusCode >= 400 && statusCode < 500) this.status4xx += 1;
    if (statusCode >= 500) this.status5xx += 1;

    this.latencies.push(durationMs);
    if (this.latencies.length > 500) this.latencies.shift();

    const key = `${method.toUpperCase()} ${routePath}`;
    let entry = this.routes.get(key);
    if (!entry) {
      if (this.routes.size >= HttpMetricsStore.MAX_TRACKED_ROUTES) {
        const oldest = this.routes.keys().next().value;
        if (oldest !== undefined) {
          this.routes.delete(oldest);
        }
      }
      entry = { count: 0, errors4xx: 0, errors5xx: 0, latencies: [] };
    } else {
      // Refresh LRU insertion order
      this.routes.delete(key);
    }
    entry.count += 1;
    if (statusCode >= 400 && statusCode < 500) entry.errors4xx += 1;
    if (statusCode >= 500) entry.errors5xx += 1;
    entry.latencies.push(durationMs);
    if (entry.latencies.length > 200) entry.latencies.shift();
    this.routes.set(key, entry);
  }

  private percentile(values: number[], pct: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((pct / 100) * sorted.length) - 1));
    return Math.round(sorted[idx] * 100) / 100;
  }

  public getSnapshot() {
    const byRoute: Record<string, RouteMetricSummary> = {};
    for (const [k, v] of this.routes.entries()) {
      byRoute[k] = {
        count: v.count,
        errors4xx: v.errors4xx,
        errors5xx: v.errors5xx,
        p50Ms: this.percentile(v.latencies, 50),
        p95Ms: this.percentile(v.latencies, 95),
      };
    }

    return {
      totalRequests: this.totalRequests,
      errors4xx: this.status4xx,
      errors5xx: this.status5xx,
      p50Ms: this.percentile(this.latencies, 50),
      p95Ms: this.percentile(this.latencies, 95),
      routes: byRoute,
    };
  }

  public reset(): void {
    this.totalRequests = 0;
    this.status4xx = 0;
    this.status5xx = 0;
    this.latencies = [];
    this.routes.clear();
  }
}

export const httpMetricsStore = new HttpMetricsStore();

/** Records request status counts and latency percentiles per route. */
export function httpMetricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const routePattern = req.route?.path ? `${req.baseUrl || ''}${String(req.route.path)}` : 'UNMATCHED';
    httpMetricsStore.record(req.method || 'GET', routePattern, res.statusCode, elapsedMs);
  });
  next();
}
