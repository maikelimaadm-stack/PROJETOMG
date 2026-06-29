import { HUB_LIFECYCLE_EVENTS, EVENT_SCOPE_KEYS } from "../eventArchitectureConstants.js";
import { getBusEvent } from "../registry/eventBusRegistry.js";
import { validateEventPayload } from "../contracts/eventPayloadContracts.js";

let subscriptionCounter = 0;

const nextSubscriptionId = () => {
  subscriptionCounter += 1;
  return `sub-${subscriptionCounter}`;
};

const scopeMatches = (subscriptionScope, eventScope) => {
  if (!subscriptionScope || Object.keys(subscriptionScope).length === 0) return true;
  return EVENT_SCOPE_KEYS.every((key) => {
    if (subscriptionScope[key] == null) return true;
    return subscriptionScope[key] === eventScope[key];
  });
};

/**
 * Official MAK Studio Event Hub — publish/subscribe bus for internal Studio modules.
 * @param {object} [options]
 * @param {object} [options.defaultScope]
 * @param {boolean} [options.strictPayload=true] — validate payloads against contracts
 */
export function createStudioEventHub(options = {}) {
  const strictPayload = options.strictPayload !== false;
  const subscriptions = new Map();
  const lifecycleListeners = new Set();
  let defaultScope = { ...(options.defaultScope ?? {}) };
  let destroyed = false;

  const assertActive = () => {
    if (destroyed) throw new Error("Studio Event Hub has been destroyed.");
  };

  const getSubscribers = (eventId) => {
    if (!subscriptions.has(eventId)) subscriptions.set(eventId, new Set());
    return subscriptions.get(eventId);
  };

  const dispatch = (eventId, envelope) => {
    const subs = [...getSubscribers(eventId)];
    subs.sort((a, b) => {
      const order = { critical: 0, high: 1, normal: 2, low: 3 };
      return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
    });

    subs.forEach((sub) => {
      if (!scopeMatches(sub.scope, envelope.scope)) return;
      sub.handler(envelope);
      if (sub.once) getSubscribers(eventId).delete(sub);
    });

    if (HUB_LIFECYCLE_EVENTS.includes(eventId)) {
      lifecycleListeners.forEach((listener) => listener(envelope));
    }
  };

  const publish = (eventId, payload = {}, publishOptions = {}) => {
    assertActive();
    const definition = getBusEvent(eventId);
    if (!definition) {
      throw new Error(`publish: unregistered event "${eventId}". All events must be in Event Registry.`);
    }
    if (strictPayload) {
      const validation = validateEventPayload(eventId, payload);
      if (!validation.valid) {
        throw new Error(`publish: invalid payload for ${eventId}: ${validation.errors.join(" ")}`);
      }
    }

    const envelope = Object.freeze({
      eventId,
      payload: Object.freeze({ ...payload }),
      scope: Object.freeze({ ...defaultScope, ...(publishOptions.scope ?? {}) }),
      timestamp: new Date().toISOString(),
      meta: Object.freeze({
        category: definition.category,
        origin: publishOptions.origin ?? definition.origin,
        version: definition.version,
      }),
    });

    dispatch(eventId, envelope);
    return envelope;
  };

  const subscribe = (eventId, handler, subOptions = {}) => {
    assertActive();
    if (!getBusEvent(eventId)) {
      throw new Error(`subscribe: unregistered event "${eventId}".`);
    }
    if (typeof handler !== "function") {
      throw new Error("subscribe: handler must be a function.");
    }

    const sub = {
      id: nextSubscriptionId(),
      eventId,
      handler,
      scope: { ...(subOptions.scope ?? {}) },
      priority: subOptions.priority ?? "normal",
      once: false,
    };
    getSubscribers(eventId).add(sub);
    return sub.id;
  };

  const once = (eventId, handler, subOptions = {}) => {
    const id = subscribe(eventId, handler, subOptions);
    const subs = getSubscribers(eventId);
    const sub = [...subs].find((s) => s.id === id);
    if (sub) sub.once = true;
    return id;
  };

  const unsubscribe = (subscriptionId) => {
    assertActive();
    for (const subs of subscriptions.values()) {
      for (const sub of subs) {
        if (sub.id === subscriptionId) {
          subs.delete(sub);
          return true;
        }
      }
    }
    return false;
  };

  const broadcast = (category, eventId, payload = {}, broadcastOptions = {}) => {
    assertActive();
    const definition = getBusEvent(eventId);
    if (!definition) throw new Error(`broadcast: unregistered event "${eventId}".`);
    if (definition.category !== category) {
      throw new Error(`broadcast: event ${eventId} category mismatch (expected ${category}).`);
    }
    return publish(eventId, payload, broadcastOptions);
  };

  const setScope = (scopePatch = {}) => {
    assertActive();
    defaultScope = { ...defaultScope, ...scopePatch };
    dispatch("hub.scope.changed", {
      eventId: "hub.scope.changed",
      payload: Object.freeze({ scope: { ...defaultScope } }),
      scope: Object.freeze({ ...defaultScope }),
      timestamp: new Date().toISOString(),
      meta: Object.freeze({ category: "workspace", origin: "hub", version: "1.0.0" }),
    });
    return Object.freeze({ ...defaultScope });
  };

  const getScope = () => Object.freeze({ ...defaultScope });

  const onLifecycle = (listener) => {
    lifecycleListeners.add(listener);
    return () => lifecycleListeners.delete(listener);
  };

  const destroy = () => {
    destroyed = true;
    subscriptions.clear();
    lifecycleListeners.clear();
    dispatch("hub.destroy", {
      eventId: "hub.destroy",
      payload: Object.freeze({}),
      scope: Object.freeze({}),
      timestamp: new Date().toISOString(),
      meta: Object.freeze({ category: "workspace", origin: "hub", version: "1.0.0" }),
    });
  };

  dispatch("hub.ready", {
    eventId: "hub.ready",
    payload: Object.freeze({ version: "mak-studio-events-v1" }),
    scope: Object.freeze({ ...defaultScope }),
    timestamp: new Date().toISOString(),
    meta: Object.freeze({ category: "workspace", origin: "hub", version: "1.0.0" }),
  });

  return Object.freeze({
    publish,
    subscribe,
    unsubscribe,
    once,
    broadcast,
    setScope,
    getScope,
    onLifecycle,
    destroy,
  });
}

export default createStudioEventHub;
