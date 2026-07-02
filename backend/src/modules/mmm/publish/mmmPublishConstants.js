import { createHash, createHmac } from "node:crypto";

export const MMM_CRB_VERSION = "mmm-crb-v1";
export const MMM_PUBLISH_PIPELINE_VERSION = "mmm-publish-v1";
export const MMM_SIGNATURE_VERSION = "mmm-sig-v1";
export const MMM_SNAPSHOT_VERSION = "mmm-snapshot-v1";
export const DEFAULT_BASE_TEMPLATE_ID = "modelobase1";

export const PUBLISH_PHASES = [
  "C-1",
  "C-2",
  "C-3",
  "C-4",
  "C-5",
  "C-6",
  "C-7",
  "C-8",
  "C-9",
  "C-10",
  "C-11",
  "C-12",
  "C-13",
  "C-14",
  "C-15",
  "C-16",
];

export const REGISTRY_TYPE_MAP = {
  layout: "layout",
  view: "layout",
  form: "layout",
  section: "layout",
  panel: "layout",
  tab: "layout",
  group: "layout",
  field: "field",
  field_config: "field",
  validation: "validation",
  formula: "formula",
  event: "event",
  action: "action",
  workflow: "workflow",
  permission: "permission",
  base_template: "baseTemplate",
  template: "baseTemplate",
  dashboard: "layout",
  report: "layout",
  pivot_table: "layout",
};

export const hashPayload = (payload) =>
  createHash("sha256").update(JSON.stringify(payload)).digest("hex");

export const buildBundleId = ({ tenantId, moduleId, definitionVersionId, baseTemplateId }) =>
  `${tenantId}.${moduleId}.${baseTemplateId}.${definitionVersionId}`;

export const buildPublishSnapshotId = ({ moduleId, definitionVersionId, snapshotType }) =>
  `mmm-pub-snap-${moduleId}-${definitionVersionId}-${snapshotType}-${Date.now()}`;

export const signIntegrityHash = (integrityHash) => {
  const key = process.env.MMM_SIGNING_KEY || process.env.JWT_SECRET || "mmm-dev-signing-key";
  const signature = createHmac("sha256", key).update(integrityHash).digest("hex");
  return `${MMM_SIGNATURE_VERSION}:${signature}`;
};

export const verifySignature = (integrityHash, signatureRef) => {
  if (!signatureRef?.startsWith(`${MMM_SIGNATURE_VERSION}:`)) return false;
  const expected = signIntegrityHash(integrityHash);
  return expected === signatureRef;
};
