import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { sandboxDigest } from './modulePreviewSandboxConfig.js';

/**
 * Builds TABLE preview metadata from a module reference plan's field/table/form plan.
 * Pure. No data is fetched, no React table is generated, no component/route is created.
 * Protected/tenant columns are marked protected; mutation actions are disabled/blocked.
 *
 * @param {Object} [options]
 * @param {Object} [options.plan] a module reference plan
 * @returns {Object} table preview metadata
 */
export function createModulePreviewTableMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const ftf = isGenericModelPlainObject(plan.fieldTableFormPlan) ? plan.fieldTableFormPlan : {};
  const fields = Array.isArray(ftf.fields) ? ftf.fields.filter(isGenericModelPlainObject) : [];

  const columns = fields.map((f) => ({
    name: f.name,
    label: f.label ?? f.name,
    type: f.type,
    visible: f.protectedField !== true,
    protectedColumn: f.protectedField === true,
    tenantColumn: f.tenantScoped === true,
    searchable: f.searchable === true,
    filterable: f.filterable === true,
    sortable: f.sortable === true,
  }));

  const rowActions = [
    { actionId: 'view', label: 'Ver', mutation: false, enabled: false, previewOnly: true },
    { actionId: 'edit', label: 'Editar', mutation: true, enabled: false, blockedReason: 'mutation disabled in preview' },
    { actionId: 'delete', label: 'Excluir', mutation: true, enabled: false, blockedReason: 'delete disabled in preview' },
  ];
  const toolbarActions = [
    { actionId: 'create', label: 'Novo', mutation: true, enabled: false, blockedReason: 'mutation disabled in preview' },
    { actionId: 'export', label: 'Exportar', mutation: false, enabled: false, plannedFuture: true },
  ];

  const core = {
    kind: 'module-preview-table-metadata',
    tableId: `${String(plan.moduleId ?? 'plannedModule')}#table-preview`,
    sourcePlan: 'module-reference-plan.fieldTableFormPlan',
    columns,
    columnOrder: columns.map((c) => c.name),
    visibleColumns: columns.filter((c) => c.visible).map((c) => c.name),
    hiddenColumns: columns.filter((c) => !c.visible).map((c) => c.name),
    searchableColumns: columns.filter((c) => c.searchable).map((c) => c.name),
    filterableColumns: columns.filter((c) => c.filterable).map((c) => c.name),
    sortableColumns: columns.filter((c) => c.sortable).map((c) => c.name),
    protectedColumns: columns.filter((c) => c.protectedColumn).map((c) => c.name),
    tenantColumns: columns.filter((c) => c.tenantColumn).map((c) => c.name),
    rowIdentity: 'id',
    rowActions,
    toolbarActions,
    emptyState: { message: 'Nenhum registro', kind: 'empty' },
    loadingState: { kind: 'loading' },
    errorState: { kind: 'error' },
    previewRows: [], // syntheticMetadataOnly — no real data
    syntheticMetadataOnly: true,
    previewOnly: true,
    componentCreated: false,
    routeCreated: false,
    dataFetched: false,
    mutationAllowed: false,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, tablePreviewDigest: sandboxDigest(core) });
}

export default createModulePreviewTableMetadata;
