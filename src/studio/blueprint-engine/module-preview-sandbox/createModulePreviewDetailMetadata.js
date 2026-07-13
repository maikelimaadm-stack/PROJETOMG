import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { sandboxDigest } from './modulePreviewSandboxConfig.js';

const ALLOWED_STRATEGIES = new Set(['derive_from_form_readonly', 'dedicated_detail_future', 'blocked']);

/**
 * Builds DETAIL preview metadata. Pure. Read-only. Creates no real screen, does not alter
 * PAGEMP or ModeloBase1CadastroPage, fetches no record. Strategy defaults to
 * `derive_from_form_readonly` (mirrors the certified Empresas approach).
 *
 * @param {Object} [options]
 * @param {Object} [options.plan] a module reference plan
 * @returns {Object} detail preview metadata
 */
export function createModulePreviewDetailMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const ftf = isGenericModelPlainObject(plan.fieldTableFormPlan) ? plan.fieldTableFormPlan : {};
  const fields = Array.isArray(ftf.fields) ? ftf.fields.filter(isGenericModelPlainObject) : [];

  const requested = typeof o.strategy === 'string' && ALLOWED_STRATEGIES.has(o.strategy) ? o.strategy : 'derive_from_form_readonly';

  const core = {
    kind: 'module-preview-detail-metadata',
    detailId: `${String(plan.moduleId ?? 'plannedModule')}#detail-preview`,
    sourcePlan: 'module-reference-plan.fieldTableFormPlan',
    strategy: requested,
    fields: fields.map((f) => ({ name: f.name, label: f.label ?? f.name, type: f.type, readOnly: true })),
    sections: [{ section: 'general', label: 'Geral', fields: fields.map((f) => f.name) }],
    readOnly: true,
    derivedFromFormReadOnly: requested === 'derive_from_form_readonly',
    dedicatedDetailPlanned: requested === 'dedicated_detail_future',
    emptyState: { kind: 'empty' },
    loadingState: { kind: 'loading' },
    errorState: { kind: 'error' },
    notFoundState: { kind: 'notFound' },
    permissionDeniedState: { kind: 'permissionDenied' },
    tenantMismatchState: { kind: 'tenantMismatch' },
    changesPagemp: false,
    changesModeloBase1CadastroPage: false,
    previewOnly: true,
    componentCreated: false,
    routeCreated: false,
    dataFetched: false,
    mutationAllowed: false,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, detailPreviewDigest: sandboxDigest(core) });
}

export default createModulePreviewDetailMetadata;
