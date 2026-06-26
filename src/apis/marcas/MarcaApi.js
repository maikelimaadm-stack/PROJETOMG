import { apiClient } from "@/apis/http/apiClient";

const MARCAS_PATH = "/api/marcas";
const CADASTRO_LIST_SCOPE = {};

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

export const MarcaApi = {
  async list(params = {}) {
    const payload = await apiClient.get(`${MARCAS_PATH}${toQuery(params)}`, CADASTRO_LIST_SCOPE);
    return {
      items: payload?.items || [],
      total: Number(payload?.total || 0),
      page: Number(payload?.page || 1),
      pageSize: Number(payload?.pageSize || params.pageSize || 50),
      totalPages: Number(payload?.totalPages || 1),
    };
  },

  async get(id) {
    const payload = await apiClient.get(`${MARCAS_PATH}/${id}`, CADASTRO_LIST_SCOPE);
    return payload?.item || null;
  },

  async create(data) {
    return apiClient.post(MARCAS_PATH, data, CADASTRO_LIST_SCOPE);
  },

  async update(id, data) {
    const payload = await apiClient.put(`${MARCAS_PATH}/${id}`, data, CADASTRO_LIST_SCOPE);
    return payload?.item || payload;
  },

  async delete(id) {
    return apiClient.delete(`${MARCAS_PATH}/${id}`, CADASTRO_LIST_SCOPE);
  },
};
