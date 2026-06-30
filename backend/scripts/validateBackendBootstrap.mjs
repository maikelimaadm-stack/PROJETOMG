#!/usr/bin/env node
/**
 * G401 — Backend Bootstrap Validation probe.
 * Validates ESM import graph and pre-listen initialization (no app.listen).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = path.join(backendRoot, "src");

process.chdir(backendRoot);

const srcUrl = (relativePath) => pathToFileURL(path.join(backendRoot, relativePath)).href;

process.env.NODE_ENV = "production";
process.env.BOOT_SKIP_MIGRATIONS = "true";
process.env.SEED_SKIP = "true";
process.env.HOST = "0.0.0.0";
process.env.BACKEND_PORT = "3099";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
process.env.DIRECT_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;
process.env.JWT_SECRET = process.env.JWT_SECRET || "g303-bootstrap-validation-secret";

const failures = [];

const check = async (name, fn) => {
  try {
    await fn();
    console.log(`✓ ${name}`);
    return true;
  } catch (error) {
    const message = error?.message || String(error);
    console.error(`✗ ${name} — ${message}`);
    failures.push({ name, message });
    return false;
  }
};

const walkJsFiles = (dir) => {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsFiles(full));
    } else if (entry.name.endsWith(".js")) {
      files.push(full);
    }
  }
  return files.sort();
};

await check("G401.1 — import src/routes/index.js", async () => {
  await import(srcUrl("src/routes/index.js"));
});

await check("G401.2 — import src/server.js (exports, no listen)", async () => {
  const serverModule = await import(srcUrl("src/server.js"));
  if (typeof serverModule.buildServer !== "function") {
    throw new Error("buildServer is not exported from src/server.js");
  }
  if (typeof serverModule.runBlockingBootTasks !== "function") {
    throw new Error("runBlockingBootTasks is not exported from src/server.js");
  }
});

const moduleFiles = walkJsFiles(srcRoot);
for (const filePath of moduleFiles) {
  const rel = path.relative(backendRoot, filePath).replaceAll("\\", "/");
  if (rel === "src/server.js") continue;
  await check(`G401.3 — import ${rel}`, async () => {
    await import(pathToFileURL(filePath).href);
  });
}

await check("G401.4 — bootstrap until pre-listen (buildServer)", async () => {
  const { buildServer, runBlockingBootTasks } = await import(srcUrl("src/server.js"));
  await runBlockingBootTasks(console);
  const app = await buildServer();
  await app.close();
});

if (failures.length > 0) {
  console.error(`\nG401 Backend Bootstrap Validation FAILED (${failures.length} step(s))`);
  for (const item of failures) {
    console.error(`  - ${item.name}: ${item.message}`);
  }
  process.exit(1);
}

console.log("\nG401 Backend Bootstrap Validation PASSED");
