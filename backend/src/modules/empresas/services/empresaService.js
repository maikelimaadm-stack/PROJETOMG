import { empresaRepository } from "../repositories/empresaRepository.js";

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeEmpresaPayload = (payload = {}) => ({
  codigo_empresa: toNumber(payload.codigo_empresa, 0),
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
});

export const empresaService = {
  list() {
    return empresaRepository.list();
  },

  get(id) {
    return empresaRepository.getById(id);
  },

  create(payload) {
    return empresaRepository.create(normalizeEmpresaPayload(payload));
  },

  update(id, payload) {
    return empresaRepository.update(id, normalizeEmpresaPayload(payload));
  },

  remove(id) {
    return empresaRepository.remove(id);
  },

  listCampos() {
    return empresaRepository.listCampos();
  },

  createCampo(payload) {
    return empresaRepository.createCampo(payload);
  },

  updateCampo(id, payload) {
    return empresaRepository.updateCampo(id, payload);
  },

  removeCampo(id) {
    return empresaRepository.removeCampo(id);
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
