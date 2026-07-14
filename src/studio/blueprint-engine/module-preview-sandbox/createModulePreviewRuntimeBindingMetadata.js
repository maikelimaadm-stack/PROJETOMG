import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { sandboxDigest } from './modulePreviewSandboxConfig.js';

/**
 * Builds RUNTIME BINDING preview metadata. Pure. No binding is created, no module is
 * registered, production is not activated, Prisma is not accessed, Empresas is not
 * rewritten. ModeloBase2/Fuel never appear as production.
 *
 * @param {Object} [options]
 * @param {Object} [options.plan] a module reference plan
 * @returns {Object} runtime binding preview metadata
 */
export function createModulePreviewRuntimeBindingMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const rbp = isGenericModelPlainObject(plan.runtimeBindingPlan) ? plan.runtimeBindingPlan : {};
  const isEmpresas = String(plan.moduleId ?? '') === 'empresas';

  const core = {
    kind: 'module-preview-runtime-binding-metadata',
    moduleId: String(plan.moduleId ?? 'plannedModule'),
    runtimeBindingPlan: 'module-reference-plan.runtimeBindingPlan',
    selectedBinding: typeof rbp.selectedBinding === 'string' ? rbp.selectedBinding : 'modeloBase1',
    genericModelRuntimeBinding: { ref: 'src/runtime/generic-model', activatesProduction: false },
    modeloBase1Binding: { ref: 'src/ModeloBase1', role: 'cadastro reference', productionAllowed: false },
    modeloBase2ExperimentalBinding: { ref: 'src/ModeloBase2', role: 'operacional experimental', productionAllowed: false },
    empresasReferenceBinding: isEmpresas ? { ref: 'empresas-certified-blueprint-mirror@1.0.0', referenceOnly: true } : null,
    diagnosticsBinding: { role: 'passive' },
    fallbackBinding: { role: 'fail-closed' },
    bindingCreated: false,
    moduleRegistered: false,
    productionActivated: false,
    prismaAccessed: false,
    rewriteEmpresas: false,
    modeloBase2IsProduction: false,
    previewOnly: true,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, runtimeBindingDigest: sandboxDigest(core) });
}

export default createModulePreviewRuntimeBindingMetadata;
