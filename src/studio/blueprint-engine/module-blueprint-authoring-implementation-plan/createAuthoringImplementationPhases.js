import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { AUTHORING_IMPLEMENTATION_PHASE_IDS, authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/** Per-phase declared goals/effects (metadata only). */
const PHASE_META = Object.freeze({
  phase_0_preflight: { goal: 'Validate environment + upstream foundation contract presence.' },
  phase_1_foundation_contract_validation: { goal: 'Validate the certified authoring foundation contract read-only.' },
  phase_2_scope_registry_preparation: { goal: 'Prepare governance registry entries for the future runtime slice.' },
  phase_3_draft_runtime_model: { goal: 'Model the in-memory, ephemeral, non-canonical draft runtime.' },
  phase_4_lifecycle_runtime: { goal: 'Plan lifecycle-state execution (never a forbidden/production state).' },
  phase_5_operation_executor: { goal: 'Plan the allow-listed operation executor (fail-closed on unknown).' },
  phase_6_revision_engine: { goal: 'Plan monotonic in-memory revisions (no persistence).' },
  phase_7_validation_pipeline: { goal: 'Plan the deterministic, fail-closed validation pipeline.' },
  phase_8_invariant_enforcement: { goal: 'Plan fail-closed enforcement of every structural invariant.' },
  phase_9_synthetic_preview_handoff: { goal: 'Plan the synthetic preview-sandbox handoff (no real data/mount).' },
  phase_10_certification_candidate_preparation: { goal: 'Plan certification-candidate preparation (no certification).' },
  phase_11_ssot_protection: { goal: 'Plan SSOT protection (certified blueprint stays canonical).' },
  phase_12_permission_tenancy_boundary: { goal: 'Plan the permission/tenancy boundary (not integrated).' },
  phase_13_test_harness: { goal: 'Plan the deterministic test harness for the runtime.' },
  phase_14_manual_enablement_gate: { goal: 'Plan the manual enterprise-checkpoint enablement gate.' },
  phase_15_rollout_blocked: { goal: 'Rollout remains blocked until the enterprise checkpoint passes.' },
});

/**
 * Implementation phases PLAN — every phase is PLANNED, none IMPLEMENTED/COMPLETED. Each phase declares
 * goal, entry/exit criteria, allowed/blocked effects and a rollback plan. Pure and deterministic.
 * @returns {Object}
 */
export function createAuthoringImplementationPhases() {
  const phases = AUTHORING_IMPLEMENTATION_PHASE_IDS.map((id, index) => ({
    phaseId: id,
    id,
    order: index,
    goal: (PHASE_META[id] && PHASE_META[id].goal) || `Planned phase ${id}.`,
    entryCriteria: index === 0 ? ['foundation_contract_present'] : [`${AUTHORING_IMPLEMENTATION_PHASE_IDS[index - 1]}_planned`],
    allowedEffects: ['emit_plan_metadata'],
    blockedEffects: ['implement_runtime', 'persist', 'generate_module', 'expose_product', 'touch_app'],
    exitCriteria: ['plan_metadata_emitted'],
    rollbackPlan: 'discard_plan_by_non_consumption',
    status: 'planned',
    planned: true,
    implemented: false,
    completed: false,
  }));

  const core = {
    kind: 'authoring-implementation-phases',
    phaseCount: phases.length,
    allPlanned: phases.every((p) => p.planned === true && p.status === 'planned'),
    anyImplemented: phases.some((p) => p.implemented === true || p.completed === true),
    phaseIds: [...AUTHORING_IMPLEMENTATION_PHASE_IDS],
    phases,
  };
  return safeCloneGenericModel({ ...core, phasesDigest: authoringPlanDigest(core) });
}

export default createAuthoringImplementationPhases;
