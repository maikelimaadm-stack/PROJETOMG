import { chromium } from "playwright";

const baseURL = process.env.SMOKE_BASE_URL || "http://127.0.0.1:5173";
const errors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

try {
  await page.goto(baseURL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.getByRole("button", { name: "Novo" }).first().waitFor({ timeout: 30_000 });
  const hasNovo = await page.getByRole("button", { name: "Novo" }).first().isVisible().catch(() => false);
  console.log(JSON.stringify({ ok: true, baseURL, hasNovo, errors: errors.slice(0, 5) }, null, 2));
  process.exit(errors.length ? 1 : 0);
} catch (error) {
  console.error(JSON.stringify({ ok: false, baseURL, message: String(error), errors }, null, 2));
  process.exit(1);
} finally {
  await browser.close();
}
