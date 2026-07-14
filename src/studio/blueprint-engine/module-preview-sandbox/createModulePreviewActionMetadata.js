import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { sandboxDigest } from './modulePreviewSandboxConfig.js';

/**
 * Builds ACTION preview metadata. Pure. `read` may be metadata-only; create/update/delete
 * are disabled/blocked; export/configure are planned/disabled; no action executes a
 * mutation or calls a backend. delete never starts enabled.
 *
 * @param {Object} [options]
 * @param {Object} [options.plan] a module reference plan
 * @returns {Object} action preview metadata
 */
export function createModulePreviewActionMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};

  const action = (actionId, label, scope, mutation, allowedInPreview, enabledByDefault, futureSlice) => ({
    actionId,
    label,
    scope,
    allowedInPreview: allowedInPreview === true,
    enabledByDefault: enabledByDefault === true,
    requiresPermission: true,
    requiresTenant: true,
    mutation: mutation === true,
    sideEffect: mutation === true,
    blockedReason: mutation === true ? 'mutation disabled in preview sandbox' : (allowedInPreview ? '' : 'planned/disabled in preview'),
    futureSlice: futureSlice ?? null,
    diagnostics: { passive: true },
  });

  const actions = [
    action('read', 'Ler', 'module', false, true, true),
    action('create', 'Criar', 'module', true, false, false, 'STUDIO MODULE GENERATION (controlled)'),
    action('update', 'Atualizar', 'module', true, false, false, 'STUDIO MODULE GENERATION (controlled)'),
    action('delete', 'Excluir', 'module', true, false, false, 'STUDIO MODULE GENERATION (controlled)'),
    action('export', 'Exportar', 'module', false, false, false, 'STUDIO MODULE PREVIEW EXPORT (future)'),
    action('configure', 'Configurar', 'module', false, false, false, 'STUDIO MODULE CONFIG (future)'),
    action('diagnostics', 'Diagnóstico', 'module', false, true, false),
  ];

  const core = {
    kind: 'module-preview-action-metadata',
    moduleId: String(plan.moduleId ?? 'plannedModule'),
    actions,
    readMetadataOnly: actions.find((a) => a.actionId === 'read').mutation === false,
    deleteEnabledByDefault: actions.find((a) => a.actionId === 'delete').enabledByDefault,
    anyMutationEnabled: actions.some((a) => a.mutation === true && a.enabledByDefault === true),
    anyActionCallsBackend: false,
    previewOnly: true,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, actionPreviewDigest: sandboxDigest(core) });
}

export default createModulePreviewActionMetadata;
