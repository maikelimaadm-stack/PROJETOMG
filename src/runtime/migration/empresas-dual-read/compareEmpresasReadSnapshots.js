import {
  isPlainObject,
  validateProjectionInput,
} from '../../shadow/pilots/tableFormProjection.js';
import { makeDifference, summarizeDifferences } from './empresasDualReadDifferenceModel.js';
import { createEmpresasLegacyReadSnapshot } from './createEmpresasLegacyReadSnapshot.js';
import { createEmpresasRuntimeV2ReadSnapshot } from './createEmpresasRuntimeV2ReadSnapshot.js';
import { EmpresasDualReadError } from './errors.js';

/** @param {string} code @param {string} message */
function cmpError(code, message) {
  return new EmpresasDualReadError(/** @type {any} */ (code), message);
}

/** @param {unknown} v */
function asArray(v) {
  return Array.isArray(v) ? v : [];
}

/** Field-type drift the runtime v2 canonicalization is EXPECTED to introduce — non-blocking. */
const KNOWN_TYPE_DRIFT = { tel: 'phone', cpf_cnpj: 'document', text: 'string' };

/**
 * Deterministically compares a legacy read snapshot against a runtime v2 read
 * snapshot and produces an ordered difference list + aggregate summary. It
 * reads nothing external, executes nothing, and exposes no sensitive data (the
 * snapshots are already masked). Known canonicalization drift (e.g. `tel` →
 * `phone`) is classified as low-severity, non-blocking; missing structure is
 * critical + blocking.
 *
 * @param {Object} [options]
 * @param {import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadSnapshot} [options.legacySnapshot]
 * @param {import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadSnapshot} [options.runtimeV2Snapshot]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} [options.descriptor]
 * @returns {Promise<import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadComparison>}
 */
export async function compareEmpresasReadSnapshots(options = {}) {
  validateProjectionInput(options, 0, 'Empresas read comparison options', cmpError);
  if (!isPlainObject(options)) {
    throw cmpError('MAK-L3-EMP-DUALREAD-003', 'compareEmpresasReadSnapshots() options must be a plain object');
  }

  const legacy = options.legacySnapshot ?? await createEmpresasLegacyReadSnapshot({ descriptor: options.descriptor });
  const v2 = options.runtimeV2Snapshot ?? await createEmpresasRuntimeV2ReadSnapshot({ env: options.env, descriptor: options.descriptor });
  if (!isPlainObject(legacy) || !isPlainObject(v2)) {
    throw cmpError('MAK-L3-EMP-DUALREAD-004', 'both legacy and runtime v2 snapshots must be plain objects');
  }

  /** @type {import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadDifference[]} */
  const differences = [];

  // moduleId
  if (legacy.moduleId !== v2.moduleId) {
    differences.push(makeDifference({
      id: 'moduleId', path: 'moduleId', category: 'metadata', severity: 'critical',
      legacyValue: legacy.moduleId, runtimeV2Value: v2.moduleId,
      message: 'moduleId differs between snapshots', recommendedAction: 'ensure both snapshots target the same module',
    }));
  }

  // table existence + form existence
  if (!isPlainObject(legacy.table) || !isPlainObject(v2.table)) {
    differences.push(makeDifference({
      id: 'table.exists', path: 'table', category: 'structure', severity: 'critical',
      legacyValue: Boolean(legacy.table), runtimeV2Value: Boolean(v2.table),
      message: 'table missing in one snapshot', recommendedAction: 'both snapshots must expose a table',
    }));
  }
  if (!isPlainObject(legacy.form) || !isPlainObject(v2.form)) {
    differences.push(makeDifference({
      id: 'form.exists', path: 'form', category: 'structure', severity: 'critical',
      legacyValue: Boolean(legacy.form), runtimeV2Value: Boolean(v2.form),
      message: 'form missing in one snapshot', recommendedAction: 'both snapshots must expose a form',
    }));
  }

  const lTable = isPlainObject(legacy.table) ? legacy.table : {};
  const v2Table = isPlainObject(v2.table) ? v2.table : {};
  const lForm = isPlainObject(legacy.form) ? legacy.form : {};
  const v2Form = isPlainObject(v2.form) ? v2.form : {};

  // table columns (by id set)
  diffIdSet(differences, 'table.columns', 'table', asArray(lTable.columns).map(colId), asArray(v2Table.columns).map(colId), 'medium', 'column present in one snapshot only');
  // visibleColumns
  diffStringSet(differences, 'table.visibleColumns', 'table', asArray(lTable.visibleColumns), asArray(v2Table.visibleColumns), 'medium', 'visible column differs');
  // row count / shape
  if (asArray(lTable.rows).length !== asArray(v2Table.rows).length) {
    differences.push(makeDifference({
      id: 'table.rowCount', path: 'table.rows', category: 'data-shape', severity: 'low',
      legacyValue: asArray(lTable.rows).length, runtimeV2Value: asArray(v2Table.rows).length,
      message: 'row count differs', recommendedAction: 'align controlled dataset rows',
    }));
  } else {
    diffRowShape(differences, asArray(lTable.rows), asArray(v2Table.rows));
  }

  // form fields (by id set) + field-type drift
  const lFields = asArray(lForm.fields);
  const v2Fields = asArray(v2Form.fields);
  diffIdSet(differences, 'form.fields', 'field', lFields.map(fid), v2Fields.map(fid), 'high', 'field present in one snapshot only');
  diffStringSet(differences, 'form.visibleFields', 'form', asArray(lForm.visibleFields), asArray(v2Form.visibleFields), 'medium', 'visible field differs');
  diffFieldTypes(differences, lFields, v2Fields);

  // validations
  diffKeyedRules(differences, 'validations', asArray(legacy.validations), asArray(v2.validations));
  // permissions
  diffPermissions(differences, asArray(legacy.permissions), asArray(v2.permissions));
  // actions (by id set)
  diffIdSet(differences, 'actions', 'action', asArray(legacy.actions).map((a) => a && a.id), asArray(v2.actions).map((a) => a && a.id), 'medium', 'action metadata present in one snapshot only');

  // safety — runtime v2 must expose blocked operations
  if (!asArray(v2.blockedOperations).length) {
    differences.push(makeDifference({
      id: 'safety.blockedOperations', path: 'blockedOperations', category: 'safety', severity: 'critical',
      legacyValue: null, runtimeV2Value: 0,
      message: 'runtime v2 snapshot exposes no blocked operations — write guard missing', recommendedAction: 'restore write guard before advancing',
    }));
  }

  const { ordered, summary } = summarizeDifferences(differences);
  return {
    moduleId: 'empresas',
    legacyRuntime: legacy.sourceRuntime ?? 'legacy',
    runtimeV2: v2.sourceRuntime ?? 'runtime-v2',
    differences: ordered,
    summary,
  };
}

/** @param {any} c */
function colId(c) { return c && c.id; }
/** @param {any} f */
function fid(f) { return f && f.id; }

/** @param {any[]} out */
function diffIdSet(out, path, category, legacyIds, v2Ids, severity, message) {
  const l = new Set(legacyIds.filter(Boolean).map(String));
  const v = new Set(v2Ids.filter(Boolean).map(String));
  for (const id of [...l].sort()) {
    if (!v.has(id)) out.push(makeDifference({ id: `${path}:${id}:legacy-only`, path: `${path}[${id}]`, category, severity, legacyValue: id, runtimeV2Value: null, message: `${message} (legacy only)` }));
  }
  for (const id of [...v].sort()) {
    if (!l.has(id)) out.push(makeDifference({ id: `${path}:${id}:v2-only`, path: `${path}[${id}]`, category, severity, legacyValue: null, runtimeV2Value: id, message: `${message} (runtime v2 only)` }));
  }
}

/** @param {any[]} out */
function diffStringSet(out, path, category, legacyArr, v2Arr, severity, message) {
  const l = new Set(legacyArr.map(String));
  const v = new Set(v2Arr.map(String));
  for (const id of [...l].sort()) if (!v.has(id)) out.push(makeDifference({ id: `${path}:${id}:legacy-only`, path: `${path}[${id}]`, category, severity, legacyValue: id, runtimeV2Value: null, message: `${message} (legacy only)` }));
  for (const id of [...v].sort()) if (!l.has(id)) out.push(makeDifference({ id: `${path}:${id}:v2-only`, path: `${path}[${id}]`, category, severity, legacyValue: null, runtimeV2Value: id, message: `${message} (runtime v2 only)` }));
}

/** @param {any[]} out */
function diffFieldTypes(out, legacyFields, v2Fields) {
  const v2ById = new Map(v2Fields.filter(Boolean).map((f) => [String(f.id), f]));
  for (const lf of legacyFields.filter(Boolean).sort((a, b) => String(a.id).localeCompare(String(b.id)))) {
    const vf = v2ById.get(String(lf.id));
    if (!vf) continue;
    if (lf.type !== vf.type) {
      const known = KNOWN_TYPE_DRIFT[lf.type] === vf.type;
      out.push(makeDifference({
        id: `field.type:${lf.id}`, path: `form.fields[${lf.id}].type`, category: 'field',
        severity: known ? 'low' : 'high',
        legacyValue: lf.type, runtimeV2Value: vf.type,
        message: known ? `known canonicalization drift (${lf.type} → ${vf.type})` : `unexpected field type drift (${lf.type} → ${vf.type})`,
        recommendedAction: known ? 'accepted drift — document in mapping' : 'investigate unexpected type drift',
        blocking: !known,
      }));
    }
  }
}

/** @param {any[]} out */
function diffKeyedRules(out, path, legacyArr, v2Arr) {
  const v2ById = new Map(v2Arr.filter(Boolean).map((r) => [String(r.id), r]));
  for (const lr of legacyArr.filter(Boolean).sort((a, b) => String(a.id).localeCompare(String(b.id)))) {
    const vr = v2ById.get(String(lr.id));
    if (!vr) continue;
    const lRules = asArray(lr.rules).map(String).sort().join(',');
    const vRules = asArray(vr.rules).map(String).sort().join(',');
    if (lRules !== vRules) {
      out.push(makeDifference({
        id: `validation:${lr.id}`, path: `${path}[${lr.id}].rules`, category: 'validation', severity: 'medium',
        legacyValue: lRules, runtimeV2Value: vRules,
        message: `validation rules differ for "${lr.id}"`, recommendedAction: 'reconcile validation metadata',
      }));
    }
  }
}

/** @param {any[]} out */
function diffPermissions(out, legacyArr, v2Arr) {
  const v2ById = new Map(v2Arr.filter(Boolean).map((p) => [String(p.id), p]));
  for (const lp of legacyArr.filter(Boolean).sort((a, b) => String(a.id).localeCompare(String(b.id)))) {
    const vp = v2ById.get(String(lp.id));
    if (!vp) continue;
    if ((lp.permission ?? null) !== (vp.permission ?? null) || Boolean(lp.denied) !== Boolean(vp.denied)) {
      out.push(makeDifference({
        id: `permission:${lp.id}`, path: `permissions[${lp.id}]`, category: 'permission', severity: 'high',
        legacyValue: { permission: lp.permission ?? null, denied: Boolean(lp.denied) },
        runtimeV2Value: { permission: vp.permission ?? null, denied: Boolean(vp.denied) },
        message: `permission metadata differs for "${lp.id}"`, recommendedAction: 'reconcile permission metadata before UI exposure',
      }));
    }
  }
}

/** @param {any[]} out */
function diffRowShape(out, legacyRows, v2Rows) {
  for (let i = 0; i < legacyRows.length; i++) {
    const l = legacyRows[i] ?? {};
    const v = v2Rows[i] ?? {};
    const lKeys = Object.keys(l.cells ?? {}).sort().join(',');
    const vKeys = Object.keys(v.cells ?? {}).sort().join(',');
    if (lKeys !== vKeys) {
      out.push(makeDifference({
        id: `row.shape:${i}`, path: `table.rows[${i}].cells`, category: 'data-shape', severity: 'low',
        legacyValue: lKeys, runtimeV2Value: vKeys,
        message: `row cell shape differs at index ${i}`, recommendedAction: 'align row projection',
      }));
    }
  }
}
