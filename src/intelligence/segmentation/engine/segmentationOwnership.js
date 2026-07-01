import { SEGMENTATION_OWNERSHIP } from "./segmentationEngineContracts.js";

export function assertSegmentationOwnership(record) {
  return Object.freeze({
    ...SEGMENTATION_OWNERSHIP,
    recordId: record.profileId ?? record.classificationId ?? record.templateId,
    tenantId: record.tenantId,
    verifiedAt: new Date().toISOString(),
  });
}

export default assertSegmentationOwnership;
