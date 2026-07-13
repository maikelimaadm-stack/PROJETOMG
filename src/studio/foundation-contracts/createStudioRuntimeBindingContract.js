import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createStudioContractDigest } from './createStudioContractDigest.js';

export const STUDIO_RUNTIME_BINDING_TYPES = ['cadastro', 'operacional', 'dashboardPlanned', 'workflowPlanned', 'marketplacePlanned'];

/**
 * The Runtime Binding contract: maps blueprint types to runtimes as references.
 * Pure. Never activates production, never registers a module, never touches Prisma.
 *
 * @param {Object} [options]
 * @returns {Object} runtime binding contract descriptor
 */
export function createStudioRuntimeBindingContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const bindings = {
    genericModelRuntime: { ref: 'src/runtime/generic-model', role: 'contracts/safety/diagnostics kernel' },
    modeloBase1: { ref: 'src/ModeloBase1', role: 'cadastro reference (production-close)' },
    modeloBase2Experimental: { ref: 'src/ModeloBase2', role: 'operacional reference (experimental)' },
    empresasCertifiedContract: { ref: 'empresas-local-read-contract@1.0.0', role: 'certified seed model (not rewritten)' },
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
    kind: 'studio-runtime-binding-contract',
    types: [...STUDIO_RUNTIME_BINDING_TYPES],
    typeMap,
    bindings,
    activatesProduction: false,
    registersModule: false,
    accessesPrismaDirectly: false,
    rules: [
      'cadastro uses ModeloBase1 as initial reference',
      'operacional may reference ModeloBase2 experimental, never production',
      'Empresas is a certified seed model, not rewritten',
      'runtime binding does not activate production',
      'runtime binding does not register a module',
      'runtime binding does not access Prisma directly',
    ],
  };
  return safeCloneGenericModel({ ...body, runtimeBindingDigest: createStudioContractDigest({ value: { types: STUDIO_RUNTIME_BINDING_TYPES, typeMap } }) });
}

export default createStudioRuntimeBindingContract;
