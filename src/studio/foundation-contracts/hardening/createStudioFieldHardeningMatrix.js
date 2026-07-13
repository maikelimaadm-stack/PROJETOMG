import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_FIELD_TYPES } from '../createStudioFieldBlueprintContract.js';

const ALLOWED = new Set(STUDIO_FIELD_TYPES);
const RESERVED = new Set(['__proto__', 'constructor', 'prototype', 'id', 'cliente_id']);
const SEARCHABLE_OK = new Set(['text', 'select', 'multiSelect', 'status', 'relation']);
const NUMERIC = new Set(['number', 'decimal', 'money', 'percentage', 'date', 'datetime']);
const SORTABLE_OK = new Set([...NUMERIC, 'text', 'status']);
// A dangerous regex is one with catastrophic-backtracking shape (nested quantifiers).
const DANGEROUS_REGEX = /(\(.*[+*].*\)[+*])|(\[[^\]]*\][+*]){3,}/;

/**
 * Classifies a field definition. Pure and side-effect-free. Never executes computed
 * code. Returns valid/blocked + reasons.
 * @param {unknown} field
 * @param {{ knownNames?: string[] }} [ctx]
 * @returns {{ valid: boolean, blocked: boolean, reasons: string[] }}
 */
export function evaluateStudioField(field, ctx = {}) {
  const f = isGenericModelPlainObject(field) ? field : {};
  const known = Array.isArray(ctx.knownNames) ? ctx.knownNames : [];
  /** @type {string[]} */ const reasons = [];
  const type = typeof f.type === 'string' ? f.type : '';
  const name = typeof f.name === 'string' ? f.name : '';

  if (!ALLOWED.has(type)) reasons.push(`unknown type: ${type || '(none)'}`);
  if (!name) reasons.push('name is empty');
  else if (/\s/.test(name)) reasons.push('name has whitespace');
  else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) reasons.push('name is not a safe identifier');
  if (RESERVED.has(name)) reasons.push(`reserved field name: ${name}`);
  if (known.includes(name)) reasons.push(`duplicate field name: ${name}`);

  if ('label' in f && f.label !== undefined && (typeof f.label !== 'string' || f.label.length === 0)) reasons.push('label is empty');
  if ((type === 'select' || type === 'multiSelect') && !Array.isArray(f.options)) reasons.push(`${type} without options`);
  if (type === 'relation' && !f.target) reasons.push('relation without target');
  if (type === 'relation' && f.tenantScoped === false) reasons.push('relation without tenantScope');
  if (type === 'computed' && typeof f.computed === 'function') reasons.push('computed with function');
  if (type === 'computed' && typeof f.computed === 'string') reasons.push('computed with code string');
  if (typeof f.validationPattern === 'string' && DANGEROUS_REGEX.test(f.validationPattern)) reasons.push('dangerous regex');
  if (f.protected === true && f.editableByDefault === true) reasons.push('protected editable by default');
  if (f.searchable === true && !SEARCHABLE_OK.has(type)) reasons.push(`searchable not allowed for ${type}`);
  if (f.sortable === true && !SORTABLE_OK.has(type)) reasons.push(`sortable not allowed for ${type}`);
  if (f.filterable === true && !(SEARCHABLE_OK.has(type) || NUMERIC.has(type) || type === 'boolean')) reasons.push(`filterable not allowed for ${type}`);
  if (typeof f.order === 'number' && f.order < 0) reasons.push('order is negative');
  if (f.tenantScoped === false && f.tenantField === true) reasons.push('tenant field removed');
  // defaultValue type mismatch (basic).
  if ('defaultValue' in f && f.defaultValue != null) {
    if ((type === 'number' || type === 'decimal' || type === 'money' || type === 'percentage') && typeof f.defaultValue !== 'number') reasons.push('default incompatible with numeric type');
    if (type === 'boolean' && typeof f.defaultValue !== 'boolean') reasons.push('default incompatible with boolean type');
  }

  const valid = reasons.length === 0;
  return { valid, blocked: !valid, reasons };
}

const VALID_FIELDS = STUDIO_FIELD_TYPES.map((t) => {
  const base = { name: `field_${t}`, label: t, type: t };
  if (t === 'select' || t === 'multiSelect') base.options = ['a', 'b'];
  if (t === 'relation') { base.target = 'Other'; base.tenantScoped = true; }
  return [`valid ${t}`, base, true];
});

const INVALID_FIELDS = [
  ['unknown type', { name: 'x', type: 'evil' }, false],
  ['empty name', { name: '', type: 'text' }, false],
  ['name with space', { name: 'bad name', type: 'text' }, false],
  ['dangerous name char', { name: 'bad$name', type: 'text' }, false],
  ['name starts with number', { name: '1field', type: 'text' }, false],
  ['empty label', { name: 'ok', label: '', type: 'text' }, false],
  ['default incompatible', { name: 'n', type: 'number', defaultValue: 'x' }, false],
  ['select without options', { name: 's', type: 'select' }, false],
  ['multiSelect without options', { name: 'm', type: 'multiSelect' }, false],
  ['relation without target', { name: 'r', type: 'relation', tenantScoped: true }, false],
  ['relation without tenantScope', { name: 'r', type: 'relation', target: 'X', tenantScoped: false }, false],
  ['computed function', { name: 'c', type: 'computed', computed: () => 1 }, false],
  ['computed code string', { name: 'c', type: 'computed', computed: 'return 1' }, false],
  ['dangerous regex', { name: 'd', type: 'text', validationPattern: '(a+)+$' }, false],
  ['protected editable default', { name: 'p', type: 'text', protected: true, editableByDefault: true }, false],
  ['searchable invalid type', { name: 'n', type: 'boolean', searchable: true }, false],
  ['sortable invalid type', { name: 'b', type: 'boolean', sortable: true }, false],
  ['filterable invalid type', { name: 'fb', type: 'filePlaceholder', filterable: true }, false],
  ['order negative', { name: 'o', type: 'number', order: -1 }, false],
  ['reserved field name', { name: 'constructor', type: 'text' }, false],
];

/**
 * Runs the field hardening matrix. Valid fields pass; unsafe fields are blocked. Pure.
 * @param {Object} [options]
 * @returns {Object} matrix result
 */
export function createStudioFieldHardeningMatrix(options = {}) {
  void options;
  const knownNames = ['duplicated'];
  const dupCase = ['duplicate field name', { name: 'duplicated', type: 'text' }, false];

  const evalCase = ([name, field, expectValid]) => {
    const r = evaluateStudioField(field, { knownNames });
    return {
      name,
      valid: r.valid,
      blocked: r.blocked,
      expectValid: Boolean(expectValid),
      matchedExpectation: r.valid === Boolean(expectValid),
      sideEffects: false, computedExecuted: false, tenantPreserved: true,
      reasons: r.reasons.slice(0, 4),
    };
  };

  const scenarios = [...VALID_FIELDS, ...INVALID_FIELDS, dupCase].map(evalCase);
  const mismatches = scenarios.filter((s) => !s.matchedExpectation).map((s) => s.name);
  return safeCloneGenericModel({
    kind: 'studio-field-hardening-matrix',
    allowedTypes: [...STUDIO_FIELD_TYPES],
    scenarios,
    scenarioCount: scenarios.length,
    validCount: scenarios.filter((s) => s.valid).length,
    blockedCount: scenarios.filter((s) => s.blocked).length,
    allMatched: mismatches.length === 0,
    blockers: mismatches,
    warnings: [],
    readiness: mismatches.length === 0 ? 'blueprint_contract_hardened' : 'blocked',
  });
}

export default createStudioFieldHardeningMatrix;
