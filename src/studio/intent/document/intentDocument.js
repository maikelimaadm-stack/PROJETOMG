import { BUSINESS_INTENT_DOCUMENT_VERSION } from "../contracts/intentContracts.js";

function simpleContentHash(payload) {
  const str = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/** Business Intent Document — SSOT input for Resolver (D-059) */
export function createBusinessIntentDocument(partial = {}) {
  const core = {
    title: partial.title ?? "",
    intentPhrase: partial.intentPhrase ?? "",
    category: partial.category ?? "Computation",
    description: partial.description ?? "",
    subject: Object.freeze({
      businessObjectId: partial.subject?.businessObjectId ?? partial.businessObjectId ?? "default",
      moduleId: partial.subject?.moduleId ?? partial.moduleId ?? "default",
      entityId: partial.subject?.entityId ?? partial.entityId ?? "default",
      fieldId: partial.subject?.fieldId ?? partial.ownerFieldId ?? "unknown",
    }),
    capabilities: Object.freeze([...(partial.capabilities ?? [])]),
    computations: Object.freeze([...(partial.computations ?? [])]),
    goals: Object.freeze([...(partial.goals ?? [])]),
    rules: Object.freeze([...(partial.rules ?? [])]),
    conditions: Object.freeze([...(partial.conditions ?? [])]),
    outcomes: Object.freeze([...(partial.outcomes ?? [])]),
  };

  const revision = partial.revision ?? 1;

  return Object.freeze({
    schemaVersion: BUSINESS_INTENT_DOCUMENT_VERSION,
    id: partial.id ?? `intent-${Date.now()}`,
    revision,
    contentHash: partial.contentHash ?? simpleContentHash({ ...core, revision }),
    ...core,
    lifecycle: partial.lifecycle ?? "approved",
    metadata: Object.freeze({
      organizationId: partial.metadata?.organizationId ?? partial.organizationId ?? null,
      tenantId: partial.metadata?.tenantId ?? partial.tenantId ?? "default",
      authoredBy: partial.metadata?.authoredBy ?? partial.authoredBy ?? "system",
      confirmedAt: partial.metadata?.confirmedAt ?? partial.confirmedAt ?? new Date().toISOString(),
      ...(partial.metadata ?? {}),
    }),
    dependencies: Object.freeze([...(partial.dependencies ?? [])]),
    createdAt: partial.createdAt ?? new Date().toISOString(),
    updatedAt: partial.updatedAt ?? new Date().toISOString(),
  });
}

export function validateBusinessIntentDocument(doc) {
  const errors = [];
  if (!doc?.schemaVersion) errors.push("schemaVersion is required.");
  if (doc?.schemaVersion && doc.schemaVersion !== BUSINESS_INTENT_DOCUMENT_VERSION) {
    errors.push(`Invalid schemaVersion: ${doc.schemaVersion}`);
  }
  if (!doc?.id) errors.push("id is required.");
  if (!doc?.intentPhrase?.trim()) errors.push("intentPhrase is required.");
  if (doc?.lifecycle !== "approved") errors.push("Intent must be approved before resolution.");
  if (!doc?.computations?.length && doc?.category === "Computation") {
    errors.push("Computation intents require at least one computation reference.");
  }
  return { valid: errors.length === 0, ok: errors.length === 0, errors };
}

export default createBusinessIntentDocument;
