import { apiClient } from "@/apis/http/apiClient";

export const MetricsApi = {
  async getContadores() {
    return apiClient.get("/api/metrics/contadores");
  },
};
