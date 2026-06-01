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

  const parsedCodigo = toNumber(payload.codigo_empresa, 0);
  if (!isUpdate || parsedCodigo > 0) {
    normalized.codigo_empresa = parsedCodigo;
  }

  return normalized;
};

export const empresaService = {
  list(query = {}, tenantId) {
    return empresaRepository.list({
      tenantId,
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filters: query.filters,
    });
  },

  get(id, tenantId) {
    return empresaRepository.getById(id, tenantId);
  },

  create(payload, tenantId) {
    return empresaRepository.create(normalizeEmpresaPayload(payload, { isUpdate: false }), tenantId);
  },

  update(id, payload, tenantId) {
    return empresaRepository.update(id, normalizeEmpresaPayload(payload, { isUpdate: true }), tenantId);
  },

  remove(id, tenantId) {
    return empresaRepository.remove(id, tenantId);
  },

  listCampos(tenantId) {
    return empresaRepository.listCampos(tenantId);
  },

  createCampo(payload, tenantId) {
    return empresaRepository.createCampo(payload, tenantId);
  },

  updateCampo(id, payload, tenantId) {
    return empresaRepository.updateCampo(id, payload, tenantId);
  },

  removeCampo(id, tenantId) {
    return empresaRepository.removeCampo(id, tenantId);
  },

  async listOptionsSources(sources = []) {
    // Placeholder para evolução multi-entity.
    const result = {};
    for (const source of sources) {
      result[source.entity] = [];
    }
    return result;
  },
};
