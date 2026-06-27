/**
 * Metadata declarativa de filtros laterais (sidebar) por módulo.
 */
const DEFAULT_STATUS_OPTIONS = [
  { value: "Todos", label: "Todos" },
  { value: "Ativo", label: "Ativo" },
  { value: "Inativo", label: "Inativo" },
];

const EMPRESAS_STATUS_OPTIONS = [
  { value: "Todos", label: "Todos" },
  { value: "Ativa", label: "Ativa" },
  { value: "Inativa", label: "Inativa" },
];

/**
 * @param {object[]} columns — metadata.table.columns
 * @param {object} [options]
 */
export function buildMakSidebarFilterFromColumns(columns = [], options = {}) {
  const {
    statusKey = "status",
    statusLabel = "Status",
    statusOptions = DEFAULT_STATUS_OPTIONS,
    excludeKeys = new Set([statusKey]),
  } = options;

  const textFields = (columns ?? [])
    .filter((col) => col?.filtravel !== false && !excludeKeys.has(col.id))
    .map((col) => ({
      key: col.id,
      label: col.label ?? col.id,
      column: col.id,
    }));

  const statusField = {
    key: statusKey,
    label: statusLabel,
    column: statusKey,
    options: statusOptions,
    normalizeRead: options.normalizeStatusRead,
    normalizeWrite: options.normalizeStatusWrite,
  };

  return {
    textFields,
    statusField,
  };
}

export function buildMakEmpresasSidebarFilterMetadata() {
  return {
    textFields: [
      { key: "razao_social", label: "Razão Social", column: "razao_social" },
      { key: "nome_fantasia", label: "Nome Fantasia", column: "nome_fantasia" },
      { key: "cnpj", label: "CNPJ", column: "cpf_cnpj" },
      { key: "telefone", label: "Telefone", column: "telefone" },
      { key: "cidade", label: "Cidade", column: "cidade" },
      { key: "uf", label: "UF", column: "estado" },
    ],
    statusField: {
      key: "status",
      label: "Status",
      column: "status",
      options: EMPRESAS_STATUS_OPTIONS,
      normalizeRead: (values) => {
        const current = values?.status;
        if (Array.isArray(current) && current.length > 0) {
          if (current[0] === "Ativo") return "Ativa";
          if (current[0] === "Inativo") return "Inativa";
          return current[0];
        }
        return "Todos";
      },
    },
  };
}

export function buildMakFiltersMetadata(overrides = {}) {
  return {
    sidebar: buildMakSidebarFilterFromColumns([], overrides.sidebar ?? {}),
    ...overrides,
  };
}

export default buildMakFiltersMetadata;
