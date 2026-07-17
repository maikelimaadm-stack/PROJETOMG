import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { BRIDGE_IMPLEMENTATION_PHASE_IDS, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';

/** Per-phase declared goals (metadata only). */
const PHASE_META = Object.freeze({
  phase_0_preflight: { goal: 'Validate environment + upstream bridge-contract presence.' },
  phase_1_bridge_contract_validation: { goal: 'Validate the certified bridge contract read-only.' },
  phase_2_scope_registry_preparation: { goal: 'Prepare governance registry entries for the future bridge slice.' },
  phase_3_source_handoff_shape_validation: { goal: 'Plan strict shape validation of the synthetic_preview_candidate handoff.' },
  phase_4_strict_draft_identity_enforcement: { goal: 'Plan strict explicit draft-identity enforcement (no single-draft fallback).' },
  phase_5_source_version_validation: { goal: 'Plan exact source runtime version validation (unknown fails closed).' },
  phase_6_source_digest_consistency_validation: { goal: 'Plan deterministic FNV-1a source digest consistency validation.' },
  phase_7_source_synthetic_ssot_boundary_validation: { goal: 'Plan synthetic + SSOT boundary validation of the source.' },
  phase_8_field_mapping_execution: { goal: 'Plan deterministic execution of the 11 field mappings (lossless critical).' },
  phase_9_target_descriptor_construction: { goal: 'Plan synthetic target descriptor construction (no real payload/mount).' },
  phase_10_target_sandbox_version_validation: { goal: 'Plan exact target sandbox version validation.' },
  phase_11_canonicalization_extensibility_enforcement: { goal: 'Plan canonicalization + fail-closed extensibility enforcement.' },
  phase_12_validation_pipeline_and_failure_containment: { goal: 'Plan the 13-stage fail-closed pipeline + failure containment.' },
  phase_13_replay_idempotency_and_resource_limits: { goal: 'Plan replay/idempotency + bounded resource limits.' },
  phase_14_test_harness_and_manual_gate: { goal: 'Plan the deterministic test harness + manual enablement gate.' },
  phase_15_rollout_blocked: { goal: 'Rollout remains blocked until the enterprise checkpoint passes.' },
});

/**
 * Bridge implementation phases PLAN — every phase is PLANNED, none IMPLEMENTED/COMPLETED. Each phase
 * declares goal, entry/exit criteria, allowed/blocked effects and a rollback plan. Pure and deterministic.
 * @returns {Object}
 */
export function createBridgeImplementationPhases() {
  const phases = BRIDGE_IMPLEMENTATION_PHASE_IDS.map((id, index) => ({
    phaseId: id,
    id,
    order: index,
    goal: (PHASE_META[id] && PHASE_META[id].goal) || `Planned phase ${id}.`,
    entryCriteria: index === 0 ? ['bridge_contract_present'] : [`${BRIDGE_IMPLEMENTATION_PHASE_IDS[index - 1]}_planned`],
    allowedEffects: ['emit_plan_metadata'],
    blockedEffects: ['implement_bridge', 'create_target_payload', 'mount_preview', 'persist', 'generate_module', 'certify', 'expose_product', 'touch_app'],
    exitCriteria: ['plan_metadata_emitted'],
    rollbackPlan: 'discard_plan_by_non_consumption',
    status: 'planned',
    planned: true,
    implemented: false,
    completed: false,
  }));

  const core = {
    kind: 'bridge-implementation-phases',
    phaseCount: phases.length,
    allPlanned: phases.every((p) => p.planned === true && p.status === 'planned'),
    anyImplemented: phases.some((p) => p.implemented === true || p.completed === true),
    phaseIds: [...BRIDGE_IMPLEMENTATION_PHASE_IDS],
    phases,
  };
  return safeCloneGenericModel({ ...core, phasesDigest: bridgePlanDigest(core) });
}

export default createBridgeImplementationPhases;
