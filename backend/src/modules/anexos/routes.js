import { anexoService } from "./services/anexoService.js";

const getTenantId = (request) => {
  const headerTenant = request.headers["x-tenant-id"];
  if (headerTenant && String(headerTenant).trim()) return String(headerTenant).trim();
  return "default";
};

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
  app.get("/api/anexos", async (request) => {
    const tenantId = getTenantId(request);
    const items = await anexoService.list({
      tenantId,
      entityName: request.query?.entityName,
      recordId: request.query?.recordId,
    });
    return { items };
  });

  app.post("/api/anexos", async (request, reply) => {
    const tenantId = getTenantId(request);
    const item = await anexoService.create(request.body || {}, tenantId);
    return reply.status(201).send({ item });
  });

  app.delete("/api/anexos/:id", async (request, reply) => {
    const tenantId = getTenantId(request);
    const ok = await anexoService.remove(request.params.id, tenantId);
    if (!ok) return reply.status(404).send({ message: "Anexo não encontrado" });
    return { ok: true };
  });

  app.post("/api/anexos/upload", async (request, reply) => {
    const tenantId = getTenantId(request);
    const file = await readMultipartFile(request);
    if (!file) return reply.status(400).send({ message: "Arquivo não informado" });
    const result = await anexoService.uploadFile({ ...file, tenantId });
    return { ...result };
  });
};
