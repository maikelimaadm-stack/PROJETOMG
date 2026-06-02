import { fazendasService } from "./service.js";
import {
  fazendasCreateSchema,
  fazendasFieldCreateSchema,
  fazendasFieldUpdateSchema,
  fazendasUpdateSchema,
} from "./validators.js";

const parseBodyOrThrow = (schema, payload) => {
  const parsed = schema.safeParse(payload || {});
  if (parsed.success) return parsed.data;
  const firstIssue = parsed.error.issues?.[0];
  const error = new Error(firstIssue?.message || "Payload inválido.");
  error.statusCode = 400;
  throw error;
};

export const fazendasController = {
  async list({ scope, query }) {
    return fazendasService.list({ scope, query });
  },

  async getById({ scope, id, reply }) {
    const item = await fazendasService.getById({ scope, id });
    if (!item) return reply.status(404).send({ message: "Fazenda não encontrado(a)." });
    return { item };
  },

  async create({ scope, payload, reply }) {
    const parsedPayload = parseBodyOrThrow(fazendasCreateSchema, payload);
    const item = await fazendasService.create({ scope, payload: parsedPayload });
    return reply.status(201).send({ item });
  },

  async update({ scope, id, payload, reply }) {
    const parsedPayload = parseBodyOrThrow(fazendasUpdateSchema, payload);
    const item = await fazendasService.update({ scope, id, payload: parsedPayload });
    if (!item) return reply.status(404).send({ message: "Fazenda não encontrado(a)." });
    return { item };
  },

  async remove({ scope, id, reply }) {
    const ok = await fazendasService.remove({ scope, id });
    if (!ok) return reply.status(404).send({ message: "Fazenda não encontrado(a)." });
    return { ok: true };
  },

  async listFields({ scope, query }) {
    const mode = String(query?.mode || "aplicavel").toLowerCase() === "config" ? "config" : "aplicavel";
    const items = await fazendasService.listFields({ scope, mode });
    return { items };
  },

  async createField({ scope, payload, reply }) {
    try {
      const parsedPayload = parseBodyOrThrow(fazendasFieldCreateSchema, payload);
      const item = await fazendasService.createField({ scope, payload: parsedPayload });
      return reply.status(201).send({ item });
    } catch (error) {
      return reply.status(error?.statusCode || 400).send({ message: error.message || "Falha ao criar campo." });
    }
  },

  async updateField({ scope, id, payload, reply }) {
    try {
      const parsedPayload = parseBodyOrThrow(fazendasFieldUpdateSchema, payload);
      const item = await fazendasService.updateField({ scope, id, payload: parsedPayload });
      if (!item) return reply.status(404).send({ message: "Campo não encontrado." });
      return { item };
    } catch (error) {
      return reply.status(error?.statusCode || 400).send({ message: error.message || "Falha ao atualizar campo." });
    }
  },

  async removeField({ scope, id, reply }) {
    try {
      const ok = await fazendasService.removeField({ scope, id });
      if (!ok) return reply.status(404).send({ message: "Campo não encontrado." });
      return { ok: true };
    } catch (error) {
      return reply.status(error?.statusCode || 400).send({ message: error.message || "Falha ao excluir campo." });
    }
  },

  async listOptions({ scope, payload }) {
    const items = await fazendasService.listOptions({
      scope,
      sources: payload?.sources || [],
    });
    return { items };
  },
};

