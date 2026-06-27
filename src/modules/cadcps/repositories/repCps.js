import { apiCps } from "@/apis/cadcps/apiCps";

const repCps = {
  async listTelas() {
    const payload = await apiCps.listTelas();
    return payload?.items || [];
  },

  async listPage(params) {
    return apiCps.listCampos(params);
  },

  async getById(id) {
    const payload = await apiCps.getCampo(id);
    return payload?.item || null;
  },

  async listHistorico(id) {
    const payload = await apiCps.listHistorico(id);
    return payload?.items || [];
  },

  async create(data) {
    const payload = await apiCps.createCampo(data);
    return {
      item: payload?.item || payload,
      contadores: payload?.contadores || null,
    };
  },

  async update(id, data) {
    const payload = await apiCps.updateCampo(id, data);
    return payload?.item || payload;
  },

  async remove(id) {
    const payload = await apiCps.deleteCampo(id);
    return { ok: true, contadores: payload?.contadores || null };
  },

  async delete(id) {
    return this.remove(id);
  },

  async list(params = {}) {
    const result = await this.listPage(params);
    return result.items || [];
  },

  async get(id) {
    return this.getById(id);
  },

  async listDistinctColumnValues() {
    return { items: [] };
  },
};

export default repCps;
