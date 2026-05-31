import { buildAllTestRecords, buildValorForIndex, EMP_SEED_TARGET_COUNT } from "./empSeedData";
import empCamposLocalStore from "./empCamposLocalStore";
import { getNextCodigoEmpresa, stripEmpresaPersistPayload } from "./empCodigoUtils";

const STORAGE_KEY = "emp_cadastro_local_v1";
const SEED_FLAG_KEY = "emp_cadastro_seeded_v3";

const writeAll = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const repairMissingCodigos = (records) => {
  let changed = false;
  let max = getNextCodigoEmpresa(records) - 1;
  const next = records.map((record) => {
    const codigo = Number(record.codigo_empresa);
    if (Number.isFinite(codigo) && codigo > 0) return record;
    changed = true;
    max += 1;
    return { ...record, codigo_empresa: max };
  });
  return changed ? next : records;
};

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const records = raw ? JSON.parse(raw) : [];
    const repaired = repairMissingCodigos(records);
    if (repaired !== records) writeAll(repaired);
    return repaired;
  } catch {
    return [];
  }
};

const nextCodigo = (records) => getNextCodigoEmpresa(records);

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
    const payload = stripEmpresaPersistPayload(data);
    const record = {
      ...payload,
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      codigo_empresa: nextCodigo(records),
      campos_personalizados: payload.campos_personalizados || {},
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
    const payload = stripEmpresaPersistPayload(data);
    records[index] = {
      ...records[index],
      ...payload,
      id: records[index].id,
      codigo_empresa: records[index].codigo_empresa,
      updated_date: new Date().toISOString()
    };
    writeAll(records);
    return records[index];
  },

  delete(id) {
    const records = readAll();
    const next = records.filter((item) => item.id !== id);
    if (next.length === records.length) return false;
    writeAll(next);
    return true;
  },

  seedIfEmpty() {
    empCamposLocalStore.seedIfEmpty();
    const templates = buildAllTestRecords();
    let records = readAll();
    const seedVersion = localStorage.getItem(SEED_FLAG_KEY);

    if (seedVersion === "v3") {
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
    writeAll(records);
    localStorage.setItem(SEED_FLAG_KEY, "v3");
    return records;
  }
};

export default empLocalStore;
