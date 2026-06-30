import {
  INTENT_RESOLVER_VERSION,
  RESOLVER_CONTEXT_VERSION,
  COMPATIBILITY_VERSION,
} from "../contracts/intentContracts.js";
import { CAPABILITY_CATALOG_VERSION } from "../catalog/capabilityCatalog.js";
import { BUSINESS_INTENT_DOCUMENT_VERSION } from "../contracts/intentContracts.js";

function stableHash(parts) {
  const str = JSON.stringify(parts);
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return `ctx-${hash.toString(16).padStart(8, "0")}`;
}

export function createResolverContext(intentDocument, options = {}) {
  const intentRevision = intentDocument.revision;
  const catalogVersion = CAPABILITY_CATALOG_VERSION;
  const resolverVersion = INTENT_RESOLVER_VERSION;

  const snapshot = Object.freeze({
    intentSnapshot: Object.freeze({ ...intentDocument }),
    catalogSnapshot: Object.freeze({ version: catalogVersion }),
    capabilitySnapshot: Object.freeze({ version: catalogVersion, capabilities: options.capabilities ?? [] }),
    objectSnapshot: Object.freeze({
      businessObjectId: intentDocument.subject?.businessObjectId,
      moduleId: intentDocument.subject?.moduleId,
      entityId: intentDocument.subject?.entityId,
      fieldId: intentDocument.subject?.fieldId,
    }),
    dependencySnapshot: Object.freeze({ dependencies: intentDocument.dependencies ?? [] }),
    tenantPolicySnapshot: Object.freeze(options.policySet ?? {}),
    organizationId: intentDocument.metadata?.organizationId ?? options.organizationId ?? null,
    resolverVersion,
    compatibilityVersion: COMPATIBILITY_VERSION,
    intentSchemaVersion: BUSINESS_INTENT_DOCUMENT_VERSION,
    intentRevision,
  });

  return Object.freeze({
    schemaVersion: RESOLVER_CONTEXT_VERSION,
    contextHash: stableHash({
      intentId: intentDocument.id,
      intentRevision,
      catalogVersion,
      resolverVersion,
      contentHash: intentDocument.contentHash,
    }),
    snapshot,
    createdAt: new Date().toISOString(),
  });
}

export default createResolverContext;
