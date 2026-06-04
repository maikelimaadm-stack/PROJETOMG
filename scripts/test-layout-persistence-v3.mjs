/**
 * Auditoria de persistência Layout V3 — formato canônico único
 * Executar: npm run test:layout-persistence-v3
 */
import assert from "node:assert/strict";
import {
  pickLayoutConfig,
  normalizeLayoutConfig,
  ensureLayoutFields,
  readStoredLayoutConfig,
  writeStoredLayoutConfig,
  bindLayoutStoreUser,
  getLayoutStorageKeys,
  countLayoutFields,
} from "../src/framework/cadastro/layouts/empFormLayoutStore.js";
import {
  isLayoutStructureV2,
  isLayoutStructureV3,
  flattenV3LayoutToV2,
  getDefaultFlatLayoutFromConfig,
  getPanelFieldIdsFromLayout,
} from "../src/framework/cadastro/layouts/layoutConfigV3.js";
import { buildEmpFormDefaultConfig } from "../src/modules/empresas/components/formEmp.constants.js";
import {
  buildLayoutV3FromCards,
  getPanelCardsForRender,
  initCardsByPanel,
} from "../src/framework/cadastro/layouts/empFormLayoutCards.js";
import { normalizeCardRows } from "../src/framework/cadastro/layouts/empFormLayoutRows.js";

const store = new Map();

globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, value),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};

const TEST_PANELS = [
  { id: "principal", label: "Principal" },
  { id: "extra", label: "Extra" },
];

const TEST_DEFAULT_FLAT = {
  principal: ["a", "b", "c"],
  extra: ["d"],
};

const TEST_DEFAULTS = normalizeLayoutConfig(
  {
    version: 3,
    panels: TEST_PANELS,
    layout: TEST_DEFAULT_FLAT,
    fieldLayoutConfig: { mode: "corporate", columns: 12 },
    clearOnDuplicateFieldIds: ["b"],
  },
  { basePanels: TEST_PANELS, defaultLayout: TEST_DEFAULT_FLAT }
);

function assertCanonicalConfig(config, label) {
  assert.equal(config.version, 3, `${label}: version`);
  assert.equal(config.layoutV3, undefined, `${label}: sem layoutV3 duplicado`);
  assert.equal(config.layoutFlat, undefined, `${label}: sem layoutFlat em runtime`);
  assert.ok(isLayoutStructureV3(config.layout), `${label}: layout é V3`);
  assert.equal(isLayoutStructureV2(config.layout), false, `${label}: layout não é flat V2`);
}

function simulateConfiguratorSave(cardsByPanel, baseConfig) {
  return pickLayoutConfig({
    ...baseConfig,
    layout: buildLayoutV3FromCards(cardsByPanel),
  });
}

// --- Salvar (localStorage)
const userA = "user-a-persist";
bindLayoutStoreUser(userA);
const keysA = getLayoutStorageKeys(userA);
store.clear();

const editedCards = initCardsByPanel({
  panels: TEST_PANELS,
  layout: TEST_DEFAULTS.layout,
});
editedCards.principal.cards[0].fieldIds = ["c", "b", "a"];
editedCards.principal.cards[0].rows = [];
const savedConfig = simulateConfiguratorSave(editedCards, TEST_DEFAULTS);
assertCanonicalConfig(savedConfig, "salvar");

writeStoredLayoutConfig(savedConfig);
const rawStored = JSON.parse(store.get(keysA.legacyKey));
assertCanonicalConfig(rawStored, "localStorage");
assert.ok(!isLayoutStructureV2(rawStored.layout), "localStorage não guarda flat");

// --- UsuarioPreferencia (activeConfig = pickLayoutConfig)
const remotePayload = pickLayoutConfig(savedConfig);
assertCanonicalConfig(remotePayload, "UsuarioPreferencia.activeConfig");
assert.deepEqual(flattenV3LayoutToV2(remotePayload.layout).principal, ["c", "b", "a"]);

// --- Reabrir formulário
const reopened = readStoredLayoutConfig();
assert.ok(reopened, "readStoredLayoutConfig");
assertCanonicalConfig(reopened, "reabrir localStorage");

const ensured = ensureLayoutFields(reopened, TEST_DEFAULTS, { knownFieldIds: ["a", "b", "c", "d"] });
assertCanonicalConfig(ensured, "ensureLayoutFields");

const normalized = normalizeLayoutConfig(ensured, {
  basePanels: TEST_PANELS,
  defaultLayout: TEST_DEFAULT_FLAT,
});
assertCanonicalConfig(normalized, "normalizeLayoutConfig (renderer)");

const rendererCards = getPanelCardsForRender({
  layout: normalized.layout,
  panelId: "principal",
  defaultLayout: TEST_DEFAULT_FLAT,
});
assert.ok(rendererCards.length >= 1, "renderer obtém cards");
normalizeCardRows(rendererCards[0], {}, [
  { id: "a", type: "text" },
  { id: "b", type: "text" },
  { id: "c", type: "text" },
]);

// --- Editar e re-salvar (reordenação no painel principal)
editedCards.principal.cards[0].fieldIds = ["b", "a", "c"];
editedCards.principal.cards[0].rows = [];
const reEdited = simulateConfiguratorSave(editedCards, normalized);
writeStoredLayoutConfig(reEdited);
const afterEdit = readStoredLayoutConfig();
assertCanonicalConfig(afterEdit, "após editar");
assert.equal(countLayoutFields(afterEdit.layout), 4, "campos preservados após reedição");

// --- Restaurar padrão
const restored = ensureLayoutFields({}, TEST_DEFAULTS);
assertCanonicalConfig(restored, "restaurar padrão");
assert.deepEqual(flattenV3LayoutToV2(restored.layout).principal, TEST_DEFAULT_FLAT.principal);

// --- Duplicar registro (clearOnDuplicate preservado)
const duplicateConfig = pickLayoutConfig({
  ...afterEdit,
  clearOnDuplicateFieldIds: ["b"],
});
assert.ok(duplicateConfig.clearOnDuplicateFieldIds.includes("b"));
assertCanonicalConfig(
  normalizeLayoutConfig(duplicateConfig, { basePanels: TEST_PANELS, defaultLayout: TEST_DEFAULT_FLAT }),
  "duplicar registro"
);

// --- Trocar usuário
const userB = "user-b-persist";
bindLayoutStoreUser(userB);
const keysB = getLayoutStorageKeys(userB);
writeStoredLayoutConfig(pickLayoutConfig(TEST_DEFAULTS));

bindLayoutStoreUser(userA);
const backA = readStoredLayoutConfig();
assertCanonicalConfig(backA, "usuário A após troca");

bindLayoutStoreUser(userB);
const userBConfig = readStoredLayoutConfig();
assertCanonicalConfig(userBConfig, "usuário B");
assert.notDeepEqual(
  JSON.stringify(pickLayoutConfig(backA)),
  JSON.stringify(pickLayoutConfig(userBConfig)),
  "preferências isoladas por usuário"
);

// --- Ingestão V2 legado na leitura
const legacyIngest = normalizeLayoutConfig(
  {
    version: 2,
    panels: TEST_PANELS,
    layout: { principal: ["x", "y"], extra: ["z"] },
    fieldLayoutConfig: { mode: "vertical", columns: 1 },
  },
  { basePanels: TEST_PANELS, defaultLayout: TEST_DEFAULT_FLAT }
);
assertCanonicalConfig(legacyIngest, "ingestão V2");

// --- Configurador: initCardsByPanel só com layout V3
const configuratorCards = initCardsByPanel({
  panels: TEST_PANELS,
  layout: afterEdit.layout,
});
assert.ok(configuratorCards.principal?.cards?.length > 0, "configurador lê layout V3");

// --- Configurador empresas: default V3 não quebra lookup de painel (flat derivado)
const empDefault = buildEmpFormDefaultConfig();
const empFlat = getDefaultFlatLayoutFromConfig(empDefault);
assert.ok(Array.isArray(empFlat.principais), "flat principais");
assert.ok(empFlat.principais.includes("razao_social"), "razão social no flat");
assert.equal(
  getPanelFieldIdsFromLayout(empDefault.layout, "principais").includes("razao_social"),
  true,
  "getPanelFieldIdsFromLayout em layout V3"
);
const empConfiguratorCards = initCardsByPanel({
  panels: empDefault.panels,
  layout: empDefault.layout,
  defaultLayout: empFlat,
});
assert.ok(empConfiguratorCards.principais?.cards?.length > 0, "configurador empresas abre cards");

// --- Limpar localStorage e reabrir
store.clear();
bindLayoutStoreUser(userA);
const afterClear = readStoredLayoutConfig();
assert.equal(afterClear, null, "localStorage limpo");
writeStoredLayoutConfig(savedConfig);
assert.ok(readStoredLayoutConfig(), "regrava após limpar");

// --- Hidratação remota simulada (payload = pickLayoutConfig)
bindLayoutStoreUser(userB);
const remoteSim = pickLayoutConfig({
  ...TEST_DEFAULTS,
  layout: afterEdit.layout,
  fieldSizes: { email: "EMAIL" },
});
writeStoredLayoutConfig(remoteSim);
const hydrated = ensureLayoutFields(readStoredLayoutConfig(), TEST_DEFAULTS, {
  knownFieldIds: ["a", "b", "c", "d", "email"],
});
assertCanonicalConfig(hydrated, "layout remoto simulado");
assert.equal(hydrated.fieldSizes?.email, "CAMPO_PRINCIPAL");

// --- fieldSizes legados normalizam para CAMPO_PRINCIPAL (mesmo min/grow)
const legacySizes = pickLayoutConfig({
  ...TEST_DEFAULTS,
  fieldSizes: {
    razao_social: "TEXTO_LONGO",
    email: "EMAIL",
    tipo_vinculo: "LOOKUP_RELACAO",
    nome_fantasia: "TEXTO_MEDIO",
  },
});
assert.equal(legacySizes.fieldSizes.razao_social, "CAMPO_PRINCIPAL");
assert.equal(legacySizes.fieldSizes.email, "CAMPO_PRINCIPAL");
assert.equal(legacySizes.fieldSizes.tipo_vinculo, "CAMPO_PRINCIPAL");
assert.equal(legacySizes.fieldSizes.nome_fantasia, "CAMPO_PRINCIPAL");

console.log("✓ Todos os testes de persistência Layout V3 passaram.");
