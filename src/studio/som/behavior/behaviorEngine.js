/** Behavior Engine — triggers, conditions, actions, execution policies (Program 2.2.6) */

export const BEHAVIOR_ENGINE_VERSION = "mak-som-behavior-v1";

export function createBehaviorEngine() {
  /** @type {Map<string, { id: string, validate?: Function }>} */
  const policies = new Map();
  /** @type {Map<string, { id: string, event: string }>} */
  const triggers = new Map();
  /** @type {Map<string, { id: string, kind: string }>} */
  const actions = new Map();

  const registerBehaviorPolicy = ({ id, validate }) => {
    if (!id) throw new Error("Behavior policy requires id.");
    policies.set(id, { id, validate });
    return id;
  };

  const registerTrigger = ({ id, event }) => {
    if (!id || !event) throw new Error("Trigger requires id and event.");
    triggers.set(id, { id, event });
    return id;
  };

  const registerAction = ({ id, kind }) => {
    if (!id || !kind) throw new Error("Action requires id and kind.");
    actions.set(id, { id, kind });
    return id;
  };

  const normalizeBehavior = (behavior) =>
    Object.freeze({
      behaviorId: behavior.behaviorId ?? behavior.id ?? `behavior.${Date.now()}`,
      trigger: behavior.trigger ?? behavior.triggerKind ?? "custom",
      conditions: Object.freeze(behavior.conditions ?? []),
      actions: Object.freeze(behavior.actions ?? []),
      policy: behavior.policy ?? "sequential",
      enabled: behavior.enabled !== false,
      metadata: Object.freeze({ ...(behavior.metadata ?? {}) }),
    });

  const normalizeAll = (behaviors = []) =>
    Object.freeze((behaviors ?? []).map((b) => normalizeBehavior(b)));

  const validateBehavior = (behavior) => {
    const normalized = normalizeBehavior(behavior);
    const errors = [];
    if (!normalized.trigger) errors.push("Behavior requires trigger.");
    if (!normalized.actions.length) errors.push("Behavior requires at least one action.");
    const policy = policies.get(normalized.policy);
    if (policy?.validate) errors.push(...(policy.validate(normalized) ?? []));
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), behavior: normalized });
  };

  const validateAll = (behaviors = []) => {
    const errors = [];
    (behaviors ?? []).forEach((b) => {
      const result = validateBehavior(b);
      if (!result.ok) errors.push(...result.errors);
    });
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
  };

  const evaluateBehavior = (behavior, context = {}) => {
    const result = validateBehavior(behavior);
    if (!result.ok) return Object.freeze({ ok: false, errors: result.errors });
    return Object.freeze({
      ok: true,
      behavior: result.behavior,
      plan: Object.freeze({
        trigger: result.behavior.trigger,
        actionCount: result.behavior.actions.length,
        policy: result.behavior.policy,
        context: Object.freeze({ ...context }),
      }),
    });
  };

  return Object.freeze({
    version: BEHAVIOR_ENGINE_VERSION,
    registerBehaviorPolicy,
    registerTrigger,
    registerAction,
    normalizeBehavior,
    normalizeAll,
    validateBehavior,
    validateAll,
    evaluateBehavior,
    listPolicies: () => [...policies.keys()],
  });
}

export default createBehaviorEngine;
