import {
  PORTFOLIO_INTELLIGENCE_STORE_VERSION,
  PORTFOLIO_OWNERSHIP,
  PORTFOLIO_LIFECYCLE_STATES,
} from "./portfolioIntelligenceContracts.js";

const STORAGE_KEY = "mak-portfolio-intelligence-v1";
const memoryFallback = { views: [], dashboards: [], benchmarks: [], patterns: [], opportunities: [], references: [], variances: [], alerts: [], rankings: [] };

function readStore() {
  if (typeof localStorage === "undefined") {
    return { views: [], dashboards: [], benchmarks: [], patterns: [], opportunities: [], references: [], variances: [], alerts: [], rankings: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { views: [], dashboards: [], benchmarks: [], patterns: [], opportunities: [], references: [], variances: [], alerts: [], rankings: [] };
    return JSON.parse(raw);
  } catch {
    return { views: [], dashboards: [], benchmarks: [], patterns: [], opportunities: [], references: [], variances: [], alerts: [], rankings: [] };
  }
}

function writeStore(data) {
  const trimmed = {
    views: (data.views ?? []).slice(0, 50),
    dashboards: (data.dashboards ?? []).slice(0, 30),
    benchmarks: (data.benchmarks ?? []).slice(0, 100),
    patterns: (data.patterns ?? []).slice(0, 100),
    opportunities: (data.opportunities ?? []).slice(0, 100),
    references: (data.references ?? []).slice(0, 100),
    variances: (data.variances ?? []).slice(0, 100),
    alerts: (data.alerts ?? []).slice(0, 50),
    rankings: (data.rankings ?? []).slice(0, 50),
  };
  if (typeof localStorage === "undefined") Object.assign(memoryFallback, trimmed);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getPortfolioIntelligenceStoreInfo() {
  return Object.freeze({
    schemaVersion: PORTFOLIO_INTELLIGENCE_STORE_VERSION,
    groupScopedRequiresAuthorization: true,
    belongsToEnterprise: true,
    unauthorizedAggregationForbidden: true,
  });
}

export function upsertPortfolioView(view) {
  const store = readStore();
  store.views = [view, ...store.views.filter((v) => v.viewId !== view.viewId)];
  writeStore(store);
  return view;
}

export function upsertPortfolioDashboard(dashboard) {
  const store = readStore();
  store.dashboards = [dashboard, ...store.dashboards.filter((d) => d.dashboardId !== dashboard.dashboardId)];
  writeStore(store);
  return dashboard;
}

export function upsertPortfolioBenchmark(benchmark) {
  const store = readStore();
  store.benchmarks = [benchmark, ...store.benchmarks.filter((b) => b.benchmarkId !== benchmark.benchmarkId)];
  writeStore(store);
  return benchmark;
}

export function upsertPortfolioPattern(pattern) {
  const store = readStore();
  store.patterns = [pattern, ...store.patterns.filter((p) => p.patternId !== pattern.patternId)];
  writeStore(store);
  return pattern;
}

export function upsertPortfolioOpportunity(opportunity) {
  const store = readStore();
  store.opportunities = [opportunity, ...store.opportunities.filter((o) => o.opportunityId !== opportunity.opportunityId)];
  writeStore(store);
  return opportunity;
}

export function upsertPortfolioReference(reference) {
  const store = readStore();
  store.references = [reference, ...store.references.filter((r) => r.referenceId !== reference.referenceId)];
  writeStore(store);
  return reference;
}

export function upsertPortfolioVariance(variance) {
  const store = readStore();
  store.variances = [variance, ...store.variances.filter((v) => v.varianceId !== variance.varianceId)];
  writeStore(store);
  return variance;
}

export function upsertPortfolioAlert(alert) {
  const store = readStore();
  store.alerts = [alert, ...store.alerts.filter((a) => a.alertId !== alert.alertId)];
  writeStore(store);
  return alert;
}

export function upsertPortfolioRanking(ranking) {
  const store = readStore();
  store.rankings = [ranking, ...store.rankings.filter((r) => r.rankingId !== ranking.rankingId)];
  writeStore(store);
  return ranking;
}

export function listPortfolioViews(groupId, options = {}) {
  return readStore().views.filter((v) => v.groupId === groupId).slice(0, options.limit ?? 10);
}

export function listPortfolioDashboards(groupId, options = {}) {
  return readStore().dashboards.filter((d) => d.groupId === groupId).slice(0, options.limit ?? 10);
}

export function listPortfolioBenchmarks(groupId, options = {}) {
  return readStore().benchmarks.filter((b) => b.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listPortfolioPatterns(groupId, options = {}) {
  return readStore().patterns.filter((p) => p.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listPortfolioOpportunities(groupId, options = {}) {
  return readStore().opportunities.filter((o) => o.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listPortfolioReferences(groupId, options = {}) {
  return readStore().references.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listPortfolioVariances(groupId, options = {}) {
  return readStore().variances.filter((v) => v.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listPortfolioAlerts(groupId, options = {}) {
  return readStore().alerts.filter((a) => a.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listPortfolioRankings(groupId, options = {}) {
  return readStore().rankings.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 20);
}

export function createPortfolioView(partial) {
  return Object.freeze({
    viewId: partial.viewId ?? `pview-${partial.groupId}-${Date.now()}`,
    groupId: partial.groupId,
    ownerClientId: partial.ownerClientId ?? null,
    authorizedTenantIds: Object.freeze(partial.authorizedTenantIds ?? []),
    title: partial.title ?? "Command Center Corporativo",
    summary: partial.summary ?? "",
    lifecycleState: partial.lifecycleState ?? PORTFOLIO_LIFECYCLE_STATES[1],
    ownership: PORTFOLIO_OWNERSHIP,
    explainable: true,
    createdAt: new Date().toISOString(),
  });
}

export default { upsertPortfolioView, getPortfolioIntelligenceStoreInfo };
