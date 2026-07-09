import { createExpressionEngine } from '../expression/expressionEngine.js';
import { FormulaError } from './errors.js';

/** Hard cap on declared dependencies per formula — guards against pathological definitions. */
const MAX_DEPENDENCIES = 32;

/**
 * Formula Engine (M14) — computes CRB-declared formulas by delegating
 * expression evaluation to M13 (never reimplemented). Formulas are read
 * from the hydrated CRB registry under type `handler` (CRB bucket
 * `formula` maps to `handler` per `crbConstants.CRB_REGISTRY_MAP` — no new
 * registry type introduced). Resolves formula-to-formula dependencies with
 * cycle detection; never queries Prisma/MMM, never dispatches
 * Action/Workflow, never renders.
 * @implements {import('../../types/formula.js').IFormulaEngine}
 */
export class FormulaEngine {
  /**
   * @param {Object} options
   * @param {import('../registry/registryManager.js').RegistryManager} options.registry
   * @param {import('../expression/expressionEngine.js').ExpressionEngine} [options.expressionEngine]
   */
  constructor(options = {}) {
    const { registry, expressionEngine } = options;
    if (!registry || typeof registry.has !== 'function' || typeof registry.resolve !== 'function') {
      throw new FormulaError('MAK-L3-FORMULA-001', 'FormulaEngine requires a valid registry (IRegistry) instance');
    }
    this._registry = registry;
    this._expressionEngine = expressionEngine ?? createExpressionEngine();
  }

  /**
   * @param {string} formulaCode
   * @param {Record<string, unknown>} [fieldValues]
   * @returns {unknown}
   */
  compute(formulaCode, fieldValues) {
    return this._computeInternal(formulaCode, fieldValues ?? {}, new Map(), new Set());
  }

  /**
   * Computes several formulas, sharing dependency resolution/cycle state.
   * @param {string[]} formulaCodes
   * @param {Record<string, unknown>} [fieldValues]
   * @returns {Record<string, unknown>}
   */
  computeBatch(formulaCodes, fieldValues) {
    const cache = new Map();
    /** @type {Record<string, unknown>} */
    const results = {};
    for (const code of formulaCodes) {
      results[code] = this._computeInternal(code, fieldValues ?? {}, cache, new Set());
    }
    return results;
  }

  /**
   * @param {string} formulaCode
   * @returns {string[]}
   */
  getDependencies(formulaCode) {
    return [...this._loadDefinition(formulaCode).dependsOn];
  }

  /**
   * @param {string} code
   * @param {Record<string, unknown>} fieldValues
   * @param {Map<string, unknown>} resolved
   * @param {Set<string>} inProgress
   * @returns {unknown}
   */
  _computeInternal(code, fieldValues, resolved, inProgress) {
    if (resolved.has(code)) return resolved.get(code);
    if (inProgress.has(code)) {
      throw new FormulaError('MAK-L3-FORMULA-004', `Cycle detected in formula dependencies involving: ${code}`);
    }

    const definition = this._loadDefinition(code);
    inProgress.add(code);

    /** @type {Record<string, unknown>} */
    const bindings = { ...fieldValues };
    for (const dep of definition.dependsOn) {
      bindings[dep] = this._computeInternal(dep, fieldValues, resolved, inProgress);
    }

    let value;
    try {
      value = this._expressionEngine.evaluate(definition.expr, bindings);
    } catch (err) {
      throw new FormulaError(
        'MAK-L3-FORMULA-002',
        `Formula "${code}" failed to evaluate: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    inProgress.delete(code);
    resolved.set(code, value);
    return value;
  }

  /**
   * @param {string} code
   * @returns {import('../../types/formula.js').FormulaDefinition}
   */
  _loadDefinition(code) {
    if (typeof code !== 'string' || code.length === 0 || !this._registry.has('handler', code)) {
      throw new FormulaError('MAK-L3-FORMULA-003', `Unknown formula: ${code}`);
    }

    const record = this._registry.resolve('handler', code);
    const expr = record?.payload?.expr;
    if (typeof expr !== 'string' || expr.length === 0) {
      throw new FormulaError('MAK-L3-FORMULA-002', `Formula "${code}" has an invalid definition: missing "expr"`);
    }

    const dependsOn = Array.isArray(record?.payload?.dependsOn) ? record.payload.dependsOn : [];
    if (dependsOn.length > MAX_DEPENDENCIES) {
      throw new FormulaError(
        'MAK-L3-FORMULA-005',
        `Formula "${code}" declares too many dependencies (${dependsOn.length} > ${MAX_DEPENDENCIES})`,
      );
    }
    for (const dep of dependsOn) {
      if (typeof dep !== 'string' || dep.length === 0 || !this._registry.has('handler', dep)) {
        throw new FormulaError('MAK-L3-FORMULA-003', `Unknown formula dependency: ${dep}`);
      }
    }

    return { code, expr, dependsOn };
  }
}

/**
 * @param {Object} options
 * @param {import('../registry/registryManager.js').RegistryManager} options.registry
 * @param {import('../expression/expressionEngine.js').ExpressionEngine} [options.expressionEngine]
 * @returns {FormulaEngine}
 */
export function createFormulaEngine(options) {
  return new FormulaEngine(options);
}

export { FormulaError };
