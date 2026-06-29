import { createHash } from "node:crypto";

export { MDP_PLATFORM_VERSION_ID, DEFAULT_LOCALE } from "./mdpEntityConstants.js";

export const CRB_VERSION = "mdp-crb-v1";
export const SNAPSHOT_VERSION = "mdp-snapshot-v1";

export const MDP_ENVIRONMENTS = ["development", "qa", "production"];

export const hashPayload = (payload) =>
  createHash("sha256").update(JSON.stringify(payload)).digest("hex");

export const buildBundleId = ({ moduleId, versionId, baseTemplateId }) =>
  `${moduleId}.${baseTemplateId}.${versionId}`;

export const buildSnapshotId = ({ moduleId, versionId, snapshotType }) =>
  `${moduleId}.${versionId}.${snapshotType}.${Date.now()}`;
