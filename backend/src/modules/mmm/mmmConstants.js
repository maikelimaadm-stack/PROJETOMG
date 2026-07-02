import { createHash } from "node:crypto";

export const MMM_ENVELOPE_VERSION = "mmm-envelope-v1";
export const MMM_API_VERSION = "mmm-api-v1";
export const MMM_SPEC_VERSION = "1.0.0";
export const PLATFORM_SCHEMA_COUNT = 226;

export const FORBIDDEN_PAYLOAD_KEYS = ["__proto__", "constructor", "prototype"];

export const DIRECT_PUBLISH_STATUSES = new Set(["published", "active"]);

export const hashEnvelopeContent = (payload, objectType, revision) =>
  createHash("sha256")
    .update(JSON.stringify({ payload, objectType, revision }))
    .digest("hex");

export const hashSnapshotEnvelope = (envelope) =>
  createHash("sha256").update(JSON.stringify(envelope)).digest("hex");

export const buildSnapshotId = (objectId, revision) =>
  `mmm-snap-${objectId}-r${revision}`;
