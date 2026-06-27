import { __API_NAME__ } from "@/apis/__MODULE_ID__/__API_NAME__.js";

const normalize__MODULE_ID_PASCAL__Record = (record, fallback = {}) => ({
  id: record?.id ?? fallback.id,
  codigo: record?.codigo ?? fallback.codigo,
  id_global: record?.id_global ?? fallback.id_global,
  nome: record?.nome ?? fallback.nome ?? "",
  status: record?.status ?? fallback.status ?? "Ativo",
  observacoes: record?.observacoes ?? fallback.observacoes ?? null,
});

const __REPOSITORY_NAME__ = {
  async listPage(params = {}) {
    const result = await __API_NAME__.list(params);
    return {
      ...result,
      items: (result.items || []).map((item) => normalize__MODULE_ID_PASCAL__Record(item)),
    };
  },

  async list(params = {}) {
    const result = await this.listPage(params);
    return result.items || [];
  },

  async get(id) {
    const item = await __API_NAME__.get(id);
    return item ? normalize__MODULE_ID_PASCAL__Record(item) : null;
  },

  async create(data) {
    const response = await __API_NAME__.create(data);
    return {
      item: normalize__MODULE_ID_PASCAL__Record(response?.item, data),
      contadores: response?.contadores || null,
    };
  },

  async update(id, data) {
    const updated = await __API_NAME__.update(id, data);
    return normalize__MODULE_ID_PASCAL__Record(updated, { id, ...data });
  },

  async delete(id) {
    await __API_NAME__.delete(id);
    return { ok: true };
  },
};

export default __REPOSITORY_NAME__;
