import { safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import { createEmpresasCertifiedBlueprintMirror } from '../createEmpresasCertifiedBlueprintMirror.js';
import { compatDigest } from './empresasStudioCompatibilitySlice1Config.js';

/**
 * The 10 formal gaps this slice tracks, consolidating the mirror alignment audit
 * (PR #458) into contract-only entries. Nothing here is fixed by changing Empresas.
 */
const GAP_DEFS = [
  {
    id: 'ECS1-GAP-001', title: 'Dedicated detail screen absent', area: 'screen blueprint', source: 'mirror screen',
    currentState: 'no dedicated detail screen (only table + form)', expectedStudioState: 'detail screen (may derive from form read-only)',
    severity: 'low', canResolveContractOnly: true, requiresEmpresasCodeChange: false, requiresUIChange: false, requiresModeloBase1Change: false,
    requiresBackendChange: false, requiresPrismaSchemaChange: false, requiresMigration: false, requiresPermissionChange: false, requiresRuntimeBindingChange: false,
    recommendedFix: 'derive detail from form read-only (contract), no new UI', recommendedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 2',
  },
  {
    id: 'ECS1-GAP-002', title: 'Empty/loading/error states not in read contract', area: 'state coverage', source: 'mirror screen',
    currentState: 'states not confirmed in read contract', expectedStudioState: 'empty/loading/error states confirmed',
    severity: 'low', canResolveContractOnly: true, requiresEmpresasCodeChange: false, requiresUIChange: false, requiresModeloBase1Change: false,
    requiresBackendChange: false, requiresPrismaSchemaChange: false, requiresMigration: false, requiresPermissionChange: false, requiresRuntimeBindingChange: false,
    recommendedFix: 'map states as contract reference from ModeloBase1', recommendedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 2',
  },
  {
    id: 'ECS1-GAP-003', title: 'Write capabilities create/update/delete reference-only', area: 'write capability', source: 'mirror permission',
    currentState: 'create/update/delete exist in production UI, not certified', expectedStudioState: 'write capabilities certified fail-closed',
    severity: 'high', canResolveContractOnly: false, requiresEmpresasCodeChange: false, requiresUIChange: false, requiresModeloBase1Change: false,
    requiresBackendChange: false, requiresPrismaSchemaChange: false, requiresMigration: false, requiresPermissionChange: true, requiresRuntimeBindingChange: false,
    recommendedFix: 'certify write permissions in a dedicated permission/tenant slice', recommendedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 4',
  },
  {
    id: 'ECS1-GAP-004', title: 'Persistence boundary is existingProduction/referenceOnly', area: 'persistence boundary', source: 'mirror persistence',
    currentState: 'real production backend + Prisma (referenceOnly)', expectedStudioState: 'Studio default noPersistence; controlled alignment',
    severity: 'high', canResolveContractOnly: true, requiresEmpresasCodeChange: true, requiresUIChange: false, requiresModeloBase1Change: false,
    requiresBackendChange: true, requiresPrismaSchemaChange: true, requiresMigration: false, requiresPermissionChange: false, requiresRuntimeBindingChange: false,
    recommendedFix: 'keep referenceOnly; formalize bridge; defer real change to a backend/Prisma readiness slice', recommendedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 6',
  },
  {
    id: 'ECS1-GAP-005', title: 'Backend/Prisma readiness undocumented as Studio map', area: 'backend/prisma readiness', source: 'mirror persistence',
    currentState: 'backend/Prisma real, only mirrored', expectedStudioState: 'formal readiness map (documental)',
    severity: 'medium', canResolveContractOnly: true, requiresEmpresasCodeChange: false, requiresUIChange: false, requiresModeloBase1Change: false,
    requiresBackendChange: false, requiresPrismaSchemaChange: false, requiresMigration: false, requiresPermissionChange: false, requiresRuntimeBindingChange: false,
    recommendedFix: 'document readiness map (contract-only); no migration', recommendedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 6',
  },
  {
    id: 'ECS1-GAP-006', title: 'Preferences/layout reference-only', area: 'preferences/layout', source: 'mirror screen',
    currentState: 'layout/preferences live in the module', expectedStudioState: 'preferences mirrored to Studio screen contract',
    severity: 'low', canResolveContractOnly: true, requiresEmpresasCodeChange: false, requiresUIChange: false, requiresModeloBase1Change: false,
    requiresBackendChange: false, requiresPrismaSchemaChange: false, requiresMigration: false, requiresPermissionChange: false, requiresRuntimeBindingChange: false,
    recommendedFix: 'mirror preferences/layout as contract (referenceOnly)', recommendedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 3',
  },
  {
    id: 'ECS1-GAP-007', title: 'Permission write scopes need future classification', area: 'permission', source: 'mirror permission',
    currentState: 'configure/admin/export scopes not certified', expectedStudioState: 'permission scopes certified fail-closed',
    severity: 'medium', canResolveContractOnly: true, requiresEmpresasCodeChange: false, requiresUIChange: false, requiresModeloBase1Change: false,
    requiresBackendChange: false, requiresPrismaSchemaChange: false, requiresMigration: false, requiresPermissionChange: true, requiresRuntimeBindingChange: false,
    recommendedFix: 'classify permission scopes as future contract; no real permission change', recommendedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 4',
  },
  {
    id: 'ECS1-GAP-008', title: 'Tenant/header/erp_empresa_id scope documentation', area: 'tenant', source: 'mirror tenant',
    currentState: 'erp_empresa_id/empresaHeader documented, not certified', expectedStudioState: 'tenant scope signals certified',
    severity: 'medium', canResolveContractOnly: true, requiresEmpresasCodeChange: false, requiresUIChange: false, requiresModeloBase1Change: false,
    requiresBackendChange: false, requiresPrismaSchemaChange: false, requiresMigration: false, requiresPermissionChange: false, requiresRuntimeBindingChange: false,
    recommendedFix: 'document tenant scope signals as contract; tenant never bypassed', recommendedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 4',
  },
  {
    id: 'ECS1-GAP-009', title: 'Validation metadata refinement', area: 'validation', source: 'mirror table/form',
    currentState: 'form validations live in empresasSchema, not in read contract', expectedStudioState: 'validations mirrored to Studio validation contract',
    severity: 'medium', canResolveContractOnly: true, requiresEmpresasCodeChange: false, requiresUIChange: false, requiresModeloBase1Change: false,
    requiresBackendChange: false, requiresPrismaSchemaChange: false, requiresMigration: false, requiresPermissionChange: false, requiresRuntimeBindingChange: false,
    recommendedFix: 'mirror validation metadata as contract (headless)', recommendedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 2',
  },
  {
    id: 'ECS1-GAP-010', title: 'Diagnostics/fallback runtime usage plan', area: 'diagnostics/fallback', source: 'mirror diagnostics',
    currentState: 'diagnostics/fallback exist headless, no runtime consumption plan', expectedStudioState: 'documented future runtime usage (still headless)',
    severity: 'low', canResolveContractOnly: true, requiresEmpresasCodeChange: false, requiresUIChange: false, requiresModeloBase1Change: false,
    requiresBackendChange: false, requiresPrismaSchemaChange: false, requiresMigration: false, requiresPermissionChange: false, requiresRuntimeBindingChange: true,
    recommendedFix: 'document runtime usage plan; consumption only in a future runtime binding pilot', recommendedSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 5',
  },
];

/**
 * Builds the formal gap registry, consolidating the mirror alignment audit. Pure,
 * headless. Every gap has a plan and a future slice; nothing is fixed by changing
 * Empresas. A critical gap without a plan would be an untracked critical gap.
 *
 * @param {Object} [options]
 * @returns {Object} gap registry
 */
export function createEmpresasCompatibilityGapRegistry(options = {}) {
  void options;
  const mirror = createEmpresasCertifiedBlueprintMirror();
  const mirrorGapCount = mirror.alignmentAudit.gapCount;

  const gaps = GAP_DEFS.map((g) => ({
    gapId: g.id,
    title: g.title,
    area: g.area,
    source: `empresas-certified-blueprint-mirror@1.0.0/${g.source}`,
    currentState: g.currentState,
    expectedStudioState: g.expectedStudioState,
    severity: g.severity,
    risk: `unaligned ${g.area} vs certified Studio contract`,
    status: 'tracked',
    canResolveContractOnly: g.canResolveContractOnly,
    requiresEmpresasCodeChange: g.requiresEmpresasCodeChange,
    requiresUIChange: g.requiresUIChange,
    requiresModeloBase1Change: g.requiresModeloBase1Change,
    requiresBackendChange: g.requiresBackendChange,
    requiresPrismaSchemaChange: g.requiresPrismaSchemaChange,
    requiresMigration: g.requiresMigration,
    requiresPermissionChange: g.requiresPermissionChange,
    requiresRuntimeBindingChange: g.requiresRuntimeBindingChange,
    recommendedFix: g.recommendedFix,
    recommendedSlice: g.recommendedSlice,
    blockedNow: false,
    fixedThisSlice: false,
    notes: 'contract-only tracking; not fixed by changing Empresas',
  }));

  // A critical (high) gap must have a recommended slice and a fix, else it is untracked.
  const untrackedCritical = gaps.filter((g) => g.severity === 'high' && (!g.recommendedSlice || !g.recommendedFix));

  const body = {
    kind: 'empresas-compatibility-gap-registry',
    gaps,
    gapCount: gaps.length,
    mirrorGapCount,
    contractOnlyResolvable: gaps.filter((g) => g.canResolveContractOnly).map((g) => g.gapId),
    requiresEmpresasCodeChange: gaps.filter((g) => g.requiresEmpresasCodeChange).map((g) => g.gapId),
    requiresUIChange: gaps.filter((g) => g.requiresUIChange).map((g) => g.gapId),
    requiresBackendChange: gaps.filter((g) => g.requiresBackendChange).map((g) => g.gapId),
    requiresPrismaSchemaChange: gaps.filter((g) => g.requiresPrismaSchemaChange).map((g) => g.gapId),
    requiresMigration: gaps.filter((g) => g.requiresMigration).map((g) => g.gapId),
    untrackedCriticalGaps: untrackedCritical.length,
    anyGapFixedByChangingEmpresas: false,
    knownGapsTracked: true,
  };
  return safeCloneGenericModel({ ...body, gapRegistryDigest: compatDigest({ gaps: gaps.map((g) => [g.gapId, g.severity, g.recommendedSlice]) }) });
}

export default createEmpresasCompatibilityGapRegistry;
