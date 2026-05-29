import { EMP_TEST_RECORDS } from "./empSeedData";

const STORAGE_KEY = "emp_cadastro_local_v1";
const SEED_FLAG_KEY = "emp_cadastro_seeded_v1";

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
    if (localStorage.getItem(SEED_FLAG_KEY) === "1") return readAll();
    const existing = readAll();
    if (existing.length > 0) {
      localStorage.setItem(SEED_FLAG_KEY, "1");
      return existing;
    }
    const seeded = EMP_TEST_RECORDS.map((record, index) => ({
      ...record,
      id: `seed-${index + 1}`,
      codigo_empresa: index + 1,
      campos_personalizados: {},
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    }));
    writeAll(seeded);
    localStorage.setItem(SEED_FLAG_KEY, "1");
    return seeded;
  }
};

export default empLocalStore;
