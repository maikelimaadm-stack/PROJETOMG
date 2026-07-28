import { RESOURCE_LIMITS } from './builderConfig.js';
import { makeIssue } from './normalizeIssues.js';
import { hasPrototypePollutionKey } from './prototypePollutionGuard.js';
const STAGE = 'source_target_descriptor_validation';
const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
  && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
// Exposure flags that must be inert inside the target descriptor.
const FORBIDDEN_TARGET_TRUE = Object.freeze(['previewMounted', 'routeCreated', 'menuCreated', 'productExposed', 'realDataAttached', 'moduleGenerated', 'persistenceAllowed']);
/** Deeply validates the target descriptor: plain object, non-empty, within limits, inert, no pollution. */
export function validateTargetDescriptor(source) {
  const issues = [];
  const td = source.targetDescriptor;
  if (!isPlain(td)) { issues.push(makeIssue('BUILDER_TARGET_DESCRIPTOR_REQUIRED', STAGE)); return issues; }
  const keys = Object.keys(td);
  if (keys.length === 0) issues.push(makeIssue('BUILDER_TARGET_DESCRIPTOR_REQUIRED', STAGE));
  if (keys.length > RESOURCE_LIMITS.maxTargetDescriptorFields) issues.push(makeIssue('BUILDER_LIMIT_EXCEEDED', STAGE));
  if (hasPrototypePollutionKey(td)) issues.push(makeIssue('BUILDER_PROTOTYPE_POLLUTION_KEY_FORBIDDEN', STAGE));
  for (const f of FORBIDDEN_TARGET_TRUE) { if (td[f] === true) issues.push(makeIssue('BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', STAGE)); }
  return issues;
}
export default validateTargetDescriptor;
