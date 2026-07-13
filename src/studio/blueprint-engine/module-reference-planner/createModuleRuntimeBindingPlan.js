import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { plannerDigest } from './moduleReferencePlannerConfig.js';

/**
 * Plans the RUNTIME BINDING a module WOULD use. Pure. The binding does not activate
 * production, does not register a module, does not access Prisma directly, and does not
 * alter Empresas. ModeloBase2/Fuel are experimental only. When the source module is
 * `empresas`, the binding is `referenceOnly`.
 *
 * @param {Object} [options]
 * @param {Object} [options.blueprint] normalized blueprint
 * @returns {Object} runtime binding plan
 */
export function createModuleRuntimeBindingPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.blueprint) ? o.blueprint : {};
  const moduleId = String(b.moduleId ?? 'plannedModule').trim();
  const modelType = String(b.modelType ?? 'cadastro').trim();
  const isEmpresas = moduleId === 'empresas';

  const bindings = {
    genericModelRuntime: { ref: 'src/runtime/generic-model', role: 'contracts/safety/diagnostics kernel', activatesProduction: false },
    modeloBase1: { ref: 'src/ModeloBase1', role: 'cadastro reference (production-close)', selectedFor: modelType === 'cadastro' ? 'cadastro' : null },
    modeloBase2Experimental: { ref: 'src/ModeloBase2', role: 'operacional reference (experimental only)', productionAllowed: false, selectedFor: modelType === 'operacional' ? 'operacional-experimental' : null },
    empresasMirror: isEmpresas ? { ref: 'empresas-certified-blueprint-mirror@1.0.0', role: 'certified seed', referenceOnly: true } : null,
    diagnostics: { role: 'passive' },
    fallback: { role: 'fail-closed' },
    gates: { role: 'required before any activation' },
  };

  const core = {
    kind: 'module-runtime-binding-plan',
    moduleId,
    modelType,
    selectedBinding: modelType === 'cadastro' ? 'modeloBase1' : 'modeloBase2Experimental',
    bindings,
    activatesProduction: false,
    registersModule: false,
    accessesPrismaDirectly: false,
    altersEmpresas: false,
    modeloBase2IsProduction: false,
    sourceModuleReferenceOnly: isEmpresas,
  };

  return safeCloneGenericModel({ ...core, runtimeBindingPlanDigest: plannerDigest(core) });
}

export default createModuleRuntimeBindingPlan;
