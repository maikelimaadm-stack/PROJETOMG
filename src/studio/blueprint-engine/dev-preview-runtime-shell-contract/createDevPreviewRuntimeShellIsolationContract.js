import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Declares the ISOLATION contract. Pure, metadata-only. Asserts the hard isolation invariants
 * a future shell must respect: no window, no document, no DOM, no React, no CSS runtime, no
 * route runtime, no menu runtime, no module runtime, no production, no staging.
 *
 * @param {Object} [options]
 * @returns {Object} isolation contract
 */
export function createDevPreviewRuntimeShellIsolationContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const invariants = {
    noWindow: true,
    noDocument: true,
    noDOM: true,
    noReact: true,
    noCSSRuntime: true,
    noRouteRuntime: true,
    noMenuRuntime: true,
    noModuleRuntime: true,
    noProduction: true,
    noStaging: true,
  };

  const core = {
    kind: 'dev-preview-runtime-shell-isolation-contract',
    moduleId: String(o.visualContract?.moduleId ?? 'plannedModule'),
    ...invariants,
    allInvariantsHold: Object.values(invariants).every((v) => v === true),
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, isolationDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellIsolationContract;
