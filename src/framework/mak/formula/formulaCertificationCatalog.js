/**
 * Catálogo de certificação V17 — Formula Configuration Engine.
 */
export const MAK_FORMULA_CERTIFICATION_CATALOG = Object.freeze([
  {
    id: "frm_preco",
    name: "frm_preco",
    label: "Preço",
    type: "number",
  },
  {
    id: "frm_quantidade",
    name: "frm_quantidade",
    label: "Quantidade",
    type: "number",
  },
  {
    id: "frm_total",
    name: "frm_total",
    label: "Total",
    type: "number",
    readOnly: true,
    formula: {
      dependsOn: ["frm_preco", "frm_quantidade"],
      expression: { fn: "multiply", args: ["frm_preco", "frm_quantidade"] },
    },
  },
  {
    id: "frm_parte",
    name: "frm_parte",
    label: "Parte",
    type: "number",
  },
  {
    id: "frm_whole",
    name: "frm_whole",
    label: "Total base",
    type: "number",
  },
  {
    id: "frm_percentual",
    name: "frm_percentual",
    label: "Percentual",
    type: "number",
    readOnly: true,
    formula: {
      dependsOn: ["frm_parte", "frm_whole"],
      expression: { fn: "percent", args: ["frm_parte", "frm_whole"] },
    },
  },
  {
    id: "frm_data_inicio",
    name: "frm_data_inicio",
    label: "Data início",
    type: "date",
  },
  {
    id: "frm_data_fim",
    name: "frm_data_fim",
    label: "Data fim",
    type: "date",
  },
  {
    id: "frm_dias",
    name: "frm_dias",
    label: "Dias entre datas",
    type: "number",
    readOnly: true,
    formula: {
      dependsOn: ["frm_data_inicio", "frm_data_fim"],
      expression: { fn: "dateDiff", args: ["frm_data_inicio", "frm_data_fim", "days"] },
    },
  },
  {
    id: "frm_nome",
    name: "frm_nome",
    label: "Nome",
    type: "text",
  },
  {
    id: "frm_sobrenome",
    name: "frm_sobrenome",
    label: "Sobrenome",
    type: "text",
  },
  {
    id: "frm_nome_completo",
    name: "frm_nome_completo",
    label: "Nome completo",
    type: "text",
    readOnly: true,
    formula: {
      dependsOn: ["frm_nome", "frm_sobrenome"],
      expression: {
        fn: "concat",
        args: [{ fn: "uppercase", args: ["frm_nome"] }, " ", { fn: "uppercase", args: ["frm_sobrenome"] }],
      },
    },
  },
  {
    id: "frm_desconto",
    name: "frm_desconto",
    label: "Desconto",
    type: "number",
  },
  {
    id: "frm_valor_final",
    name: "frm_valor_final",
    label: "Valor final",
    type: "number",
    readOnly: true,
    formula: {
      dependsOn: ["frm_total", "frm_desconto"],
      expression: {
        fn: "if",
        args: [
          { fn: "max", args: ["frm_desconto", 0] },
          { fn: "subtract", args: ["frm_total", "frm_desconto"] },
          "frm_total",
        ],
      },
    },
  },
  {
    id: "frm_valor_a",
    name: "frm_valor_a",
    label: "Valor A",
    type: "number",
  },
  {
    id: "frm_valor_b",
    name: "frm_valor_b",
    label: "Valor B",
    type: "number",
  },
  {
    id: "frm_soma",
    name: "frm_soma",
    label: "Soma",
    type: "number",
    readOnly: true,
    formula: {
      dependsOn: ["frm_valor_a", "frm_valor_b"],
      expression: "frm_valor_a + frm_valor_b",
    },
  },
]);

export const MAK_FORMULA_CERTIFICATION_LAYOUT = Object.freeze({
  principais: MAK_FORMULA_CERTIFICATION_CATALOG.map((field) => field.id),
});

export default MAK_FORMULA_CERTIFICATION_CATALOG;
