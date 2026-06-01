const LAST_CODIGO_KEY = "emp_cadastro_last_codigo_empresa";

const SYSTEM_FIELDS = new Set([
  "id",
  "codigo_empresa",
  "created_date",
  "updated_date",
  "created_by",
  "_isDuplicate"
]);

export const getMaxCodigoFromRecords = (records = []) =>
  records.reduce((acc, item) => {
    const value = Number(item?.codigo_empresa);
    return Number.isFinite(value) && value > 0 ? Math.max(acc, value) : acc;
  }, 0);

export const readLastIssuedCodigo = () => {
  try {
    const value = Number(localStorage.getItem(LAST_CODIGO_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
};

export const syncLastIssuedCodigo = (records = []) => {
  const next = Math.max(readLastIssuedCodigo(), getMaxCodigoFromRecords(records));
  if (next > 0) localStorage.setItem(LAST_CODIGO_KEY, String(next));
  return next;
};

export const reserveNextCodigoEmpresa = (records = []) => {
  const baseline = Math.max(readLastIssuedCodigo(), getMaxCodigoFromRecords(records));
  const next = baseline + 1;
  localStorage.setItem(LAST_CODIGO_KEY, String(next));
  return next;
};

export const getNextCodigoEmpresa = reserveNextCodigoEmpresa;

export const stripEmpresaPersistPayload = (data = {}) => {
  const payload = { ...(data || {}) };
  SYSTEM_FIELDS.forEach((field) => {
    delete payload[field];
  });
  return payload;
};

export const normalizeEmpresaRecord = (record, fallback = null) => {
  if (!record) return fallback;
  if (Array.isArray(record)) return record[0] || fallback;
  if (record?.data && typeof record.data === "object") return record.data;
  if (record?.id || record?.codigo_empresa != null) return record;
  return fallback ? { ...fallback, ...record } : record;
};

export const findEmpresaInList = (list = [], savedRecord) => {
  if (!savedRecord) return null;

  if (savedRecord.id) {
    const byId = list.find((item) => item.id === savedRecord.id);
    if (byId) return byId;
  }

  const codigo = Number(savedRecord.codigo_empresa);
  if (Number.isFinite(codigo) && codigo > 0) {
    return list.find((item) => Number(item.codigo_empresa) === codigo) ?? null;
  }

  return null;
};
