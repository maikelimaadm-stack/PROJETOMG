import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';

/** Flags whose presence as `true` on the slice is an accidental exposure → blocked. */
const EXPOSURE_FLAGS = [
  ['empresasCodeChanged', 'Empresas code change'],
  ['uiCreated', 'UI exposure'],
  ['routeCreated', 'route exposure'],
  ['menuCreated', 'menu exposure'],
  ['moduleRegistered', 'module registration'],
  ['backendAccessed', 'backend access'],
  ['prismaAccessed', 'prisma access'],
  ['productionAccessed', 'production access'],
  ['stagingAccessed', 'staging access'],
  ['fetchUsed', 'fetch used'],
  ['mutationAllowed', 'mutation exposure'],
  ['rewriteEmpresas', 'rewrite Empresas'],
];

/**
 * Classifies compatibility slice 1. Pure. Any accidental exposure (Empresas code
 * change / UI / route / menu / module / backend / Prisma / mutation / rewrite), an
 * untracked critical gap, a backend/Prisma gap treated as a real change, a suggested
 * migration in this slice, or a gap without a plan → `blocked`. Otherwise the status
 * reflects what the next safe step is.
 *
 * @param {Object} [options]
 * @param {Object} [options.slice]
 * @returns {Object} compatibility result
 */
export function checkEmpresasStudioCompatibilitySlice1(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const s = o.slice;

  if (!isGenericModelPlainObject(s)) {
    return safeCloneGenericModel({
      kind: 'empresas-compatibility-slice1-result',
      status: 'invalid', compatibleForNextStep: false, recommendedNextStep: 'EMPRESAS STUDIO COMPATIBILITY SLICE 2',
      gapSummary: {}, blockers: ['slice must be a plain object'], warnings: [],
    });
  }

  /** @type {string[]} */ const blockers = [];
  for (const [flag, label] of EXPOSURE_FLAGS) if (s[flag] === true) blockers.push(`${label} detected`);

  const registry = isGenericModelPlainObject(s.gapRegistry) ? s.gapRegistry : {};
  const gaps = Array.isArray(registry.gaps) ? registry.gaps : [];
  if ((registry.untrackedCriticalGaps ?? 0) > 0) blockers.push('untracked critical gap');
  for (const g of gaps) {
    if (!g.recommendedSlice || !g.recommendedFix) blockers.push(`gap without plan: ${g.gapId}`);
    if (g.requiresMigration === true) blockers.push(`migration suggested in slice 1: ${g.gapId}`);
    if (g.fixedThisSlice === true) blockers.push(`gap fixed by changing Empresas: ${g.gapId}`);
  }
  // Backend/Prisma must remain readiness-only, never a real change this slice.
  const readiness = isGenericModelPlainObject(s.backendPrismaReadiness) ? s.backendPrismaReadiness : {};
  if (readiness.schemaAlteredThisSlice === true || readiness.requiresMigration === true) blockers.push('backend/prisma treated as real change');

  const needsEmpresas = gaps.some((g) => g.requiresEmpresasCodeChange === true);
  const needsUi = gaps.some((g) => g.requiresUIChange === true);
  const needsBackendPrisma = gaps.some((g) => g.requiresBackendChange === true || g.requiresPrismaSchemaChange === true);

  let status;
  let recommendedNextStep;
  if (blockers.length > 0) { status = 'blocked'; recommendedNextStep = 'resolve blockers'; }
  else if (needsBackendPrisma) { status = 'needs_backend_prisma_readiness'; recommendedNextStep = 'STUDIO BLUEPRINT ENGINE FOUNDATION (backend/Prisma deferred to SLICE 6)'; }
  else if (needsUi) { status = 'needs_ui_alignment'; recommendedNextStep = 'EMPRESAS STUDIO COMPATIBILITY SLICE 2'; }
  else if (needsEmpresas) { status = 'needs_empresas_alignment'; recommendedNextStep = 'EMPRESAS STUDIO COMPATIBILITY SLICE 2'; }
  else { status = 'compatibility_slice_1_complete'; recommendedNextStep = 'STUDIO BLUEPRINT ENGINE FOUNDATION'; }

  return safeCloneGenericModel({
    kind: 'empresas-compatibility-slice1-result',
    status,
    compatibleForNextStep: blockers.length === 0,
    recommendedNextStep,
    gapSummary: {
      total: gaps.length,
      contractOnlyResolvable: gaps.filter((g) => g.canResolveContractOnly === true).length,
      requiresEmpresasCodeChange: gaps.filter((g) => g.requiresEmpresasCodeChange === true).length,
      requiresBackendOrPrisma: gaps.filter((g) => g.requiresBackendChange === true || g.requiresPrismaSchemaChange === true).length,
      requiresMigration: gaps.filter((g) => g.requiresMigration === true).length,
    },
    blockers,
    warnings: [],
  });
}

export default checkEmpresasStudioCompatibilitySlice1;
