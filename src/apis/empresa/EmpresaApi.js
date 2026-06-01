import { apiClient } from "@/apis/http/apiClient";

const EMPRESAS_PATH = "/api/empresas";
const CAMPOS_PATH = "/api/empresas/campos";

const toQuery = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const EmpresaApi = {
  async isAvailable() {
    try {
      await apiClient.get("/api/health");
      return true;
    } catch {
      return false;
    }
  },

  async listEmpresas() {
    const payload = await apiClient.get(EMPRESAS_PATH);
    return payload?.items || [];
  },

  async getEmpresa(id) {
    const payload = await apiClient.get(`${EMPRESAS_PATH}/${id}`);
    return payload?.item || null;
  },

  async createEmpresa(data) {
    const payload = await apiClient.post(EMPRESAS_PATH, data);
    return payload?.item || payload;
  },

  async updateEmpresa(id, data) {
    const payload = await apiClient.put(`${EMPRESAS_PATH}/${id}`, data);
    return payload?.item || payload;
  },

  async deleteEmpresa(id) {
    await apiClient.delete(`${EMPRESAS_PATH}/${id}`);
    return true;
  },

  async listCamposPersonalizados() {
    const payload = await apiClient.get(CAMPOS_PATH);
    return payload?.items || [];
  },

  async createCampoPersonalizado(data) {
    const payload = await apiClient.post(CAMPOS_PATH, data);
    return payload?.item || payload;
  },

  async updateCampoPersonalizado(id, data) {
    const payload = await apiClient.put(`${CAMPOS_PATH}/${id}`, data);
    return payload?.item || payload;
  },

  async deleteCampoPersonalizado(id) {
    await apiClient.delete(`${CAMPOS_PATH}/${id}`);
    return true;
  },

  async listOptionsSources(sources = []) {
    const payload = await apiClient.post("/api/empresas/options", { sources });
    return payload?.items || {};
  },

  async listAnexos(entityName, recordId) {
    const payload = await apiClient.get(`/api/anexos${toQuery({ entityName, recordId })}`);
    return payload?.items || [];
  },
};
