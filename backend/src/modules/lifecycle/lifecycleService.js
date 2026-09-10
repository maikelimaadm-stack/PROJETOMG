import {
  listApprovalRequestsByGroup,
  decideApprovalRequestAtomic,
  APPROVAL_DECISION,
} from "./lifecycleRepository.js";

/**
 * Resposta única para "não existe", "é de outro cliente" e "já foi decidida".
 *
 * Os três casos são indistinguíveis de propósito: distingui-los transformaria a rota
 * num oráculo de existência de solicitações de outros clientes.
 */
const UNAVAILABLE = "Solicitação indisponível.";

/**
 * Aprova uma solicitação do PRÓPRIO cliente autenticado, atomicamente.
 *
 * `clienteId` é obrigatório e vem do escopo autenticado carregado do banco
 * (`loadAccessScope`), nunca de parâmetro de rota, corpo ou claim JWT possivelmente
 * obsoleta. Toda a decisão — transição, auditoria e job — acontece numa transação
 * com compare-and-set; ver `decideApprovalRequestAtomic`.
 */
export async function approveRequestBackend({ id, clienteId, actorId }, deps = {}) {
  const decide = deps.decideApprovalRequestAtomic ?? decideApprovalRequestAtomic;
  const result = await decide(
    { id, clienteId, actorId, decision: APPROVAL_DECISION.approved },
    deps.client,
  );
  if (!result.decided) return { approved: false, reason: UNAVAILABLE };
  return { approved: true, request: result.request };
}

/** Rejeita uma solicitação do próprio cliente autenticado, atomicamente. */
export async function rejectRequestBackend({ id, clienteId, actorId, reason }, deps = {}) {
  const decide = deps.decideApprovalRequestAtomic ?? decideApprovalRequestAtomic;
  const result = await decide(
    { id, clienteId, actorId, decision: APPROVAL_DECISION.rejected, reason },
    deps.client,
  );
  if (!result.decided) return { rejected: false, reason: UNAVAILABLE };
  return { rejected: true, request: result.request };
}

export async function listGroupApprovals(clienteId, groupId, deps = {}) {
  const list = deps.listApprovalRequestsByGroup ?? listApprovalRequestsByGroup;
  const rows = await list(clienteId, groupId, 50, deps.client);
  return { items: rows, durable: true };
}

export default { approveRequestBackend, rejectRequestBackend, listGroupApprovals, UNAVAILABLE };
