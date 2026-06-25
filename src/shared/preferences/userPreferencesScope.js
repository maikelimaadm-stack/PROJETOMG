/**
 * Escopo ativo de preferências por tenant + usuário.
 * Chave lógica: cliente_id + usuario_id + modulo + tela + field
 */

const PREF_STORAGE_VERSION = "v2";
const PREF_STORAGE_PREFIX = `mg_pref_${PREF_STORAGE_VERSION}`;
const TEMP_FILTER_STORAGE_PREFIX = "mg_temp_filter_v1";

let activeScope = {
  clienteId: null,
  userId: null,
};

export const EMPRESAS_LISTAGEM_MODULO = "empresas";
export const EMPRESAS_LISTAGEM_TELA = "listagem";
export const EMPRESAS_FORM_TELA = "form_layout";

export const setActiveUserPreferencesScope = ({ clienteId, userId } = {}) => {
  activeScope = {
    clienteId: clienteId ? String(clienteId).trim() : null,
    userId: userId ? String(userId).trim() : null,
  };
};

export const getActiveUserPreferencesScope = () => ({ ...activeScope });

export const clearActiveUserPreferencesScope = () => {
  activeScope = { clienteId: null, userId: null };
};

export const buildUserPrefStorageKey = ({
  clienteId,
  userId,
  modulo,
  tela,
  field,
}) => {
  const c = String(clienteId || "anon").trim();
  const u = String(userId || "anon").trim();
  const m = String(modulo || "legacy").trim().toLowerCase();
  const t = String(tela || "default").trim().toLowerCase();
  const f = String(field || "").trim();
  return `${PREF_STORAGE_PREFIX}:${c}:${u}:${m}:${t}:${f}`;
};

export const buildScopedTempFilterStorageKey = ({
  clienteId,
  userId,
  modulo = EMPRESAS_LISTAGEM_MODULO,
  tela = EMPRESAS_LISTAGEM_TELA,
} = {}) => {
  const c = String(clienteId || activeScope.clienteId || "anon").trim();
  const u = String(userId || activeScope.userId || "anon").trim();
  const m = String(modulo || EMPRESAS_LISTAGEM_MODULO).trim().toLowerCase();
  const t = String(tela || EMPRESAS_LISTAGEM_TELA).trim().toLowerCase();
  return `${TEMP_FILTER_STORAGE_PREFIX}:${c}:${u}:${m}:${t}`;
};

export const buildUserScreenPreferencesQueryKey = ({
  clienteId,
  userId,
  modulo,
  tela,
  prefix = "user-screen-preferences",
} = {}) => {
  const scope = {
    clienteId: clienteId || activeScope.clienteId,
    userId: userId || activeScope.userId,
    modulo,
    tela,
  };
  return [prefix, scope.clienteId, scope.userId, scope.modulo, scope.tela].filter(
    (part) => part != null && String(part).trim() !== ""
  );
};

const LISTAGEM_LEGACY_FIELDS = new Set([
  "emp_col_widths",
  "emp_col_frozen",
  "emp_col_visiveis",
  "emp_col_vis_initialized_v1",
  "emp_col_ordem",
  "emp_table_aggregation_config",
  "emp_table_page_size",
  "emp_col_filters_v2",
  "emp_sort_columns_v1",
  "emp_col_sizing_mode_v1",
  "emp_filter_max_visible_v1",
  "emp_view_mode_v1",
  "emp_launch_panel_style_v1",
  "emp_filter_fields_layout_v1",
  "emp_search_dropdown_vis_v1",
  "emp_search_fav_v1",
  "emp_search_vis_fields_v2",
  "emp_search_vis_fields_v1",
  "emp_cards_layout_v1",
  "emp_load_batch_size_v1",
]);

export const isListagemLegacyPreferenceField = (fieldKey) =>
  LISTAGEM_LEGACY_FIELDS.has(String(fieldKey || "").trim());

export const resolveListagemPreferenceStorageKey = (legacyFieldKey) => {
  const field = String(legacyFieldKey || "").trim();
  if (!field) return field;
  const { clienteId, userId } = activeScope;
  if (!clienteId || !userId) return field;
  if (!isListagemLegacyPreferenceField(field) && !field.startsWith("emp_")) {
    return field;
  }
  return buildUserPrefStorageKey({
    clienteId,
    userId,
    modulo: EMPRESAS_LISTAGEM_MODULO,
    tela: EMPRESAS_LISTAGEM_TELA,
    field,
  });
};

export const resolveFormLayoutStorageKey = ({ userId, clienteId, storagePrefix = "emp" } = {}) => {
  const resolvedUserId = userId || activeScope.userId;
  const resolvedClienteId = clienteId || activeScope.clienteId;
  if (!resolvedUserId) return `cadastro_${storagePrefix}_form_layout_config`;
  if (!resolvedClienteId) return `cadastro:${resolvedUserId}:${storagePrefix}:form_layout_config`;
  return `cadastro:${resolvedClienteId}:${resolvedUserId}:${storagePrefix}:form_layout_config`;
};

export const resolveLegacyFormLayoutStorageKey = ({ userId, storagePrefix = "emp" } = {}) => {
  const resolvedUserId = userId || activeScope.userId;
  if (!resolvedUserId) return `cadastro_${storagePrefix}_form_layout_config`;
  return `cadastro:${resolvedUserId}:${storagePrefix}:form_layout_config`;
};

export const preferenceEventMatchesScope = (detail = {}) => {
  const { clienteId, userId } = activeScope;
  if (!clienteId || !userId) return true;
  if (detail.clienteId && String(detail.clienteId) !== String(clienteId)) return false;
  if (detail.userId && String(detail.userId) !== String(userId)) return false;
  return true;
};

export const USER_PREFERENCES_SCOPE_VERSION = PREF_STORAGE_VERSION;
