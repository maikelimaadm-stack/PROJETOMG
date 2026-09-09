/**
 * TYPECHECK GOVERNANCE — BIBLIOTECA DE PARSING E COMPARAÇÃO FAIL-CLOSED (P1-02B)
 *
 * Esta biblioteca é a única fonte de verdade sobre COMO a saída do `tsc` vira
 * uma baseline e COMO a baseline é comparada. O wrapper de CI e a ferramenta de
 * captura consomem daqui; nenhum dos dois reimplementa parsing ou comparação.
 *
 * ------------------------------------------------------------------------
 * FINGERPRINT
 * ------------------------------------------------------------------------
 * Um diagnóstico é identificado por:
 *
 *     caminho relativo  +  código TS  +  mensagem normalizada
 *
 * e a baseline registra, para cada fingerprint, a CONTAGEM DE OCORRÊNCIAS.
 *
 * Linha e coluna NÃO participam do fingerprint. Elas são gravadas como
 * `evidence` e são deliberadamente ignoradas pela comparação. A razão é
 * mecânica: são 2365 diagnósticos vivos; uma reformatação inocente — inserir
 * um import, quebrar uma linha longa — deslocaria centenas de posições e
 * invalidaria a baseline inteira sem que um único erro novo existisse. Um
 * enforcement que grita sem motivo é desligado, e um enforcement desligado
 * não protege nada.
 *
 * O que a contagem preserva: se um arquivo passa a ter DUAS ocorrências do
 * mesmo (código, mensagem) onde antes havia uma, isso é regressão e reprova.
 *
 * ------------------------------------------------------------------------
 * DIREÇÃO DA COMPARAÇÃO — os dois lados reprovam
 * ------------------------------------------------------------------------
 * - diagnóstico presente hoje e ausente da baseline ....... FAIL (regressão)
 * - contagem hoje MAIOR que a registrada .................. FAIL (regressão)
 * - diagnóstico registrado que desapareceu ................ FAIL (baseline stale)
 * - contagem hoje MENOR que a registrada .................. FAIL (baseline stale)
 * - `tsc` verde com baseline não vazia .................... FAIL (baseline stale)
 *
 * A dívida melhorar é uma boa notícia, e mesmo assim reprova: uma baseline que
 * encolhe sozinha é uma baseline que ninguém revisou. A correção é consciente e
 * versionada — `npm run typecheck:baseline:capture -- --write` num commit próprio.
 *
 * ------------------------------------------------------------------------
 * NUNCA
 * ------------------------------------------------------------------------
 * Auto-atualização da baseline; wildcard; allowlist por diretório; bypass por
 * variável de ambiente; bypass por nome de branch; tolerância numérica.
 */
import fs from "node:fs";
import path from "node:path";

/** Versão do schema da baseline. Mudança de forma exige bump e revisão. */
export const SCHEMA_VERSION = 1;

/** O projeto de PRODUÇÃO — o mesmo que `npm run typecheck` verifica. */
export const PRODUCTION_PROJECT = "./jsconfig.typecheck.json";

/** Caminho da baseline, relativo à raiz do repositório. */
export const BASELINE_REL = "config/typecheck-production-baseline.json";

/**
 * Raízes que NÃO podem aparecer na baseline de produção: têm dono executável
 * próprio e estão fora do escopo do `jsconfig.typecheck.json`.
 */
export const NON_PRODUCTION_ROOTS = Object.freeze(["src/runtime/__tests__/"]);

/** Cabeçalho de diagnóstico do `tsc --pretty false`. */
export const DIAGNOSTIC_HEADER_RE =
  /^(?<file>[^\s][^(]*)\((?<line>\d+),(?<column>\d+)\): error TS(?<code>\d+): (?<message>.*)$/;

/** Sumário opcional do `tsc`. Reconhecido explicitamente para poder ser conferido. */
const SUMMARY_RE = /^Found (\d+) errors? in (?:\d+ files?|the same file).*\.$/;

/** Toda ocorrência do token de erro, usada como conferência independente do parsing. */
const ERROR_TOKEN_RE = /error TS\d+:/g;

/**
 * Comparador de strings INVARIANTE POR LOCALE, por unidades de código UTF-16.
 *
 * `String.prototype.localeCompare` NÃO serve aqui, e a auditoria da PR #505 provou por
 * quê: a collation do ICU depende do locale do processo. O par real
 *
 *   A = "Property 'viewModeKey' does not exist on type '{}'."
 *   B = "Property 'VISIBLE_KEY' does not exist on type '{}'."
 *
 * dá A.localeCompare(B) === -1 em en-US e +1 em tr-TR. Com `localeCompare` decidindo a
 * ordem, a baseline gravada numa máquina era recusada noutra — "entries fora da
 * ordenação determinística" — sem que uma linha de código tivesse mudado. É a mesma
 * classe de não-portabilidade que derrubou o run #665, ali pela raiz absoluta, aqui
 * pela collation.
 *
 * Unidades de código não dependem de locale, de ICU, de `LANG` nem de sistema
 * operacional. É a única base defensável para um artefato versionado.
 */
export function compareCodeUnits(a, b) {
  const x = String(a);
  const y = String(b);
  return x < y ? -1 : x > y ? 1 : 0;
}

/**
 * A ordem canônica de uma entrada da baseline: path, depois code, depois message.
 * ÚNICA fonte dessa ordem — captura, validação e comparação consomem esta função, para
 * que não existam duas noções de ordem convivendo no mesmo contrato.
 */
export function compareEntries(a, b) {
  return (
    compareCodeUnits(a.path, b.path) ||
    compareCodeUnits(a.code, b.code) ||
    compareCodeUnits(a.message, b.message)
  );
}

/**
 * Detecta um caminho ABSOLUTO em qualquer forma, sem allowlist e sem exigir formato
 * do primeiro segmento.
 *
 * Duas gerações deste detector já falharam, e as duas falhas ensinam o desenho atual:
 *
 *  1ª — allowlist de raízes Unix (`home|Users|opt|tmp|…`): não via `/usr`,
 *       `/workspaces` (Codespaces), `/builds` (GitLab), `/github/workspace`, `/data`,
 *       `/app` nem `/checkout`. Uma lista de diretórios nunca fica completa.
 *  2ª — exigir `/segmento/` com segmento em `[A-Za-z0-9_.\-]+`: trocou a allowlist de
 *       NOMES por uma allowlist de FORMATO. Dava falso negativo em `/foo.ts`, `/tmp`,
 *       `'/package.json'` (um único segmento, sem segunda barra) e em qualquer primeiro
 *       segmento não-ASCII, como `/ação/arquivo.ts`.
 *
 * O que de fato distingue um caminho absoluto de um relativo não é o nome nem o
 * formato do primeiro segmento: é ONDE a barra aparece. Num caminho absoluto ela abre
 * o token; num relativo ela é sempre precedida por algo — `.`, `..`, `@`, um
 * identificador, um esquema de URL. Por isso a regra é de FRONTEIRA:
 *
 *  1. POSIX — `/` (ou `//`, forma de rede) no início da string ou logo após espaço,
 *     aspa, parêntese, colchete, chave ou `<`, seguida de conteúdo. Não exige segunda
 *     barra, não exige extensão, não restringe o alfabeto.
 *     Recusados por consequência: `./x`, `../x`, `@/x`, `A/B`, `src/a/b.js` (a barra
 *     vem depois de caractere comum) e `http://x` (a barra vem depois de `:`).
 *  2. Windows — letra de unidade seguida de separador (`C:\` ou `C:/`), com fronteira
 *     antes para não casar dentro de um identificador como `ABC:/`.
 *  3. UNC — `\\servidor\...`, também sem restringir o alfabeto do servidor.
 *
 * Nota de projeto: nenhum detector léxico consegue separar `'/package.json'` de uma
 * string de rota como `'/api/users'` — as duas são idênticas na forma. A escolha aqui
 * é deliberada e assimétrica: este é um BACKSTOP de segurança, e um falso positivo
 * reprova o build de modo visível e diagnosticável, enquanto um falso negativo grava
 * silenciosamente um fingerprint dependente de máquina. Conferido contra as 1528
 * mensagens reais da baseline: zero são marcadas.
 */
const ABSOLUTE_PATH_IN_MESSAGE_RE = new RegExp(
  [
    String.raw`(?<![^\s"'\`([{<])\/{1,2}[^\s\/]`,
    String.raw`(?<![A-Za-z0-9])[A-Za-z]:[\\/]`,
    String.raw`\\\\[^\s\\]`,
  ].join("|"),
);

/** True se a mensagem ainda carrega um caminho absoluto — portanto dependente de máquina. */
export function hasAbsolutePathInMessage(message) {
  return ABSOLUTE_PATH_IN_MESSAGE_RE.test(String(message));
}

const REGEX_META = /[.*+?^${}()|[\]\\]/g;
const escapeRegex = (s) => String(s).replace(REGEX_META, "\\$&");

/**
 * As formas sob as quais a raiz do repositório pode aparecer numa mensagem do `tsc`.
 *
 * Inclui a raiz lógica (o caminho por onde o processo chegou) e a raiz CANÔNICA
 * (`realpathSync`), porque um checkout atrás de symlink faz o `tsc` emitir o realpath
 * enquanto o script conhece apenas o caminho lógico — e aí a relativização não casaria.
 * A resolução acontece UMA vez por execução, nunca por mensagem.
 *
 * Falha de `realpath` (raiz inexistente, sem permissão) não é fatal: segue-se com a
 * forma lógica, e qualquer caminho absoluto que sobrar é recusado adiante — fail-closed.
 */
export function repositoryRootVariants(root) {
  const out = [];
  const add = (value) => {
    if (typeof value !== "string" || value.length === 0) return;
    const trimmed = value.replace(/[\\/]+$/, "");
    if (trimmed === "") return;
    for (const form of [trimmed, trimmed.replace(/\\/g, "/")]) {
      if (form && !out.includes(form)) out.push(form);
    }
  };
  add(root);
  try {
    add(fs.realpathSync(root));
  } catch {
    // Raiz não resolvível: mantém-se a forma lógica. Nada é silenciado — um absoluto
    // remanescente continua reprovando na detecção.
  }
  return out;
}

/** Constrói o regex que remove a raiz APENAS em fronteira de caminho. */
function rootBoundaryRegex(roots) {
  const variants = (Array.isArray(roots) ? roots : [roots])
    .filter((r) => typeof r === "string" && r.length > 0)
    .map((r) => r.replace(/[\\/]+$/, ""))
    .filter(Boolean)
    .flatMap((r) => [r, r.replace(/\\/g, "/")])
    .filter((r, i, a) => a.indexOf(r) === i)
    // Mais longas primeiro: uma raiz que seja prefixo de outra não pode vencer.
    .sort((a, b) => b.length - a.length);
  if (variants.length === 0) return null;
  return new RegExp(
    String.raw`(?<![A-Za-z0-9_.\-/\\])(?:${variants.map(escapeRegex).join("|")})[\\/]`,
    "g",
  );
}

/**
 * Colapsa espaços em branco e RELATIVIZA a raiz do repositório.
 *
 * A relativização não é cosmética. Alguns diagnósticos — TS2694 entre eles — embutem o
 * caminho ABSOLUTO do arquivo dentro do texto da mensagem:
 *
 *   Namespace '"/home/user/PROJETOMG/src/runtime/types/context"' has no exported member ...
 *
 * Como a mensagem é parte do fingerprint, deixá-la assim tornaria a baseline dependente
 * da máquina: a mesma árvore, verificada em `/home/runner/work/PROJETOMG/PROJETOMG`,
 * produziria fingerprints diferentes e o enforcement acusaria regressão onde nada mudou.
 * Foi exatamente o que aconteceu na primeira execução de CI desta fatia.
 *
 * A remoção acontece SOMENTE em fronteira de caminho — a raiz precisa vir seguida de um
 * separador e não pode estar colada a outro token. A versão anterior removia a raiz como
 * substring arbitrária, inclusive a raiz NUA, de modo que `Property '<raiz>' missing.`
 * colapsava em `Property '' missing.` e podia colidir com outra mensagem. Hoje a raiz nua
 * simplesmente não é removida: sobra um caminho absoluto, e a detecção reprova — o que é
 * diagnosticável, ao contrário de uma colisão silenciosa.
 *
 * Fora isso, nada é apagado: nem aspas, nem tipos, nem números. A mensagem continua
 * sendo parte da identidade do diagnóstico.
 *
 * @param {string} raw
 * @param {string|string[]|null} [roots] raiz(es) do repositório — ver `repositoryRootVariants`
 */
export function normalizeMessage(raw, roots = null) {
  let text = String(raw);
  const re = roots === null || roots === undefined ? null : rootBoundaryRegex(roots);
  if (re) text = text.replace(re, "");
  return text.replace(/\s+/g, " ").trim();
}

/** Normaliza um caminho para a forma relativa POSIX que a baseline registra. */
export function normalizePath(raw) {
  return String(raw).replace(/\\/g, "/").replace(/^\.\//, "").trim();
}

/**
 * O fingerprint. Serializado como tupla JSON — sem separador literal, portanto sem
 * como um caminho ou uma mensagem que contivesse o separador colidir com outra entrada.
 */
export function fingerprintOf({ path: p, code, message }) {
  return JSON.stringify([p, code, message]);
}

/**
 * Converte a saída bruta do `tsc --pretty false` em diagnósticos.
 *
 * Falha fechada em qualquer anomalia: linha não classificável, continuação sem
 * cabeçalho dono, divergência entre cabeçalhos contados e tokens `error TS`, ou
 * sumário do tsc que não bate com o total parseado.
 *
 * @param {string} output
 * @param {{ root?: string|string[], status?: number }} [options]
 *   `root` — raiz(es) do repositório, para relativizar caminhos absolutos embutidos no
 *   TEXTO das mensagens (ver `normalizeMessage`).
 *   `status` — código de saída real do `tsc`. Quando informado e diferente de zero, a
 *   ausência de diagnósticos é ANOMALIA e reprova: o compilador falhou por um motivo que
 *   este parser não soube nomear, e tratar isso como "nenhum erro" seria falso verde.
 * @returns {{ diagnostics: Array<{path:string,line:number,column:number,code:string,message:string}> }}
 * @throws {Error} quando a saída não é integralmente compreendida
 */
export function parseTypecheckOutput(output, options = {}) {
  const root =
    typeof options?.root === "string" || Array.isArray(options?.root) ? options.root : null;
  const status = Number.isInteger(options?.status) ? options.status : null;
  const text = String(output ?? "");
  const lines = text.split(/\r?\n/);
  const diagnostics = [];
  const problems = [];
  let summaryClaim = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim() === "") continue;

    const header = DIAGNOSTIC_HEADER_RE.exec(line);
    if (header) {
      diagnostics.push({
        path: normalizePath(header.groups.file),
        line: Number(header.groups.line),
        column: Number(header.groups.column),
        code: `TS${header.groups.code}`,
        message: normalizeMessage(header.groups.message, root),
        _parts: [header.groups.message],
      });
      continue;
    }

    if (/^\s/.test(line)) {
      // Continuação: pertence ao diagnóstico anterior e entra na mensagem.
      if (diagnostics.length === 0) {
        problems.push(`linha ${i + 1}: continuação sem diagnóstico dono: ${line.trim()}`);
        continue;
      }
      diagnostics[diagnostics.length - 1]._parts.push(line);
      continue;
    }

    const summary = SUMMARY_RE.exec(line);
    if (summary) {
      summaryClaim = Number(summary[1]);
      continue;
    }

    problems.push(`linha ${i + 1}: saída não classificável: ${line.trim()}`);
  }

  for (const d of diagnostics) {
    d.message = normalizeMessage(d._parts.join(" "), root);
    delete d._parts;
    if (hasAbsolutePathInMessage(d.message)) {
      problems.push(
        `${d.path} ${d.code}: mensagem retém caminho absoluto após normalização — ` +
          `o fingerprint seria dependente de máquina: ${d.message.slice(0, 160)}`,
      );
    }
  }

  const errorTokens = (text.match(ERROR_TOKEN_RE) ?? []).length;
  if (errorTokens !== diagnostics.length) {
    problems.push(
      `conferência de parsing: ${diagnostics.length} cabeçalhos para ${errorTokens} ocorrências de "error TS"`,
    );
  }
  if (summaryClaim !== null && summaryClaim !== diagnostics.length) {
    problems.push(`o tsc declarou ${summaryClaim} erros; foram parseados ${diagnostics.length}`);
  }
  if (status !== null && status !== 0 && diagnostics.length === 0) {
    problems.push(
      `o tsc terminou com status ${status} e nenhum diagnóstico foi parseado — ` +
        `falha sem causa identificada NÃO pode ser lida como ausência de erros`,
    );
  }

  if (problems.length > 0) {
    throw new Error(`saída do tsc não compreendida integralmente:\n  - ${problems.join("\n  - ")}`);
  }

  return { diagnostics };
}

/**
 * Dobra diagnósticos em entradas de baseline: uma por fingerprint, com contagem
 * e evidência posicional. Ordenação determinística por (path, code, message).
 */
export function foldToEntries(diagnostics) {
  const byFingerprint = new Map();
  for (const d of diagnostics) {
    const key = fingerprintOf(d);
    let entry = byFingerprint.get(key);
    if (!entry) {
      entry = { path: d.path, code: d.code, message: d.message, count: 0, evidence: [] };
      byFingerprint.set(key, entry);
    }
    entry.count += 1;
    entry.evidence.push(`${d.line}:${d.column}`);
  }
  const entries = [...byFingerprint.values()];
  for (const e of entries) {
    e.evidence = e.evidence
      .sort((a, b) => {
        const [al, ac] = a.split(":").map(Number);
        const [bl, bc] = b.split(":").map(Number);
        return al - bl || ac - bc;
      })
      .join(" ");
  }
  entries.sort(compareEntries);
  return entries;
}

/** Monta o documento completo da baseline a partir de entradas já dobradas. */
export function buildBaselineDocument(entries) {
  return {
    schemaVersion: SCHEMA_VERSION,
    project: PRODUCTION_PROJECT,
    fingerprint: "relativePath + TS code + normalized message + occurrence count",
    positionalEvidenceIsAuthoritative: false,
    totalDiagnostics: entries.reduce((n, e) => n + e.count, 0),
    totalFiles: new Set(entries.map((e) => e.path)).size,
    entries,
  };
}

/**
 * Valida a FORMA da baseline. Tudo que não for provadamente íntegro reprova.
 *
 * @param {unknown} baseline
 * @param {{ root?: string, checkFilesExist?: boolean }} [options]
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateBaseline(baseline, options = {}) {
  const { root = null, checkFilesExist = false } = options;
  // `roots` já resolvido pelo caller (inclui o realpath); senão, a forma literal da raiz.
  const roots = options.roots ?? (root === null ? null : root);
  const errors = [];
  const fail = (m) => errors.push(m);

  if (baseline === null || typeof baseline !== "object" || Array.isArray(baseline)) {
    return { ok: false, errors: ["baseline não é um objeto JSON"] };
  }
  if (baseline.schemaVersion !== SCHEMA_VERSION) {
    fail(`schemaVersion inesperada: ${JSON.stringify(baseline.schemaVersion)} (esperada ${SCHEMA_VERSION})`);
  }
  if (baseline.project !== PRODUCTION_PROJECT) {
    fail(`project inesperado: ${JSON.stringify(baseline.project)} (esperado ${PRODUCTION_PROJECT})`);
  }
  if (baseline.positionalEvidenceIsAuthoritative !== false) {
    fail("a baseline precisa declarar positionalEvidenceIsAuthoritative: false");
  }
  if (!Array.isArray(baseline.entries)) {
    return { ok: false, errors: [...errors, "entries ausente ou não é array"] };
  }

  const seen = new Set();
  baseline.entries.forEach((e, i) => {
    const at = `entries[${i}]`;
    if (e === null || typeof e !== "object" || Array.isArray(e)) {
      fail(`${at}: não é objeto`);
      return;
    }
    const extras = Object.keys(e).filter(
      (k) => !["path", "code", "message", "count", "evidence"].includes(k),
    );
    if (extras.length > 0) fail(`${at}: chaves desconhecidas: ${extras.join(", ")}`);

    if (typeof e.path !== "string" || e.path.trim() === "") fail(`${at}: path inválido`);
    else {
      if (e.path !== normalizePath(e.path)) fail(`${at}: path não normalizado: ${e.path}`);
      if (path.isAbsolute(e.path) || /^[A-Za-z]:/.test(e.path)) fail(`${at}: path absoluto: ${e.path}`);
      if (e.path.split("/").includes("..")) fail(`${at}: path escapa da raiz: ${e.path}`);
      if (/[*?]/.test(e.path)) fail(`${at}: curinga em path: ${e.path}`);
      for (const forbidden of NON_PRODUCTION_ROOTS) {
        if (e.path.startsWith(forbidden)) fail(`${at}: path fora do escopo de produção: ${e.path}`);
      }
      if (checkFilesExist && root && !fs.existsSync(path.join(root, e.path))) {
        fail(`${at}: arquivo registrado não existe: ${e.path}`);
      }
    }

    if (typeof e.code !== "string" || !/^TS\d+$/.test(e.code)) fail(`${at}: code inválido: ${e.code}`);
    if (typeof e.message !== "string" || e.message.trim() === "") fail(`${at}: message inválida`);
    else {
      if (e.message !== normalizeMessage(e.message, roots)) fail(`${at}: message não normalizada`);
      // Uma mensagem com caminho absoluto torna o fingerprint dependente da máquina:
      // a mesma árvore verificada noutro diretório produziria outro fingerprint, e o
      // enforcement acusaria regressão sem que nada tivesse mudado.
      if (hasAbsolutePathInMessage(e.message)) {
        fail(`${at}: message com caminho absoluto (fingerprint dependente de máquina)`);
      }
    }
    if (!Number.isInteger(e.count) || e.count < 1) fail(`${at}: count inválido: ${e.count}`);
    if (typeof e.evidence !== "string" || e.evidence === "") fail(`${at}: evidence ausente`);
    else {
      const positions = e.evidence.split(" ");
      if (positions.length !== e.count) {
        fail(`${at}: evidence com ${positions.length} posições para count ${e.count}`);
      }
      for (const ev of positions) {
        if (!/^\d+:\d+$/.test(ev)) fail(`${at}: evidência inválida: ${ev}`);
      }
    }

    if (typeof e.path === "string" && typeof e.code === "string" && typeof e.message === "string") {
      const key = fingerprintOf(e);
      if (seen.has(key)) fail(`${at}: fingerprint duplicado: ${e.path} ${e.code}`);
      seen.add(key);
    }
  });

  const keyed = baseline.entries.filter(
    (e) => e && typeof e.path === "string" && typeof e.code === "string" && typeof e.message === "string",
  );
  const asIs = keyed.map(fingerprintOf);
  const expected = [...keyed].sort(compareEntries).map(fingerprintOf);
  if (JSON.stringify(asIs) !== JSON.stringify(expected)) {
    fail("entries fora da ordenação determinística (path, code, message)");
  }

  const total = baseline.entries.reduce((n, e) => n + (Number.isInteger(e?.count) ? e.count : 0), 0);
  if (baseline.totalDiagnostics !== total) {
    fail(`totalDiagnostics ${baseline.totalDiagnostics} ≠ soma das contagens ${total}`);
  }
  const files = new Set(baseline.entries.map((e) => e?.path).filter((p) => typeof p === "string")).size;
  if (baseline.totalFiles !== files) {
    fail(`totalFiles ${baseline.totalFiles} ≠ arquivos distintos ${files}`);
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Compara as entradas medidas AGORA contra a baseline registrada.
 * Igualdade exata de multiset. Qualquer diferença, nos dois sentidos, reprova.
 *
 * @returns {{ ok: boolean, added: object[], increased: object[], missing: object[], decreased: object[] }}
 */
export function compareToBaseline(currentEntries, baseline) {
  const baseMap = new Map(baseline.entries.map((e) => [fingerprintOf(e), e]));
  const currMap = new Map(currentEntries.map((e) => [fingerprintOf(e), e]));

  const added = [];
  const increased = [];
  const missing = [];
  const decreased = [];

  for (const [key, curr] of currMap) {
    const base = baseMap.get(key);
    if (!base) added.push(curr);
    else if (curr.count > base.count) increased.push({ ...curr, baselineCount: base.count });
    else if (curr.count < base.count) decreased.push({ ...curr, baselineCount: base.count });
  }
  for (const [key, base] of baseMap) {
    if (!currMap.has(key)) missing.push(base);
  }

  // Mesma noção de ordem do resto do contrato: nada aqui pode depender de locale.
  added.sort(compareEntries);
  increased.sort(compareEntries);
  missing.sort(compareEntries);
  decreased.sort(compareEntries);

  return {
    ok: added.length === 0 && increased.length === 0 && missing.length === 0 && decreased.length === 0,
    added,
    increased,
    missing,
    decreased,
  };
}

/** Lê e faz o parse do arquivo de baseline. Erro de I/O ou de JSON é falha, nunca baseline vazia. */
export function readBaselineFile(root) {
  const abs = path.join(root, BASELINE_REL);
  if (!fs.existsSync(abs)) {
    throw new Error(`baseline ausente: ${BASELINE_REL}`);
  }
  const raw = fs.readFileSync(abs, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`baseline malformada (${BASELINE_REL}): ${err.message}`);
  }
}
