/**
 * MODELO DE TENANT DO LIFECYCLE — o contrato do PRÓPRIO bounded context, e o que o
 * servidor consegue (e não consegue) provar sobre ele.
 *
 * ---------------------------------------------------------------------------
 * A CORREÇÃO QUE ESTE ARQUIVO CARREGA
 * ---------------------------------------------------------------------------
 * A primeira versão deste módulo afirmava que "tenant autorizado = cliente_id" e que
 * "tenant é funcionalmente determinado por cliente". A justificativa era o módulo MMM
 * (`backend/src/modules/mmm/mmmService.js`), onde isso é verdade PARA OS OBJETOS DO MMM.
 *
 * Projetar essa regra sobre o Lifecycle estava ERRADO. O Lifecycle tem contrato próprio,
 * e ele separa explicitamente quatro coisas:
 *
 *   src/intelligence/dna/engine/businessDnaStore.js
 *     registerAuthorizedGroupScope({ groupId, ownerClientId, authorizedTenantIds: [...] })
 *   src/intelligence/lifecycle/engine/lifecycleContextAssembly.js
 *     contexto = { tenantId, ownerClientId, authorizedTenantIds }
 *   src/intelligence/lifecycle/persistence/approvalWorkflowEngine.js
 *     createApprovalRequest(groupId, tenantId, ctx) grava
 *       { groupId, tenantId, clienteId: ctx.ownerClientId, authorizedTenantIds }
 *   scripts/gate-enterprise-lifecycle-persistence-approval.mjs   (G324)
 *   scripts/gate-enterprise-lifecycle-sync-storage-audit.mjs     (G325)
 *     ownerClientId: "client-gate-…", authorizedTenantIds: [tenantA, tenantB]
 *
 * Ou seja: um OWNER (cliente) possui um GROUP, e o group autoriza UM OU MAIS TENANTS,
 * que podem ser diferentes do próprio owner. Sob a versão anterior deste arquivo,
 * `authorizeLifecycleTenant(owner-A, "tenant-A")` devolvia 403 — o contrato legítimo
 * do Lifecycle era recusado como se fosse ataque. Isso era incompatibilidade de modelo,
 * não proteção.
 *
 * Lição registrada: o MESMO termo não implica a MESMA semântica entre bounded contexts.
 *
 * ---------------------------------------------------------------------------
 * DUAS PROPRIEDADES DIFERENTES, QUE NÃO SE CONFUNDEM
 * ---------------------------------------------------------------------------
 *  (A) ISOLAMENTO DE CLIENTE — o cliente autenticado X nunca lê ou escreve dados do
 *      cliente Y. Garantido por `cliente_id` em TODA condição de persistência
 *      (`lifecycleRepository.js`, `lifecycleSyncService.js`). Não depende de tenant.
 *
 *  (B) AUTORIZAÇÃO DE GROUP/TENANT — dentro do escopo do owner, o tenant pedido tem de
 *      constar no escopo autorizado daquele group. Depende de uma AUTORIDADE que saiba
 *      responder "tenant T é autorizado no group G do owner O?".
 *
 * Resolver (A) destruindo (B) — o que a versão anterior fazia — não é aceitável.
 *
 * ---------------------------------------------------------------------------
 * O QUE O SERVIDOR SABE HOJE
 * ---------------------------------------------------------------------------
 * A auditoria do backend inteiro (Prisma, repositories, MDP, MMM, auth) não encontrou
 * NENHUM registro persistido de (owner, group, tenant autorizado). O único lugar onde
 * `authorizedTenantIds` existe é o `localStorage` do navegador
 * (`businessDnaStore.readGroupScopes()`), populado apenas pelos gates. Isso NÃO é
 * autoridade: é input do cliente.
 *
 * Portanto este módulo NÃO inventa uma autoridade. Ele define a INTERFACE que uma
 * autoridade precisa ter, entrega uma implementação de produção que responde "não sei"
 * e, diante do "não sei", FALHA FECHADO. O dia em que existir um mapping persistido,
 * ele entra por essa interface — sem tocar nas regras abaixo.
 *
 * ---------------------------------------------------------------------------
 * AS REGRAS
 * ---------------------------------------------------------------------------
 *  1. `tenantId` é uma DECLARAÇÃO do cliente. Nunca é autoridade. `authorizedTenantIds`
 *     e `ownerClientId` vindos do payload são IGNORADOS por construção: nada aqui os lê.
 *  2. Tenant ausente numa operação que o exige → 400 LIFECYCLE_TENANT_REQUIRED.
 *     Nunca derivado, nunca "default": gravar sob um tenant que ninguém declarou é pior
 *     do que recusar.
 *  3. Tenant igual ao próprio owner autenticado → permitido, base "owner_identity".
 *     Isso NÃO é suposição sobre o group: o servidor está vouching pela identidade do
 *     cliente autenticado, que `loadAccessScope` acabou de reler do banco, e o dado
 *     resultante é integralmente do próprio cliente (propriedade A).
 *  4. Tenant diferente do owner → só com a autoridade dizendo SIM (base "group_scope").
 *     Se disser NÃO → 403 TENANT_FORBIDDEN.
 *     Se NÃO SOUBER (produção hoje) → 403 LIFECYCLE_TENANT_AUTHORITY_UNAVAILABLE.
 *     São códigos DIFERENTES de propósito: o segundo não afirma que o tenant é
 *     proibido — afirma que ninguém no servidor pode autorizá-lo. Nada é gravado.
 *  5. Nunca coerção: um tenant recusado não é silenciosamente trocado pelo cliente.
 */

const withStatus = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
};

export const LIFECYCLE_TENANT_REQUIRED = "LIFECYCLE_TENANT_REQUIRED";
export const LIFECYCLE_TENANT_AUTHORITY_UNAVAILABLE = "LIFECYCLE_TENANT_AUTHORITY_UNAVAILABLE";
export const TENANT_FORBIDDEN = "TENANT_FORBIDDEN";

/**
 * A autoridade de produção: NÃO EXISTE mapping persistido, então ela responde `null`
 * ("não sei") para tudo. `authorizeLifecycleTenant` trata `null` como recusa.
 *
 * Esta é a implementação usada por `registerLifecycleRoutes(app)` sem `deps`. Qualquer
 * outra só entra por injeção explícita — e a bateria prova que a padrão é esta.
 */
export const NO_LIFECYCLE_TENANT_AUTHORITY = Object.freeze({
  kind: "none",
  /** @returns {Promise<boolean|null>} `null` = a autoridade não consegue responder. */
  async isTenantAuthorizedInGroup() {
    return null;
  },
});

/**
 * Decide o tenant sob o qual UMA operação pode escrever.
 *
 * @param {{ ownerClientId: string, groupId: string, requestedTenantId?: unknown }} input
 * @param {{ isTenantAuthorizedInGroup(q: { clienteId: string, groupId: string, tenantId: string }): Promise<boolean|null> }} authority
 * @returns {Promise<{ tenantId: string, basis: "owner_identity" | "group_scope" }>}
 */
export async function authorizeLifecycleTenant(
  { ownerClientId, groupId, requestedTenantId },
  authority = NO_LIFECYCLE_TENANT_AUTHORITY,
) {
  if (!ownerClientId) throw withStatus("Sessão inválida.", 401);
  if (!groupId) throw withStatus("groupId obrigatório.", 400);

  if (requestedTenantId === undefined || requestedTenantId === null || requestedTenantId === "") {
    throw withStatus(
      "tenantId obrigatório: o Lifecycle não deriva tenant e não usa default.",
      400,
      LIFECYCLE_TENANT_REQUIRED,
    );
  }
  const tenantId = String(requestedTenantId);
  const owner = String(ownerClientId);

  if (tenantId === owner) {
    return Object.freeze({ tenantId, basis: "owner_identity" });
  }

  const verdict = await authority.isTenantAuthorizedInGroup({ clienteId: owner, groupId: String(groupId), tenantId });
  if (verdict === true) {
    return Object.freeze({ tenantId, basis: "group_scope" });
  }
  if (verdict === false) {
    throw withStatus("tenantId não autorizado neste group para o cliente autenticado.", 403, TENANT_FORBIDDEN);
  }
  throw withStatus(
    "Autoridade server-side de tenant do Lifecycle indisponível: operação recusada (fail-closed).",
    403,
    LIFECYCLE_TENANT_AUTHORITY_UNAVAILABLE,
  );
}

export default {
  authorizeLifecycleTenant,
  NO_LIFECYCLE_TENANT_AUTHORITY,
  LIFECYCLE_TENANT_REQUIRED,
  LIFECYCLE_TENANT_AUTHORITY_UNAVAILABLE,
  TENANT_FORBIDDEN,
};
