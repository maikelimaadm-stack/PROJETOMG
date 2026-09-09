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

/** Colapsa espaços em branco. Nada além disso: não se apaga aspas, tipos nem números. */
export function normalizeMessage(raw) {
  return String(raw).replace(/\s+/g, " ").trim();
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
 * @returns {{ diagnostics: Array<{path:string,line:number,column:number,code:string,message:string}> }}
 * @throws {Error} quando a saída não é integralmente compreendida
 */
export function parseTypecheckOutput(output) {
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
        message: normalizeMessage(header.groups.message),
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
    d.message = normalizeMessage(d._parts.join(" "));
    delete d._parts;
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
  entries.sort(
    (a, b) =>
      a.path.localeCompare(b.path) || a.code.localeCompare(b.code) || a.message.localeCompare(b.message),
  );
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
    else if (e.message !== normalizeMessage(e.message)) fail(`${at}: message não normalizada`);
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
  const expected = [...keyed]
    .sort(
      (a, b) =>
        a.path.localeCompare(b.path) ||
        a.code.localeCompare(b.code) ||
        a.message.localeCompare(b.message),
    )
    .map(fingerprintOf);
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

  const order = (a, b) => a.path.localeCompare(b.path) || a.code.localeCompare(b.code);
  added.sort(order);
  increased.sort(order);
  missing.sort(order);
  decreased.sort(order);

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
