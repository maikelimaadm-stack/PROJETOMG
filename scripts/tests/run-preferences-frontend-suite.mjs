#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testsDir = __dirname;

const tests = [
  "user-preferences-scope.unit.mjs",
  "preferences-storage.unit.mjs",
  "empresas-bootstrap.unit.mjs",
  "emp-column-layout.unit.mjs",
  "emp-table-catalog-expand.unit.mjs",
  "emp-table-frozen-prefs.unit.mjs",
  "mak-user-preferences-cache.unit.mjs",
  "mak-placeholder-actions.unit.mjs",
  "mak-module-contract.unit.mjs",
  "mak-list-filters-routes.unit.mjs",
  "ensure-mak-prototype-styles.unit.mjs",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

for (const testFile of tests) {
  const testPath = path.join(testsDir, testFile);
  const result = spawnSync("npx", ["vite-node", testPath], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  await sleep(500);
}

console.log("OK: preferences frontend suite");
