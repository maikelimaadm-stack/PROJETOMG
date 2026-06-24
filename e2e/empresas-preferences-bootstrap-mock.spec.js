import { test, expect } from "@playwright/test";

const MOCK_TOKEN = "mock-token-pref-bootstrap";

const mockSession = {
  token: MOCK_TOKEN,
  user: {
    id: "user-pref-bootstrap",
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
    const { pathname } = url;
    if (!pathname.startsWith("/api/")) {
      return route.continue();
    }

    if (pathname === "/api/auth/login" || pathname === "/api/auth/session") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSession),
      });
    }

    if (pathname === "/api/auth/empresas") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ empresas: mockSession.empresas }),
      });
    }

    if (pathname === "/api/user/preferences/bootstrap") {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          preferences: [
            {
              modulo: "empresas",
              tela: "listagem",
              versao_schema: 1,
              updatedAt: new Date().toISOString(),
              preferencias: {
                version: 1,
                viewMode: "search",
                table: {
                  columnOrder: ["codempresa", "razao_social"],
                  visibleColumns: ["codempresa", "razao_social"],
                },
                cards: {
                  layoutConfig: { cardsPerRow: 2 },
                },
              },
            },
          ],
        }),
      });
    }

    if (pathname.startsWith("/api/user/preferences/")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          modulo: "empresas",
          tela: "listagem",
          versao_schema: 1,
          preferencias: {},
          updatedAt: new Date().toISOString(),
        }),
      });
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
          pageSize: 50,
          totalPages: 1,
        }),
      });
    }

    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
};

test.describe("Bootstrap de preferências (mock)", () => {
  test("abre no modo salvo sem passar pelo modo padrão", async ({ page }) => {
    await setupApiMocks(page);
    await page.addInitScript(
      ({ token }) => {
        localStorage.setItem("erp_auth_token", token);
        localStorage.setItem("emp_view_mode_v1", "table");
      },
      { token: MOCK_TOKEN }
    );

    await page.goto("/CadastroEmpresas");
    await expect(page.locator(".mg-cards-panel-wrap.is-visible")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator(".mg-table-panel-wrap.is-visible")).toHaveCount(0);
  });
});

