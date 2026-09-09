import { loadAccessScope } from "../auth/accessScope.js";
import { assertRequestedTenantAllowed } from "./lifecycleTenant.js";

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
