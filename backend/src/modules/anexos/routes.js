import { anexoService } from "./services/anexoService.js";

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
    const items = await anexoService.list({
      entityName: request.query?.entityName,
      recordId: request.query?.recordId,
    });
    return { items };
  });

  app.post("/api/anexos", async (request, reply) => {
    const item = await anexoService.create(request.body || {});
    return reply.status(201).send({ item });
  });

  app.delete("/api/anexos/:id", async (request, reply) => {
    const ok = await anexoService.remove(request.params.id);
    if (!ok) return reply.status(404).send({ message: "Anexo não encontrado" });
    return { ok: true };
  });

  app.post("/api/anexos/upload", async (request, reply) => {
    const file = await readMultipartFile(request);
    if (!file) return reply.status(400).send({ message: "Arquivo não informado" });
    const result = await anexoService.uploadFile(file);
    return { ...result };
  });
};
