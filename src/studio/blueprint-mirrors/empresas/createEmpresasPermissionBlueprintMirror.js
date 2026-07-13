import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createStudioCanonicalPermissionContract } from '../../foundation-contracts/certification/createStudioCanonicalPermissionContract.js';
import { mirrorDigest } from './empresasBlueprintMirrorConfig.js';

/**
 * Classification of each Studio permission action against the observed Empresas state.
 * `read` is certified (existing). Mutations are reference-only (existing production
 * behavior, not certified in the read contract). No permission is created or altered.
 */
const ACTION_STATE = {
  read: { state: 'existing', note: 'certified by empresas-local-read-contract@1.0.0' },
  create: { state: 'reference_only', note: 'exists in production UI; not in read contract → needs_alignment' },
  update: { state: 'reference_only', note: 'exists in production UI; not in read contract → needs_alignment' },
  delete: { state: 'reference_only', note: 'exists in production UI; dangerous_if_default_open' },
  export: { state: 'inferred', note: 'PDF export config present; permission not certified' },
  configure: { state: 'needs_alignment', note: 'no certified configure permission' },
  approve: { state: 'missing', note: 'not applicable to Empresas cadastro' },
  diagnostics: { state: 'inferred', note: 'local harness diagnostics only' },
  admin: { state: 'needs_alignment', note: 'admin must not bypass tenant' },
};

/**
 * Mirrors the expected Empresas permissions against the certified Studio permission
 * contract. Pure, headless, reference-only. Fail-closed / default-deny; no permission
 * created or altered; gaps recorded.
 *
 * @param {Object} [options]
 * @returns {Object} permission blueprint mirror
 */
export function createEmpresasPermissionBlueprintMirror(options = {}) {
  void options;
  const studioPerm = createStudioCanonicalPermissionContract();

  const permissions = studioPerm.actions.map((action) => {
    const s = ACTION_STATE[action] || { state: 'unknown', note: 'no observation' };
    return {
      action,
      classification: s.state,
      dangerousIfDefaultOpen: action === 'delete' || action === 'update' || action === 'create',
      note: s.note,
      alignmentStatus: s.state === 'existing' ? 'aligned' : (s.state === 'missing' ? 'not_aligned' : 'needs_alignment'),
    };
  });

  const gaps = permissions.filter((p) => p.alignmentStatus !== 'aligned').map((p) => ({ action: p.action, classification: p.classification, note: p.note }));

  const body = {
    kind: 'empresas-permission-blueprint-mirror',
    permissions,
    levels: [...studioPerm.levels],
    defaultDeny: true,
    failClosed: true,
    adminBypassesTenant: false,
    permissionsCreated: false,
    permissionsAltered: false,
    gaps,
    alignmentStatus: gaps.length > 0 ? 'partially_aligned' : 'aligned',
  };
  return safeCloneGenericModel({ ...body, permissionDigest: mirrorDigest({ permissions: permissions.map((p) => [p.action, p.classification]) }) });
}

export default createEmpresasPermissionBlueprintMirror;
