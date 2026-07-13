import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createStudioCanonicalRuntimeBinding } from '../../foundation-contracts/certification/createStudioCanonicalRuntimeBinding.js';
import { mirrorDigest } from './empresasBlueprintMirrorConfig.js';

/**
 * Mirrors the Empresas runtime binding as reference-only against the certified Studio
 * runtime binding. Pure, headless. cadastro → ModeloBase1; Empresas certified read
 * contract is the seed model; cadcps is the field reference. The binding never
 * activates production, registers a module, rewrites Empresas, accesses Prisma
 * directly, or bypasses tenant/permission. ModeloBase2/Fuel never enter as production.
 *
 * @param {Object} [options]
 * @returns {Object} runtime binding mirror
 */
export function createEmpresasRuntimeBindingMirror(options = {}) {
  void options;
  const canonical = createStudioCanonicalRuntimeBinding();

  const bindings = {
    modeloBase1: { ref: 'src/ModeloBase1', role: 'cadastro reference for Empresas' },
    empresasCertifiedContract: { ref: 'empresas-local-read-contract@1.0.0', role: 'seed model (not rewritten)' },
    studioBlueprintContract: { ref: 'studio-blueprint-contract@1.0.0', role: 'certified reference' },
    runtimeReadModel: { ref: 'empresas runtime read projection', role: 'documented, referenceOnly' },
    fallback: { role: 'fail-closed' },
    cadcpsReference: { ref: 'src/modules/cadcps', role: 'campos_personalizados field reference' },
    genericModelRuntime: { ref: 'src/runtime/generic-model', role: 'kernel' },
  };

  const body = {
    kind: 'empresas-runtime-binding-mirror',
    bindings,
    canonicalTypeMap: { ...canonical.typeMap },
    modelType: 'cadastro',
    modelFamily: 'ModeloBase1',
    activatesProduction: false,
    registersModule: false,
    rewritesEmpresas: false,
    accessesPrismaDirectly: false,
    bypassesTenant: false,
    bypassesPermission: false,
    modeloBase2AsProduction: false,
    fuelAsProduction: false,
    alignmentStatus: 'aligned',
  };
  return safeCloneGenericModel({ ...body, runtimeBindingDigest: mirrorDigest({ bindings: Object.keys(bindings), modelFamily: body.modelFamily }) });
}

export default createEmpresasRuntimeBindingMirror;
