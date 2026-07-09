import { ConnectorError } from './errors.js';

/** Hard caps — guard against pathological manifests/payloads/results. */
const MAX_CONNECTORS = 128;
const MAX_OPERATIONS_PER_CONNECTOR = 64;
const MAX_PAYLOAD_KEYS = 200;
const MAX_PAYLOAD_DEPTH = 8;
const MAX_RESULT_KEYS = 500;

/** Never allowed as an object key — prototype-pollution guard (payload/result). */
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** Key names whose values are masked before appearing in a `ConnectorResponse`. */
const SENSITIVE_KEY_PATTERN = /password|token|secret|api[-_]?key|authorization|credential/i;

/** @param {unknown} value */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

/**
 * @param {unknown} manifest
 * @returns {manifest is import('../../types/connector.js').ConnectorManifest}
 */
function isValidManifestShape(manifest) {
  if (!manifest || typeof manifest !== 'object') return false;
  const m = /** @type {Record<string, unknown>} */ (manifest);
  if (!isNonEmptyString(m.connectorId)) return false;
  if (m.operations !== undefined && (!Array.isArray(m.operations) || !m.operations.every((o) => isNonEmptyString(o)))) {
    return false;
  }
  if (Array.isArray(m.operations) && m.operations.length > MAX_OPERATIONS_PER_CONNECTOR) {
    throw new ConnectorError(
      'MAK-L3-CONNECTOR-009',
      `Manifest declares too many operations (${m.operations.length} > ${MAX_OPERATIONS_PER_CONNECTOR})`,
    );
  }
  if (m.enabled !== undefined && typeof m.enabled !== 'boolean') return false;
  if (m.permission !== undefined && !isNonEmptyString(m.permission)) return false;
  if (m.version !== undefined && !isNonEmptyString(m.version)) return false;
  return true;
}

/**
 * Recursively counts keys and validates depth/forbidden segments in a
 * payload or result object — shared guard for both directions (request in,
 * adapter result out).
 * @param {unknown} value
 * @param {number} depth
 * @param {number} maxDepth
 * @param {'payload'|'result'} label
 * @returns {number}
 */
function countKeysGuarded(value, depth, maxDepth, label) {
  if (depth > maxDepth) {
    throw new ConnectorError('MAK-L3-CONNECTOR-009', `Connector ${label} exceeds maximum depth (${maxDepth})`);
  }
  if (Array.isArray(value)) {
    let count = 0;
    for (const item of value) count += countKeysGuarded(item, depth + 1, maxDepth, label);
    return count;
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    let count = 0;
    for (const key of Object.keys(value)) {
      if (BLOCKED_KEYS.has(key)) {
        throw new ConnectorError('MAK-L3-CONNECTOR-009', `Connector ${label} contains a forbidden key: "${key}"`);
      }
      count += 1;
      count += countKeysGuarded(/** @type {Record<string, unknown>} */ (value)[key], depth + 1, maxDepth, label);
    }
    return count;
  }
  return 0;
}

/** @param {unknown} payload */
function validatePayload(payload) {
  if (payload === undefined || payload === null || typeof payload !== 'object') return;
  const totalKeys = countKeysGuarded(payload, 0, MAX_PAYLOAD_DEPTH, 'payload');
  if (totalKeys > MAX_PAYLOAD_KEYS) {
    throw new ConnectorError('MAK-L3-CONNECTOR-009', `Connector payload exceeds maximum key count (${totalKeys} > ${MAX_PAYLOAD_KEYS})`);
  }
}

/** @param {unknown} result */
function validateResultShape(result) {
  if (result === undefined || result === null || typeof result !== 'object') return;
  const totalKeys = countKeysGuarded(result, 0, MAX_PAYLOAD_DEPTH, 'result');
  if (totalKeys > MAX_RESULT_KEYS) {
    throw new ConnectorError('MAK-L3-CONNECTOR-009', `Connector result exceeds maximum key count (${totalKeys} > ${MAX_RESULT_KEYS})`);
  }
}

/**
 * Deep-clones `value`, masking any key matching a known sensitive-data
 * pattern (password/token/secret/api key/authorization/credential).
 * @param {unknown} value
 * @returns {unknown}
 */
function redactSensitive(value) {
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = SENSITIVE_KEY_PATTERN.test(key) ? '[REDACTED]' : redactSensitive(v);
    }
    return out;
  }
  return value;
}

/** @param {string} connectorId @param {string} operation */
function adapterKey(connectorId, operation) {
  return `${connectorId}::${operation}`;
}

/**
 * Connector Engine (M19) — registry-driven, deterministic, fail-safe
 * integration layer. Manifests are declarative data resolved from the CRB
 * `connector` registry (RT-C-17: Plugin → Connector, "no eval, manifest-
 * only"); actual invocation always dispatches to a host-registered adapter
 * function (`registerAdapter`) — this engine never performs a network call,
 * never `fetch()`es, never `eval`s, never uses `new Function`, never
 * dynamically imports connector-supplied code, never installs a
 * dependency. Delegates permission checks to M09; never queries Prisma/MMM.
 * @implements {import('../../types/connector.js').IConnectorEngine}
 */
export class ConnectorEngine {
  /**
   * @param {Object} options
   * @param {import('../registry/registryManager.js').RegistryManager} options.registry
   * @param {import('../permission/permissionEngine.js').PermissionEngine} [options.permissionEngine]
   * @param {string[]} [options.operations] Operation names known to the host at construction time.
   */
  constructor(options = {}) {
    const { registry, permissionEngine, operations = [] } = options;
    if (!registry || typeof registry.has !== 'function' || typeof registry.resolve !== 'function') {
      throw new ConnectorError('MAK-L3-CONNECTOR-001', 'ConnectorEngine requires a valid registry (IRegistry) instance');
    }
    this._registry = registry;
    this._permissionEngine = permissionEngine ?? null;
    /** @type {Map<string, import('../../types/connector.js').ConnectorOperation>} */
    this._operations = new Map();
    for (const name of operations) {
      this.registerOperation(name);
    }
    /** @type {Map<string, import('../../types/connector.js').IConnector>} */
    this._loaded = new Map();
    /** @type {Map<string, Function>} */
    this._adapters = new Map();
  }

  /**
   * SSOT-literal entry point (`IConnectorEngine.invoke`) — resolves the
   * connector, validates it, checks operation permission/authorization,
   * then delegates to the host-registered adapter.
   * @param {string} connectorId
   * @param {import('../../types/connector.js').ConnectorRequest} request
   * @param {import('../context/RuntimeContext.js').RuntimeContext | { accessScope?: import('../../types/uec.js').AccessScope }} [ctx]
   * @returns {Promise<import('../../types/connector.js').ConnectorResponse>}
   */
  async invoke(connectorId, request, ctx) {
    if (!request || typeof request !== 'object' || !isNonEmptyString(request.operation)) {
      throw new ConnectorError('MAK-L3-CONNECTOR-003', 'Invalid ConnectorRequest: missing or invalid "operation"');
    }
    validatePayload(request.payload);
    this.getOperation(request.operation); // throws MAK-L3-CONNECTOR-004 if unknown

    const connector = this._loaded.get(connectorId) ?? (await this.resolve(connectorId));

    if (!connector.enabled) {
      return errorResult('MAK-L3-CONNECTOR-005', `Connector "${connectorId}" is disabled`);
    }
    if (!connector.operations.includes(request.operation)) {
      return errorResult('MAK-L3-CONNECTOR-006', `Connector "${connectorId}" is not permitted to use operation "${request.operation}"`);
    }

    if (connector.permission) {
      if (!this._permissionEngine) {
        return errorResult('MAK-L3-CONNECTOR-007', `Connector "${connectorId}" requires the Permission Engine but none is wired`);
      }
      const allowed = await this._checkPermission(connector.permission, ctx);
      if (!allowed) {
        return errorResult('MAK-L3-CONNECTOR-008', `Connector "${connectorId}" operation "${request.operation}" denied by Permission Engine`);
      }
    }

    const adapter = this._adapters.get(adapterKey(connectorId, request.operation));
    if (!adapter) {
      return errorResult('MAK-L3-CONNECTOR-007', `No adapter bound for connector "${connectorId}" operation "${request.operation}"`);
    }

    let data;
    try {
      data = await adapter(request.payload, ctx, connector);
    } catch (err) {
      return errorResult('MAK-L3-CONNECTOR-010', err instanceof Error ? err.message : 'Connector adapter failed');
    }

    validateResultShape(data);
    return { success: true, data: redactSensitive(data) };
  }

  /**
   * Validates a manifest object structurally and caches the normalized,
   * frozen connector. Never touches the registry; the caller supplies the
   * manifest directly.
   * @param {import('../../types/connector.js').ConnectorManifest} manifest
   * @returns {Promise<import('../../types/connector.js').IConnector>}
   */
  async load(manifest) {
    if (!isValidManifestShape(manifest)) {
      throw new ConnectorError('MAK-L3-CONNECTOR-003', `Invalid connector manifest shape: ${JSON.stringify(manifest)}`);
    }
    if (!this._loaded.has(manifest.connectorId) && this._loaded.size >= MAX_CONNECTORS) {
      throw new ConnectorError('MAK-L3-CONNECTOR-009', `Too many connectors loaded (> ${MAX_CONNECTORS})`);
    }
    /** @type {import('../../types/connector.js').IConnector} */
    const connector = Object.freeze({
      connectorId: manifest.connectorId,
      version: manifest.version,
      enabled: manifest.enabled !== false,
      operations: Object.freeze([...(manifest.operations ?? [])]),
      permission: manifest.permission,
    });
    this._loaded.set(connector.connectorId, connector);
    return connector;
  }

  /** @param {string} connectorId */
  async unload(connectorId) {
    this._loaded.delete(connectorId);
    for (const key of [...this._adapters.keys()]) {
      if (key.startsWith(`${connectorId}::`)) this._adapters.delete(key);
    }
  }

  /**
   * Registry-driven resolution — loads the manifest from the CRB
   * `connector` registry bucket (hydrated by M06, keyed by `objectId`) and
   * delegates to `load()`. Never queries Prisma/MMM — registry only.
   * @param {string} connectorId
   * @returns {Promise<import('../../types/connector.js').IConnector>}
   */
  async resolve(connectorId) {
    if (!isNonEmptyString(connectorId) || !this._registry.has('connector', connectorId)) {
      throw new ConnectorError('MAK-L3-CONNECTOR-002', `Unknown connector: ${connectorId}`);
    }
    const record = this._registry.resolve('connector', connectorId);
    const manifest = { connectorId, ...(record?.payload ?? {}) };
    return this.load(manifest);
  }

  /**
   * @param {string} name
   * @param {Object} [metadata]
   */
  registerOperation(name, metadata = {}) {
    if (!isNonEmptyString(name)) {
      throw new ConnectorError('MAK-L3-CONNECTOR-003', 'registerOperation() requires a non-empty name');
    }
    this._operations.set(name, Object.freeze({ name, ...metadata }));
  }

  /** @param {string} name */
  getOperation(name) {
    if (!this._operations.has(name)) {
      throw new ConnectorError('MAK-L3-CONNECTOR-004', `Unknown connector operation: ${name}`);
    }
    return /** @type {import('../../types/connector.js').ConnectorOperation} */ (this._operations.get(name));
  }

  /**
   * Binds the actual behavior for a connector operation. Adapters are
   * always host-supplied functions — this is the only place a real
   * network/external call may happen, and only outside `core/connector/`
   * (the adapter implementation itself). Never derived from manifest data,
   * never `eval`'d, never dynamically imported.
   * @param {string} connectorId
   * @param {string} operation
   * @param {(payload: unknown, ctx: unknown, connector: import('../../types/connector.js').IConnector) => unknown} adapter
   */
  registerAdapter(connectorId, operation, adapter) {
    if (!isNonEmptyString(connectorId) || !isNonEmptyString(operation)) {
      throw new ConnectorError('MAK-L3-CONNECTOR-003', 'registerAdapter() requires a non-empty connectorId and operation');
    }
    if (typeof adapter !== 'function') {
      throw new ConnectorError('MAK-L3-CONNECTOR-003', `Adapter for connector "${connectorId}" operation "${operation}" must be a function`);
    }
    this._adapters.set(adapterKey(connectorId, operation), adapter);
  }

  /**
   * @param {string} code Permission code, e.g. "http_connector.export".
   * @param {unknown} ctx
   */
  async _checkPermission(code, ctx) {
    if (!this._permissionEngine) return false;
    const idx = code.lastIndexOf('.');
    const resource = idx === -1 ? code : code.slice(0, idx);
    const action = idx === -1 ? 'invoke' : code.slice(idx + 1);
    try {
      return await this._permissionEngine.can(action, resource, ctx);
    } catch {
      return false;
    }
  }
}

/**
 * @param {import('./errors.js').ConnectorErrorCode} code
 * @param {string} message
 * @returns {import('../../types/connector.js').ConnectorResponse}
 */
function errorResult(code, message) {
  return { success: false, error: { code, message } };
}

/**
 * @param {Object} options
 * @param {import('../registry/registryManager.js').RegistryManager} options.registry
 * @param {import('../permission/permissionEngine.js').PermissionEngine} [options.permissionEngine]
 * @param {string[]} [options.operations]
 * @returns {ConnectorEngine}
 */
export function createConnectorEngine(options) {
  return new ConnectorEngine(options);
}

export { ConnectorError };
