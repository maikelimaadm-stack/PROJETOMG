#!/usr/bin/env node
/**
 * TYPECHECK GOVERNANCE — PONTE PERMISSIVA TEMPORÁRIA (P1-02A)
 *
 * Este wrapper executa o typecheck de PRODUÇÃO — o mesmo `jsconfig.typecheck.json`
 * que `npm run typecheck` usa — e hoje ainda devolve 0 mesmo com diagnósticos.
 *
 * ISSO É UM BYPASS CONHECIDO, NÃO UM ESTADO DESEJADO.
 * Rastreado como bloqueador de P1-02B, que substituirá esta ponte por comparação
 * fail-closed contra uma baseline exata. Enquanto ela existir, o step de typecheck
 * do CI NÃO reprova código novo.
 *
 * O que mudou em P1-02A: a mensagem parou de mentir. A versão anterior atribuía
 * QUALQUER falha ao "TD-009 — documented shadcn/ui noise". A medição em
 * 14de11106af834c1fd627c247490aac87c6452b3 refutou isso: dos 3745 diagnósticos do
 * escopo legado, apenas 316 estavam em `src/shared/ui/**` — 8,4%. O restante era
 * dívida real espalhada por runtime, framework, studio, bos, intelligence, modules,
 * apis e ferramentas Node.
 *
 * Agora o wrapper relata o número real de diagnósticos e a natureza da dívida, sem
 * atribuí-la a uma causa que não a explica.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCTION_PROJECT = "./jsconfig.typecheck.json";

const result = spawnSync("npx", ["tsc", "-p", PRODUCTION_PROJECT, "--pretty", "false"], {
  cwd: ROOT,
  encoding: "utf8",
  shell: false,
});

if (result.error) {
  console.error(`\n[FAIL] Não foi possível executar o typecheck: ${result.error.message}`);
  process.exit(1);
}
if (result.signal) {
  console.error(`\n[FAIL] Typecheck terminou por sinal ${result.signal}.`);
  process.exit(1);
}

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
process.stdout.write(output);

if (result.status === 0) {
  console.log("\n[OK] Typecheck de produção — nenhum diagnóstico.");
  console.log("[INFO] Com zero diagnósticos, P1-02B pode adotar baseline vazia e fail-closed imediato.");
  process.exit(0);
}

const diagnostics = output
  .split(/\r?\n/)
  .filter((line) => /^[^\s].*\(\d+,\d+\): error TS\d+:/.test(line)).length;

console.warn("\n[WARN] LEGACY TYPECHECK DEBT — permissive bridge pending P1-02B.");
console.warn(`[WARN] Escopo de produção (${PRODUCTION_PROJECT}) · exit real do tsc: ${result.status}`);
console.warn(`[WARN] Diagnósticos contados: ${diagnostics}`);
console.warn("[WARN] Esta dívida NÃO é atribuível apenas a src/shared/ui — ver TD-016.");
console.warn("[WARN] Este step ainda NÃO é fail-closed: um diagnóstico NOVO passaria despercebido.");
console.warn("[INFO] Enforcement fail-closed será entregue por P1-02B.");
console.warn("[INFO] Inventário completo, incluindo testes e ferramentas Node: npm run typecheck:legacy-all");
process.exit(0);
