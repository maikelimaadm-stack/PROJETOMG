import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeUiDigest, isProductionEnv } from './runtimeUiConfig.js';

/**
 * The dev-only flag gate for the runtime UI. Valid ONLY in dev-only mode; production/staging fail
 * closed. Pure — returns a report; never throws.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object}
 */
export function createRuntimeUiDevFlagGate(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const env = isGenericModelPlainObject(o.env) ? o.env : {};
  const production = isProductionEnv(env);

  const core = {
    kind: 'runtime-ui-dev-flag-gate',
    devOnly: true,
    validInDevOnly: true,
    productionAllowed: false,
    stagingAllowed: false,
    failsClosedInProduction: true,
    productionDetected: production,
    open: !production,
  };
  return safeCloneGenericModel({ ...core, devFlagGateDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiDevFlagGate;
