import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Classifies a runtime binding. Pure. A binding is a reference only: it never
 * activates production, registers a module, changes App/menu, accesses Prisma/backend
 * directly, ignores tenant/permission, rewrites Empresas, or promotes an experimental
 * model to production.
 * @param {unknown} binding
 * @returns {{ valid: boolean, blocked: boolean, reasons: string[] }}
 */
export function evaluateStudioRuntimeBinding(binding) {
  const b = isGenericModelPlainObject(binding) ? binding : {};
  /** @type {string[]} */ const reasons = [];

  if (b.activatesProduction === true) reasons.push('activates production');
  if (b.registersModule === true) reasons.push('registers module');
  if (b.appJsxChanged === true || b.menuChanged === true) reasons.push('alters App/menu');
  if (b.accessesPrismaDirectly === true) reasons.push('accesses Prisma directly');
  if (b.accessesBackendDirectly === true) reasons.push('accesses backend directly');
  if (b.ignoresTenant === true || b.tenantScoped === false) reasons.push('ignores tenant');
  if (b.ignoresPermission === true || b.permissionRequired === false) reasons.push('ignores permission');
  if (b.rewritesEmpresas === true) reasons.push('rewrites Empresas');
  if (b.promotesFuelToProduction === true) reasons.push('transforms Fuel into production');
  if (b.usesModeloBase2AsProduction === true) reasons.push('uses ModeloBase2 as production');
  // Reference-role sanity: operacional must remain experimental.
  if (b.bindingType === 'operacional' && b.experimental === false) reasons.push('operacional must remain experimental');

  const valid = reasons.length === 0;
  return { valid, blocked: !valid, reasons };
}

const VALID_BINDINGS = [
  ['cadastro -> ModeloBase1 reference', { bindingType: 'cadastro', ref: 'ModeloBase1', tenantScoped: true, permissionRequired: true }],
  ['operacional -> ModeloBase2 experimental', { bindingType: 'operacional', ref: 'ModeloBase2', experimental: true, tenantScoped: true, permissionRequired: true }],
  ['Empresas certified seed', { bindingType: 'cadastro', ref: 'empresas-local-read-contract@1.0.0', readOnly: true, tenantScoped: true, permissionRequired: true }],
  ['cadcps field reference', { bindingType: 'cadastro', ref: 'src/modules/cadcps', tenantScoped: true, permissionRequired: true }],
  ['generic model kernel', { bindingType: 'cadastro', ref: 'src/runtime/generic-model', tenantScoped: true, permissionRequired: true }],
].map(([name, b]) => [name, b, true]);

const INVALID_BINDINGS = [
  ['activates production', { bindingType: 'cadastro', activatesProduction: true }],
  ['registers module', { bindingType: 'cadastro', registersModule: true }],
  ['alters App/menu', { bindingType: 'cadastro', appJsxChanged: true }],
  ['accesses Prisma directly', { bindingType: 'cadastro', accessesPrismaDirectly: true }],
  ['ignores tenant', { bindingType: 'cadastro', tenantScoped: false }],
  ['ignores permission', { bindingType: 'cadastro', permissionRequired: false }],
  ['rewrites Empresas', { bindingType: 'cadastro', rewritesEmpresas: true }],
  ['Fuel to production', { bindingType: 'operacional', experimental: true, promotesFuelToProduction: true }],
  ['ModeloBase2 as production', { bindingType: 'operacional', experimental: true, usesModeloBase2AsProduction: true }],
].map(([name, b]) => [name, b, false]);

/**
 * Runs the runtime binding hardening matrix. Pure.
 * @param {Object} [options]
 * @returns {Object} matrix result
 */
export function createStudioRuntimeBindingHardeningMatrix(options = {}) {
  void options;
  const scenarios = [...VALID_BINDINGS, ...INVALID_BINDINGS].map(([name, binding, expectValid]) => {
    const r = evaluateStudioRuntimeBinding(binding);
    return {
      name,
      valid: r.valid,
      blocked: r.blocked,
      expectValid: Boolean(expectValid),
      matchedExpectation: r.valid === Boolean(expectValid),
      activatesProduction: false, registersModule: false, prismaAccessed: false,
      reasons: r.reasons.slice(0, 4),
    };
  });
  const mismatches = scenarios.filter((s) => !s.matchedExpectation).map((s) => s.name);
  return safeCloneGenericModel({
    kind: 'studio-runtime-binding-hardening-matrix',
    scenarios,
    scenarioCount: scenarios.length,
    allMatched: mismatches.length === 0,
    blockers: mismatches,
    warnings: [],
    readiness: mismatches.length === 0 ? 'blueprint_contract_hardened' : 'blocked',
  });
}

export default createStudioRuntimeBindingHardeningMatrix;
