/**
 * Testes Etapa 1 — LayoutConfigV3 (schema, migrador, compatibilidade)
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
import { getMaxFieldsPerRow } from "../src/framework/cadastro/layouts/empFormFieldWidthPresets.js";
import {
  buildBalancedRows,
  fixOrphanRows,
  computeRowFieldBalance,
  isExpandableWidthType,
} from "../src/framework/cadastro/layouts/empFormRowBalance.js";
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

// --- V2 continua reconhecido
assert.equal(isLayoutConfigV2(legacyV2), true);
assert.equal(isLayoutConfigV3(legacyV2), false);

// --- Migração preserva todos os campos
const migrated = migrateV2ToV3(legacyV2, { defaultLayout: EMP_DEFAULT.layout });
assert.equal(migrated.version, 3);
assert.equal(isLayoutConfigV3(migrated), true);

const flatAfterMigrate = flattenV3LayoutToV2(migrated.layout);
assert.deepEqual(flatAfterMigrate.principal, legacyV2.layout.principal);
assert.deepEqual(flatAfterMigrate.geral, legacyV2.layout.geral);

const totalV2 = Object.values(legacyV2.layout).flat().length;
const totalV3 = countLayoutFieldsV3(migrated.layout);
assert.equal(totalV3, totalV2, "nenhum campo deve sumir na migração");

// --- Card virtual "geral" por painel
migrated.layout.principal.cards.forEach((card) => {
  assert.ok(card.id, "card deve ter id");
  assert.ok(Array.isArray(card.fieldIds), "card deve ter fieldIds");
});
const principalCard = migrated.layout.principal.cards.find((c) => c.id === DEFAULT_VIRTUAL_CARD_ID);
assert.ok(principalCard, 'painel principal deve ter card "geral"');
assert.deepEqual(principalCard.fieldIds, legacyV2.layout.principal);

// --- resolveLayoutConfig: fallback automático
const emptyResolved = resolveLayoutConfig(null, { defaultLayout: EMP_DEFAULT.layout, defaults: EMP_DEFAULT });
assert.equal(emptyResolved.config.version, 3);
assert.ok(emptyResolved.layoutFlat.principal.length > 0, "fallback deve preencher painel principal");
assert.equal(emptyResolved.migrated, true);

// --- normalizeLayoutConfig expõe layout flat para consumidores atuais
const normalized = normalizeLayoutConfig(legacyV2, {
  basePanels: EMP_DEFAULT.panels,
  defaultLayout: EMP_DEFAULT.layout,
});
assert.ok(Array.isArray(normalized.layout.principal), "consumidor V2: layout.principal é array");
assert.deepEqual(normalized.layout.principal, legacyV2.layout.principal);
assert.ok(normalized.layoutV3?.principal?.cards?.length > 0, "layoutV3 disponível");
assert.equal(normalized.version, 3);
assert.equal(normalized.fieldLayoutConfig.mode, "corporate");

// --- sanitize não remove campos
const sanitized = sanitizeLayoutFieldPlacements(normalized.layout);
assert.equal(countLayoutFields(sanitized), totalV2);

// --- ensureLayoutFields repara layout vazio sem perder defaults
const repaired = ensureLayoutFields({ panels: EMP_DEFAULT.panels, layout: { principal: [] } }, EMP_DEFAULT);
assert.ok(repaired.layout.principal.includes("razao_social") || repaired.layout.principal.includes("tipo_pessoa"));

// --- mergeSavedFormLayout
const merged = mergeSavedFormLayout(
  { panels: EMP_DEFAULT.panels, layout: { principal: ["razao_social"] } },
  EMP_DEFAULT
);
assert.ok(Array.isArray(merged.layout.principal));
assert.ok(merged.layoutV3);

// --- pickLayoutConfig persiste estrutura V3
const picked = pickLayoutConfig(normalized);
assert.equal(picked.version, 3);
assert.ok(picked.layout.principal.cards, "persistência: layout em V3 (cards)");
const persistedFlat = flattenV3LayoutToV2(picked.layout);
assert.equal(countLayoutFields(persistedFlat), totalV2);

// --- campo duplicado entre painéis: mantém no primeiro painel, remove dos demais
const dupConfig = migrateV2ToV3({
  panels: EMP_DEFAULT.panels,
  layout: { principal: ["razao_social"], geral: ["razao_social", "cpf_cnpj"] },
});
const dupFlat = flattenV3LayoutToV2(dupConfig.layout);
assert.deepEqual(dupFlat.principal, ["razao_social"]);
assert.deepEqual(dupFlat.geral, ["cpf_cnpj"]);
const allFieldIds = [...dupFlat.principal, ...dupFlat.geral];
assert.equal(new Set(allFieldIds).size, allFieldIds.length, "sem duplicata global");

// --- Card com linhas explícitas
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

// --- fieldIds sem rows gera linhas empacotadas
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
assert.equal(
  flattenRowsToFieldIds(packed).length,
  7,
  "preserva todos os campos ao normalizar rows"
);

assert.equal(getMaxFieldsPerRow(12), 6);
assert.equal(getMaxFieldsPerRow(6), 3);
assert.equal(getMaxFieldsPerRow(4), 2);

const manualPack = packFieldIdsIntoRows(
  ["f1", "f2", "f3", "f4", "f5", "f6", "f7"],
  {
    fields: [
      { id: "f1", type: "text" },
      { id: "f2", type: "text" },
      { id: "f3", type: "text" },
      { id: "f4", type: "text" },
      { id: "f5", type: "text" },
      { id: "f6", type: "text" },
      { id: "f7", type: "text" },
    ],
    card: { colSpan: 12 },
  }
);
assert.ok(manualPack.length >= 2, "quebra linha ao exceder 6 campos no card inteiro");

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

// --- Motor de balanceamento: sem linha órfã (1 campo sozinho)
const orphanFixed = fixOrphanRows([["a", "b", "c", "d", "e"], ["f"]]);
assert.equal(orphanFixed.length, 2);
assert.ok(orphanFixed.every((row) => row.length !== 1), "nenhuma linha com campo único");

const sevenBalanced = buildBalancedRows(
  ["f1", "f2", "f3", "f4", "f5", "f6", "f7"],
  {
    fields: Array.from({ length: 7 }, (_, i) => ({ id: `f${i + 1}`, type: "text" })),
    card: { colSpan: 12 },
  }
);
assert.ok(sevenBalanced.length >= 2);
sevenBalanced
  .filter((row) => !row.fullWidth)
  .forEach((row) => {
    assert.ok(row.fieldIds.length >= 2, "linha regular não deve ter órfão");
    assert.ok(row.fieldBalance && Object.keys(row.fieldBalance).length > 0, "fieldBalance por linha");
  });

// --- Tipos fixos (número/data) não absorvem sobra
assert.equal(isExpandableWidthType("NUMBER"), false);
assert.equal(isExpandableWidthType("SHORT_TEXT"), true);
const mixedBalance = computeRowFieldBalance(
  ["nome", "qtd", "dt"],
  [
    { id: "nome", type: "text" },
    { id: "qtd", type: "number" },
    { id: "dt", type: "date" },
  ],
  12,
  {}
);
assert.match(mixedBalance.qtd.flex, /^0 0 /);
assert.match(mixedBalance.dt.flex, /^0 0 /);
assert.ok(mixedBalance.nome.expandable);

// --- fieldBalance persiste na normalização
const normalizedWithBalance = normalizeCardRows(
  { id: "c1", colSpan: 12, fieldIds: ["a", "b", "c"] },
  {},
  [
    { id: "a", type: "text" },
    { id: "b", type: "number" },
    { id: "c", type: "text", wide: true },
  ]
);
const firstRow = normalizedWithBalance.rows[0];
assert.ok(firstRow.fieldBalance?.a, "fieldBalance persistido em normalizeLayoutRowV3");

console.log("✓ Todos os testes LayoutConfigV3 passaram.");
