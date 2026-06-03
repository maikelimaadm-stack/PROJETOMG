import { apiClient } from "@/apis/http/apiClient";

const EMPRESAS_PATH = "/api/empresas";
const CAMPOS_PATH = "/api/empresas/campos";

/** Usa o seletor global do header: empresa individual ou "Todas as Empresas". */
const CADASTRO_LIST_SCOPE = {};
/** Operações em um registro específico usam o ID do registro como escopo. */
const recordScope = (id) => ({ empresaHeader: id });

const toQuery = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") return;
    if (typeof value === "object") {
      searchParams.set(key, JSON.stringify(value));
      return;
    }
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const EmpresaApi = {
  ping() {
    return apiClient.get("/api/health");
  },

  async listEmpresas(params = {}) {
    const payload = await apiClient.get(`${EMPRESAS_PATH}${toQuery(params)}`, CADASTRO_LIST_SCOPE);
    return {
      items: payload?.items || [],
      total: Number(payload?.total || 0),
      page: Number(payload?.page || 1),
      pageSize: Number(payload?.pageSize || params.pageSize || 50),
      totalPages: Number(payload?.totalPages || 1),
    };
  },

  async getEmpresa(id) {
    const payload = await apiClient.get(`${EMPRESAS_PATH}/${id}`, recordScope(id));
    return payload?.item || null;
  },

  async createEmpresa(data) {
    const payload = await apiClient.post(EMPRESAS_PATH, data, CADASTRO_LIST_SCOPE);
    return payload?.item || payload;
  },

  async updateEmpresa(id, data) {
    const payload = await apiClient.put(`${EMPRESAS_PATH}/${id}`, data, recordScope(id));
    return payload?.item || payload;
  },

  async deleteEmpresa(id) {
    await apiClient.delete(`${EMPRESAS_PATH}/${id}`, recordScope(id));
    return true;
  },

  async listCamposPersonalizados({ mode = "aplicavel" } = {}) {
    const payload = await apiClient.get(`${CAMPOS_PATH}${toQuery({ mode })}`, CADASTRO_LIST_SCOPE);
    return payload?.items || [];
  },

  async listOptionsSources(sources = []) {
    const payload = await apiClient.post("/api/empresas/options", { sources }, CADASTRO_LIST_SCOPE);
    return payload?.items || {};
  },

  async listAnexos(entityName, recordId) {
    const payload = await apiClient.get(
      `/api/anexos${toQuery({ entityName, recordId })}`,
      recordScope(recordId)
    );
    return payload?.items || [];
  },
};
