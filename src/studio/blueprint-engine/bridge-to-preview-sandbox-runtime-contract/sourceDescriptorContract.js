import {
  REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS, REQUIRED_BRIDGE_TARGET_DESCRIPTOR_FIELDS,
  SECURITY_BRIDGE_TARGET_DESCRIPTOR_FIELDS, VERSION_BRIDGE_TARGET_DESCRIPTOR_FIELDS,
  DIGEST_BRIDGE_TARGET_DESCRIPTOR_FIELDS, REAL_TARGET_DESCRIPTOR_INVARIANTS, SOURCE_TARGET_SANDBOX_KIND,
} from './contractRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Declares the REAL bridge target descriptor contract (reflected read-only; no invented fields). */
export const SOURCE_DESCRIPTOR_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-source-descriptor-contract',
  sourceDescriptorKind: SOURCE_TARGET_SANDBOX_KIND,
  realFields: [...REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS],
  requiredFields: [...REQUIRED_BRIDGE_TARGET_DESCRIPTOR_FIELDS],
  securityFields: [...SECURITY_BRIDGE_TARGET_DESCRIPTOR_FIELDS],
  versionFields: [...VERSION_BRIDGE_TARGET_DESCRIPTOR_FIELDS],
  digestFields: [...DIGEST_BRIDGE_TARGET_DESCRIPTOR_FIELDS],
  invariants: { ...REAL_TARGET_DESCRIPTOR_INVARIANTS },
  aliasesForbidden: true, inventedFieldsForbidden: true, metadataOnly: true, syntheticOnly: true,
});
export default SOURCE_DESCRIPTOR_CONTRACT;
