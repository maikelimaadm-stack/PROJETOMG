const SYSTEM_FIELDS = new Set([
  "id",
  "codigo_empresa",
  "created_date",
  "updated_date",
  "created_by",
  "_isDuplicate"
]);

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
