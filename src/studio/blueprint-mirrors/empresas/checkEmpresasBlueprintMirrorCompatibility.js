import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/** Flags whose presence as `true` on the mirror is an accidental exposure → blocked. */
const EXPOSURE_FLAGS = [
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
 * Classifies the Empresas mirror against the certified Studio blueprint contract and
 * the Empresas certified read contract. Pure. Any accidental UI/route/menu/backend/
 * Prisma/mutation/rewrite exposure is `blocked`; otherwise the classification reflects
 * the alignment audit (compatible / partially_compatible / needs_alignment).
 *
 * @param {Object} [options]
 * @param {Object} [options.mirror]
 * @returns {Object} compatibility result
 */
export function checkEmpresasBlueprintMirrorCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const mir = o.mirror;

  if (!isGenericModelPlainObject(mir)) {
    return safeCloneGenericModel({
      kind: 'empresas-blueprint-mirror-compatibility',
      compatibilityStatus: 'invalid',
      compatibleAreas: [], partialAreas: [], gaps: [], blockers: ['mirror must be a plain object'], warnings: [],
      recommendedNextSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 1',
    });
  }

  /** @type {string[]} */ const blockers = [];
  for (const [flag, label] of EXPOSURE_FLAGS) {
    const v = mir[flag];
    const bad = flag === 'headless' ? v === false : v === true;
    if (bad) blockers.push(`${label} detected`);
  }

  const audit = isGenericModelPlainObject(mir.alignmentAudit) ? mir.alignmentAudit : {};
  const compatibleAreas = Array.isArray(audit.alignedAreas) ? audit.alignedAreas : [];
  const partialAreas = Array.isArray(audit.partiallyAlignedAreas) ? audit.partiallyAlignedAreas : [];
  const notAligned = Array.isArray(audit.notAlignedAreas) ? audit.notAlignedAreas : [];
  const gaps = Array.isArray(audit.gaps) ? audit.gaps : [];

  let compatibilityStatus;
  if (blockers.length > 0) compatibilityStatus = 'blocked';
  else if (notAligned.length > 0) compatibilityStatus = 'needs_alignment';
  else if (partialAreas.length > 0) compatibilityStatus = 'partially_compatible';
  else compatibilityStatus = 'compatible';

  return safeCloneGenericModel({
    kind: 'empresas-blueprint-mirror-compatibility',
    compatibilityStatus,
    compatibleAreas,
    partialAreas,
    notAlignedAreas: notAligned,
    gaps,
    blockers,
    warnings: [],
    recommendedNextSlice: gaps.length > 0 ? 'EMPRESAS STUDIO COMPATIBILITY SLICE 1' : 'STUDIO BLUEPRINT ENGINE FOUNDATION',
  });
}

export default checkEmpresasBlueprintMirrorCompatibility;
