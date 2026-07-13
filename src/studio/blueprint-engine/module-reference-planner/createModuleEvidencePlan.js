import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { plannerDigest } from './moduleReferencePlannerConfig.js';

/**
 * Plans the EVIDENCE docs a future module slice WOULD produce. Pure. Descriptive only;
 * writes no evidence file for the future module.
 *
 * @param {Object} [options]
 * @param {Object} [options.blueprint] normalized blueprint
 * @returns {Object} evidence plan
 */
export function createModuleEvidencePlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.blueprint) ? o.blueprint : {};

  const plannedEvidence = [
    'module reference plan report', 'blueprint source report', 'field/table/form report',
    'permission/tenant report', 'persistence boundary report', 'route/menu report',
    'test/gate report', 'safety/no-production report', 'readiness decision report',
  ];

  const core = {
    kind: 'module-evidence-plan',
    moduleId: String(b.moduleId ?? 'plannedModule').trim(),
    plannedEvidence,
    plannedEvidenceCount: plannedEvidence.length,
    createsEvidenceFileNow: false,
  };

  return safeCloneGenericModel({ ...core, evidencePlanDigest: plannerDigest(core) });
}

export default createModuleEvidencePlan;
