import { createApprovalRequest } from "./approvalWorkflowEngine.js";

export function requestExpungeApproval(groupId, tenantId, ctx, partial = {}) {
  return createApprovalRequest(groupId, tenantId, ctx, {
    actionType: "expunge",
    label: partial.label ?? "Solicitação de expurgo",
    summary: partial.summary ?? "Expurgo bloqueado até aprovação, política e auditoria.",
    dataCategory: partial.dataCategory ?? "operacional",
    policyValid: partial.policyValid ?? true,
    ...partial,
  });
}

export default requestExpungeApproval;
