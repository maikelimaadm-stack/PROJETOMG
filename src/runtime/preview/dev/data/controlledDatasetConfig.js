/** Dev-only opt-in flag for the controlled dev dataset. Off by default; only `'true'` enables. */
export const CONTROLLED_DEV_DATASET_FLAG = 'MAK_RUNTIME_V2_CONTROLLED_DEV_DATASET';

/** Explicit, documented escape hatch to allow the dataset in a production build. Off by default. */
export const CONTROLLED_DEV_DATASET_ALLOW_PROD_FLAG = 'MAK_RUNTIME_V2_CONTROLLED_DEV_DATASET_ALLOW_PROD';

/** Hard caps — the controlled dataset must stay small and shallow. */
export const MAX_RECORDS_PER_MODULE = 50;
export const MAX_PAYLOAD_DEPTH = 8;

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

/** @param {Record<string, unknown>} e */
function isProductionEnv(e) {
  return e.PROD === true || e.PROD === 'true' || e.NODE_ENV === 'production' || e.MODE === 'production';
}

/**
 * Whether the controlled dev dataset is enabled. Off by default. Requires the
 * opt-in flag AND a non-production environment — in production it FAILS CLOSED
 * unless the explicit, documented `*_ALLOW_PROD` override is set.
 * @param {Record<string, unknown>} [env] Explicit env (for testing); defaults to import.meta.env/process.env.
 * @returns {boolean}
 */
export function isControlledDevDatasetEnabled(env) {
  const e = env ?? resolveEnv();
  if (e[CONTROLLED_DEV_DATASET_FLAG] !== 'true') return false;
  if (!isProductionEnv(e)) return true;
  return e[CONTROLLED_DEV_DATASET_ALLOW_PROD_FLAG] === 'true';
}
