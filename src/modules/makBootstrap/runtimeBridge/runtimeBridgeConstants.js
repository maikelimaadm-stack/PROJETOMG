/** Runtime Bridge — Program 1E Phase 1 constants (bootstrap layer only). */

export const RUNTIME_BRIDGE_VERSION = "runtime-bridge-v1";
export const CRB_VERSION = "mdp-crb-v1";
export const RUNTIME_BRIDGE_CACHE_VERSION = "runtime-bridge-cache-v1";

/** Pilot modules hydrated exclusively from published CRBs when cache/API is available. */
export const RUNTIME_BRIDGE_PILOT_MODULES = Object.freeze(["empresas"]);

export const DEFAULT_BASE_TEMPLATE_ID = "modelobase1";
export const DEFAULT_ENVIRONMENT = "production";
export const DEFAULT_LOCALE = "pt-BR";

export const CRB_CACHE_PATH = "/config/mdp-compiled-bundle.cache.json";
export const CRB_EXPORT_PATH = "/config/mdp-compiled-bundle.export.json";

export const RUNTIME_BRIDGE_RELOAD_EVENT = "runtime-bridge:reloaded";
export const RUNTIME_BRIDGE_HYDRATED_EVENT = "runtime-bridge:hydrated";

/** Registry entry types consumed by Foundation config engines V13–V20. */
export const CRB_ENGINE_ENTRY_TYPES = Object.freeze([
  "layout",
  "field_config",
  "validation",
  "formula",
  "event",
  "action",
  "workflow",
]);
