#!/usr/bin/env node
/**
 * Gate G304 — Railway Docker Build Validation (Program 2.3.X.1)
 *
 * Simulates Dockerfile.railway build stages before merge:
 * - deploy config integrity (railway.json, Dockerfile.railway)
 * - npm ci, prisma validate, prisma generate
 * - runtime entrypoint and healthcheck contract
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const BACKEND = path.join(ROOT, "backend");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const read = (filePath) => fs.readFileSync(filePath, "utf8");

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

const railwayJsonPath = path.join(ROOT, "railway.json");
const dockerfilePath = path.join(ROOT, "Dockerfile.railway");

gate("G304 — railway.json exists", fs.existsSync(railwayJsonPath));
gate("G304 — Dockerfile.railway exists", fs.existsSync(dockerfilePath));

let railwayConfig = {};
try {
  railwayConfig = JSON.parse(read(railwayJsonPath));
  gate(
    "G304 — railway.json builder is DOCKERFILE",
    railwayConfig?.build?.builder === "DOCKERFILE",
    railwayConfig?.build?.builder || "missing"
  );
  gate(
    "G304 — railway.json dockerfilePath matches Dockerfile.railway",
    railwayConfig?.build?.dockerfilePath === "Dockerfile.railway",
    railwayConfig?.build?.dockerfilePath || "missing"
  );
  gate(
    "G304 — healthcheckPath is /",
    railwayConfig?.deploy?.healthcheckPath === "/",
    railwayConfig?.deploy?.healthcheckPath || "missing"
  );
} catch (error) {
  gate("G304 — railway.json parse", false, error.message);
}

const dockerfile = fs.existsSync(dockerfilePath) ? read(dockerfilePath) : "";
gate("G304 — Dockerfile uses node:22-alpine", /FROM node:22-alpine/i.test(dockerfile));
gate("G304 — Dockerfile CMD node src/server.js", /CMD \["node", "src\/server.js"\]/.test(dockerfile));
gate(
  "G304 — Dockerfile runs prisma:generate",
  /npm run prisma:generate/.test(dockerfile)
);
gate("G304 — Dockerfile EXPOSE 3001", /EXPOSE 3001/.test(dockerfile));

const routesIndex = path.join(BACKEND, "src/routes/index.js");
if (fs.existsSync(routesIndex)) {
  const routesSource = read(routesIndex);
  gate("G304 — health route GET / registered", /app\.get\("\/"/.test(routesSource));
} else {
  gate("G304 — health route GET / registered", false, "routes/index.js missing");
}

const backendPkg = JSON.parse(read(path.join(BACKEND, "package.json")));
gate(
  "G304 — backend start script is node src/server.js",
  backendPkg.scripts?.start === "node src/server.js"
);

const migrationsDir = path.join(BACKEND, "prisma/migrations");
if (fs.existsSync(migrationsDir)) {
  const migrationFolders = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const missingSql = migrationFolders.filter(
    (folder) => !fs.existsSync(path.join(migrationsDir, folder, "migration.sql"))
  );
  gate(
    "G304 — prisma migrations have migration.sql",
    missingSql.length === 0,
    missingSql.length ? missingSql.join(", ") : `${migrationFolders.length} migrations`
  );
} else {
  gate("G304 — prisma migrations have migration.sql", false, "migrations dir missing");
}

const deployEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/postgres",
  DIRECT_URL: process.env.DIRECT_URL || "postgresql://postgres:postgres@127.0.0.1:5432/postgres",
};

if (!fs.existsSync(path.join(BACKEND, "node_modules"))) {
  run("G304 — backend npm ci", "npm ci --omit=dev", { cwd: BACKEND, stdio: "inherit" });
}

run("G304 — prisma validate", "npm run prisma:validate", {
  cwd: BACKEND,
  env: deployEnv,
  stdio: "inherit",
});

run("G304 — prisma generate", "npm run prisma:generate", {
  cwd: BACKEND,
  env: deployEnv,
  stdio: "inherit",
});

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "g304-docker-sim-"));
try {
  const appDir = path.join(tempRoot, "app");
  fs.mkdirSync(appDir, { recursive: true });

  for (const file of ["package.json", "package-lock.json", "prisma.config.ts"]) {
    fs.copyFileSync(path.join(BACKEND, file), path.join(appDir, file));
  }
  fs.cpSync(path.join(BACKEND, "prisma"), path.join(appDir, "prisma"), { recursive: true });
  fs.cpSync(path.join(BACKEND, "src"), path.join(appDir, "src"), { recursive: true });
  fs.cpSync(path.join(BACKEND, "scripts"), path.join(appDir, "scripts"), { recursive: true });
  fs.cpSync(path.join(BACKEND, "config"), path.join(appDir, "config"), { recursive: true });

  run("G304 — docker sim npm ci", "npm ci --omit=dev", {
    cwd: appDir,
    env: deployEnv,
    stdio: "inherit",
  });

  run("G304 — docker sim prisma generate", "npm run prisma:generate", {
    cwd: appDir,
    env: deployEnv,
    stdio: "inherit",
  });

  gate(
    "G304 — docker sim entrypoint exists",
    fs.existsSync(path.join(appDir, "src/server.js"))
  );
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

const failed = results.filter((item) => !item.ok);
if (failed.length > 0) {
  console.error(`\nGate G304 FAILED — ${failed.length}/${results.length} checks`);
  process.exit(1);
}

console.log(`\nGate G304 PASSED — ${results.length}/${results.length} checks`);
