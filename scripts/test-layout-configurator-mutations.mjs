/**
 * Testes das mutações do configurador de layout (dedup, place, strip).
 * Executar: npm run test:layout-configurator-mutations
 */
import assert from "node:assert/strict";
import {
  placeFieldsOnCard,
  stripFieldsFromAllCards,
  updateCardRowsOnly,
} from "../src/framework/cadastro/layouts/layoutConfiguratorMutations.js";
import { createEmptyLayoutRow } from "../src/framework/cadastro/layouts/empFormLayoutRows.js";
import { swapFieldsInRows } from "../src/framework/cadastro/layouts/empFormLayoutRows.js";

const panelId = "principais";
const cardA = {
  id: "card_a",
  label: "A",
  order: 1,
  colSpan: 12,
  rows: [
    { id: "row_a1", order: 1, fieldIds: ["f1", "f2"] },
    { id: "row_a2", order: 2, fieldIds: ["f3"] },
  ],
  fieldIds: ["f1", "f2", "f3"],
};
const cardB = {
  id: "card_b",
  label: "B",
  order: 2,
  colSpan: 12,
  rows: [{ id: "row_b1", order: 1, fieldIds: ["f4"] }],
  fieldIds: ["f4"],
};

const cardsByPanel = {
  [panelId]: { cards: [cardA, cardB] },
  endereco: {
    cards: [
      {
        id: "geral",
        label: "Geral",
        order: 1,
        colSpan: 12,
        rows: [{ id: "row_e1", order: 1, fieldIds: ["f5"] }],
        fieldIds: ["f5"],
      },
    ],
  },
};

// Mover campo entre cards não duplica
const moved = placeFieldsOnCard({
  cardsByPanel,
  panelId,
  cardId: "card_b",
  fieldIds: ["f1"],
  card: cardB,
});
const flatA = moved[panelId].cards.find((c) => c.id === "card_a");
const flatB = moved[panelId].cards.find((c) => c.id === "card_b");
assert.deepEqual(flatA.fieldIds, ["f2", "f3"]);
assert.ok(flatB.fieldIds.includes("f1"));
assert.ok(flatB.fieldIds.includes("f4"));
assert.equal([...new Set(flatB.fieldIds)].length, flatB.fieldIds.length);

// strip remove de todos os painéis
const stripped = stripFieldsFromAllCards(cardsByPanel, ["f3", "f5"]);
assert.ok(!stripped[panelId].cards[0].fieldIds.includes("f3"));
assert.ok(!stripped.endereco.cards[0].fieldIds.includes("f5"));

// updateCardRowsOnly não altera cards irmãos
const siblingBefore = cardsByPanel[panelId].cards[1].fieldIds.length;
const updated = updateCardRowsOnly({
  cardsByPanel,
  panelId,
  cardId: "card_a",
  rows: [createEmptyLayoutRow("card_a", [])],
  fieldIds: [],
});
assert.equal(updated[panelId].cards[1].fieldIds.length, siblingBefore);

// swap troca posições
const rows = [
  { id: "r1", order: 1, fieldIds: ["a", "b"] },
  { id: "r2", order: 2, fieldIds: ["c"] },
];
const swapped = swapFieldsInRows(rows, "a", "c");
assert.deepEqual(swapped[0].fieldIds, ["c", "b"]);
assert.deepEqual(swapped[1].fieldIds, ["a"]);

console.log("test-layout-configurator-mutations: OK");
