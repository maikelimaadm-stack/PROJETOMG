/**
 * Registry Manager — sole official access point to Studio registries (Program 2.1A.7).
 * Wraps foundation registries; no parallel registries allowed.
 */
import {
  registerStudioComponent,
  getStudioComponent,
  listStudioComponents,
  registerStudioProperty,
  getStudioProperty,
  listStudioProperties,
  registerStudioAction,
  getStudioAction,
  listStudioActions,
  registerStudioDesigner,
  getStudioDesigner,
  listStudioDesigners,
  registerStudioCapabilities,
  getStudioCapabilities,
  registerStudioEvent,
  getStudioEvent,
  listStudioEvents,
} from "../../registry/index.js";
import { OFFICIAL_REGISTRY_IDS } from "../contracts/contributionContracts.js";

const registryHandlers = Object.freeze({
  components: {
    register: (key, value) => registerStudioComponent(key, value),
    get: (key) => getStudioComponent(key),
    list: (filter) => listStudioComponents(filter),
  },
  properties: {
    register: (key, value) => registerStudioProperty(key, value),
    get: (key) => getStudioProperty(key),
    list: (filter) => listStudioProperties(filter),
  },
  events: {
    register: (key, value) => registerStudioEvent(key, value),
    get: (key) => getStudioEvent(key),
    list: (filter) => listStudioEvents(filter),
  },
  actions: {
    register: (key, value) => registerStudioAction(key, value),
    get: (key) => getStudioAction(key),
    list: (filter) => listStudioActions(filter),
  },
  capabilities: {
    register: (key, value) => registerStudioCapabilities(key, value),
    get: (key) => getStudioCapabilities(key),
    list: () => [],
  },
  designers: {
    register: (key, value) => registerStudioDesigner({ ...value, designerId: key }),
    get: (key) => getStudioDesigner(key),
    list: () => listStudioDesigners(),
  },
});

const loadedEntries = new Map();

export function createRegistryManager() {
  return Object.freeze({
    listOfficialRegistryIds: () => [...OFFICIAL_REGISTRY_IDS],

    register(registryId, key, value) {
      const handler = registryHandlers[registryId];
      if (!handler) throw new Error(`Unknown official registry: ${registryId}`);
      handler.register(key, value);
      loadedEntries.set(`${registryId}:${key}`, { registryId, key, value });
      return value;
    },

    get(registryId, key) {
      const handler = registryHandlers[registryId];
      if (!handler) throw new Error(`Unknown official registry: ${registryId}`);
      return handler.get(key);
    },

    list(registryId, filter) {
      const handler = registryHandlers[registryId];
      if (!handler) throw new Error(`Unknown official registry: ${registryId}`);
      return handler.list(filter);
    },

    unload(registryId, key) {
      loadedEntries.delete(`${registryId}:${key}`);
      return true;
    },

    validate(registryId, entry) {
      if (!OFFICIAL_REGISTRY_IDS.includes(registryId)) {
        return { valid: false, errors: [`Unknown registry: ${registryId}`] };
      }
      if (!entry || typeof entry !== "object") {
        return { valid: false, errors: ["Entry must be an object."] };
      }
      return { valid: true, errors: [] };
    },

    getLoadedSnapshot() {
      return Object.fromEntries(loadedEntries);
    },
  });
}

let defaultManager = null;

export function getRegistryManager() {
  if (!defaultManager) defaultManager = createRegistryManager();
  return defaultManager;
}

export default getRegistryManager;
