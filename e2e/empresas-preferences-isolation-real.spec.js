/**
 * E2E real — isolamento preferências Empresas (PR #223).
 * Login via API real; browser valida UI + localStorage scoped + reload/aba.
 */
import { expect, test } from "@playwright/test";

const API_BASE = process.env.VALIDATE_BASE_URL || "http://127.0.0.1:3001";
const PASSWORD = process.env.PREF_ISOLATION_SEED_PASSWORD || "Pr223Test!2026";

const USERS = {
  A: { cliente: "tenant1", usuario: "usera" },
  B: { cliente: "tenant1", usuario: "userb" },
  C: { cliente: "tenant2", usuario: "userc" },
};

const loginApi = async (request, { cliente, usuario }) => {
  const res = await request.post(`${API_BASE}/api/auth/login`, {
    data: { cliente, usuario, senha: PASSWORD },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.token).toBeTruthy();
  return body;
};

const openEmpresasWithToken = async (page, token) => {
  await page.addInitScript((authToken) => {
    sessionStorage.setItem("erp_auth_token", authToken);
    localStorage.setItem("erp_auth_token", authToken);
  }, token);
  await page.goto("/CadastroEmpresas");
  await expect(page.getByRole("button", { name: "Novo" }).first()).toBeVisible({ timeout: 60_000 });

  const tableButton = page.getByRole("button", { name: "Tabela" }).first();
  if (await tableButton.isVisible().catch(() => false)) {
    await tableButton.click();
  } else {
    const legacyTableBtn = page.locator(".view-mode-btn[data-view='table']").first();
    if (await legacyTableBtn.isVisible().catch(() => false)) {
      await legacyTableBtn.click();
    }
  }

  await page.waitForSelector('[data-testid="emp-table"], .mg-table-panel-wrap.is-visible, .mg-table-panel, table', {
    timeout: 60_000,
  });
};

const telefoneHeader = (page) => page.getByRole("columnheader", { name: /^Telefone/i });
const emailHeader = (page) => page.getByRole("columnheader", { name: /^E-mail|^Email/i });

const putListagemPrefs = async (request, token, preferencias) => {
  const current = await request.get(`${API_BASE}/api/user/preferences/empresas/listagem`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await current.json();
  const res = await request.put(`${API_BASE}/api/user/preferences/empresas/listagem`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      versao_schema: 1,
      preferencias: { version: 1, ...preferencias },
      expectedUpdatedAt: body.updatedAt || undefined,
    },
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
};

test.describe("PR #223 — isolamento real (A/B/C)", () => {
  test.beforeEach(({ }, testInfo) => {
    testInfo.setTimeout(180_000);
  });

  test("A oculta Telefone; reload persiste; B não herda", async ({ browser, request }) => {
    const sessionA = await loginApi(request, USERS.A);
    const sessionB = await loginApi(request, USERS.B);

    await putListagemPrefs(request, sessionA.token, {
      table: { visibleColumns: ["codempresa"] },
      viewMode: "table",
    });
    await putListagemPrefs(request, sessionB.token, {
      table: { visibleColumns: ["codempresa", "telefone"] },
      viewMode: "table",
    });

    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    await openEmpresasWithToken(pageA, sessionA.token);
    await expect(telefoneHeader(pageA)).toHaveCount(0, { timeout: 15_000 });

    await pageA.reload();
    await openEmpresasWithToken(pageA, sessionA.token);
    await expect(telefoneHeader(pageA)).toHaveCount(0, { timeout: 15_000 });

    await openEmpresasWithToken(pageB, sessionB.token);
    await expect(telefoneHeader(pageB)).toHaveCount(1, { timeout: 15_000 });

    await ctxA.close();
    await ctxB.close();
  });

  test("B oculta E-mail; nova aba persiste; re-login mantém", async ({ browser, request }) => {
    const sessionB = await loginApi(request, USERS.B);

    await putListagemPrefs(request, sessionB.token, {
      table: { visibleColumns: ["codempresa"] },
      viewMode: "table",
    });

    const ctx = await browser.newContext();
    const page1 = await ctx.newPage();
    const page2 = await ctx.newPage();

    await openEmpresasWithToken(page1, sessionB.token);
    await expect(emailHeader(page1)).toHaveCount(0, { timeout: 15_000 });

    await openEmpresasWithToken(page2, sessionB.token);
    await expect(emailHeader(page2)).toHaveCount(0, { timeout: 15_000 });

    await page1.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    const sessionB2 = await loginApi(request, USERS.B);
    await openEmpresasWithToken(page1, sessionB2.token);
    await expect(emailHeader(page1)).toHaveCount(0, { timeout: 15_000 });

    await ctx.close();
  });

  test("C (tenant2) isolado de A", async ({ browser, request }) => {
    const sessionA = await loginApi(request, USERS.A);
    const sessionC = await loginApi(request, USERS.C);

    await putListagemPrefs(request, sessionA.token, {
      table: { visibleColumns: ["codempresa"] },
      viewMode: "table",
    });
    await putListagemPrefs(request, sessionC.token, {
      table: { visibleColumns: ["codempresa", "status"], _marker: "pr223-isolation-user-c" },
      viewMode: "table",
    });

    const ctxA = await browser.newContext();
    const ctxC = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageC = await ctxC.newPage();

    await openEmpresasWithToken(pageA, sessionA.token);
    await expect(telefoneHeader(pageA)).toHaveCount(0, { timeout: 15_000 });

    await openEmpresasWithToken(pageC, sessionC.token);
    await expect(pageC.getByRole("columnheader", { name: /Status/i })).toHaveCount(1, {
      timeout: 15_000,
    });
    const prefsC = await request.get(`${API_BASE}/api/user/preferences/empresas/listagem`, {
      headers: { Authorization: `Bearer ${sessionC.token}` },
    });
    const bodyC = await prefsC.json();
    expect(bodyC.preferencias?.table?._marker).toBe("pr223-isolation-user-c");

    await ctxA.close();
    await ctxC.close();
  });
});
