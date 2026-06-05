const SYSTEM_FIELDS = new Set([
  "id",
  "codempresa",
  "created_date",
  "updated_date",
  "created_by",
  "_isDuplicate",
  "_isPersisting",
]);

export const stripEmpresaPersistPayload = (data = {}) => {
  const payload = { ...(data || {}) };
  SYSTEM_FIELDS.forEach((field) => {
    delete payload[field];
  });
  return payload;
};

const mapApiTimestamps = (record) => {
  if (!record || typeof record !== "object") return record;
  const mapped = { ...record };
  if (mapped.updatedAt && !mapped.updated_date) mapped.updated_date = mapped.updatedAt;
  if (mapped.createdAt && !mapped.created_date) mapped.created_date = mapped.createdAt;
  return mapped;
};

export const normalizeEmpresaRecord = (record, fallback = null) => {
  if (!record) return fallback;
  if (Array.isArray(record)) return mapApiTimestamps(record[0]) || fallback;
  if (record?.data && typeof record.data === "object") return mapApiTimestamps(record.data);
  if (record?.id || record?.codempresa != null) return mapApiTimestamps(record);
  return fallback ? mapApiTimestamps({ ...fallback, ...record }) : mapApiTimestamps(record);
};

export const findEmpresaInList = (list = [], savedRecord) => {
  if (!savedRecord) return null;

  if (savedRecord.id) {
    const byId = list.find((item) => item.id === savedRecord.id);
    if (byId) return byId;
  }

  const codigo = Number(savedRecord.codempresa);
  if (Number.isFinite(codigo) && codigo > 0) {
    return list.find((item) => Number(item.codempresa) === codigo) ?? null;
  }

  return null;
};
