#!/usr/bin/env node
/**
 * Gate G401+G402 — Deploy Pipeline Validation (Program 2.3.X.1 / D-062 renumber)
 * Runs backend bootstrap (G401) and Railway Docker build (G402).
 */
import { execSync } from "node:child_process";

const run = (label, command) => {
  console.log(`\n=== ${label} ===`);
  execSync(command, { stdio: "inherit" });
};

try {
  run("G401 — Backend Bootstrap", "npm run gate:backend-bootstrap");
  run("G402 — Railway Docker Build", "npm run gate:railway-docker");
  console.log("\nDeploy pipeline gates G401+G402 PASSED");
} catch {
  console.error("\nDeploy pipeline gates FAILED");
  process.exit(1);
}
