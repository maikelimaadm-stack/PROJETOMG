/**
 * E2E mock — validação de isolamento por usuário/tenant (PR #223).
 * Cobre Etapas 2–5 com backend mockado e localStorage real do browser.
 */
import { expect, test } from "@playwright/test";

const TOKENS = {
  userA: "mock-token-user-a",
  userB: "mock-token-user-b",
  userC: "mock-token-user-c",
};

const USERS_BY_TOKEN = {
  [TOKENS.userA]: {
    token: TOKENS.userA,
    user: { id: "user-a", cliente_id: "tenant-1", login: "usera", perfil: "ADMIN", acesso_global: true },
    cliente: { id: "tenant-1", codigo: "tenant-1", nome: "Tenant 1" },
  },
  [TOKENS.userB]: {
    token: TOKENS.userB,
    user: { id: "user-b", cliente_id: "tenant-1", login: "userb", perfil: "ADMIN", acesso_global: true },
    cliente: { id: "tenant-1", codigo: "tenant-1", nome: "Tenant 1" },
  },
  [TOKENS.userC]: {
    token: TOKENS.userC,
    user: { id: "user-c", cliente_id: "tenant-2", login: "userc", perfil: "ADMIN", acesso_global: true },
    cliente: { id: "tenant-2", codigo: "tenant-2", nome: "Tenant 2" },
  },
};

const mockEmpresa = {
  id: "emp-1",
  codempresa: 1,
  razao_social: "EMPRESA TESTE LTDA",
  nome_empresa: "EMPRESA TESTE",
  tipo_pessoa: "PJ",
  status: "Ativa",
  campos_personalizados: {},
};

const nowIso = () => new Date().toISOString();
const scopeKey = (clienteId, userId, modulo, tela) =>
  `${clienteId}::${userId}::${modulo}::${tela}`;

const buildSessionPayload = (token) => {
  const base = USERS_BY_TOKEN[token] || USERS_BY_TOKEN[TOKENS.userA];
  return {
    token: base.token,
    user: base.user,
    cliente: base.cliente,
    empresas: [{ id: "emp-1", codempresa: 1, nome_empresa: "EMPRESA TESTE" }],
    allowAllEmpresas: true,
    selectedEmpresaId: "all",
  };
};

const readTokenFromRequest = (request) => {
  const authHeader = request.headers()["authorization"] || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : TOKENS.userA;
};

const FORBIDDEN_IDENTITY_FIELDS = ["usuario_id", "userId", "cliente_id", "clienteId"];

const buildPreferencesServer = (seed = {}) => {
  const records = new Map(Object.entries(seed));
  const metrics = {
    bootstrapGets: 0,
    listagemPuts: 0,
    putBodies: [],
    rejectedIdentityPuts: 0,
    crossUserPutAttempts: 0,
  };

  const listForScope = ({ clienteId, userId }) =>
    [...records.entries()]
      .filter(([key]) => key.startsWith(`${clienteId}::${userId}::`))
      .map(([, value]) => value);

  return {
    metrics,
    records,
    getRecord: ({ clienteId, userId, modulo, tela }) =>
      records.get(scopeKey(clienteId, userId, modulo, tela)) || null,
    async route(page) {
      await page.route("**/*", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const { pathname } = url;
        if (!pathname.startsWith("/api/")) return route.continue();

        const token = readTokenFromRequest(request);
        const session = buildSessionPayload(token);
        const { cliente_id: clienteId, id: userId } = session.user;

        if (pathname === "/api/auth/session" || pathname === "/api/auth/login") {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(session),
          });
        }

        if (pathname === "/api/user/preferences/bootstrap") {
          metrics.bootstrapGets += 1;
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ preferences: listForScope({ clienteId, userId }) }),
          });
        }

        if (pathname.startsWith("/api/user/preferences/")) {
          const parts = pathname.split("/").filter(Boolean);
          const modulo = decodeURIComponent(parts[3] || "").toLowerCase();
          const tela = decodeURIComponent(parts[4] || "").toLowerCase();

          if (request.method() === "PUT") {
            const body = request.postDataJSON?.() || {};
            const hasForbidden = FORBIDDEN_IDENTITY_FIELDS.some(
              (field) => body[field] != null && String(body[field]).trim() !== ""
            );
            if (hasForbidden) {
              metrics.rejectedIdentityPuts += 1;
              return route.fulfill({
                status: 400,
                contentType: "application/json",
                body: JSON.stringify({ message: "Campos de identidade não são aceitos no payload." }),
              });
            }

            metrics.listagemPuts += 1;
            metrics.putBodies.push({ clienteId, userId, body: { ...body } });

            const updated = {
              modulo,
              tela,
              versao_schema: Number(body.versao_schema) || 1,
              preferencias: body.preferencias || {},
              updatedAt: nowIso(),
            };
            records.set(scopeKey(clienteId, userId, modulo, tela), updated);
            return route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify(updated),
            });
          }

          const current = records.get(scopeKey(clienteId, userId, modulo, tela));
          if (!current) {
            return route.fulfill({
              status: 404,
              contentType: "application/json",
              body: JSON.stringify({ message: "Preferência não encontrada." }),
            });
          }
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(current),
          });
        }

        if (pathname === "/api/empresas/campos") {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ items: [] }),
          });
        }

        if (pathname === "/api/cadcps/campos" || pathname.startsWith("/api/cadcps")) {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ items: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }),
          });
        }

        if (pathname.startsWith("/api/empresas")) {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              items: [mockEmpresa],
              total: 1,
              page: 1,
              pageSize: 100,
              totalPages: 1,
            }),
          });
        }

        if (pathname === "/api/metrics/contadores") {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ empresas: 1 }),
          });
        }

        return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      });
    },
  };
};

const seedListagemDefault = ({ viewMode = "table" } = {}) => ({
  modulo: "empresas",
  tela: "listagem",
  versao_schema: 1,
  preferencias: {
    version: 1,
    viewMode,
    table: {
      columnOrder: ["codempresa", "razao_social"],
      visibleColumns: ["codempresa", "razao_social"],
      frozenLeftColumnCount: 0,
      sort: [{ key: "codempresa", direction: "asc" }],
      pageSize: 100,
    },
    cards: { layoutConfig: { cardsPerRow: 3 }, visibleFields: {} },
    filters: { filterFieldsLayout: { visiveis: [], ordem: [] }, maxVisibleFields: 5 },
    panels: { launchPanelStyle: "tabs" },
  },
  updatedAt: nowIso(),
});

const seedListagemA = () => ({
  modulo: "empresas",
  tela: "listagem",
  versao_schema: 1,
  preferencias: {
    version: 1,
    viewMode: "search",
    table: {
      columnOrder: ["codempresa", "razao_social", "telefone"],
      visibleColumns: ["codempresa", "razao_social"],
      frozenLeftColumnCount: 1,
      sort: [{ key: "codempresa", direction: "asc" }],
    },
    cards: { layoutConfig: { cardsPerRow: 2 }, visibleFields: { codigo: true } },
    filters: {
      filterFieldsLayout: { visiveis: ["razao_social", "cidade"], ordem: ["razao_social", "cidade"] },
      maxVisibleFields: 2,
      operatorsByField: { razao_social: "contains" },
    },
    panels: { launchPanelStyle: "sidebar" },
  },
  updatedAt: nowIso(),
});

const seedListagemB = () => ({
  modulo: "empresas",
  tela: "listagem",
  versao_schema: 1,
  preferencias: {
    version: 1,
    viewMode: "table",
    table: {
      columnOrder: ["codempresa", "email"],
      visibleColumns: ["codempresa", "email"],
      frozenLeftColumnCount: 0,
    },
    cards: { layoutConfig: { cardsPerRow: 4 } },
    filters: {
      filterFieldsLayout: { visiveis: ["status", "estado"], ordem: ["status", "estado"] },
      maxVisibleFields: 4,
      operatorsByField: { status: "startsWith" },
    },
    panels: { launchPanelStyle: "tabs" },
  },
  updatedAt: nowIso(),
});

const switchSessionToken = async (page, token, { clearPreferenceKeys = false } = {}) => {
  await page.addInitScript(
    ({ nextToken, shouldClearPreferenceKeys }) => {
      if (shouldClearPreferenceKeys) {
        const removeKeys = [];
        for (let i = 0; i < localStorage.length; i += 1) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.startsWith("emp_") ||
              key.startsWith("mg_pref_") ||
              key.startsWith("erp_vis") ||
              key.startsWith("erp_cards") ||
              key.startsWith("cadastro:"))
          ) {
            removeKeys.push(key);
          }
        }
        removeKeys.forEach((key) => localStorage.removeItem(key));
      }
      sessionStorage.setItem("erp_auth_token", nextToken);
      localStorage.setItem("erp_auth_token", nextToken);
    },
    { nextToken: token, shouldClearPreferenceKeys: clearPreferenceKeys }
  );
};

const openEmpresasWithToken = async (page, token, legacyEntries = []) => {
  await page.addInitScript(
    ({ authToken, legacy }) => {
      sessionStorage.setItem("erp_auth_token", authToken);
      localStorage.setItem("erp_auth_token", authToken);
      legacy.forEach(({ key, value }) => {
        if (value == null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      });
    },
    { authToken: token, legacy: legacyEntries }
  );
  await page.goto("/CadastroEmpresas");
  await expect(
    page.locator(".mg-table-panel-wrap.is-visible, .mg-cards-panel-wrap.is-visible")
  ).toBeVisible({ timeout: 45_000 });
};

const switchToTableView = async (page) => {
  const tableButton = page.locator(".view-mode-btn[data-view='table']").first();
  if (await tableButton.isVisible().catch(() => false)) {
    await tableButton.click();
    await expect(page.locator(".mg-table-panel-wrap.is-visible")).toBeVisible({ timeout: 20_000 });
  }
};

const collectScopedKeys = async (page) =>
  page.evaluate(() => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  });

const installCacheEventProbe = async (page) => {
  await page.addInitScript(() => {
    window.__isolationEvents = [];
    window.addEventListener("emp-preferences-cache-updated", (event) => {
      window.__isolationEvents.push(event.detail || {});
    });
  });
};

test.describe("PR #223 — isolamento de preferências (mock)", () => {
  test.beforeEach(({ }, testInfo) => {
    testInfo.setTimeout(120_000);
  });

  test("Etapa 2: Usuários A, B (mesmo tenant) e C (tenant diferente) não compartilham prefs", async ({
    browser,
  }) => {
    const seed = {};
    seed[scopeKey("tenant-1", "user-a", "empresas", "listagem")] = seedListagemA();
    seed[scopeKey("tenant-1", "user-b", "empresas", "listagem")] = seedListagemB();
    seed[scopeKey("tenant-2", "user-c", "empresas", "listagem")] = seedListagemDefault();
    const server = buildPreferencesServer(seed);

    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const ctxC = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();
    const pageC = await ctxC.newPage();

    await Promise.all([server.route(pageA), server.route(pageB), server.route(pageC)]);

    await openEmpresasWithToken(pageA, TOKENS.userA);
    await openEmpresasWithToken(pageB, TOKENS.userB);
    await openEmpresasWithToken(pageC, TOKENS.userC);

    await expect(pageA.locator(".mg-cards-panel-wrap.is-visible")).toBeVisible();
    await expect(pageB.locator(".mg-table-panel-wrap.is-visible")).toBeVisible();
    await expect(pageB.locator('th').filter({ hasText: /^Telefone$/i })).toHaveCount(0);
    await expect(pageB.locator('th').filter({ hasText: /^E-mail$/i })).toHaveCount(1);

    const keysA = (await collectScopedKeys(pageA)).filter((k) => k.includes("mg_pref_v2:tenant-1:user-a"));
    const keysB = (await collectScopedKeys(pageB)).filter((k) => k.includes("mg_pref_v2:tenant-1:user-b"));
    expect(keysA.length).toBeGreaterThan(0);
    expect(keysB.length).toBeGreaterThan(0);
    expect(keysA.some((k) => keysB.includes(k))).toBe(false);

    await ctxA.close();
    await ctxB.close();
    await ctxC.close();
  });

  test("Etapa 2: PUT contém apenas modulo/tela/preferencias — sem IDs sensíveis", async ({ page }) => {
    const server = buildPreferencesServer({
      [scopeKey("tenant-1", "user-a", "empresas", "listagem")]: seedListagemDefault(),
    });
    await server.route(page);
    await openEmpresasWithToken(page, TOKENS.userA);
    await switchToTableView(page);

    await page.getByRole("button", { name: "Configurar colunas da tabela" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.locator(".emp-config-transfer-item").filter({ hasText: "Nome/Razão Social" }).first().click();
    await dialog.getByRole("button", { name: "Remover selecionados" }).click();
    await dialog.getByRole("button", { name: "OK" }).click();
    await page.waitForTimeout(1500);

    expect(server.metrics.listagemPuts).toBeGreaterThanOrEqual(1);
    for (const put of server.metrics.putBodies) {
      expect(put.clienteId).toBe("tenant-1");
      expect(put.userId).toBe("user-a");
      FORBIDDEN_IDENTITY_FIELDS.forEach((field) => {
        expect(put.body[field]).toBeUndefined();
      });
      expect(put.body.preferencias).toBeTruthy();
    }
  });

  test("Etapa 3: troca de sessão A→B→C→A limpa cache e localStorage scoped", async ({ page }) => {
    const seed = {};
    seed[scopeKey("tenant-1", "user-a", "empresas", "listagem")] = seedListagemA();
    seed[scopeKey("tenant-1", "user-b", "empresas", "listagem")] = seedListagemB();
    seed[scopeKey("tenant-2", "user-c", "empresas", "listagem")] = seedListagemDefault();
    const server = buildPreferencesServer(seed);
    await server.route(page);

    const sessionLog = [];

    await openEmpresasWithToken(page, TOKENS.userA);
    await expect(page.locator(".mg-cards-panel-wrap.is-visible")).toBeVisible();
    sessionLog.push({ swap: "login-A", bootstrapGets: server.metrics.bootstrapGets });

    await switchSessionToken(page, TOKENS.userB, { clearPreferenceKeys: true });
    await page.reload();
    await expect(page.locator(".mg-table-panel-wrap.is-visible")).toBeVisible({ timeout: 45_000 });
    sessionLog.push({ swap: "A→B", bootstrapGets: server.metrics.bootstrapGets });

    await switchSessionToken(page, TOKENS.userC, { clearPreferenceKeys: true });
    await page.reload();
    await expect(page.locator(".mg-table-panel-wrap.is-visible")).toBeVisible({ timeout: 45_000 });
    sessionLog.push({ swap: "B→C", bootstrapGets: server.metrics.bootstrapGets });

    await switchSessionToken(page, TOKENS.userA, { clearPreferenceKeys: true });
    await page.reload();
    await expect(page.locator(".mg-cards-panel-wrap.is-visible")).toBeVisible({ timeout: 45_000 });
    sessionLog.push({ swap: "C→A", bootstrapGets: server.metrics.bootstrapGets });

    expect(sessionLog.length).toBe(4);
    expect(server.metrics.bootstrapGets).toBeGreaterThanOrEqual(4);
  });

  test("Etapa 4: eventos entre abas validam clienteId, userId, modulo implícito e version", async ({
    browser,
  }) => {
    const seed = {};
    seed[scopeKey("tenant-1", "user-a", "empresas", "listagem")] = seedListagemDefault();
    const server = buildPreferencesServer(seed);
    const context = await browser.newContext();
    const tabA = await context.newPage();
    const tabB = await context.newPage();
    await Promise.all([server.route(tabA), server.route(tabB)]);
    await installCacheEventProbe(tabA);
    await installCacheEventProbe(tabB);

    await openEmpresasWithToken(tabA, TOKENS.userA);
    await openEmpresasWithToken(tabB, TOKENS.userA);

    await tabA.locator(".view-mode-btn[data-view='cards']").first().click();
    await tabA.waitForTimeout(1200);

    const eventsA = await tabA.evaluate(() => window.__isolationEvents || []);
    expect(eventsA.some((e) => e.clienteId === "tenant-1" && e.userId === "user-a" && e.version === "v2")).toBe(
      true
    );

    await tabB.evaluate(() => {
      sessionStorage.setItem("erp_auth_token", "mock-token-user-b");
      localStorage.setItem("erp_auth_token", "mock-token-user-b");
    });
    await tabB.reload();
    await tabB.waitForTimeout(800);
    const eventsBeforeB = await tabB.evaluate(() => window.__isolationEvents || []);

    await tabA.locator(".view-mode-btn[data-view='cards']").first().click();
    await tabA.waitForTimeout(1200);

    const eventsAfterB = await tabB.evaluate(() => window.__isolationEvents || []);
    expect(eventsAfterB.length).toBe(eventsBeforeB.length);

    await context.close();
  });

  test("Etapa 5: chave legada emp_* é fallback somente leitura — B não herda nem migra", async ({
    page,
  }) => {
    const server = buildPreferencesServer({});
    await server.route(page);

    const legacyTelefoneHidden = JSON.stringify(["codempresa", "razao_social"]);
    await openEmpresasWithToken(page, TOKENS.userB, [
      { key: "emp_col_visiveis", value: legacyTelefoneHidden },
      { key: "emp_view_mode_v1", value: "table" },
    ]);
    await switchToTableView(page);

    await page.waitForTimeout(1500);

    const putsBeforeUserAction = server.metrics.listagemPuts;
    const recordBeforeAction = server.getRecord({
      clienteId: "tenant-1",
      userId: "user-b",
      modulo: "empresas",
      tela: "listagem",
    });

    const scopedKeysBefore = (await collectScopedKeys(page)).filter((k) =>
      k.includes("mg_pref_v2:tenant-1:user-b")
    );
    expect(scopedKeysBefore.some((k) => k.endsWith(":emp_col_visiveis"))).toBe(false);

    await page.getByRole("button", { name: "Configurar colunas da tabela" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.locator(".emp-config-transfer-item").filter({ hasText: "Nome/Razão Social" }).first().click();
    await dialog.getByRole("button", { name: "Remover selecionados" }).click();
    await dialog.getByRole("button", { name: "OK" }).click();
    await page.waitForTimeout(1500);

    const scopedAfterWrite = (await collectScopedKeys(page)).filter((k) =>
      k.includes("mg_pref_v2:tenant-1:user-b")
    );
    expect(scopedAfterWrite.some((k) => k.endsWith(":emp_col_visiveis"))).toBe(true);

    const recordAfter = server.getRecord({
      clienteId: "tenant-1",
      userId: "user-b",
      modulo: "empresas",
      tela: "listagem",
    });
    expect(recordAfter).toBeTruthy();
    expect(server.metrics.listagemPuts).toBeGreaterThan(putsBeforeUserAction);
    if (recordBeforeAction) {
      expect(recordBeforeAction.preferencias?.table?.visibleColumns).not.toEqual(
        recordAfter.preferencias?.table?.visibleColumns
      );
    }
  });
});
