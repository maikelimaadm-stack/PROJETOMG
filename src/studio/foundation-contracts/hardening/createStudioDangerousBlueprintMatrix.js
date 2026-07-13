import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Each dangerous flag maps to how it manifests in a blueprint and the classification
 * it must receive (all must be blocked; breaking = a released capability, invalid =
 * a nonsensical/unsafe declaration).
 */
const DANGEROUS_CASES = [
  ['productionAllowed true', { productionAllowed: true }, 'breaking'],
  ['menuVisible true', { menuVisible: true }, 'breaking'],
  ['routeEnabled true', { routeEnabled: true }, 'breaking'],
  ['backendAllowed true', { backendAllowed: true }, 'breaking'],
  ['prismaAllowed true', { prismaAllowed: true }, 'breaking'],
  ['migrationAllowed true', { migrationAllowed: true }, 'breaking'],
  ['mutationAllowed true', { mutationAllowed: true }, 'breaking'],
  ['generatedModuleAllowed true', { generatedModuleAllowed: true }, 'breaking'],
  ['marketplaceEnabled true', { marketplaceEnabled: true }, 'breaking'],
  ['defaultDeny false', { defaultDeny: false }, 'breaking'],
  ['failClosed false', { failClosed: false }, 'breaking'],
  ['tenantRequired false', { tenantRequired: false }, 'breaking'],
  ['permissionRequired false', { permissionRequired: false }, 'breaking'],
  ['adminBypassesTenant true', { adminBypassesTenant: true }, 'invalid'],
  ['deleteAllowedByDefault true', { deleteAllowedByDefault: true }, 'breaking'],
  ['publicRoute true', { publicRoute: true }, 'invalid'],
  ['unauthenticatedAccess true', { unauthenticatedAccess: true }, 'invalid'],
  ['autoRegister true', { autoRegister: true }, 'breaking'],
  ['autoPublish true', { autoPublish: true }, 'breaking'],
  ['autoMigration true', { autoMigration: true }, 'breaking'],
  ['rawCodeExecution true', { rawCodeExecution: true }, 'invalid'],
  ['customScript present', { customScript: 'doEvil()' }, 'invalid'],
  ['unsafeComputed true', { unsafeComputed: true }, 'invalid'],
  ['externalUrlBinding present', { externalUrlBinding: 'https://evil.example' }, 'invalid'],
  ['fetchEnabled true', { fetchEnabled: true }, 'breaking'],
  ['databaseUrlBinding present', { databaseUrlBinding: 'postgres://x' }, 'invalid'],
  ['prismaClientBinding present', { prismaClientBinding: 'PrismaClient' }, 'invalid'],
];

/** Flags that must never be true; true → dangerous. */
const MUST_BE_FALSE = new Set([
  'productionAllowed', 'menuVisible', 'routeEnabled', 'backendAllowed', 'prismaAllowed',
  'migrationAllowed', 'mutationAllowed', 'generatedModuleAllowed', 'marketplaceEnabled',
  'adminBypassesTenant', 'deleteAllowedByDefault', 'publicRoute', 'unauthenticatedAccess',
  'autoRegister', 'autoPublish', 'autoMigration', 'rawCodeExecution', 'unsafeComputed', 'fetchEnabled',
]);
/** Guards that must never be false; false → dangerous. */
const MUST_BE_TRUE = new Set(['defaultDeny', 'failClosed', 'tenantRequired', 'permissionRequired']);
/** Presence of these string bindings is dangerous regardless of value. */
const FORBIDDEN_BINDINGS = new Set(['customScript', 'externalUrlBinding', 'databaseUrlBinding', 'prismaClientBinding']);

/**
 * Classifies a blueprint descriptor for dangerous flags. Pure.
 * @param {unknown} descriptor
 * @returns {{ dangerous: boolean, blocked: boolean, reasons: string[] }}
 */
export function evaluateDangerousBlueprint(descriptor) {
  const d = isGenericModelPlainObject(descriptor) ? descriptor : {};
  /** @type {string[]} */ const reasons = [];
  for (const [k, v] of Object.entries(d)) {
    if (MUST_BE_FALSE.has(k) && v === true) reasons.push(`${k} must not be true`);
    if (MUST_BE_TRUE.has(k) && v === false) reasons.push(`${k} must not be false`);
    if (FORBIDDEN_BINDINGS.has(k) && v != null && v !== false) reasons.push(`${k} is forbidden`);
  }
  const dangerous = reasons.length > 0;
  return { dangerous, blocked: dangerous, reasons };
}

/**
 * Runs the dangerous-blueprint matrix. Every case must be blocked. Pure.
 * @param {Object} [options]
 * @returns {Object} matrix result
 */
export function createStudioDangerousBlueprintMatrix(options = {}) {
  void options;
  const scenarios = DANGEROUS_CASES.map(([name, descriptor, classification]) => {
    const r = evaluateDangerousBlueprint(descriptor);
    return {
      name,
      dangerous: r.dangerous,
      blocked: r.blocked,
      classification,
      blockerCode: 'STUDIO_HARDENING_DANGEROUS_BLUEPRINT',
      readiness: 'blocked',
      sideEffects: false,
      productionAccessed: false, backendAccessed: false, prismaAccessed: false,
      migrationExecuted: false, mutationExecuted: false, fetchUsed: false,
      reasons: r.reasons.slice(0, 4),
    };
  });

  const notBlocked = scenarios.filter((s) => !s.blocked).map((s) => s.name);
  return safeCloneGenericModel({
    kind: 'studio-dangerous-blueprint-matrix',
    scenarios,
    scenarioCount: scenarios.length,
    allBlocked: notBlocked.length === 0,
    breakingCount: scenarios.filter((s) => s.classification === 'breaking').length,
    invalidCount: scenarios.filter((s) => s.classification === 'invalid').length,
    blockers: notBlocked,
    warnings: [],
    readiness: notBlocked.length === 0 ? 'blueprint_contract_hardened' : 'blocked',
  });
}

export default createStudioDangerousBlueprintMatrix;
