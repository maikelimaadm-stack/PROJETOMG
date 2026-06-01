const STORAGE_KEY = "emp_campos_personalizados_local_v1";
const SEED_FLAG_KEY = "emp_campos_seeded_v1";
const AGGR_KEY = "emp_table_aggregation_config";

export const CAMPO_VALOR = {
  id: "campo-valor-local",
  label: "VALOR",
  field_name: "valor",
  tipo: "number",
  placeholder: "0,00",
  usar_decimal: true,
  decimal_places: 2,
  alinhamento: "right",
  largura_coluna: 120,
  ordem_tabela: 15,
  visivel_form: true,
  visivel_tabela: true,
  visivel_relatorio: true,
  ordenavel: true,
  filtravel: true,
  agregacao_tipo: "sum",
  ativo: true
};

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
  window.dispatchEvent(new Event("emp-layout-updated"));
};

const empCamposLocalStore = {
  list() {
    return [...readAll()].sort((a, b) => (a.ordem_tabela ?? 999) - (b.ordem_tabela ?? 999));
  },

  seedIfEmpty() {
    if (localStorage.getItem(SEED_FLAG_KEY) === "v1" && readAll().length > 0) {
      seedAggregationConfig();
      return readAll();
    }

    writeAll([CAMPO_VALOR]);
    localStorage.setItem(SEED_FLAG_KEY, "v1");
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
