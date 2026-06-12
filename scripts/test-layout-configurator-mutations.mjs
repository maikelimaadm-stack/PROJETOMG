/**
 * Testes das mutações do configurador de layout (dedup, place, strip).
 * Executar: npm run test:layout-configurator-mutations
 */
import assert from "node:assert/strict";
import {
  placeFieldsOnCard,
  stripFieldsFromAllCards,
  updateCardRowsOnly,
  previewMoveFieldsAtTarget,
  previewReorderCardsAtTarget,
  previewSwapFieldWithTarget,
} from "../src/framework/cadastro/layouts/layoutConfiguratorMutations.js";
import { createEmptyLayoutRow } from "../src/framework/cadastro/layouts/empFormLayoutRows.js";
import {
  shouldLivePreviewFieldMove,
  cloneCardsByPanel,
  isDragLeaveWithinContainer,
} from "../src/framework/cadastro/layouts/layoutConfiguratorDragSession.js";
import {
  insertFieldsRelativeToTarget,
  insertRowRelativeToTarget,
  previewReorderFieldsAtTarget,
  swapFieldsInRows,
  flattenRowsToFieldIds,
  resolveFieldInsertEdge,
} from "../src/framework/cadastro/layouts/empFormLayoutRows.js";

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

// insert before/after target field
const insertedBefore = insertFieldsRelativeToTarget(rows, ["d"], "b", "before");
assert.deepEqual(insertedBefore[0].fieldIds, ["a", "d", "b"]);

const previewMoved = previewReorderFieldsAtTarget(rows, ["a"], "c");
assert.ok(previewMoved);
assert.deepEqual(flattenRowsToFieldIds({ rows: previewMoved }), ["b", "c", "a"]);

const previewBefore = previewReorderFieldsAtTarget(rows, ["b"], "a", "before");
assert.ok(previewBefore);
assert.deepEqual(flattenRowsToFieldIds({ rows: previewBefore }), ["b", "a", "c"]);

const previewAfter = previewReorderFieldsAtTarget(rows, ["a"], "b", "after");
assert.ok(previewAfter);
assert.deepEqual(flattenRowsToFieldIds({ rows: previewAfter }), ["b", "a", "c"]);

const previewNoop = previewReorderFieldsAtTarget(rows, ["a"], "a");
assert.equal(previewNoop, null);

const insertedAfter = insertFieldsRelativeToTarget(rows, ["d"], "a", "after");
assert.deepEqual(insertedAfter[0].fieldIds, ["a", "d", "b"]);

// insert row before/after
const layoutRows = [
  { id: "r1", order: 1, fieldIds: ["a"] },
  { id: "r2", order: 2, fieldIds: ["b"] },
  { id: "r3", order: 3, fieldIds: ["c"] },
];
const rowMoved = insertRowRelativeToTarget(layoutRows, "r3", "r1", "before");
assert.deepEqual(
  rowMoved.map((row) => row.id),
  ["r3", "r1", "r2"]
);

const draftRow = createEmptyLayoutRow("card_x", []);
const insertedDraftRow = createEmptyLayoutRow("card_x", [draftRow]);
assert.notEqual(draftRow.id, insertedDraftRow.id);

const cards = [cardA, cardB];
const cardsMoved = previewReorderCardsAtTarget(cards, "card_b", "card_a");
assert.ok(cardsMoved);
assert.deepEqual(
  cardsMoved.map((card) => card.id),
  ["card_b", "card_a"]
);

const crossCard = previewMoveFieldsAtTarget({
  cardsByPanel,
  panelId,
  cardId: "card_b",
  fieldIds: ["f1"],
  targetFieldId: "f4",
  edge: "before",
});
assert.ok(crossCard);
const cardAAfter = crossCard[panelId].cards.find((c) => c.id === "card_a");
const cardBAfter = crossCard[panelId].cards.find((c) => c.id === "card_b");
assert.ok(!cardAAfter.fieldIds.includes("f1"));
assert.deepEqual(cardBAfter.fieldIds, ["f1", "f4"]);

const fullRowCards = {
  principais: {
    cards: [
      {
        id: "card_full",
        label: "Full",
        order: 1,
        colSpan: 6,
        rows: [
          { id: "row_full_1", order: 1, fieldIds: ["a", "b", "c", "d"] },
          { id: "row_full_2", order: 2, fieldIds: ["e"] },
        ],
        fieldIds: ["a", "b", "c", "d", "e"],
      },
    ],
  },
};
const swappedFullRow = previewSwapFieldWithTarget({
  cardsByPanel: fullRowCards,
  draggedFieldId: "e",
  targetFieldId: "b",
  targetPanelId: "principais",
  targetCardId: "card_full",
});
assert.ok(swappedFullRow);
const swappedCard = swappedFullRow.principais.cards[0];
assert.deepEqual(swappedCard.rows[0].fieldIds, ["a", "e", "c", "d"]);
assert.deepEqual(swappedCard.rows[1].fieldIds, ["b"]);
assert.equal(new Set(swappedCard.fieldIds).size, swappedCard.fieldIds.length);

const layoutRowsAB = [
  { id: "row_a", order: 1, fieldIds: ["f1", "f2"] },
  { id: "row_b", order: 2, fieldIds: ["f3"] },
];

assert.equal(
  shouldLivePreviewFieldMove({
    rows: layoutRowsAB,
    fieldIds: ["f1"],
    targetFieldId: "f2",
    sourcePanelId: "p1",
    sourceCardId: "c1",
    targetPanelId: "p1",
    targetCardId: "c1",
  }),
  true,
  "same-row reorder should live preview"
);

assert.equal(
  shouldLivePreviewFieldMove({
    rows: layoutRowsAB,
    fieldIds: ["f1"],
    targetRowId: "row_b",
    sourcePanelId: "p1",
    sourceCardId: "c1",
    targetPanelId: "p1",
    targetCardId: "c1",
  }),
  false,
  "cross-row move must not live preview"
);

assert.equal(
  shouldLivePreviewFieldMove({
    rows: layoutRowsAB,
    fieldIds: ["f1"],
    targetRowId: "row_a",
    sourcePanelId: "p1",
    sourceCardId: "c1",
    targetPanelId: "p1",
    targetCardId: "c1",
  }),
  true,
  "same-row target row should live preview"
);

assert.equal(
  shouldLivePreviewFieldMove({
    rows: layoutRowsAB,
    fieldIds: ["new_field"],
    targetRowId: "row_a",
    sourcePanelId: "p1",
    sourceCardId: "c1",
    targetPanelId: "p1",
    targetCardId: "c1",
  }),
  false,
  "available field must not live preview"
);

const snapshot = { principais: { cards: [cardA] } };
const cloned = cloneCardsByPanel(snapshot);
cloned.principais.cards[0].fieldIds = ["changed"];
assert.deepEqual(snapshot.principais.cards[0].fieldIds, ["f1", "f2", "f3"]);

const rowMoveAfterHover = previewMoveFieldsAtTarget({
  cardsByPanel,
  panelId,
  cardId: "card_a",
  fieldIds: ["f1"],
  targetRowId: "row_a2",
  edge: "after",
});
assert.ok(rowMoveAfterHover);
const rowAAfter = rowMoveAfterHover[panelId].cards.find((c) => c.id === "card_a");
assert.ok(rowAAfter.rows.find((row) => row.id === "row_a2")?.fieldIds.includes("f1"));

const rowMoveRetry = previewMoveFieldsAtTarget({
  cardsByPanel: rowMoveAfterHover,
  panelId,
  cardId: "card_a",
  fieldIds: ["f1"],
  targetRowId: "row_a2",
  edge: "after",
});
assert.equal(rowMoveRetry, null, "repeat move to same row should be idempotent");

assert.equal(isDragLeaveWithinContainer(null, null), false);

assert.equal(
  resolveFieldInsertEdge(rows, ["a"], "b", "before"),
  "before"
);
assert.equal(
  resolveFieldInsertEdge(rows, ["a"], "c", "auto"),
  "after"
);
assert.equal(
  resolveFieldInsertEdge(rows, ["c"], "a", "auto"),
  "before"
);

console.log("test-layout-configurator-mutations: OK");
