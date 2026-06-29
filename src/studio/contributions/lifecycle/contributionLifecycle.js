import {
  CONTRIBUTION_LIFECYCLE_STATES,
  validateContributionMetadata,
} from "../contracts/contributionContracts.js";

/**
 * Official contribution lifecycle — register, enable, disable, unload.
 * No business logic; infrastructure only.
 */
export function createContributionLifecycle({ registry, onTransition }) {
  const applyTransition = (contributionId, nextState, patch = {}) => {
    const entry = registry.get(contributionId);
    if (!entry) throw new Error(`Contribution not found: ${contributionId}`);
    if (!CONTRIBUTION_LIFECYCLE_STATES.includes(nextState)) {
      throw new Error(`Invalid lifecycle state: ${nextState}`);
    }
    const updated = {
      ...entry,
      ...patch,
      lifecycleState: nextState,
      enabled: nextState === "enabled",
    };
    registry.set(contributionId, updated);
    onTransition?.(contributionId, nextState, updated);
    return updated;
  };

  return Object.freeze({
    register(entry) {
      const validation = validateContributionMetadata(entry);
      if (!validation.valid) {
        throw new Error(`Lifecycle register: ${validation.errors.join(" ")}`);
      }
      const registered = Object.freeze({
        ...entry,
        enabled: false,
        lifecycleState: "registered",
      });
      registry.set(entry.contributionId, registered);
      onTransition?.(entry.contributionId, "registered", registered);
      return registered;
    },

    enable(contributionId) {
      return applyTransition(contributionId, "enabled");
    },

    disable(contributionId) {
      return applyTransition(contributionId, "disabled", { enabled: false });
    },

    unregister(contributionId) {
      registry.delete(contributionId);
      onTransition?.(contributionId, "unloaded", null);
      return true;
    },

    unload(contributionId) {
      const entry = registry.get(contributionId);
      if (entry) registry.delete(contributionId);
      onTransition?.(contributionId, "unloaded", null);
      return true;
    },

    setVersion(contributionId, version) {
      const entry = registry.get(contributionId);
      if (!entry) throw new Error(`Contribution not found: ${contributionId}`);
      entry.version = version;
      registry.set(contributionId, entry);
      return entry;
    },

    setCapabilities(contributionId, capabilities) {
      const entry = registry.get(contributionId);
      if (!entry) throw new Error(`Contribution not found: ${contributionId}`);
      entry.capabilities = capabilities;
      registry.set(contributionId, entry);
      return entry;
    },

    setDependencies(contributionId, dependencies) {
      const entry = registry.get(contributionId);
      if (!entry) throw new Error(`Contribution not found: ${contributionId}`);
      entry.dependencies = dependencies;
      registry.set(contributionId, entry);
      return entry;
    },
  });
}

export default createContributionLifecycle;
