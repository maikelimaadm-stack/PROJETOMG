/**
 * E2E real — preferências Empresas contra API remota (sem mocks de preferências).
 * Requer: frontend em PLAYWRIGHT_BASE_URL apontando para branch da PR.
 *
 * Uso:
 *   cp .env.local.example .env.local
 *   PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 npm run dev  (outro terminal)
 *   npx playwright test e2e/empresas-preferences-real.spec.js
 */
import { expect, test } from "@playwright/test";

const API_BASE = process.env.VALIDATE_API_BASE || "https://projetomg-production.up.railway.app";
const LOGIN = {
  cliente: process.env.VALIDATE_CLIENTE || "maike",
  usuario: process.env.VALIDATE_USUARIO || "maike",
  senha: process.env.VALIDATE_SENHA || "123",
};

const requestCounts = {
  bootstrapGets: 0,
  listagemGets: 0,
  listagemPuts: 0,
};

test.describe("Empresas preferences real (API remota)", () => {
  test.beforeEach(async ({ page }) => {
    requestCounts.bootstrapGets = 0;
    requestCounts.listagemGets = 0;
    requestCounts.listagemPuts = 0;

    await page.route("**/api/user/preferences/**", async (route) => {
      const req = route.request();
      const url = req.url();
      if (url.includes("/bootstrap") && req.method() === "GET") {
        requestCounts.bootstrapGets += 1;
      }
      if (url.includes("/empresas/listagem")) {
        if (req.method() === "GET") requestCounts.listagemGets += 1;
        if (req.method() === "PUT") requestCounts.listagemPuts += 1;
      }
      await route.continue();
    });
  });

  test("login, abrir Empresas, ocultar coluna Telefone, reload persiste", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/CadastroEmpresas");
    await page.waitForSelector('[data-testid="emp-table"], .mg-table-panel, table', {
      timeout: 45_000,
    });

    const bootstrapAfterLoad = requestCounts.bootstrapGets;
    expect(bootstrapAfterLoad).toBeLessThanOrEqual(1);

    const telefoneHeader = page.locator('th').filter({ hasText: /^Telefone$/i });
    const telefoneVisibleBefore = await telefoneHeader.count() > 0;

    if (telefoneVisibleBefore) {
      await page.getByRole("button", { name: "Configurar colunas da tabela" }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByRole("heading", { name: "Configuração de colunas" })).toBeVisible();
      await dialog.locator(".emp-config-transfer-item").filter({ hasText: "Telefone" }).first().click();
      await dialog.getByRole("button", { name: "Remover selecionados" }).click();
      await dialog.getByRole("button", { name: "OK" }).click();
    }

    await page.waitForTimeout(1200);
    const putsAfterHide = requestCounts.listagemPuts;
    expect(putsAfterHide).toBeLessThanOrEqual(1);

    await page.reload();
    await page.waitForSelector('[data-testid="emp-table"], .mg-table-panel, table', {
      timeout: 45_000,
    });

    const bootstrapAfterReload = requestCounts.bootstrapGets;
    expect(bootstrapAfterReload).toBeLessThanOrEqual(2);

    if (telefoneVisibleBefore) {
      await expect(telefoneHeader).toHaveCount(0, { timeout: 10_000 });
    }

    expect(requestCounts.listagemPuts).toBeLessThanOrEqual(putsAfterHide + 1);
  });

  test("healthcheck Railway", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.db?.connected).toBe(true);
  });

  test("bootstrap e preferências via API direta", async ({ request }) => {
    const loginRes = await request.post(`${API_BASE}/api/auth/login`, {
      data: LOGIN,
    });
    expect(loginRes.ok()).toBeTruthy();
    const { token } = await loginRes.json();
    expect(token).toBeTruthy();

    const bootstrap = await request.get(`${API_BASE}/api/user/preferences/bootstrap`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(bootstrap.ok()).toBeTruthy();

    const listagem = await request.get(`${API_BASE}/api/user/preferences/empresas/listagem`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(listagem.ok()).toBeTruthy();
  });
});
