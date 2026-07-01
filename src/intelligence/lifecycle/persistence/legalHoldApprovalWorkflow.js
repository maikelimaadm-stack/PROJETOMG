import { createApprovalRequest } from "./approvalWorkflowEngine.js";

export function requestLegalHoldApproval(groupId, tenantId, ctx, partial = {}) {
  return createApprovalRequest(groupId, tenantId, ctx, {
    actionType: "legal_hold",
    label: partial.label ?? "Solicitação de legal hold",
    summary: partial.summary ?? "Legal hold protege dados contra archive e expurgo.",
    dataCategory: partial.dataCategory ?? "corporativo",
    ...partial,
  });
}

export function requestHoldReleaseApproval(groupId, tenantId, ctx, partial = {}) {
  return createApprovalRequest(groupId, tenantId, ctx, {
    actionType: "release_hold",
    label: partial.label ?? "Remoção de legal hold",
    summary: partial.summary ?? "Remoção exige autorização e auditoria.",
    dataCategory: partial.dataCategory ?? "corporativo",
    ...partial,
  });
}

export default { requestLegalHoldApproval, requestHoldReleaseApproval };
