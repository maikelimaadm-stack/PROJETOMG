import { listApprovalRequests } from "./durableLifecycleStore.js";
import { createApprovalRequest } from "./approvalWorkflowEngine.js";

export function buildLifecycleApprovalRegistry(groupId, ctx) {
  if (!ctx?.authorized) return Object.freeze({ requests: [] });

  const existing = listApprovalRequests(groupId);
  if (existing.length === 0) {
    createApprovalRequest(groupId, ctx.tenantId, ctx, {
      actionType: "archive",
      label: "Arquivamento — aguardando aprovação",
      dataCategory: "operacional",
    });
    createApprovalRequest(groupId, ctx.tenantId, ctx, {
      actionType: "expunge",
      label: "Expurgo — aguardando aprovação",
      dataCategory: "operacional",
    });
    createApprovalRequest(groupId, ctx.tenantId, ctx, {
      actionType: "legal_hold",
      label: "Legal hold — disponível para aplicação",
      dataCategory: "corporativo",
    });
  }

  return Object.freeze({
    requests: Object.freeze(listApprovalRequests(groupId)),
    explainable: true,
    humanApprovalRequired: true,
  });
}

export default buildLifecycleApprovalRegistry;
