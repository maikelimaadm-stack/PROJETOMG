#!/usr/bin/env node
/**
 * Executa N ciclos completos de certificação Formula Engine V17.
 */
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const cyclesArg = args.find((a) => a.startsWith("--cycles="));
const cycles = cyclesArg ? Number(cyclesArg.split("=")[1]) : 5;

const run = (label, command, cmdArgs = []) => {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(command, cmdArgs, { stdio: "inherit", shell: false });
  if (result.status !== 0) {
    console.error(`\n[FALHA] ${label} (exit ${result.status})`);
    process.exit(result.status ?? 1);
  }
  console.log(`[OK] ${label}`);
};

console.log(`Enterprise V17 — ${cycles} ciclos de certificação formula\n`);

for (let i = 1; i <= cycles; i += 1) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`CICLO ${i}/${cycles}`);
  console.log("=".repeat(60));

  run(`Ciclo ${i} — build`, "npm", ["run", "build"]);
  run(`Ciclo ${i} — lint`, "npm", ["run", "lint"]);
  run(`Ciclo ${i} — gate:formula-config-engine-v17`, "npm", ["run", "gate:formula-config-engine-v17"]);
  run(`Ciclo ${i} — gate:validation-config-engine-v16`, "npm", ["run", "gate:validation-config-engine-v16"]);
  run(`Ciclo ${i} — gate:governance`, "npm", ["run", "gate:governance"]);
}

console.log(`\n${"=".repeat(60)}`);
console.log(`✓ ${cycles} ciclos completos — Formula Engine estável`);
console.log("=".repeat(60));
