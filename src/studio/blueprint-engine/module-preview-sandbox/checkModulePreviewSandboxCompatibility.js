import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/** Flags whose presence as `true` on the contract is an accidental exposure → blocked. */
const EXPOSURE_FLAGS = [
  ['reactComponentCreated', 'react component created'],
  ['uiCreated', 'UI created'],
  ['routeCreated', 'route exposure'],
  ['menuCreated', 'menu exposure'],
  ['moduleGenerated', 'module generation'],
  ['filesWrittenToModule', 'file write'],
  ['moduleRegistered', 'module registration'],
  ['backendAccessed', 'backend access'],
  ['prismaAccessed', 'prisma access'],
  ['productionAccessed', 'production access'],
  ['stagingAccessed', 'staging access'],
  ['fetchUsed', 'fetch used'],
  ['mutationAllowed', 'mutation exposure'],
  ['persistenceCreated', 'persistence exposure'],
  ['rewriteEmpresas', 'rewrite Empresas'],
];

/**
 * Classifies a preview sandbox contract. Pure. Any accidental exposure, invalid planner/
 * blueprint, unsafe table/form/detail/field metadata, open permission, missing tenant, or
 * a route/menu marked created → `blocked`. `compatibleForRealModuleGeneration` and
 * `compatibleForProduction` are always false.
 *
 * @param {Object} [options]
 * @param {Object} [options.contract]
 * @returns {Object} compatibility result
 */
export function checkModulePreviewSandboxCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = o.contract;

  if (!isGenericModelPlainObject(c)) {
    return safeCloneGenericModel({
      kind: 'module-preview-sandbox-compatibility',
      compatibilityStatus: 'invalid',
      compatibleForPreviewSandbox: false,
      compatibleForDevPreviewContract: false,
      compatibleForRealModuleGeneration: false,
      compatibleForProduction: false,
      blockers: ['contract must be a plain object'],
      warnings: [],
      recommendedNextSlice: 'STUDIO DEV PREVIEW CONTRACT BRIDGE',
    });
  }

  /** @type {string[]} */ const blockers = [];
  for (const [flag, label] of EXPOSURE_FLAGS) if (c[flag] === true) blockers.push(`${label} detected`);

  if (c.plannerValid === false) blockers.push('invalid planner');
  if (c.blueprintValid === false) blockers.push('invalid blueprint');

  const table = isGenericModelPlainObject(c.tablePreviewMetadata) ? c.tablePreviewMetadata : {};
  const form = isGenericModelPlainObject(c.formPreviewMetadata) ? c.formPreviewMetadata : {};
  const detail = isGenericModelPlainObject(c.detailPreviewMetadata) ? c.detailPreviewMetadata : {};
  const field = isGenericModelPlainObject(c.fieldPreviewMetadata) ? c.fieldPreviewMetadata : {};
  const perm = isGenericModelPlainObject(c.permissionPreviewMetadata) ? c.permissionPreviewMetadata : {};
  const rm = isGenericModelPlainObject(c.routeMenuBlockedMetadata) ? c.routeMenuBlockedMetadata : {};
  const persistence = isGenericModelPlainObject(c.persistenceBlockedMetadata) ? c.persistenceBlockedMetadata : {};

  if (table.mutationAllowed === true || table.dataFetched === true || table.componentCreated === true) blockers.push('table metadata unsafe');
  if (form.mutationAllowed === true || form.dataFetched === true || form.componentCreated === true) blockers.push('form metadata unsafe');
  if (detail.readOnly === false || detail.componentCreated === true || detail.dataFetched === true) blockers.push('detail metadata unsafe');
  if (field.hasUnsafeField === true) blockers.push('field metadata unsafe');
  if (perm.defaultDeny === false || perm.failClosed === false) blockers.push('permission unsafe');
  if (perm.tenantRequired === false) blockers.push('tenant absent');
  if (rm.routeCreated === true || rm.menuCreated === true) blockers.push('route/menu exposed');
  if (persistence.blockedNow === false || persistence.migrationAllowedNow === true) blockers.push('persistence real exposed');

  const needsEmpresasAlignment = String(c.moduleId ?? '') === 'empresas' && (isGenericModelPlainObject(c.runtimeBindingMetadata) ? c.runtimeBindingMetadata.rewriteEmpresas === true : false);
  const readyPreview = isGenericModelPlainObject(c.readinessDecision) ? c.readinessDecision.readyForPreviewSandbox === true : false;

  let compatibilityStatus;
  let recommendedNextSlice;
  if (blockers.length > 0) { compatibilityStatus = 'blocked'; recommendedNextSlice = 'resolve blockers'; }
  else if (needsEmpresasAlignment) { compatibilityStatus = 'needs_empresas_alignment'; recommendedNextSlice = 'EMPRESAS STUDIO COMPATIBILITY SLICE'; }
  else if (readyPreview) { compatibilityStatus = 'ready_for_dev_preview_contract'; recommendedNextSlice = 'STUDIO DEV PREVIEW CONTRACT BRIDGE'; }
  else { compatibilityStatus = 'module_preview_sandbox_contract_ready'; recommendedNextSlice = 'STUDIO DEV PREVIEW CONTRACT BRIDGE'; }

  return safeCloneGenericModel({
    kind: 'module-preview-sandbox-compatibility',
    compatibilityStatus,
    compatibleForPreviewSandbox: blockers.length === 0 && readyPreview,
    compatibleForDevPreviewContract: blockers.length === 0 && readyPreview,
    compatibleForRealModuleGeneration: false,
    compatibleForProduction: false,
    blockers,
    warnings: [],
    recommendedNextSlice,
  });
}

export default checkModulePreviewSandboxCompatibility;
