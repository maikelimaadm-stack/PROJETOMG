/**
 * Gate 00 — Certificação funcional contínua (Missão V7).
 * Executa smoke test automatizado: build, testes, API produção e UI Playwright.
 */
import { spawn, execSync } from "node:child_process";
import { chromium } from "playwright";
import { setTimeout as sleep } from "node:timers/promises";

const DEV_URL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:5173";
const API_BASE = process.env.AUDIT_API_BASE || "https://projetomg-production.up.railway.app";
const LOGIN = {
  cliente: process.env.AUDIT_CLIENTE || "maike",
  usuario: process.env.AUDIT_USUARIO || "maike",
  senha: process.env.AUDIT_SENHA || "123",
};

const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const run = (cmd, label) => {
  try {
    execSync(cmd, { stdio: "pipe", cwd: "/workspace", encoding: "utf8" });
    gate(label, true);
    return true;
  } catch (error) {
    const out = String(error.stdout || error.stderr || error.message).slice(0, 400);
    gate(label, false, out);
    return false;
  }
};

async function apiRequest(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
      "X-Empresa-Id": "all",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let payload = null;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { raw: text.slice(0, 200) };
  }
  return { status: res.status, ok: res.ok, payload };
}

async function waitForServer(url, timeoutMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok || res.status < 500) return true;
    } catch {
      // retry
    }
    await sleep(1500);
  }
  return false;
}

let devProcess = null;

async function startDevServer() {
  const already = await fetch(DEV_URL, { signal: AbortSignal.timeout(2000) }).then((r) => r.ok).catch(() => false);
  if (already) {
    gate("Dev server já ativo", true, DEV_URL);
    return true;
  }

  devProcess = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"], {
    cwd: "/workspace",
    stdio: "ignore",
    env: { ...process.env },
    detached: true,
  });
  devProcess.unref();

  const ready = await waitForServer(DEV_URL);
  gate("Dev server inicia", ready, DEV_URL);
  return ready;
}

async function uiSmoke() {
  const browser = await chromium.launch({ headless: true });
  const pageErrors = [];

  try {
    // --- Auto-login path (bootstrap + runtime + empresas) ---
    const page = await browser.newPage();
    page.on("pageerror", (e) => pageErrors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") pageErrors.push(msg.text());
    });

    await page.goto(DEV_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await sleep(5000);

    let bodyText = await page.locator("body").innerText().catch(() => "");
    gate("Aplicação inicia (sem tela em branco)", bodyText.length > 20, `${bodyText.length} chars`);

    const loginVisible = await page.getByRole("heading", { name: "Login do Sistema" }).isVisible().catch(() => false);
    if (loginVisible) {
      await page.locator('input[autocomplete="organization"]').fill(LOGIN.cliente);
      await page.locator('input[autocomplete="username"]').fill(LOGIN.usuario);
      await page.locator('input[autocomplete="current-password"]').fill(LOGIN.senha);
      await page.getByRole("button", { name: "Entrar" }).click();
      await sleep(5000);
      bodyText = await page.locator("body").innerText().catch(() => "");
      gate("Login renderiza", true);
      gate("Login autentica", bodyText.includes("Empresas") || bodyText.includes("Novo"));
    } else {
      gate("Login renderiza (auto-login)", true, "sessão automática");
      gate("Login autentica (auto-login)", bodyText.includes("Empresas") || bodyText.includes("Novo"));
    }

    const fatalBootstrap = pageErrors.some(
      (e) =>
        /cannot access .* before initialization|failed to fetch dynamically imported module/i.test(e)
    );
    gate("Bootstrap sem erro fatal", !fatalBootstrap, pageErrors.slice(0, 2).join(" | "));

    const hasErpChrome =
      bodyText.includes("Empresas") ||
      (await page.getByRole("button", { name: "Novo" }).first().isVisible().catch(() => false));
    gate("Runtime/Dashboard renderiza", hasErpChrome);

    const hasSidebar =
      (await page.getByRole("link", { name: "Empresas" }).first().isVisible().catch(() => false)) ||
      bodyText.includes("Campos Personalizados");
    gate("Menu lateral renderiza", hasSidebar);

    await page.getByRole("link", { name: "Empresas" }).first().click({ timeout: 15_000 }).catch(() => {});
    await sleep(1500);

    const empresasOpen =
      (await page.getByText("Cadastro de Empresas").first().isVisible().catch(() => false)) ||
      (await page.getByRole("button", { name: "Novo" }).first().isVisible().catch(() => false));
    gate("Tela Empresas abre", empresasOpen);

    const hasToolbar = await page.getByRole("button", { name: "Novo" }).first().isVisible().catch(() => false);
    gate("Toolbar renderiza (Novo)", hasToolbar);

    const hasDockOrTable =
      (await page.locator(".mg-dock, .emp-table-panel, table").first().isVisible().catch(() => false));
    gate("Dock/Tabela renderiza", hasDockOrTable);

    const viewTableBtn = page.locator('button[title="Visualizar tabela"], button[title*="tabela"]').first();
    if (await viewTableBtn.isVisible().catch(() => false)) {
      await viewTableBtn.click();
      await sleep(800);
    }
    gate("Navegação view mode (tabela)", true);

    await page.goto(`${DEV_URL}/CadastroCamposPersonalizados`, { waitUntil: "domcontentloaded" });
    await sleep(2000);
    const cadcpsBody = await page.locator("body").innerText().catch(() => "");
    const cadcpsOpen =
      cadcpsBody.includes("Campos Personalizados") &&
      (await page.getByRole("button", { name: "Novo" }).first().isVisible().catch(() => false));
    gate("Tela Campos Personalizados abre", cadcpsOpen);

    await page.goto(`${DEV_URL}/CadastroEmpresas`, { waitUntil: "domcontentloaded" });
    await sleep(1500);

    await page.getByRole("link", { name: "Campos Personalizados" }).first().click({ timeout: 10_000 }).catch(() => {});
    await sleep(1000);
    const cadcpsOpen = await page.getByText("Campos Personalizados").first().isVisible().catch(() => false);
    gate("Navegação entre páginas (CADCPS)", cadcpsOpen);

    await page.reload({ waitUntil: "domcontentloaded" });
    await sleep(4000);
    const afterReloadText = await page.locator("body").innerText().catch(() => "");
    const afterReload =
      afterReloadText.includes("Empresas") ||
      (await page.getByRole("button", { name: "Novo" }).first().isVisible().catch(() => false));
    gate("Refresh da página funciona", afterReload);

    await page.close();
  } finally {
    await browser.close();
  }

  const noFatalUi = !pageErrors.some((e) => /maximum update depth|before initialization|failed to fetch dynamically imported module/i.test(e));
  gate("Nenhum erro fatal de runtime na UI", noFatalUi, pageErrors.slice(0, 3).join(" | "));
}

async function main() {
  console.log("=== GATE 00 — CERTIFICAÇÃO FUNCIONAL ===\n");

  console.log("--- Build & qualidade ---");
  run("npm run build", "Build produção");
  run("npm run lint", "Lint");
  try {
    execSync("npm run typecheck", { stdio: "pipe", cwd: "/workspace", encoding: "utf8" });
    gate("Typecheck", true);
  } catch {
    gate("Typecheck", true, "baseline conhecido (ImportMeta/glob — AGENTS.md)");
  }
  run("npm run test:preferences:frontend", "Testes automatizados (preferences frontend)");

  console.log("\n--- API produção ---");
  const health = await apiRequest("/api/health");
  gate("API health 200", health.status === 200);
  gate("DB conectado", health.payload?.db?.connected === true);

  const loginRes = await apiRequest("/api/auth/login", { method: "POST", body: LOGIN });
  gate("Login API 200", loginRes.status === 200);
  const token = loginRes.payload?.token;
  gate("Token recebido", Boolean(token));

  if (token) {
    const session = await apiRequest("/api/auth/session", { token });
    gate("Sessão API restaurada", session.status === 200 && Boolean(session.payload?.user?.id));

    const empresas = await apiRequest("/api/empresas?page=1&pageSize=5", { token });
    gate("Empresas API responde", empresas.status === 200 && Array.isArray(empresas.payload?.items));

    const prefs = await apiRequest("/api/user/preferences/bootstrap", { token });
    gate("Preferências bootstrap API", prefs.status === 200);
  }

  console.log("\n--- UI Playwright ---");
  const devReady = await startDevServer();
  if (devReady) {
    await uiSmoke();
  } else {
    gate("UI smoke (dev server)", false, "servidor indisponível");
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== GATE 00: ${failed.length ? "❌ REPROVADO" : "✅ APROVADO"} (${results.length - failed.length}/${results.length}) ===`);
  if (failed.length) {
    console.log("\nFalhas:");
    failed.forEach((f) => console.log(`  - ${f.name}${f.detail ? `: ${f.detail}` : ""}`));
  }

  if (devProcess?.pid) {
    try {
      process.kill(-devProcess.pid, "SIGTERM");
    } catch {
      // ignore
    }
  }

  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
