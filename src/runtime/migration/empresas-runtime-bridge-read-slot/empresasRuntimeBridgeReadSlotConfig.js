import { detectEnvLabel } from '../../preview/dev/hub/devPreviewHubConfig.js';
import { EMPRESAS_BRIDGE_DRY_RUN_FLAG } from '../empresas-read-ui-bridge-dry-run/empresasRuntimeBridgeDryRunConfig.js';

/** Dev-only opt-in flag for the Empresas runtime bridge read slot candidate. Off by default; only `'true'` enables. */
export const EMPRESAS_READ_SLOT_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_READ_SLOT_CANDIDATE';

/** Explicit, documented escape hatch to allow the candidate in a production build. Off by default. */
export const EMPRESAS_READ_SLOT_ALLOW_PROD_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_READ_SLOT_CANDIDATE_ALLOW_PROD';

/**
 * Resolves the effective env bag. In Vite this reads `import.meta.env`; under
 * `node --test` that is undefined, so it falls back to `process.env`.
 * @returns {Record<string, unknown>}
 */
function resolveEnv() {
  /** @type {Record<string, unknown>} */
  let metaEnv = {};
  try {
    metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
  } catch {
    metaEnv = {};
  }
  const procEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};
  return { ...procEnv, ...metaEnv };
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasReadSlotProductionEnv(env) {
  return detectEnvLabel(env ?? resolveEnv()) === 'production';
}

/**
 * Whether the Empresas runtime bridge read slot candidate is enabled. Off by
 * default. Requires the opt-in flag AND a non-production environment — in
 * production it FAILS CLOSED unless the explicit, documented `*_ALLOW_PROD`
 * override is set. This is a candidate/simulation-only layer: enabling it never
 * enables any write and never mounts anything real.
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isEmpresasReadSlotEnabled(env) {
  const e = env ?? resolveEnv();
  if (e[EMPRESAS_READ_SLOT_FLAG] !== 'true') return false;
  if (detectEnvLabel(e) !== 'production') return true;
  return e[EMPRESAS_READ_SLOT_ALLOW_PROD_FLAG] === 'true';
}

/**
 * Whether the flag is on but production blocks it (fail-closed).
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isEmpresasReadSlotProductionBlocked(env) {
  const e = env ?? resolveEnv();
  return e[EMPRESAS_READ_SLOT_FLAG] === 'true'
    && detectEnvLabel(e) === 'production'
    && e[EMPRESAS_READ_SLOT_ALLOW_PROD_FLAG] !== 'true';
}

/**
 * The candidate analyzes the bridge dry run (which composes the whole read
 * chain). When the candidate is enabled (dev, or explicit prod override), this
 * enriches the env so the dry run it inspects is permitted — WITHOUT ever
 * weakening the dry run's own production fail-closed behavior (the candidate's
 * own gate already blocked production). It NEVER enables any write flag and
 * NEVER mounts anything.
 * @param {Record<string, unknown>} [env]
 * @returns {Record<string, unknown>}
 */
export function composeSlotEnv(env) {
  const e = { ...(env ?? {}) };
  return {
    ...e,
    [EMPRESAS_BRIDGE_DRY_RUN_FLAG]: 'true',
  };
}
