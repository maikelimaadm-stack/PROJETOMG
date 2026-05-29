import { buildAllTestRecords, buildValorForIndex, EMP_SEED_TARGET_COUNT } from "./empSeedData";
import empCamposLocalStore from "./empCamposLocalStore";

const STORAGE_KEY = "emp_cadastro_local_v1";
const SEED_FLAG_KEY = "emp_cadastro_seeded_v3";

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeAll = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const nextCodigo = (records) => {
  const max = records.reduce((acc, item) => Math.max(acc, Number(item.codigo_empresa) || 0), 0);
  return max + 1;
};

const toStoredRecord = (record, index) => ({
  ...record,
  id: `seed-${index + 1}`,
  codigo_empresa: index + 1,
  campos_personalizados: { valor: buildValorForIndex(index) },
  created_date: new Date().toISOString(),
  updated_date: new Date().toISOString()
});

const ensureValorOnRecords = (records) => {
  let changed = false;
  const next = records.map((record, index) => {
    const valor = record?.campos_personalizados?.valor;
    if (valor !== undefined && valor !== null && valor !== "") return record;
    changed = true;
    const idx = Math.max(0, Number(record.codigo_empresa || index + 1) - 1);
    return {
      ...record,
      campos_personalizados: {
        ...(record.campos_personalizados || {}),
        valor: buildValorForIndex(idx)
      }
    };
  });
  return changed ? next : records;
};

const empLocalStore = {
  list() {
    return [...readAll()].sort((a, b) => Number(b.codigo_empresa || 0) - Number(a.codigo_empresa || 0));
  },

  filter({ id }) {
    return readAll().filter((item) => item.id === id);
  },

  create(data) {
    const records = readAll();
    const record = {
      ...data,
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      codigo_empresa: data.codigo_empresa ?? nextCodigo(records),
      campos_personalizados: data.campos_personalizados || {},
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    records.push(record);
    writeAll(records);
    return record;
  },

  update(id, data) {
    const records = readAll();
    const index = records.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Registro não encontrado");
    records[index] = { ...records[index], ...data, updated_date: new Date().toISOString() };
    writeAll(records);
    return records[index];
  },

  delete(id) {
    writeAll(readAll().filter((item) => item.id !== id));
  },

  seedIfEmpty() {
    empCamposLocalStore.seedIfEmpty();
    const templates = buildAllTestRecords();
    let records = readAll();
    const seedVersion = localStorage.getItem(SEED_FLAG_KEY);

    if (seedVersion === "v3" && records.length >= EMP_SEED_TARGET_COUNT) {
      const withValor = ensureValorOnRecords(records);
      if (withValor !== records) {
        writeAll(withValor);
        records = withValor;
      }
      return records;
    }

    const onlySeedData = records.length === 0 || records.every((item) => String(item.id || "").startsWith("seed-"));

    if (onlySeedData) {
      records = templates.map(toStoredRecord);
      writeAll(records);
      localStorage.setItem(SEED_FLAG_KEY, "v3");
      return records;
    }

    records = ensureValorOnRecords(records);

    if (records.length < EMP_SEED_TARGET_COUNT) {
      const startAt = records.length;
      const extras = templates.slice(startAt, EMP_SEED_TARGET_COUNT).map((record, offset) =>
        toStoredRecord(record, startAt + offset)
      );
      records = [...records, ...extras];
    }

    writeAll(records);
    localStorage.setItem(SEED_FLAG_KEY, "v3");
    return records;
  }
};

export default empLocalStore;
