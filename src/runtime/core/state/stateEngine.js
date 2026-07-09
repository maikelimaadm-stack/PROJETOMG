import { StateError } from './errors.js';

/** Hard caps — guard against pathological state trees. */
const MAX_PATH_DEPTH = 16;
const MAX_STATE_KEYS = 256;

/** Never allowed as a path segment — prototype-pollution guard. */
const BLOCKED_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);

/** @param {unknown} value */
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

/** @param {unknown} value */
function deepClone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

/** @param {string} path */
function splitPath(path) {
  return path.split('.').filter((segment) => segment.length > 0);
}

/**
 * @param {unknown} path
 * @returns {string[]}
 */
function validatePath(path) {
  if (typeof path !== 'string' || path.length === 0) {
    throw new StateError('MAK-L3-STATE-002', 'State path/key must be a non-empty string');
  }
  const segments = splitPath(path);
  if (segments.length === 0) {
    throw new StateError('MAK-L3-STATE-002', `State path/key has no valid segments: "${path}"`);
  }
  if (segments.length > MAX_PATH_DEPTH) {
    throw new StateError('MAK-L3-STATE-004', `State path exceeds maximum depth (${segments.length} > ${MAX_PATH_DEPTH}): "${path}"`);
  }
  for (const segment of segments) {
    if (BLOCKED_SEGMENTS.has(segment)) {
      throw new StateError('MAK-L3-STATE-002', `State path contains a forbidden segment: "${segment}"`);
    }
  }
  return segments;
}

/**
 * @param {Record<string, unknown>} state
 * @param {string[]} segments
 */
function getAtPath(state, segments) {
  let cursor = state;
  for (const segment of segments) {
    if (cursor === null || typeof cursor !== 'object') return undefined;
    cursor = /** @type {Record<string, unknown>} */ (cursor)[segment];
  }
  return cursor;
}

/**
 * @param {Record<string, unknown>} state
 * @param {string[]} segments
 * @param {unknown} value
 */
function setAtPath(state, segments, value) {
  let cursor = state;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i];
    if (!isPlainObject(cursor[segment])) {
      cursor[segment] = {};
    }
    cursor = /** @type {Record<string, unknown>} */ (cursor[segment]);
  }
  cursor[segments[segments.length - 1]] = value;
}

/**
 * Merges `patch` into `target` in place, recursing into nested plain
 * objects and overwriting everything else (arrays, primitives). Never
 * touches sibling keys not present in `patch` — a partial update never
 * destroys unrelated state.
 * @param {Record<string, unknown>} target
 * @param {Record<string, unknown>} patch
 */
function deepMergeInto(target, patch) {
  for (const key of Object.keys(patch)) {
    if (BLOCKED_SEGMENTS.has(key)) {
      throw new StateError('MAK-L3-STATE-002', `Patch contains a forbidden key: "${key}"`);
    }
    const patchValue = patch[key];
    if (isPlainObject(patchValue) && isPlainObject(target[key])) {
      deepMergeInto(/** @type {Record<string, unknown>} */ (target[key]), patchValue);
    } else {
      target[key] = deepClone(patchValue);
    }
  }
}

/** @param {unknown} value */
function countKeys(value) {
  if (!isPlainObject(value)) return 0;
  let count = 0;
  for (const key of Object.keys(value)) {
    count += 1;
    count += countKeys(/** @type {Record<string, unknown>} */ (value)[key]);
  }
  return count;
}

/**
 * State Engine (M17) — deterministic, isolated local runtime state store.
 * Each instance owns one private state tree (constructor-scoped isolation);
 * namespaces are just top-level path segments within that tree, accessible
 * ergonomically via `scope()`. Never persists to disk/backend, never
 * queries Prisma/MMM, never wraps a global transaction, never executes
 * Action/Workflow/Render.
 * @implements {import('../../types/state.js').IStateEngine}
 */
export class StateEngine {
  /**
   * @param {Object} [options]
   * @param {Record<string, unknown>} [options.initialState]
   */
  constructor(options = {}) {
    const { initialState = {} } = options;
    if (!isPlainObject(initialState)) {
      throw new StateError('MAK-L3-STATE-001', 'StateEngine requires a plain object as initialState');
    }
    this._initialState = deepClone(initialState);
    this._state = deepClone(initialState);
    /** @type {Map<string, Set<import('../../types/state.js').StateListener>>} */
    this._listeners = new Map();
  }

  /**
   * Reads a value by dot-separated path. Never mutates state.
   * @param {import('../../types/state.js').StateKey} path
   */
  get(path) {
    const segments = validatePath(path);
    return deepClone(getAtPath(this._state, segments));
  }

  /**
   * Writes a value at a dot-separated path, creating intermediate objects
   * as needed. Notifies subscribers of the changed path and its ancestors.
   * @param {import('../../types/state.js').StateKey} path
   * @param {unknown} value
   */
  set(path, value) {
    const segments = validatePath(path);
    setAtPath(this._state, segments, deepClone(value));
    this._enforceKeyLimit();
    this._notify(path);
  }

  /**
   * Deep-merges a partial object into the root state — unrelated sibling
   * keys are preserved untouched.
   * @param {Record<string, unknown>} partial
   */
  patch(partial) {
    if (!isPlainObject(partial)) {
      throw new StateError('MAK-L3-STATE-003', 'patch() requires a plain object');
    }
    deepMergeInto(this._state, partial);
    this._enforceKeyLimit();
    this._notifyAll();
  }

  /**
   * Resets the whole state (no argument) or a single path (if given) back
   * to its value in the constructor's `initialState`.
   * @param {import('../../types/state.js').StateKey} [path]
   */
  reset(path) {
    if (path === undefined) {
      this._state = deepClone(this._initialState);
      this._notifyAll();
      return;
    }
    const segments = validatePath(path);
    const initialValue = getAtPath(this._initialState, segments);
    setAtPath(this._state, segments, deepClone(initialValue ?? {}));
    this._notify(path);
  }

  /**
   * Returns a deep, independent copy of the full state tree — mutating the
   * returned object never affects the engine's internal state.
   */
  snapshot() {
    return deepClone(this._state);
  }

  /**
   * Subscribes to changes at (or below/above) a dot-separated path.
   * @param {import('../../types/state.js').StateKey} path
   * @param {import('../../types/state.js').StateListener} listener
   * @returns {import('../../types/state.js').Unsubscribe}
   */
  subscribe(path, listener) {
    validatePath(path);
    if (typeof listener !== 'function') {
      throw new StateError('MAK-L3-STATE-003', 'subscribe() requires a function listener');
    }
    if (!this._listeners.has(path)) {
      this._listeners.set(path, new Set());
    }
    /** @type {Set<import('../../types/state.js').StateListener>} */ (this._listeners.get(path)).add(listener);
    return () => {
      this._listeners.get(path)?.delete(listener);
    };
  }

  /** Ergonomic namespace accessor — bound get/set/patch/reset/snapshot under a top-level scope. */
  scope(name) {
    validatePath(name);
    return {
      get: (path) => this.get(path ? `${name}.${path}` : name),
      set: (path, value) => this.set(path ? `${name}.${path}` : name, value),
      patch: (partial) => this.patch({ [name]: partial }),
      reset: () => this.reset(name),
      snapshot: () => this.get(name),
    };
  }

  /** @param {import('../../types/state.js').StateKey} key SSOT-literal alias of `get` (IStateEngine, 03-INTERFACES.md). */
  getState(key) {
    return this.get(key);
  }

  /**
   * @param {import('../../types/state.js').StateKey} key
   * @param {unknown} value SSOT-literal alias of `set`.
   */
  setState(key, value) {
    this.set(key, value);
  }

  /**
   * Minimal, generic entity-state dispatcher — intentionally NOT the full
   * MMM/USM 20-operation lifecycle catalog (draft/publish/activate/...),
   * which remains a Studio/MMM authoring concern (16-UNIVERSAL-STATE-MACHINE.md)
   * and is out of scope for local runtime state. Supports a small fixed set
   * of operations scoped under `entityRef` as a top-level path.
   * @param {string} entityRef
   * @param {import('../../types/state.js').UsmOperation} operation
   * @returns {Promise<import('../../types/state.js').UsmState>}
   */
  async transition(entityRef, operation) {
    validatePath(entityRef);
    if (!operation || typeof operation !== 'object' || typeof operation.type !== 'string') {
      throw new StateError('MAK-L3-STATE-003', 'transition() requires an operation object with a "type"');
    }

    switch (operation.type) {
      case 'set':
        this.set(entityRef, operation.value);
        break;
      case 'patch':
        if (!isPlainObject(operation.value)) {
          throw new StateError('MAK-L3-STATE-003', 'transition "patch" requires an object "value"');
        }
        this.patch({ [entityRef]: operation.value });
        break;
      case 'reset':
        this.reset(entityRef);
        break;
      default:
        throw new StateError('MAK-L3-STATE-005', `Unknown state transition operation: "${operation.type}"`);
    }

    return this.get(entityRef);
  }

  _enforceKeyLimit() {
    const count = countKeys(this._state);
    if (count > MAX_STATE_KEYS) {
      throw new StateError('MAK-L3-STATE-004', `State exceeds maximum key count (${count} > ${MAX_STATE_KEYS})`);
    }
  }

  /** @param {string} changedPath */
  _notify(changedPath) {
    const changedSegments = splitPath(changedPath);
    for (const [key, listeners] of this._listeners) {
      const keySegments = splitPath(key);
      const related =
        keySegments.every((segment, i) => changedSegments[i] === segment) ||
        changedSegments.every((segment, i) => keySegments[i] === segment);
      if (related) {
        const value = this.get(key);
        for (const listener of listeners) listener(value);
      }
    }
  }

  _notifyAll() {
    for (const [key, listeners] of this._listeners) {
      const value = this.get(key);
      for (const listener of listeners) listener(value);
    }
  }
}

/**
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.initialState]
 * @returns {StateEngine}
 */
export function createStateEngine(options) {
  return new StateEngine(options);
}

export { StateError };
