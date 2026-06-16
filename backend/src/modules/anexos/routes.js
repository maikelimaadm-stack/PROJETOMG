import { anexoService } from "./services/anexoService.js";
import { assertRole, loadAccessScope } from "../auth/accessScope.js";

const readMultipartFile = async (request) => {
  const file = await request.file();
  if (!file) return null;
  const chunks = [];
  for await (const chunk of file.file) {
    chunks.push(chunk);
  }
  return {
    filename: file.filename,
    mimeType: file.mimetype,
    buffer: Buffer.concat(chunks),
  };
};

export const registerAnexosRoutes = async (app) => {
  app.get("/api/anexos", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const items = await anexoService.list({
      scope,
      entityName: request.query?.entityName,
      recordId: request.query?.recordId,
    });
    return { items };
  });

  app.post("/api/anexos", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN", "OPERADOR"]);
    try {
      const item = await anexoService.create(request.body || {}, scope);
      return reply.status(201).send({ item });
    } catch (error) {
      return reply.status(error?.statusCode || 400).send({
        message: error?.message || "Falha ao criar anexo.",
      });
    }
  });

  app.delete("/api/anexos/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN"]);
    const ok = await anexoService.remove(request.params.id, scope);
    if (!ok) return reply.status(404).send({ message: "Anexo não encontrado" });
    return { ok: true };
  });

  app.post("/api/anexos/upload", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN", "OPERADOR"]);
    try {
      const file = await readMultipartFile(request);
      if (!file) return reply.status(400).send({ message: "Arquivo não informado" });
      const result = await anexoService.uploadFile({ ...file, scope });
      return { ...result };
    } catch (error) {
      return reply.status(error?.statusCode || 400).send({
        message: error?.message || "Falha no upload do anexo.",
      });
    }
  });
};
