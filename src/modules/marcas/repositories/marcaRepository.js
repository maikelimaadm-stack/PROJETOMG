import { MarcaApi } from "@/apis/marcas/MarcaApi";

const normalizeMarcaRecord = (record, fallback = {}) => ({
  id: record?.id ?? fallback.id,
  codigo: record?.codigo ?? fallback.codigo,
  id_global: record?.id_global ?? fallback.id_global,
  nome: record?.nome ?? fallback.nome ?? "",
  status: record?.status ?? fallback.status ?? "Ativo",
  observacoes: record?.observacoes ?? fallback.observacoes ?? null,
});

const marcaRepository = {
  async listPage(params = {}) {
    const result = await MarcaApi.list(params);
    return {
      ...result,
      items: (result.items || []).map((item) => normalizeMarcaRecord(item)),
    };
  },

  async list(params = {}) {
    const result = await this.listPage(params);
    return result.items || [];
  },

  async get(id) {
    const item = await MarcaApi.get(id);
    return item ? normalizeMarcaRecord(item) : null;
  },

  async create(data) {
    const response = await MarcaApi.create(data);
    return {
      item: normalizeMarcaRecord(response?.item, data),
      contadores: response?.contadores || null,
    };
  },

  async update(id, data) {
    const updated = await MarcaApi.update(id, data);
    return normalizeMarcaRecord(updated, { id, ...data });
  },

  async delete(id) {
    await MarcaApi.delete(id);
    return { ok: true };
  },
};

export default marcaRepository;
