/** MDP-2 platform definition version stub (shared with MDP-1). */
export { MDP_PLATFORM_VERSION_ID, DEFAULT_LOCALE, MDP_ENTITY_IDS } from "./mdpEntityConstants.js";

export const MDP_FIELD_ENTITY_IDS = {
  empresas: "EmpresaCadastro",
};

/** Maps CADCPS aplicacao_modo ↔ MDP empresa_applicability. */
export const MDP_EMPRESA_APPLICABILITY = {
  ALL: "all",
  SELECTED: "selected",
  NONE: "none",
};

export const CADCPS_APLICACAO_TO_MDP = {
  todas: MDP_EMPRESA_APPLICABILITY.ALL,
  especificas: MDP_EMPRESA_APPLICABILITY.SELECTED,
};

export const MDP_TO_CADCPS_APLICACAO = {
  [MDP_EMPRESA_APPLICABILITY.ALL]: "todas",
  [MDP_EMPRESA_APPLICABILITY.SELECTED]: "especificas",
  [MDP_EMPRESA_APPLICABILITY.NONE]: "todas",
};

/** Native Empresas field definitions — SSOT seed (mirrors formEmp.constants.js). */
export const EMPRESAS_NATIVE_FIELD_DEFS = [
  { field_name: "tipo_pessoa", label: "Tipo de Pessoa", field_type: "lista", required: true, sort_order: 10 },
  { field_name: "tipo_vinculo", label: "Proprietário/Arrendatário", field_type: "lista", sort_order: 20 },
  { field_name: "codempresa", label: "Cód. Empresa", field_type: "inteiro", read_only: true, sort_order: 30 },
  { field_name: "razao_social", label: "Nome/Razão Social Emp.", field_type: "texto", required: true, sort_order: 40 },
  { field_name: "status", label: "Ativa", field_type: "lista", sort_order: 50 },
  { field_name: "nome_fantasia", label: "Nome fantasia", field_type: "texto", sort_order: 60 },
  { field_name: "cpf_cnpj", label: "CPF/CNPJ", field_type: "texto", use_mask: true, sort_order: 70 },
  { field_name: "inscricao_estadual", label: "Inscrição Estadual", field_type: "texto", sort_order: 80 },
  { field_name: "telefone", label: "Telefone", field_type: "texto", use_mask: true, sort_order: 90 },
  { field_name: "whatsapp", label: "WhatsApp", field_type: "texto", use_mask: true, sort_order: 100 },
  { field_name: "email", label: "E-mail", field_type: "email", sort_order: 110 },
  { field_name: "logo_url", label: "Logo da Empresa", field_type: "imagem", sort_order: 120 },
  { field_name: "cep", label: "CEP", field_type: "texto", use_mask: true, sort_order: 130 },
  { field_name: "endereco", label: "Endereço", field_type: "texto", sort_order: 140 },
  { field_name: "numero", label: "Número", field_type: "texto", sort_order: 150 },
  { field_name: "bairro", label: "Bairro", field_type: "texto", sort_order: 160 },
  { field_name: "cidade", label: "Cidade", field_type: "texto", sort_order: 170 },
  { field_name: "estado", label: "Estado (UF)", field_type: "lista", sort_order: 180 },
  { field_name: "observacoes", label: "Observações", field_type: "observacao", sort_order: 190 },
  { field_name: "campos_personalizados", label: "Campos Personalizados", field_type: "texto", source: "system", visible_form: false, sort_order: 200 },
];

export const buildStableFieldId = (entityId, fieldName) => `${entityId}.${fieldName}`;
