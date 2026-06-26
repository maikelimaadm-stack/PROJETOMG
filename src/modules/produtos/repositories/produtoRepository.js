import { ProdutoApi } from "@/apis/produtos/ProdutoApi";

const normalizeProdutoRecord = (record, fallback = {}) => ({
  id: record?.id ?? fallback.id,
  codigo: record?.codigo ?? fallback.codigo,
  id_global: record?.id_global ?? fallback.id_global,
  nome: record?.nome ?? fallback.nome ?? "",
  status: record?.status ?? fallback.status ?? "Ativo",
  descricao: record?.descricao ?? fallback.descricao ?? null,
  preco: record?.preco ?? fallback.preco ?? null,
});

const produtoRepository = {
  async listPage(params = {}) {
    const result = await ProdutoApi.list(params);
    return {
      ...result,
      items: (result.items || []).map((item) => normalizeProdutoRecord(item)),
    };
  },

  async list(params = {}) {
    const result = await this.listPage(params);
    return result.items || [];
  },

  async get(id) {
    const item = await ProdutoApi.get(id);
    return item ? normalizeProdutoRecord(item) : null;
  },

  async create(data) {
    const response = await ProdutoApi.create(data);
    return {
      item: normalizeProdutoRecord(response?.item, data),
      contadores: response?.contadores || null,
    };
  },

  async update(id, data) {
    const updated = await ProdutoApi.update(id, data);
    return normalizeProdutoRecord(updated, { id, ...data });
  },

  async delete(id) {
    await ProdutoApi.delete(id);
    return { ok: true };
  },
};

export default produtoRepository;
