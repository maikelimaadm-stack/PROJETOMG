/** MAK Studio Event Architecture — Program 2.0.7 constants. */

export const STUDIO_EVENT_ARCHITECTURE_VERSION = "mak-studio-events-v1";

export const EVENT_MANIFEST_SCHEMA_VERSION = "studio-event-manifest-v1";

/** Official Studio Event Hub categories. */
export const EVENT_CATEGORIES = Object.freeze([
  "workspace",
  "layout",
  "component",
  "property",
  "runtime",
  "publish",
  "preview",
  "dock",
  "theme",
  "accessibility",
  "ai",
  "marketplace",
  "collaboration",
  "plugin",
]);

/** Event priority levels for dispatch ordering. */
export const EVENT_PRIORITIES = Object.freeze(["low", "normal", "high", "critical"]);

/** Scope keys for scoped event delivery. */
export const EVENT_SCOPE_KEYS = Object.freeze(["moduleId", "designerId", "workspaceId", "sessionId"]);

/** Lifecycle events emitted by the Event Hub itself. */
export const HUB_LIFECYCLE_EVENTS = Object.freeze([
  "hub.ready",
  "hub.destroy",
  "hub.scope.changed",
]);

/** Official designer IDs that share the same event bus. */
export const OFFICIAL_DESIGNER_IDS = Object.freeze([
  "layout",
  "workflow",
  "dashboard",
  "automation",
  "process",
  "integration",
  "ai",
  "field",
  "validation",
]);

/** Collaboration event contracts (future — no implementation). */
export const COLLABORATION_EVENT_IDS = Object.freeze([
  "collaboration.presence.joined",
  "collaboration.presence.left",
  "collaboration.cursor.moved",
  "collaboration.edit.started",
  "collaboration.edit.ended",
  "collaboration.sync.requested",
]);
