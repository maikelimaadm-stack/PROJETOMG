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
      nextCursor: payload?.nextCursor || null,
    };
  },

  async getEmpresa(id) {
    const payload = await apiClient.get(`${EMPRESAS_PATH}/${id}`, recordScope(id));
    return payload?.item || null;
  },

  async createEmpresa(data) {
    return apiClient.post(EMPRESAS_PATH, data, CADASTRO_LIST_SCOPE);
  },

  async updateEmpresa(id, data) {
    const payload = await apiClient.put(`${EMPRESAS_PATH}/${id}`, data, recordScope(id));
    return payload?.item || payload;
  },

  async deleteEmpresa(id) {
    return apiClient.delete(`${EMPRESAS_PATH}/${id}`, recordScope(id));
  },

  async listCamposPersonalizados({ mode = "aplicavel" } = {}) {
    const payload = await apiClient.get(`${CAMPOS_PATH}${toQuery({ mode })}`, CADASTRO_LIST_SCOPE);
    return payload?.items || [];
  },

  async listCamposPaginated(params = {}) {
    const payload = await apiClient.get(`${CAMPOS_PATH}${toQuery({ mode: "config", ...params })}`, CADASTRO_LIST_SCOPE);
    return {
      items: payload?.items || [],
      total: Number(payload?.total || 0),
      page: Number(payload?.page || 1),
      pageSize: Number(payload?.pageSize || params.pageSize || 50),
      totalPages: Number(payload?.totalPages || 1),
    };
  },

  async listDistinctColumnValues(params = {}) {
    const payload = await apiClient.get(`${EMPRESAS_PATH}/distinct${toQuery(params)}`, CADASTRO_LIST_SCOPE);
    return {
      items: payload?.items || [],
    };
  },

  async listEmpresasSelector(params = {}) {
    const payload = await apiClient.get(`${EMPRESAS_PATH}/selector${toQuery(params)}`, CADASTRO_LIST_SCOPE);
    return {
      items: payload?.items || [],
      total: Number(payload?.total || 0),
      page: Number(payload?.page || 1),
      pageSize: Number(payload?.pageSize || params.pageSize || 20),
      totalPages: Number(payload?.totalPages || 1),
    };
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

  async downloadExport(params = {}) {
    const format = params.format === "excel" ? "excel" : "csv";
    const extension = format === "excel" ? "xls" : "csv";
    const query = toQuery({
      format,
      search: params.search,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      filters: params.filters,
      ids: params.ids,
    });
    return apiClient.download(`${EMPRESAS_PATH}/export${query}`, {
      filename: `empresas-${new Date().toISOString().slice(0, 10)}.${extension}`,
    });
  },
};
