/**
 * Smoke do validador empresas.form_layout no backend.
 */
import { validatePreferenceConfig } from "../src/modules/preferences/layoutValidators/index.js";

const screenKey = "empresas.form_layout";

const valid = validatePreferenceConfig(screenKey, {
  panels: [{ id: "principais", label: "Principais" }],
  layout: {
    principais: {
      cards: [
        {
          id: "geral",
          label: "Geral",
          order: 1,
          colSpan: 12,
          rows: [{ id: "r1", order: 1, fieldIds: ["tipo_pessoa"] }],
          fieldIds: ["tipo_pessoa"],
        },
      ],
    },
  },
});

if (valid?.version !== 3) {
  console.error("smokeEmpresasFormLayout: validação falhou");
  process.exit(1);
}

let rejected = false;
try {
  validatePreferenceConfig(screenKey, {
    panels: [{ id: "p", label: "P" }],
    layout: {
      p: {
        cards: [
          {
            id: "c",
            label: "C",
            order: 1,
            colSpan: 12,
            rows: [{ id: "r", order: 1, fieldIds: ["a", "b", "c", "d", "e", "f", "g", "h"] }],
            fieldIds: ["a", "b", "c", "d", "e", "f", "g", "h"],
          },
        ],
      },
    },
  });
} catch (error) {
  rejected = error.statusCode === 400;
}

if (!rejected) {
  console.error("smokeEmpresasFormLayout: deveria rejeitar linha cheia");
  process.exit(1);
}

console.log("smokeEmpresasFormLayout: OK");
