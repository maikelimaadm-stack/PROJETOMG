import { classifyOperationalSegment } from "./segmentationClassifiers.js";
import { registerSegmentationRules } from "./segmentationRules.js";

export function buildSegmentationProfile(ctx) {
  registerSegmentationRules(ctx.tenantId);
  return classifyOperationalSegment(ctx);
}

export default buildSegmentationProfile;
