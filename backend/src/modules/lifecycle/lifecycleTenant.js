/**
 * SEMÂNTICA DE TENANT DO LIFECYCLE — derivada do produto, não inventada aqui.
 *
 * A pergunta que P1-03 tinha de responder antes de tocar em qualquer rota era: neste
 * produto, `tenant_id` é (A) o próprio cliente, (B) uma subdivisão real, ou (C) outro
 * contexto? A resposta veio do código já em produção, não de suposição:
 *
 *   backend/src/modules/mmm/mmmService.js
 *     const resolveTenantId = (scope, tenantId) => String(tenantId || scope.clienteId);
 *     if (query.tenantId && query.tenantId !== scope.clienteId) {
 *       withStatus("tenantId forbidden for authenticated scope.", 403, "TENANT_FORBIDDEN");
 *     }
 *
 * Ou seja: o módulo MMM já estabeleceu que o tenant AUTORIZADO é exatamente o
 * `cliente_id` do escopo autenticado, e que um tenant pedido diferente disso é 403.
 * Não existe, hoje, subdivisão independente de cliente. Este módulo aplica a MESMA
 * regra ao lifecycle — é o mesmo contrato, não um segundo.
 *
 * Consequências registradas:
 *
 *  - `LifecycleExecutionJob` e `LifecycleAuditEntry` NÃO têm coluna `cliente_id`;
 *    carregam apenas `tenant_id`. Como tenant é o cliente, é `tenant_id` que sustenta
 *    o isolamento nessas duas tabelas — por isso ele é sempre copiado da linha de
 *    aprovação já escopada, nunca do payload.
 *  - `LifecycleSyncState` tem unique `(cliente_id, group_id, entity_type, entity_id)`.
 *    Como tenant é funcionalmente determinado por cliente, esse unique já é seguro e
 *    NENHUMA migration é necessária. Se um dia tenant virar subdivisão real, a decisão
 *    muda e passa a exigir migration — o teste desta fatia falha nesse dia, de
 *    propósito.
 *
 * O que este módulo proíbe: `body.tenantId` como autoridade, e o fallback silencioso
 * `"default"`, que gravava dados persistentes sob um tenant que ninguém provou.
 */

const withStatus = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
};

/** O tenant autorizado de um escopo autenticado. Fonte única, server-side. */
export function resolveLifecycleTenantId(scope) {
  const clienteId = scope?.clienteId;
  if (!clienteId) throw withStatus("Sessão inválida.", 401);
  return String(clienteId);
}

/**
 * Aceita um tenant vindo do cliente APENAS se ele coincidir com o autorizado.
 * Divergência é 403 — nunca coerção silenciosa para o valor certo, porque um pedido
 * divergente é uma tentativa de escrever fora do escopo e merece ser visível.
 */
export function assertRequestedTenantAllowed(scope, requestedTenantId) {
  const authorized = resolveLifecycleTenantId(scope);
  if (requestedTenantId === undefined || requestedTenantId === null || requestedTenantId === "") {
    return authorized;
  }
  if (String(requestedTenantId) !== authorized) {
    throw withStatus("tenantId forbidden for authenticated scope.", 403, "TENANT_FORBIDDEN");
  }
  return authorized;
}

export default { resolveLifecycleTenantId, assertRequestedTenantAllowed };
