export async function registerLifecycleRoutes(app) {
  app.get("/api/lifecycle/approvals/:groupId", async (request, reply) => {
    const clienteId = request.user?.cliente_id;
    if (!clienteId) return reply.code(401).send({ error: "Não autenticado." });
    const { listGroupApprovals } = await import("./lifecycleService.js");
    const result = await listGroupApprovals(clienteId, request.params.groupId);
    return result;
  });

  app.post("/api/lifecycle/approvals/:id/approve", async (request, reply) => {
    const clienteId = request.user?.cliente_id;
    if (!clienteId) return reply.code(401).send({ error: "Não autenticado." });
    const { approveRequestBackend } = await import("./lifecycleService.js");
    const actorId = request.user?.login ?? "administrador";
    return approveRequestBackend(request.params.id, actorId);
  });

  app.post("/api/lifecycle/approvals/:id/reject", async (request, reply) => {
    const clienteId = request.user?.cliente_id;
    if (!clienteId) return reply.code(401).send({ error: "Não autenticado." });
    const { rejectRequestBackend } = await import("./lifecycleService.js");
    const actorId = request.user?.login ?? "administrador";
    const reason = request.body?.reason ?? "Rejeitado pelo administrador.";
    return rejectRequestBackend(request.params.id, actorId, reason);
  });
}

export default registerLifecycleRoutes;
