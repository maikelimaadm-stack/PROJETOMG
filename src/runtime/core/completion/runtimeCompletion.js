import fs from 'node:fs';
import { RuntimeCompletionError } from './errors.js';

/**
 * Canonical M01–M24 module registry for Foundation C completeness checks.
 * `key` is looked up directly on the `runtime` object first, then (if
 * absent) resolved via `runtime.serviceLocator`/`runtime._serviceLocator`
 * when present. `custom`, when provided, overrides both lookups.
 */
const MODULE_REGISTRY = [
  { id: 'M01', name: 'Bootstrap', custom: (runtime) => Boolean(runtime && (runtime.lifecycle === 'runtime-ready' || runtime.status === 'hydrated' || runtime.phase)) },
  { id: 'M02', name: 'Context', key: 'context' },
  { id: 'M03', name: 'Session', key: 'session' },
  { id: 'M04', name: 'Registry', key: 'registry' },
  { id: 'M05', name: 'Loader', key: 'loader' },
  { id: 'M06', name: 'CRB Loader', key: 'crbLoader' },
  { id: 'M07', name: 'Dependency Resolver', key: 'dependencyResolver' },
  { id: 'M08', name: 'Router', key: 'router' },
  { id: 'M09', name: 'Permission Engine', key: 'permissionEngine' },
  { id: 'M10', name: 'Action Engine', key: 'actionEngine' },
  { id: 'M11', name: 'Workflow Engine', key: 'workflowEngine' },
  { id: 'M12', name: 'Render Engine', key: 'renderEngine' },
  { id: 'M13', name: 'Expression Engine', key: 'expressionEngine' },
  { id: 'M14', name: 'Formula Engine', key: 'formulaEngine' },
  { id: 'M15', name: 'Validation Engine', key: 'validationEngine' },
  { id: 'M16', name: 'Execution Engine', key: 'executionEngine' },
  { id: 'M17', name: 'State Engine', key: 'stateEngine' },
  { id: 'M18', name: 'Plugin Engine', key: 'pluginEngine' },
  { id: 'M19', name: 'Connector Engine', key: 'connectorEngine' },
  { id: 'M20', name: 'Service Locator', custom: (runtime) => Boolean(resolveServiceLocator(runtime)) },
  { id: 'M21', name: 'Cache Engine', key: 'cacheEngine' },
  { id: 'M22', name: 'Event Bus', key: 'eventBus' },
  { id: 'M23', name: 'Transaction Engine', key: 'transactionEngine' },
  { id: 'M24', name: 'Observability Engine', key: 'observabilityEngine' },
];

/** Canonical Service Locator registration names wired by `bootstrap.js`/`rt0-shell.js`. */
const KNOWN_SERVICE_NAMES = [
  'context',
  'registry',
  'loader',
  'crbLoader',
  'dependencyResolver',
  'router',
  'permissionEngine',
  'actionEngine',
  'workflowEngine',
  'renderEngine',
  'expressionEngine',
  'formulaEngine',
  'validationEngine',
  'executionEngine',
  'stateEngine',
  'pluginEngine',
  'connectorEngine',
  'cacheEngine',
  'eventBus',
  'transactionEngine',
  'observabilityEngine',
];

/** @param {unknown} runtime */
function resolveServiceLocator(runtime) {
  if (!runtime || typeof runtime !== 'object') return null;
  const locator = /** @type {Record<string, unknown>} */ (runtime).serviceLocator ?? /** @type {Record<string, unknown>} */ (runtime)._serviceLocator;
  if (locator && typeof (/** @type {any} */ (locator).resolve) === 'function') return locator;
  return null;
}

/**
 * @param {unknown} runtime
 * @param {{id: string, name: string, key?: string, custom?: (runtime: unknown) => boolean}} entry
 * @returns {import('../../types/completion.js').ModuleAvailability}
 */
function evaluateModule(runtime, entry) {
  let available = false;
  try {
    if (entry.custom) {
      available = entry.custom(runtime);
    } else if (runtime && typeof runtime === 'object') {
      const direct = /** @type {Record<string, unknown>} */ (runtime)[/** @type {string} */ (entry.key)];
      if (direct) {
        available = true;
      } else {
        const locator = resolveServiceLocator(runtime);
        if (locator && typeof (/** @type {any} */ (locator).has) === 'function') {
          available = Boolean(/** @type {any} */ (locator).has(entry.key));
        }
      }
    }
  } catch {
    // A missing/misbehaving module must surface as "missing", never as a thrown error (rule #1).
    available = false;
  }
  return { id: entry.id, name: entry.name, status: available ? 'available' : 'missing' };
}

/**
 * Runtime-local, read-only audit of Foundation C's module composition.
 * Never executes real UI, Action, Workflow, or Connector behavior; never
 * queries Prisma/MMM; never calls the backend. Purely inspects whatever
 * `runtime`/`serviceLocator` shape it is handed.
 */
export class RuntimeCompletion {
  /**
   * @param {Object} [options]
   * @param {() => number} [options.clock]
   */
  constructor(options = {}) {
    const { clock = () => Date.now() } = options;
    if (typeof clock !== 'function') {
      throw new RuntimeCompletionError('MAK-L3-COMPLETION-001', 'RuntimeCompletion "clock" option must be a function');
    }
    this._clock = clock;
  }

  /**
   * Checks presence of every M01–M24 module against a `runtime`-shaped
   * object (the `loadRuntimeBundle()` result, a bootstrap instance, or any
   * object exposing the same canonical property names / a service
   * locator). A missing module is reported as `status: 'missing'` — never
   * throws for an absent module.
   * @param {unknown} runtime
   * @returns {import('../../types/completion.js').ModuleAvailability[]}
   */
  checkRuntimeCompleteness(runtime) {
    return MODULE_REGISTRY.map((entry) => evaluateModule(runtime, entry));
  }

  /**
   * Checks, for every canonical service name registered by `bootstrap.js`,
   * whether the given Service Locator can resolve it.
   * @param {{ has?: Function, resolve?: Function }} serviceLocator
   * @returns {import('../../types/completion.js').ServiceAvailability[]}
   */
  checkServiceAvailability(serviceLocator) {
    if (!serviceLocator || typeof serviceLocator.has !== 'function') {
      throw new RuntimeCompletionError('MAK-L3-COMPLETION-002', 'checkServiceAvailability() requires a valid ServiceLocator (has()/resolve())');
    }
    return KNOWN_SERVICE_NAMES.map((name) => ({ name, available: Boolean(serviceLocator.has(name)) }));
  }

  /**
   * Checks, for each declared gate script path, whether the file exists on
   * disk — a deterministic, filesystem-driven check.
   * @param {import('../../types/completion.js').GateManifestEntry[]} manifest
   * @returns {import('../../types/completion.js').GateAvailability[]}
   */
  checkGatesManifest(manifest) {
    if (!Array.isArray(manifest)) {
      throw new RuntimeCompletionError('MAK-L3-COMPLETION-002', 'checkGatesManifest() requires an array manifest');
    }
    return manifest.map((entry) => ({
      id: entry.id,
      scriptPath: entry.scriptPath,
      exists: fs.existsSync(entry.scriptPath),
    }));
  }

  /**
   * Builds the structured Foundation C completeness report.
   * @param {unknown} runtime
   * @returns {import('../../types/completion.js').FoundationCReport}
   */
  createFoundationCReport(runtime) {
    const modules = this.checkRuntimeCompleteness(runtime);
    const availableCount = modules.filter((m) => m.status === 'available').length;
    return {
      modules,
      availableCount,
      missingCount: modules.length - availableCount,
      generatedAt: this._clock(),
    };
  }
}

/**
 * @param {Object} [options]
 * @param {() => number} [options.clock]
 * @returns {RuntimeCompletion}
 */
export function createRuntimeCompletion(options) {
  return new RuntimeCompletion(options);
}

export { RuntimeCompletionError };
