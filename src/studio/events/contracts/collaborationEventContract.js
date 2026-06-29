import { COLLABORATION_EVENT_IDS } from "../eventArchitectureConstants.js";
import { defineEventManifest } from "../contracts/eventManifestContract.js";

/**
 * Future Collaboration contracts — architecture only, no implementation.
 * Prepared for realtime sync, presence, and multi-user editing.
 */

export const COLLABORATION_EVENT_MANIFESTS = COLLABORATION_EVENT_IDS.map((eventId) => {
  const name = eventId.split(".").slice(-1)[0];
  return defineEventManifest({
    eventId,
    name,
    category: "collaboration",
    description: `Future collaboration event: ${eventId}`,
    payload: { sessionId: "string", userId: "string", source: "string" },
    origin: "collaboration",
    consumers: ["shell", "workspace", "designer"],
    priority: "normal",
    version: "0.1.0",
    documentation: { status: "planned", summary: "Not implemented — contract only." },
    compatibility: { minHubVersion: "mak-studio-events-v1", status: "future" },
    notes: ["Reserved for Program 3.x Collaboration Studio."],
  });
});

/**
 * @param {ReturnType<import("../hub/studioEventHub.js").createStudioEventHub>} hub
 */
export function createCollaborationEventContract(hub) {
  return Object.freeze({
    eventIds: [...COLLABORATION_EVENT_IDS],
    manifests: COLLABORATION_EVENT_MANIFESTS,
    /** Placeholder — will wire WebSocket/sync in future mission. */
    isEnabled: () => false,
    publishPresence: () => {
      throw new Error("Collaboration not implemented — use contracts only.");
    },
    hub,
  });
}

export default createCollaborationEventContract;
