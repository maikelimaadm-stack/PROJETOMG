import { apiClient } from "@/apis/http/apiClient";

const CADASTRO_CAMPOS_PATH = "/api/cadastro";

/**
 * API genérica de campos personalizados por entidade de cadastro.
 */
export const cadastroFieldsApi = {
  listCampos(entityName, { mode = "aplicavel" } = {}) {
    const encoded = encodeURIComponent(entityName);
    const query = mode ? `?mode=${encodeURIComponent(mode)}` : "";
    return apiClient
      .get(`${CADASTRO_CAMPOS_PATH}/${encoded}/campos${query}`, { empresaHeader: false })
      .then((payload) => payload?.items || [])
      .catch(() => {
        if (entityName === "EmpresaCadastro") {
          return listCamposViaEmpresasCompat(mode);
        }
        return apiClient
          .get(`/api/cadcps/aplicavel/${encoded}${query}`, { empresaHeader: false })
          .then((p) => p?.items || []);
      });
  },

  listOptions(entityName, sources = []) {
    const encoded = encodeURIComponent(entityName);
    return apiClient
      .post(`${CADASTRO_CAMPOS_PATH}/${encoded}/options`, { sources }, { empresaHeader: false })
      .then((payload) => payload?.items || {});
  },
};

/** @deprecated — use cadastroFieldsApi; mantém rota legada */
export async function listCamposViaEmpresasCompat(mode = "aplicavel") {
  const payload = await apiClient.get(`/api/empresas/campos?mode=${mode}`, { empresaHeader: false });
  return payload?.items || [];
}

export default cadastroFieldsApi;
