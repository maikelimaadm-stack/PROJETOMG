import { STUDIO_EVENT_ARCHITECTURE_VERSION } from "./eventArchitectureConstants.js";
import { registerBusEvent, getBusEventCount } from "./registry/eventBusRegistry.js";
import { STUDIO_BUS_EVENT_CATALOG } from "./catalogs/studioBusEvents.catalog.js";
import { createStudioEventHub } from "./hub/studioEventHub.js";
import { COLLABORATION_EVENT_MANIFESTS } from "./contracts/collaborationEventContract.js";

let bootstrapped = false;
let sharedHub = null;

/**
 * Idempotent bootstrap — registers official events and creates shared Event Hub.
 * @param {object} [options]
 * @param {boolean} [options.createHub=true]
 * @param {object} [options.hubOptions]
 */
export function bootstrapStudioEvents(options = {}) {
  if (bootstrapped) {
    return getStudioEventsSnapshot();
  }

  STUDIO_BUS_EVENT_CATALOG.forEach((def) => registerBusEvent(def.eventId, def, { official: true }));

  COLLABORATION_EVENT_MANIFESTS.forEach((def) =>
    registerBusEvent(def.eventId, def, { official: false })
  );

  if (options.createHub !== false) {
    sharedHub = createStudioEventHub(options.hubOptions ?? {});
  }

  bootstrapped = true;
  return getStudioEventsSnapshot();
}

export function isStudioEventsBootstrapped() {
  return bootstrapped;
}

export function getStudioEventHub() {
  if (!sharedHub) {
    throw new Error("Studio Event Hub not initialized — call bootstrapStudioEvents() first.");
  }
  return sharedHub;
}

export function getStudioEventsSnapshot() {
  return Object.freeze({
    version: STUDIO_EVENT_ARCHITECTURE_VERSION,
    bootstrapped,
    hubReady: sharedHub != null,
    counts: {
      officialEvents: STUDIO_BUS_EVENT_CATALOG.length,
      totalEvents: getBusEventCount(),
      collaborationContracts: COLLABORATION_EVENT_MANIFESTS.length,
    },
  });
}

export default bootstrapStudioEvents;
