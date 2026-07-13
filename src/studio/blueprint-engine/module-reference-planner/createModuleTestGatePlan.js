import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { plannerDigest } from './moduleReferencePlannerConfig.js';

/**
 * Plans the TESTS and GATES a future module slice WOULD require. Pure. Descriptive only;
 * creates no test or gate file.
 *
 * @param {Object} [options]
 * @param {Object} [options.blueprint] normalized blueprint
 * @returns {Object} test/gate plan
 */
export function createModuleTestGatePlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.blueprint) ? o.blueprint : {};

  const plannedTests = [
    'contract tests', 'blueprint validation tests', 'field tests', 'screen plan tests',
    'permission tests', 'tenant tests', 'persistence boundary tests',
    'route/menu guard tests', 'preview sandbox tests', 'no-production/no-mutation tests',
  ];

  const plannedGates = [
    'scope guard', 'production guard', 'module generation guard', 'route/menu guard',
    'backend/prisma guard', 'mutation guard', 'migration guard', 'dependency guard',
  ];

  const core = {
    kind: 'module-test-gate-plan',
    moduleId: String(b.moduleId ?? 'plannedModule').trim(),
    plannedTests,
    plannedTestCount: plannedTests.length,
    plannedGates,
    plannedGateCount: plannedGates.length,
    createsTestFileNow: false,
    createsGateFileNow: false,
  };

  return safeCloneGenericModel({ ...core, testGatePlanDigest: plannerDigest(core) });
}

export default createModuleTestGatePlan;
