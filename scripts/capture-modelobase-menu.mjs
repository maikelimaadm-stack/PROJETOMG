#!/usr/bin/env node
import { chromium } from "playwright";

const OUTPUT = process.env.MODELOBASE_MENU_SHOT || "/tmp/paridade-empresas-capturas/modelobase-menu.png";
const BASE_URL = process.env.CURRENT_BASE_URL || "http://127.0.0.1:5173";

const LOGIN = {
  cliente: process.env.AUDIT_CLIENTE || "maike",
  usuario: process.env.AUDIT_USUARIO || "maike",
  senha: process.env.AUDIT_SENHA || "123",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1680, height: 980 } });
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await sleep(3500);

    const loginVisible = await page.getByRole("heading", { name: "Login do Sistema" }).isVisible().catch(() => false);
    if (loginVisible) {
      await page.locator('input[autocomplete="organization"]').fill(LOGIN.cliente);
      await page.locator('input[autocomplete="username"]').fill(LOGIN.usuario);
      await page.locator('input[autocomplete="current-password"]').fill(LOGIN.senha);
      await page.getByRole("button", { name: "Entrar" }).click();
      await sleep(4500);
    }

    await page.goto(`${BASE_URL}/CadastroEmpresas`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await sleep(1800);

    // Abre/fixa o menu lateral para evidenciar o grupo "Modelo Base1".
    await page.locator('button[aria-label="Fixar menu"]').first().click({ timeout: 6000 }).catch(() => {});
    await sleep(1200);

    await page.screenshot({ path: OUTPUT, fullPage: true });
    console.log(OUTPUT);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
