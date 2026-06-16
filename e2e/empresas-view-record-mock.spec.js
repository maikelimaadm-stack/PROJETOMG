import { test, expect } from "@playwright/test";

const MOCK_USER_ID = "user-e2e-mock";
const MOCK_TOKEN = "mock-token-e2e";

const mockSession = {
  token: MOCK_TOKEN,
  user: {
    id: MOCK_USER_ID,
    cliente_id: "cliente-mock",
    login: "maike",
    perfil: "ADMIN",
    acesso_global: true,
  },
  cliente: { id: "cliente-mock", codigo: "kaiman", nome: "Kaiman" },
  empresas: [{ id: "emp-1", codempresa: 1, nome_empresa: "EMPRESA TESTE" }],
  allowAllEmpresas: true,
  selectedEmpresaId: "all",
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

const setupApiMocks = async (page) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    if (!path.startsWith("/api/")) {
      return route.continue();
    }

    if (path === "/api/auth/login") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSession),
      });
    }

    if (path === "/api/auth/session") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSession),
      });
    }

    if (path === "/api/auth/empresas") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ empresas: mockSession.empresas }),
      });
    }

    if (path === "/api/empresas/campos") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [] }),
      });
    }

    if (path.startsWith("/api/empresas")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [mockEmpresa],
          total: 1,
          page: 1,
          pageSize: 50,
          totalPages: 1,
        }),
      });
    }

    if (path.includes("/api/preferences")) {
      return route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
    }

    if (path === "/api/health") {
      return route.fulfill({ status: 200, body: "ok" });
    }

    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
};

test.describe("Empresas — visualização de registro (mock)", () => {
  test("abre formulário de visualização sem erro de renderização", async ({ page }) => {
    await setupApiMocks(page);

    await page.addInitScript(({ token }) => {
      localStorage.setItem("erp_auth_token", token);
    }, { token: MOCK_TOKEN });

    const consoleErrors = [];
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto("/CadastroEmpresas");
    await expect(page.getByRole("button", { name: "Novo" }).first()).toBeVisible({ timeout: 15_000 });

    await page.locator(".emp-table-data-row").first().dblclick();

    expect(consoleErrors.filter((message) => /ErpScrollNav is not defined/i.test(message))).toEqual([]);

    await expect(page.locator("#mode-registro")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-field="razao_social"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Editar" }).first()).toBeVisible();
  });

  test("navegação mobile de registros fica acima da barra de visualização", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await setupApiMocks(page);

    await page.addInitScript(({ token }) => {
      localStorage.setItem("erp_auth_token", token);
    }, { token: MOCK_TOKEN });

    await page.goto("/CadastroEmpresas");
    await expect(page.getByRole("button", { name: "Novo" }).first()).toBeVisible({ timeout: 15_000 });

    await page.locator(".emp-table-data-row").first().dblclick();
    await expect(page.locator(".emp-form-mobile-nav")).toBeVisible({ timeout: 15_000 });

    const navBox = await page.locator(".emp-form-mobile-nav").boundingBox();
    const viewBarBox = await page.locator(".mobile-bottom-bar").boundingBox();

    expect(navBox).toBeTruthy();
    expect(viewBarBox).toBeTruthy();
    expect(navBox.y + navBox.height).toBeLessThanOrEqual(viewBarBox.y + 1);
  });
});
