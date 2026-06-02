import { apiClient } from "@/apis/http/apiClient";

export const USER_PREFERENCE_SCREENS = {
  empresasFormLayout: "empresas.form_layout",
};

export const userPreferencesApi = {
  get(screenKey) {
    return apiClient.get(`/api/preferences/${encodeURIComponent(screenKey)}`, {
      empresaHeader: false,
    });
  },

  save(screenKey, config) {
    return apiClient.put(
      `/api/preferences/${encodeURIComponent(screenKey)}`,
      { config },
      { empresaHeader: false }
    );
  },
};
