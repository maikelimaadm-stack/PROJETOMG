import { loadAccessScope, assertRole } from "../auth/accessScope.js";
import { assertRequestedTenantAllowed } from "./lifecycleTenant.js";

/**
 * RBAC DO LIFECYCLE — derivado do produto e FAIL-CLOSED onde o produto se cala.
 *
 * Autenticar não é autorizar. Depois da primeira rodada de P1-03 as rotas já exigiam
 * identidade e já isolavam o cliente, mas QUALQUER perfil do cliente certo — CONSULTA
 * incluído — podia decidir uma aprovação terminal que dispara archive/expunge.
 *
 * O que o produto já diz, e que é reusado aqui sem invenção:
 *
 *   backend/src/modules/anexos/routes.js
 *     GET    → sem assertRole            (leitura: qualquer perfil do cliente)
 *     POST   → ["ADMIN", "OPERADOR"]     (mutação ordinária de dados)
 *     DELETE → ["ADMIN"]                 (ação destrutiva)
 *   backend/src/modules/cadcps|clienteModulo|metrics/routes.js → ["ADMIN"]
 *
 * O que o produto NÃO diz: D-092 e D-093 aceitam o workflow de aprovação humana e o
 * motor de sync, mas NENHUM dos dois nomeia um perfil aprovador; `lifecyclePersistence
 * Contracts.js` e `approvalWorkflowEngine.js` não carregam papel algum — o
 * `actorId = "administrador"` que existia lá era um DEFAULT de assinatura, não um
 * contrato de autorização (e é justamente o default que P1-03 removeu).
 *
 * Como não existe contrato canônico, aplica-se LEAST PRIVILEGE, e a decisão fica
 * registrada aqui para ser contestada por evidência, nunca por conveniência:
 *
 *   APPROVE / REJECT → ADMIN            decisão terminal; enfileira execução real
 *                                       (archive/expunge). OPERADOR NÃO entra sem
 *                                       evidência canônica de que é aprovador.
 *   SYNC PUSH        → ADMIN, OPERADOR  mutação ordinária de dados, não decisão de
 *                                       governança — mesmo degrau do POST /api/anexos.
 *   LEITURAS         → qualquer perfil  já escopadas por cliente; negar leitura a
 *                                       CONSULTA seria regressão funcional sem ganho.
 */
export const LIFECYCLE_DECISION_ROLES = Object.freeze(["ADMIN"]);
export const LIFECYCLE_SYNC_WRITE_ROLES = Object.freeze(["ADMIN", "OPERADOR"]);

/**
 * ROTAS LIFECYCLE — P1-03.
 *
 * Antes desta fatia, cada rota fazia o próprio pseudo-auth:
 *
 *     const clienteId = request.user?.cliente_id;
 *     if (!clienteId) return reply.code(401).send(...);
 *
 * Olhar `request.user` NÃO autentica: quem popula `request.user` é o
 * `request.jwtVerify()` que vive dentro de `app.authenticate`, e ele nunca era
 * chamado. Medido em pré-correção: `app.authenticate` não era invocado em nenhuma
 * das seis rotas, e qualquer hook que preenchesse `request.user` passava direto —
 * sem verificação de assinatura, sem checagem de token revogado e sem a proteção de
 * Origin que o boundary oficial aplica a mutation autenticada por cookie.
 *
 * Agora toda rota privada declara `{ preHandler: app.authenticate }` — o mesmo
 * boundary já usado por Empresas — e o escopo vem de `loadAccessScope(request)`, que
 * relê o usuário do banco (bloqueando usuário desativado) em vez de confiar em claim
 * possivelmente obsoleta. Nenhum segundo middleware, nenhum `jwtVerify` replicado.
 *
 * O parâmetro `deps` existe apenas para os testes de segurança exercitarem ESTAS
 * rotas com serviços determinísticos. O default é o de produção, e o comportamento
 * de produção é idêntico ao de antes desta injeção existir.
 */
export async function registerLifecycleRoutes(app, deps = {}) {
  const resolveScope = deps.loadAccessScope ?? loadAccessScope;
  const requireRole = deps.assertRole ?? assertRole;
  const loadApprovalService = deps.approvalService
    ? async () => deps.approvalService
    : () => import("./lifecycleService.js");
  const loadSyncService = deps.syncService
    ? async () => deps.syncService
    : () => import("./lifecycleSyncService.js");

  /** Identidade do ator: sempre a autenticada. Nunca um default como "administrador". */
  const actorOf = (scope) => String(scope.user?.login ?? scope.userId);

  app.get(
    "/api/lifecycle/approvals/:groupId",
    { preHandler: app.authenticate },
    async (request) => {
      const scope = await resolveScope(request);
      const { listGroupApprovals } = await loadApprovalService();
      return listGroupApprovals(scope.clienteId, request.params.groupId);
    },
  );

  app.post(
    "/api/lifecycle/approvals/:id/approve",
    { preHandler: app.authenticate },
    async (request) => {
      const scope = await resolveScope(request);
      requireRole(scope, LIFECYCLE_DECISION_ROLES);
      const { approveRequestBackend } = await loadApprovalService();
      return approveRequestBackend({
        id: request.params.id,
        clienteId: scope.clienteId,
        actorId: actorOf(scope),
      });
    },
  );

  app.post(
    "/api/lifecycle/approvals/:id/reject",
    { preHandler: app.authenticate },
    async (request) => {
      const scope = await resolveScope(request);
      requireRole(scope, LIFECYCLE_DECISION_ROLES);
      const { rejectRequestBackend } = await loadApprovalService();
      return rejectRequestBackend({
        id: request.params.id,
        clienteId: scope.clienteId,
        actorId: actorOf(scope),
        reason: request.body?.reason ?? "Rejeitado pelo administrador.",
      });
    },
  );

  app.get(
    "/api/lifecycle/sync/:groupId",
    { preHandler: app.authenticate },
    async (request) => {
      const scope = await resolveScope(request);
      const { getSyncSnapshot } = await loadSyncService();
      return getSyncSnapshot(scope.clienteId, request.params.groupId);
    },
  );

  app.post(
    "/api/lifecycle/sync/:groupId/push",
    { preHandler: app.authenticate },
    async (request) => {
      const scope = await resolveScope(request);
      requireRole(scope, LIFECYCLE_SYNC_WRITE_ROLES);
      // O tenant é derivado do escopo autenticado. Se o payload trouxer um, ele só é
      // aceito quando coincide com o autorizado; divergência é 403, nunca coerção
      // silenciosa. O antigo fallback `"default"` foi removido: gravava dado
      // persistente sob um tenant que ninguém havia provado.
      const tenantId = assertRequestedTenantAllowed(scope, request.body?.tenantId);
      const { pushSyncBatchBackend } = await loadSyncService();
      return pushSyncBatchBackend(
        scope.clienteId,
        request.params.groupId,
        tenantId,
        request.body ?? {},
      );
    },
  );

  app.post(
    "/api/lifecycle/sync/:groupId/reconcile",
    { preHandler: app.authenticate },
    async (request) => {
      const scope = await resolveScope(request);
      const { reconcileSyncBackend } = await loadSyncService();
      return reconcileSyncBackend(scope.clienteId, request.params.groupId);
    },
  );
}

export default registerLifecycleRoutes;
