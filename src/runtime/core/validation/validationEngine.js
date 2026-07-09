import { createExpressionEngine } from '../expression/expressionEngine.js';
import { ValidationError } from './errors.js';

/** Hard caps — guard against pathological validation definitions. */
const MAX_RULES_PER_FIELD = 16;
const MAX_FIELDS_PER_VALIDATION = 64;
const MAX_PATTERN_LENGTH = 200;
const MAX_CUSTOM_EXPRESSION_LENGTH = 300;

const SUPPORTED_TYPES = new Set(['string', 'number', 'boolean', 'date', 'object', 'array']);

/** Single generic code for data-level rule failures — the `rule`/`field` fields carry the specifics. */
const RULE_FAILED_CODE = 'MAK-L3-VALIDATION-RULE-FAILED';

/** @param {unknown} value */
function isEmpty(value) {
  return value === undefined || value === null || value === '';
}

/**
 * @param {import('../../types/validation.js').ValidationRule} rule
 * @param {unknown} value
 */
function checkType(rule, value) {
  const expected = rule.type;
  if (!SUPPORTED_TYPES.has(expected)) {
    throw new ValidationError('MAK-L3-VALIDATION-003', `Rule "type" has an unsupported target type: ${expected}`);
  }
  if (expected === 'date') {
    return value instanceof Date || (typeof value === 'string' && !Number.isNaN(Date.parse(value)));
  }
  if (expected === 'array') return Array.isArray(value);
  if (expected === 'object') return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
  return typeof value === expected;
}

/**
 * @param {import('../../types/validation.js').ValidationRule} rule
 * @param {string} defaultMessage
 * @returns {import('../../types/validation.js').ValidationErrorEntry}
 */
function buildFailure(rule, defaultMessage) {
  return {
    code: RULE_FAILED_CODE,
    field: rule.field,
    rule: rule.rule,
    message: typeof rule.message === 'string' && rule.message.length > 0 ? rule.message : defaultMessage,
    severity: rule.severity === 'warning' ? 'warning' : 'error',
  };
}

/**
 * Evaluates a single rule. Malformed rules (missing required structural
 * parameters, unknown rule name, invalid regex/enum/expression syntax)
 * throw ValidationError. Data-level mismatches (value doesn't satisfy an
 * otherwise well-formed rule) return a failure entry — never both silently
 * pass nor throw for ordinary business validation outcomes.
 *
 * @param {import('../../types/validation.js').ValidationRule} rule
 * @param {unknown} value
 * @param {Record<string, unknown>} bindings
 * @param {import('../expression/expressionEngine.js').ExpressionEngine} expressionEngine
 * @returns {import('../../types/validation.js').ValidationErrorEntry | null}
 */
function evaluateRule(rule, value, bindings, expressionEngine) {
  if (!rule || typeof rule !== 'object' || typeof rule.rule !== 'string') {
    throw new ValidationError('MAK-L3-VALIDATION-003', `Malformed validation rule: ${JSON.stringify(rule)}`);
  }

  switch (rule.rule) {
    case 'required':
      return isEmpty(value) ? buildFailure(rule, 'Value is required') : null;

    case 'type':
      return checkType(rule, value) ? null : buildFailure(rule, `Value must be of type "${rule.type}"`);

    case 'min': {
      if (typeof rule.value !== 'number') {
        throw new ValidationError('MAK-L3-VALIDATION-003', 'Rule "min" requires a numeric "value"');
      }
      if (typeof value !== 'number') return buildFailure(rule, 'Value is not a number for "min" rule');
      return value < rule.value ? buildFailure(rule, `Value must be >= ${rule.value}`) : null;
    }

    case 'max': {
      if (typeof rule.value !== 'number') {
        throw new ValidationError('MAK-L3-VALIDATION-003', 'Rule "max" requires a numeric "value"');
      }
      if (typeof value !== 'number') return buildFailure(rule, 'Value is not a number for "max" rule');
      return value > rule.value ? buildFailure(rule, `Value must be <= ${rule.value}`) : null;
    }

    case 'minLength': {
      if (typeof rule.length !== 'number') {
        throw new ValidationError('MAK-L3-VALIDATION-003', 'Rule "minLength" requires a numeric "length"');
      }
      if (typeof value !== 'string' && !Array.isArray(value)) {
        return buildFailure(rule, 'Value has no length for "minLength" rule');
      }
      return value.length < rule.length ? buildFailure(rule, `Length must be >= ${rule.length}`) : null;
    }

    case 'maxLength': {
      if (typeof rule.length !== 'number') {
        throw new ValidationError('MAK-L3-VALIDATION-003', 'Rule "maxLength" requires a numeric "length"');
      }
      if (typeof value !== 'string' && !Array.isArray(value)) {
        return buildFailure(rule, 'Value has no length for "maxLength" rule');
      }
      return value.length > rule.length ? buildFailure(rule, `Length must be <= ${rule.length}`) : null;
    }

    case 'pattern': {
      if (typeof rule.pattern !== 'string' || rule.pattern.length === 0) {
        throw new ValidationError('MAK-L3-VALIDATION-003', 'Rule "pattern" requires a non-empty "pattern" string');
      }
      if (rule.pattern.length > MAX_PATTERN_LENGTH) {
        throw new ValidationError('MAK-L3-VALIDATION-004', `Pattern exceeds maximum length (${MAX_PATTERN_LENGTH})`);
      }
      let regex;
      try {
        regex = new RegExp(rule.pattern, rule.flags);
      } catch (err) {
        throw new ValidationError(
          'MAK-L3-VALIDATION-003',
          `Rule "pattern" has invalid regex: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      if (typeof value !== 'string') return buildFailure(rule, 'Value is not a string for "pattern" rule');
      return regex.test(value) ? null : buildFailure(rule, 'Value does not match pattern');
    }

    case 'enum': {
      if (!Array.isArray(rule.values) || rule.values.length === 0) {
        throw new ValidationError('MAK-L3-VALIDATION-003', 'Rule "enum" requires a non-empty "values" array');
      }
      return rule.values.includes(value) ? null : buildFailure(rule, 'Value is not in the allowed list');
    }

    case 'custom': {
      if (typeof rule.expr !== 'string' || rule.expr.length === 0) {
        throw new ValidationError('MAK-L3-VALIDATION-003', 'Rule "custom" requires a non-empty "expr" string');
      }
      if (rule.expr.length > MAX_CUSTOM_EXPRESSION_LENGTH) {
        throw new ValidationError(
          'MAK-L3-VALIDATION-004',
          `Custom expression exceeds maximum length (${MAX_CUSTOM_EXPRESSION_LENGTH})`,
        );
      }
      const syntaxCheck = expressionEngine.validate(rule.expr);
      if (!syntaxCheck.valid) {
        throw new ValidationError(
          'MAK-L3-VALIDATION-003',
          `Rule "custom" has an invalid expression: ${syntaxCheck.errors.join('; ')}`,
        );
      }

      let result;
      try {
        result = expressionEngine.evaluate(rule.expr, { value, ...bindings });
      } catch (err) {
        return buildFailure(
          rule,
          `Custom expression failed to evaluate: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      if (result !== true && result !== false) {
        return buildFailure(rule, 'Custom expression must return a boolean');
      }
      return result === true ? null : buildFailure(rule, 'Custom expression returned false');
    }

    default:
      throw new ValidationError('MAK-L3-VALIDATION-003', `Unknown validation rule: ${rule.rule}`);
  }
}

/**
 * @param {import('../../types/validation.js').ValidationErrorEntry[]} entries
 * @returns {import('../../types/validation.js').ValidationResult}
 */
function buildResult(entries) {
  const errors = entries.filter((entry) => entry.severity !== 'warning');
  const warnings = entries.filter((entry) => entry.severity === 'warning');
  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validation Engine (M15) — declarative, deterministic, side-effect-free.
 * Delegates `custom` rule evaluation to M13 Expression Engine (never
 * reimplemented); never executes Action/Workflow/Render; never queries
 * Prisma/MMM; never persists anything.
 * @implements {import('../../types/validation.js').IValidationEngine}
 */
export class ValidationEngine {
  /**
   * @param {Object} options
   * @param {import('../registry/registryManager.js').RegistryManager} options.registry
   * @param {import('../expression/expressionEngine.js').ExpressionEngine} [options.expressionEngine]
   */
  constructor(options = {}) {
    const { registry, expressionEngine } = options;
    if (!registry || typeof registry.has !== 'function' || typeof registry.resolve !== 'function') {
      throw new ValidationError('MAK-L3-VALIDATION-001', 'ValidationEngine requires a valid registry (IRegistry) instance');
    }
    this._registry = registry;
    this._expressionEngine = expressionEngine ?? createExpressionEngine();
  }

  /**
   * Low-level, contract-faithful entry point — validates a single value
   * against an explicit rules array (no registry lookup).
   * @param {import('../../types/validation.js').ValidationRule[]} rules
   * @param {unknown} value
   * @param {unknown} [ctx]
   * @returns {import('../../types/validation.js').ValidationResult}
   */
  validateSync(rules, value, ctx) {
    if (!Array.isArray(rules)) {
      throw new ValidationError('MAK-L3-VALIDATION-003', 'rules must be an array of ValidationRule');
    }
    if (rules.length > MAX_RULES_PER_FIELD) {
      throw new ValidationError('MAK-L3-VALIDATION-004', `Too many rules (${rules.length} > ${MAX_RULES_PER_FIELD})`);
    }

    const bindings = { data: value, record: value, ctx: ctx ?? null };
    const entries = [];
    for (const rule of rules) {
      const entry = evaluateRule(rule, value, bindings, this._expressionEngine);
      if (entry) entries.push(entry);
    }
    return buildResult(entries);
  }

  /**
   * @param {import('../../types/validation.js').ValidationRule[]} rules
   * @param {unknown} value
   * @param {unknown} [ctx]
   * @returns {Promise<import('../../types/validation.js').ValidationResult>}
   */
  async validateAsync(rules, value, ctx) {
    return this.validateSync(rules, value, ctx);
  }

  /** Ergonomic alias for `validateSync`. */
  validate(rules, value, ctx) {
    return this.validateSync(rules, value, ctx);
  }

  /**
   * Registry-driven single-field validation.
   * @param {string} resourceCode
   * @param {string} fieldCode
   * @param {unknown} value
   * @param {unknown} data Full record, exposed to `custom` rule bindings.
   * @param {unknown} [ctx]
   * @returns {import('../../types/validation.js').ValidationResult}
   */
  validateField(resourceCode, fieldCode, value, data, ctx) {
    const rules = this._loadResourceRules(resourceCode).filter((rule) => rule.field === fieldCode);
    if (rules.length > MAX_RULES_PER_FIELD) {
      throw new ValidationError(
        'MAK-L3-VALIDATION-004',
        `Too many rules for field "${fieldCode}" (${rules.length} > ${MAX_RULES_PER_FIELD})`,
      );
    }

    const bindings = { data, record: data, ctx: ctx ?? null };
    const entries = [];
    for (const rule of rules) {
      const entry = evaluateRule(rule, value, bindings, this._expressionEngine);
      if (entry) entries.push(entry);
    }
    return buildResult(entries);
  }

  /**
   * Registry-driven whole-record validation — aggregates every declared
   * field's rules in declaration order (deterministic).
   * @param {string} resourceCode
   * @param {Record<string, unknown>} record
   * @param {unknown} [ctx]
   * @returns {import('../../types/validation.js').ValidationResult}
   */
  validateRecord(resourceCode, record, ctx) {
    const allRules = this._loadResourceRules(resourceCode);

    /** @type {Map<string, import('../../types/validation.js').ValidationRule[]>} */
    const fieldGroups = new Map();
    for (const rule of allRules) {
      const field = rule.field ?? '__record__';
      if (!fieldGroups.has(field)) fieldGroups.set(field, []);
      /** @type {import('../../types/validation.js').ValidationRule[]} */ (fieldGroups.get(field)).push(rule);
    }

    if (fieldGroups.size > MAX_FIELDS_PER_VALIDATION) {
      throw new ValidationError(
        'MAK-L3-VALIDATION-004',
        `Too many fields declared for validation "${resourceCode}" (${fieldGroups.size} > ${MAX_FIELDS_PER_VALIDATION})`,
      );
    }

    const bindings = { data: record, record, ctx: ctx ?? null };
    const entries = [];
    for (const [field, rules] of fieldGroups) {
      if (rules.length > MAX_RULES_PER_FIELD) {
        throw new ValidationError(
          'MAK-L3-VALIDATION-004',
          `Too many rules for field "${field}" (${rules.length} > ${MAX_RULES_PER_FIELD})`,
        );
      }
      const value = field === '__record__' ? record : /** @type {Record<string, unknown>} */ (record)?.[field];
      for (const rule of rules) {
        const entry = evaluateRule(rule, value, bindings, this._expressionEngine);
        if (entry) entries.push(entry);
      }
    }

    return buildResult(entries);
  }

  /**
   * @param {string} resourceCode
   * @returns {import('../../types/validation.js').ValidationRule[]}
   */
  _loadResourceRules(resourceCode) {
    if (typeof resourceCode !== 'string' || resourceCode.length === 0 || !this._registry.has('validation', resourceCode)) {
      throw new ValidationError('MAK-L3-VALIDATION-002', `Unknown validation resource: ${resourceCode}`);
    }
    const record = this._registry.resolve('validation', resourceCode);
    const rules = record?.payload?.rules;
    if (!Array.isArray(rules)) {
      throw new ValidationError('MAK-L3-VALIDATION-003', `Validation resource "${resourceCode}" has an invalid "rules" declaration`);
    }
    return rules;
  }
}

/**
 * @param {Object} options
 * @param {import('../registry/registryManager.js').RegistryManager} options.registry
 * @param {import('../expression/expressionEngine.js').ExpressionEngine} [options.expressionEngine]
 * @returns {ValidationEngine}
 */
export function createValidationEngine(options) {
  return new ValidationEngine(options);
}

export { ValidationError };
