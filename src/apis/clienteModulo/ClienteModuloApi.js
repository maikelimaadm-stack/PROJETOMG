import { apiClient } from "@/apis/http/apiClient";

export const ClienteModuloApi = {
  async listModulos() {
    const response = await apiClient.get("/api/cliente-modulos");
    return response?.items || [];
  },

  async updateModulo(modulo, ativo) {
    const response = await apiClient.put(`/api/cliente-modulos/${modulo}`, { ativo });
    return response?.item || null;
  },
};
