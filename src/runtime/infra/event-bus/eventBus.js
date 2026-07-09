import { EventBusError } from './errors.js';

/** Hard caps — guard against pathological registration/emission patterns. */
const MAX_HANDLERS_PER_EVENT = 100;
const MAX_EVENT_TYPES = 200;
const MAX_PAYLOAD_DEPTH = 8;
const MAX_REENTRANCY_DEPTH = 5;

/** Never allowed as a nested key inside a payload — prototype-pollution guard. */
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** @param {unknown} value */
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

/** @param {unknown} eventType */
function validateEventType(eventType) {
  if (typeof eventType !== 'string' || eventType.length === 0) {
    throw new EventBusError('MAK-L3-EVENTBUS-002', 'Event type must be a non-empty string');
  }
}

/** @param {unknown} handler */
function validateHandler(handler) {
  if (typeof handler !== 'function') {
    throw new EventBusError('MAK-L3-EVENTBUS-003', 'Handler must be a function');
  }
}

/**
 * @param {unknown} payload
 * @param {number} depth
 */
function validatePayloadShape(payload, depth) {
  if (depth > MAX_PAYLOAD_DEPTH) {
    throw new EventBusError('MAK-L3-EVENTBUS-004', `Event payload exceeds maximum depth (${MAX_PAYLOAD_DEPTH})`);
  }
  if (Array.isArray(payload)) {
    for (const item of payload) validatePayloadShape(item, depth + 1);
    return;
  }
  if (isPlainObject(payload)) {
    for (const key of Object.keys(payload)) {
      if (BLOCKED_KEYS.has(key)) {
        throw new EventBusError('MAK-L3-EVENTBUS-004', `Event payload contains a forbidden key: "${key}"`);
      }
      validatePayloadShape(/** @type {Record<string, unknown>} */ (payload)[key], depth + 1);
    }
  }
}

/**
 * Event Bus (M22) — in-process, deterministic pub/sub stub (D-RI-08).
 * Handlers execute in registration order; a failing handler is captured
 * per-handler in the `emit()` result and never interrupts sibling
 * handlers. No broker, no WebSocket, no BroadcastChannel, no
 * worker/thread — production DB-backed transport is Foundation F.
 * @implements {import('../../types/event-bus.js').IEventBus}
 */
export class EventBus {
  constructor() {
    /** @type {Map<string, {id: number, handler: Function, once: boolean}[]>} */
    this._listeners = new Map();
    /** @type {Map<string, number>} */
    this._emitDepth = new Map();
    /** @type {WeakSet<Function>} Tags closures returned by `on()`/`once()` so `off()` can accept either form. */
    this._unsubscribeFns = new WeakSet();
    this._nextId = 1;
  }

  /**
   * @param {string} eventType
   * @param {import('../../types/event-bus.js').EventHandler} handler
   * @param {Object} [options]
   * @param {boolean} [options.once]
   * @returns {import('../../types/event-bus.js').Unsubscribe}
   */
  on(eventType, handler, options = {}) {
    validateEventType(eventType);
    validateHandler(handler);

    let list = this._listeners.get(eventType);
    if (!list) {
      if (this._listeners.size >= MAX_EVENT_TYPES) {
        throw new EventBusError('MAK-L3-EVENTBUS-005', `Too many distinct event types registered (> ${MAX_EVENT_TYPES})`);
      }
      list = [];
      this._listeners.set(eventType, list);
    }
    if (list.length >= MAX_HANDLERS_PER_EVENT) {
      throw new EventBusError('MAK-L3-EVENTBUS-005', `Too many handlers for event "${eventType}" (> ${MAX_HANDLERS_PER_EVENT})`);
    }

    const id = this._nextId++;
    list.push({ id, handler, once: Boolean(options.once) });
    const unsubscribe = () => this._removeById(eventType, id);
    this._unsubscribeFns.add(unsubscribe);
    return unsubscribe;
  }

  /**
   * @param {string} eventType
   * @param {import('../../types/event-bus.js').EventHandler} handler
   * @param {Object} [options]
   * @returns {import('../../types/event-bus.js').Unsubscribe}
   */
  once(eventType, handler, options = {}) {
    return this.on(eventType, handler, { ...options, once: true });
  }

  /**
   * @param {string} eventType
   * @param {Function} handlerOrSubscription A previously registered handler function, or an
   *   unsubscribe function returned by `on()`/`once()` (invoked directly if it is one).
   */
  off(eventType, handlerOrSubscription) {
    validateEventType(eventType);
    if (typeof handlerOrSubscription !== 'function') return;
    if (this._unsubscribeFns.has(handlerOrSubscription)) {
      handlerOrSubscription();
      return;
    }
    const list = this._listeners.get(eventType);
    if (!list) return;
    const idx = list.findIndex((entry) => entry.handler === handlerOrSubscription);
    if (idx !== -1) list.splice(idx, 1);
  }

  /**
   * Runs every handler registered for `eventType`, in registration order.
   * Each handler's outcome (success/value or captured error) is reported
   * independently — a throwing handler never prevents the next one from
   * running. Guards against unbounded reentrant emission of the same
   * event type from within one of its own handlers.
   * @param {string} eventType
   * @param {unknown} payload
   * @param {unknown} [ctx]
   * @returns {Promise<import('../../types/event-bus.js').EmitResult>}
   */
  async emit(eventType, payload, ctx) {
    validateEventType(eventType);
    validatePayloadShape(payload, 0);

    const depth = this._emitDepth.get(eventType) ?? 0;
    if (depth >= MAX_REENTRANCY_DEPTH) {
      throw new EventBusError('MAK-L3-EVENTBUS-006', `Reentrant emit() depth exceeded for event "${eventType}" (> ${MAX_REENTRANCY_DEPTH})`);
    }
    this._emitDepth.set(eventType, depth + 1);

    try {
      const list = this._listeners.get(eventType) ?? [];
      const snapshot = [...list];
      /** @type {import('../../types/event-bus.js').EventHandlerOutcome[]} */
      const results = [];

      for (const entry of snapshot) {
        try {
          const value = await entry.handler(payload, ctx);
          results.push({ handlerId: String(entry.id), success: true, value });
        } catch (err) {
          results.push({
            handlerId: String(entry.id),
            success: false,
            error: { message: err instanceof Error ? err.message : 'Event handler failed' },
          });
        }
        if (entry.once) this._removeById(eventType, entry.id);
      }

      return { eventType, handlerCount: snapshot.length, results };
    } finally {
      const current = this._emitDepth.get(eventType) ?? 1;
      if (current <= 1) this._emitDepth.delete(eventType);
      else this._emitDepth.set(eventType, current - 1);
    }
  }

  /**
   * SSOT-literal (`IEventBus.publish`) — wraps `emit()`, discarding the
   * per-handler result breakdown to match the `Promise<void>` contract.
   * @param {import('../../types/event-bus.js').UecEvent} event
   * @param {unknown} ctx
   */
  async publish(event, ctx) {
    if (!event || typeof event !== 'object' || typeof event.type !== 'string') {
      throw new EventBusError('MAK-L3-EVENTBUS-002', 'publish() requires a UecEvent with a "type"');
    }
    await this.emit(event.type, event.payload, ctx);
  }

  /**
   * SSOT-literal (`IEventBus.subscribe`) — alias of `on()`.
   * @param {string} eventType
   * @param {import('../../types/event-bus.js').EventHandler} handler
   * @returns {import('../../types/event-bus.js').Unsubscribe}
   */
  subscribe(eventType, handler) {
    return this.on(eventType, handler);
  }

  /** @param {string} [eventType] */
  clear(eventType) {
    if (eventType === undefined) {
      this._listeners.clear();
      return;
    }
    validateEventType(eventType);
    this._listeners.delete(eventType);
  }

  /** @param {string} [eventType] */
  listenerCount(eventType) {
    if (eventType === undefined) {
      let total = 0;
      for (const list of this._listeners.values()) total += list.length;
      return total;
    }
    validateEventType(eventType);
    return this._listeners.get(eventType)?.length ?? 0;
  }

  /** @param {string} eventType @param {number} id */
  _removeById(eventType, id) {
    const list = this._listeners.get(eventType);
    if (!list) return;
    const idx = list.findIndex((entry) => entry.id === id);
    if (idx !== -1) list.splice(idx, 1);
  }
}

/**
 * @returns {EventBus}
 */
export function createEventBus() {
  return new EventBus();
}

export { EventBusError };
