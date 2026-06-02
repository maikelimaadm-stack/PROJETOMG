import { apiClient } from "@/apis/http/apiClient";

export const AnexosApi = {
  async list(entityName, recordId) {
    const query = new URLSearchParams();
    if (entityName) query.set("entityName", entityName);
    if (recordId) query.set("recordId", recordId);
    const payload = await apiClient.get(`/api/anexos${query.toString() ? `?${query}` : ""}`);
    return payload?.items || [];
  },

  async remove(id) {
    await apiClient.delete(`/api/anexos/${id}`);
    return true;
  },

  async create(data) {
    const payload = await apiClient.post("/api/anexos", data);
    return payload?.item || payload;
  },

  async uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    const payload = await apiClient.post("/api/anexos/upload", formData);
    return {
      file_url: payload?.file_url || payload?.url || "",
      storage_path: payload?.storage_path || null,
    };
  },
};
