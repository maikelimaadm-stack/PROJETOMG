import { CONSULTING_OWNERSHIP } from "./consultingEngineContracts.js";

export function assertConsultingOwnership(record) {
  return Object.freeze({
    ...CONSULTING_OWNERSHIP,
    recordId: record.documentId ?? record.recommendationId ?? record.planId ?? record.signalId,
    tenantId: record.tenantId,
    verifiedAt: new Date().toISOString(),
  });
}

export default assertConsultingOwnership;
