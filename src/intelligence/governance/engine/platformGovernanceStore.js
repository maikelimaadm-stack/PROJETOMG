import {
  PLATFORM_GOVERNANCE_STORE_VERSION,
  GOVERNANCE_OWNERSHIP,
  GOVERNANCE_LIFECYCLE_STATES,
} from "./platformGovernanceContracts.js";

const STORAGE_KEY = "mak-platform-governance-v1";
const memoryFallback = {
  documents: [],
  scopes: [],
  permissions: [],
  policies: [],
  retentions: [],
  audits: [],
  compliances: [],
  adminScopes: [],
  alerts: [],
};

function readStore() {
  if (typeof localStorage === "undefined") {
    return {
      documents: [],
      scopes: [],
      permissions: [],
      policies: [],
      retentions: [],
      audits: [],
      compliances: [],
      adminScopes: [],
      alerts: [],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { documents: [], scopes: [], permissions: [], policies: [], retentions: [], audits: [], compliances: [], adminScopes: [], alerts: [] };
    return JSON.parse(raw);
  } catch {
    return { documents: [], scopes: [], permissions: [], policies: [], retentions: [], audits: [], compliances: [], adminScopes: [], alerts: [] };
  }
}

function writeStore(data) {
  const trimmed = {
    documents: (data.documents ?? []).slice(0, 50),
    scopes: (data.scopes ?? []).slice(0, 50),
    permissions: (data.permissions ?? []).slice(0, 100),
    policies: (data.policies ?? []).slice(0, 100),
    retentions: (data.retentions ?? []).slice(0, 50),
    audits: (data.audits ?? []).slice(0, 200),
    compliances: (data.compliances ?? []).slice(0, 100),
    adminScopes: (data.adminScopes ?? []).slice(0, 50),
    alerts: (data.alerts ?? []).slice(0, 50),
  };
  if (typeof localStorage === "undefined") Object.assign(memoryFallback, trimmed);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getPlatformGovernanceStoreInfo() {
  return Object.freeze({
    schemaVersion: PLATFORM_GOVERNANCE_STORE_VERSION,
    groupScopedRequiresAuthorization: true,
    belongsToPlatform: true,
    policyChangeRequiresAudit: true,
    unauthorizedAggregationForbidden: true,
  });
}

export function upsertGovernanceDocument(doc) {
  const store = readStore();
  store.documents = [doc, ...store.documents.filter((d) => d.documentId !== doc.documentId)];
  writeStore(store);
  return doc;
}

export function upsertGovernanceScope(scope) {
  const store = readStore();
  store.scopes = [scope, ...store.scopes.filter((s) => s.scopeId !== scope.scopeId)];
  writeStore(store);
  return scope;
}

export function upsertGovernancePermission(permission) {
  const store = readStore();
  store.permissions = [permission, ...store.permissions.filter((p) => p.permissionId !== permission.permissionId)];
  writeStore(store);
  return permission;
}

export function upsertGovernancePolicy(policy) {
  const store = readStore();
  store.policies = [policy, ...store.policies.filter((p) => p.policyId !== policy.policyId)];
  writeStore(store);
  return policy;
}

export function upsertGovernanceRetention(retention) {
  const store = readStore();
  store.retentions = [retention, ...store.retentions.filter((r) => r.retentionId !== retention.retentionId)];
  writeStore(store);
  return retention;
}

export function upsertGovernanceAudit(audit) {
  const store = readStore();
  store.audits = [audit, ...store.audits.filter((a) => a.auditId !== audit.auditId)];
  writeStore(store);
  return audit;
}

export function upsertGovernanceCompliance(compliance) {
  const store = readStore();
  store.compliances = [compliance, ...store.compliances.filter((c) => c.complianceId !== compliance.complianceId)];
  writeStore(store);
  return compliance;
}

export function upsertAdminScope(adminScope) {
  const store = readStore();
  store.adminScopes = [adminScope, ...store.adminScopes.filter((a) => a.adminScopeId !== adminScope.adminScopeId)];
  writeStore(store);
  return adminScope;
}

export function upsertGovernanceAlert(alert) {
  const store = readStore();
  store.alerts = [alert, ...store.alerts.filter((a) => a.alertId !== alert.alertId)];
  writeStore(store);
  return alert;
}

export function listGovernanceDocuments(groupId, options = {}) {
  return readStore().documents.filter((d) => d.groupId === groupId).slice(0, options.limit ?? 10);
}

export function listGovernanceScopes(groupId, options = {}) {
  return readStore().scopes.filter((s) => s.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listGovernancePermissions(groupId, options = {}) {
  return readStore().permissions.filter((p) => p.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listGovernancePolicies(groupId, options = {}) {
  return readStore().policies.filter((p) => p.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listGovernanceRetentions(groupId, options = {}) {
  return readStore().retentions.filter((r) => r.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listGovernanceAudits(groupId, options = {}) {
  return readStore().audits.filter((a) => a.groupId === groupId).slice(0, options.limit ?? 50);
}

export function listGovernanceCompliances(groupId, options = {}) {
  return readStore().compliances.filter((c) => c.groupId === groupId).slice(0, options.limit ?? 30);
}

export function listAdminScopes(groupId, options = {}) {
  return readStore().adminScopes.filter((a) => a.groupId === groupId).slice(0, options.limit ?? 20);
}

export function listGovernanceAlerts(groupId, options = {}) {
  return readStore().alerts.filter((a) => a.groupId === groupId).slice(0, options.limit ?? 20);
}

export function createGovernanceDocument(partial) {
  return Object.freeze({
    documentId: partial.documentId ?? `gdoc-${partial.groupId}-${Date.now()}`,
    groupId: partial.groupId,
    ownerClientId: partial.ownerClientId ?? null,
    authorizedTenantIds: Object.freeze(partial.authorizedTenantIds ?? []),
    title: partial.title ?? "Documento de governança",
    summary: partial.summary ?? "",
    lifecycleState: partial.lifecycleState ?? GOVERNANCE_LIFECYCLE_STATES[1],
    ownership: GOVERNANCE_OWNERSHIP,
    explainable: true,
    createdAt: new Date().toISOString(),
  });
}

export default { upsertGovernanceDocument, getPlatformGovernanceStoreInfo };
