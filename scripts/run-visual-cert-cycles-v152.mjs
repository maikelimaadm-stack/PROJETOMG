#!/usr/bin/env node
/**
 * Executa N ciclos completos de certificação visual V15.2.
 * Uso: node scripts/run-visual-cert-cycles-v152.mjs [--cycles=5]
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

console.log(`Enterprise V15.2 — ${cycles} ciclos de certificação visual\n`);

for (let i = 1; i <= cycles; i += 1) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`CICLO ${i}/${cycles}`);
  console.log("=".repeat(60));

  run(`Ciclo ${i} — build`, "npm", ["run", "build"]);
  run(`Ciclo ${i} — lint`, "npm", ["run", "lint"]);
  run(`Ciclo ${i} — gate:modelobase1-visual-cert-v152`, "npm", [
    "run",
    "gate:modelobase1-visual-cert-v152",
  ]);
  run(`Ciclo ${i} — gate:modelobase1-consolidation-v151`, "npm", [
    "run",
    "gate:modelobase1-consolidation-v151",
  ]);
  run(`Ciclo ${i} — gate:paridade-visual`, "npm", ["run", "gate:paridade-visual"]);
}

console.log(`\n${"=".repeat(60)}`);
console.log(`✓ ${cycles} ciclos completos — certificação visual V15.2 estável`);
console.log("=".repeat(60));
