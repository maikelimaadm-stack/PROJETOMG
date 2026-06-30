import { DNA_OWNERSHIP } from "./businessDnaContracts.js";

export function assertDnaOwnership(record) {
  return Object.freeze({
    ...DNA_OWNERSHIP,
    recordId: record.profileId ?? record.fingerprintId ?? record.patternId,
    tenantId: record.tenantId,
    verifiedAt: new Date().toISOString(),
  });
}

export default assertDnaOwnership;
