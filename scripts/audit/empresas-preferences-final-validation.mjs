#!/usr/bin/env node
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const UI_BASE_URL = (process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:5173").replace(/\/$/, "");
const API_BASE_URL = (
  process.env.VALIDATE_BASE_URL ||
  process.env.VALIDATE_API_BASE ||
  "http://127.0.0.1:3001"
).replace(/\/$/, "");

const USER_A = {
  cliente: process.env.VALIDATE_CLIENTE || "maike",
  usuario: process.env.VALIDATE_USUARIO || "maike",
  senha: process.env.VALIDATE_SENHA || "123",
};

const USER_B = {
  cliente: process.env.VALIDATE_USER_B_CLIENTE || process.env.AUDIT_CLIENTE_B || "",
  usuario: process.env.VALIDATE_USER_B_USUARIO || process.env.AUDIT_USUARIO_B || "",
  senha: process.env.VALIDATE_USER_B_SENHA || process.env.AUDIT_SENHA_B || "",
};

const result = {
  meta: {
    startedAt: new Date().toISOString(),
    uiBaseUrl: UI_BASE_URL,
    apiBaseUrl: API_BASE_URL,
    userA: { cliente: USER_A.cliente, usuario: USER_A.usuario },
    userBConfigured: Boolean(USER_B.cliente && USER_B.usuario && USER_B.senha),
  },
  branchAudit: {},
  scenarioE: {},
  scenarioCards: {},
  isolation: {},
  restore: {},
  restoreEvidence: {},
  consoleFindings: {
    maxUpdateDepthErrors: [],
    otherErrors: [],
  },
  network: {
    preferenceRequests: [],
  },
  errors: [],
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const toObj = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});
const deepClone = (value) => JSON.parse(JSON.stringify(value));
const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const stableStringify = (value) => {
  const normalize = (input) => {
    if (Array.isArray(input)) return input.map(normalize);
    if (!input || typeof input !== "object") return input;
    const keys = Object.keys(input).sort();
    const normalized = {};
    for (const key of keys) normalized[key] = normalize(input[key]);
    return normalized;
  };
  return JSON.stringify(normalize(value));
};

const sameJson = (a, b) => stableStringify(a) === stableStringify(b);

const buildExactRestorePayload = (baseline, current) => {
  if (Array.isArray(baseline)) return deepClone(baseline);
  if (!baseline || typeof baseline !== "object") return baseline;
  const baselineObj = toObj(baseline);
  const currentObj = toObj(current);
  const keys = new Set([...Object.keys(baselineObj), ...Object.keys(currentObj)]);
  const restored = {};
  for (const key of keys) {
    if (!(key in baselineObj)) {
      restored[key] = null;
      continue;
    }
    const baselineValue = baselineObj[key];
    const currentValue = currentObj[key];
    const nestedObject =
      baselineValue &&
      currentValue &&
      typeof baselineValue === "object" &&
      typeof currentValue === "object" &&
      !Array.isArray(baselineValue) &&
      !Array.isArray(currentValue);
    restored[key] = nestedObject
      ? buildExactRestorePayload(baselineValue, currentValue)
      : deepClone(baselineValue);
  }
  return restored;
};

const apiRequest = async (path, { method = "GET", token, body, allow404 = false } = {}) => {
  const startedAt = Date.now();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const elapsedMs = Date.now() - startedAt;
  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }
  if (!response.ok && !(allow404 && response.status === 404)) {
    const error = new Error((data && data.message) || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return { status: response.status, data, elapsedMs };
};

const loginApi = async (credentials) => {
  const response = await apiRequest("/api/auth/login", {
    method: "POST",
    body: credentials,
  });
  if (!response.data?.token) throw new Error("Login sem token.");
  return response.data;
};

const getScope = async (token, modulo, tela, { allow404 = false } = {}) =>
  apiRequest(`/api/user/preferences/${modulo}/${tela}`, { token, allow404 });

const putScope = async (
  token,
  modulo,
  tela,
  preferencias,
  { expectedRevision, expectedUpdatedAt, versaoSchema } = {}
) =>
  apiRequest(`/api/user/preferences/${modulo}/${tela}`, {
    method: "PUT",
    token,
    body: {
      versao_schema:
        versaoSchema || Number(preferencias?.version) || Number(preferencias?.activeConfig?.version) || 2,
      preferencias,
      expectedRevision,
      expectedUpdatedAt,
    },
  });

const patchScope = async (
  token,
  modulo,
  tela,
  section,
  patch,
  { expectedRevision, expectedUpdatedAt, versaoSchema } = {}
) =>
  apiRequest(`/api/user/preferences/${modulo}/${tela}`, {
    method: "PATCH",
    token,
    body: {
      section,
      patch,
      versao_schema: versaoSchema || 2,
      expectedRevision,
      expectedUpdatedAt,
    },
  });

const patchScopeWithRetry = async (
  token,
  modulo,
  tela,
  section,
  patch,
  options = {},
  maxRetries = 3
) => {
  let nextOptions = { ...options };
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await patchScope(token, modulo, tela, section, patch, nextOptions);
    } catch (error) {
      if (Number(error?.status) !== 409 || attempt >= maxRetries) throw error;
      nextOptions = {
        ...nextOptions,
        expectedRevision: Number.isFinite(Number(error?.data?.currentRevision))
          ? Number(error.data.currentRevision)
          : nextOptions.expectedRevision,
        expectedUpdatedAt: error?.data?.currentUpdatedAt || nextOptions.expectedUpdatedAt,
      };
      await sleep(200);
    }
  }
  throw new Error("Não foi possível aplicar patch com retry.");
};

const closeRadixOverlays = async (page, maxAttempts = 4) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const overlayVisible = await page
      .locator("div.fixed.inset-0.z-50.bg-black\\/80[data-state='open'], [data-state='open'].fixed.inset-0.z-50")
      .first()
      .isVisible()
      .catch(() => false);
    if (!overlayVisible) return;
    await page.keyboard.press("Escape").catch(() => undefined);
    await sleep(150);
  }
};

const clickViewMode = async (page, mode) => {
  await closeRadixOverlays(page);
  const selectors = [
    `.view-mode-btn[data-view="${mode}"]`,
    `[data-view="${mode}"]`,
  ];
  const labels = { tabela: "Tabela", registro: "Registro", cards: "Cards" };
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.isVisible().catch(() => false)) {
      try {
        await locator.click({ timeout: 15000 });
      } catch {
        await closeRadixOverlays(page);
        await locator.click({ timeout: 15000 });
      }
      return;
    }
  }
  const roleButton = page.getByRole("button", { name: labels[mode] || mode }).first();
  if (await roleButton.isVisible().catch(() => false)) {
    await roleButton.click({ timeout: 15000 });
    return;
  }
  await page.goto(`${UI_BASE_URL}/CadastroEmpresas`, { waitUntil: "domcontentloaded" });
  const locator = page.locator(`.view-mode-btn[data-view="${mode}"], [data-view="${mode}"]`).first();
  await locator.click({ timeout: 15000 });
};

const waitEmpresasReady = async (page, credentials) => {
  await page.goto(`${UI_BASE_URL}/CadastroEmpresas`, { waitUntil: "domcontentloaded" });
  const loginHeading = page.getByRole("heading", { name: /login do sistema/i });
  if (await loginHeading.isVisible().catch(() => false)) {
    await page.getByRole("textbox", { name: "Cliente" }).fill(credentials.cliente);
    await page.getByRole("textbox", { name: "Usuário" }).fill(credentials.usuario);
    await page.getByRole("textbox", { name: "Senha" }).fill(credentials.senha);
    await page.getByRole("button", { name: "Entrar" }).click();
  }
  await page.waitForSelector(".view-mode-btn[data-view='tabela'], .view-mode-btn[data-view='registro']", {
    timeout: 60000,
  });
  await page.waitForSelector('[data-testid="emp-table"], .mg-table-panel, table', { timeout: 60000 });
  await page
    .locator("text=Carregando módulo...")
    .waitFor({ state: "hidden", timeout: 10000 })
    .catch(() => undefined);
};

const ensureNoInfiniteLoading = async (page, timeoutMs = 6000) => {
  const loading = page.locator("text=Carregando módulo...");
  await loading.waitFor({ state: "hidden", timeout: timeoutMs }).catch(() => {
    throw new Error("Detectado loading infinito (Carregando módulo...).");
  });
};

const performLogoutLogin = async (page, credentials) => {
  const directLogout = page.getByRole("button", { name: /^sair$/i }).first();
  if (await directLogout.isVisible().catch(() => false)) {
    await directLogout.click({ timeout: 15000 });
    await waitEmpresasReady(page, credentials);
    return;
  }

  // Fallback determinístico quando o botão não está exposto no chrome atual.
  await page.evaluate(() => {
    localStorage.removeItem("erp_auth_token");
    sessionStorage.removeItem("erp_auth_token");
  });
  await page.goto(`${UI_BASE_URL}/CadastroEmpresas`, { waitUntil: "domcontentloaded" });
  await waitEmpresasReady(page, credentials);
};

const openFormLayoutConfig = async (page) => {
  await page.getByRole("button", { name: "Mais opções" }).first().click({ timeout: 15000 });
  await page.getByRole("menuitem", { name: "Layout do formulário" }).click({ timeout: 15000 });
  await page.getByRole("button", { name: "Editar" }).first().click({ timeout: 15000 });
};

const setCardsPerRowUI = async (page, cardsPerRow) => {
  await closeRadixOverlays(page);
  await page.getByRole("button", { name: "Configurar layout dos cards" }).click({ timeout: 15000 });
  const menu = page.locator(".mg-cards-layout-menu.open").last();
  await menu.waitFor({ state: "visible", timeout: 15000 });
  await menu.locator(".mg-cards-layout-menu__item", { hasText: `${cardsPerRow} cards por linha` }).click({
    timeout: 15000,
  });
  await menu.getByRole("button", { name: /^ok$/i }).click({ timeout: 15000 });
  await menu.waitFor({ state: "hidden", timeout: 15000 }).catch(() => undefined);
};

const toggleCardFieldUI = async (page, fieldLabel) => {
  await closeRadixOverlays(page);
  await page.getByRole("button", { name: "Configurar campos dos cards" }).click({ timeout: 15000 });
  const menu = page
    .locator(".mg-cards-config-menu.open")
    .filter({ has: page.locator(".mg-cards-config-menu__item", { hasText: fieldLabel }) })
    .first();
  await menu.waitFor({ state: "visible", timeout: 15000 });
  await menu.locator(".mg-cards-config-menu__item", { hasText: fieldLabel }).first().click({ timeout: 15000 });
  await menu.getByRole("button", { name: /^ok$/i }).click({ timeout: 15000 });
  await menu.waitFor({ state: "hidden", timeout: 15000 }).catch(() => undefined);
};

const setCardFieldVisibilityUI = async (page, fieldLabel, visible) => {
  await closeRadixOverlays(page);
  await page.getByRole("button", { name: "Configurar campos dos cards" }).click({ timeout: 15000 });
  const menu = page
    .locator(".mg-cards-config-menu.open")
    .filter({ has: page.locator(".mg-cards-config-menu__item", { hasText: fieldLabel }) })
    .first();
  await menu.waitFor({ state: "visible", timeout: 15000 });
  const item = menu.locator(".mg-cards-config-menu__item", { hasText: fieldLabel }).first();
  const checkbox = item.locator("input[type='checkbox']");
  const isChecked = await checkbox.isChecked();
  if (isChecked !== visible) {
    await item.click({ timeout: 15000 });
  }
  await menu.getByRole("button", { name: /^ok$/i }).click({ timeout: 15000 });
  await menu.waitFor({ state: "hidden", timeout: 15000 }).catch(() => undefined);
};

const openTableColumnsDialog = async (page) => {
  await closeRadixOverlays(page);
  await clickViewMode(page, "tabela");
  await page.getByRole("button", { name: "Configurar colunas da tabela" }).click({ timeout: 20000 });
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 15000 });
  return dialog;
};

const ensureTableColumnVisibleUI = async (page, columnLabel) => {
  const dialog = await openTableColumnsDialog(page);
  const usedPanel = dialog.locator(".emp-config-transfer-panel").nth(1);
  const availablePanel = dialog.locator(".emp-config-transfer-panel").nth(0);
  const labelRegex = new RegExp(escapeRegExp(columnLabel), "i");
  const usedColumn = usedPanel.locator(".emp-config-transfer-item").filter({ hasText: labelRegex }).first();
  if (await usedColumn.isVisible().catch(() => false)) {
    await dialog.getByRole("button", { name: "OK" }).click({ timeout: 15000 });
    await dialog.waitFor({ state: "hidden", timeout: 15000 }).catch(() => undefined);
    return;
  }
  const availableColumn = availablePanel
    .locator(".emp-config-transfer-item")
    .filter({ hasText: labelRegex })
    .first();
  if (!(await availableColumn.isVisible().catch(() => false))) {
    await page.keyboard.press("Escape").catch(() => undefined);
    throw new Error(`Coluna "${columnLabel}" não encontrada na configuração de colunas.`);
  }
  await availableColumn.click({ timeout: 15000 });
  await dialog.getByRole("button", { name: "Adicionar selecionados" }).click({ timeout: 15000 });
  await dialog.getByRole("button", { name: "OK" }).click({ timeout: 15000 });
  await dialog.waitFor({ state: "hidden", timeout: 15000 }).catch(() => undefined);
};

const hideTableColumn = async (page, columnLabel) => {
  await ensureTableColumnVisibleUI(page, columnLabel);
  const dialog = await openTableColumnsDialog(page);
  const usedPanel = dialog.locator(".emp-config-transfer-panel").nth(1);
  const labelRegex = new RegExp(escapeRegExp(columnLabel), "i");
  const usedColumn = usedPanel
    .locator(".emp-config-transfer-item")
    .filter({ hasText: labelRegex })
    .first();
  await usedColumn.click({ timeout: 15000 });
  const removeSelected = dialog.getByRole("button", { name: "Remover selecionados" });
  if (await removeSelected.isDisabled()) {
    throw new Error(`Não foi possível selecionar a coluna "${columnLabel}" no painel em uso.`);
  }
  await removeSelected.click({ timeout: 15000 });
  await dialog.getByRole("button", { name: "OK" }).click({ timeout: 15000 });
  await dialog.waitFor({ state: "hidden", timeout: 15000 }).catch(() => undefined);
};

const readLocalLayoutConfig = async (page) =>
  page.evaluate(() => {
    const keys = Object.keys(localStorage || {}).filter((key) => key.includes("form_layout_config"));
    for (const key of keys) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || "null");
        if (parsed && typeof parsed === "object") return { key, value: parsed };
      } catch {
        // ignore
      }
    }
    return null;
  });

const buildTempFormMutation = (current, _panelId, panelLabel) => {
  const root = deepClone(toObj(current));
  const activeConfig = deepClone(toObj(root.activeConfig || root));
  const panels = Array.isArray(activeConfig.panels) ? activeConfig.panels.map((panel) => ({ ...panel })) : [];
  if (panels.length === 0) {
    throw new Error("Layout sem painéis para mutação de validação.");
  }
  const layout = deepClone(toObj(activeConfig.layout));
  const targetPanelIndex = panels.findIndex((panel) => panel?.id && layout[panel.id]);
  const safeTargetIndex = targetPanelIndex >= 0 ? targetPanelIndex : 0;
  panels[safeTargetIndex] = {
    ...panels[safeTargetIndex],
    label: panelLabel,
  };
  return {
    version: Number(root.version) || 3,
    activeConfig: {
      ...activeConfig,
      panels,
    },
  };
};

const reorderFieldOrder = (fieldOrder = [], targetField) => {
  const unique = [...new Set(fieldOrder.filter(Boolean))];
  const without = unique.filter((item) => item !== targetField);
  return [targetField, ...without];
};

const toMaskedSnapshotDigest = (snapshot) => {
  const serialized = stableStringify(snapshot) || "";
  let hash = 0;
  for (let i = 0; i < serialized.length; i += 1) {
    hash = (hash << 5) - hash + serialized.charCodeAt(i);
    hash |= 0;
  }
  return {
    keyCount: snapshot ? Object.keys(snapshot).length : 0,
    bytes: serialized.length,
    hash: String(hash >>> 0),
  };
};

const readScopedLocalSnapshot = async (page) =>
  page.evaluate(() => {
    const entries = Object.entries(localStorage || {})
      .filter(([key]) => key.includes("mg_pref_v2:") || key.includes("mg_temp_filter_v1:"))
      .sort(([a], [b]) => a.localeCompare(b));
    const snapshot = {};
    for (const [key, value] of entries) {
      snapshot[key] = value;
    }
    return snapshot;
  });

const makeNetworkTracker = (page) => {
  const started = new WeakMap();
  const entries = [];
  page.on("request", (request) => started.set(request, Date.now()));
  page.on("response", (response) => {
    const request = response.request();
    const url = request.url();
    if (!url.includes("/api/user/preferences/")) return;
    const startedAt = started.get(request) || Date.now();
    entries.push({
      method: request.method(),
      url,
      status: response.status(),
      elapsedMs: Date.now() - startedAt,
      at: new Date().toISOString(),
    });
  });
  const snapshot = () => entries.length;
  const statsSince = (index, regex) => {
    const chunk = entries.slice(index).filter((item) => (regex ? regex.test(item.url) : true));
    const requestCount = chunk.length;
    const averageApiMs = requestCount
      ? Math.round(chunk.reduce((sum, item) => sum + item.elapsedMs, 0) / requestCount)
      : 0;
    return { requestCount, averageApiMs, entries: chunk };
  };
  return { entries, snapshot, statsSince };
};

async function main() {
  let browser;
  let context;
  let page;
  let tokenA;
  let baselineListagem;
  let baselineForm;
  let workingBaselineForm;
  let originalFormPrefs;
  let baselineLocalSnapshot = null;
  let restoredListagem = false;
  let restoredForm = false;

  try {
    const loginA = await loginApi(USER_A);
    tokenA = loginA.token;
    result.meta.userAId = loginA.user?.id || null;

    const listagemResp = await getScope(tokenA, "empresas", "listagem");
    baselineListagem = deepClone(listagemResp.data);

    const formResp = await getScope(tokenA, "empresas", "form_layout", { allow404: true });
    baselineForm = formResp.status === 404 ? null : deepClone(formResp.data);

    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    await context.addInitScript((token) => {
      localStorage.setItem("erp_auth_token", token);
      sessionStorage.setItem("erp_auth_token", token);
    }, tokenA);
    page = await context.newPage();

    const tracker = makeNetworkTracker(page);
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const text = message.text();
      if (/maximum update depth exceeded/i.test(text)) {
        result.consoleFindings.maxUpdateDepthErrors.push(text);
      } else {
        result.consoleFindings.otherErrors.push(text);
      }
    });

    await waitEmpresasReady(page, USER_A);
    await ensureNoInfiniteLoading(page);
    baselineLocalSnapshot = await readScopedLocalSnapshot(page);
    result.restoreEvidence.initialLocalMasked = toMaskedSnapshotDigest(baselineLocalSnapshot);
    result.restoreEvidence.initialRemote = {
      listagem: toMaskedSnapshotDigest(baselineListagem?.preferencias || {}),
      formLayout: toMaskedSnapshotDigest(baselineForm?.preferencias || {}),
    };

    const scenarioE = {
      steps: [],
      openCycleMs: [],
      requestMetrics: {},
      status: "pass",
      issues: [],
    };

    const tempPanelId = `validacao_${Date.now()}`;
    const tempPanelLabel = "Validação Temporária";
    workingBaselineForm = baselineForm;

    if (!workingBaselineForm) {
      await clickViewMode(page, "registro");
      await ensureNoInfiniteLoading(page);
      const localLayout = await readLocalLayoutConfig(page);
      const synthesized =
        localLayout?.value
          ? { version: 3, activeConfig: localLayout.value }
          : {
              version: 3,
              activeConfig: {
                version: 3,
                panels: [{ id: "principais", label: "Principais", order: 1 }],
                layout: {
                  principais: {
                    cards: [{ id: "geral", label: "Geral", order: 1, rows: [], fieldIds: [] }],
                  },
                },
              },
            };
      const synthesizedSave = await putScope(tokenA, "empresas", "form_layout", synthesized, {
        versaoSchema: 3,
      });
      workingBaselineForm = deepClone(synthesizedSave.data);
      scenarioE.steps.push({
        etapa: "sintetizar-baseline-form-layout",
        status: "ok",
        details: { key: localLayout?.key || "fallback:minimal-valid-layout" },
      });
    }

    originalFormPrefs = deepClone(workingBaselineForm.preferencias);
    const mutation = buildTempFormMutation(originalFormPrefs, tempPanelId, tempPanelLabel);
    const beforeEReq = tracker.snapshot();
    const savedMutation = await putScope(tokenA, "empresas", "form_layout", mutation, {
      expectedRevision: Number(workingBaselineForm.revision) || undefined,
      expectedUpdatedAt: workingBaselineForm.updatedAt || undefined,
      versaoSchema: 3,
    });
    scenarioE.steps.push({
      etapa: "salvar-alteracao-layout",
      valorSalvo: tempPanelLabel,
      revision: savedMutation.data?.revision,
      status: "ok",
    });

    await clickViewMode(page, "tabela");
    await ensureNoInfiniteLoading(page);
    scenarioE.steps.push({ etapa: "fechar-formulario", status: "ok" });

    await clickViewMode(page, "registro");
    const reopenStarted = Date.now();
    await page.locator("#mode-registro, .cadastro-emp-scope").first().waitFor({ state: "visible", timeout: 20000 });
    scenarioE.openCycleMs.push(Date.now() - reopenStarted);
    const checkAfterReopen = (await getScope(tokenA, "empresas", "form_layout")).data;
    if (
      !Array.isArray(checkAfterReopen.preferencias?.activeConfig?.panels) ||
      !checkAfterReopen.preferencias.activeConfig.panels.some((panel) => panel?.label === tempPanelLabel)
    ) {
      scenarioE.status = "fail";
      scenarioE.issues.push("Mutação temporária não encontrada após reabrir formulário.");
    }
    scenarioE.steps.push({ etapa: "reabrir-formulario", status: "ok" });

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitEmpresasReady(page, USER_A);
    await clickViewMode(page, "registro");
    const reloadStarted = Date.now();
    await page.locator("#mode-registro, .cadastro-emp-scope").first().waitFor({ state: "visible", timeout: 20000 });
    scenarioE.openCycleMs.push(Date.now() - reloadStarted);
    const checkAfterReload = (await getScope(tokenA, "empresas", "form_layout")).data;
    if (
      !Array.isArray(checkAfterReload.preferencias?.activeConfig?.panels) ||
      !checkAfterReload.preferencias.activeConfig.panels.some((panel) => panel?.label === tempPanelLabel)
    ) {
      scenarioE.status = "fail";
      scenarioE.issues.push("Mutação temporária não encontrada após reload.");
    }
    scenarioE.steps.push({ etapa: "apos-reload", status: "ok" });

    await performLogoutLogin(page, USER_A);
    await clickViewMode(page, "registro");
    const relogStarted = Date.now();
    await page
      .locator("#mode-registro, .cadastro-emp-scope")
      .first()
      .waitFor({ state: "visible", timeout: 20000 });
    scenarioE.openCycleMs.push(Date.now() - relogStarted);
    const checkAfterRelog = (await getScope(tokenA, "empresas", "form_layout")).data;
    if (
      !Array.isArray(checkAfterRelog.preferencias?.activeConfig?.panels) ||
      !checkAfterRelog.preferencias.activeConfig.panels.some((panel) => panel?.label === tempPanelLabel)
    ) {
      scenarioE.status = "fail";
      scenarioE.issues.push("Mutação temporária não encontrada após logout/login.");
    }
    scenarioE.steps.push({ etapa: "apos-logout-login", status: "ok" });

    const loopStartReq = tracker.snapshot();
    for (let i = 0; i < 10; i += 1) {
      await clickViewMode(page, "tabela");
      await ensureNoInfiniteLoading(page);
      await clickViewMode(page, "registro");
      const startedAt = Date.now();
      await page
        .locator("#mode-registro, .cadastro-emp-scope")
        .first()
        .waitFor({ state: "visible", timeout: 20000 });
      scenarioE.openCycleMs.push(Date.now() - startedAt);
      await ensureNoInfiniteLoading(page);
    }
    const loopReqStats = tracker.statsSince(loopStartReq, /\/api\/user\/preferences\/empresas\/(listagem|form_layout)$/);
    scenarioE.requestMetrics.openClose10 = loopReqStats;

    const listagemAfterE = (await getScope(tokenA, "empresas", "listagem")).data;
    const preservedSections =
      sameJson(listagemAfterE.preferencias?.table, baselineListagem.preferencias?.table) &&
      sameJson(listagemAfterE.preferencias?.cards, baselineListagem.preferencias?.cards) &&
      sameJson(listagemAfterE.preferencias?.filtersConfig, baselineListagem.preferencias?.filtersConfig);
    if (!preservedSections) {
      scenarioE.status = "fail";
      scenarioE.issues.push("Alteração de form_layout afetou seções listagem (table/cards/filtersConfig).");
    }

    const eReqStats = tracker.statsSince(beforeEReq, /\/api\/user\/preferences\/empresas\/(listagem|form_layout)$/);
    scenarioE.requestMetrics.total = eReqStats;
    scenarioE.noMaxUpdateDepth = result.consoleFindings.maxUpdateDepthErrors.length === 0;
    scenarioE.noInfiniteSkeleton = true;
    scenarioE.noRepeatedPutOpenClose = loopReqStats.requestCount <= 1;
    if (!scenarioE.noRepeatedPutOpenClose) {
      scenarioE.status = "fail";
      scenarioE.issues.push(`Foram detectadas ${loopReqStats.requestCount} requests ao abrir/fechar formulário.`);
    }
    if (!scenarioE.noMaxUpdateDepth) {
      scenarioE.status = "fail";
      scenarioE.issues.push("Detectado erro Maximum update depth exceeded.");
    }

    result.scenarioE = scenarioE;

    const scenarioCards = {
      metrics: [],
      combinedSequence: {},
      status: "pass",
      issues: [],
    };

    const metricEvent = async (name, action, verify) => {
      try {
        const startIndex = tracker.snapshot();
        const beforeDoc = await getScope(tokenA, "empresas", "listagem");
        await action();
        await sleep(900);
        const afterDoc = await getScope(tokenA, "empresas", "listagem");
        const stats = tracker.statsSince(startIndex, /\/api\/user\/preferences\/empresas\/listagem$/);
        const verification = await verify(beforeDoc.data, afterDoc.data);
        scenarioCards.metrics.push({
          event: name,
          uiOptimistic: verification.uiOptimistic,
          requests: stats.requestCount,
          avgApiMs: stats.averageApiMs,
          reload: verification.reload,
          logoutLogin: verification.logoutLogin,
          newTab: verification.newTab,
          status: verification.status,
          details: verification.details || null,
        });
        if (verification.status !== "ok") {
          scenarioCards.status = "fail";
        }
      } catch (error) {
        scenarioCards.metrics.push({
          event: name,
          uiOptimistic: false,
          requests: 0,
          avgApiMs: 0,
          reload: false,
          logoutLogin: false,
          newTab: false,
          status: "fail",
          details: { error: error.message },
        });
        scenarioCards.status = "fail";
      }
    };

    try {
      await clickViewMode(page, "cards");
      await ensureNoInfiniteLoading(page);

      await metricEvent(
      "Cards por linha (2→3→4)",
      async () => {
        await setCardsPerRowUI(page, 2);
        await setCardsPerRowUI(page, 3);
        await setCardsPerRowUI(page, 4);
      },
      async (_before, after) => {
        const uiOptimistic = await page
          .locator(".mg-cards-grid--cards-4")
          .first()
          .isVisible()
          .catch(() => false);

        await page.reload({ waitUntil: "domcontentloaded" });
        await waitEmpresasReady(page, USER_A);
        await clickViewMode(page, "cards");
        await ensureNoInfiniteLoading(page);
        const afterReload = (await getScope(tokenA, "empresas", "listagem")).data;

        await performLogoutLogin(page, USER_A);
        await clickViewMode(page, "cards");
        await ensureNoInfiniteLoading(page);
        const afterRelog = (await getScope(tokenA, "empresas", "listagem")).data;

        const pageProbe = await context.newPage();
        await waitEmpresasReady(pageProbe, USER_A);
        await clickViewMode(pageProbe, "cards");
        await ensureNoInfiniteLoading(pageProbe);
        const afterNewTab = (await getScope(tokenA, "empresas", "listagem")).data;
        await pageProbe.close();

        const persisted =
          Number(after.preferencias?.cards?.cardsPerRow) === 4 &&
          Number(afterReload.preferencias?.cards?.cardsPerRow) === 4 &&
          Number(afterRelog.preferencias?.cards?.cardsPerRow) === 4 &&
          Number(afterNewTab.preferencias?.cards?.cardsPerRow) === 4;
        return {
          uiOptimistic,
          reload: Number(afterReload.preferencias?.cards?.cardsPerRow) === 4,
          logoutLogin: Number(afterRelog.preferencias?.cards?.cardsPerRow) === 4,
          newTab: Number(afterNewTab.preferencias?.cards?.cardsPerRow) === 4,
          status: persisted ? "ok" : "fail",
          details: { cardsPerRow: after.preferencias?.cards?.cardsPerRow },
        };
      }
    );

      await metricEvent(
      "Campo visível (E-mail)",
      async () => {
        await setCardFieldVisibilityUI(page, "E-mail", false);
        await setCardFieldVisibilityUI(page, "Telefone", true);
        await toggleCardFieldUI(page, "E-mail");
        await toggleCardFieldUI(page, "Telefone");
        await toggleCardFieldUI(page, "E-mail");
      },
      async (_before, after) => {
        await page.reload({ waitUntil: "domcontentloaded" });
        await waitEmpresasReady(page, USER_A);
        await clickViewMode(page, "cards");
        await ensureNoInfiniteLoading(page);
        const afterReload = (await getScope(tokenA, "empresas", "listagem")).data;

        await performLogoutLogin(page, USER_A);
        await clickViewMode(page, "cards");
        await ensureNoInfiniteLoading(page);
        const afterRelog = (await getScope(tokenA, "empresas", "listagem")).data;

        const pageProbe = await context.newPage();
        await waitEmpresasReady(pageProbe, USER_A);
        await clickViewMode(pageProbe, "cards");
        await ensureNoInfiniteLoading(pageProbe);
        const afterNewTab = (await getScope(tokenA, "empresas", "listagem")).data;
        await pageProbe.close();

        const emailPersisted =
          typeof after.preferencias?.cards?.visibleFields?.email === "boolean" &&
          after.preferencias?.cards?.visibleFields?.email === afterReload.preferencias?.cards?.visibleFields?.email &&
          after.preferencias?.cards?.visibleFields?.email === afterRelog.preferencias?.cards?.visibleFields?.email &&
          after.preferencias?.cards?.visibleFields?.email === afterNewTab.preferencias?.cards?.visibleFields?.email;
        const telefonePersisted =
          typeof after.preferencias?.cards?.visibleFields?.telefone === "boolean" &&
          after.preferencias?.cards?.visibleFields?.telefone ===
            afterReload.preferencias?.cards?.visibleFields?.telefone &&
          after.preferencias?.cards?.visibleFields?.telefone ===
            afterRelog.preferencias?.cards?.visibleFields?.telefone &&
          after.preferencias?.cards?.visibleFields?.telefone ===
            afterNewTab.preferencias?.cards?.visibleFields?.telefone;

        return {
          uiOptimistic: emailPersisted || telefonePersisted,
          reload: emailPersisted && telefonePersisted,
          logoutLogin: emailPersisted && telefonePersisted,
          newTab: emailPersisted && telefonePersisted,
          status: emailPersisted && telefonePersisted ? "ok" : "fail",
          details: {
            emailVisible: after.preferencias?.cards?.visibleFields?.email,
            telefoneVisible: after.preferencias?.cards?.visibleFields?.telefone,
          },
        };
      }
    );

      await metricEvent(
      "Ordem de campos",
      async () => {
        const current = await getScope(tokenA, "empresas", "listagem");
        const currentCards = toObj(current.data?.preferencias?.cards);
        const step1 = reorderFieldOrder(currentCards.fieldOrder || [], "email");
        const step2 = reorderFieldOrder(step1, "telefone");
        const nextOrder = reorderFieldOrder(step2, "cidade");
        await patchScopeWithRetry(
          tokenA,
          "empresas",
          "listagem",
          "cards",
          { fieldOrder: nextOrder },
          { expectedRevision: current.data?.revision, expectedUpdatedAt: current.data?.updatedAt }
        );
      },
      async (_before, after) => {
        await clickViewMode(page, "tabela");
        await clickViewMode(page, "cards");
        await page.reload({ waitUntil: "domcontentloaded" });
        await waitEmpresasReady(page, USER_A);
        await clickViewMode(page, "cards");
        await ensureNoInfiniteLoading(page);
        const afterReload = (await getScope(tokenA, "empresas", "listagem")).data;

        await performLogoutLogin(page, USER_A);
        await clickViewMode(page, "cards");
        await ensureNoInfiniteLoading(page);
        const afterRelog = (await getScope(tokenA, "empresas", "listagem")).data;

        const pageProbe = await context.newPage();
        await waitEmpresasReady(pageProbe, USER_A);
        await clickViewMode(pageProbe, "cards");
        await ensureNoInfiniteLoading(pageProbe);
        const afterNewTab = (await getScope(tokenA, "empresas", "listagem")).data;
        await pageProbe.close();

        const firstThree = (after.preferencias?.cards?.fieldOrder || []).slice(0, 3);
        const orderPersisted =
          Array.isArray(after.preferencias?.cards?.fieldOrder) &&
          sameJson(after.preferencias?.cards?.fieldOrder || [], afterReload.preferencias?.cards?.fieldOrder || []) &&
          sameJson(after.preferencias?.cards?.fieldOrder || [], afterRelog.preferencias?.cards?.fieldOrder || []) &&
          sameJson(after.preferencias?.cards?.fieldOrder || [], afterNewTab.preferencias?.cards?.fieldOrder || []);

        return {
          uiOptimistic: orderPersisted,
          reload: orderPersisted,
          logoutLogin: orderPersisted,
          newTab: orderPersisted,
          status: orderPersisted ? "ok" : "fail",
          details: { firstThree },
        };
      }
    );

      await clickViewMode(page, "tabela");
      await clickViewMode(page, "cards");
      await setCardsPerRowUI(page, 2);
      await page.reload({ waitUntil: "domcontentloaded" });
      await waitEmpresasReady(page, USER_A);
      await clickViewMode(page, "cards");
      await ensureNoInfiniteLoading(page);

      const combinedBaseline = (await getScope(tokenA, "empresas", "listagem")).data;
      const combinedVisibleColumns = [...(combinedBaseline.preferencias?.table?.visibleColumns || [])];
      if (!combinedVisibleColumns.includes("telefone")) {
        await patchScopeWithRetry(
          tokenA,
          "empresas",
          "listagem",
          "table",
          { visibleColumns: [...combinedVisibleColumns, "telefone"] },
          {
            expectedRevision: combinedBaseline.revision,
            expectedUpdatedAt: combinedBaseline.updatedAt,
          }
        );
      }

      await hideTableColumn(page, "Telefone");
      await clickViewMode(page, "cards");
      await setCardsPerRowUI(page, 4);
      await toggleCardFieldUI(page, "E-mail");

      const beforeQuickPatch = await getScope(tokenA, "empresas", "listagem");
      await patchScopeWithRetry(
        tokenA,
        "empresas",
        "listagem",
        "filtersConfig",
        {
          maxVisibleFields:
            Number(beforeQuickPatch.data?.preferencias?.filtersConfig?.maxVisibleFields || 5) + 1,
        },
        {
          expectedRevision: beforeQuickPatch.data?.revision,
          expectedUpdatedAt: beforeQuickPatch.data?.updatedAt,
        }
      );

      const finalCardsDoc = (await getScope(tokenA, "empresas", "listagem")).data;
      scenarioCards.combinedSequence = {
        telefoneHidden: !(finalCardsDoc.preferencias?.table?.visibleColumns || []).includes("telefone"),
        cardsPerRow: finalCardsDoc.preferencias?.cards?.cardsPerRow,
        emailVisible: finalCardsDoc.preferencias?.cards?.visibleFields?.email,
        maxVisibleFields: finalCardsDoc.preferencias?.filtersConfig?.maxVisibleFields,
        allSectionsPresent: ["table", "cards", "filtersConfig"].every(
          (section) => finalCardsDoc.preferencias && finalCardsDoc.preferencias[section] != null
        ),
      };
      if (
        !scenarioCards.combinedSequence.telefoneHidden ||
        !scenarioCards.combinedSequence.allSectionsPresent
      ) {
        scenarioCards.status = "fail";
        scenarioCards.issues.push("Sequência combinada não persistiu todas as mudanças esperadas.");
      }

      await performLogoutLogin(page, USER_A);
      await clickViewMode(page, "cards");
      await ensureNoInfiniteLoading(page);

      const page2 = await context.newPage();
      await page2.goto(`${UI_BASE_URL}/CadastroEmpresas`, { waitUntil: "domcontentloaded" });
      await ensureNoInfiniteLoading(page2);
      await clickViewMode(page2, "cards");
      await page2.close();
    } catch (error) {
      scenarioCards.status = "fail";
      scenarioCards.issues.push(`Falha no fluxo principal de cards: ${error.message}`);
    }

    result.scenarioCards = scenarioCards;

    // Frontend 409 recovery check with two real tabs (same user).
    const conflictProbe = {
      injected409: false,
      observedRetry: false,
      status: "pass",
      details: {},
    };
    const pageConflictB = await context.newPage();
    const trackerConflictB = makeNetworkTracker(pageConflictB);
    pageConflictB.on("console", (message) => {
      if (message.type() !== "error") return;
      const text = message.text();
      if (/maximum update depth exceeded/i.test(text)) {
        result.consoleFindings.maxUpdateDepthErrors.push(text);
      } else {
        result.consoleFindings.otherErrors.push(text);
      }
    });
    await waitEmpresasReady(pageConflictB, USER_A);
    await ensureNoInfiniteLoading(pageConflictB);

    const conflictBaseline = (await getScope(tokenA, "empresas", "listagem")).data;
    const baselineVisibleColumns = [
      ...(conflictBaseline.preferencias?.table?.visibleColumns || []),
    ];
    if (!baselineVisibleColumns.includes("telefone")) {
      const repairedColumns = [...baselineVisibleColumns, "telefone"];
      await patchScopeWithRetry(
        tokenA,
        "empresas",
        "listagem",
        "table",
        { visibleColumns: repairedColumns },
        {
          expectedRevision: conflictBaseline.revision,
          expectedUpdatedAt: conflictBaseline.updatedAt,
        }
      );
    }

    // Aba A: oculta Telefone (table).
    await hideTableColumn(page, "Telefone");
    await sleep(700);
    const conflictSnapshot = (await getScope(tokenA, "empresas", "listagem")).data;

    // Aba B: altera cardsPerRow=4, com primeiro PUT respondendo 409.
    let firstConflictPending = true;
    await pageConflictB.route("**/api/user/preferences/empresas/listagem", async (route) => {
      const request = route.request();
      if (request.method() === "PUT" && firstConflictPending) {
        firstConflictPending = false;
        conflictProbe.injected409 = true;
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Preferência foi alterada em outra aba/sessão.",
            currentPreferences: conflictSnapshot.preferencias,
            currentRevision: conflictSnapshot.revision,
            currentUpdatedAt: conflictSnapshot.updatedAt,
          }),
        });
        return;
      }
      await route.continue();
    });

    const conflictStartIndex = trackerConflictB.snapshot();
    await clickViewMode(pageConflictB, "cards");
    await setCardsPerRowUI(pageConflictB, 2);
    await setCardsPerRowUI(pageConflictB, 4);
    await sleep(1800);
    const conflictReq = trackerConflictB.statsSince(
      conflictStartIndex,
      /\/api\/user\/preferences\/empresas\/listagem$/
    );
    const conflictPuts = conflictReq.entries.filter((entry) => entry.method === "PUT");
    conflictProbe.observedRetry = conflictPuts.length >= 2;

    const afterConflict = (await getScope(tokenA, "empresas", "listagem")).data;
    const finalTelefoneHidden = !(afterConflict.preferencias?.table?.visibleColumns || []).includes("telefone");
    const finalCardsPerRow = Number(afterConflict.preferencias?.cards?.cardsPerRow);

    conflictProbe.details = {
      putRequests: conflictPuts.length,
      finalCardsPerRow,
      finalTelefoneHidden,
      merged: finalTelefoneHidden && finalCardsPerRow === 4,
    };
    if (
      !conflictProbe.injected409 ||
      !conflictProbe.observedRetry ||
      !conflictProbe.details.merged ||
      conflictPuts.length > 3
    ) {
      conflictProbe.status = "fail";
    }

    await pageConflictB.unroute("**/api/user/preferences/empresas/listagem");
    await pageConflictB.close();
    result.frontendConflictRecovery = conflictProbe;

    if (result.meta.userBConfigured) {
      try {
        const loginB = await loginApi(USER_B);
        const tokenB = loginB.token;
        const aDoc = await getScope(tokenA, "empresas", "listagem");
        const bDoc = await getScope(tokenB, "empresas", "listagem");
        result.isolation = {
          status: "executed",
          userAId: result.meta.userAId,
          userBId: loginB.user?.id || null,
          sameVisibleColumns: sameJson(
            aDoc.data?.preferencias?.table?.visibleColumns || [],
            bDoc.data?.preferencias?.table?.visibleColumns || []
          ),
        };
      } catch (error) {
        result.isolation = {
          status: "pending_operational",
          reason: `Falha no segundo usuário autorizado: ${error.message}`,
        };
      }
    } else {
      result.isolation = {
        status: "pending_operational",
        reason: "Segundo usuário autorizado não configurado no ambiente do agente.",
      };
    }

    result.network.preferenceRequests = tracker.entries;

    const currentListagem = await getScope(tokenA, "empresas", "listagem");
    const restoreListagemPrefs = buildExactRestorePayload(
      baselineListagem.preferencias,
      currentListagem.data?.preferencias || {}
    );
    await putScope(tokenA, "empresas", "listagem", restoreListagemPrefs, {
      expectedRevision: currentListagem.data?.revision,
      expectedUpdatedAt: currentListagem.data?.updatedAt,
      versaoSchema: baselineListagem.versao_schema || 2,
    });
    restoredListagem = true;

    if (workingBaselineForm?.preferencias) {
      const currentForm = await getScope(tokenA, "empresas", "form_layout");
      const restoreFormPrefs = buildExactRestorePayload(
        originalFormPrefs,
        currentForm.data?.preferencias || {}
      );
      await putScope(tokenA, "empresas", "form_layout", restoreFormPrefs, {
        expectedRevision: currentForm.data?.revision,
        expectedUpdatedAt: currentForm.data?.updatedAt,
        versaoSchema: 3,
      });
      restoredForm = true;
    }
  } catch (error) {
    result.errors.push({
      message: error.message,
      status: error.status || null,
      data: error.data || null,
      stack: error.stack,
    });
  } finally {
    if (!restoredListagem && tokenA && baselineListagem?.preferencias) {
      try {
        const currentListagem = await getScope(tokenA, "empresas", "listagem");
        const restoreListagemPrefs = buildExactRestorePayload(
          baselineListagem.preferencias,
          currentListagem.data?.preferencias || {}
        );
        await putScope(tokenA, "empresas", "listagem", restoreListagemPrefs, {
          expectedRevision: currentListagem.data?.revision,
          expectedUpdatedAt: currentListagem.data?.updatedAt,
          versaoSchema: baselineListagem.versao_schema || 2,
        });
        restoredListagem = true;
      } catch (error) {
        result.errors.push({
          message: `Falha restore listagem: ${error.message}`,
          status: error.status || null,
          data: error.data || null,
        });
      }
    }
    if (!restoredForm && tokenA && workingBaselineForm?.preferencias && originalFormPrefs) {
      try {
        const currentForm = await getScope(tokenA, "empresas", "form_layout");
        const restoreFormPrefs = buildExactRestorePayload(
          originalFormPrefs,
          currentForm.data?.preferencias || {}
        );
        await putScope(tokenA, "empresas", "form_layout", restoreFormPrefs, {
          expectedRevision: currentForm.data?.revision,
          expectedUpdatedAt: currentForm.data?.updatedAt,
          versaoSchema: 3,
        });
        restoredForm = true;
      } catch (error) {
        result.errors.push({
          message: `Falha restore form_layout: ${error.message}`,
          status: error.status || null,
          data: error.data || null,
        });
      }
    }
    try {
      if (tokenA && page) {
        const finalRemoteListagem = await getScope(tokenA, "empresas", "listagem");
        const finalRemoteForm = await getScope(tokenA, "empresas", "form_layout", { allow404: true });
        const finalLocalSnapshot = await readScopedLocalSnapshot(page);
        result.restoreEvidence.finalLocalMasked = toMaskedSnapshotDigest(finalLocalSnapshot);
        result.restoreEvidence.finalRemote = {
          listagem: toMaskedSnapshotDigest(finalRemoteListagem.data?.preferencias || {}),
          formLayout: toMaskedSnapshotDigest(finalRemoteForm.status === 404 ? {} : finalRemoteForm.data?.preferencias || {}),
        };
        result.restoreEvidence.remoteEqualsBaseline =
          sameJson(finalRemoteListagem.data?.preferencias || {}, baselineListagem?.preferencias || {}) &&
          sameJson(
            finalRemoteForm.status === 404 ? null : finalRemoteForm.data?.preferencias || {},
            baselineForm?.preferencias || null
          );
        result.restoreEvidence.localEqualsBaseline = sameJson(
          finalLocalSnapshot || {},
          baselineLocalSnapshot || {}
        );
      }
    } catch (error) {
      result.errors.push({
        message: `Falha na evidência final de restore: ${error.message}`,
      });
    }
    result.restore = {
      listagem: restoredListagem ? "ok" : "fail_or_not_executed",
      formLayout: restoredForm ? "ok" : "fail_or_not_executed",
    };
    if (page) await page.close().catch(() => undefined);
    if (context) await context.close().catch(() => undefined);
    if (browser) await browser.close().catch(() => undefined);
    result.meta.finishedAt = new Date().toISOString();
    const outDir = join(__dirname, "../../docs/auditoria/evidence");
    mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, "final-ui-validation-results.json");
    writeFileSync(outPath, JSON.stringify(result, null, 2));
    process.stdout.write(`Evidência final UI salva em ${outPath}\n`);
    if (result.errors.length > 0) process.exitCode = 1;
  }
}

main();
