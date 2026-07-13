import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { mirrorDigest } from './empresasBlueprintMirrorConfig.js';

/**
 * Classifies each blueprint area against the certified Studio contract, using the
 * alignmentStatus already computed by each mirror part. Records gaps with severity and
 * a recommended (future) fix. No gap is fixed in this slice.
 *
 * @param {Object} [options] the mirror parts
 * @returns {Object} alignment audit
 */
export function createEmpresasBlueprintAlignmentAudit(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const status = (part) => (isGenericModelPlainObject(part) && typeof part.alignmentStatus === 'string' ? part.alignmentStatus : 'unknown');

  const areas = [
    { area: 'module blueprint', alignment: 'aligned' },
    { area: 'field blueprint', alignment: status(o.fieldBlueprint) },
    { area: 'screen blueprint', alignment: status(o.screenBlueprint) },
    { area: 'table blueprint', alignment: status(o.tableFormBlueprint) },
    { area: 'form blueprint', alignment: status(o.tableFormBlueprint) },
    { area: 'filter/search/sort', alignment: status(o.filterSortBlueprint) },
    { area: 'validation', alignment: 'partially_aligned' },
    { area: 'permission', alignment: status(o.permissionBlueprint) },
    { area: 'tenant', alignment: status(o.tenantBlueprint) },
    { area: 'persistence boundary', alignment: status(o.persistenceBoundary) },
    { area: 'runtime binding', alignment: status(o.runtimeBinding) },
    { area: 'diagnostics', alignment: 'aligned' },
    { area: 'fallback', alignment: 'aligned' },
    { area: 'preferences/layout', alignment: 'partially_aligned' },
    { area: 'compatibility with Studio contract', alignment: 'aligned' },
    { area: 'compatibility with Empresas certified contract', alignment: 'aligned' },
  ];

  // Gap registry — derived from the mirror parts, each pointing at a future slice.
  /** @type {Object[]} */ const gaps = [];
  let gapSeq = 0;
  const addGap = (g) => { gapSeq += 1; gaps.push({ gapId: `EMP-GAP-${String(gapSeq).padStart(3, '0')}`, ...g }); };

  if (Array.isArray(o.fieldBlueprint?.unsupportedFields) && o.fieldBlueprint.unsupportedFields.length > 0) {
    addGap({ area: 'field blueprint', severity: 'medium', currentState: `unsupported: ${o.fieldBlueprint.unsupportedFields.join(', ')}`, expectedState: 'mapped to a Studio field type or documented cadcps container', risk: 'custom fields not representable as a single canonical type', recommendedFix: 'define a Studio custom-field/relation type or cadcps binding', requiresEmpresasCodeChange: false, requiresUIChange: false, requiresBackendChange: false, requiresPrismaChange: false, requiresMigration: false, requiresPermissionChange: false, suggestedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 1' });
  }
  addGap({ area: 'screen blueprint', severity: 'low', currentState: 'empty/loading/error states not in read contract', expectedState: 'states confirmed', risk: 'screen state gaps', recommendedFix: 'confirm states in UI reference', requiresEmpresasCodeChange: false, requiresUIChange: false, requiresBackendChange: false, requiresPrismaChange: false, requiresMigration: false, requiresPermissionChange: false, suggestedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 2' });
  addGap({ area: 'validation', severity: 'medium', currentState: 'form validations live in module schema, not in read contract', expectedState: 'validations mirrored to Studio validation contract', risk: 'validation drift', recommendedFix: 'mirror empresasSchema validations as contract, headless', requiresEmpresasCodeChange: false, requiresUIChange: false, requiresBackendChange: false, requiresPrismaChange: false, requiresMigration: false, requiresPermissionChange: false, suggestedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 1' });
  addGap({ area: 'permission', severity: 'high', currentState: 'create/update/delete/configure/admin not certified', expectedState: 'permissions certified fail-closed', risk: 'dangerous if defaulted open', recommendedFix: 'certify Empresas write permissions in a dedicated slice', requiresEmpresasCodeChange: false, requiresUIChange: false, requiresBackendChange: false, requiresPrismaChange: false, requiresMigration: false, requiresPermissionChange: true, suggestedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 4' });
  addGap({ area: 'persistence boundary', severity: 'high', currentState: 'existing production backend/Prisma', expectedState: 'Studio default is noPersistence; alignment is a controlled decision', risk: 'accidental production write if aligned carelessly', recommendedFix: 'keep referenceOnly until a dedicated backend/Prisma readiness slice', requiresEmpresasCodeChange: true, requiresUIChange: false, requiresBackendChange: true, requiresPrismaChange: true, requiresMigration: false, requiresPermissionChange: false, suggestedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 6' });
  addGap({ area: 'preferences/layout', severity: 'low', currentState: 'layout config lives in the module', expectedState: 'layout mirrored to Studio screen contract', risk: 'layout drift', recommendedFix: 'mirror layout config headless', requiresEmpresasCodeChange: false, requiresUIChange: false, requiresBackendChange: false, requiresPrismaChange: false, requiresMigration: false, requiresPermissionChange: false, suggestedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 3' });

  const count = (s) => areas.filter((a) => a.alignment === s).length;
  const body = {
    kind: 'empresas-blueprint-alignment-audit',
    areas,
    alignedAreas: areas.filter((a) => a.alignment === 'aligned').map((a) => a.area),
    partiallyAlignedAreas: areas.filter((a) => a.alignment === 'partially_aligned').map((a) => a.area),
    notAlignedAreas: areas.filter((a) => a.alignment === 'not_aligned').map((a) => a.area),
    unknownAreas: areas.filter((a) => a.alignment === 'unknown').map((a) => a.area),
    blockedAreas: areas.filter((a) => a.alignment === 'blocked').map((a) => a.area),
    gaps,
    gapCount: gaps.length,
    counts: { aligned: count('aligned'), partially_aligned: count('partially_aligned'), not_aligned: count('not_aligned'), unknown: count('unknown'), blocked: count('blocked') },
    anyGapFixedThisSlice: false,
    overallAlignment: count('not_aligned') > 0 || count('blocked') > 0 ? 'not_aligned' : (count('partially_aligned') > 0 ? 'partially_aligned' : 'aligned'),
  };
  return safeCloneGenericModel({ ...body, alignmentAuditDigest: mirrorDigest({ areas: areas.map((a) => [a.area, a.alignment]), gaps: gaps.map((g) => g.gapId) }) });
}

export default createEmpresasBlueprintAlignmentAudit;
