import { getPrismaClient } from "../../database/prismaClient.js";

/**
 * Cliente Prisma efetivo. O default de produção é `getPrismaClient()`; o parâmetro
 * existe para que os testes de segurança exercitem ESTE código com um duplo
 * determinístico, sem banco e sem alterar o caminho de produção.
 */
const resolveClient = (client) => client ?? getPrismaClient();

export async function listApprovalRequestsByGroup(clienteId, groupId, limit = 50, client) {
  const prisma = resolveClient(client);
  return prisma.lifecycleApprovalRequest.findMany({
    where: { cliente_id: clienteId, group_id: groupId },
    orderBy: { recorded_at: "desc" },
    take: limit,
  });
}

/**
 * Leitura ESCOPADA por cliente.
 *
 * Substitui `getApprovalRequestById(id)`, cuja identidade externa era apenas o `id`:
 * qualquer usuário autenticado que conhecesse um id de outro cliente recebia a linha
 * inteira. O `cliente_id` autenticado passa a fazer parte da CONDIÇÃO, no banco —
 * não de uma comparação em JavaScript depois da leitura.
 */
export async function getApprovalRequestScoped({ id, clienteId }, client) {
  const prisma = resolveClient(client);
  return prisma.lifecycleApprovalRequest.findFirst({
    where: { id, cliente_id: clienteId },
  });
}

export async function createApprovalRequest(data, client) {
  const prisma = resolveClient(client);
  return prisma.lifecycleApprovalRequest.create({ data });
}

export const APPROVAL_DECISION = Object.freeze({ approved: "approved", rejected: "rejected" });

/**
 * Decide uma solicitação em UMA unidade atômica, com compare-and-set no banco.
 *
 * O desenho anterior era `findUnique(id)` → checar `status === "pending"` em JS →
 * `update(id)` → audit → job, tudo fora de transação. Isso tinha três buracos:
 *
 *  - IDOR: nem a leitura nem a escrita conheciam `cliente_id`;
 *  - TOCTOU: entre o check e a escrita, outra requisição podia decidir a mesma
 *    solicitação — medido em pré-correção: duas decisões concorrentes produziram
 *    2 vencedores, 2 auditorias e 2 jobs de execução;
 *  - parcialidade: falha depois do update deixava decidido sem auditoria, ou
 *    aprovado sem job.
 *
 * Aqui a transição é a própria condição do UPDATE:
 *
 *     WHERE id = ? AND cliente_id = ? AND status = 'pending'
 *
 * `updateMany` devolve `count`. Exatamente uma linha transicionada significa que ESTA
 * transação venceu a corrida; qualquer outro valor significa que perdeu, e então nada
 * é auditado e nenhum job é criado. Auditoria e job vivem na MESMA transação, então
 * ou tudo é gravado, ou nada é.
 *
 * `tenant_id` não entra na condição porque, neste produto, ele NÃO é uma subdivisão
 * independente do cliente — ver `lifecycleTenant.js`. Ele é lido da própria linha
 * escopada e propagado para audit/job, nunca aceito do payload.
 */
export async function decideApprovalRequestAtomic(
  { id, clienteId, actorId, decision, reason },
  client,
) {
  const prisma = resolveClient(client);
  const isApproval = decision === APPROVAL_DECISION.approved;

  return prisma.$transaction(async (tx) => {
    const decidedAt = new Date();
    const transitioned = await tx.lifecycleApprovalRequest.updateMany({
      where: { id, cliente_id: clienteId, status: "pending" },
      data: isApproval
        ? { status: APPROVAL_DECISION.approved, approved_by: actorId, decided_at: decidedAt }
        : {
            status: APPROVAL_DECISION.rejected,
            rejected_by: actorId,
            rejection_reason: reason,
            decided_at: decidedAt,
          },
    });

    // Perdeu a corrida, não existe, ou é de outro cliente — os três casos são
    // deliberadamente indistinguíveis para quem chama, para não permitir enumeração.
    if (transitioned.count !== 1) return { decided: false, request: null };

    const request = await tx.lifecycleApprovalRequest.findFirst({
      where: { id, cliente_id: clienteId },
    });
    if (!request) {
      // Inalcançável se o UPDATE acima transicionou uma linha. Se acontecer, a
      // transação inteira é abortada — nunca se grava auditoria órfã.
      throw new Error("Solicitação transicionada não pôde ser relida no escopo do cliente.");
    }

    await tx.lifecycleAuditEntry.create({
      data: {
        request_id: request.id,
        group_id: request.group_id,
        tenant_id: request.tenant_id,
        action: isApproval ? "approval_granted" : "approval_rejected",
        entity_type: "approval_request",
        actor_id: actorId,
        human_approved: isApproval,
        summary: isApproval ? "Aprovado via backend persistente." : reason,
      },
    });

    if (isApproval) {
      await tx.lifecycleExecutionJob.create({
        data: {
          request_id: request.id,
          group_id: request.group_id,
          tenant_id: request.tenant_id,
          action_type: request.action_type,
          label: `Execução: ${request.label}`,
          summary: "Na fila de execução persistente.",
          status: "queued",
        },
      });
    }

    return { decided: true, request };
  });
}

export async function appendAuditEntry(data, client) {
  const prisma = resolveClient(client);
  return prisma.lifecycleAuditEntry.create({ data });
}

export default {
  listApprovalRequestsByGroup,
  getApprovalRequestScoped,
  createApprovalRequest,
  decideApprovalRequestAtomic,
  appendAuditEntry,
  APPROVAL_DECISION,
};
