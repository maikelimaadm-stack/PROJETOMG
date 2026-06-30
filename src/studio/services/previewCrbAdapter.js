/**
 * Preview via CRB — uses MDP introspect/compile public APIs (Program 2.1B).
 * Produces the same CRB payload Runtime Bridge hydrates from, without importing Runtime Bridge.
 * Preview is read-only and never mutates Runtime state.
 */
import { mdpIntrospect, mdpCompile } from "./mdpStudioClient.js";

export function normalizeIntrospectToPreviewCrb(introspect) {
  if (!introspect) return null;
  return {
    crbVersion: introspect.crbVersion ?? "mdp-crb-v1",
    moduleId: introspect.moduleId,
    versionId: introspect.versionInfo?.versionId ?? null,
    semver: introspect.versionInfo?.semver ?? null,
    status: introspect.versionInfo?.status ?? "published",
    entityCount: introspect.entities?.length ?? 0,
    fieldCount: introspect.fields?.length ?? 0,
    registryCount: introspect.registryEntries?.length ?? 0,
    introspectedAt: introspect.introspectedAt,
    source: "mdp-introspect",
  };
}

/**
 * Load preview CRB summary via MDP introspect (Runtime Bridge parity path).
 * @param {string} moduleId
 */
export async function loadPreviewCrbFromIntrospect(moduleId) {
  const introspect = await mdpIntrospect(moduleId);
  const crb = normalizeIntrospectToPreviewCrb(introspect);
  if (!crb?.moduleId) {
    return { ok: false, reason: "invalid-crb", compileId: null, crb: null };
  }
  return {
    ok: true,
    compileId: crb.versionId,
    crb,
    message: `CRB ${crb.semver ?? crb.versionId} · ${crb.registryCount} entradas`,
  };
}

/**
 * Compile draft for preview refresh (does not hydrate Runtime Bridge).
 * @param {string} moduleId
 */
export async function loadPreviewCrbFromCompile(moduleId) {
  const result = await mdpCompile(moduleId, { draft: true });
  const crb = {
    crbVersion: result?.crbVersion ?? "mdp-crb-v1",
    moduleId: result?.moduleId ?? moduleId,
    versionId: result?.versionId ?? null,
    source: "mdp-compile",
  };
  return {
    ok: Boolean(result?.moduleId ?? result?.versionId),
    compileId: crb.versionId,
    crb,
    message: result?.versionId ? `Draft compilado · ${result.versionId}` : "Compile concluído",
  };
}

export default loadPreviewCrbFromIntrospect;
