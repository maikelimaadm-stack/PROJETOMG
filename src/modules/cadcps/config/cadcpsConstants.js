export const CADCPS_TIPOS = [
  { value: "texto", label: "Texto" },
  { value: "observacao", label: "Observação" },
  { value: "inteiro", label: "Número Inteiro" },
  { value: "decimal", label: "Número Decimal" },
  { value: "moeda", label: "Moeda" },
  { value: "percentual", label: "Percentual" },
  { value: "data", label: "Data" },
  { value: "hora", label: "Hora" },
  { value: "data_hora", label: "Data e Hora" },
  { value: "sim_nao", label: "Sim/Não" },
  { value: "email", label: "E-mail" },
  { value: "url", label: "URL" },
  { value: "lista", label: "Lista" },
  { value: "lista_multipla", label: "Lista Múltipla" },
  { value: "relacao", label: "Relação" },
  { value: "arquivo", label: "Arquivo" },
  { value: "imagem", label: "Imagem" },
  { value: "assinatura", label: "Assinatura" },
  { value: "formula", label: "Fórmula" },
];

export const CADCPS_APLICACAO = {
  TODAS: "todas",
  ESPECIFICAS: "especificas",
};

export const tipoLabel = (value) =>
  CADCPS_TIPOS.find((item) => item.value === value)?.label || value;

export const aplicacaoLabel = (modo, quantidade) => {
  if (modo === CADCPS_APLICACAO.TODAS) return "Todas as empresas";
  return quantidade != null ? `${quantidade} empresa(s)` : "Empresas específicas";
};
