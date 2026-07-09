/**
 * @typedef {Object} ConnectorManifest
 * @property {string} connectorId
 * @property {string} [version]
 * @property {boolean} [enabled] Defaults to true when omitted.
 * @property {string[]} [operations] Operation names this connector is allowed to invoke. Defaults to [].
 * @property {string} [permission] Permission code delegated to M09 before any operation executes.
 */

/**
 * @typedef {Object} IConnector Loaded, frozen, normalized connector — never the raw manifest.
 * @property {string} connectorId
 * @property {string} [version]
 * @property {boolean} enabled
 * @property {string[]} operations
 * @property {string} [permission]
 */

/**
 * @typedef {Object} ConnectorOperation Host-declared, known operation name ("Host Adapter Registry" entry).
 * @property {string} name
 */

/**
 * @typedef {Object} ConnectorRequest
 * @property {string} operation
 * @property {unknown} [payload]
 */

/**
 * @typedef {Object} ConnectorResponse
 * @property {boolean} success
 * @property {unknown} [data]
 * @property {{code: string, message: string}} [error]
 */

/**
 * Connector Engine (M19) — registry-driven, deterministic, fail-safe
 * integration layer. Never calls a real network/external system from
 * within `core/connector/`: the actual transport (HTTP, DB, message queue,
 * etc.) always lives in a host-registered adapter function
 * (`registerAdapter`) — never `eval`'d, never dynamically imported, never
 * invoked via a direct `fetch()` inside this module.
 * @typedef {Object} IConnectorEngine
 * @property {(connectorId: string, request: ConnectorRequest, ctx: unknown) => Promise<ConnectorResponse>} invoke
 */

export {};
