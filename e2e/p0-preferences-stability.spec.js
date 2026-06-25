/**
 * P0 stabilization smoke — não grava preferências reais (mock PUT/PATCH).
 */
import { expect, test } from "@playwright/test";

const EMPRESAS_READY_SELECTOR =
  "table, .mg-table-panel-wrap.is-visible, .mg-table-panel-strip, .mg-cards-panel-wrap.is-visible, .emp-cards-panel, .mg-emp-card";

const mockPreferencesApi = async (page) => {
  await page.route("**/api/user/preferences/**", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          preferences: [
            {
              modulo: "empresas",
              tela: "listagem",
              versao_schema: 2,
              revision: 1,
              updatedAt: new Date().toISOString(),
              preferencias: {
                version: 2,
                table: { visibleColumns: [], columnOrder: [], sort: [{ key: "codempresa", direction: "asc" }] },
                cards: { layoutConfig: { cardsPerRow: 2 }, visibleFields: {}, fieldOrder: [] },
                filtersConfig: { maxVisibleFields: 5, filterFieldsLayout: { visiveis: [], ordem: [], maxVisible: 5 } },
              },
            },
          ],
        }),
      });
      return;
    }
    if (method === "PUT" || method === "PATCH") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          versao_schema: 2,
          revision: 2,
          updatedAt: new Date().toISOString(),
          preferencias: {},
        }),
      });
      return;
    }
    await route.continue();
  });
};

const loginIfNeeded = async (page) => {
  const loginHeading = page.getByRole("heading", { name: /login do sistema/i });
  if (!(await loginHeading.isVisible().catch(() => false))) return;
  await page.getByLabel("Cliente").fill(process.env.PLAYWRIGHT_CLIENTE || "maike");
  await page.getByLabel("Usuário").fill(process.env.PLAYWRIGHT_USUARIO || "maike");
  await page.getByLabel("Senha").fill(process.env.PLAYWRIGHT_SENHA || "123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForFunction(() => !document.body.innerText.includes("Login do Sistema"), {
    timeout: 45_000,
  });
};

test.describe("P0 preferences stability smoke", () => {
  test("login, empresas, reload, sem skeleton bloqueante", async ({ page }) => {
    test.setTimeout(120_000);
    const depthErrors = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (/maximum update depth|minified react error #185/i.test(text)) {
        depthErrors.push(text);
      }
    });

    await mockPreferencesApi(page);
    await page.goto("/CadastroEmpresas");
    await loginIfNeeded(page);
    await page.waitForSelector(EMPRESAS_READY_SELECTOR, { timeout: 45_000 });
    await expect(page.locator(".mg-empresas-scope .animate-pulse")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /ocorreu um erro/i })).toHaveCount(0);

    for (let i = 0; i < 3; i += 1) {
      await page.reload();
      await page.waitForSelector(EMPRESAS_READY_SELECTOR, { timeout: 20_000 });
      await expect(page.locator(".mg-empresas-scope .animate-pulse")).toHaveCount(0);
    }

    expect(depthErrors).toEqual([]);
  });
});
