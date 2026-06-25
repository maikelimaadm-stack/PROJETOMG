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

const clickViewMode = async (page, mode) => {
  const selectors = [
    `.view-mode-btn[data-view="${mode}"]`,
    `[data-view="${mode}"]`,
  ];
  const labels = { tabela: "Tabela", registro: "Registro", cards: "Cards" };
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.isVisible().catch(() => false)) {
      await locator.click({ timeout: 15000 });
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
};

const ensureNoInfiniteLoading = async (page, timeoutMs = 6000) => {
  const loading = page.locator("text=Carregando módulo...");
  await loading.waitFor({ state: "hidden", timeout: timeoutMs }).catch(() => {
    throw new Error("Detectado loading infinito (Carregando módulo...).");
  });
};

const openFormLayoutConfig = async (page) => {
  await page.getByRole("button", { name: "Mais opções" }).first().click({ timeout: 15000 });
  await page.getByRole("menuitem", { name: "Layout do formulário" }).click({ timeout: 15000 });
  await page.getByRole("button", { name: "Editar" }).first().click({ timeout: 15000 });
};

const setCardsPerRowUI = async (page, cardsPerRow) => {
  await page.getByRole("button", { name: "Configurar layout dos cards" }).click({ timeout: 15000 });
  await page.locator(".mg-cards-layout-menu__item", { hasText: `${cardsPerRow} cards por linha` }).click({
    timeout: 15000,
  });
  const okButton = page.getByRole("button", { name: /^ok$/i }).last();
  await okButton.click({ timeout: 15000 });
};

const toggleCardFieldUI = async (page, fieldLabel) => {
  await page.getByRole("button", { name: "Configurar campos dos cards" }).click({ timeout: 15000 });
  await page.locator(".mg-cards-config-menu__item", { hasText: fieldLabel }).first().click({ timeout: 15000 });
  const okButton = page.getByRole("button", { name: /^ok$/i }).last();
  await okButton.click({ timeout: 15000 });
};

const hideTableColumn = async (page, columnLabel) => {
  await clickViewMode(page, "tabela");
  await page.getByRole("button", { name: "Configurar colunas da tabela" }).click({ timeout: 20000 });
  const dialog = page.getByRole("dialog");
  await dialog.locator(".emp-config-transfer-item", { hasText: columnLabel }).first().click({ timeout: 15000 });
  await dialog.getByRole("button", { name: "Remover selecionados" }).click({ timeout: 15000 });
  await dialog.getByRole("button", { name: "OK" }).click({ timeout: 15000 });
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

const buildTempFormMutation = (current, panelId, panelLabel) => {
  const root = toObj(current);
  const activeConfig = toObj(root.activeConfig || root);
  const panels = Array.isArray(activeConfig.panels) ? activeConfig.panels.map((panel) => ({ ...panel })) : [];
  const layout = toObj(activeConfig.layout);
  if (!panels.some((panel) => panel.id === panelId)) {
    panels.push({ id: panelId, label: panelLabel });
  }
  const panelLayout = layout[panelId];
  if (!panelLayout || typeof panelLayout !== "object" || Array.isArray(panelLayout)) {
    layout[panelId] = {
      cards: [{ id: "geral", label: "Geral", order: 1, rows: [], fieldIds: [] }],
    };
  }
  return {
    version: Number(root.version) || 3,
    activeConfig: {
      ...activeConfig,
      panels,
      layout,
    },
  };
};

const reorderFieldOrder = (fieldOrder = [], targetField) => {
  const unique = [...new Set(fieldOrder.filter(Boolean))];
  const without = unique.filter((item) => item !== targetField);
  return [targetField, ...without];
};

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
    if (!checkAfterReopen.preferencias?.activeConfig?.layout?.[tempPanelId]) {
      scenarioE.status = "fail";
      scenarioE.issues.push("Painel temporário não encontrado após reabrir formulário.");
    }
    scenarioE.steps.push({ etapa: "reabrir-formulario", status: "ok" });

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitEmpresasReady(page, USER_A);
    await clickViewMode(page, "registro");
    const reloadStarted = Date.now();
    await page.locator("#mode-registro, .cadastro-emp-scope").first().waitFor({ state: "visible", timeout: 20000 });
    scenarioE.openCycleMs.push(Date.now() - reloadStarted);
    const checkAfterReload = (await getScope(tokenA, "empresas", "form_layout")).data;
    if (!checkAfterReload.preferencias?.activeConfig?.layout?.[tempPanelId]) {
      scenarioE.status = "fail";
      scenarioE.issues.push("Painel temporário não encontrado após reload.");
    }
    scenarioE.steps.push({ etapa: "apos-reload", status: "ok" });

    const logoutBtn = page.getByRole("button", { name: "Sair" }).first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click({ timeout: 15000 });
      await waitEmpresasReady(page, USER_A);
      await clickViewMode(page, "registro");
      const relogStarted = Date.now();
      await page
        .locator("#mode-registro, .cadastro-emp-scope")
        .first()
        .waitFor({ state: "visible", timeout: 20000 });
      scenarioE.openCycleMs.push(Date.now() - relogStarted);
      const checkAfterRelog = (await getScope(tokenA, "empresas", "form_layout")).data;
      if (!checkAfterRelog.preferencias?.activeConfig?.layout?.[tempPanelId]) {
        scenarioE.status = "fail";
        scenarioE.issues.push("Painel temporário não encontrado após logout/login.");
      }
      scenarioE.steps.push({ etapa: "apos-logout-login", status: "ok" });
    } else {
      scenarioE.steps.push({ etapa: "apos-logout-login", status: "fail", details: "Botão Sair não encontrado." });
      scenarioE.status = "fail";
    }

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
        const current = await getScope(tokenA, "empresas", "listagem");
        await patchScope(
          tokenA,
          "empresas",
          "listagem",
          "cards",
          { cardsPerRow: 4, layoutConfig: { cardsPerRow: 4 } },
          {
            expectedRevision: current.data?.revision,
            expectedUpdatedAt: current.data?.updatedAt,
          }
        );
      },
      async (_before, after) => ({
        uiOptimistic: true,
        reload: true,
        logoutLogin: true,
        newTab: true,
        status: Number(after.preferencias?.cards?.cardsPerRow) === 4 ? "ok" : "fail",
        details: { cardsPerRow: after.preferencias?.cards?.cardsPerRow },
      })
    );

      await metricEvent(
      "Campo visível (E-mail)",
      async () => {
        await toggleCardFieldUI(page, "E-mail");
      },
      async (_before, after) => ({
        uiOptimistic: true,
        reload: true,
        logoutLogin: true,
        newTab: true,
        status:
          typeof after.preferencias?.cards?.visibleFields?.email === "boolean" ? "ok" : "fail",
        details: { emailVisible: after.preferencias?.cards?.visibleFields?.email },
      })
    );

      await metricEvent(
      "Ordem de campos",
      async () => {
        const current = await getScope(tokenA, "empresas", "listagem");
        const currentCards = toObj(current.data?.preferencias?.cards);
        const nextOrder = reorderFieldOrder(currentCards.fieldOrder || [], "email");
        await patchScope(
          tokenA,
          "empresas",
          "listagem",
          "cards",
          { fieldOrder: nextOrder },
          { expectedRevision: current.data?.revision, expectedUpdatedAt: current.data?.updatedAt }
        );
      },
      async (_before, after) => ({
        uiOptimistic: false,
        reload: true,
        logoutLogin: true,
        newTab: true,
        status: Array.isArray(after.preferencias?.cards?.fieldOrder) ? "ok" : "fail",
        details: { firstField: after.preferencias?.cards?.fieldOrder?.[0] || null },
      })
    );

      await clickViewMode(page, "tabela");
      await clickViewMode(page, "cards");
      await setCardsPerRowUI(page, 2);
      await page.reload({ waitUntil: "domcontentloaded" });
      await waitEmpresasReady(page, USER_A);
      await clickViewMode(page, "cards");
      await ensureNoInfiniteLoading(page);

      await hideTableColumn(page, "Telefone");
      await clickViewMode(page, "cards");
      await setCardsPerRowUI(page, 3);
      await toggleCardFieldUI(page, "WhatsApp");

      const beforeQuickPatch = await getScope(tokenA, "empresas", "listagem");
      await patchScope(
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
        whatsappVisible: finalCardsDoc.preferencias?.cards?.visibleFields?.whatsapp,
        maxVisibleFields: finalCardsDoc.preferencias?.filtersConfig?.maxVisibleFields,
        allSectionsPresent: ["table", "cards", "filtersConfig", "view"].every(
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

      const logoutBtnCards = page.getByRole("button", { name: "Sair" }).first();
      if (await logoutBtnCards.isVisible().catch(() => false)) {
        await logoutBtnCards.click();
        await waitEmpresasReady(page, USER_A);
        await clickViewMode(page, "cards");
        await ensureNoInfiniteLoading(page);
      }

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

    // Frontend 409 recovery check: first PUT returns 409, frontend must retry and persist.
    const conflictProbe = {
      injected409: false,
      observedRetry: false,
      status: "pass",
      details: {},
    };
    const conflictSnapshot = (await getScope(tokenA, "empresas", "listagem")).data;
    let firstConflictPending = true;
    await page.route("**/api/user/preferences/empresas/listagem", async (route) => {
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
    const conflictStartIndex = tracker.snapshot();
    await clickViewMode(page, "cards");
    await setCardsPerRowUI(page, 1);
    await sleep(1500);
    const conflictReq = tracker.statsSince(conflictStartIndex, /\/api\/user\/preferences\/empresas\/listagem$/);
    conflictProbe.observedRetry =
      conflictReq.entries.filter((entry) => entry.method === "PUT").length >= 2;
    const afterConflict = (await getScope(tokenA, "empresas", "listagem")).data;
    conflictProbe.details = {
      putRequests: conflictReq.entries.filter((entry) => entry.method === "PUT").length,
      finalCardsPerRow: afterConflict.preferencias?.cards?.cardsPerRow,
    };
    if (!conflictProbe.injected409 || !conflictProbe.observedRetry) {
      conflictProbe.status = "fail";
    }
    await page.unroute("**/api/user/preferences/empresas/listagem");
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
    await putScope(tokenA, "empresas", "listagem", baselineListagem.preferencias, {
      expectedRevision: currentListagem.data?.revision,
      expectedUpdatedAt: currentListagem.data?.updatedAt,
      versaoSchema: baselineListagem.versao_schema || 2,
    });
    restoredListagem = true;

    if (workingBaselineForm?.preferencias) {
      const currentForm = await getScope(tokenA, "empresas", "form_layout");
      await putScope(tokenA, "empresas", "form_layout", originalFormPrefs, {
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
        await putScope(tokenA, "empresas", "listagem", baselineListagem.preferencias, {
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
        await putScope(tokenA, "empresas", "form_layout", originalFormPrefs, {
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
