#!/usr/bin/env node
/**
 * TYPECHECK GOVERNANCE — ENFORCEMENT FAIL-CLOSED (P1-02B)
 *
 * Este wrapper executa o typecheck de PRODUÇÃO — o mesmo `jsconfig.typecheck.json`
 * que `npm run typecheck` verifica — e compara o resultado contra a baseline exata
 * registrada em `config/typecheck-production-baseline.json`.
 *
 * ------------------------------------------------------------------------
 * HISTÓRIA — por que este arquivo existe nesta forma
 * ------------------------------------------------------------------------
 * Até P1-02A este wrapper devolvia 0 diante de QUALQUER erro, atribuindo a falha a
 * "TD-009 — documented shadcn/ui noise". A medição refutou a atribuição: dos 3745
 * diagnósticos do escopo legado, apenas 316 estavam em `src/shared/ui/**` — 8,4%.
 * P1-02A separou o escopo de produção do escopo de testes e passou a relatar o
 * número real, mas manteve deliberadamente o `process.exit(0)`, registrado como
 * KNOWN_P1_02B_BLOCKER.
 *
 * P1-02B remove esse bloqueador. O bypass ACABOU: a partir daqui um diagnóstico
 * novo reprova o CI.
 *
 * ------------------------------------------------------------------------
 * O QUE REPROVA
 * ------------------------------------------------------------------------
 * - diagnóstico ausente da baseline, ou mais ocorrências que o registrado
 * - diagnóstico registrado que sumiu, ou menos ocorrências que o registrado
 * - `tsc` verde com baseline não vazia
 * - baseline ausente, malformada, com fingerprint duplicado, com caminho absoluto,
 *   com caminho fora do escopo de produção, ou apontando arquivo inexistente
 * - falha de spawn, término por sinal, status nulo, saída não parseável
 * - qualquer exceção interna deste script
 *
 * Não existe caminho de código que devolva 0 sem que a comparação tenha rodado e
 * batido exatamente. Não há bypass por variável de ambiente nem por nome de branch,
 * e este script NUNCA regrava a baseline — isso é `npm run typecheck:baseline:capture`,
 * manual, com `--write` explícito, num commit revisável.
 *
 * A dívida legada de 2365 diagnósticos NÃO é corrigida aqui; ela é CONGELADA e
 * rastreada como TD-016. Congelar não é esconder: a baseline é legível, versionada
 * e só encolhe por decisão consciente.
 */
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  BASELINE_REL,
  PRODUCTION_PROJECT,
  compareToBaseline,
  foldToEntries,
  parseTypecheckOutput,
  readBaselineFile,
  validateBaseline,
} from "./lib/typecheckGovernance.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CAPTURE_HINT = "npm run typecheck:baseline:capture -- --write";

/** Único ponto de saída em falha. Nenhum caller decide sozinho o código de saída. */
function fail(headline, details = []) {
  console.error(`\n[FAIL] ${headline}`);
  for (const line of details) console.error(`  ${line}`);
  console.error(`\n[FAIL] Typecheck governance: REPROVADO (fail-closed).`);
  process.exit(1);
}

function listar(rotulo, itens, limite = 25) {
  if (itens.length === 0) return [];
  const out = [`${rotulo} (${itens.length}):`];
  for (const e of itens.slice(0, limite)) {
    const conta =
      e.baselineCount === undefined ? `x${e.count}` : `x${e.count} (baseline x${e.baselineCount})`;
    out.push(`  - ${e.path} ${e.code} ${conta}`);
    out.push(`      ${e.message}`);
  }
  if (itens.length > limite) out.push(`  ... e mais ${itens.length - limite}`);
  return out;
}

function main() {
  console.log(`[INFO] Projeto de produção: ${PRODUCTION_PROJECT}`);
  console.log(`[INFO] Baseline: ${BASELINE_REL}`);

  let baseline;
  try {
    baseline = readBaselineFile(ROOT);
  } catch (err) {
    fail(err.message, [
      "Uma baseline ausente ou ilegível NÃO é tratada como baseline vazia.",
      `Para (re)gerar conscientemente: ${CAPTURE_HINT}`,
    ]);
  }

  const validation = validateBaseline(baseline, { root: ROOT, checkFilesExist: true });
  if (!validation.ok) {
    fail(`baseline inválida (${BASELINE_REL}):`, validation.errors.map((e) => `- ${e}`));
  }

  const run = spawnSync("npx", ["tsc", "-p", PRODUCTION_PROJECT, "--pretty", "false"], {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
    maxBuffer: 256 * 1024 * 1024,
  });

  if (run.error) fail(`não foi possível executar o typecheck: ${run.error.message}`);
  if (run.signal) fail(`o typecheck terminou por sinal ${run.signal}.`);
  if (run.status === null) fail("o typecheck terminou sem código de saída.");

  const output = `${run.stdout ?? ""}${run.stderr ?? ""}`;

  if (run.status === 0) {
    if (baseline.entries.length === 0) {
      console.log("\n[OK] Typecheck de produção limpo, e a baseline está vazia. Contrato satisfeito.");
      process.exit(0);
    }
    fail("o tsc não reportou diagnóstico algum, mas a baseline registra dívida.", [
      `Registrados: ${baseline.totalDiagnostics} diagnósticos em ${baseline.totalFiles} arquivos.`,
      "Isto é uma BASELINE STALE: a dívida melhorou e ninguém registrou a melhora.",
      `Revise e regrave conscientemente: ${CAPTURE_HINT}`,
    ]);
  }

  let entries;
  try {
    entries = foldToEntries(parseTypecheckOutput(output, { root: ROOT }).diagnostics);
  } catch (err) {
    process.stdout.write(output);
    fail(err.message, [
      "Saída não compreendida integralmente é tratada como falha, nunca como ausência de erro.",
    ]);
  }

  const total = entries.reduce((n, e) => n + e.count, 0);
  const files = new Set(entries.map((e) => e.path)).size;
  console.log(`[INFO] Medido agora: ${total} diagnósticos em ${files} arquivos.`);
  console.log(
    `[INFO] Baseline: ${baseline.totalDiagnostics} diagnósticos em ${baseline.totalFiles} arquivos.`,
  );

  const delta = compareToBaseline(entries, baseline);

  if (!delta.ok) {
    const regressao = delta.added.length + delta.increased.length;
    const stale = delta.missing.length + delta.decreased.length;
    fail(
      regressao > 0
        ? "REGRESSÃO DE TIPOS: há diagnóstico de produção fora da baseline."
        : "BASELINE STALE: a dívida registrada não corresponde mais à realidade.",
      [
        ...listar("NOVOS — não existiam na baseline", delta.added),
        ...listar("AUMENTADOS — mais ocorrências que o registrado", delta.increased),
        ...listar("DESAPARECIDOS — registrados e não mais reproduzidos", delta.missing),
        ...listar("REDUZIDOS — menos ocorrências que o registrado", delta.decreased),
        "",
        regressao > 0
          ? "Corrija o código. A baseline NÃO deve crescer para acomodar código novo."
          : `A dívida diminuiu — boa notícia que exige registro consciente: ${CAPTURE_HINT}`,
      ],
    );
  }

  console.log("\n[OK] Typecheck governance: nenhum diagnóstico fora da baseline registrada.");
  console.log(`[INFO] Dívida legada congelada: ${baseline.totalDiagnostics} diagnósticos — ver TD-016.`);
  console.log("[INFO] Inventário completo, incluindo testes e ferramentas Node: npm run typecheck:legacy-all");
  process.exit(0);
}

try {
  main();
} catch (err) {
  fail(`exceção interna do enforcement: ${err?.stack ?? err}`);
}
