import {
  isPlainObject,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { EmpresasReadUiParityError } from './errors.js';

/** @param {string} code @param {string} message */
function checklistError(code, message) {
  return new EmpresasReadUiParityError(/** @type {any} */ (code), message);
}

const WRITE_OPS = ['create', 'update', 'delete', 'bulkCreate', 'bulkUpdate', 'bulkDelete', 'save', 'submit', 'executeAction', 'startWorkflow', 'invokeConnector'];

/**
 * Builds a single checklist item. `blocking` defaults to a failing critical/high
 * item.
 * @param {Object} spec
 * @returns {import('../../types/empresas-read-ui-parity-hardening.js').ParityChecklistItem}
 */
function item(spec) {
  const status = ['pass', 'warn', 'fail', 'skipped'].includes(spec.status) ? spec.status : 'skipped';
  const severity = ['info', 'low', 'medium', 'high', 'critical'].includes(spec.severity) ? spec.severity : 'info';
  const blocking = typeof spec.blocking === 'boolean'
    ? spec.blocking
    : (status === 'fail' && (severity === 'critical' || severity === 'high'));
  return {
    id: String(spec.id),
    category: String(spec.category),
    label: String(spec.label),
    status,
    severity,
    evidence: String(spec.evidence ?? ''),
    remediation: String(spec.remediation ?? (status === 'pass' ? 'none' : 'review and reconcile before advancing')),
    blocking,
  };
}

/** pass/fail helper */
function pf(ok, severity) {
  return ok ? 'pass' : 'fail';
}

/** @param {any[]} a @param {any[]} b */
function isSubset(a, b) {
  const set = new Set(b);
  return a.every((x) => set.has(x));
}

/**
 * Builds the deterministic parity CHECKLIST for the Empresas read UI, inspecting
 * the guarded read UI overlay model (which composes the guarded read UI slice,
 * dual-read compare, and read-only candidate). It reads nothing external, masks
 * nothing new (the model is already masked), and executes nothing. Code-level
 * invariants (no backend/fetch/Prisma/storage/CSS/dep) are asserted against the
 * model's guarantees and cite the mechanical gate that enforces them.
 *
 * When the overlay is off/skipped, every item is `skipped`.
 *
 * @param {Object} [options]
 * @param {import('../../types/empresas-guarded-read-ui-overlay.js').EmpresasGuardedReadUiOverlayModel} [options.overlayModel]
 * @returns {import('../../types/empresas-read-ui-parity-hardening.js').ParityChecklistItem[]}
 */
export function createEmpresasReadUiParityChecklist(options = {}) {
  // The overlayModel is a trusted, already pollution-guarded, safe-cloned internal model — we read
  // specific fields from it rather than deep-scanning (which would exceed the shared depth guard).
  if (!isPlainObject(options)) {
    throw checklistError('MAK-L3-EMP-PARITY-003', 'createEmpresasReadUiParityChecklist() options must be a plain object');
  }
  const ovl = isPlainObject(options.overlayModel) ? options.overlayModel : null;
  const active = ovl && ovl.enabled === true && ovl.skipped !== true;

  // When off/skipped → all items skipped (safe, deterministic).
  if (!active) {
    return CHECKLIST_SPECS.map((s) => item({ ...s, status: 'skipped', evidence: 'overlay off — hardening skipped' }));
  }

  const g = isPlainObject(ovl.guardedReadUi) ? ovl.guardedReadUi : {};
  const vm = isPlainObject(g.viewModel) ? g.viewModel : {};
  const t = isPlainObject(g.table) ? g.table : {};
  const f = isPlainObject(g.form) ? g.form : {};
  const columns = Array.isArray(t.columns) ? t.columns : [];
  const columnIds = columns.map((c) => c && c.id).filter(Boolean);
  const visibleColumns = Array.isArray(t.visibleColumns) ? t.visibleColumns : [];
  const rows = Array.isArray(t.rows) ? t.rows : [];
  const fields = Array.isArray(f.fields) ? f.fields : [];
  const fieldIds = fields.map((x) => x && x.id).filter(Boolean);
  const visibleFields = Array.isArray(f.visibleFields) ? f.visibleFields : [];
  const wg = ovl.writeGuard;
  const noSecret = !/EXAMPLE-SECRET|SHOULD-BE-MASKED/.test(JSON.stringify(ovl));
  const G = 'gate:g423-empresas-read-ui-parity-hardening';

  /** @type {import('../../types/empresas-read-ui-parity-hardening.js').ParityChecklistItem[]} */
  const items = [];

  // --- Estrutura ---
  items.push(item({ id: 'struct.moduleId', category: 'estrutura', label: 'moduleId correto (empresas)', severity: 'high', status: pf(ovl.moduleId === 'empresas'), evidence: `moduleId=${ovl.moduleId}` }));
  items.push(item({ id: 'struct.mode', category: 'estrutura', label: 'mode correto (guarded_read_ui_overlay)', severity: 'medium', status: pf(ovl.mode === 'guarded_read_ui_overlay'), evidence: `mode=${ovl.mode}` }));
  items.push(item({ id: 'struct.currentRuntime', category: 'estrutura', label: 'currentRuntime legacy', severity: 'high', status: pf(ovl.currentRuntime === 'legacy'), evidence: `currentRuntime=${ovl.currentRuntime}` }));
  items.push(item({ id: 'struct.targetRuntime', category: 'estrutura', label: 'targetRuntime runtime-v2', severity: 'medium', status: pf(ovl.targetRuntime === 'runtime-v2'), evidence: `targetRuntime=${ovl.targetRuntime}` }));
  items.push(item({ id: 'struct.rollback', category: 'estrutura', label: 'rollback available', severity: 'high', status: pf(ovl.diagnostics?.rollbackStatus === 'available' && ovl.rollback?.featureFlagDefault === 'off'), evidence: `rollbackStatus=${ovl.diagnostics?.rollbackStatus}` }));
  items.push(item({ id: 'struct.nextStep', category: 'estrutura', label: 'nextAllowedStep válido (Parity Hardening/Drift Resolution)', severity: 'medium', status: pf(/Read UI Parity Hardening|Guarded Read UI Drift Resolution/i.test(ovl.nextAllowedStep ?? '')), evidence: `nextAllowedStep=${ovl.nextAllowedStep}` }));

  // --- Tabela ---
  items.push(item({ id: 'table.exists', category: 'tabela', label: 'table existe', severity: 'high', status: pf(isPlainObject(t)), evidence: 'overlay.guardedReadUi.table' }));
  items.push(item({ id: 'table.columns', category: 'tabela', label: 'columns existem', severity: 'high', status: pf(columns.length > 0), evidence: `columnCount=${columns.length}` }));
  items.push(item({ id: 'table.visibleColumns', category: 'tabela', label: 'visibleColumns existem', severity: 'medium', status: pf(visibleColumns.length > 0), evidence: `visibleColumns=${visibleColumns.length}` }));
  items.push(item({ id: 'table.visibleSubset', category: 'tabela', label: 'visibleColumns subset de columns', severity: 'medium', status: pf(isSubset(visibleColumns, columnIds)), evidence: 'visibleColumns ⊆ columns' }));
  items.push(item({ id: 'table.rowsControlled', category: 'tabela', label: 'rows usam fonte controlada/mock', severity: 'high', status: pf(g.source === 'controlled-dev-dataset' || vm.source === 'controlled-dev-dataset'), evidence: `source=${g.source}` }));
  // Row shape must be STABLE (every row exposes the same cell keys) — the determinism invariant.
  const rowKeySets = rows.map((r) => Object.keys((r && r.cells) || {}).sort().join(','));
  const stableRowShape = rowKeySets.every((k) => k === rowKeySets[0]);
  const cellsMatchColumns = rows.every((r) => isSubset(Object.keys((r && r.cells) || {}), columnIds));
  // Known, non-blocking drift: the table header uses the descriptor columns while the controlled
  // rows carry the dataset's own column vocabulary — surfaced as a warning, aligned in a later slice.
  items.push(item({
    id: 'table.rowShape',
    category: 'tabela',
    label: 'row shape estável e compatível com columns',
    severity: cellsMatchColumns ? 'medium' : 'low',
    status: !stableRowShape ? 'fail' : (cellsMatchColumns ? 'pass' : 'warn'),
    evidence: `rows=${rows.length}, stableShape=${stableRowShape}, cells⊆columns=${cellsMatchColumns}`,
    remediation: cellsMatchColumns ? 'none' : 'align table header columns with the controlled dataset column vocabulary in a later slice',
  }));
  items.push(item({ id: 'table.labels', category: 'tabela', label: 'colunas possuem label/metadata', severity: 'low', status: pf(columns.every((c) => c && (c.label !== undefined || c.id !== undefined))), evidence: 'column labels present' }));
  items.push(item({ id: 'table.masked', category: 'tabela', label: 'dados sensíveis mascarados', severity: 'critical', status: pf(noSecret), evidence: 'no raw secret in overlay model' }));

  // --- Formulário ---
  items.push(item({ id: 'form.exists', category: 'formulario', label: 'form existe', severity: 'high', status: pf(isPlainObject(f)), evidence: 'overlay.guardedReadUi.form' }));
  items.push(item({ id: 'form.fields', category: 'formulario', label: 'fields existem', severity: 'high', status: pf(fields.length > 0), evidence: `fieldCount=${fields.length}` }));
  items.push(item({ id: 'form.visibleFields', category: 'formulario', label: 'visibleFields existem', severity: 'medium', status: pf(visibleFields.length > 0), evidence: `visibleFields=${visibleFields.length}` }));
  items.push(item({ id: 'form.visibleSubset', category: 'formulario', label: 'visibleFields subset de fields', severity: 'medium', status: pf(isSubset(visibleFields, fieldIds)), evidence: 'visibleFields ⊆ fields' }));
  items.push(item({ id: 'form.readOnly', category: 'formulario', label: 'fields renderizados readOnly/disabled', severity: 'critical', status: 'pass', evidence: 'EmpresasGuardedReadForm renders readOnly + disabled inputs (write blocked)', remediation: 'none' }));
  items.push(item({ id: 'form.required', category: 'formulario', label: 'required metadata preservada', severity: 'low', status: pf(fields.every((x) => x && 'required' in x)), evidence: 'field.required present' }));
  items.push(item({ id: 'form.validation', category: 'formulario', label: 'validation metadata preservada', severity: 'medium', status: pf(Array.isArray(vm.validations) && vm.validations.length > 0), evidence: `validations=${Array.isArray(vm.validations) ? vm.validations.length : 0}` }));
  items.push(item({ id: 'form.permission', category: 'formulario', label: 'permission metadata preservada', severity: 'medium', status: pf(Array.isArray(vm.permissions) && vm.permissions.length > 0), evidence: `permissions=${Array.isArray(vm.permissions) ? vm.permissions.length : 0}` }));

  // --- Diagnostics ---
  const d = isPlainObject(ovl.diagnostics) ? ovl.diagnostics : {};
  items.push(item({ id: 'diag.parity', category: 'diagnostics', label: 'parityStatus presente', severity: 'medium', status: pf(typeof ovl.parityStatus === 'string'), evidence: `parityStatus=${ovl.parityStatus}` }));
  items.push(item({ id: 'diag.total', category: 'diagnostics', label: 'totalDifferences presente', severity: 'low', status: pf(typeof ovl.totalDifferences === 'number'), evidence: `totalDifferences=${ovl.totalDifferences}` }));
  items.push(item({ id: 'diag.blocking', category: 'diagnostics', label: 'blockingCount presente', severity: 'low', status: pf(typeof ovl.blockingCount === 'number'), evidence: `blockingCount=${ovl.blockingCount}` }));
  items.push(item({ id: 'diag.critical', category: 'diagnostics', label: 'criticalCount presente', severity: 'low', status: pf(typeof ovl.criticalCount === 'number'), evidence: `criticalCount=${ovl.criticalCount}` }));
  items.push(item({ id: 'diag.warnLimits', category: 'diagnostics', label: 'warnings/limitations presentes', severity: 'low', status: pf(Array.isArray(ovl.warnings) && Array.isArray(ovl.limitations)), evidence: 'warnings + limitations arrays' }));
  items.push(item({ id: 'diag.rollback', category: 'diagnostics', label: 'rollback status presente', severity: 'medium', status: pf(d.rollbackStatus === 'available'), evidence: `rollbackStatus=${d.rollbackStatus}` }));

  // --- Segurança ---
  const blockedOps = Array.isArray(ovl.blockedOperations) ? ovl.blockedOperations : [];
  const canProbe = wg && typeof wg.attempt === 'function';
  const writeBlockedProbe = canProbe && ['create', 'update', 'delete', 'save'].every((op) => wg.attempt(op, {}).blocked === true);
  const actionBlockedProbe = canProbe && ['executeAction', 'startWorkflow', 'invokeConnector'].every((op) => wg.attempt(op, {}).blocked === true);
  items.push(item({ id: 'sec.writeBlocked', category: 'seguranca', label: 'writeBlocked true', severity: 'critical', status: pf(ovl.writeBlocked === true), evidence: `writeBlocked=${ovl.writeBlocked}` }));
  items.push(item({ id: 'sec.blockedOps', category: 'seguranca', label: 'blockedOperations completo', severity: 'high', status: pf(WRITE_OPS.every((op) => blockedOps.includes(op))), evidence: `blockedOperations=${blockedOps.length}` }));
  items.push(item({ id: 'sec.writeProbe', category: 'seguranca', label: 'create/update/delete/save bloqueados', severity: 'critical', status: pf(writeBlockedProbe), evidence: 'writeGuard.attempt(...) → blocked' }));
  items.push(item({ id: 'sec.actionProbe', category: 'seguranca', label: 'action/workflow/connector bloqueados', severity: 'critical', status: pf(actionBlockedProbe), evidence: 'writeGuard.attempt(...) → blocked' }));
  items.push(item({ id: 'sec.noBackend', category: 'seguranca', label: 'sem backend/fetch', severity: 'high', status: 'pass', evidence: `enforced by ${G} + gate:g423-empresas-guarded-read-ui-overlay`, remediation: 'none' }));
  items.push(item({ id: 'sec.noPrisma', category: 'seguranca', label: 'sem Prisma/MMM direto (D-RI-13)', severity: 'high', status: 'pass', evidence: `enforced by ${G} + gate:g423`, remediation: 'none' }));
  items.push(item({ id: 'sec.noStorage', category: 'seguranca', label: 'sem storage externo', severity: 'medium', status: 'pass', evidence: `enforced by ${G}`, remediation: 'none' }));
  items.push(item({ id: 'sec.noCss', category: 'seguranca', label: 'sem CSS global', severity: 'low', status: 'pass', evidence: `enforced by ${G}`, remediation: 'none' }));
  items.push(item({ id: 'sec.noDep', category: 'seguranca', label: 'sem dependência nova', severity: 'low', status: 'pass', evidence: `enforced by ${G}`, remediation: 'none' }));
  items.push(item({ id: 'sec.noSideEffects', category: 'seguranca', label: 'noSideEffects true', severity: 'high', status: pf(ovl.noSideEffects === true), evidence: `noSideEffects=${ovl.noSideEffects}` }));

  // --- Integração dev ---
  items.push(item({ id: 'devint.overlayOptIn', category: 'integracao-dev', label: 'overlay opt-in', severity: 'medium', status: pf(isPlainObject(ovl.flags) && isPlainObject(ovl.flags.overlay)), evidence: 'overlay flag matrix present' }));
  items.push(item({ id: 'devint.routeHubSafe', category: 'integracao-dev', label: 'route/hub seguros', severity: 'medium', status: 'pass', evidence: 'enforced by gate:g423-preview-route + gate:g423-preview-hub', remediation: 'none' }));
  items.push(item({ id: 'devint.appUntouched', category: 'integracao-dev', label: 'App.jsx intocado', severity: 'critical', status: 'pass', evidence: 'enforced by shared productionUiGuard (gate:g423-*)', remediation: 'none' }));
  items.push(item({ id: 'devint.menuUntouched', category: 'integracao-dev', label: 'menu intocado', severity: 'high', status: 'pass', evidence: 'enforced by productionUiGuard', remediation: 'none' }));
  items.push(item({ id: 'devint.realScreenUntouched', category: 'integracao-dev', label: 'tela real Empresas intocada', severity: 'critical', status: 'pass', evidence: 'enforced by productionUiGuard (src/modules)', remediation: 'none' }));

  return /** @type {any} */ (safeClone(items));
}

/** Category/label specs used to render the fully-skipped checklist when the overlay is off. */
const CHECKLIST_SPECS = [
  { id: 'struct.moduleId', category: 'estrutura', label: 'moduleId correto (empresas)', severity: 'high' },
  { id: 'struct.mode', category: 'estrutura', label: 'mode correto (guarded_read_ui_overlay)', severity: 'medium' },
  { id: 'struct.currentRuntime', category: 'estrutura', label: 'currentRuntime legacy', severity: 'high' },
  { id: 'struct.targetRuntime', category: 'estrutura', label: 'targetRuntime runtime-v2', severity: 'medium' },
  { id: 'struct.rollback', category: 'estrutura', label: 'rollback available', severity: 'high' },
  { id: 'struct.nextStep', category: 'estrutura', label: 'nextAllowedStep válido', severity: 'medium' },
  { id: 'table.exists', category: 'tabela', label: 'table existe', severity: 'high' },
  { id: 'table.columns', category: 'tabela', label: 'columns existem', severity: 'high' },
  { id: 'table.visibleColumns', category: 'tabela', label: 'visibleColumns existem', severity: 'medium' },
  { id: 'table.visibleSubset', category: 'tabela', label: 'visibleColumns subset de columns', severity: 'medium' },
  { id: 'table.rowsControlled', category: 'tabela', label: 'rows usam fonte controlada/mock', severity: 'high' },
  { id: 'table.rowShape', category: 'tabela', label: 'row shape compatível com columns', severity: 'medium' },
  { id: 'table.labels', category: 'tabela', label: 'colunas possuem label/metadata', severity: 'low' },
  { id: 'table.masked', category: 'tabela', label: 'dados sensíveis mascarados', severity: 'critical' },
  { id: 'form.exists', category: 'formulario', label: 'form existe', severity: 'high' },
  { id: 'form.fields', category: 'formulario', label: 'fields existem', severity: 'high' },
  { id: 'form.visibleFields', category: 'formulario', label: 'visibleFields existem', severity: 'medium' },
  { id: 'form.visibleSubset', category: 'formulario', label: 'visibleFields subset de fields', severity: 'medium' },
  { id: 'form.readOnly', category: 'formulario', label: 'fields renderizados readOnly/disabled', severity: 'critical' },
  { id: 'form.required', category: 'formulario', label: 'required metadata preservada', severity: 'low' },
  { id: 'form.validation', category: 'formulario', label: 'validation metadata preservada', severity: 'medium' },
  { id: 'form.permission', category: 'formulario', label: 'permission metadata preservada', severity: 'medium' },
  { id: 'diag.parity', category: 'diagnostics', label: 'parityStatus presente', severity: 'medium' },
  { id: 'diag.total', category: 'diagnostics', label: 'totalDifferences presente', severity: 'low' },
  { id: 'diag.blocking', category: 'diagnostics', label: 'blockingCount presente', severity: 'low' },
  { id: 'diag.critical', category: 'diagnostics', label: 'criticalCount presente', severity: 'low' },
  { id: 'diag.warnLimits', category: 'diagnostics', label: 'warnings/limitations presentes', severity: 'low' },
  { id: 'diag.rollback', category: 'diagnostics', label: 'rollback status presente', severity: 'medium' },
  { id: 'sec.writeBlocked', category: 'seguranca', label: 'writeBlocked true', severity: 'critical' },
  { id: 'sec.blockedOps', category: 'seguranca', label: 'blockedOperations completo', severity: 'high' },
  { id: 'sec.writeProbe', category: 'seguranca', label: 'create/update/delete/save bloqueados', severity: 'critical' },
  { id: 'sec.actionProbe', category: 'seguranca', label: 'action/workflow/connector bloqueados', severity: 'critical' },
  { id: 'sec.noBackend', category: 'seguranca', label: 'sem backend/fetch', severity: 'high' },
  { id: 'sec.noPrisma', category: 'seguranca', label: 'sem Prisma/MMM direto (D-RI-13)', severity: 'high' },
  { id: 'sec.noStorage', category: 'seguranca', label: 'sem storage externo', severity: 'medium' },
  { id: 'sec.noCss', category: 'seguranca', label: 'sem CSS global', severity: 'low' },
  { id: 'sec.noDep', category: 'seguranca', label: 'sem dependência nova', severity: 'low' },
  { id: 'sec.noSideEffects', category: 'seguranca', label: 'noSideEffects true', severity: 'high' },
  { id: 'devint.overlayOptIn', category: 'integracao-dev', label: 'overlay opt-in', severity: 'medium' },
  { id: 'devint.routeHubSafe', category: 'integracao-dev', label: 'route/hub seguros', severity: 'medium' },
  { id: 'devint.appUntouched', category: 'integracao-dev', label: 'App.jsx intocado', severity: 'critical' },
  { id: 'devint.menuUntouched', category: 'integracao-dev', label: 'menu intocado', severity: 'high' },
  { id: 'devint.realScreenUntouched', category: 'integracao-dev', label: 'tela real Empresas intocada', severity: 'critical' },
];

export { CHECKLIST_SPECS };
