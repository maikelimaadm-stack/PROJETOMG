/**
 * Testes LayoutConfigV3 + motor de balanceamento corporativo
 * Executar: node scripts/test-layout-config-v3.mjs
 */
import assert from "node:assert/strict";
import {
  DEFAULT_VIRTUAL_CARD_ID,
  flattenV3LayoutToV2,
  isLayoutConfigV2,
  isLayoutConfigV3,
  migrateV2ToV3,
  resolveLayoutConfig,
  countLayoutFieldsV3,
  normalizeLayoutCardV3,
} from "../src/framework/cadastro/layouts/layoutConfigV3.js";
import {
  flattenRowsToFieldIds,
  packFieldIdsIntoRows,
  normalizeCardRows,
} from "../src/framework/cadastro/layouts/empFormLayoutRows.js";
import {
  getMaxFieldsPerRow,
  resolveFieldWidthTypePreset,
  normalizeFieldWidthTypes,
  inferFieldWidthType,
} from "../src/framework/cadastro/layouts/empFormFieldWidthPresets.js";
import {
  buildBalancedRows,
  fixOrphanCompactRows,
  computeRowFieldBalance,
  getRowBudgetPx,
  rowContentWidthPx,
} from "../src/framework/cadastro/layouts/empFormRowBalance.js";
import {
  isCompactLayoutField,
  isExpansiveLayoutField,
  isInlineMediaField,
} from "../src/framework/cadastro/layouts/empFormFieldLayoutGroups.js";
import {
  countLayoutFields,
  ensureLayoutFields,
  mergeSavedFormLayout,
  normalizeLayoutConfig,
  pickLayoutConfig,
  sanitizeLayoutFieldPlacements,
} from "../src/framework/cadastro/layouts/empFormLayoutStore.js";

const EMP_DEFAULT = {
  panels: [
    { id: "principal", label: "Principal" },
    { id: "geral", label: "Geral" },
  ],
  layout: {
    principal: ["tipo_pessoa", "razao_social", "status"],
    geral: ["nome_fantasia", "cpf_cnpj"],
  },
  hiddenFieldIds: [],
  fieldLayoutConfig: { mode: "vertical", columns: 1 },
};

const legacyV2 = {
  panels: EMP_DEFAULT.panels,
  layout: {
    principal: ["tipo_pessoa", "razao_social", "status"],
    geral: ["nome_fantasia", "cpf_cnpj"],
  },
};

assert.equal(isLayoutConfigV2(legacyV2), true);
assert.equal(isLayoutConfigV3(legacyV2), false);

const migrated = migrateV2ToV3(legacyV2, { defaultLayout: EMP_DEFAULT.layout });
assert.equal(migrated.version, 3);
assert.equal(isLayoutConfigV3(migrated), true);

const flatAfterMigrate = flattenV3LayoutToV2(migrated.layout);
assert.deepEqual(flatAfterMigrate.principal, legacyV2.layout.principal);
assert.deepEqual(flatAfterMigrate.geral, legacyV2.layout.geral);

const totalV2 = Object.values(legacyV2.layout).flat().length;
const totalV3 = countLayoutFieldsV3(migrated.layout);
assert.equal(totalV3, totalV2, "nenhum campo deve sumir na migração");

migrated.layout.principal.cards.forEach((card) => {
  assert.ok(card.id, "card deve ter id");
  assert.ok(Array.isArray(card.fieldIds), "card deve ter fieldIds");
});
const principalCard = migrated.layout.principal.cards.find((c) => c.id === DEFAULT_VIRTUAL_CARD_ID);
assert.ok(principalCard, 'painel principal deve ter card "geral"');
assert.deepEqual(principalCard.fieldIds, legacyV2.layout.principal);

const emptyResolved = resolveLayoutConfig(null, { defaultLayout: EMP_DEFAULT.layout, defaults: EMP_DEFAULT });
assert.equal(emptyResolved.config.version, 3);
assert.ok(emptyResolved.layoutFlat.principal.length > 0, "fallback deve preencher painel principal");
assert.equal(emptyResolved.migrated, true);

const normalized = normalizeLayoutConfig(legacyV2, {
  basePanels: EMP_DEFAULT.panels,
  defaultLayout: EMP_DEFAULT.layout,
});
assert.ok(Array.isArray(normalized.layout.principal), "consumidor V2: layout.principal é array");
assert.deepEqual(normalized.layout.principal, legacyV2.layout.principal);
assert.ok(normalized.layoutV3?.principal?.cards?.length > 0, "layoutV3 disponível");
assert.equal(normalized.version, 3);
assert.equal(normalized.fieldLayoutConfig.mode, "corporate");

const sanitized = sanitizeLayoutFieldPlacements(normalized.layout);
assert.equal(countLayoutFields(sanitized), totalV2);

const repaired = ensureLayoutFields({ panels: EMP_DEFAULT.panels, layout: { principal: [] } }, EMP_DEFAULT);
assert.ok(repaired.layout.principal.includes("razao_social") || repaired.layout.principal.includes("tipo_pessoa"));

const merged = mergeSavedFormLayout(
  { panels: EMP_DEFAULT.panels, layout: { principal: ["razao_social"] } },
  EMP_DEFAULT
);
assert.ok(Array.isArray(merged.layout.principal));
assert.ok(merged.layoutV3);

const picked = pickLayoutConfig(normalized);
assert.equal(picked.version, 3);
assert.ok(picked.layout.principal.cards, "persistência: layout em V3 (cards)");
const persistedFlat = flattenV3LayoutToV2(picked.layout);
assert.equal(countLayoutFields(persistedFlat), totalV2);

const dupConfig = migrateV2ToV3({
  panels: EMP_DEFAULT.panels,
  layout: { principal: ["razao_social"], geral: ["razao_social", "cpf_cnpj"] },
});
const dupFlat = flattenV3LayoutToV2(dupConfig.layout);
assert.deepEqual(dupFlat.principal, ["razao_social"]);
assert.deepEqual(dupFlat.geral, ["cpf_cnpj"]);
const allFieldIds = [...dupFlat.principal, ...dupFlat.geral];
assert.equal(new Set(allFieldIds).size, allFieldIds.length, "sem duplicata global");

const cardWithRows = normalizeLayoutCardV3({
  id: "test_card",
  label: "Teste",
  rows: [
    { id: "r1", order: 1, fieldIds: ["a", "b"] },
    { id: "r2", order: 2, fieldIds: ["c"] },
  ],
});
assert.ok(cardWithRows.rows.length >= 1);
assert.deepEqual(flattenRowsToFieldIds(cardWithRows), ["a", "b", "c"]);

const packed = normalizeCardRows(
  {
    id: "c1",
    colSpan: 12,
    fieldIds: ["a", "b", "c", "d", "e", "f", "g"],
  },
  {},
  [
    { id: "a", type: "text" },
    { id: "b", type: "text" },
    { id: "c", type: "text" },
    { id: "d", type: "text" },
    { id: "e", type: "text" },
    { id: "f", type: "text" },
    { id: "g", type: "text" },
  ]
);
assert.ok(packed.rows.length >= 2, "quebra linha após 6 campos no card inteiro");
assert.equal(flattenRowsToFieldIds(packed).length, 7, "preserva todos os campos");

assert.equal(getMaxFieldsPerRow(12), 6);
assert.equal(getMaxFieldsPerRow(6), 4);
assert.equal(getMaxFieldsPerRow(4), 2);

// --- Larguras mínimas por tipo
assert.equal(resolveFieldWidthTypePreset({ type: "number" }).min, 120);
assert.equal(resolveFieldWidthTypePreset({ type: "date" }).min, 140);
assert.equal(resolveFieldWidthTypePreset({ type: "text", widthType: "EMAIL" }).min, 240);
assert.equal(resolveFieldWidthTypePreset({ type: "text", widthType: "PHONE" }).min, 160);
assert.equal(resolveFieldWidthTypePreset({ type: "text", medium: true }).min, 260);

// --- XS legado → tipo de largura
assert.deepEqual(normalizeFieldWidthTypes({ f1: "XS", f2: "MD" }), {
  f1: "SHORT_TEXT",
  f2: "MEDIUM_TEXT",
});

// --- Grupos
assert.equal(isExpansiveLayoutField({ type: "textarea" }), true);
assert.equal(isCompactLayoutField({ type: "number" }), true);
assert.equal(isCompactLayoutField({ type: "image" }), true);
assert.equal(isInlineMediaField({ type: "image" }), true);
assert.equal(isExpansiveLayoutField({ type: "image", layoutExpand: true }), true);
assert.equal(inferFieldWidthType({ type: "image", layoutExpand: true }), "IMAGE_EXPAND");

const manualPack = packFieldIdsIntoRows(
  ["f1", "f2", "f3", "f4", "f5", "f6", "f7"],
  {
    fields: Array.from({ length: 7 }, (_, i) => ({ id: `f${i + 1}`, type: "text" })),
    card: { colSpan: 12 },
  }
);
assert.ok(manualPack.length >= 2, "máx. 6 compactos por linha no card inteiro");

const withTextarea = packFieldIdsIntoRows(["a", "b", "obs"], {
  fields: [
    { id: "a", type: "text" },
    { id: "b", type: "text" },
    { id: "obs", type: "textarea" },
  ],
  card: { colSpan: 12 },
});
assert.equal(withTextarea[withTextarea.length - 1].fieldIds[0], "obs");
assert.equal(withTextarea[withTextarea.length - 1].fullWidth, true);

const orphanFixed = fixOrphanCompactRows(
  [["a", "b", "c", "d", "e"], ["f"]],
  Array.from({ length: 6 }, (_, i) => ({ id: String.fromCharCode(97 + i), type: "text" })),
  {},
  { colSpan: 12 }
);
assert.ok(
  orphanFixed.every((row) => row.length !== 1),
  "compacto não permanece sozinho"
);

const lineFillAlone = buildBalancedRows(["obs"], {
  fields: [{ id: "obs", type: "textarea" }],
  card: { colSpan: 12 },
});
assert.equal(lineFillAlone.length, 1);
assert.equal(lineFillAlone[0].fullWidth, true);

const imageCompactRow = buildBalancedRows(["logo"], {
  fields: [{ id: "logo", type: "image" }],
  card: { colSpan: 12 },
});
assert.equal(imageCompactRow[0].fullWidth, false, "imagem padrão não vira linha exclusiva");

// --- Redistribuição igual (6 × 140px)
const fullCardWidthPx = 920;
const sixFields = ["a", "b", "c", "d", "e", "f"].map((id) => ({ id, type: "text" }));
const equalBalance = computeRowFieldBalance(
  sixFields.map((f) => f.id),
  sixFields,
  12,
  {},
  fullCardWidthPx
);
const budget = getRowBudgetPx(12, fullCardWidthPx) - 5 * 8;
const widths = Object.values(equalBalance).map((b) => b.targetWidthPx);
const sumWidths = widths.reduce((s, w) => s + w, 0);
assert.ok(Math.abs(sumWidths - budget) <= 12, "6 campos iguais preenchem a linha");
widths.forEach((w) => assert.ok(Math.abs(w - widths[0]) <= 2, "distribuição igual entre iguais"));

// --- Redistribuição proporcional (260+220+140 → preenche linha)
const propBalance = computeRowFieldBalance(
  ["a", "b", "c"],
  [
    { id: "a", type: "text", medium: true },
    { id: "b", type: "autocomplete" },
    { id: "c", type: "text" },
  ],
  12,
  {},
  fullCardWidthPx
);
assert.ok(propBalance.a.targetWidthPx > propBalance.c.targetWidthPx);
assert.ok(propBalance.b.targetWidthPx > propBalance.c.targetWidthPx);
const propSum =
  propBalance.a.targetWidthPx + propBalance.b.targetWidthPx + propBalance.c.targetWidthPx;
assert.ok(Math.abs(propSum - (getRowBudgetPx(12, fullCardWidthPx) - 16)) <= 4, "proporcional preenche 100%");

// --- Nenhum compacto com flex fixo 0 0
Object.values(propBalance).forEach((entry) => {
  assert.match(entry.flex, /^1 1 /, "compactos usam flex-grow, nunca largura fixa");
});

const normalizedWithBalance = normalizeCardRows(
  { id: "c1", colSpan: 12, fieldIds: ["a", "b", "razao"] },
  {},
  [
    { id: "a", type: "text" },
    { id: "b", type: "number" },
    { id: "razao", type: "text", wide: true },
  ]
);
assert.ok(normalizedWithBalance.rows.some((r) => r.fieldBalance?.a));

console.log("✓ Todos os testes LayoutConfigV3 passaram.");
