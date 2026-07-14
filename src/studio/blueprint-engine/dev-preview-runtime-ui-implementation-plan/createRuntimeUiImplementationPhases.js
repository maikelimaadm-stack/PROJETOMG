import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_UI_IMPLEMENTATION_PHASE_IDS, uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

const PHASE_DEF = {
  phase_0_preflight: { goal: 'validate upstream contract chain before any planning step' },
  phase_1_contract_validation: { goal: 'validate the runtime UI contract shape and safety invariants' },
  phase_2_ui_runtime_boundary: { goal: 'establish the headless UI runtime boundary (no react/dom/css)' },
  phase_3_dev_only_ui_policy: { goal: 'define the dev-only execution policy for a future UI runtime' },
  phase_4_virtual_frame_pipeline: { goal: 'plan the virtual-frame-to-UI pipeline, real render blocked' },
  phase_5_renderer_adapter_plan: { goal: 'plan a renderer adapter as metadata only, no real renderer' },
  phase_6_component_adapter_plan: { goal: 'plan a component adapter as metadata only, no real component' },
  phase_7_interaction_adapter_plan: { goal: 'plan an interaction adapter, all handlers blocked' },
  phase_8_state_theme_accessibility_projection: { goal: 'plan state/theme/accessibility projection adapters, metadata only' },
  phase_9_test_harness: { goal: 'plan a headless test harness for a future UI runtime' },
  phase_10_manual_enablement_gate: { goal: 'require a manual enterprise checkpoint before real implementation' },
  phase_11_rollout_blocked: { goal: 'rollout stays blocked; rollback by non-consumption' },
};

/**
 * Builds the planned implementation phases. Every phase is `planned` and `implemented:false`.
 * Pure and deterministic.
 *
 * @returns {Object}
 */
export function createRuntimeUiImplementationPhases() {
  const phases = RUNTIME_UI_IMPLEMENTATION_PHASE_IDS.map((id) => ({
    id,
    goal: PHASE_DEF[id] ? PHASE_DEF[id].goal : 'planned phase',
    allowedEffects: ['produce_deterministic_plan_metadata', 'emit_safe_diagnostics'],
    blockedEffects: [
      'createReact', 'createJsx', 'createTsx', 'createDom', 'createCssRuntime',
      'createRoute', 'createPlacement', 'generateModule', 'accessBackend', 'accessPrisma',
      'mutate', 'persist', 'readRealData', 'writeRealData', 'accessProduction', 'accessStaging',
    ],
    entryCriteria: ['upstream_runtime_ui_contract_valid', 'headless_boundary_intact'],
    exitCriteria: ['plan_metadata_deterministic', 'no_forbidden_side_effect'],
    rollbackPlan: 'discard plan metadata by non-consumption (nothing is auto-consumed)',
    status: 'planned',
    implemented: false,
  }));

  const core = {
    kind: 'runtime-ui-implementation-phases',
    phases,
    phaseCount: phases.length,
    allPlanned: phases.every((p) => p.status === 'planned'),
    anyImplemented: phases.some((p) => p.implemented === true),
  };
  return safeCloneGenericModel({ ...core, phasesDigest: uiPlanDigest(core) });
}

export default createRuntimeUiImplementationPhases;
