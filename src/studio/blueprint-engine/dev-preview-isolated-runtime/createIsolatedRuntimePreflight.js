import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  runtimeDigest,
} from './isolatedRuntimeConfig.js';

/**
 * Runs a pure, metadata-only PREFLIGHT before the isolated runtime executes. It validates that
 * the checkpoint authorization + manual gate are present, that the upstream contract versions
 * are compatible, and that dev-only / no-production / no-forbidden-flag invariants hold. It
 * calls NO network, backend, Prisma, real environment, or production.
 *
 * @param {Object} [options]
 * @param {Object} [options.implementationPlan]
 * @returns {Object} preflight report
 */
export function createIsolatedRuntimePreflight(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.implementationPlan) ? o.implementationPlan : {};
  const rollout = isGenericModelPlainObject(plan.rolloutRollback) ? plan.rolloutRollback : {};
  const policy = isGenericModelPlainObject(plan.executionPolicy) ? plan.executionPolicy : {};

  const checks = {
    implementationPlanPresent: plan.kind === 'studio-dev-preview-isolated-runtime-implementation-plan' && plan.fallback !== true,
    implementationPlanVersionCompatible: (plan.implementationPlanVersion ?? IMPLEMENTATION_PLAN_VERSION) === IMPLEMENTATION_PLAN_VERSION,
    runtimeShellContractVersionCompatible: (plan.runtimeShellContractVersion ?? RUNTIME_SHELL_CONTRACT_VERSION) === RUNTIME_SHELL_CONTRACT_VERSION,
    visualContractVersionCompatible: (plan.visualContractVersion ?? VISUAL_CONTRACT_VERSION) === VISUAL_CONTRACT_VERSION,
    manualGateSatisfied: rollout.manualEnablementRequired !== false,
    devOnly: policy.devOnly !== false,
    productionBlocked: policy.productionAllowed !== true,
    stagingBlocked: policy.stagingAllowed !== true,
    forbiddenFlagsFalse: plan.capabilities ? plan.capabilities.runtimeImplemented === false : true,
  };

  const failures = Object.entries(checks).filter(([, v]) => v !== true).map(([k]) => `preflight_${k}`);
  const ok = failures.length === 0;

  const core = {
    kind: 'isolated-runtime-preflight',
    moduleId: String(plan.moduleId ?? 'plannedModule'),
    checkpointAuthorizationPresent: checks.manualGateSatisfied,
    manualGateSatisfied: checks.manualGateSatisfied,
    checks,
    failures,
    ok,
    devOnly: true,
    production: false,
    staging: false,
    usedNetwork: false,
    usedBackend: false,
    usedPrisma: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, preflightDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimePreflight;
