import { test, expect } from "@playwright/test";

const login = async (page) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Login do Sistema" })).toBeVisible();
  await page.locator('input[autocomplete="organization"]').fill("demo");
  await page.locator('input[autocomplete="username"]').fill("demo");
  await page.locator('input[autocomplete="current-password"]').fill("123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "MAK Gestão ERP" })).toBeVisible({ timeout: 20_000 });
};

const selectFirstEmpresa = async (page) => {
  const empresaSelect = page.locator('header select').first();
  await empresaSelect.selectOption({ index: 1 });
};

test.describe("Autenticação", () => {
  test("login com credenciais demo", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("link", { name: "Cadastro de Empresas" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Cadastro de Fazendas" }).first()).toBeVisible();
  });
});

test.describe("Navegação de módulos", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("acessa cadastro de empresas", async ({ page }) => {
    await page.getByRole("link", { name: "Cadastro de Empresas" }).first().click();
    await expect(page.getByText("Cadastro de Empresas").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Novo" }).first()).toBeVisible();
  });

  test("acessa cadastro de fazendas", async ({ page }) => {
    await page.getByRole("link", { name: "Cadastro de Fazendas" }).first().click();
    await expect(page.getByText("Cadastro de Fazendas").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Novo" }).first()).toBeVisible();
  });
});

test.describe("CRUD Fazendas (UI)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstEmpresa(page);
    await page.getByRole("link", { name: "Cadastro de Fazendas" }).first().click();
    await expect(page.getByText("Cadastro de Fazendas").first()).toBeVisible();
  });

  test("inclusão e exclusão de fazenda", async ({ page }) => {
    const nome = `FAZENDA E2E ${Date.now()}`;

    await page.getByRole("button", { name: "Novo" }).first().click();
    await page.getByPlaceholder("NOME").fill(nome);
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByRole("button", { name: "Novo" }).first()).toBeVisible({ timeout: 15_000 });

    const row = page.locator("tr").filter({ hasText: nome }).first();
    await expect(row).toBeVisible({ timeout: 10_000 });
    await row.click();
    await page.getByRole("button", { name: "Excluir" }).first().click();
    await page.getByRole("button", { name: "Confirmar" }).click();
    await page.reload();
    await expect(page.locator("tr").filter({ hasText: nome })).toHaveCount(0, { timeout: 15_000 });
  });
});
