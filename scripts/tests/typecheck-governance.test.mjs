/**
 * CONTRATO DO TYPECHECK GOVERNANCE FAIL-CLOSED — P1-02B
 *
 * O que este arquivo prova, em 25 asserções:
 *
 *   T01–T06  o parsing entende a saída do `tsc` INTEIRA, ou falha
 *   T07–T10  o fingerprint ignora posição e a dobra é determinística
 *   T11–T18  a validação da baseline reprova toda forma não íntegra
 *   T19–T22  a comparação reprova nos DOIS sentidos: regressão e baseline stale
 *   T23      a baseline versionada no repositório é válida e íntegra
 *   T24      o wrapper não contém bypass algum, e nunca regrava a baseline
 *   T25      prova COMPORTAMENTAL: o wrapper reprova de fato, e aprova de fato
 *
 * T25 mexe temporariamente no arquivo de baseline. A restauração acontece em
 * `after()` e é reconferida byte a byte por uma asserção final, de modo que uma
 * falha no meio do caminho não pode deixar o repositório sujo em silêncio.
 */
import test, { after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  BASELINE_REL,
  PRODUCTION_PROJECT,
  SCHEMA_VERSION,
  buildBaselineDocument,
  compareEntries,
  compareToBaseline,
  fingerprintOf,
  foldToEntries,
  hasAbsolutePathInMessage,
  normalizeMessage,
  normalizePath,
  parseTypecheckOutput,
  validateBaseline,
} from "../lib/typecheckGovernance.mjs";

const LIB_REL = "scripts/lib/typecheckGovernance.mjs";
const LIB_URL = new URL("../lib/typecheckGovernance.mjs", import.meta.url).href;

/** O par real que expôs a dependência de locale na auditoria da PR #505. */
const PAR_LOCALE = Object.freeze([
  "Property 'viewModeKey' does not exist on type '{}'.",
  "Property 'VISIBLE_KEY' does not exist on type '{}'.",
]);

/**
 * Ordena um conjunto de diagnósticos NUM PROCESSO SEPARADO, sob um locale escolhido.
 *
 * A prova de invariância precisa ser comportamental: rodar o código de PRODUÇÃO com
 * `LC_ALL` diferente e exigir o mesmo resultado. Uma asserção que chamasse
 * `localeCompare` com locale fixo dentro do teste não provaria nada sobre a biblioteca.
 * O filho também devolve o locale que o ICU de fato resolveu, para que o teste falhe em
 * vez de passar vazio caso o ambiente ignore `LC_ALL`.
 */
function ordenarSobLocale(locale, diagnosticos) {
  const codigo =
    `import(${JSON.stringify(LIB_URL)}).then((m) => {` +
    `const e = m.foldToEntries(${JSON.stringify(diagnosticos)});` +
    `process.stdout.write(JSON.stringify({` +
    `locale: Intl.Collator().resolvedOptions().locale,` +
    `ordem: e.map((x) => x.path + "|" + x.code + "|" + x.message),` +
    `}));});`;
  const r = spawnSync("node", ["-e", codigo], {
    encoding: "utf8",
    shell: false,
    env: { ...process.env, LC_ALL: locale, LANG: locale, LANGUAGE: locale },
  });
  assert.equal(r.status, 0, `processo filho falhou sob ${locale}: ${r.stderr}`);
  return JSON.parse(r.stdout);
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BASELINE_ABS = path.join(ROOT, BASELINE_REL);
const WRAPPER_REL = "scripts/run-typecheck-governance.mjs";
const CAPTURE_REL = "scripts/capture-typecheck-production-baseline.mjs";

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

/**
 * Remove comentários antes de qualquer varredura estrutural.
 *
 * Sem isto, toda asserção de higiene se auto-falsifica: estes arquivos CITAM o
 * bypass removido e o `process.exit(0)` de P1-02A justamente para documentar que
 * acabaram, e uma busca textual confundiria a citação com o uso. O que interessa
 * é o CÓDIGO. Nenhum dos arquivos varridos tem `//` dentro de string ou regex,
 * e T24 confere que a remoção tirou prosa sem levar código junto.
 */
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

/** Um diagnóstico sintético, sempre com a mesma forma. */
const diag = (over = {}) => ({
  path: "src/x/a.js",
  line: 10,
  column: 5,
  code: "TS2339",
  message: "Property 'a' does not exist on type 'B'.",
  ...over,
});

/** Uma baseline sintética mínima e válida. */
const baselineOf = (...entries) => buildBaselineDocument(foldToEntries(entries));

// ===========================================================================
// T01–T06 — PARSING: entender tudo, ou falhar
// ===========================================================================

test("T01 o cabeçalho de diagnóstico é decomposto em path, posição, código e mensagem", () => {
  const { diagnostics } = parseTypecheckOutput(
    "src/apis/auth/AuthApi.js(26,48): error TS2339: Property 'body' does not exist on type '{}'.",
  );
  assert.equal(diagnostics.length, 1);
  assert.deepEqual(diagnostics[0], {
    path: "src/apis/auth/AuthApi.js",
    line: 26,
    column: 48,
    code: "TS2339",
    message: "Property 'body' does not exist on type '{}'.",
  });
});

test("T02 linhas de continuação entram na mensagem do diagnóstico dono", () => {
  const { diagnostics } = parseTypecheckOutput(
    [
      "src/a.jsx(15,10): error TS2322: Type 'X' is not assignable to type 'Y'.",
      "  Property 'children' does not exist on type 'Z'.",
      "src/b.jsx(1,1): error TS2304: Cannot find name 'process'.",
    ].join("\n"),
  );
  assert.equal(diagnostics.length, 2);
  assert.equal(
    diagnostics[0].message,
    "Type 'X' is not assignable to type 'Y'. Property 'children' does not exist on type 'Z'.",
  );
  assert.equal(diagnostics[1].message, "Cannot find name 'process'.");
});

test("T03 normalização colapsa espaço em branco e relativiza o caminho, sem apagar conteúdo", () => {
  assert.equal(normalizeMessage("  Type   'A'\n  is not\t'B'.  "), "Type 'A' is not 'B'.");
  assert.equal(normalizePath("./src/a.js"), "src/a.js");
  assert.equal(normalizePath("src\\a.js"), "src/a.js");
  // Nada de aspas, tipos ou números é removido — a mensagem é parte da identidade.
  assert.equal(normalizeMessage("Property '2' on type '{ a: 1 }'."), "Property '2' on type '{ a: 1 }'.");

  // A raiz do repositório sai SOMENTE em fronteira de caminho. A versão anterior a
  // removia como substring arbitrária, e por isso `Property '<raiz>' missing.` colapsava
  // em `Property '' missing.`, podendo colidir com outra mensagem.
  const R = "/home/user/PROJETOMG";
  assert.equal(normalizeMessage(`Namespace '"${R}/src/a"' x.`, R), `Namespace '"src/a"' x.`);
  assert.equal(normalizeMessage(`Namespace '"${R}/src/a"' x.`, `${R}/`), `Namespace '"src/a"' x.`);
  assert.equal(normalizeMessage(`A '${R}/x' e B '${R}/y'.`, R), "A 'x' e B 'y'.");
  // Raiz NUA não é removida: sobra caminho absoluto, e a detecção reprova — diagnosticável.
  const nua = normalizeMessage(`Property '${R}' missing.`, R);
  assert.equal(nua, `Property '${R}' missing.`, "a raiz nua não pode virar string vazia");
  assert.equal(hasAbsolutePathInMessage(nua), true, "raiz nua remanescente precisa reprovar");
  // Raiz que é apenas PREFIXO de outra pasta, ou colada a outro token, não é removida.
  assert.equal(normalizeMessage(`A '${R}-outro/src/a' B.`, R), `A '${R}-outro/src/a' B.`);
  assert.equal(normalizeMessage(`X '/prefixo${R}/src/a' Y.`, R), `X '/prefixo${R}/src/a' Y.`);
  // Idempotente: a validação re-normaliza a mensagem já gravada.
  const uma = normalizeMessage(`Namespace '"${R}/src/a"' x.`, R);
  assert.equal(uma, normalizeMessage(uma, R));
  // Aceita lista de raízes (forma lógica + realpath do checkout).
  assert.equal(normalizeMessage(`'${R}/src/a'`, ["/outra/raiz", R]), "'src/a'");
});

test("T04 uma linha não classificável faz o parsing falhar, nunca ser ignorada", () => {
  assert.throws(
    () =>
      parseTypecheckOutput(
        ["src/a.js(1,1): error TS2304: Cannot find name 'x'.", "algo inesperado do compilador"].join("\n"),
      ),
    /não classificável/,
  );
  // Continuação sem dono também reprova.
  assert.throws(() => parseTypecheckOutput("  continuação órfã"), /continuação sem diagnóstico dono/);
});

test("T05 divergência entre cabeçalhos e ocorrências de 'error TS' faz o parsing falhar", () => {
  // A continuação carrega um token de erro que nenhum cabeçalho representa.
  assert.throws(
    () =>
      parseTypecheckOutput(
        [
          "src/a.js(1,1): error TS2304: Cannot find name 'x'.",
          "  vinda de outro error TS9999: contrabandeado",
        ].join("\n"),
      ),
    /conferência de parsing/,
  );
});

test("T06 o sumário e o status do tsc são conferidos contra o total parseado", () => {
  const ok = parseTypecheckOutput(
    ["src/a.js(1,1): error TS2304: Cannot find name 'x'.", "Found 1 error in 1 file."].join("\n"),
  );
  assert.equal(ok.diagnostics.length, 1);
  assert.throws(
    () =>
      parseTypecheckOutput(
        ["src/a.js(1,1): error TS2304: Cannot find name 'x'.", "Found 7 errors in 3 files."].join("\n"),
      ),
    /o tsc declarou 7 erros/,
  );

  // Status anômalo: o tsc falhou e nenhum diagnóstico foi entendido. Ler isso como
  // "nenhum erro" seria falso verde — inclusive com a baseline vazia, que é o único
  // estado em que a comparação aprovaria sem nada para comparar.
  assert.throws(() => parseTypecheckOutput("", { status: 2 }), /status 2 e nenhum diagn/);
  assert.throws(() => parseTypecheckOutput("\n\n", { status: 1 }), /nenhum diagn/);
  // E os dois casos legítimos seguem passando.
  assert.equal(parseTypecheckOutput("", { status: 0 }).diagnostics.length, 0);
  assert.equal(
    parseTypecheckOutput("src/a.js(1,1): error TS2304: Cannot find name 'x'.", { status: 2 })
      .diagnostics.length,
    1,
  );
});

// ===========================================================================
// T07–T10 — FINGERPRINT E DOBRA
// ===========================================================================

test("T07 o fingerprint ignora linha e coluna", () => {
  assert.equal(fingerprintOf(diag({ line: 1, column: 1 })), fingerprintOf(diag({ line: 999, column: 42 })));
  assert.notEqual(fingerprintOf(diag()), fingerprintOf(diag({ code: "TS2322" })));
  assert.notEqual(fingerprintOf(diag()), fingerprintOf(diag({ path: "src/x/b.js" })));
});

test("T08 ocorrências repetidas do mesmo fingerprint viram contagem, com evidência posicional", () => {
  const entries = foldToEntries([
    diag({ line: 4, column: 35 }),
    diag({ line: 4, column: 58 }),
    diag({ line: 9, column: 2 }),
  ]);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].count, 3);
  assert.equal(entries[0].evidence, "4:35 4:58 9:2");
});

test("T09 mensagens distintas são fingerprints distintos, mesmo com path e código iguais", () => {
  const entries = foldToEntries([diag(), diag({ message: "Property 'b' does not exist on type 'B'." })]);
  assert.equal(entries.length, 2);
  assert.deepEqual(
    entries.map((e) => e.count),
    [1, 1],
  );
});

test("T10 a ordenação de entradas e de evidências é determinística", () => {
  const shuffled = foldToEntries([
    diag({ path: "src/z.js", line: 9, column: 9 }),
    diag({ path: "src/a.js", code: "TS2322", message: "Zeta." }),
    diag({ path: "src/a.js", code: "TS2322", message: "Alfa." }),
    diag({ path: "src/a.js", line: 2, column: 1 }),
  ]);
  assert.deepEqual(
    shuffled.map((e) => `${e.path}|${e.code}|${e.message}`),
    [
      "src/a.js|TS2322|Alfa.",
      "src/a.js|TS2322|Zeta.",
      "src/a.js|TS2339|Property 'a' does not exist on type 'B'.",
      "src/z.js|TS2339|Property 'a' does not exist on type 'B'.",
    ],
  );
  assert.equal(foldToEntries([diag({ line: 20 }), diag({ line: 3 })])[0].evidence, "3:5 20:5");

  // ---------------------------------------------------------------------
  // INVARIÂNCIA POR LOCALE — o bloqueador que a auditoria da PR #505 encontrou.
  //
  // A ordem era decidida por `localeCompare`, cuja collation depende do locale do
  // processo. Com o par real abaixo, en-US e tr-TR discordam do SINAL da comparação, e
  // a baseline gravada numa máquina passava a ser recusada noutra como "fora da
  // ordenação determinística" — sem que uma linha tivesse mudado.
  // ---------------------------------------------------------------------
  const [viewModeKey, VISIBLE_KEY] = PAR_LOCALE;
  const parEmbaralhado = [
    diag({ path: "src/p.js", message: viewModeKey }),
    diag({ path: "src/p.js", message: VISIBLE_KEY }),
  ];

  // Por unidades de código, 'V' (U+0056) antecede 'v' (U+0076). Sem ambiguidade.
  assert.equal(
    compareEntries({ path: "p", code: "TS1", message: viewModeKey },
      { path: "p", code: "TS1", message: VISIBLE_KEY }),
    1,
  );
  assert.deepEqual(
    foldToEntries(parEmbaralhado).map((e) => e.message),
    [VISIBLE_KEY, viewModeKey],
  );

  // Prova COMPORTAMENTAL: o código de produção, rodado em processos com locales
  // diferentes, produz exatamente a mesma ordem.
  const conjunto = [
    ...parEmbaralhado,
    diag({ path: "src/A.js" }),
    diag({ path: "src/a.js" }),
    diag({ path: "src/i.js", message: "Property 'I' does not exist on type '{}'." }),
    diag({ path: "src/I.js", message: "Property 'i' does not exist on type '{}'." }),
  ];
  const enUS = ordenarSobLocale("en_US.UTF-8", conjunto);
  const trTR = ordenarSobLocale("tr_TR.UTF-8", conjunto);
  const cLoc = ordenarSobLocale("C", conjunto);

  // Se o ambiente ignorasse LC_ALL, esta prova seria vazia — então ela é verificada.
  assert.notEqual(enUS.locale, trTR.locale,
    `LC_ALL não foi honrado: ambos resolveram ${enUS.locale}; a prova seria vazia`);
  assert.match(trTR.locale, /^tr\b/, `esperado locale turco no filho, veio ${trTR.locale}`);

  assert.deepEqual(trTR.ordem, enUS.ordem, "a ordem mudou entre tr-TR e en-US");
  assert.deepEqual(cLoc.ordem, enUS.ordem, "a ordem mudou entre C e en-US");
  assert.deepEqual(enUS.ordem, foldToEntries(conjunto).map((e) => `${e.path}|${e.code}|${e.message}`));
});

// ===========================================================================
// T11–T18 — VALIDAÇÃO DA BASELINE
// ===========================================================================

test("T11 um documento recém-construído é válido e declara a natureza do fingerprint", () => {
  const doc = baselineOf(diag(), diag({ line: 2 }), diag({ path: "src/x/b.js" }));
  assert.equal(validateBaseline(doc).ok, true);
  assert.equal(doc.schemaVersion, SCHEMA_VERSION);
  assert.equal(doc.project, PRODUCTION_PROJECT);
  assert.equal(doc.positionalEvidenceIsAuthoritative, false);
  assert.equal(doc.totalDiagnostics, 3);
  assert.equal(doc.totalFiles, 2);
});

test("T12 schemaVersion diferente reprova", () => {
  const doc = { ...baselineOf(diag()), schemaVersion: SCHEMA_VERSION + 1 };
  const r = validateBaseline(doc);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /schemaVersion/.test(e)));
});

test("T13 project diferente do escopo de produção reprova", () => {
  const r = validateBaseline({ ...baselineOf(diag()), project: "./jsconfig.json" });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /project inesperado/.test(e)));
});

test("T14 fingerprint duplicado reprova", () => {
  const doc = baselineOf(diag());
  doc.entries.push({ ...doc.entries[0] });
  doc.totalDiagnostics = 2;
  const r = validateBaseline(doc);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /fingerprint duplicado/.test(e)));
});

test("T15 caminho absoluto, escapada de raiz e curinga reprovam — no path E na mensagem", () => {
  // A MENSAGEM também é caminho. Diagnósticos como TS2694 embutem o caminho ABSOLUTO
  // do arquivo dentro do texto, e como a mensagem é parte do fingerprint isso tornaria a
  // baseline dependente da máquina: a mesma árvore, verificada em outro diretório,
  // produziria outro fingerprint e o enforcement acusaria regressão sem que nada tivesse
  // mudado. Foi exatamente o que a primeira execução de CI desta fatia expôs.
  const raiz = "/home/user/PROJETOMG";
  const bruta = `Namespace '"${raiz}/src/runtime/types/context"' has no exported member 'X'.`;
  assert.equal(hasAbsolutePathInMessage(bruta), true, "o detector não vê o caminho absoluto");
  assert.equal(
    normalizeMessage(bruta, raiz),
    `Namespace '"src/runtime/types/context"' has no exported member 'X'.`,
  );
  assert.equal(hasAbsolutePathInMessage(normalizeMessage(bruta, raiz)), false);

  // E caminhos RELATIVOS legítimos, que aparecem em mensagens reais do tsc, jamais
  // podem ser confundidos com absolutos.
  // O detector é GENÉRICO: absoluto é absoluto, seja qual for o nome da primeira pasta.
  // O desenho anterior usava allowlist de raízes Unix e não via /usr, /workspaces
  // (Codespaces), /builds (GitLab), /github/workspace, /data, /app nem /checkout.
  for (const abs of [
    "/usr/lib/node_modules/typescript/lib/lib.dom.d.ts",
    "/workspaces/PROJETOMG/src/a.js",
    "/builds/grupo/proj/src/a.js",
    "/github/workspace/src/a.js",
    "/data/proj/src/a.js",
    "/app/src/a.js",
    "/checkout/src/a.js",
    "/home/user/x/a.js",
    "/Users/ana/x/a.js",
    "/opt/build/x/a.js",
    "/nfs/qualquer/raiz/nova/a.js",
    "C:/proj/x/a.js",
    "C:\\proj\\x\\a.js",
    "D:\\x\\y\\z",
  ]) {
    assert.equal(hasAbsolutePathInMessage(`Namespace '"${abs}"' has no exported member 'X'.`),
      true, `não detectou absoluto: ${abs}`);
  }
  assert.equal(hasAbsolutePathInMessage("\\\\servidor\\compartilhamento\\x.ts"), true, "UNC");
  assert.equal(hasAbsolutePathInMessage("/usr/lib/x/ no início da mensagem"), true, "início da string");

  // E nenhum relativo legítimo pode virar falso positivo.
  for (const ok of [
    "Cannot find module './bosTypes.js' or its corresponding type declarations.",
    "Cannot find module '../../types/context.js' or its corresponding type declarations.",
    "Cannot find module '@/styles/mg-prototype.css' or its corresponding type declarations.",
    "Module './uec.js' has already exported a member named 'AuthCredentials'.",
    "Type 'A/B' is not assignable to type 'C/D'.",
    "Namespace '\"src/runtime/types/context\"' has no exported member 'RuntimeMetricsSnapshot'.",
    "See https://example.com/docs/x for details.",
  ]) {
    assert.equal(hasAbsolutePathInMessage(ok), false, ok);
  }

  // Uma baseline que ainda carregue caminho absoluto na mensagem é INVÁLIDA.
  const suja = baselineOf(diag());
  suja.entries[0].message = bruta;
  const rSuja = validateBaseline(suja);
  assert.equal(rSuja.ok, false);
  assert.ok(rSuja.errors.some((e) => /caminho absoluto/.test(e)), rSuja.errors.join(" | "));

  // E o parsing recusa a saída em vez de gravar um fingerprint dependente de máquina.
  assert.throws(
    () => parseTypecheckOutput(`src/a.js(1,1): error TS2694: ${bruta}`),
    /caminho absoluto após normalização/,
  );

  for (const [p, padrao] of [
    ["/etc/passwd.js", /path absoluto/],
    ["C:/w/a.js", /path absoluto/],
    ["src/../../fora.js", /path escapa da raiz/],
    ["src/**/*.js", /curinga em path/],
  ]) {
    const doc = baselineOf(diag());
    doc.entries[0].path = p;
    const r = validateBaseline(doc);
    assert.equal(r.ok, false, `aceitou path ${p}`);
    assert.ok(r.errors.some((e) => padrao.test(e)), `erro errado para ${p}: ${r.errors.join(" | ")}`);
  }
});

test("T16 caminho fora do escopo de produção reprova — testes têm dono executável próprio", () => {
  const doc = baselineOf(diag({ path: "src/runtime/__tests__/x.test.js" }));
  const r = validateBaseline(doc);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /fora do escopo de produção/.test(e)));
});

test("T17 contagem, evidência e totais inconsistentes reprovam", () => {
  const semEvidencia = baselineOf(diag());
  semEvidencia.entries[0].count = 3;
  assert.ok(validateBaseline(semEvidencia).errors.some((e) => /evidence com 1 posições/.test(e)));

  const totalErrado = baselineOf(diag());
  totalErrado.totalDiagnostics = 99;
  assert.ok(validateBaseline(totalErrado).errors.some((e) => /totalDiagnostics/.test(e)));

  const arquivosErrados = baselineOf(diag());
  arquivosErrados.totalFiles = 99;
  assert.ok(validateBaseline(arquivosErrados).errors.some((e) => /totalFiles/.test(e)));

  const contagemZero = baselineOf(diag());
  contagemZero.entries[0].count = 0;
  assert.ok(validateBaseline(contagemZero).errors.some((e) => /count inválido/.test(e)));
});

test("T18 desordem, chave desconhecida e evidência declarada autoritativa reprovam", () => {
  const desordenada = baselineOf(diag({ path: "src/a.js" }), diag({ path: "src/b.js" }));
  desordenada.entries.reverse();
  assert.ok(validateBaseline(desordenada).errors.some((e) => /ordenação determinística/.test(e)));

  const extra = baselineOf(diag());
  extra.entries[0].suppress = true;
  assert.ok(validateBaseline(extra).errors.some((e) => /chaves desconhecidas/.test(e)));

  const autoritativa = { ...baselineOf(diag()), positionalEvidenceIsAuthoritative: true };
  assert.ok(
    validateBaseline(autoritativa).errors.some((e) => /positionalEvidenceIsAuthoritative/.test(e)),
  );

  for (const naoObjeto of [null, [], "baseline", 7]) {
    assert.equal(validateBaseline(naoObjeto).ok, false);
  }
});

// ===========================================================================
// T19–T22 — COMPARAÇÃO: os dois sentidos reprovam
// ===========================================================================

test("T19 medição idêntica à baseline aprova", () => {
  const entries = foldToEntries([diag(), diag({ line: 2 }), diag({ path: "src/x/b.js" })]);
  const r = compareToBaseline(entries, buildBaselineDocument(entries));
  assert.equal(r.ok, true);
  assert.deepEqual([r.added, r.increased, r.missing, r.decreased].map((a) => a.length), [0, 0, 0, 0]);
});

test("T20 fingerprint novo reprova como regressão", () => {
  const base = baselineOf(diag());
  const agora = foldToEntries([diag(), diag({ path: "src/novo.js", message: "Erro novo." })]);
  const r = compareToBaseline(agora, base);
  assert.equal(r.ok, false);
  assert.equal(r.added.length, 1);
  assert.equal(r.added[0].path, "src/novo.js");
  assert.equal(r.missing.length, 0);
});

test("T21 mais ocorrências do MESMO fingerprint reprovam — a contagem é parte do contrato", () => {
  const base = baselineOf(diag());
  const r = compareToBaseline(foldToEntries([diag(), diag({ line: 77 })]), base);
  assert.equal(r.ok, false);
  assert.equal(r.increased.length, 1);
  assert.equal(r.increased[0].count, 2);
  assert.equal(r.increased[0].baselineCount, 1);
  // E deslocar a posição, sem mudar a contagem, NÃO reprova.
  assert.equal(compareToBaseline(foldToEntries([diag({ line: 900, column: 3 })]), base).ok, true);
});

test("T22 diagnóstico registrado que sumiu, ou que diminuiu, reprova como baseline stale", () => {
  const base = baselineOf(diag(), diag({ line: 2 }), diag({ path: "src/x/b.js" }));

  const sumiu = compareToBaseline(foldToEntries([diag(), diag({ line: 2 })]), base);
  assert.equal(sumiu.ok, false);
  assert.equal(sumiu.missing.length, 1);
  assert.equal(sumiu.missing[0].path, "src/x/b.js");

  const diminuiu = compareToBaseline(foldToEntries([diag(), diag({ path: "src/x/b.js" })]), base);
  assert.equal(diminuiu.ok, false);
  assert.equal(diminuiu.decreased.length, 1);
  assert.equal(diminuiu.decreased[0].baselineCount, 2);
});

// ===========================================================================
// T23–T25 — O ARTEFATO VERSIONADO E O WRAPPER
// ===========================================================================

test("T23 a baseline versionada é válida, íntegra e aponta apenas para arquivos existentes", () => {
  assert.ok(fs.existsSync(BASELINE_ABS), `${BASELINE_REL} não existe`);
  const doc = JSON.parse(fs.readFileSync(BASELINE_ABS, "utf8"));
  const r = validateBaseline(doc, { root: ROOT, checkFilesExist: true });
  assert.deepEqual(r.errors, []);
  assert.equal(r.ok, true);
  assert.ok(doc.entries.length > 0, "baseline vazia não descreve o estado medido do repositório");
  assert.equal(
    doc.totalDiagnostics,
    doc.entries.reduce((n, e) => n + e.count, 0),
  );
});

test("T24 o wrapper não tem bypass, não regrava a baseline e não depende de ambiente nem de branch", () => {
  const wrapper = stripComments(read(WRAPPER_REL));

  // A remoção de comentários precisa ter tirado prosa sem levar código junto.
  assert.ok(!wrapper.includes("KNOWN_P1_02B_BLOCKER"), "a prosa não foi removida");
  assert.ok(wrapper.includes("compareToBaseline("), "a remoção comeu código");

  // Nenhum escape de shell/CI. Os nomes são remontados para que esta asserção não
  // encontre a si mesma ao varrer o próprio arquivo do wrapper.
  for (const proibido of [
    ["continue", "on", "error"].join("-"),
    ["|", "|", " true"].join(""),
    ["set", " +e"].join(""),
  ]) {
    assert.ok(!wrapper.includes(proibido), `o wrapper contém escape proibido: ${proibido}`);
  }

  // Nenhuma escrita: o enforcement lê a baseline, jamais a produz.
  assert.ok(!/writeFileSync|appendFileSync|createWriteStream/.test(wrapper), "o wrapper escreve arquivos");
  assert.ok(!wrapper.includes(CAPTURE_REL), "o wrapper invoca a ferramenta de captura");

  // Nenhum bypass por ambiente ou por branch. A prova é ESTRUTURAL, não textual:
  // uma varredura por palavras como "bypass" acharia a própria documentação do
  // wrapper, que cita o bypass removido justamente para declarar que ele acabou —
  // e confundiria a citação com o uso.
  assert.ok(!/process\.env\b/.test(wrapper), "o wrapper lê variáveis de ambiente");
  assert.ok(!/process\.argv\b/.test(wrapper), "o wrapper aceita flags de linha de comando");
  // O único subprocesso é o tsc sobre o projeto de produção: nada de git, nada de branch.
  const spawns = [...wrapper.matchAll(/spawnSync\(\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(spawns, ["npx"], "o wrapper executa algo além do tsc");
  assert.ok(wrapper.includes('["tsc", "-p", PRODUCTION_PROJECT, "--pretty", "false"]'));

  // Exatamente um `process.exit(0)`, e ele fica depois da comparação bater.
  const zeros = [...wrapper.matchAll(/process\.exit\(0\)/g)].length;
  assert.equal(zeros, 2, "esperados exatamente dois exit(0): baseline vazia + comparação exata");
  assert.ok(/exceção interna do enforcement/.test(wrapper), "exceção interna precisa reprovar");

  // O wrapper precisa entregar o status real ao parser, para que "tsc falhou sem
  // diagnóstico" não possa ser lido como ausência de erros.
  assert.ok(/status:\s*run\.status/.test(wrapper), "o wrapper não confere o status do tsc");

  // Nenhuma ordenação dependente de locale pode voltar à biblioteca do contrato.
  // Segunda camada, estrutural: a prova comportamental está em T10.
  const lib = stripComments(read(LIB_REL));
  assert.ok(lib.includes("compareCodeUnits"), "a remoção de comentários comeu código da lib");
  assert.equal(
    (lib.match(/localeCompare/g) ?? []).length,
    0,
    "localeCompare voltou à lógica da biblioteca de baseline",
  );
  assert.equal((lib.match(/Intl\.Collator/g) ?? []).length, 0, "collation por Intl na lib");

  // A captura é manual e exige --write explícito, sem equivalente por ambiente.
  const capture = stripComments(read(CAPTURE_REL));
  assert.ok(capture.includes('includes("--write")'), "a captura não exige --write");
  assert.ok(!/process\.env\.[A-Z_]+/.test(capture), "a captura tem bypass por ambiente");
  assert.ok(/DRY-RUN/.test(capture), "a captura precisa ter modo dry-run");
});

const baselineBackup = fs.readFileSync(BASELINE_ABS);
after(() => fs.writeFileSync(BASELINE_ABS, baselineBackup));

test("T25 prova comportamental: o wrapper reprova com baseline quebrada e aprova com a íntegra", () => {
  const rodar = () =>
    spawnSync("node", [WRAPPER_REL], {
      cwd: ROOT,
      encoding: "utf8",
      shell: false,
      maxBuffer: 256 * 1024 * 1024,
    });

  // (a) baseline ausente — nunca tratada como baseline vazia.
  fs.rmSync(BASELINE_ABS);
  let r = rodar();
  assert.equal(r.status, 1, "baseline ausente precisa reprovar");
  assert.match(`${r.stdout}${r.stderr}`, /baseline ausente/);

  // (b) baseline malformada.
  fs.writeFileSync(BASELINE_ABS, "{ isto não é json");
  r = rodar();
  assert.equal(r.status, 1, "baseline malformada precisa reprovar");
  assert.match(`${r.stdout}${r.stderr}`, /malformada/);

  // (c) baseline íntegra na forma, porém vazia: a dívida real fica fora dela e reprova.
  fs.writeFileSync(BASELINE_ABS, `${JSON.stringify(buildBaselineDocument([]), null, 2)}\n`);
  r = rodar();
  assert.equal(r.status, 1, "dívida fora da baseline precisa reprovar");
  assert.match(`${r.stdout}${r.stderr}`, /REGRESSÃO DE TIPOS/);

  // (d) restaurada: aprova, e declara que o bypass acabou.
  fs.writeFileSync(BASELINE_ABS, baselineBackup);
  r = rodar();
  assert.equal(r.status, 0, `o wrapper deveria aprovar na baseline versionada:\n${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /nenhum diagnóstico fora da baseline registrada/);
  assert.match(r.stdout, /Dívida legada congelada: \d+ diagnósticos/);

  // (e) o repositório volta byte a byte ao que era.
  assert.ok(fs.readFileSync(BASELINE_ABS).equals(baselineBackup), "a baseline não foi restaurada");
});
