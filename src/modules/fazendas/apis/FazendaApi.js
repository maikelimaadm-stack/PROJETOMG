import { apiClient } from "@/apis/http/apiClient";

const BASE_PATH = "/api/fazendas";
const FIELDS_PATH = `${BASE_PATH}/campos`;

const toQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") return;
    if (typeof value === "object") {
      query.set(key, JSON.stringify(value));
      return;
    }
    query.set(key, String(value));
  });
  const parsed = query.toString();
  return parsed ? `?${parsed}` : "";
};

export const FazendaApi = {
  async list(params = {}) {
    const payload = await apiClient.get(`${BASE_PATH}${toQuery(params)}`);
    return {
      items: payload?.items || [],
      total: Number(payload?.total || 0),
      page: Number(payload?.page || 1),
      pageSize: Number(payload?.pageSize || params.pageSize || 50),
      totalPages: Number(payload?.totalPages || 1),
    };
  },

  async get(id) {
    const payload = await apiClient.get(`${BASE_PATH}/${id}`);
    return payload?.item || null;
  },

  async create(data) {
    const payload = await apiClient.post(BASE_PATH, data);
    return payload?.item || payload;
  },

  async update(id, data) {
    const payload = await apiClient.put(`${BASE_PATH}/${id}`, data);
    return payload?.item || payload;
  },

  async remove(id) {
    await apiClient.delete(`${BASE_PATH}/${id}`);
    return true;
  },

  async listFields({ mode = "aplicavel" } = {}) {
    const payload = await apiClient.get(`${FIELDS_PATH}${toQuery({ mode })}`);
    return payload?.items || [];
  },

  async createField(data) {
    const payload = await apiClient.post(FIELDS_PATH, data);
    return payload?.item || payload;
  },

  async updateField(id, data) {
    const payload = await apiClient.put(`${FIELDS_PATH}/${id}`, data);
    return payload?.item || payload;
  },

  async removeField(id) {
    await apiClient.delete(`${FIELDS_PATH}/${id}`);
    return true;
  },

  async listOptions(sources = []) {
    const payload = await apiClient.post(`${BASE_PATH}/options`, { sources });
    return payload?.items || {};
  },
};

