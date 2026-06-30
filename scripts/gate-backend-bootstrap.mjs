#!/usr/bin/env node
/**
 * Gate G303 — Backend Bootstrap Validation (Hotfix 0 / Railway Deployment Recovery)
 *
 * Detects before merge:
 * - broken ESM imports / missing exports
 * - backend module graph load failures
 * - bootstrap failure before app.listen()
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BACKEND = path.join(ROOT, "backend");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const run = (label, command, options = {}) => {
  try {
    execSync(command, { stdio: "pipe", encoding: "utf8", ...options });
    gate(label, true);
    return true;
  } catch (error) {
    const output = String(error.stdout || error.stderr || error.message).trim();
    gate(label, false, output.slice(0, 600));
    return false;
  }
};

const backendDepsReady = fs.existsSync(path.join(BACKEND, "node_modules/@prisma/client"));

gate(
  "G303 — backend dependencies present",
  backendDepsReady,
  backendDepsReady ? "" : "run npm ci in backend/"
);

if (!backendDepsReady) {
  run("G303 — backend npm ci", "npm ci --omit=dev", { cwd: BACKEND, stdio: "inherit" });
}

const bootstrapEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/postgres",
  DIRECT_URL: process.env.DIRECT_URL || "postgresql://postgres:postgres@127.0.0.1:5432/postgres",
  JWT_SECRET: process.env.JWT_SECRET || "g303-bootstrap-validation-secret",
};

run("G303 — prisma generate", "npm run prisma:generate", {
  cwd: BACKEND,
  env: bootstrapEnv,
  stdio: "inherit",
});

run("G303 — backend bootstrap probe", "node scripts/validateBackendBootstrap.mjs", {
  cwd: BACKEND,
  env: bootstrapEnv,
  stdio: "inherit",
});

const failed = results.filter((item) => !item.ok);
if (failed.length > 0) {
  console.error(`\nGate G303 FAILED — ${failed.length}/${results.length} checks`);
  process.exit(1);
}

console.log(`\nGate G303 PASSED — ${results.length}/${results.length} checks`);
