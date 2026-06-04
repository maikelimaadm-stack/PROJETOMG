/**
 * Testes LayoutConfigV3 + motor corporativo V3 (sem decisões automáticas de layout)
 * Executar: npm run test:layout-v3
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
  reorderFieldWithinRows,
} from "../src/framework/cadastro/layouts/empFormLayoutRows.js";
import {
  getMaxFieldsPerRow,
  resolveFieldWidthTypePreset,
  normalizeFieldWidthTypes,
  inferFieldWidthType,
} from "../src/framework/cadastro/layouts/empFormFieldWidthPresets.js";
import {
  buildBalancedRows,
  packFieldsByMaxCount,
  packFieldsByRowBudget,
  computeRowFieldBalance,
  getRowBudgetPx,
  rowContentWidthPx,
  fixOrphanCompactRows,
} from "../src/framework/cadastro/layouts/empFormRowBalance.js";
import {
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
assert.ok(
  emptyResolved.layoutV3?.principal?.cards?.length > 0 ||
    emptyResolved.config?.layout?.principal?.cards?.length > 0,
  "fallback deve preencher painel principal"
);
assert.equal(emptyResolved.migrated, true);

const normalized = normalizeLayoutConfig(legacyV2, {
  basePanels: EMP_DEFAULT.panels,
  defaultLayout: EMP_DEFAULT.layout,
});
assert.ok(normalized.layout.principal?.cards?.length > 0, "layout canônico V3 em layout.principal");
assert.equal(normalized.version, 3);
assert.equal(normalized.layoutV3, undefined, "sem alias layoutV3 em runtime");
assert.equal(normalized.fieldLayoutConfig.mode, "corporate");
const principalIds = normalized.layout.principal.cards.flatMap((c) => c.fieldIds || []);
assert.ok(principalIds.includes("tipo_pessoa"), "campos migrados para cards V3");

const sanitized = sanitizeLayoutFieldPlacements(normalized.layout);
assert.equal(countLayoutFields(sanitized), totalV2);

const repaired = ensureLayoutFields({ panels: EMP_DEFAULT.panels, layout: { principal: [] } }, EMP_DEFAULT);
const repairedPrincipalIds = flattenV3LayoutToV2(repaired.layout).principal || [];
assert.ok(
  repairedPrincipalIds.includes("razao_social") || repairedPrincipalIds.includes("tipo_pessoa")
);

const merged = mergeSavedFormLayout(
  { panels: EMP_DEFAULT.panels, layout: { principal: ["razao_social"] } },
  EMP_DEFAULT
);
assert.ok(merged.layout?.principal?.cards?.length > 0, "mergeSavedFormLayout retorna V3");

const picked = pickLayoutConfig(normalized);
assert.equal(picked.version, 3);
assert.ok(picked.layout.principal.cards, "persistência: layout em V3 (cards)");
assert.equal(picked.layoutV3, undefined, "pickLayoutConfig não persiste layoutV3 duplicado");
assert.equal(countLayoutFields(picked.layout), totalV2);

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

// --- Limites por card
assert.equal(getMaxFieldsPerRow(12), 6);
assert.equal(getMaxFieldsPerRow(6), 4);

const textFields = Array.from({ length: 7 }, (_, i) => ({ id: `f${i + 1}`, type: "text" }));

const fullCardPacked = normalizeCardRows(
  { id: "c1", colSpan: 12, fieldIds: textFields.map((f) => f.id) },
  {},
  textFields
);
assert.ok(
  fullCardPacked.rows.length >= 2,
  "card inteiro: campos principais quebram por largura mínima no container padrão"
);
fullCardPacked.rows.forEach((row) => {
  assert.ok(
    rowContentWidthPx(row.fieldIds, textFields, {}) <= getRowBudgetPx(12),
    "cada linha cabe no budget do card inteiro"
  );
});
assert.equal(flattenRowsToFieldIds(fullCardPacked).length, 7);

const halfCardPacked = normalizeCardRows(
  { id: "c2", colSpan: 6, fieldIds: ["a", "b", "c", "d", "e"] },
  {},
  ["a", "b", "c", "d", "e"].map((id) => ({ id, type: "text" }))
);
const halfFields = ["a", "b", "c", "d", "e"].map((id) => ({ id, type: "text" }));
const halfBudget = getRowBudgetPx(6);
halfCardPacked.rows.forEach((row) => {
  if (row.fieldIds.length > 1) {
    assert.ok(
      rowContentWidthPx(row.fieldIds, halfFields, {}) <= halfBudget + 1,
      "card meio: linha com vários campos dentro do budget"
    );
    return;
  }
  const target = Object.values(row.fieldBalance || {})[0]?.targetWidthPx;
  assert.ok(
    target <= halfBudget + 1,
    "card meio: campo isolado escalado para caber no budget"
  );
});
assert.equal(flattenRowsToFieldIds(halfCardPacked).length, 5);

// --- Campo principal unificado (texto, select, lookup, e-mail, textarea)
const MAIN_PRESET = { min: 260, grow: 3, type: "CAMPO_PRINCIPAL" };
[
  { type: "text" },
  { type: "textarea" },
  { type: "email" },
  { type: "select" },
  { type: "multiselect" },
  { type: "autocomplete" },
  { type: "text", widthType: "TEXTO_LONGO" },
  { type: "text", widthType: "EMAIL" },
  { type: "text", widthType: "LOOKUP" },
].forEach((field) => {
  const preset = resolveFieldWidthTypePreset(field);
  assert.equal(preset.min, MAIN_PRESET.min, `min ${field.type || field.widthType}`);
  assert.equal(preset.grow, MAIN_PRESET.grow, `grow ${field.type || field.widthType}`);
  assert.equal(preset.type, MAIN_PRESET.type);
});

assert.equal(resolveFieldWidthTypePreset({ type: "number" }).min, 120);
assert.equal(resolveFieldWidthTypePreset({ type: "number" }).grow, 1);
assert.equal(resolveFieldWidthTypePreset({ type: "date" }).min, 140);
assert.equal(resolveFieldWidthTypePreset({ type: "datetime" }).min, 180);
assert.equal(resolveFieldWidthTypePreset({ type: "image" }).min, 180);
assert.equal(resolveFieldWidthTypePreset({ type: "file" }).min, 220);
assert.equal(resolveFieldWidthTypePreset({ type: "text", widthType: "CODIGO" }).grow, 0.5);
assert.equal(resolveFieldWidthTypePreset({ type: "select", widthType: "SIM_NAO" }).grow, 0.5);
assert.equal(resolveFieldWidthTypePreset({ type: "checkbox" }).grow, 0.5);
assert.equal(resolveFieldWidthTypePreset({ type: "cep" }).type, "TEXTO_CURTO");
assert.equal(resolveFieldWidthTypePreset({ type: "tel" }).type, "TEXTO_CURTO");
assert.equal(resolveFieldWidthTypePreset({ type: "autocomplete", widthType: "UF" }).type, "TEXTO_CURTO");

assert.deepEqual(normalizeFieldWidthTypes({ f1: "XS", f2: "MD" }), {
  f1: "TEXTO_CURTO",
  f2: "CAMPO_PRINCIPAL",
});

// --- Sem classificação expansiva / linha exclusiva automática
assert.equal(isExpansiveLayoutField({ type: "textarea" }), false);
assert.equal(isExpansiveLayoutField({ type: "text", wide: true }), false);
assert.equal(inferFieldWidthType({ type: "text", wide: true }), "CAMPO_PRINCIPAL");
assert.equal(inferFieldWidthType({ type: "select" }), "CAMPO_PRINCIPAL");
assert.equal(inferFieldWidthType({ type: "autocomplete" }), "CAMPO_PRINCIPAL");
assert.equal(inferFieldWidthType({ type: "image", layoutExpand: true }), "IMAGEM");

const withTextarea = packFieldIdsIntoRows(["a", "b", "obs"], {
  fields: [
    { id: "a", type: "text" },
    { id: "b", type: "text" },
    { id: "obs", type: "textarea" },
  ],
  card: { colSpan: 12 },
  containerWidthPx: 920,
});
assert.equal(withTextarea.length, 1, "textarea na mesma linha quando cabe na ordem");
assert.deepEqual(withTextarea[0].fieldIds, ["a", "b", "obs"]);
assert.equal(withTextarea[0].fullWidth, false);

const orphanUnchanged = fixOrphanCompactRows([["f"]]);
assert.deepEqual(orphanUnchanged, [["f"]], "campo sozinho permanece sozinho");

const aloneField = buildBalancedRows(["obs"], {
  fields: [{ id: "obs", type: "textarea" }],
  card: { colSpan: 12 },
});
assert.equal(aloneField.length, 1);
assert.equal(aloneField[0].fullWidth, false);
assert.equal(aloneField[0].fieldIds[0], "obs");

const imageInRow = buildBalancedRows(["logo", "nome"], {
  fields: [
    { id: "logo", type: "image" },
    { id: "nome", type: "text" },
  ],
  card: { colSpan: 12 },
  containerWidthPx: 920,
});
assert.equal(imageInRow[0].fieldIds.length, 2);
assert.equal(isInlineMediaField({ type: "image" }), true);

// --- Redistribuição proporcional preenche a linha
const fullCardWidthPx = 920;
const threeMainFields = ["a", "b", "c"].map((id) => ({ id, type: "text" }));
const equalBalance = computeRowFieldBalance(
  threeMainFields.map((f) => f.id),
  threeMainFields,
  12,
  {},
  fullCardWidthPx
);
const budget = getRowBudgetPx(12, fullCardWidthPx) - 2 * 8;
const widths = Object.values(equalBalance).map((b) => b.targetWidthPx);
const sumWidths = widths.reduce((s, w) => s + w, 0);
assert.ok(Math.abs(sumWidths - budget) <= 12, "3 campos principais preenchem a linha");
widths.forEach((w) => assert.ok(Math.abs(w - widths[0]) <= 2, "distribuição igual entre principais"));

Object.values(equalBalance).forEach((entry) => {
  assert.equal(entry.flexGrow, 3);
  assert.ok(entry.maxWidth === "none" || entry.maxWidth === "100%");
  assert.match(entry.flex, /^3 1 /);
});

const growBalance = computeRowFieldBalance(
  ["codempresa", "razao_social", "email"],
  [
    { id: "codempresa", type: "text", widthType: "CODIGO" },
    { id: "razao_social", type: "text" },
    { id: "email", type: "email" },
  ],
  12,
  {},
  fullCardWidthPx
);
assert.equal(growBalance.codempresa.flexGrow, 0.5);
assert.equal(growBalance.razao_social.flexGrow, 3);
assert.equal(growBalance.email.flexGrow, 3);
assert.ok(growBalance.email.targetWidthPx > growBalance.codempresa.targetWidthPx);
assert.ok(Math.abs(growBalance.razao_social.targetWidthPx - growBalance.email.targetWidthPx) <= 4);

const mainRowBalance = computeRowFieldBalance(
  ["razao_social", "tipo_vinculo", "nome_fantasia", "email"],
  [
    { id: "razao_social", type: "text" },
    { id: "tipo_vinculo", type: "select" },
    { id: "nome_fantasia", type: "text" },
    { id: "email", type: "email" },
  ],
  12,
  {},
  fullCardWidthPx
);
["razao_social", "tipo_vinculo", "nome_fantasia", "email"].forEach((id) => {
  assert.equal(mainRowBalance[id].flexGrow, 3, `${id} grow`);
  assert.equal(mainRowBalance[id].growWeight, 3, `${id} weight`);
});
const mainWidths = ["razao_social", "tipo_vinculo", "nome_fantasia", "email"].map(
  (id) => mainRowBalance[id].targetWidthPx
);
mainWidths.forEach((w) => {
  mainWidths.forEach((other) => assert.ok(Math.abs(w - other) <= 4, "campos principais equilibrados"));
});

const propBalance = computeRowFieldBalance(
  ["a", "b", "c"],
  [
    { id: "a", type: "text" },
    { id: "b", type: "autocomplete" },
    { id: "c", type: "select" },
  ],
  12,
  {},
  fullCardWidthPx
);
assert.equal(propBalance.a.flexGrow, 3);
assert.equal(propBalance.b.flexGrow, 3);
assert.ok(Math.abs(propBalance.a.targetWidthPx - propBalance.c.targetWidthPx) <= 4);
const propSum =
  propBalance.a.targetWidthPx + propBalance.b.targetWidthPx + propBalance.c.targetWidthPx;
assert.ok(Math.abs(propSum - (getRowBudgetPx(12, fullCardWidthPx) - 16)) <= 4);

// --- Linhas explícitas do usuário são preservadas quando cabem no budget
const userRowsCard = normalizeCardRows(
  {
    id: "user",
    colSpan: 12,
    rows: [
      { id: "r1", order: 1, fieldIds: ["solo"] },
      { id: "r2", order: 2, fieldIds: ["a", "b", "obs"] },
    ],
  },
  {},
  [
    { id: "solo", type: "text" },
    { id: "a", type: "text" },
    { id: "b", type: "text" },
    { id: "obs", type: "textarea" },
  ],
  920
);
assert.equal(userRowsCard.rows.length, 2);
assert.deepEqual(userRowsCard.rows[0].fieldIds, ["solo"]);
assert.deepEqual(userRowsCard.rows[1].fieldIds, ["a", "b", "obs"]);

// --- Reordenação dentro das linhas
const reordered = reorderFieldWithinRows(
  [
    { id: "r1", order: 1, fieldIds: ["a", "b"] },
    { id: "r2", order: 2, fieldIds: ["c"] },
  ],
  "c",
  "a"
);
assert.deepEqual(reordered[0].fieldIds, ["c", "a", "b"]);

// --- Empacotamento por largura (exemplo 1200px)
const wideContainerPx = 1200;
const wideBudget = getRowBudgetPx(12, wideContainerPx);
const mixedFields = [
  { id: "a", type: "text" },
  { id: "b", type: "text" },
  { id: "c", type: "text" },
  { id: "d", type: "text", widthType: "CODIGO" },
  { id: "e", type: "text", widthType: "CODIGO" },
  { id: "f", type: "text" },
];
const mixedIds = ["a", "b", "c", "d", "e", "f"];
const widthPacked = packFieldsByRowBudget(
  mixedIds,
  mixedFields,
  { colSpan: 12 },
  {},
  wideContainerPx
);
assert.deepEqual(widthPacked[0], ["a", "b", "c", "d", "e"], "5 campos cabem na primeira linha");
assert.deepEqual(widthPacked[1], ["f"], "sexto campo na linha seguinte");
widthPacked.forEach((row) => {
  assert.ok(rowContentWidthPx(row, mixedFields, {}) <= wideBudget, "linha não ultrapassa budget");
});

// --- Linha empresas (tipo pessoa, razão social, vínculo, código, ativa)
const empLineFields = [
  { id: "tipo_pessoa", type: "select" },
  { id: "razao_social", type: "text" },
  { id: "tipo_vinculo", type: "select" },
  { id: "codempresa", type: "text", widthType: "CODIGO" },
  { id: "status", type: "select", widthType: "SIM_NAO" },
];
const empLineIds = empLineFields.map((f) => f.id);
const empPacked = packFieldsByRowBudget(
  empLineIds,
  empLineFields,
  { colSpan: 12 },
  {},
  wideContainerPx
);
empPacked.forEach((row) => {
  assert.ok(rowContentWidthPx(row, empLineFields, {}) <= wideBudget);
});
assert.equal(empPacked.flat().length, 5);

// --- Teto 6 campos quando a largura permite (campos compactos)
const compactFields = ["1", "2", "3", "4", "5", "6", "7"].map((id) => ({
  id,
  type: "text",
  widthType: "CODIGO",
}));
const maxPack = packFieldsByMaxCount(
  compactFields.map((f) => f.id),
  { colSpan: 12 },
  compactFields,
  {},
  2400
);
assert.deepEqual(maxPack[0], ["1", "2", "3", "4", "5", "6"]);
assert.deepEqual(maxPack[1], ["7"]);

// --- Cada linha gerada respeita budget (card 920px)
for (const count of [3, 4, 5, 6]) {
  const ids = Array.from({ length: count }, (_, i) => `f${i}`);
  const fieldsForRow = ids.map((id) => ({ id, type: "text" }));
  const rows = buildBalancedRows(ids, {
    fields: fieldsForRow,
    card: { colSpan: 12 },
    containerWidthPx: fullCardWidthPx,
  });
  const lineBudget = getRowBudgetPx(12, fullCardWidthPx);
  rows.forEach((row) => {
    assert.ok(
      rowContentWidthPx(row.fieldIds, fieldsForRow, {}) <= lineBudget + 1,
      `${count} campos: linha dentro do budget`
    );
  });
  assert.equal(rows.flatMap((r) => r.fieldIds).join(","), ids.join(","), "ordem preservada");
}

console.log("✓ Todos os testes LayoutConfigV3 passaram.");
