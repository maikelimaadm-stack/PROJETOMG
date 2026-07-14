import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Declares the shell POLICY contract. Pure, metadata-only. Aggregates the standing policies a
 * future runtime shell must obey: headless-only, fail-closed, no side effects, reversible by
 * non-consumption, and no authorization of the real runtime.
 *
 * @param {Object} [options]
 * @returns {Object} policy contract
 */
export function createDevPreviewRuntimeShellPolicyContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const policies = [
    { policy: 'headless_only', enforced: true },
    { policy: 'fail_closed', enforced: true },
    { policy: 'no_side_effects', enforced: true },
    { policy: 'reversible_by_non_consumption', enforced: true },
    { policy: 'no_runtime_authorization', enforced: true },
    { policy: 'no_production_or_staging', enforced: true },
    { policy: 'no_empresas_rewrite', enforced: true },
  ];

  const core = {
    kind: 'dev-preview-runtime-shell-policy-contract',
    moduleId: String(o.visualContract?.moduleId ?? 'plannedModule'),
    policies,
    allEnforced: policies.every((p) => p.enforced === true),
    authorizesRuntime: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, policyDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellPolicyContract;
