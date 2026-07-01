import {
  listApprovalRequestsByGroup,
  getApprovalRequestById,
  updateApprovalRequest,
  appendAuditEntry,
  createExecutionJob,
} from "./lifecycleRepository.js";

export async function approveRequestBackend(id, actorId) {
  const request = await getApprovalRequestById(id);
  if (!request || request.status !== "pending") {
    return { approved: false, reason: "Solicitação indisponível." };
  }
  const updated = await updateApprovalRequest(id, {
    status: "approved",
    approved_by: actorId,
    decided_at: new Date(),
  });
  await appendAuditEntry({
    request_id: id,
    group_id: request.group_id,
    tenant_id: request.tenant_id,
    action: "approval_granted",
    entity_type: "approval_request",
    actor_id: actorId,
    human_approved: true,
    summary: "Aprovado via backend persistente.",
  });
  await createExecutionJob({
    request_id: id,
    group_id: request.group_id,
    tenant_id: request.tenant_id,
    action_type: request.action_type,
    label: `Execução: ${request.label}`,
    summary: "Na fila de execução persistente.",
    status: "queued",
  });
  return { approved: true, request: updated };
}

export async function rejectRequestBackend(id, actorId, reason) {
  const request = await getApprovalRequestById(id);
  if (!request || request.status !== "pending") {
    return { rejected: false, reason: "Solicitação indisponível." };
  }
  const updated = await updateApprovalRequest(id, {
    status: "rejected",
    rejected_by: actorId,
    rejection_reason: reason,
    decided_at: new Date(),
  });
  await appendAuditEntry({
    request_id: id,
    group_id: request.group_id,
    tenant_id: request.tenant_id,
    action: "approval_rejected",
    entity_type: "approval_request",
    actor_id: actorId,
    human_approved: false,
    summary: reason,
  });
  return { rejected: true, request: updated };
}

export async function listGroupApprovals(clienteId, groupId) {
  const rows = await listApprovalRequestsByGroup(clienteId, groupId);
  return { items: rows, durable: true };
}

export default { approveRequestBackend, rejectRequestBackend, listGroupApprovals };
