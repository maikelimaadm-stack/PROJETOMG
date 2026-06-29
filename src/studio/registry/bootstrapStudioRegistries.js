import { STUDIO_REGISTRY_VERSION } from "../sdk/studioSdkConstants.js";
import { registerStudioComponent } from "./componentRegistry.js";
import { registerStudioProperty } from "./propertyRegistry.js";
import { registerStudioEvent } from "./eventRegistry.js";
import { registerStudioAction } from "./actionRegistry.js";
import { registerStudioCapabilities } from "./capabilityRegistry.js";
import { STUDIO_COMPONENT_CATALOG } from "./catalogs/studioComponents.catalog.js";
import { STUDIO_PROPERTY_CATALOG } from "./catalogs/studioProperties.catalog.js";
import { STUDIO_EVENT_CATALOG } from "./catalogs/studioEvents.catalog.js";
import { STUDIO_ACTION_CATALOG } from "./catalogs/studioActions.catalog.js";
import { STUDIO_CAPABILITY_CATALOG } from "./catalogs/studioCapabilities.catalog.js";

let bootstrapped = false;

/** Idempotent bootstrap of official Studio registries. */
export function bootstrapStudioRegistries() {
  if (bootstrapped) {
    return getStudioRegistrySnapshot();
  }

  STUDIO_COMPONENT_CATALOG.forEach((def) => registerStudioComponent(def.componentId, def));
  STUDIO_PROPERTY_CATALOG.forEach((def) => registerStudioProperty(def.propertyId, def));
  STUDIO_EVENT_CATALOG.forEach((def) => registerStudioEvent(def.eventId, def));
  STUDIO_ACTION_CATALOG.forEach((def) => registerStudioAction(def.actionId, def));
  STUDIO_CAPABILITY_CATALOG.forEach((def) =>
    registerStudioCapabilities(def.designerId, def.capabilityIds, { label: def.label })
  );

  bootstrapped = true;
  return getStudioRegistrySnapshot();
}

export function isStudioRegistryBootstrapped() {
  return bootstrapped;
}

export function getStudioRegistrySnapshot() {
  return Object.freeze({
    version: STUDIO_REGISTRY_VERSION,
    bootstrapped,
    counts: {
      components: STUDIO_COMPONENT_CATALOG.length,
      properties: STUDIO_PROPERTY_CATALOG.length,
      events: STUDIO_EVENT_CATALOG.length,
      actions: STUDIO_ACTION_CATALOG.length,
      designers: STUDIO_CAPABILITY_CATALOG.length,
    },
  });
}

export default bootstrapStudioRegistries;
