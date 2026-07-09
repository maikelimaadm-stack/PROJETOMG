/**
 * Pure, passive table/form projection helpers for the Empresas shadow.
 *
 * These functions produce an INTERMEDIATE structural representation of a
 * module's table and form — columns, fields, validation/permission
 * metadata, and actions/workflows as metadata ONLY. They never render real
 * UI (no DOM/React), never execute an action/workflow/connector, never
 * touch data, and never call the backend.
 */

const MAX_INPUT_DEPTH = 8;
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const SENSITIVE_KEY_PATTERN = /password|token|secret|api[-_]?key|authorization|cookie|credential/i;

/** @param {unknown} value */
export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

/**
 * @param {unknown} value
 * @param {number} depth
 * @param {string} label
 * @param {(code: string, message: string) => Error} makeError
 */
export function validateProjectionInput(value, depth, label, makeError) {
  if (depth > MAX_INPUT_DEPTH) {
    throw makeError('MAK-L3-SHADOW-PILOT-001', `${label} exceeds maximum depth (${MAX_INPUT_DEPTH})`);
  }
  if (Array.isArray(value)) {
    for (const item of value) validateProjectionInput(item, depth + 1, label, makeError);
    return;
  }
  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      if (BLOCKED_KEYS.has(key)) {
        throw makeError('MAK-L3-SHADOW-PILOT-001', `${label} contains a forbidden key: "${key}"`);
      }
      validateProjectionInput(/** @type {Record<string, unknown>} */ (value)[key], depth + 1, label, makeError);
    }
  }
}

/** @param {unknown} value @param {number} [depth] */
export function redactSensitive(value, depth = 0) {
  if (depth > MAX_INPUT_DEPTH) return '[TRUNCATED]';
  if (Array.isArray(value)) return value.map((v) => redactSensitive(v, depth + 1));
  if (isPlainObject(value)) {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = SENSITIVE_KEY_PATTERN.test(key) ? '[REDACTED]' : redactSensitive(v, depth + 1);
    }
    return out;
  }
  return value;
}

/** @param {unknown} value */
export function safeClone(value) {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

/** @param {any[]} arr @param {string} key */
function sortBy(arr, key) {
  return [...arr].sort((a, b) => String(a[key]).localeCompare(String(b[key])));
}

/**
 * Projects the table representation — columns + visible columns + actions as
 * metadata only. Deterministic (columns sorted by id).
 * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} descriptor
 * @returns {import('../../types/shadow-table-form.js').TableProjection}
 */
export function projectTable(descriptor) {
  const rawColumns = Array.isArray(descriptor?.table?.columns) ? descriptor.table.columns : [];
  const columns = sortBy(
    rawColumns.map((c) => ({
      id: String(c.id),
      label: typeof c.label === 'string' ? c.label : String(c.id),
      sortable: Boolean(c.sortable),
      filterable: Boolean(c.filterable),
      visible: c.visible !== false,
    })),
    'id',
  );
  const actions = Array.isArray(descriptor?.table?.actions)
    ? sortBy(descriptor.table.actions.map((a) => ({ id: String(a.id), kind: a.kind === 'workflow' ? 'workflow' : 'action', ref: String(a.ref) })), 'id')
    : [];
  return {
    columns,
    visibleColumns: columns.filter((c) => c.visible).map((c) => c.id),
    actions, // metadata only — never dispatched here
  };
}

/**
 * Projects the form representation — fields with label/required/validation/
 * permission metadata, plus actions/workflows as metadata only. When a
 * permission engine is injected, fields declaring a permission are marked
 * permitted/denied via M09 (never re-implemented). Deterministic (fields
 * sorted by id).
 * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} descriptor
 * @param {Object} [options]
 * @param {Record<string, string>} [options.typeMap]
 * @param {{ can?: Function }} [options.permissionEngine]
 * @param {{ describeFieldRules?: Function }} [options.validationEngine]
 * @param {unknown} [options.context]
 * @returns {Promise<import('../../types/shadow-table-form.js').FormProjection>}
 */
export async function projectForm(descriptor, options = {}) {
  const { typeMap = {}, permissionEngine, validationEngine, context } = options;
  const rawFields = Array.isArray(descriptor?.fields) ? descriptor.fields : [];

  const baseFields = rawFields.map((f) => {
    const descriptorRules = Array.isArray(f?.validation?.rules) ? f.validation.rules.map(String) : [];
    const engineRules = validationEngine && typeof validationEngine.describeFieldRules === 'function'
      ? (validationEngine.describeFieldRules(String(f.id)) ?? [])
      : [];
    const rules = [...new Set([...descriptorRules, ...engineRules.map(String)])].sort();
    return {
      id: String(f.id),
      label: typeof f.label === 'string' ? f.label : String(f.id),
      type: typeMap[f.type] ?? f.type,
      required: Boolean(f.required),
      permission: typeof f.permission === 'string' ? f.permission : undefined,
      validation: { rules, source: engineRules.length ? 'engine+descriptor' : 'descriptor' },
    };
  });

  const withPermissions = [];
  for (const field of baseFields) {
    if (permissionEngine && typeof permissionEngine.can === 'function' && field.permission) {
      // May throw — deliberately not swallowed so the caller can capture it (fail-safe at run() level).
      const allowed = await permissionEngine.can('read', field.permission, context);
      withPermissions.push({ ...field, permitted: Boolean(allowed), denied: !allowed });
    } else {
      withPermissions.push({ ...field, permitted: true, denied: false });
    }
  }

  const fields = sortBy(withPermissions, 'id');
  const actions = Array.isArray(descriptor?.form?.actions)
    ? sortBy(descriptor.form.actions.map((a) => ({ id: String(a.id), kind: a.kind === 'workflow' ? 'workflow' : 'action', ref: String(a.ref) })), 'id')
    : [];
  const workflows = Array.isArray(descriptor?.form?.workflows)
    ? sortBy(descriptor.form.workflows.map((w) => ({ id: String(w.id), ref: String(w.ref) })), 'id')
    : [];

  return {
    fields,
    visibleFields: fields.filter((f) => !f.denied).map((f) => f.id),
    permissionsApplied: Boolean(permissionEngine && typeof permissionEngine.can === 'function'),
    actions, // metadata only
    workflows, // metadata only — never started here
  };
}

/**
 * Builds an INTERMEDIATE render tree from a projected table + form. Plain
 * objects only — no DOM node, no React element, nothing renderable.
 * @param {import('../../types/shadow-table-form.js').TableProjection} table
 * @param {import('../../types/shadow-table-form.js').FormProjection} form
 * @returns {import('../../types/shadow-table-form.js').ShadowRenderNode}
 */
export function buildRenderTree(table, form) {
  return {
    type: 'view',
    component: 'TableFormView',
    intermediate: true,
    children: [
      { type: 'table', component: 'TableView', columns: table.visibleColumns },
      { type: 'form', component: 'FormView', fields: form.visibleFields },
    ],
  };
}

/**
 * Full table/form projection for a descriptor.
 * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} descriptor
 * @param {Object} [options]
 * @param {'legacy'|'v2'} [options.runtime]
 * @param {Record<string, string>} [options.typeMap]
 * @param {{ can?: Function }} [options.permissionEngine]
 * @param {{ describeFieldRules?: Function }} [options.validationEngine]
 * @param {{ registerAdapter?: Function }} [options.renderEngine]
 * @param {unknown} [options.context]
 * @returns {Promise<import('../../types/shadow-table-form.js').TableFormProjectionResult>}
 */
export async function createTableFormProjection(descriptor, options = {}) {
  const table = projectTable(descriptor);
  const form = await projectForm(descriptor, options);
  const renderTree = buildRenderTree(table, form);
  return {
    moduleId: String(descriptor?.moduleId ?? 'empresas'),
    entityName: String(descriptor?.entityName ?? ''),
    runtime: options.runtime ?? 'v2',
    renderEngineWired: Boolean(options.renderEngine),
    table,
    form,
    renderTree,
    meta: /** @type {Record<string, unknown>} */ (redactSensitive(safeClone(descriptor?.meta ?? {}))),
  };
}
