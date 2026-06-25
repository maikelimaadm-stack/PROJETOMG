import { apiClient } from "@/apis/http/apiClient";

export const USER_PREFERENCE_SCREENS = {
  empresasFormLayout: "empresas.form_layout",
};

const parseScopeFromScreenKey = (screenKey) => {
  const normalized = String(screenKey || "").trim().toLowerCase();
  if (!normalized) return { modulo: "legacy", tela: "default" };
  const [modulo, ...rest] = normalized.split(".");
  if (rest.length === 0) return { modulo: "legacy", tela: normalized };
  return {
    modulo: modulo || "legacy",
    tela: rest.join(".") || "default",
  };
};

export const userPreferencesApi = {
  bootstrap() {
    return apiClient.get("/api/user/preferences/bootstrap", {
      empresaHeader: false,
    });
  },

  getByScope(modulo, tela) {
    return apiClient.get(
      `/api/user/preferences/${encodeURIComponent(modulo)}/${encodeURIComponent(tela)}`,
      { empresaHeader: false }
    );
  },

  saveByScope(modulo, tela, payload) {
    return apiClient.put(
      `/api/user/preferences/${encodeURIComponent(modulo)}/${encodeURIComponent(tela)}`,
      payload,
      { empresaHeader: false }
    );
  },

  patchByScope(modulo, tela, payload) {
    return apiClient.patch(
      `/api/user/preferences/${encodeURIComponent(modulo)}/${encodeURIComponent(tela)}`,
      payload,
      { empresaHeader: false }
    );
  },

  get(screenKey) {
    const { modulo, tela } = parseScopeFromScreenKey(screenKey);
    return this.getByScope(modulo, tela).then((response) => ({
      screenKey,
      config: response?.preferencias,
      updatedAt: response?.updatedAt,
    }));
  },

  save(screenKey, config, options = {}) {
    const { modulo, tela } = parseScopeFromScreenKey(screenKey);
    return this.saveByScope(modulo, tela, {
      preferencias: config,
      expectedUpdatedAt: options.expectedUpdatedAt,
      expectedRevision: options.expectedRevision,
      versao_schema: options.versao_schema ?? config?.version ?? 1,
    }).then((response) => ({
      screenKey,
      config: response?.preferencias,
      updatedAt: response?.updatedAt,
      revision: response?.revision,
    }));
  },
};
