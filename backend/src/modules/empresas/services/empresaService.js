import { empresaRepository } from "../repositories/empresaRepository.js";

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeEmpresaPayload = (payload = {}, { isUpdate = false } = {}) => {
  const normalized = {
    razao_social: payload.razao_social || "",
    nome_fantasia: payload.nome_fantasia || "",
    tipo_pessoa: payload.tipo_pessoa || "PJ",
    tipo_vinculo: payload.tipo_vinculo || null,
    cpf_cnpj: payload.cpf_cnpj || "",
    inscricao_estadual: payload.inscricao_estadual || "",
    telefone: payload.telefone || "",
    whatsapp: payload.whatsapp || "",
    email: payload.email || "",
    logo_url: payload.logo_url || "",
    cep: payload.cep || "",
    endereco: payload.endereco || "",
    numero: payload.numero || "",
    bairro: payload.bairro || "",
    cidade: payload.cidade || "",
    estado: payload.estado || "",
    observacoes: payload.observacoes || "",
    status: payload.status || "Ativa",
    campos_personalizados: payload.campos_personalizados || {},
  };

  const parsedCodigo = toNumber(payload.codempresa, 0);
  if (isUpdate && parsedCodigo > 0) {
    normalized.codempresa = parsedCodigo;
  }

  return normalized;
};

export const empresaService = {
  list(query = {}, scope) {
    return empresaRepository.list({
      scope,
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filters: query.filters,
    });
  },

  get(id, scope) {
    return empresaRepository.getById(id, scope);
  },

  create(payload, scope) {
    return empresaRepository.create(normalizeEmpresaPayload(payload, { isUpdate: false }), scope);
  },

  update(id, payload, scope) {
    return empresaRepository.update(id, normalizeEmpresaPayload(payload, { isUpdate: true }), scope);
  },

  remove(id, scope) {
    return empresaRepository.remove(id, scope);
  },

  listCampos(scope, mode = "aplicavel") {
    return empresaRepository.listCampos(scope, mode);
  },

  async listOptionsSources(sources = [], _scope) {
    // Placeholder para evolução multi-entity.
    const result = {};
    for (const source of sources) {
      result[source.entity] = [];
    }
    return result;
  },
};
