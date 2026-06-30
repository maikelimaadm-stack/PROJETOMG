import { RESOLVER_DOCUMENT_VERSION } from "../contracts/intentContracts.js";

let sessionCounter = 0;

export function createResolverSession(options = {}) {
  sessionCounter += 1;
  const id =
    options.resolverSessionId ??
    options.deterministicSessionId ??
    `resolver-session-${options.contextHash ?? sessionCounter}-${Date.now()}`;

  return Object.freeze({
    schemaVersion: RESOLVER_DOCUMENT_VERSION,
    resolverSessionId: id,
    tenantId: options.tenantId ?? "default",
    trigger: options.trigger ?? "manual",
    initiatedBy: options.initiatedBy ?? "system",
    mode: options.mode ?? "standard",
    preview: options.preview === true,
    policySet: Object.freeze({ ...(options.policySet ?? {}) }),
    cachePolicy: options.cachePolicy ?? "read_write",
    startedAt: new Date().toISOString(),
    contextHash: options.contextHash ?? null,
  });
}

export function finalizeResolverSession(session, patch = {}) {
  return Object.freeze({
    ...session,
    ...patch,
    completedAt: patch.completedAt ?? new Date().toISOString(),
  });
}

export default createResolverSession;
