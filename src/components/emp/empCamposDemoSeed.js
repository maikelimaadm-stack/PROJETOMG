/** 20 campos demo — pelo menos 1 de cada tipo/configuração de campo personalizado. */

const manualOptions = (items) =>
  items.map((label) => ({ value: label, label, protected: false }));

const base = (overrides) => ({
  placeholder: "",
  descricao: "",
  col_span: 12,
  largura_coluna: 160,
  obrigatorio: false,
  read_only: false,
  visivel_form: true,
  visivel_tabela: true,
  visivel_relatorio: true,
  ordenavel: true,
  filtravel: true,
  alinhamento: "left",
  ativo: true,
  metadata: {},
  options: [],
  options_text: "",
  options_source_entity: "",
  relation_entity: "",
  relation_display_field: "nome",
  formula: "",
  calculation_builder: { items: [{ field: "", operator: "*" }, { field: "", operator: "*" }] },
  campos_dependentes: [],
  dependencias: [],
  usar_decimal: false,
  decimal_places: 2,
  usar_mascara: false,
  mascaras_text: "",
  agregacao_tipo: undefined,
  ...overrides
});

export const DEMO_CAMPOS_PERSONALIZADOS = [
  // 1 — Texto
  base({
    id: "campo-demo-contato-principal",
    label: "Contato Principal",
    field_name: "contato_principal",
    tipo: "text",
    placeholder: "NOME DO CONTATO",
    ordem_tabela: 10,
    largura_coluna: 200
  }),
  // 2 — Observação (textarea)
  base({
    id: "campo-demo-observacoes-internas",
    label: "Observações Internas",
    field_name: "observacoes_internas",
    tipo: "textarea",
    placeholder: "ANOTAÇÕES INTERNAS",
    ordem_tabela: 11,
    largura_coluna: 260,
    filtravel: false
  }),
  // 3 — Número decimal
  base({
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
    agregacao_tipo: "sum"
  }),
  // 4 — Número inteiro
  base({
    id: "campo-demo-quantidade-funcionarios",
    label: "Quantidade Funcionários",
    field_name: "quantidade_funcionarios",
    tipo: "number",
    placeholder: "0",
    usar_decimal: false,
    alinhamento: "right",
    ordem_tabela: 16,
    largura_coluna: 140,
    agregacao_tipo: "sum"
  }),
  // 5 — Número com máscara
  base({
    id: "campo-demo-codigo-interno",
    label: "Código Interno",
    field_name: "codigo_interno",
    tipo: "number",
    placeholder: "ABC-1234",
    usar_mascara: true,
    mascaras_text: "AAA-9999",
    ordem_tabela: 17,
    largura_coluna: 130
  }),
  // 6 — Data
  base({
    id: "campo-demo-data-abertura",
    label: "Data Abertura",
    field_name: "data_abertura",
    tipo: "date",
    placeholder: "DD/MM/AAAA",
    alinhamento: "center",
    ordem_tabela: 18,
    largura_coluna: 120
  }),
  // 7 — Data e hora
  base({
    id: "campo-demo-data-ultima-visita",
    label: "Data Última Visita",
    field_name: "data_ultima_visita",
    tipo: "datetime",
    placeholder: "DD/MM/AAAA HH:MM",
    ordem_tabela: 19,
    largura_coluna: 160
  }),
  // 8 — Hora
  base({
    id: "campo-demo-horario-atendimento",
    label: "Horário Atendimento",
    field_name: "horario_atendimento",
    tipo: "time",
    placeholder: "HH:MM",
    alinhamento: "center",
    ordem_tabela: 20,
    largura_coluna: 110
  }),
  // 9 — Lista de seleção
  base({
    id: "campo-demo-segmento-mercado",
    label: "Segmento Mercado",
    field_name: "segmento_mercado",
    tipo: "select",
    placeholder: "SELECIONE",
    options: manualOptions(["COMÉRCIO", "INDÚSTRIA", "SERVIÇOS", "AGRONEGÓCIO"]),
    options_text: "COMÉRCIO\nINDÚSTRIA\nSERVIÇOS\nAGRONEGÓCIO",
    ordem_tabela: 21,
    largura_coluna: 150
  }),
  // 10 — Lista de opções
  base({
    id: "campo-demo-canais-contato",
    label: "Canais De Contato",
    field_name: "canais_de_contato",
    tipo: "option_list",
    options: manualOptions(["E-MAIL", "TELEFONE", "WHATSAPP", "PRESENCIAL"]),
    options_text: "E-MAIL\nTELEFONE\nWHATSAPP\nPRESENCIAL",
    ordem_tabela: 22,
    largura_coluna: 200,
    filtravel: false
  }),
  // 11 — Relação com cadastro
  base({
    id: "campo-demo-empresa-matriz",
    label: "Empresa Matriz",
    field_name: "empresa_matriz",
    tipo: "relation",
    placeholder: "BUSCAR EMPRESA",
    relation_entity: "empresa",
    relation_display_field: "razao_social",
    ordem_tabela: 23,
    largura_coluna: 220
  }),
  // 12 — Calculado
  base({
    id: "campo-demo-total-estimado",
    label: "Total Estimado",
    field_name: "total_estimado",
    tipo: "calculado",
    read_only: true,
    alinhamento: "right",
    formula: "valor * quantidade_funcionarios",
    calculation_builder: {
      items: [
        { field: "valor", operator: "*" },
        { field: "quantidade_funcionarios", operator: "*" }
      ]
    },
    campos_dependentes: ["valor", "quantidade_funcionarios"],
    dependencias: ["valor", "quantidade_funcionarios"],
    ordem_tabela: 24,
    largura_coluna: 140,
    agregacao_tipo: "sum"
  }),
  // 13 — Texto (repetição)
  base({
    id: "campo-demo-site-institucional",
    label: "Site Institucional",
    field_name: "site_institucional",
    tipo: "text",
    placeholder: "HTTPS://...",
    ordem_tabela: 25,
    largura_coluna: 200
  }),
  // 14 — Número decimal (repetição — média)
  base({
    id: "campo-demo-margem-operacional",
    label: "Margem Operacional",
    field_name: "margem_operacional",
    tipo: "number",
    placeholder: "0,00",
    usar_decimal: true,
    decimal_places: 2,
    alinhamento: "right",
    agregacao_tipo: "avg",
    ordem_tabela: 26,
    largura_coluna: 140
  }),
  // 15 — Lista de seleção (repetição)
  base({
    id: "campo-demo-status-comercial",
    label: "Status Comercial",
    field_name: "status_comercial",
    tipo: "select",
    placeholder: "SELECIONE",
    options: manualOptions(["ATIVO", "INATIVO", "PROSPECT", "SUSPENSO"]),
    options_text: "ATIVO\nINATIVO\nPROSPECT\nSUSPENSO",
    ordem_tabela: 27,
    largura_coluna: 140
  }),
  // 16 — Data (repetição)
  base({
    id: "campo-demo-data-renovacao",
    label: "Data Renovação",
    field_name: "data_renovacao",
    tipo: "date",
    placeholder: "DD/MM/AAAA",
    alinhamento: "center",
    ordem_tabela: 28,
    largura_coluna: 120
  }),
  // 17 — Observação (repetição)
  base({
    id: "campo-demo-historico-comercial",
    label: "Histórico Comercial",
    field_name: "historico_comercial",
    tipo: "textarea",
    placeholder: "HISTÓRICO DE NEGOCIAÇÕES",
    ordem_tabela: 29,
    largura_coluna: 260,
    filtravel: false
  }),
  // 18 — Número inteiro (repetição)
  base({
    id: "campo-demo-ano-fundacao",
    label: "Ano Fundação",
    field_name: "ano_fundacao",
    tipo: "number",
    placeholder: "AAAA",
    usar_decimal: false,
    alinhamento: "right",
    ordem_tabela: 30,
    largura_coluna: 100,
    agregacao_tipo: "min"
  }),
  // 19 — Lista de opções (repetição)
  base({
    id: "campo-demo-servicos-contratados",
    label: "Serviços Contratados",
    field_name: "servicos_contratados",
    tipo: "option_list",
    options: manualOptions(["ERP", "FISCAL", "RH", "CONSULTORIA"]),
    options_text: "ERP\nFISCAL\nRH\nCONSULTORIA",
    ordem_tabela: 31,
    largura_coluna: 200,
    filtravel: false
  }),
  // 20 — Calculado (repetição)
  base({
    id: "campo-demo-resultado-operacional",
    label: "Resultado Operacional",
    field_name: "resultado_operacional",
    tipo: "calculado",
    read_only: true,
    alinhamento: "right",
    formula: "margem_operacional * quantidade_funcionarios",
    calculation_builder: {
      items: [
        { field: "margem_operacional", operator: "*" },
        { field: "quantidade_funcionarios", operator: "*" }
      ]
    },
    campos_dependentes: ["margem_operacional", "quantidade_funcionarios"],
    dependencias: ["margem_operacional", "quantidade_funcionarios"],
    ordem_tabela: 32,
    largura_coluna: 160,
    agregacao_tipo: "sum"
  })
];

export const CAMPO_VALOR = DEMO_CAMPOS_PERSONALIZADOS.find((campo) => campo.field_name === "valor");
