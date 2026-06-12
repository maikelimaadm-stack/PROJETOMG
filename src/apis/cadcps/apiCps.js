import { apiClient } from "@/apis/http/apiClient";

const BASE = "/api/cadcps";

const toQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (typeof value === "object") {
      search.set(key, JSON.stringify(value));
      return;
    }
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const apiCps = {
  listTelas() {
    return apiClient.get(`${BASE}/telas`, { empresaHeader: false });
  },

  listCampos(params = {}) {
    return apiClient.get(`${BASE}/campos${toQuery(params)}`, { empresaHeader: false });
  },

  getCampo(id) {
    return apiClient.get(`${BASE}/campos/${id}`, { empresaHeader: false });
  },

  listHistorico(id) {
    return apiClient.get(`${BASE}/campos/${id}/historico`, { empresaHeader: false });
  },

  createCampo(data) {
    return apiClient.post(`${BASE}/campos`, data, { empresaHeader: false });
  },

  updateCampo(id, data) {
    return apiClient.put(`${BASE}/campos/${id}`, data, { empresaHeader: false });
  },

  deleteCampo(id) {
    return apiClient.delete(`${BASE}/campos/${id}`, { empresaHeader: false });
  },

  listApplicable(entityName) {
    return apiClient.get(`${BASE}/aplicavel/${encodeURIComponent(entityName)}`, {
      empresaHeader: true,
    });
  },
};
