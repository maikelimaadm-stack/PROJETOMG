import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_RUNTIME_BINDING_TYPES } from '../createStudioRuntimeBindingContract.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

/**
 * Certifies the canonical runtime binding — references only. Pure. cadastro references
 * ModeloBase1; operacional references ModeloBase2 (experimental only); Empresas is a
 * certified seed model and the real/controlled lab (not rewritten in this slice); the
 * binding never activates production, registers a module, accesses Prisma directly, or
 * bypasses tenant/permission.
 *
 * @param {Object} [options]
 * @returns {Object} canonical runtime binding
 */
export function createStudioCanonicalRuntimeBinding(options = {}) {
  void options;
  const bindings = {
    genericModelRuntime: { ref: 'src/runtime/generic-model', role: 'contracts/safety/diagnostics kernel' },
    modeloBase1: { ref: 'src/ModeloBase1', role: 'cadastro reference (production-close)' },
    modeloBase2Experimental: { ref: 'src/ModeloBase2', role: 'operacional reference (experimental only)' },
    empresasCertifiedContract: { ref: 'empresas-local-read-contract@1.0.0', role: 'certified seed model + real/controlled lab (not rewritten this slice)' },
    cadcpsReference: { ref: 'src/modules/cadcps', role: 'field reference (campos personalizados)' },
    diagnostics: { role: 'passive' },
    fallback: { role: 'fail-closed' },
    gates: { role: 'required before generation' },
  };
  const typeMap = {
    cadastro: 'modeloBase1',
    operacional: 'modeloBase2Experimental',
    dashboardPlanned: 'planned',
    workflowPlanned: 'planned',
    marketplacePlanned: 'planned',
  };

  const body = {
    kind: 'studio-canonical-runtime-binding',
    types: [...STUDIO_RUNTIME_BINDING_TYPES],
    typeMap,
    bindings,
    activatesProduction: false,
    registersModule: false,
    accessesPrismaDirectly: false,
    rewritesEmpresas: false,
    bypassesTenant: false,
    bypassesPermission: false,
    empresasIsRealControlledLab: true,
    empresasEditableInFutureSliceOnly: true,
  };
  return safeCloneGenericModel({ ...body, canonicalRuntimeBindingDigest: certificationDigest({ types: STUDIO_RUNTIME_BINDING_TYPES, typeMap }) });
}

export default createStudioCanonicalRuntimeBinding;
