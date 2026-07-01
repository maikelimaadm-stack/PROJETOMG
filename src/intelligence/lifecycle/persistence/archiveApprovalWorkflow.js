import { createApprovalRequest } from "./approvalWorkflowEngine.js";

export function requestArchiveApproval(groupId, tenantId, ctx, partial = {}) {
  return createApprovalRequest(groupId, tenantId, ctx, {
    actionType: "archive",
    label: partial.label ?? "Solicitação de arquivamento",
    summary: partial.summary ?? "Arquivamento exige aprovação humana e trilha durável.",
    dataCategory: partial.dataCategory ?? "operacional",
    ...partial,
  });
}

export default requestArchiveApproval;
