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
} from "../src/framework/cadastro/layouts/layoutConfigV3.js";
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

console.log("✓ Todos os testes LayoutConfigV3 (Etapa 1) passaram.");
