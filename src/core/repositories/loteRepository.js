import { base44 } from "@/api/base44Client";

const ORIGENS_SISTEMA = [
  "MOVIMENTAÇÃO",
  "REVERSÃO MOVIMENTAÇÃO",
  "Nascimento",
  "Mudança de Categoria",
  "NASCIMENTO",
  "MUDANÇA DE CATEGORIA"
];

const filterByEmpresa = (items, empresaId) => {
  if (!empresaId) return items;
  return items.filter((item) => item.empresa_id === empresaId);
};

const getNextNumeroLote = (lotes) => {
  const maxNum = lotes.reduce((max, lote) => Math.max(max, parseInt(lote.numero_lote) || 0), 0);
  return String(maxNum + 1);
};

export const loteRepository = {
  async list({ empresaId, incluirSistema = true } = {}) {
    const all = await base44.entities.Lote.list();
    return filterByEmpresa(all, empresaId).filter((lote) => incluirSistema || !ORIGENS_SISTEMA.includes(lote.origem));
  },

  async getById(id) {
    const all = await base44.entities.Lote.list();
    return all.find((lote) => lote.id === id) || null;
  },

  async create(data, { empresaId } = {}) {
    const allLotes = await base44.entities.Lote.list();
    return base44.entities.Lote.create({
      ...data,
      empresa_id: empresaId || data.empresa_id,
      numero_lote: data.numero_lote || getNextNumeroLote(allLotes),
      status: data.status || "Ativo",
      campos_personalizados: data.campos_personalizados || {}
    });
  },

  async update(id, data) {
    return base44.entities.Lote.update(id, {
      ...data,
      campos_personalizados: data.campos_personalizados || {}
    });
  },

  async delete(id) {
    return base44.entities.Lote.delete(id);
  },

  async ensureDeleteAllowed() {
    // No restrictions
  },

  async listAreasAtivas() {
    return [];
  },

  async listLotesComMovimentacoes() {
    return [];
  },

  async listCamposPersonalizados() {
    return [];
  },
};

export default loteRepository;