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
  empresas: [
    { id: "emp-1", codempresa: 1, nome_empresa: "EMPRESA TESTE" },
  ],
  allowAllEmpresas: true,
  selectedEmpresaId: "all",
};

const corruptLayout = {
  panels: [
    { id: "principal", label: "Principal", hidden: false },
    { id: "geral", label: "Geral", hidden: true },
    { id: "endereco", label: "Endereço", hidden: true },
    { id: "observacoes", label: "Observações", hidden: true },
  ],
  layout: {
    principal: ["custom:deleted_field"],
    geral: [],
    endereco: [],
    observacoes: [],
  },
  hiddenFieldIds: [],
  lockedFieldIds: [],
  requiredFieldIds: [],
  fieldLayoutConfig: { mode: "vertical", columns: 1 },
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
          items: [
            {
              id: "emp-1",
              codempresa: 1,
              razao_social: "EMPRESA TESTE",
              tipo_pessoa: "PJ",
              status: "Ativa",
              campos_personalizados: {},
            },
          ],
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

test.describe("Empresas — Novo com layout corrompido (mock)", () => {
  test("abre formulário de inclusão sem tela em branco", async ({ page }) => {
    await setupApiMocks(page);

    await page.addInitScript(
      ({ userId, layout, token }) => {
        localStorage.setItem("erp_auth_token", token);
        localStorage.setItem(
          `cadastro:${userId}:emp:form_layout_config`,
          JSON.stringify(layout)
        );
      },
      { userId: MOCK_USER_ID, layout: corruptLayout, token: MOCK_TOKEN }
    );

    const consoleErrors = [];
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto("/CadastroEmpresas");
    await expect(page.getByRole("button", { name: "Novo" }).first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "Novo" }).first().click();

    expect(consoleErrors).toEqual([]);

    await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-field="razao_social"]')).toBeVisible();
    await expect(page.getByText("Novo").first()).toBeVisible();

    expect(
      consoleErrors.filter((message) => /maximum update depth|rendered fewer hooks/i.test(message))
    ).toEqual([]);
  });
});
