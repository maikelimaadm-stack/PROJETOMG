#!/usr/bin/env node
/**
 * Gate G303+G304 — Deploy Pipeline Validation (Program 2.3.X.1)
 * Runs backend bootstrap (G303) and Railway Docker build (G304).
 */
import { execSync } from "node:child_process";

const run = (label, command) => {
  console.log(`\n=== ${label} ===`);
  execSync(command, { stdio: "inherit" });
};

try {
  run("G303 — Backend Bootstrap", "npm run gate:backend-bootstrap");
  run("G304 — Railway Docker Build", "npm run gate:railway-docker");
  console.log("\nDeploy pipeline gates G303+G304 PASSED");
} catch {
  console.error("\nDeploy pipeline gates FAILED");
  process.exit(1);
}
