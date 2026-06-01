import { apiClient } from "@/apis/http/apiClient";

const BASE_PATH = "/api/template";
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

export const TemplateApi = {
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
  get(id) {
    return apiClient.get(`${BASE_PATH}/${id}`);
  },
  create(data) {
    return apiClient.post(BASE_PATH, data);
  },
  update(id, data) {
    return apiClient.put(`${BASE_PATH}/${id}`, data);
  },
  remove(id) {
    return apiClient.delete(`${BASE_PATH}/${id}`);
  },
  listFields() {
    return apiClient.get(FIELDS_PATH);
  },
  createField(data) {
    return apiClient.post(FIELDS_PATH, data);
  },
  updateField(id, data) {
    return apiClient.put(`${FIELDS_PATH}/${id}`, data);
  },
  removeField(id) {
    return apiClient.delete(`${FIELDS_PATH}/${id}`);
  },
};

