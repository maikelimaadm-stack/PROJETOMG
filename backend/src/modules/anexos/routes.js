import { anexoService } from "./services/anexoService.js";
import { assertRole, loadAccessScope } from "../auth/accessScope.js";
import { z } from "zod";

const anexoCreateSchema = z.object({
  entity_name: z.string().trim().min(1).max(120),
  record_id: z.union([z.string(), z.number(), z.null()]).optional(),
  attachment_name: z.string().trim().max(255).optional().nullable(),
  file_name: z.string().trim().min(1).max(255),
  file_url: z.string().trim().url().max(2000),
  file_type: z.string().trim().max(120).optional().nullable(),
  file_size: z.coerce.number().int().nonnegative().max(100 * 1024 * 1024).optional().nullable(),
  storage_path: z.string().trim().max(500).optional().nullable(),
  empresa_id: z.string().trim().min(1).optional().nullable(),
});

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
      const payload = anexoCreateSchema.parse(request.body || {});
      const item = await anexoService.create(
        {
          ...payload,
          record_id:
            payload.record_id == null
              ? null
              : String(payload.record_id).trim() || null,
        },
        scope
      );
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
