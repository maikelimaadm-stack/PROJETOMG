import { SEGMENTATION_OWNERSHIP } from "./segmentationEngineContracts.js";

export function assertTemplateOwnership(template) {
  return Object.freeze({
    ...SEGMENTATION_OWNERSHIP,
    templateId: template.templateId,
    belongsToStudio: false,
    belongsToScreen: false,
    verifiedAt: new Date().toISOString(),
  });
}

export default assertTemplateOwnership;
