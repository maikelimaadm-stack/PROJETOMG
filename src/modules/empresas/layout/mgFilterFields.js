export const MG_FILTER_FIELDS = [
  { key: "razao_social", label: "Razão Social", column: "razao_social" },
  { key: "nome_fantasia", label: "Nome Fantasia", column: "nome_fantasia" },
  { key: "cnpj", label: "CNPJ", column: "cpf_cnpj" },
  { key: "telefone", label: "Telefone", column: "telefone" },
  { key: "cidade", label: "Cidade", column: "cidade" },
  { key: "uf", label: "UF", column: "estado" },
];

export const MG_FILTER_STATUS_FIELD = {
  key: "status",
  label: "Status",
  column: "status",
};

/** @deprecated use MG_FILTER_FIELDS */
export const MG_FILTER_TEXT_FIELDS = MG_FILTER_FIELDS;
