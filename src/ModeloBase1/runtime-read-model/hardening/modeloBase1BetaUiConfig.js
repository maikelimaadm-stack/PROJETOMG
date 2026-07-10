/**
 * Dev-only visibility config for the ModeloBase1 beta UI diagnostics surface.
 *
 * The hardening MODEL/checklist/diagnostics are always computed (pure, cheap),
 * but any on-screen diagnostics panel is gated by an opt-in, dev-only flag that
 * FAILS CLOSED in production unless an explicit `*_ALLOW_PROD` override is set.
 * The write-blocked / fallback badges are not gated by this flag — they are part
 * of the beta read UX itself — but they never render in the legacy (flag-off)
 * path because they are only shown when the beta read model is applied.
 *
 * This module is self-contained (no `src/runtime` import) so the ModeloBase1
 * engine stays decoupled from the runtime module.
 */

/** Opt-in, dev-only flag to render the beta diagnostics panel. */
export const MODELOBASE1_BETA_UI_DIAGNOSTICS_FLAG = 'MAK_MODELOBASE1_BETA_UI_DIAGNOSTICS';
/** Explicit, documented production escape hatch. Off by default. */
export const MODELOBASE1_BETA_UI_DIAGNOSTICS_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_BETA_UI_DIAGNOSTICS_ALLOW_PROD';

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
  const proc = (typeof globalThis !== 'undefined' && globalThis.process) ? globalThis.process : undefined;
  const procEnv = proc && proc.env ? proc.env : {};
  return { ...procEnv, ...metaEnv };
}

/**
 * Local production detector (mirrors the runtime's env-label logic without
 * importing it). Production when MODE/NODE_ENV/VITE_* says so and neither DEV
 * nor an explicit preview label is set.
 * @param {Record<string, unknown>} env
 * @returns {boolean}
 */
function isProductionEnv(env) {
  if (env.DEV === true || env.DEV === 'true') return false;
  const label = String(env.MAK_ENV_LABEL || env.VITE_ENV_LABEL || '').toLowerCase();
  if (label === 'production') return true;
  if (label && label !== 'production') return false;
  const mode = String(env.MODE || '').toLowerCase();
  if (mode === 'production') return true;
  if (mode && mode !== 'production') return false;
  const nodeEnv = String(env.NODE_ENV || '').toLowerCase();
  if (nodeEnv === 'production') return true;
  if (env.PROD === true || env.PROD === 'true') return true;
  return false;
}

/**
 * Whether the beta diagnostics panel may render. Off by default; requires the
 * opt-in flag AND a non-production environment (fail-closed in production unless
 * the explicit `*_ALLOW_PROD` override is set).
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isModeloBase1BetaUiDiagnosticsEnabled(env) {
  const e = env ?? resolveEnv();
  if (e[MODELOBASE1_BETA_UI_DIAGNOSTICS_FLAG] !== 'true') return false;
  if (!isProductionEnv(e)) return true;
  return e[MODELOBASE1_BETA_UI_DIAGNOSTICS_ALLOW_PROD_FLAG] === 'true';
}

/**
 * Whether the diagnostics flag is on but production blocks it (fail-closed).
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isModeloBase1BetaUiDiagnosticsProductionBlocked(env) {
  const e = env ?? resolveEnv();
  return e[MODELOBASE1_BETA_UI_DIAGNOSTICS_FLAG] === 'true'
    && isProductionEnv(e)
    && e[MODELOBASE1_BETA_UI_DIAGNOSTICS_ALLOW_PROD_FLAG] !== 'true';
}
