#!/usr/bin/env node
/**
 * Gate G401+G402+G403 — Deploy Pipeline Validation (Program 2.3.X.1 / D-062 renumber)
 * Runs backend bootstrap (G401), Railway Docker build (G402) and lifecycle security
 * isolation (G403, P1-03).
 *
 * G403 entrou aqui porque este é o único agregado de validação de BACKEND que o
 * workflow do CI executa — `gate:capabilities`, onde G324/G325 moram, não é executado.
 * Um backend com IDOR cross-tenant não deve chegar ao deploy.
 */
import { execSync } from "node:child_process";

const run = (label, command) => {
  console.log(`\n=== ${label} ===`);
  execSync(command, { stdio: "inherit" });
};

try {
  run("G401 — Backend Bootstrap", "npm run gate:backend-bootstrap");
  run("G402 — Railway Docker Build", "npm run gate:railway-docker");
  run("G403 — Lifecycle Security Isolation", "npm run gate:lifecycle-security");
  console.log("\nDeploy pipeline gates G401+G402+G403 PASSED");
} catch {
  console.error("\nDeploy pipeline gates FAILED");
  process.exit(1);
}
