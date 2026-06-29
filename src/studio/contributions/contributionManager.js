import { OFFICIAL_CONTRIBUTION_TYPES } from "./contracts/contributionContracts.js";
import {
  getContributionStore,
  listContributions,
  getContribution,
} from "./store/contributionStore.js";
import { createContributionLifecycle } from "./lifecycle/contributionLifecycle.js";
import { validateContributionEntry, validateContributorId } from "./validators/contributionValidators.js";
import { getRegistryManager } from "./registryManager/registryManager.js";

function buildContributionEntry(contributorId, type, payload, options = {}) {
  const contributionId = payload.contributionId ?? `${contributorId}:${type}:${Date.now()}`;
  return {
    contributionId,
    contributorId,
    type,
    version: options.version ?? "1.0.0",
    capabilities: options.capabilities ?? [],
    dependencies: options.dependencies ?? [],
    enabled: false,
    lifecycleState: "registered",
    payload: Object.freeze({ ...payload, contributionId }),
  };
}

/**
 * Contribution Manager — official public API for designer/plugin contributions.
 */
export function createContributionManager(deps = {}) {
  const store = getContributionStore();
  const registryAdapter = {
    get: (id) => store.get(id),
    set: (id, entry) => store.set(id, Object.freeze({ ...entry })),
    delete: (id) => store.delete(id),
  };
  const registryManager = deps.registryManager ?? getRegistryManager();

  const lifecycle = createContributionLifecycle({
    registry: registryAdapter,
    onTransition: deps.onTransition,
  });

  const registerTyped = (type, contributorId, payload, options = {}) => {
    const contributorCheck = validateContributorId(contributorId);
    if (!contributorCheck.valid) {
      throw new Error(contributorCheck.errors.join(" "));
    }
    const entry = buildContributionEntry(contributorId, type, payload, options);
    const validation = validateContributionEntry({ ...entry, ...entry.payload });
    if (!validation.valid) {
      throw new Error(`Contribution validation failed: ${validation.errors.join(" ")}`);
    }
    lifecycle.register(entry);
    return entry.contributionId;
  };

  return Object.freeze({
    registryManager,

    registerExplorerContribution(contributorId, payload, options) {
      return registerTyped("explorer", contributorId, payload, options);
    },

    registerToolbarContribution(contributorId, payload, options) {
      return registerTyped("toolbar", contributorId, payload, options);
    },

    registerInspectorContribution(contributorId, payload, options) {
      return registerTyped("inspector", contributorId, payload, options);
    },

    registerCommandContribution(contributorId, payload, options) {
      return registerTyped("command", contributorId, payload, options);
    },

    registerContextMenuContribution(contributorId, payload, options) {
      return registerTyped("contextMenu", contributorId, payload, options);
    },

    registerDockContribution(contributorId, payload, options) {
      return registerTyped("dock", contributorId, payload, options);
    },

    registerPropertyContribution(contributorId, payload, options) {
      return registerTyped("property", contributorId, payload, options);
    },

    enable: (id) => lifecycle.enable(id),
    disable: (id) => lifecycle.disable(id),
    unregister: (id) => lifecycle.unregister(id),
    unload: (id) => lifecycle.unload(id),
    setVersion: (id, v) => lifecycle.setVersion(id, v),
    setCapabilities: (id, caps) => lifecycle.setCapabilities(id, caps),
    setDependencies: (id, deps) => lifecycle.setDependencies(id, deps),

    getContribution,
    listContributions,

    /** Marketplace readiness — register all contributions from a .makpkg manifest */
    registerPackageContributions(manifest) {
      if (!manifest?.packageId || !Array.isArray(manifest.contributions)) {
        throw new Error("Invalid makpkg manifest.");
      }
      const ids = [];
      manifest.contributions.forEach(({ type, contribution }) => {
        if (!OFFICIAL_CONTRIBUTION_TYPES.includes(type)) return;
        const method = {
          explorer: "registerExplorerContribution",
          toolbar: "registerToolbarContribution",
          inspector: "registerInspectorContribution",
          command: "registerCommandContribution",
          contextMenu: "registerContextMenuContribution",
          dock: "registerDockContribution",
          property: "registerPropertyContribution",
        }[type];
        ids.push(
          this[method](manifest.packageId, contribution, { version: manifest.version })
        );
      });
      return ids;
    },
  });
}

let defaultManager = null;

export function getContributionManager() {
  if (!defaultManager) defaultManager = createContributionManager();
  return defaultManager;
}

export default getContributionManager;
