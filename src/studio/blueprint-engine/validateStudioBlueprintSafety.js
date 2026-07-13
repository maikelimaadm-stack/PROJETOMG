import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';

/**
 * Flags on a blueprint that, if present as `true`, are an attempt to escape the
 * headless/contract-only boundary → safety violation.
 */
const ESCAPE_FLAGS = [
  ['uiEnabled', 'UI enable attempt'],
  ['routeEnabled', 'route enable attempt'],
  ['menuEnabled', 'menu enable attempt'],
  ['moduleRegistrationEnabled', 'module registration attempt'],
  ['backendEnabled', 'backend enable attempt'],
  ['prismaEnabled', 'prisma enable attempt'],
  ['migrationEnabled', 'migration enable attempt'],
  ['productionEnabled', 'production enable attempt'],
  ['stagingEnabled', 'staging enable attempt'],
  ['fetchEnabled', 'fetch enable attempt'],
  ['mutationAllowed', 'mutation enable attempt'],
  ['persistenceEnabled', 'persistence enable attempt'],
  ['generatedModuleAllowed', 'generated module attempt'],
  ['rewriteEmpresas', 'rewrite Empresas attempt'],
];

/**
 * Safety validation of a blueprint: asserts the headless/contract-only invariants and
 * default-deny/fail-closed rules. Pure. Any escape flag set true, any enabled mutation
 * permission, any migration/backend requirement, or a runtime binding that activates
 * production / registers a module → violation. Never a side effect.
 *
 * @param {Object} [blueprint]
 * @returns {Object} safety result
 */
export function validateStudioBlueprintSafety(blueprint = {}) {
  const b = isGenericModelPlainObject(blueprint) ? blueprint : {};
  /** @type {string[]} */ const violations = [];

  for (const [flag, label] of ESCAPE_FLAGS) if (b[flag] === true) violations.push(label);

  const permissions = Array.isArray(b.permissions) ? b.permissions : [];
  for (const p of permissions) {
    if (isGenericModelPlainObject(p) && p.action !== 'read' && p.enabled === true) {
      violations.push(`enabled mutation permission: ${p.action}`);
    }
  }

  const persistence = isGenericModelPlainObject(b.persistence) ? b.persistence : {};
  if (persistence.migrationRequired === true) violations.push('persistence requires migration');
  if (persistence.referenceOnly === false) violations.push('persistence not referenceOnly');

  const rb = isGenericModelPlainObject(b.runtimeBinding) ? b.runtimeBinding : {};
  if (rb.activatesProduction === true) violations.push('runtime binding activates production');
  if (rb.registersModule === true) violations.push('runtime binding registers a module');
  if (rb.referenceOnly === false) violations.push('runtime binding not referenceOnly');

  const safe = violations.length === 0;
  return safeCloneGenericModel({
    kind: 'studio-blueprint-safety',
    safe,
    violations,
    // Positive assertion of the invariants the engine guarantees.
    invariants: {
      headless: true,
      failClosed: true,
      defaultDeny: true,
      noUi: true,
      noRoute: true,
      noMenu: true,
      noModuleRegistration: true,
      noBackend: true,
      noPrisma: true,
      noMigration: true,
      noProduction: true,
      noStaging: true,
      noFetch: true,
      noMutation: true,
      noPersistence: true,
      noGeneratedModule: true,
      noRewriteEmpresas: true,
    },
    readiness: safe ? 'safety_valid' : 'safety_violation',
  });
}

export default validateStudioBlueprintSafety;
