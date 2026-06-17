import { ApiError, apiClient } from "@/apis/http/apiClient";

export const MetricsApi = {
  async getContadores() {
    try {
      return await apiClient.get("/api/metrics/contadores");
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        return {};
      }
      throw error;
    }
  },
};
