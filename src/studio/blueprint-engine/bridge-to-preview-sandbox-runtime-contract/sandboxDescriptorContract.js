import {
  REAL_PREVIEW_SANDBOX_CONTRACT_FIELDS, ALLOWED_SANDBOX_PREVIEW_KINDS, SANDBOX_PROHIBITED_EFFECTS,
  FUTURE_SANDBOX_DESCRIPTOR_FIELDS, REQUIRED_SANDBOX_DESCRIPTOR_FIELDS, SECURITY_SANDBOX_DESCRIPTOR_FIELDS,
  FUTURE_SANDBOX_DESCRIPTOR_KIND, SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION,
} from './contractRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Declares the REAL preview sandbox contract shape + the FUTURE sandbox descriptor envelope (not built here). */
export const SANDBOX_DESCRIPTOR_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-target-descriptor-contract',
  sandboxContractVersion: SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  realSandboxContractFields: [...REAL_PREVIEW_SANDBOX_CONTRACT_FIELDS],
  allowedPreviewKinds: [...ALLOWED_SANDBOX_PREVIEW_KINDS],
  prohibitedEffects: [...SANDBOX_PROHIBITED_EFFECTS],
  futureSandboxDescriptorKind: FUTURE_SANDBOX_DESCRIPTOR_KIND,
  futureFields: [...FUTURE_SANDBOX_DESCRIPTOR_FIELDS],
  requiredFields: [...REQUIRED_SANDBOX_DESCRIPTOR_FIELDS],
  securityFields: [...SECURITY_SANDBOX_DESCRIPTOR_FIELDS],
  sandboxDescriptorBuilderImplemented: false, everyTargetFieldExistsOrIsClassifiedEnvelope: true,
});
export default SANDBOX_DESCRIPTOR_CONTRACT;
