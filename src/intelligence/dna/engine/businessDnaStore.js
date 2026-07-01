import {
  BUSINESS_DNA_STORE_VERSION,
  BUSINESS_DNA_PROFILE_SCHEMA_VERSION,
  BUSINESS_DNA_FINGERPRINT_SCHEMA_VERSION,
  DNA_OWNERSHIP,
  DNA_LIFECYCLE_STATES,
  DNA_MATURITY_LEVELS,
} from "./businessDnaContracts.js";

const STORAGE_KEY = "mak-business-dna-engine-v1";
const GROUP_SCOPE_KEY = "mak-business-dna-group-scope-v1";
const memoryFallback = { profiles: [], fingerprints: [], patterns: [], maturity: [], milestones: [], signals: [] };
const groupScopeFallback = {};

function readStore() {
  if (typeof localStorage === "undefined") {
    return {
      profiles: [...memoryFallback.profiles],
      fingerprints: [...memoryFallback.fingerprints],
      patterns: [...memoryFallback.patterns],
      maturity: [...memoryFallback.maturity],
      milestones: [...memoryFallback.milestones],
      signals: [...memoryFallback.signals],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { profiles: [], fingerprints: [], patterns: [], maturity: [], milestones: [], signals: [] };
    return JSON.parse(raw);
  } catch {
    return { profiles: [], fingerprints: [], patterns: [], maturity: [], milestones: [], signals: [] };
  }
}

function writeStore(data) {
  const trimmed = {
    profiles: (data.profiles ?? []).slice(0, 200),
    fingerprints: (data.fingerprints ?? []).slice(0, 100),
    patterns: (data.patterns ?? []).slice(0, 300),
    maturity: (data.maturity ?? []).slice(0, 200),
    milestones: (data.milestones ?? []).slice(0, 100),
    signals: (data.signals ?? []).slice(0, 200),
  };
  if (typeof localStorage === "undefined") {
    memoryFallback.profiles.length = 0;
    memoryFallback.profiles.push(...trimmed.profiles);
    memoryFallback.fingerprints.length = 0;
    memoryFallback.fingerprints.push(...trimmed.fingerprints);
    memoryFallback.patterns.length = 0;
    memoryFallback.patterns.push(...trimmed.patterns);
    memoryFallback.maturity.length = 0;
    memoryFallback.maturity.push(...trimmed.maturity);
    memoryFallback.milestones.length = 0;
    memoryFallback.milestones.push(...trimmed.milestones);
    memoryFallback.signals.length = 0;
    memoryFallback.signals.push(...trimmed.signals);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

function readGroupScopes() {
  if (typeof localStorage === "undefined") return { ...groupScopeFallback };
  try {
    const raw = localStorage.getItem(GROUP_SCOPE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeGroupScopes(scopes) {
  if (typeof localStorage === "undefined") {
    Object.keys(groupScopeFallback).forEach((k) => delete groupScopeFallback[k]);
    Object.assign(groupScopeFallback, scopes);
    return;
  }
  localStorage.setItem(GROUP_SCOPE_KEY, JSON.stringify(scopes));
}

export function getBusinessDnaStoreInfo() {
  return Object.freeze({
    schemaVersion: BUSINESS_DNA_STORE_VERSION,
    tenantScoped: true,
    belongsToEnterprise: true,
    individualProfilingForbidden: true,
    portfolioRequiresAuthorization: true,
  });
}

export function upsertDnaProfile(profile) {
  const store = readStore();
  store.profiles = [profile, ...store.profiles.filter((p) => p.profileId !== profile.profileId)];
  writeStore(store);
  return profile;
}

export function upsertDnaFingerprint(fingerprint) {
  const store = readStore();
  store.fingerprints = [fingerprint, ...store.fingerprints.filter((f) => f.fingerprintId !== fingerprint.fingerprintId)];
  writeStore(store);
  return fingerprint;
}

export function upsertDnaPattern(pattern) {
  const store = readStore();
  store.patterns = [pattern, ...store.patterns.filter((p) => p.patternId !== pattern.patternId)];
  writeStore(store);
  return pattern;
}

export function upsertDnaMaturityRecord(record) {
  const store = readStore();
  store.maturity = [record, ...store.maturity.filter((m) => m.recordId !== record.recordId)];
  writeStore(store);
  return record;
}

export function upsertDnaMilestone(milestone) {
  const store = readStore();
  store.milestones = [milestone, ...store.milestones.filter((m) => m.milestoneId !== milestone.milestoneId)];
  writeStore(store);
  return milestone;
}

export function upsertDnaGrowthSignal(signal) {
  const store = readStore();
  store.signals = [signal, ...store.signals.filter((s) => s.signalId !== signal.signalId)];
  writeStore(store);
  return signal;
}

export function listDnaProfiles(tenantId = "default", options = {}) {
  return readStore().profiles.filter((p) => p.tenantId === tenantId).slice(0, options.limit ?? 20);
}

export function listDnaFingerprints(tenantId = "default", options = {}) {
  return readStore().fingerprints.filter((f) => f.tenantId === tenantId).slice(0, options.limit ?? 10);
}

export function listDnaPatterns(tenantId = "default", options = {}) {
  let patterns = readStore().patterns.filter((p) => p.tenantId === tenantId);
  if (options.patternType) patterns = patterns.filter((p) => p.patternType === options.patternType);
  return patterns.slice(0, options.limit ?? 50);
}

export function listDnaMaturityRecords(tenantId = "default", options = {}) {
  return readStore().maturity.filter((m) => m.tenantId === tenantId).slice(0, options.limit ?? 30);
}

export function listDnaMilestones(tenantId = "default", options = {}) {
  return readStore().milestones.filter((m) => m.tenantId === tenantId).slice(0, options.limit ?? 20);
}

export function listDnaGrowthSignals(tenantId = "default", options = {}) {
  return readStore().signals.filter((s) => s.tenantId === tenantId).slice(0, options.limit ?? 20);
}

/** Register authorized group scope — portfolio view only with explicit permission */
export function registerAuthorizedGroupScope(input) {
  const scopes = readGroupScopes();
  const groupId = input.groupId ?? input.clientGroupId;
  scopes[groupId] = Object.freeze({
    groupId,
    ownerClientId: input.ownerClientId,
    authorizedTenantIds: Object.freeze([...(input.authorizedTenantIds ?? [])]),
    registeredAt: new Date().toISOString(),
    crossTenantMixingForbidden: true,
  });
  writeGroupScopes(scopes);
  return scopes[groupId];
}

export function getAuthorizedGroupScope(groupId) {
  return readGroupScopes()[groupId] ?? null;
}

export function isTenantAuthorizedInGroup(groupId, tenantId) {
  const scope = getAuthorizedGroupScope(groupId);
  if (!scope) return false;
  return scope.authorizedTenantIds.includes(tenantId);
}

export function listAuthorizedGroupScopes() {
  return readGroupScopes();
}

/** Resolve first authorized group containing tenant — portfolio/command center entry point */
export function findAuthorizedGroupIdForTenant(tenantId) {
  const scopes = readGroupScopes();
  for (const [groupId, scope] of Object.entries(scopes)) {
    if (scope.authorizedTenantIds?.includes(tenantId)) return groupId;
  }
  return null;
}

export function createDnaProfile(partial) {
  return Object.freeze({
    schemaVersion: BUSINESS_DNA_PROFILE_SCHEMA_VERSION,
    profileId: partial.profileId ?? `bprof-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    title: partial.title ?? "Perfil operacional da empresa",
    summary: partial.summary ?? "",
    identityStatement: partial.identityStatement ?? "",
    lifecycleState: partial.lifecycleState ?? DNA_LIFECYCLE_STATES[1],
    maturityLevel: partial.maturityLevel ?? DNA_MATURITY_LEVELS[0],
    ownership: DNA_OWNERSHIP,
    lineage: Object.freeze(partial.lineage ?? []),
    evidenceRefs: Object.freeze(partial.evidenceRefs ?? []),
    createdAt: new Date().toISOString(),
    explainable: true,
    aiGenerated: false,
    individualProfilingForbidden: true,
  });
}

export function createDnaFingerprint(partial) {
  return Object.freeze({
    schemaVersion: BUSINESS_DNA_FINGERPRINT_SCHEMA_VERSION,
    fingerprintId: partial.fingerprintId ?? `bfp-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    label: partial.label ?? "Fingerprint organizacional",
    traits: Object.freeze(partial.traits ?? []),
    ownership: DNA_OWNERSHIP,
    explainable: true,
    aiGenerated: false,
    createdAt: new Date().toISOString(),
  });
}

export default {
  upsertDnaProfile,
  upsertDnaFingerprint,
  registerAuthorizedGroupScope,
  getAuthorizedGroupScope,
};
