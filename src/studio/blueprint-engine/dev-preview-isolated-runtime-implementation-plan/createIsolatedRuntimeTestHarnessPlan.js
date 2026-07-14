import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { TEST_HARNESS_FIXTURE_KINDS, planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Declares the TEST HARNESS plan. Pure, metadata-only. Enumerates the fixture families a future
 * headless harness WOULD provide (contract / negative / tamper / forbidden-flag / deterministic-
 * digest / no-runtime-side-effect). No real harness is created; nothing executes.
 *
 * @param {Object} [options]
 * @returns {Object} test harness plan
 */
export function createIsolatedRuntimeTestHarnessPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const fixtures = TEST_HARNESS_FIXTURE_KINDS.map((fixture) => ({
    fixture,
    planned: true,
    implemented: false,
    metadataOnly: true,
  }));

  const core = {
    kind: 'isolated-runtime-test-harness-plan',
    moduleId: String(o.runtimeShellContract?.moduleId ?? 'plannedModule'),
    fixtures,
    fixtureKinds: [...TEST_HARNESS_FIXTURE_KINDS],
    harnessImplemented: false,
    runtimeExecuted: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, testHarnessDigest: planDigest(core) });
}

export default createIsolatedRuntimeTestHarnessPlan;
