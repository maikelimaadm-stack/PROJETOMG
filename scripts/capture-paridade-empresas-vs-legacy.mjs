#!/usr/bin/env node
/**
 * Captura evidência visual lado a lado:
 * - current: branch atual (ModeloBase1 promovido)
 * - legacy: commit 21ac50b7^ (PAGEMP master histórico)
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const OUTPUT_DIR = "/tmp/paridade-empresas-capturas";
const TARGETS = [
  { name: "current", baseUrl: process.env.CURRENT_BASE_URL || "http://127.0.0.1:5173" },
  { name: "legacy", baseUrl: process.env.LEGACY_BASE_URL || "http://127.0.0.1:5174" },
];
const MODES = [
  { name: "table", viewModeValue: "table" },
  { name: "cards", viewModeValue: "search" },
];

const LOGIN = {
  cliente: process.env.AUDIT_CLIENTE || "maike",
  usuario: process.env.AUDIT_USUARIO || "maike",
  senha: process.env.AUDIT_SENHA || "123",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
};

async function tryClick(page, selectors = []) {
  for (const selector of selectors) {
    const locator = page.locator(selector);
    const count = await locator.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const element = locator.nth(index);
      if (await element.isVisible().catch(() => false)) {
        await element.click({ timeout: 5000 }).catch(() => {});
        return true;
      }
    }
  }
  return false;
}

async function ensureLoggedIn(page) {
  const loginVisible = await page.getByRole("heading", { name: "Login do Sistema" }).isVisible().catch(() => false);
  if (!loginVisible) return;

  await page.locator('input[autocomplete="organization"]').fill(LOGIN.cliente);
  await page.locator('input[autocomplete="username"]').fill(LOGIN.usuario);
  await page.locator('input[autocomplete="current-password"]').fill(LOGIN.senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await sleep(4500);
}

async function goToEmpresas(page, baseUrl) {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await ensureLoggedIn(page);

  await page.goto(`${baseUrl}/CadastroEmpresas`, { waitUntil: "domcontentloaded", timeout: 60_000 }).catch(() => {});
  await sleep(2200);

  const empresasLink = page.getByRole("link", { name: "Empresas" }).first();
  if (await empresasLink.isVisible().catch(() => false)) {
    await empresasLink.click({ timeout: 8000 }).catch(() => {});
    await sleep(1200);
  }

  await page.getByRole("button", { name: "Novo" }).first().waitFor({ timeout: 20_000 }).catch(() => {});
}

async function selectMode(page, modeName) {
  if (modeName === "table") {
    await tryClick(page, [
      'button[title="Tabela"]',
      'button[aria-label="Tabela"]',
      '.view-mode-btn[title="Tabela"]',
      '[data-view="tabela"]',
    ]);
    await sleep(900);
    return;
  }

  await tryClick(page, [
    'button[title="Cards"]',
    'button[aria-label="Cards"]',
    '.view-mode-btn[title="Cards"]',
    '[data-view="cards"]',
  ]);
  await sleep(1200);
}

async function captureTargetMode(browser, target, mode) {
  const context = await browser.newContext({
    viewport: { width: 1680, height: 980 },
    colorScheme: "light",
  });
  const page = await context.newPage();

  await page.addInitScript(
    ([value]) => {
      window.localStorage.setItem("emp_view_mode_v1", value);
    },
    [mode.viewModeValue]
  );

  await goToEmpresas(page, target.baseUrl);
  // Fecha dialogs/eventuais overlays para garantir captura do estado principal.
  await page.keyboard.press("Escape").catch(() => {});
  await tryClick(page, [
    'button[aria-label="Fechar"]',
    "button:has-text('Cancelar')",
  ]);
  await tryClick(page, [
    'button[title="Limpar todos os filtros"]',
    'button[aria-label="Limpar todos os filtros"]',
  ]);
  await selectMode(page, mode.name);

  // Congela animações para reduzir ruído de captura.
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
        caret-color: transparent !important;
      }
    `,
  }).catch(() => {});

  await sleep(600);
  const outPath = path.join(OUTPUT_DIR, `${target.name}-${mode.name}.png`);
  await page.screenshot({ path: outPath });
  await context.close();
  return outPath;
}

async function main() {
  ensureDir(OUTPUT_DIR);
  const browser = await chromium.launch({ headless: true });

  try {
    for (const target of TARGETS) {
      for (const mode of MODES) {
        const outPath = await captureTargetMode(browser, target, mode);
        console.log(outPath);
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
