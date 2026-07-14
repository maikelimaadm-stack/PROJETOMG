import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

export const MODULE_PREVIEW_SANDBOX_FALLBACK_SCENARIOS = [
  'flag_off', 'invalid_planner', 'invalid_engine_output', 'invalid_blueprint_contract',
  'invalid_source_blueprint', 'invalid_source_planner', 'session_failure', 'table_preview_unsafe',
  'form_preview_unsafe', 'detail_preview_unsafe', 'field_preview_unsafe', 'action_preview_unsafe',
  'permission_unsafe', 'tenant_unsafe', 'route_menu_exposed', 'persistence_unsafe',
  'runtime_binding_unsafe', 'digest_mismatch', 'verifier_failure', 'compatibility_blocked',
  'react_component_creation_attempt', 'ui_attempt', 'module_generation_attempt', 'file_write_attempt',
  'route_attempt', 'menu_attempt', 'module_registration_attempt', 'backend_attempt', 'prisma_attempt',
  'migration_attempt', 'production_attempt', 'staging_attempt', 'fetch_attempt', 'mutation_attempt',
  'persistence_creation_attempt', 'rewrite_empresas_attempt',
];

/**
 * Passive, fail-closed fallback for the preview sandbox contract. Never any side effect,
 * React component, UI, file write, module generation, route/menu, backend/Prisma,
 * mutation, persistence, or rewrite of Empresas. `safeToUseAsPreviewSandboxContract` is
 * always false. Rollback = non-consumption.
 *
 * @param {Object} [options]
 * @param {string} [options.scenario]
 * @param {string} [options.reason]
 * @returns {Object} fallback descriptor
 */
export function createModulePreviewSandboxFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const scenario = typeof o.scenario === 'string' && MODULE_PREVIEW_SANDBOX_FALLBACK_SCENARIOS.includes(o.scenario)
    ? o.scenario
    : 'flag_off';

  return safeCloneGenericModel({
    kind: 'module-preview-sandbox-fallback',
    scenario,
    reason: typeof o.reason === 'string' && o.reason ? o.reason : `module preview sandbox fallback: ${scenario}`,
    sideEffects: false,
    safeToUseAsPreviewSandboxContract: false,
    readyForPreviewSandbox: false,
    readyForDevPreviewContract: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    readiness: 'blocked',
    previewMetadataOnly: true,
    reactComponentCreated: false,
    uiCreated: false,
    routeCreated: false,
    menuCreated: false,
    moduleGenerated: false,
    filesWrittenToModule: false,
    moduleRegistered: false,
    backendAccessed: false,
    prismaAccessed: false,
    migrationExecuted: false,
    productionAccessed: false,
    stagingAccessed: false,
    fetchUsed: false,
    mutationAllowed: false,
    persistenceCreated: false,
    rewriteEmpresas: false,
    diagnosticsSanitized: true,
    rollbackPlan: { passive: true, strategy: 'non-consumption' },
  });
}

export default createModulePreviewSandboxFallback;
