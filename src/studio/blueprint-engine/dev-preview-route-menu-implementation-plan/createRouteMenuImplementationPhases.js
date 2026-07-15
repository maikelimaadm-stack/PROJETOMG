import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ROUTE_MENU_IMPLEMENTATION_PHASE_IDS, routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

const PHASE_GOAL = {
  phase_0_preflight: 'validate the upstream route/menu contract chain before any planning step',
  phase_1_contract_validation: 'validate the route/menu contract shape and safety invariants',
  phase_2_app_wiring_boundary: 'establish the App wiring boundary (no App.jsx touch)',
  phase_3_router_wiring_boundary: 'establish the router wiring boundary (no router primitives)',
  phase_4_route_registration_plan: 'plan future route registration as metadata only',
  phase_5_menu_registration_plan: 'plan future menu registration as metadata only',
  phase_6_sidebar_navigation_placement: 'plan future sidebar/navigation placement as metadata only',
  phase_7_dev_only_access_policy: 'define the dev-only access policy for a future wiring',
  phase_8_route_guard_and_visibility: 'plan route guard and menu visibility, default-deny',
  phase_9_runtime_ui_mount_boundary: 'plan the runtime UI mount boundary, no real mount',
  phase_10_test_harness: 'plan a headless test harness for a future route/menu wiring',
  phase_11_manual_enablement_gate: 'require a manual enterprise checkpoint before real wiring',
  phase_12_rollout_blocked: 'rollout stays blocked; rollback by non-consumption',
};

/**
 * Builds the planned implementation phases. Every phase is `planned` and `implemented:false`. Pure
 * and deterministic.
 * @returns {Object}
 */
export function createRouteMenuImplementationPhases() {
  const phases = ROUTE_MENU_IMPLEMENTATION_PHASE_IDS.map((id) => ({
    id,
    goal: PHASE_GOAL[id] ?? 'planned phase',
    allowedEffects: ['produce_deterministic_plan_metadata', 'emit_safe_diagnostics'],
    blockedEffects: [
      'createRoute', 'createMenu', 'wireApp', 'wireRouter', 'wireNavigation', 'wireSidebar',
      'mountRuntimeUi', 'createDeepLink', 'generateModule', 'accessBackend', 'accessPrisma',
      'mutate', 'persist', 'readRealData', 'writeRealData', 'accessProduction', 'accessStaging',
      'relinkPrototype',
    ],
    entryCriteria: ['upstream_route_menu_contract_valid', 'headless_boundary_intact'],
    exitCriteria: ['plan_metadata_deterministic', 'no_forbidden_side_effect'],
    rollbackPlan: 'discard plan metadata by non-consumption (nothing is auto-consumed)',
    status: 'planned',
    implemented: false,
  }));

  const core = {
    kind: 'route-menu-implementation-phases',
    phases,
    phaseCount: phases.length,
    allPlanned: phases.every((p) => p.status === 'planned'),
    anyImplemented: phases.some((p) => p.implemented === true),
  };
  return safeCloneGenericModel({ ...core, phasesDigest: routeMenuPlanDigest(core) });
}

export default createRouteMenuImplementationPhases;
