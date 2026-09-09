/**
 * P1-02A — CONTRATO DE ESCOPO DO TYPECHECK DE PRODUÇÃO
 *
 * Prova que a higiene de ambiente NÃO retirou produção da cobertura.
 *
 * A prova central não é textual: é o conjunto de arquivos que o próprio TypeScript
 * carrega, obtido com `tsc -p jsconfig.typecheck.json --listFiles`. Um teste que
 * apenas procurasse strings no JSON provaria a intenção do config, não o efeito dele.
 *
 * Headless, determinístico, sem rede, sem banco, sem dependência nova.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PROD_CONFIG_REL = "jsconfig.typecheck.json";
const BASE_CONFIG_REL = "jsconfig.json";

/** A única exclusão que P1-02A acrescenta ao config base, e seu dono executável. */
const AUTHORIZED_NEW_EXCLUSION = "src/runtime/__tests__";
const EXCLUSION_OWNER_SCRIPT = "test:runtime";

/** Exclusões que já existiam no config base e são apenas repetidas (extends não mescla). */
const INHERITED_EXCLUSIONS = ["node_modules", "dist", "src/vite-plugins"];

/** Raízes de produção que precisam continuar cobertas. Nenhuma pode sumir. */
const PRODUCTION_ROOTS = Object.freeze([
  "src/App.jsx",
  "src/main.jsx",
  "src/runtime",
  "src/studio",
  "src/framework",
  "src/modules",
  "src/bos",
  "src/intelligence",
  "src/ModeloBase1",
  "src/ModeloBase2",
  "src/shared",
  "src/apis",
]);

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const prodConfig = readJson(PROD_CONFIG_REL);
const baseConfig = readJson(BASE_CONFIG_REL);
const pkg = readJson("package.json");

/**
 * Conjunto de arquivos REALMENTE carregado pelo config de produção, normalizado para
 * caminhos relativos com "/". Uma única invocação, reutilizada por todos os cenários.
 */
const listedFiles = (() => {
  const r = spawnSync("npx", ["tsc", "-p", `./${PROD_CONFIG_REL}`, "--listFiles", "--noEmit", "--pretty", "false"], {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
    maxBuffer: 256 * 1024 * 1024,
  });
  if (r.error) throw new Error(`tsc --listFiles falhou: ${r.error.message}`);
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const files = out
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith(ROOT))
    .map((l) => path.relative(ROOT, l).split(path.sep).join("/"));
  if (files.length === 0) throw new Error("tsc --listFiles não devolveu arquivo algum");
  return files;
})();

const projectFiles = listedFiles.filter((f) => !f.startsWith("node_modules/"));
const underRoot = (root) =>
  projectFiles.filter((f) => f === root || f.startsWith(`${root}/`));

// ===========================================================================
// S01–S02 — o config existe, parseia e carrega produção de verdade
// ===========================================================================

test("S01 o config de produção existe e parseia", () => {
  assert.ok(fs.existsSync(path.join(ROOT, PROD_CONFIG_REL)));
  assert.equal(typeof prodConfig, "object");
  assert.equal(prodConfig.extends, `./${BASE_CONFIG_REL}`);
});

test("S02 o tsc carrega arquivos de projeto sob o config de produção", () => {
  assert.ok(projectFiles.length > 100, `apenas ${projectFiles.length} arquivos carregados`);
  assert.ok(projectFiles.every((f) => !path.isAbsolute(f)));
});

// ===========================================================================
// S03–S11 — cada raiz de produção continua coberta, provada por --listFiles
// ===========================================================================

test("S03 src/App.jsx está incluído", () => {
  assert.ok(projectFiles.includes("src/App.jsx"), JSON.stringify(underRoot("src")).slice(0, 200));
});

test("S04 src/main.jsx está incluído", () => {
  assert.ok(projectFiles.includes("src/main.jsx"));
});

for (const [id, root] of [
  ["S05", "src/runtime"],
  ["S06", "src/studio"],
  ["S07", "src/framework"],
  ["S08", "src/modules"],
  ["S09", "src/bos"],
  ["S10", "src/intelligence"],
]) {
  test(`${id} produção coberta: ${root}`, () => {
    const files = underRoot(root).filter((f) => !f.includes("/__tests__/"));
    assert.ok(files.length > 0, `${root} não carregou nenhum arquivo de produção`);
  });
}

test("S11 ModeloBase1 e ModeloBase2 continuam cobertos", () => {
  assert.ok(underRoot("src/ModeloBase1").length > 0);
  assert.ok(underRoot("src/ModeloBase2").length > 0);
});

test("S11b src/shared e src/apis continuam cobertos", () => {
  assert.ok(underRoot("src/shared").length > 0);
  assert.ok(underRoot("src/apis").length > 0);
  // shared/ui é dívida conhecida (TD-009) — mas continua DENTRO do escopo.
  assert.ok(underRoot("src/shared/ui").length > 0, "src/shared/ui não pode sair do escopo");
});

// ===========================================================================
// S12–S13 — o contexto Node de testes saiu, e SÓ ele
// ===========================================================================

test("S12 nenhum arquivo de src/runtime/__tests__ entra no escopo de produção", () => {
  const leaked = projectFiles.filter((f) => f.startsWith("src/runtime/__tests__/"));
  assert.deepEqual(leaked, []);
});

test("S13 nenhum arquivo .test.js/.test.jsx entra no escopo de produção", () => {
  const leaked = projectFiles.filter((f) => /\.test\.(js|jsx)$/.test(f));
  assert.deepEqual(leaked, []);
});

test("S13b todo teste do repositório vive sob a única raiz excluída", () => {
  const found = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(rel);
      else if (/\.test\.(js|jsx)$/.test(e.name)) found.push(rel);
    }
  };
  walk("src");
  assert.ok(found.length > 0, "nenhum teste encontrado — premissa quebrada");
  const fora = found.filter((f) => !f.startsWith(`${AUTHORIZED_NEW_EXCLUSION}/`));
  assert.deepEqual(fora, [], "existe teste fora da raiz excluída: a exclusão ficaria incompleta");
});

test("S13c a exclusão tem dono executável, e ele enumera todos os testes", () => {
  const script = pkg.scripts[EXCLUSION_OWNER_SCRIPT];
  assert.ok(script, `script ${EXCLUSION_OWNER_SCRIPT} ausente`);
  const listed = new Set(script.split(/\s+/).filter((x) => x.endsWith(".test.js")));
  const actual = fs
    .readdirSync(path.join(ROOT, AUTHORIZED_NEW_EXCLUSION), { recursive: true })
    .map((f) => `${AUTHORIZED_NEW_EXCLUSION}/${String(f).split(path.sep).join("/")}`)
    .filter((f) => f.endsWith(".test.js"));
  assert.ok(actual.length > 0);
  const orfaos = actual.filter((f) => !listed.has(f));
  assert.deepEqual(orfaos, [], "teste excluído do typecheck sem dono executável");
});

// ===========================================================================
// S14, S16, S17 — nenhuma exclusão a mais, nenhuma raiz de produção varrida
// ===========================================================================

test("S14 nenhum glob de exclusão remove uma raiz inteira de produção", () => {
  for (const ex of prodConfig.exclude) {
    for (const root of PRODUCTION_ROOTS) {
      assert.notEqual(ex, root, `${ex} exclui a raiz de produção ${root}`);
      assert.ok(!/^src\/\*/.test(ex), `glob amplo demais: ${ex}`);
      assert.ok(!ex.includes("**"), `glob com curinga profundo: ${ex}`);
    }
  }
});

test("S16 a ÚNICA exclusão nova em relação ao config base é a raiz de testes", () => {
  const base = new Set(baseConfig.exclude ?? []);
  const novas = (prodConfig.exclude ?? []).filter((e) => !base.has(e));
  assert.deepEqual(novas, [AUTHORIZED_NEW_EXCLUSION]);
});

test("S17 as exclusões herdadas foram repetidas, porque `extends` não mescla", () => {
  for (const inherited of INHERITED_EXCLUSIONS) {
    assert.ok(prodConfig.exclude.includes(inherited), `exclusão base perdida: ${inherited}`);
  }
  assert.equal(prodConfig.exclude.length, INHERITED_EXCLUSIONS.length + 1);
});

test("S17b o config documenta a exclusão e o dono dela", () => {
  const doc = Array.isArray(prodConfig["//"]) ? prodConfig["//"].join(" ") : "";
  assert.ok(doc.includes(AUTHORIZED_NEW_EXCLUSION), "exclusão não documentada");
  assert.ok(doc.includes(EXCLUSION_OWNER_SCRIPT), "dono executável não documentado");
});

// ===========================================================================
// S15, S18–S20 — browser-safe, sem supressão nova, sem dependência nova
// ===========================================================================

test("S15 globals do Node NÃO são habilitados no escopo de produção", () => {
  const declared = prodConfig.compilerOptions?.types;
  assert.ok(declared === undefined, "o config de produção não deve redeclarar `types`");
  assert.deepEqual(baseConfig.compilerOptions.types, [], "o base precisa manter types: []");
  const nodeTypes = listedFiles.filter((f) => f.includes("node_modules/@types/node/"));
  assert.deepEqual(nodeTypes, [], "tipos globais do Node vazaram para o escopo de produção");
});

test("S15b um uso de API Node em produção continua sendo diagnosticado", () => {
  // Prova de que a herança browser-safe é real: os arquivos de produção que importam
  // builtins do Node continuam no escopo e continuam vermelhos.
  const r = spawnSync("npx", ["tsc", "-p", `./${PROD_CONFIG_REL}`, "--pretty", "false"], {
    cwd: ROOT, encoding: "utf8", shell: false, maxBuffer: 64 * 1024 * 1024,
  });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  assert.ok(/Cannot find module 'node:/.test(out),
    "nenhum diagnóstico de builtin Node em produção — a cobertura pode ter sido afrouxada");
});

test("S18 checkJs continua ligado", () => {
  assert.equal(baseConfig.compilerOptions.checkJs, true);
  assert.notEqual(prodConfig.compilerOptions?.checkJs, false);
});

test("S19 nenhuma supressão nova foi introduzida no config de produção", () => {
  const opts = prodConfig.compilerOptions ?? {};
  for (const proibido of ["skipDefaultLibCheck", "noCheck", "ignoreDeprecations", "allowJs"]) {
    assert.equal(opts[proibido], undefined, `supressão nova: ${proibido}`);
  }
  const raw = fs.readFileSync(path.join(ROOT, PROD_CONFIG_REL), "utf8");
  assert.ok(!/@ts-ignore|@ts-nocheck/.test(raw));
});

test("S20 @types/node não foi adicionado nem alterado por esta fatia", () => {
  assert.equal(pkg.devDependencies["@types/node"], "^22.13.5");
  assert.equal(pkg.dependencies?.["@types/node"], undefined);
});

// ===========================================================================
// W — o wrapper de governança parou de mentir
//
// A prova aqui é COMPORTAMENTAL: executa o wrapper e lê o que ele de fato emite.
// Uma busca textual no arquivo não serviria — o cabeçalho dele CITA a afirmação
// falsa antiga justamente para documentar que ela foi removida, e a busca
// confundiria a citação com o uso.
// ===========================================================================

const wrapperRun = (() => {
  const r = spawnSync("node", ["scripts/run-typecheck-governance.mjs"], {
    cwd: ROOT, encoding: "utf8", shell: false, maxBuffer: 64 * 1024 * 1024,
  });
  return { status: r.status, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
})();

test("W01 o wrapper executa o MESMO config de produção", () => {
  const src = fs.readFileSync(path.join(ROOT, "scripts/run-typecheck-governance.mjs"), "utf8");
  assert.ok(src.includes(PROD_CONFIG_REL), "o wrapper não usa o config de produção");
  assert.ok(wrapperRun.out.includes(PROD_CONFIG_REL),
    "o wrapper não declara, na saída, qual projeto foi verificado");
});

test("W02 a saída do wrapper não atribui a falha ao TD-009/shadcn", () => {
  assert.ok(!/TD-009 baseline/.test(wrapperRun.out), "a atribuição falsa a TD-009 persiste");
  assert.ok(!/shadcn/i.test(wrapperRun.out), "a atribuição falsa a shadcn persiste");
  assert.ok(/LEGACY TYPECHECK DEBT/.test(wrapperRun.out), "falta declarar a dívida legada");
  assert.ok(/permissive bridge pending P1-02B/.test(wrapperRun.out),
    "falta declarar a ponte permissiva e seu dono");
});

test("W03 o wrapper relata o número real de diagnósticos", () => {
  const m = wrapperRun.out.match(/Diagn[óo]sticos contados: (\d+)/);
  assert.ok(m, "o wrapper não informa a contagem real");
  assert.ok(Number(m[1]) > 0, "contagem implausível para o estado atual da dívida");
});

test("W04 o bypass permanece declarado, não disfarçado", () => {
  const src = fs.readFileSync(path.join(ROOT, "scripts/run-typecheck-governance.mjs"), "utf8");
  assert.ok(/BYPASS CONHECIDO/.test(src), "o bypass precisa continuar explícito no arquivo");
  assert.ok(src.includes("P1-02B"), "falta apontar o dono da remoção do bypass");
  // A ponte AINDA devolve 0 — é o bloqueador conhecido que P1-02B remove.
  assert.equal(wrapperRun.status, 0);
  assert.ok(/ainda N[ÃA]O é fail-closed/.test(wrapperRun.out),
    "o wrapper precisa admitir que não é fail-closed");
});

test("W05 nenhuma baseline foi criada nesta fatia", () => {
  const cfg = path.join(ROOT, "config");
  if (!fs.existsSync(cfg)) return;
  const baselines = fs.readdirSync(cfg).filter((f) => /baseline/i.test(f) && /typecheck/i.test(f));
  assert.deepEqual(baselines, [], "P1-02A não pode criar baseline; isso é P1-02B");
});
