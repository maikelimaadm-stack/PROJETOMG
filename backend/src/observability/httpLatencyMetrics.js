const MAX_SAMPLES_PER_ROUTE = 500;
const routeStats = new Map();

const getRouteKey = ({ method, route }) => `${String(method || "GET").toUpperCase()} ${route || "unknown"}`;

const percentile = (sortedValues, ratio) => {
  if (!sortedValues.length) return 0;
  const index = Math.min(sortedValues.length - 1, Math.max(0, Math.ceil(sortedValues.length * ratio) - 1));
  return Number(sortedValues[index] || 0);
};

export const recordHttpLatency = ({ method, route, durationMs, statusCode }) => {
  if (!Number.isFinite(durationMs) || durationMs < 0) return;
  const key = getRouteKey({ method, route });
  const entry = routeStats.get(key) || {
    method: String(method || "GET").toUpperCase(),
    route: route || "unknown",
    samples: [],
    totalCount: 0,
    errors4xx: 0,
    errors5xx: 0,
  };
  entry.totalCount += 1;
  if (statusCode >= 400 && statusCode < 500) entry.errors4xx += 1;
  if (statusCode >= 500) entry.errors5xx += 1;
  entry.samples.push(durationMs);
  if (entry.samples.length > MAX_SAMPLES_PER_ROUTE) {
    entry.samples.splice(0, entry.samples.length - MAX_SAMPLES_PER_ROUTE);
  }
  routeStats.set(key, entry);
};

export const getHttpLatencySnapshot = () =>
  [...routeStats.values()]
    .map((entry) => {
      const sorted = [...entry.samples].sort((a, b) => a - b);
      const count = sorted.length;
      const total = sorted.reduce((acc, value) => acc + value, 0);
      const avg = count > 0 ? total / count : 0;
      return {
        method: entry.method,
        route: entry.route,
        samples: count,
        totalCount: entry.totalCount,
        avgMs: Number(avg.toFixed(2)),
        p50Ms: Number(percentile(sorted, 0.5).toFixed(2)),
        p95Ms: Number(percentile(sorted, 0.95).toFixed(2)),
        p99Ms: Number(percentile(sorted, 0.99).toFixed(2)),
        maxMs: Number((sorted[count - 1] || 0).toFixed(2)),
        errors4xx: entry.errors4xx,
        errors5xx: entry.errors5xx,
      };
    })
    .sort((a, b) => b.p95Ms - a.p95Ms);
