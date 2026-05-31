import { CAMPO_VALOR, DEMO_CAMPOS_PERSONALIZADOS } from "@/components/emp/empCamposDemoSeed";

const STORAGE_KEY = "emp_campos_personalizados_local_v1";
const SEED_FLAG_KEY = "emp_campos_seeded_v1";
const DEMO_20_FLAG_KEY = "emp_campos_demo_20_v1";
const AGGR_KEY = "emp_table_aggregation_config";

export { CAMPO_VALOR };

const DEFAULT_AGGREGATION = {
  "custom:valor": { enabled: true, type: "sum" }
};

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

const seedAggregationConfig = () => {
  const saved = localStorage.getItem(AGGR_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed["custom:valor"]?.enabled) return;
    } catch {
      /* merge below */
    }
  }
  localStorage.setItem(AGGR_KEY, JSON.stringify(DEFAULT_AGGREGATION));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("emp-layout-updated"));
  }
};

const mergeDemoCampos = (records) => {
  const byFieldName = new Map(records.map((item) => [item.field_name, item]));
  const merged = [...records];

  DEMO_CAMPOS_PERSONALIZADOS.forEach((demo) => {
    if (byFieldName.has(demo.field_name)) return;
    merged.push({
      ...demo,
      id: demo.id || `campo-demo-${demo.field_name}`
    });
  });

  return merged;
};

const seedDemoCamposIfNeeded = () => {
  if (localStorage.getItem(DEMO_20_FLAG_KEY) === "v1") {
    return readAll();
  }

  const merged = mergeDemoCampos(readAll());
  writeAll(merged);
  localStorage.setItem(DEMO_20_FLAG_KEY, "v1");
  localStorage.setItem(SEED_FLAG_KEY, "v1");
  seedAggregationConfig();
  return merged;
};

const empCamposLocalStore = {
  list() {
    seedDemoCamposIfNeeded();
    return [...readAll()].sort((a, b) => (a.ordem_tabela ?? 999) - (b.ordem_tabela ?? 999));
  },

  seedIfEmpty() {
    seedDemoCamposIfNeeded();

    if (readAll().length > 0) {
      seedAggregationConfig();
      return readAll();
    }

    writeAll(DEMO_CAMPOS_PERSONALIZADOS);
    localStorage.setItem(SEED_FLAG_KEY, "v1");
    localStorage.setItem(DEMO_20_FLAG_KEY, "v1");
    seedAggregationConfig();
    return readAll();
  },

  create(data) {
    const records = readAll();
    const record = {
      ...data,
      id: data.id || `campo-local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ativo: data.ativo !== false
    };
    records.push(record);
    writeAll(records);
    return record;
  },

  update(id, data) {
    const records = readAll();
    const index = records.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Campo personalizado não encontrado");
    records[index] = { ...records[index], ...data };
    writeAll(records);
    return records[index];
  },

  delete(id) {
    writeAll(readAll().filter((item) => item.id !== id));
  }
};

export default empCamposLocalStore;
