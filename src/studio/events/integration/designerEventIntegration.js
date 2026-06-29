import { OFFICIAL_DESIGNER_IDS } from "../eventArchitectureConstants.js";

/**
 * Designer Event Integration — all official designers share the same Event Hub.
 * @param {ReturnType<import("../hub/studioEventHub.js").createStudioEventHub>} hub
 * @param {object} designer
 * @param {string} designer.designerId
 */

export function validateDesignerEventBridge(designer) {
  const errors = [];
  if (!designer?.designerId) errors.push("designerId is required.");
  return { valid: errors.length === 0, errors };
}

/**
 * @param {ReturnType<import("../hub/studioEventHub.js").createStudioEventHub>} hub
 * @param {object} designer
 */
export function createDesignerEventBridge(hub, designer) {
  const validation = validateDesignerEventBridge(designer);
  if (!validation.valid) {
    throw new Error(`createDesignerEventBridge: ${validation.errors.join(" ")}`);
  }

  const designerOrigin = `designer:${designer.designerId}`;
  const isOfficial = OFFICIAL_DESIGNER_IDS.includes(designer.designerId);

  return Object.freeze({
    designerId: designer.designerId,
    isOfficialDesigner: isOfficial,
    publish: (eventId, payload, options = {}) => {
      hub.setScope({ designerId: designer.designerId, ...(options.scope ?? {}) });
      return hub.publish(eventId, payload, { ...options, origin: options.origin ?? designerOrigin });
    },
    subscribe: (eventId, handler, options = {}) =>
      hub.subscribe(eventId, handler, {
        ...options,
        scope: { designerId: designer.designerId, ...(options.scope ?? {}) },
      }),
    once: (eventId, handler, options = {}) =>
      hub.once(eventId, handler, {
        ...options,
        scope: { designerId: designer.designerId, ...(options.scope ?? {}) },
      }),
    unsubscribe: (subscriptionId) => hub.unsubscribe(subscriptionId),
  });
}

export default createDesignerEventBridge;
