import crbCacheEnvelope from "../../../../config/mdp-compiled-bundle.cache.json";
import crbExportMeta from "../../../../config/mdp-compiled-bundle.export.json";
import { apiClient } from "@/apis/http/apiClient.js";
import {
  DEFAULT_BASE_TEMPLATE_ID,
  DEFAULT_ENVIRONMENT,
  DEFAULT_LOCALE,
  RUNTIME_BRIDGE_PILOT_MODULES,
} from "./runtimeBridgeConstants.js";
import { validateCrbStructure, validateRuntimeBridgeCacheEnvelope } from "./runtimeValidation.js";
import {
  getRuntimeCrbCache,
  setRuntimeCrbCache,
} from "./runtimeCacheManager.js";

const buildEnvelopeFromPayload = (payload, meta = {}) => ({
  version: "runtime-bridge-cache-v1",
  exportedAt: meta.exportedAt ?? new Date().toISOString(),
  moduleId: payload.moduleId,
  baseTemplateId: payload.baseTemplateId ?? DEFAULT_BASE_TEMPLATE_ID,
  versionId: payload.versionId ?? meta.versionId ?? null,
  integrityHash: meta.integrityHash ?? payload.integrityHash ?? "boot-cache-unsigned",
  crbVersion: payload.crbVersion,
  source: meta.source ?? "boot-cache",
  payload,
});

const normalizeIntrospectToCrb = (introspect) => {
  if (!introspect) return null;
  return {
    crbVersion: introspect.crbVersion ?? "mdp-crb-v1",
    moduleId: introspect.moduleId,
    baseTemplateId: introspect.baseTemplateId ?? DEFAULT_BASE_TEMPLATE_ID,
    versionId: introspect.versionInfo?.versionId ?? null,
    semver: introspect.versionInfo?.semver ?? null,
    revision: introspect.versionInfo?.revision ?? null,
    status: introspect.versionInfo?.status ?? "published",
    compiledAt: introspect.introspectedAt ?? new Date().toISOString(),
    locale: introspect.locale ?? DEFAULT_LOCALE,
    entities: introspect.entities ?? [],
    fields: introspect.fields ?? [],
    relationships: introspect.relationships ?? [],
    registry: introspect.registryEntries ?? [],
    dependencyGraph: introspect.dependencyGraph ?? { nodes: [], edges: [] },
    versionGraph: introspect.versionGraph ?? null,
    integrityHash: introspect.versionInfo?.integrityHash ?? null,
    meta: {
      entityCount: introspect.entities?.length ?? 0,
      fieldCount: introspect.fields?.length ?? 0,
      relationshipCount: introspect.relationships?.length ?? 0,
      registryCount: introspect.registryEntries?.length ?? 0,
      signatureReady: true,
    },
  };
};

/** Sync boot loader — uses committed CRB cache envelope (offline / no pin). */
export function loadCrbSyncForModule(moduleId) {
  if (!RUNTIME_BRIDGE_PILOT_MODULES.includes(moduleId)) return null;

  const cached = getRuntimeCrbCache(moduleId);
  if (cached?.payload) return cached;

  if (crbCacheEnvelope?.moduleId === moduleId && crbCacheEnvelope?.payload) {
    const validation = validateRuntimeBridgeCacheEnvelope(crbCacheEnvelope);
    if (validation.valid) {
      setRuntimeCrbCache(moduleId, crbCacheEnvelope, crbCacheEnvelope.source ?? "boot-cache");
      return crbCacheEnvelope;
    }
  }

  if (crbExportMeta?.moduleId === moduleId && crbExportMeta?.bundleCount >= 1) {
    return null;
  }

  return null;
}

/**
 * Async loader — resolves pinned CRB via MDP introspect API.
 * @param {string} moduleId
 * @param {object} [options]
 */
export async function loadCrbFromApi(moduleId, options = {}) {
  const {
    environment = DEFAULT_ENVIRONMENT,
    baseTemplateId = DEFAULT_BASE_TEMPLATE_ID,
    locale = DEFAULT_LOCALE,
    scope = "platform",
  } = options;

  const query = new URLSearchParams({
    moduleId,
    environment,
    baseTemplateId,
    locale,
    scope,
  });

  const introspect = await apiClient.get(`/api/mdp/introspect?${query.toString()}`);
  const payload = normalizeIntrospectToCrb(introspect);
  const validation = validateCrbStructure(payload, { moduleId });
  if (!validation.valid) {
    throw new Error(`CRB API inválido (${moduleId}): ${validation.errors.join(" ")}`);
  }

  const envelope = buildEnvelopeFromPayload(payload, {
    source: "api",
    integrityHash: introspect.versionInfo?.integrityHash ?? payload.integrityHash,
    versionId: payload.versionId,
    exportedAt: introspect.introspectedAt,
  });

  setRuntimeCrbCache(moduleId, envelope, "api");
  return envelope;
}

/** Resolves environment pin metadata (no full CRB). */
export async function fetchEnvironmentPin(moduleId, options = {}) {
  const { environment = DEFAULT_ENVIRONMENT, scope = "platform" } = options;
  const query = new URLSearchParams({ moduleId, environment, scope });
  const pins = await apiClient.get(`/api/mdp/environment-pins?${query.toString()}`);
  return Array.isArray(pins) ? pins.find((pin) => pin.environment === environment) ?? pins[0] : null;
}

export default loadCrbSyncForModule;
