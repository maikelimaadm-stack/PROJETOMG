/**
 * Testes do validador corporativo empresas.form_layout (backend/shared).
 * Executar: npm run test:empresas-form-layout-validate
 */
import assert from "node:assert/strict";
import {
  EMPRESAS_FORM_LAYOUT_SCREEN_KEY,
  validateAndNormalizeEmpresasFormLayout,
} from "../shared/layout/empresasFormLayoutValidate.mjs";

const basePanels = [
  { id: "principais", label: "Principais" },
  { id: "endereco", label: "Endereço" },
];

const validConfig = {
  panels: basePanels,
  layout: {
    principais: {
      cards: [
        {
          id: "geral",
          label: "Geral",
          order: 1,
          colSpan: 12,
          rows: [{ id: "row_1", order: 1, fieldIds: ["tipo_pessoa", "razao_social"] }],
          fieldIds: ["tipo_pessoa", "razao_social"],
        },
      ],
    },
    endereco: {
      cards: [
        {
          id: "geral",
          label: "Geral",
          order: 1,
          colSpan: 12,
          rows: [{ id: "row_1", order: 1, fieldIds: ["cep"] }],
          fieldIds: ["cep"],
        },
      ],
    },
  },
};

const normalized = validateAndNormalizeEmpresasFormLayout(validConfig);
assert.equal(normalized.version, 3);
assert.equal(normalized.activeConfig.layout.principais.cards[0].fieldIds.length, 2);
assert.equal(EMPRESAS_FORM_LAYOUT_SCREEN_KEY, "empresas.form_layout");

// Duplicata global de campo — segunda ocorrência removida
const duplicateFieldConfig = {
  panels: basePanels,
  layout: {
    principais: {
      cards: [
        {
          id: "geral",
          label: "Geral",
          order: 1,
          colSpan: 12,
          rows: [{ id: "row_1", order: 1, fieldIds: ["tipo_pessoa", "razao_social"] }],
          fieldIds: ["tipo_pessoa", "razao_social"],
        },
      ],
    },
    endereco: {
      cards: [
        {
          id: "geral",
          label: "Geral",
          order: 1,
          colSpan: 12,
          rows: [{ id: "row_1", order: 1, fieldIds: ["tipo_pessoa", "cep"] }],
          fieldIds: ["tipo_pessoa", "cep"],
        },
      ],
    },
  },
};

const deduped = validateAndNormalizeEmpresasFormLayout(duplicateFieldConfig);
const allFieldIds = Object.values(deduped.activeConfig.layout).flatMap((panel) =>
  panel.cards.flatMap((card) => card.fieldIds)
);
assert.equal(allFieldIds.filter((id) => id === "tipo_pessoa").length, 1);
assert.ok(allFieldIds.includes("razao_social"));
assert.ok(allFieldIds.includes("cep"));

// Linha com excesso de campos (card 12 colunas = max 7)
assert.throws(
  () =>
    validateAndNormalizeEmpresasFormLayout({
      panels: [{ id: "p", label: "P" }],
      layout: {
        p: {
          cards: [
            {
              id: "c1",
              label: "C1",
              order: 1,
              colSpan: 12,
              rows: [
                {
                  id: "r1",
                  order: 1,
                  fieldIds: ["a", "b", "c", "d", "e", "f", "g", "h"],
                },
              ],
              fieldIds: ["a", "b", "c", "d", "e", "f", "g", "h"],
            },
          ],
        },
      },
    }),
  /excede 7 campos/
);

// Painel duplicado
assert.throws(
  () =>
    validateAndNormalizeEmpresasFormLayout({
      panels: [
        { id: "p", label: "P" },
        { id: "p", label: "P2" },
      ],
      layout: {},
    }),
  /Painel duplicado/
);

console.log("test-empresas-form-layout-validate: OK");
