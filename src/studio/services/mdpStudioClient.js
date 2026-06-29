/**
 * Official MDP API client for MAK Studio — public HTTP API only (Program 2.1B).
 * Uses platform apiClient (JWT + X-Empresa-Id). No direct DB access.
 */
import { apiClient } from "@/apis/http/apiClient.js";

const DEFAULT_BASE_TEMPLATE_ID = "modelobase1";
const DEFAULT_LOCALE = "pt-BR";
const DEFAULT_ENVIRONMENT = "production";
const MDP_API_BASE = "/api/mdp";
const MDP_REGISTRY = "registry";

/**
 * CRB introspect — same endpoint consumed by Runtime Bridge hydration.
 * @param {string} moduleId
 * @param {object} [options]
 */
export async function mdpIntrospect(moduleId, options = {}) {
  const {
    environment = DEFAULT_ENVIRONMENT,
    baseTemplateId = DEFAULT_BASE_TEMPLATE_ID,
    locale = DEFAULT_LOCALE,
    scope = "platform",
    versionId,
  } = options;

  const query = new URLSearchParams({
    moduleId,
    environment,
    baseTemplateId,
    locale,
    scope,
  });
  if (versionId) query.set("versionId", versionId);

  return apiClient.get(`${MDP_API_BASE}/introspect?${query.toString()}`);
}

/** Metadata registry introspect (stats/schemas). */
export async function mdpRegistryIntrospect(moduleId) {
  const query = new URLSearchParams();
  if (moduleId) query.set("moduleId", moduleId);
  return apiClient.get(`${MDP_API_BASE}/${MDP_REGISTRY}/introspect?${query.toString()}`);
}

/**
 * Compile draft bundle — read-only preview path.
 * @param {string} moduleId
 * @param {object} [body]
 */
export async function mdpCompile(moduleId, body = {}) {
  return apiClient.post(`${MDP_API_BASE}/compile/${encodeURIComponent(moduleId)}`, {
    baseTemplateId: DEFAULT_BASE_TEMPLATE_ID,
    locale: DEFAULT_LOCALE,
    draft: true,
    ...body,
  });
}

/**
 * Publish — official API (admin-only on backend).
 * @param {object} body
 */
export async function mdpPublish(body) {
  return apiClient.post(`${MDP_API_BASE}/publish`, {
    scope: "platform",
    environment: DEFAULT_ENVIRONMENT,
    baseTemplateId: DEFAULT_BASE_TEMPLATE_ID,
    ...body,
  });
}

export async function mdpFetchEnvironmentPin(moduleId, options = {}) {
  const { environment = DEFAULT_ENVIRONMENT, scope = "platform" } = options;
  const query = new URLSearchParams({ moduleId, environment, scope });
  const pins = await apiClient.get(`${MDP_API_BASE}/environment-pins?${query.toString()}`);
  return Array.isArray(pins) ? pins.find((p) => p.environment === environment) ?? pins[0] : null;
}

export default {
  mdpIntrospect,
  mdpRegistryIntrospect,
  mdpCompile,
  mdpPublish,
  mdpFetchEnvironmentPin,
};
