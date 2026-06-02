import { test, expect } from "@playwright/test";

const login = async (page) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Login do Sistema" })).toBeVisible();
  await page.locator('input[autocomplete="organization"]').fill("kaiman");
  await page.locator('input[autocomplete="username"]').fill("maike");
  await page.locator('input[autocomplete="current-password"]').fill("123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("MAK Gestão ERP").first()).toBeVisible({ timeout: 20_000 });
};

test.describe("Autenticação", () => {
  test("login com credenciais do banco", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("link", { name: "Empresas" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Campos Personalizados" }).first()).toBeVisible();
  });
});

test.describe("Navegação de módulos", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("acessa cadastro de empresas", async ({ page }) => {
    await page.getByRole("link", { name: "Empresas" }).first().click();
    await expect(page.getByText("Cadastro de Empresas").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Novo" }).first()).toBeVisible();
  });

  test("acessa cadastro de campos personalizados", async ({ page }) => {
    await page.getByRole("link", { name: "Campos Personalizados" }).first().click();
    await expect(page.getByText("Campos Personalizados").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Novo" }).first()).toBeVisible();
  });
});

test.describe("CRUD Empresas (UI)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Empresas" }).first().click();
    await expect(page.getByText("Cadastro de Empresas").first()).toBeVisible();
  });

  test("inclusão e exclusão de empresa", async ({ page }) => {
    const nome = `EMPRESA E2E ${Date.now()}`;

    await page.getByRole("button", { name: "Novo" }).first().click();
    await page.getByPlaceholder("NOME/RAZÃO SOCIAL").fill(nome);
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByRole("button", { name: "Excluir" }).first()).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "Excluir" }).first().click();
    await page.getByRole("button", { name: "Confirmar" }).click();

    await page.locator('button[title="Visualizar tabela"]').first().click();
    await page.reload();
    await expect(page.locator("tr").filter({ hasText: nome })).toHaveCount(0, { timeout: 15_000 });
  });
});
