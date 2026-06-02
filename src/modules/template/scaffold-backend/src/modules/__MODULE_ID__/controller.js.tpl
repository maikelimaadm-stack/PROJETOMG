import { __MODULE_ID__Service } from "./service.js";
import { __MODULE_ID__CreateSchema, __MODULE_ID__UpdateSchema } from "./validators.js";

const parseBodyOrThrow = (schema, payload) => {
  const parsed = schema.safeParse(payload || {});
  if (parsed.success) return parsed.data;
  const firstIssue = parsed.error.issues?.[0];
  const error = new Error(firstIssue?.message || "Payload inválido.");
  error.statusCode = 400;
  throw error;
};

export const __MODULE_ID__Controller = {
  async list({ scope, query }) {
    return __MODULE_ID__Service.list({ scope, query });
  },

  async getById({ scope, id, reply }) {
    const item = await __MODULE_ID__Service.getById({ scope, id });
    if (!item) return reply.status(404).send({ message: "__SINGULAR_LABEL__ não encontrado(a)." });
    return { item };
  },

  async create({ scope, payload, reply }) {
    const parsedPayload = parseBodyOrThrow(__MODULE_ID__CreateSchema, payload);
    const item = await __MODULE_ID__Service.create({ scope, payload: parsedPayload });
    return reply.status(201).send({ item });
  },

  async update({ scope, id, payload, reply }) {
    const parsedPayload = parseBodyOrThrow(__MODULE_ID__UpdateSchema, payload);
    const item = await __MODULE_ID__Service.update({ scope, id, payload: parsedPayload });
    if (!item) return reply.status(404).send({ message: "__SINGULAR_LABEL__ não encontrado(a)." });
    return { item };
  },

  async remove({ scope, id, reply }) {
    const ok = await __MODULE_ID__Service.remove({ scope, id });
    if (!ok) return reply.status(404).send({ message: "__SINGULAR_LABEL__ não encontrado(a)." });
    return { ok: true };
  },
};

