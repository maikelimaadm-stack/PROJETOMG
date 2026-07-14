import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { IMPLEMENTATION_PHASE_IDS, planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Declares the IMPLEMENTATION PHASES plan. Pure, metadata-only. Each phase carries goal /
 * allowedEffects / blockedEffects / entryCriteria / exitCriteria / rollbackPlan, `status:
 * planned`, `implemented: false`. It executes NOTHING.
 *
 * @param {Object} [options]
 * @returns {Object} implementation phases plan
 */
const PHASE_META = {
  phase_0_preflight: {
    goal: 'confirm all upstream contracts present and headless',
    allowedEffects: ['read_contract_metadata'],
    blockedEffects: ['mount', 'render', 'route', 'backend'],
    entryCriteria: ['runtime_shell_contract_present'],
    exitCriteria: ['contracts_confirmed'],
    rollbackPlan: 'abort_by_non_consumption',
  },
  phase_1_contract_validation: {
    goal: 'verify runtime shell + visual contracts are valid and safe',
    allowedEffects: ['verify_contract_metadata'],
    blockedEffects: ['mount', 'render', 'mutation'],
    entryCriteria: ['contracts_confirmed'],
    exitCriteria: ['contracts_valid'],
    rollbackPlan: 'stop_at_validation',
  },
  phase_2_isolation_boundary: {
    goal: 'establish the isolation boundary (no window/document/DOM/React)',
    allowedEffects: ['declare_boundary_metadata'],
    blockedEffects: ['dom', 'react', 'css_runtime'],
    entryCriteria: ['contracts_valid'],
    exitCriteria: ['boundary_declared'],
    rollbackPlan: 'discard_boundary_metadata',
  },
  phase_3_dev_only_adapter: {
    goal: 'plan a dev-only adapter surface (no real adapter)',
    allowedEffects: ['plan_adapter_metadata'],
    blockedEffects: ['react_adapter', 'dom_adapter', 'backend_adapter'],
    entryCriteria: ['boundary_declared'],
    exitCriteria: ['adapter_planned'],
    rollbackPlan: 'discard_adapter_plan',
  },
  phase_4_render_pipeline_stub: {
    goal: 'plan the render pipeline stub (real render blocked)',
    allowedEffects: ['plan_pipeline_metadata'],
    blockedEffects: ['real_render', 'dom', 'css_runtime'],
    entryCriteria: ['adapter_planned'],
    exitCriteria: ['pipeline_planned'],
    rollbackPlan: 'discard_pipeline_plan',
  },
  phase_5_event_boundary_stub: {
    goal: 'plan the event boundary stub (no real listener/handler)',
    allowedEffects: ['plan_event_metadata'],
    blockedEffects: ['real_handler', 'real_listener', 'mutation'],
    entryCriteria: ['pipeline_planned'],
    exitCriteria: ['events_planned'],
    rollbackPlan: 'discard_event_plan',
  },
  phase_6_test_harness: {
    goal: 'plan the headless test harness (no real harness)',
    allowedEffects: ['plan_test_fixtures_metadata'],
    blockedEffects: ['runtime_execution'],
    entryCriteria: ['events_planned'],
    exitCriteria: ['harness_planned'],
    rollbackPlan: 'discard_harness_plan',
  },
  phase_7_manual_enablement_gate: {
    goal: 'require an explicit, manual enablement gate before any implementation',
    allowedEffects: ['require_manual_gate_metadata'],
    blockedEffects: ['auto_enable', 'production', 'staging'],
    entryCriteria: ['harness_planned'],
    exitCriteria: ['manual_gate_required'],
    rollbackPlan: 'remain_blocked',
  },
  phase_8_rollout_blocked: {
    goal: 'rollout remains blocked until a separately-approved slice',
    allowedEffects: ['declare_rollout_blocked_metadata'],
    blockedEffects: ['rollout', 'production', 'staging'],
    entryCriteria: ['manual_gate_required'],
    exitCriteria: ['rollout_blocked'],
    rollbackPlan: 'rollback_by_non_consumption',
  },
};

export function createIsolatedRuntimeImplementationPhases(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const phases = IMPLEMENTATION_PHASE_IDS.map((id, index) => ({
    phaseId: id,
    order: index,
    ...PHASE_META[id],
    status: 'planned',
    implemented: false,
    metadataOnly: true,
  }));

  const core = {
    kind: 'isolated-runtime-implementation-phases',
    moduleId: String(o.runtimeShellContract?.moduleId ?? 'plannedModule'),
    phases,
    phaseIds: [...IMPLEMENTATION_PHASE_IDS],
    phaseCount: phases.length,
    anyImplemented: phases.some((p) => p.implemented === true),
    allPlanned: phases.every((p) => p.status === 'planned'),
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, phasesDigest: planDigest(core) });
}

export default createIsolatedRuntimeImplementationPhases;
