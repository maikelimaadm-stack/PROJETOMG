import {
  isPlainObject,
  redactSensitive,
  safeClone,
} from '../../../shadow/pilots/tableFormProjection.js';
import { ControlledDevDatasetError } from './errors.js';
import { MAX_RECORDS_PER_MODULE, MAX_PAYLOAD_DEPTH } from './controlledDatasetConfig.js';

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const DENIED_PLACEHOLDER = '[DENIED]';

/** @param {string} code @param {string} message */
export function datasetError(code, message) {
  return new ControlledDevDatasetError(/** @type {any} */ (code), message);
}

/**
 * @param {unknown} value
 * @param {number} depth
 * @param {string} label
 */
export function validateDatasetShape(value, depth, label) {
  if (depth > MAX_PAYLOAD_DEPTH) {
    throw datasetError('MAK-L3-DEV-DATASET-001', `${label} exceeds maximum depth (${MAX_PAYLOAD_DEPTH})`);
  }
  if (Array.isArray(value)) {
    for (const item of value) validateDatasetShape(item, depth + 1, label);
    return;
  }
  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      if (BLOCKED_KEYS.has(key)) {
        throw datasetError('MAK-L3-DEV-DATASET-001', `${label} contains a forbidden key: "${key}"`);
      }
      validateDatasetShape(/** @type {Record<string, unknown>} */ (value)[key], depth + 1, label);
    }
  }
}

/** @param {unknown} v */
function isEmptyValue(v) {
  return v === undefined || v === null || v === '';
}

/**
 * Builds a single module's controlled dataset from a plain spec. Pure and
 * deterministic: masks sensitive values, marks valid/invalid records, marks
 * denied fields, computes structured diagnostics, and enforces record/depth
 * limits. Never real data, never behavior.
 *
 * @param {import('../../../types/controlled-dev-dataset.js').ControlledModuleSpec} spec
 * @returns {import('../../../types/controlled-dev-dataset.js').ControlledModuleDataset}
 */
export function createControlledModuleDataset(spec) {
  if (!isPlainObject(spec) || typeof spec.moduleId !== 'string') {
    throw datasetError('MAK-L3-DEV-DATASET-002', 'createControlledModuleDataset() requires a spec with a moduleId');
  }
  validateDatasetShape(spec, 0, `Dataset spec for "${spec.moduleId}"`);

  const columns = Array.isArray(spec.columns) ? spec.columns.map(String) : [];
  const requiredFields = Array.isArray(spec.requiredFields) ? spec.requiredFields.map(String) : [];
  const rawRecords = Array.isArray(spec.records) ? spec.records : [];
  if (rawRecords.length > MAX_RECORDS_PER_MODULE) {
    throw datasetError('MAK-L3-DEV-DATASET-002', `module "${spec.moduleId}" exceeds maximum records (${rawRecords.length} > ${MAX_RECORDS_PER_MODULE})`);
  }

  const records = rawRecords.map((r) => {
    const values = isPlainObject(r.values) ? r.values : {};
    const deniedFields = Array.isArray(r.deniedFields) ? r.deniedFields.map(String) : [];
    const missingRequired = requiredFields.filter((f) => isEmptyValue(/** @type {any} */ (values)[f]));
    const valid = missingRequired.length === 0;
    // Mask sensitive values, then blank denied fields for the visible projection.
    const maskedValues = /** @type {Record<string, unknown>} */ (redactSensitive(safeClone(values)));
    const visibleValues = { ...maskedValues };
    for (const d of deniedFields) if (d in visibleValues) visibleValues[d] = DENIED_PLACEHOLDER;
    return {
      id: String(r.id),
      valid,
      deniedFields: [...deniedFields].sort(),
      missingRequired: [...missingRequired].sort(),
      values: visibleValues,
    };
  });

  const tableRows = records.map((rec) => ({
    id: rec.id,
    valid: rec.valid,
    cells: Object.fromEntries(columns.map((c) => [c, rec.deniedFields.includes(c) ? DENIED_PLACEHOLDER : (rec.values[c] ?? '')])),
  }));

  const formValues = Object.fromEntries(records.map((rec) => [rec.id, { ...rec.values }]));
  const validationStates = Object.fromEntries(records.map((rec) => [rec.id, { valid: rec.valid, missingRequired: rec.missingRequired }]));
  const permissionStates = Object.fromEntries(records.map((rec) => [rec.id, { deniedFields: rec.deniedFields }]));

  const validCount = records.filter((r) => r.valid).length;
  const deniedFieldCount = records.reduce((n, r) => n + r.deniedFields.length, 0);
  /** @type {string[]} */
  const warnings = [];
  for (const r of records) {
    if (r.missingRequired.length > 0) warnings.push(`record "${r.id}" missing required: ${r.missingRequired.join(', ')}`);
    if (r.deniedFields.length > 0) warnings.push(`record "${r.id}" has denied field(s): ${r.deniedFields.join(', ')}`);
  }

  return {
    moduleId: spec.moduleId,
    source: 'controlled-dev-dataset',
    columns,
    requiredFields,
    records,
    tableRows,
    formValues,
    validationStates,
    permissionStates,
    diagnostics: {
      warnings,
      recordCount: records.length,
      validCount,
      invalidCount: records.length - validCount,
      deniedFieldCount,
    },
    metadata: /** @type {Record<string, unknown>} */ (redactSensitive(safeClone(spec.metadata ?? { source: 'controlled-dev-dataset', mocked: true }))),
  };
}
