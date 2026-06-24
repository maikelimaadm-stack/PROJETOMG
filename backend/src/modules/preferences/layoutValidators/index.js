import {
  EMPRESAS_FORM_LAYOUT_SCREEN_KEY,
  validateAndNormalizeEmpresasFormLayout,
} from "../../../shared/layout/empresasFormLayoutValidate.mjs";

const layoutValidators = {
  [EMPRESAS_FORM_LAYOUT_SCREEN_KEY]: validateAndNormalizeEmpresasFormLayout,
};

const FORBIDDEN_TABLE_KEYS = new Set([
  "groupBy",
  "groupByColumns",
  "grouping",
  "pinnedRight",
  "pinnedRightColumnIds",
  "rightPinnedColumns",
]);

const MAX_PREFERENCES_PAYLOAD_BYTES = 256 * 1024;

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const buildScreenKey = (modulo, tela) =>
  `${String(modulo || "").trim()}.${String(tela || "").trim()}`;

export const parseScopeFromScreenKey = (screenKey) => {
  const normalized = String(screenKey || "").trim();
  if (!normalized) {
    throw withStatus("Chave de tela inválida.", 400);
  }
  const [moduloRaw, ...rest] = normalized.split(".");
  const hasScopeSplit = rest.length > 0;
  const modulo = String(hasScopeSplit ? moduloRaw : "legacy")
    .trim()
    .toLowerCase();
  const tela = String(hasScopeSplit ? rest.join(".") : normalized)
    .trim()
    .toLowerCase();
  if (!modulo) {
    throw withStatus("Chave de tela inválida.", 400);
  }
  return { modulo, tela, screenKey: buildScreenKey(modulo, tela) };
};

const sanitizeTablePreferences = (tableConfig = {}) => {
  const next = { ...tableConfig };
  FORBIDDEN_TABLE_KEYS.forEach((key) => {
    if (key in next) delete next[key];
  });
  return next;
};

const sanitizeGenericPreferences = (config = {}) => {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw withStatus("Configuração inválida.", 400);
  }
  const next = { ...config };
  if (next.table && typeof next.table === "object" && !Array.isArray(next.table)) {
    next.table = sanitizeTablePreferences(next.table);
  }
  return next;
};

const validatePayloadSize = (config) => {
  try {
    const bytes = Buffer.byteLength(JSON.stringify(config), "utf8");
    if (bytes > MAX_PREFERENCES_PAYLOAD_BYTES) {
      throw withStatus("Configuração excede tamanho máximo permitido.", 413);
    }
  } catch (error) {
    if (error?.statusCode) throw error;
    throw withStatus("Configuração inválida.", 400);
  }
};

export const validatePreferenceConfig = ({ modulo, tela, config }) => {
  const screenKey = buildScreenKey(modulo, tela);
  const validator = layoutValidators[screenKey];
  const validated = validator ? validator(config) : sanitizeGenericPreferences(config);
  validatePayloadSize(validated);
  return validated;
};
