#!/usr/bin/env node
/**
 * CAPTURA DA BASELINE DE TYPECHECK DE PRODUÇÃO (P1-02B)
 *
 * Ferramenta MANUAL. Nada no CI a executa, e ela NUNCA é chamada pelo wrapper de
 * governança: uma baseline que se atualiza sozinha não é uma baseline, é um
 * carimbo. A atualização é sempre um ato humano, revisado e versionado.
 *
 * Uso:
 *   node scripts/capture-typecheck-production-baseline.mjs            # dry-run
 *   node scripts/capture-typecheck-production-baseline.mjs --write    # grava
 *
 * Sem `--write` o arquivo NÃO é tocado: a ferramenta apenas relata o que mudaria.
 * O flag é obrigatório e explícito — não há variável de ambiente equivalente.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  BASELINE_REL,
  PRODUCTION_PROJECT,
  buildBaselineDocument,
  compareToBaseline,
  foldToEntries,
  parseTypecheckOutput,
  repositoryRootVariants,
  validateBaseline,
} from "./lib/typecheckGovernance.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Raiz lógica + raiz canônica (symlink), resolvidas UMA vez por execução.
const ROOTS = repositoryRootVariants(ROOT);
const WRITE = process.argv.slice(2).includes("--write");

const unknownFlags = process.argv.slice(2).filter((a) => a !== "--write");
if (unknownFlags.length > 0) {
  console.error(`[FAIL] argumento não reconhecido: ${unknownFlags.join(", ")}`);
  process.exit(1);
}

const run = spawnSync("npx", ["tsc", "-p", PRODUCTION_PROJECT, "--pretty", "false"], {
  cwd: ROOT,
  encoding: "utf8",
  shell: false,
  maxBuffer: 256 * 1024 * 1024,
});

if (run.error) {
  console.error(`[FAIL] não foi possível executar o tsc: ${run.error.message}`);
  process.exit(1);
}
if (run.signal) {
  console.error(`[FAIL] tsc terminou por sinal ${run.signal}.`);
  process.exit(1);
}

let entries;
try {
  entries = foldToEntries(
    parseTypecheckOutput(`${run.stdout ?? ""}${run.stderr ?? ""}`, {
      root: ROOTS,
      status: run.status,
    }).diagnostics,
  );
} catch (err) {
  console.error(`[FAIL] ${err.message}`);
  process.exit(1);
}

const document = buildBaselineDocument(entries);
const validation = validateBaseline(document, { root: ROOT, roots: ROOTS, checkFilesExist: true });
if (!validation.ok) {
  console.error("[FAIL] a baseline capturada não passa na própria validação:");
  for (const e of validation.errors) console.error(`  - ${e}`);
  process.exit(1);
}

const abs = path.join(ROOT, BASELINE_REL);
const serialized = `${JSON.stringify(document, null, 2)}\n`;

console.log(`[INFO] projeto ......... ${PRODUCTION_PROJECT}`);
console.log(`[INFO] exit do tsc ..... ${run.status}`);
console.log(`[INFO] diagnósticos .... ${document.totalDiagnostics}`);
console.log(`[INFO] arquivos ........ ${document.totalFiles}`);
console.log(`[INFO] fingerprints .... ${document.entries.length}`);

if (fs.existsSync(abs)) {
  try {
    const previous = JSON.parse(fs.readFileSync(abs, "utf8"));
    if (Array.isArray(previous.entries)) {
      const delta = compareToBaseline(entries, previous);
      console.log(
        `[INFO] delta ........... novos ${delta.added.length} · aumentados ${delta.increased.length} ` +
          `· desaparecidos ${delta.missing.length} · reduzidos ${delta.decreased.length}`,
      );
    }
  } catch {
    console.log("[INFO] baseline anterior ilegível — nenhum delta calculado.");
  }
}

if (!WRITE) {
  console.log(`\n[DRY-RUN] nada foi gravado. Para gravar: --write`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(abs), { recursive: true });
fs.writeFileSync(abs, serialized);
console.log(`\n[OK] baseline gravada em ${BASELINE_REL}`);
