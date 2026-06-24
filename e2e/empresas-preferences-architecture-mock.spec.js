import { expect, test } from "@playwright/test";

const TOKENS = {
  userA: "mock-token-user-a",
  userB: "mock-token-user-b",
  userATenantB: "mock-token-user-a-tenant-b",
};

const USERS_BY_TOKEN = {
  [TOKENS.userA]: {
    token: TOKENS.userA,
    user: {
      id: "user-a",
      cliente_id: "cliente-a",
      login: "usera",
      perfil: "ADMIN",
      acesso_global: true,
    },
    cliente: { id: "cliente-a", codigo: "cliente-a", nome: "Cliente A" },
  },
  [TOKENS.userB]: {
    token: TOKENS.userB,
    user: {
      id: "user-b",
      cliente_id: "cliente-a",
      login: "userb",
      perfil: "ADMIN",
      acesso_global: true,
    },
    cliente: { id: "cliente-a", codigo: "cliente-a", nome: "Cliente A" },
  },
  [TOKENS.userATenantB]: {
    token: TOKENS.userATenantB,
    user: {
      id: "user-a",
      cliente_id: "cliente-b",
      login: "usera",
      perfil: "ADMIN",
      acesso_global: true,
    },
    cliente: { id: "cliente-b", codigo: "cliente-b", nome: "Cliente B" },
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
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  return token || TOKENS.userA;
};

const buildPreferencesServer = (seed = {}) => {
  const records = new Map(Object.entries(seed));
  const metrics = {
    bootstrapGets: 0,
    scopeGets: 0,
    listagemPuts: 0,
    formPuts: 0,
    putFailures: 0,
    putConflicts: 0,
  };
  const controls = {
    bootstrapDelayMs: 0,
    failNextListagemPut: false,
  };

  const listForScope = ({ clienteId, userId }) =>
    [...records.entries()]
      .filter(([key]) => key.startsWith(`${clienteId}::${userId}::`))
      .map(([, value]) => value)
      .sort((left, right) =>
        `${left.modulo}.${left.tela}`.localeCompare(`${right.modulo}.${right.tela}`, "pt-BR")
      );

  return {
    metrics,
    controls,
    listForScope,
    getRecord: ({ clienteId, userId, modulo, tela }) =>
      records.get(scopeKey(clienteId, userId, modulo, tela)) || null,
    setRecord: ({ clienteId, userId, modulo, tela, preferencias, versao_schema, updatedAt }) => {
      records.set(scopeKey(clienteId, userId, modulo, tela), {
        modulo,
        tela,
        versao_schema: versao_schema || Number(preferencias?.version) || 1,
        preferencias,
        updatedAt: updatedAt || nowIso(),
      });
    },
    async route(page) {
      await page.route("**/*", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const { pathname } = url;
        if (!pathname.startsWith("/api/")) {
          return route.continue();
        }

        const token = readTokenFromRequest(request);
        const session = buildSessionPayload(token);
        const clienteId = session.user.cliente_id;
        const userId = session.user.id;

        if (pathname === "/api/auth/session" || pathname === "/api/auth/login") {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(session),
          });
        }

        if (pathname === "/api/auth/empresas") {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ empresas: session.empresas }),
          });
        }

        if (pathname === "/api/user/preferences/bootstrap") {
          metrics.bootstrapGets += 1;
          if (controls.bootstrapDelayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, controls.bootstrapDelayMs));
          }
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              preferences: listForScope({ clienteId, userId }),
            }),
          });
        }

        if (pathname.startsWith("/api/user/preferences/")) {
          const parts = pathname.split("/").filter(Boolean);
          const modulo = decodeURIComponent(parts[3] || "").toLowerCase();
          const tela = decodeURIComponent(parts[4] || "").toLowerCase();
          const current = records.get(scopeKey(clienteId, userId, modulo, tela));
          if (request.method() === "GET") {
            metrics.scopeGets += 1;
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

          if (request.method() === "PUT") {
            const body = request.postDataJSON?.() || {};
            const expectedUpdatedAt = body.expectedUpdatedAt || null;
            const preferencias = body.preferencias || {};
            const nextVersion = Number(body.versao_schema) || Number(preferencias?.version) || 1;
            const isListagem = modulo === "empresas" && tela === "listagem";
            const isFormLayout = modulo === "empresas" && tela === "form_layout";
            if (isListagem) metrics.listagemPuts += 1;
            if (isFormLayout) metrics.formPuts += 1;

            if (isListagem && controls.failNextListagemPut) {
              controls.failNextListagemPut = false;
              metrics.putFailures += 1;
              return route.fulfill({
                status: 500,
                contentType: "application/json",
                body: JSON.stringify({ message: "Falha simulada de rede." }),
              });
            }

            if (current && expectedUpdatedAt && expectedUpdatedAt !== current.updatedAt) {
              metrics.putConflicts += 1;
              return route.fulfill({
                status: 409,
                contentType: "application/json",
                body: JSON.stringify({ message: "Preferência foi alterada em outra aba/sessão." }),
              });
            }

            const updated = {
              modulo,
              tela,
              versao_schema: nextVersion,
              preferencias,
              updatedAt: nowIso(),
            };
            records.set(scopeKey(clienteId, userId, modulo, tela), updated);
            return route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify(updated),
            });
          }
        }

        if (pathname === "/api/empresas/campos") {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ items: [] }),
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

        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "{}",
        });
      });
    },
  };
};

const seedListagemRecord = ({ viewMode = "table", frozenLeftColumnCount = 0 } = {}) => ({
  modulo: "empresas",
  tela: "listagem",
  versao_schema: 1,
  preferencias: {
    version: 1,
    viewMode,
    table: {
      columnOrder: ["codempresa", "razao_social"],
      visibleColumns: ["codempresa", "razao_social"],
      frozenLeftColumnCount,
      columnWidths: { codempresa: 130, razao_social: 280 },
      sort: [{ key: "codempresa", direction: "asc" }],
      pageSize: 100,
    },
    cards: {
      visibleFields: { codigo: true, nome: true },
      layoutConfig: { cardsPerRow: 2 },
    },
    filters: {
      filterFieldsLayout: {
        visiveis: ["nome_fantasia"],
        ordem: ["nome_fantasia"],
      },
      dropdownVisibleFields: { nome: true },
      favorites: [],
    },
    panels: {
      launchPanelStyle: "tabs",
    },
  },
  updatedAt: nowIso(),
});

const seedFormRecord = () => ({
  modulo: "empresas",
  tela: "form_layout",
  versao_schema: 3,
  preferencias: {
    version: 3,
    activeConfig: {
      version: 3,
      panels: [
        { id: "principais", label: "Principais", hidden: false, order: 0 },
        { id: "endereco", label: "Endereço", hidden: false, order: 1 },
      ],
      layout: {
        version: 3,
        panels: {
          principais: { cards: [{ id: "principais-card", fields: ["razao_social"] }] },
          endereco: { cards: [{ id: "endereco-card", fields: ["cidade"] }] },
        },
      },
      hiddenFieldIds: [],
      lockedFieldIds: [],
      requiredFieldIds: [],
      clearOnDuplicateFieldIds: [],
      fieldDefaultValues: {},
      aggregationConfig: {},
      visibilityRules: {},
      fieldLayoutConfig: { mode: "corporate", columns: 12 },
      fieldSizes: {},
    },
  },
  updatedAt: nowIso(),
});

const installVisualMetricsProbe = async (page) => {
  await page.addInitScript(() => {
    window.__prefsMetrics = {
      tableVisibleTransitions: 0,
      cardsVisibleTransitions: 0,
      seenTableVisible: false,
      seenCardsVisible: false,
    };
    const observer = new MutationObserver(() => {
      const tableVisible = document.querySelector(".mg-table-panel-wrap.is-visible");
      const cardsVisible = document.querySelector(".mg-cards-panel-wrap.is-visible");
      if (tableVisible && !window.__prefsMetrics.seenTableVisible) {
        window.__prefsMetrics.tableVisibleTransitions += 1;
        window.__prefsMetrics.seenTableVisible = true;
      }
      if (!tableVisible && window.__prefsMetrics.seenTableVisible) {
        window.__prefsMetrics.seenTableVisible = false;
      }
      if (cardsVisible && !window.__prefsMetrics.seenCardsVisible) {
        window.__prefsMetrics.cardsVisibleTransitions += 1;
        window.__prefsMetrics.seenCardsVisible = true;
      }
      if (!cardsVisible && window.__prefsMetrics.seenCardsVisible) {
        window.__prefsMetrics.seenCardsVisible = false;
      }
    });
    window.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, { attributes: true, subtree: true, childList: true });
    });
  });
};

const bootstrapSeed = () => {
  const seed = {};
  seed[scopeKey("cliente-a", "user-a", "empresas", "listagem")] = seedListagemRecord({
    viewMode: "search",
  });
  seed[scopeKey("cliente-a", "user-a", "empresas", "form_layout")] = seedFormRecord();
  seed[scopeKey("cliente-a", "user-b", "empresas", "listagem")] = seedListagemRecord({
    viewMode: "table",
  });
  seed[scopeKey("cliente-b", "user-a", "empresas", "listagem")] = seedListagemRecord({
    viewMode: "table",
    frozenLeftColumnCount: 1,
  });
  seed[scopeKey("cliente-b", "user-a", "empresas", "form_layout")] = seedFormRecord();
  return seed;
};

const openEmpresasPage = async (page, token) => {
  await page.addInitScript(
    ({ authToken }) => {
      localStorage.setItem("erp_auth_token", authToken);
      localStorage.setItem("emp_view_mode_v1", "table");
    },
    { authToken: token }
  );
  await page.goto("/CadastroEmpresas");
};

const switchToCardsView = async (page) => {
  const cardsButton = page.locator(".view-mode-btn[data-view='cards']").first();
  await expect(cardsButton).toBeVisible({ timeout: 20_000 });
  await cardsButton.click();
};

test.describe("Empresas preferences architecture (mock)", () => {
  test("abre com bootstrap único sem flash de layout padrão", async ({ page }) => {
    const server = buildPreferencesServer(bootstrapSeed());
    server.controls.bootstrapDelayMs = 160;
    await installVisualMetricsProbe(page);
    await server.route(page);

    await openEmpresasPage(page, TOKENS.userA);

    await expect(page.locator(".mg-cards-panel-wrap.is-visible")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator(".mg-table-panel-wrap.is-visible")).toHaveCount(0);
    expect(server.metrics.bootstrapGets).toBe(1);

    const metrics = await page.evaluate(() => window.__prefsMetrics);
    expect(metrics.tableVisibleTransitions).toBe(0);
  });

  test("isola preferências por usuário e tenant", async ({ browser }) => {
    const server = buildPreferencesServer(bootstrapSeed());
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const contextTenantB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();
    const pageTenantB = await contextTenantB.newPage();

    await Promise.all([
      server.route(pageA),
      server.route(pageB),
      server.route(pageTenantB),
    ]);

    await openEmpresasPage(pageA, TOKENS.userA);
    await openEmpresasPage(pageB, TOKENS.userB);
    await openEmpresasPage(pageTenantB, TOKENS.userATenantB);

    await expect(pageA.locator(".mg-cards-panel-wrap.is-visible")).toBeVisible();
    await expect(pageB.locator(".mg-table-panel-wrap.is-visible")).toBeVisible();
    await expect(pageTenantB.locator(".mg-table-panel-wrap.is-visible")).toBeVisible();

    await contextA.close();
    await contextB.close();
    await contextTenantB.close();
  });

  test("persistência de frozen à esquerda permanece após reload", async ({ page }) => {
    const seed = bootstrapSeed();
    seed[scopeKey("cliente-a", "user-a", "empresas", "listagem")] = seedListagemRecord({
      viewMode: "table",
      frozenLeftColumnCount: 1,
    });
    const server = buildPreferencesServer(seed);
    await server.route(page);

    await openEmpresasPage(page, TOKENS.userA);
    await expect(page.locator(".mg-table-panel-wrap.is-visible")).toBeVisible();
    await expect(page.locator(".emp-th-pinned")).toHaveCount(1);

    await page.reload();
    await expect(page.locator(".emp-th-pinned")).toHaveCount(1);
  });

  test("viewMode record salvo sem registro ativo não deixa tela vazia", async ({ page }) => {
    const seed = bootstrapSeed();
    seed[scopeKey("cliente-a", "user-a", "empresas", "listagem")] = seedListagemRecord({
      viewMode: "record",
    });
    const server = buildPreferencesServer(seed);
    await server.route(page);

    await openEmpresasPage(page, TOKENS.userA);
    await expect(page.locator(".mg-table-panel-wrap.is-visible")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator(".mg-cards-panel-wrap.is-visible")).toHaveCount(0);
  });

  test("resize contínuo de coluna consolida em no máximo 1 PUT", async ({ page }) => {
    const seed = bootstrapSeed();
    seed[scopeKey("cliente-a", "user-a", "empresas", "listagem")] = seedListagemRecord({
      viewMode: "table",
    });
    const server = buildPreferencesServer(seed);
    await server.route(page);

    await openEmpresasPage(page, TOKENS.userA);
    await expect(page.locator(".mg-table-panel-wrap.is-visible")).toBeVisible();

    const handle = page.locator(".mg-view-layer--table .emp-col-resize-handle").first();
    await expect(handle).toBeVisible();
    const box = await handle.boundingBox();
    if (!box) throw new Error("Resize handle não encontrado.");
    await page.waitForTimeout(1200);
    const beforeResizePuts = server.metrics.listagemPuts;

    for (let index = 0; index < 20; index += 1) {
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 4 + index, startY);
      await page.mouse.up();
    }

    await page.waitForTimeout(1600);
    const deltaPuts = server.metrics.listagemPuts - beforeResizePuts;
    expect(deltaPuts).toBeLessThanOrEqual(1);
  });

  test("falha de rede não bloqueia UI e executa retry", async ({ page }) => {
    const seed = bootstrapSeed();
    seed[scopeKey("cliente-a", "user-a", "empresas", "listagem")] = seedListagemRecord({
      viewMode: "table",
    });
    const server = buildPreferencesServer(seed);
    server.controls.failNextListagemPut = true;
    await server.route(page);

    await openEmpresasPage(page, TOKENS.userA);
    await expect(page.locator(".mg-table-panel-wrap.is-visible")).toBeVisible();

    await switchToCardsView(page);
    await page.waitForTimeout(4800);

    expect(server.metrics.putFailures).toBe(1);
    expect(server.metrics.listagemPuts).toBeGreaterThanOrEqual(2);
    await expect(page.locator(".mg-cards-panel-wrap.is-visible")).toBeVisible();
  });

  test("conflito entre abas não sobrescreve alteração mais recente", async ({ browser }) => {
    const seed = bootstrapSeed();
    seed[scopeKey("cliente-a", "user-a", "empresas", "listagem")] = seedListagemRecord({
      viewMode: "table",
    });
    const server = buildPreferencesServer(seed);
    const context = await browser.newContext();
    const tabA = await context.newPage();
    const tabB = await context.newPage();
    await Promise.all([server.route(tabA), server.route(tabB)]);

    await openEmpresasPage(tabA, TOKENS.userA);
    await openEmpresasPage(tabB, TOKENS.userA);

    await switchToCardsView(tabA);
    await tabA.waitForTimeout(1200);

    await switchToCardsView(tabB);
    await tabB.waitForTimeout(1200);

    const persisted = server.getRecord({
      clienteId: "cliente-a",
      userId: "user-a",
      modulo: "empresas",
      tela: "listagem",
    });
    expect(server.metrics.putConflicts).toBeGreaterThanOrEqual(1);
    expect(persisted?.preferencias?.viewMode).toBe("search");

    await context.close();
  });
});
