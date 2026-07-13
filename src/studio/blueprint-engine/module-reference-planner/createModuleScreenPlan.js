import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { plannerDigest } from './moduleReferencePlannerConfig.js';

/**
 * Plans the SCREENS a module WOULD need. Pure. Generates no React component, alters no
 * `src/pages`/`src/components`/`src/App.jsx`, creates no route. Preview is future
 * sandbox/dev-only.
 *
 * @param {Object} [options]
 * @param {Object} [options.blueprint] normalized blueprint
 * @returns {Object} screen plan
 */
export function createModuleScreenPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.blueprint) ? o.blueprint : {};

  const screen = (id, kind, purpose, future) => ({
    screenId: id,
    kind,
    purpose,
    generationAllowedNow: false,
    generatesReactComponent: false,
    futureSlice: future ?? 'STUDIO MODULE PREVIEW SANDBOX',
    requiredStates: ['empty', 'loading', 'error'],
  });

  const screens = [
    screen('table', 'table', 'list of records (columns from non-protected fields)'),
    screen('form', 'form', 'create/edit form (fields in blueprint order)'),
    screen('detail', 'detail', 'read-only detail derived from form'),
  ];

  const areas = {
    filterArea: { planned: true, generationAllowedNow: false },
    toolbar: { planned: true, generationAllowedNow: false },
    actions: { planned: true, mutationActionsEnabledNow: false },
    diagnosticsArea: { planned: true, passive: true },
    futureDashboardPlaceholder: { planned: true, kind: 'dashboardPlaceholder', generationAllowedNow: false },
  };

  const core = {
    kind: 'module-screen-plan',
    moduleId: String(b.moduleId ?? 'plannedModule').trim(),
    screens,
    screenCount: screens.length,
    areas,
    requiredStates: ['empty', 'loading', 'error'],
    generatesReactComponent: false,
    changesPages: false,
    changesComponents: false,
    changesAppJsx: false,
    createsRoute: false,
    previewFutureOnly: true,
  };

  return safeCloneGenericModel({ ...core, screenPlanDigest: plannerDigest(core) });
}

export default createModuleScreenPlan;
