#!/usr/bin/env node
/**
 * GATE G423 — SLICE 49 · TYPECHECK FAIL-CLOSED BASELINE GOVERNANCE
 *
 * Prova o contrato essencial da fatia sem duplicar a suíte dedicada:
 * catálogo 49/49, propriedade estreita, zero curinga, zero autorização proibida,
 * package-lock e guard fora das autorizações, baseline presente e restrita ao escopo
 * de produção, wrapper sem bypass, workflow com os três steps na ordem certa,
 * a branch resolvendo a Slice 49, fail-closed preservado.
 *
 * Read-only. Sem rede, sem banco, sem dependência nova. Falha fechada: exit 1.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { STUDIO_SLICE_CATALOG } from './lib/studioScopeGovernanceRegistry.mjs';
import {
  evaluateStudioBranchScope,
  evaluateStudioBranchConsumerScope,
  resolveActiveStudioSlice,
  classifyStudioScopePath,
  findOwningStudioSlices,
  isStudioGovernedDomainPath,
  isPathAuthorizedForStudioSlice,
} from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const SLICE = 'typecheck-fail-closed-baseline-governance';
const ORDINAL = 49;
const TEST_REL = `src/runtime/__tests__/${SLICE}.test.js`;
const GATE_REL = `scripts/gates/g423-${SLICE}.mjs`;
const EV_REL = `docs/evidence/post-foundation-c-${SLICE}`;
const REGISTRY_REL = 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
const GUARD_REL = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';
const BASELINE_REL = 'config/typecheck-production-baseline.json';
const WRAPPER_REL = 'scripts/run-typecheck-governance.mjs';
const WORKFLOW_REL = '.github/workflows/foundation-governance.yml';

const OWN_NON_GOVERNED = [
  BASELINE_REL,
  'scripts/lib/typecheckGovernance.mjs',
  'scripts/capture-typecheck-production-baseline.mjs',
  'scripts/tests/typecheck-governance.test.mjs',
  WORKFLOW_REL,
  'docs/engineering/P1-02B-TYPECHECK-FAIL-CLOSED-BASELINE-REPORT.md',
];

const CROSS_CARDINALITY = [
  'src/runtime/__tests__/studio-scope-governance-non-studio-branch-applicability.test.js',
  'scripts/gates/g423-studio-scope-governance-non-studio-branch-applicability.mjs',
  'src/runtime/__tests__/studio-scope-governance-non-studio-runtime-compatibility.test.js',
  'scripts/gates/g423-studio-scope-governance-non-studio-runtime-compatibility.mjs',
  'src/runtime/__tests__/typecheck-environment-hygiene-governance.test.js',
  'scripts/gates/g423-typecheck-environment-hygiene-governance.mjs',
];

const CROSS_SUPERSESSION = [
  WRAPPER_REL,
  'scripts/tests/typecheck-scope-governance.test.mjs',
  'AGENTS.md',
  'docs/ai/skills/dev-workflow.md',
  'docs/engineering/CURRENT-STATE.md',
  'docs/engineering/TECH-DEBT.md',
  'docs/engineering/ENGINEERING-JOURNAL.md',
];

const CROSS_ALL = [...CROSS_CARDINALITY, ...CROSS_SUPERSESSION];

let passed = 0;
const failures = [];
const gate = (id, cond, detail = '') => {
  if (cond) { passed += 1; console.log(`✓ ${id}${detail ? ` — ${detail}` : ''}`); return true; }
  failures.push(`${id}${detail ? ` — ${detail}` : ''}`);
  console.log(`✗ ${id}${detail ? ` — ${detail}` : ''}`);
  return false;
};
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const entry = STUDIO_SLICE_CATALOG.find((s) => s.sliceId === SLICE);
const consumer = (paths, caller = SLICE) =>
  evaluateStudioBranchConsumerScope(paths, { callerSliceId: caller });
const branchPaths = (() => {
  try {
    return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' })
      .trim().split('\n').filter(Boolean);
  } catch { return null; }
})();

console.log('=== G423 — Slice 49 · Typecheck Fail-Closed Baseline Governance ===\n');

/* ---------------- catálogo ---------------- */
gate('G423-49-C01 — catálogo com 49 entradas', STUDIO_SLICE_CATALOG.length === 49,
  String(STUDIO_SLICE_CATALOG.length));
gate('G423-49-C02 — ordinais contíguos 1..49',
  STUDIO_SLICE_CATALOG.every((s, i) => s.sliceOrdinal === i + 1));
gate('G423-49-C03 — sliceIds únicos',
  new Set(STUDIO_SLICE_CATALOG.map((s) => s.sliceId)).size === STUDIO_SLICE_CATALOG.length);
gate('G423-49-C04 — a entrada 49 é esta fatia', Boolean(entry) && entry.sliceOrdinal === ORDINAL);
gate('G423-49-C05 — dez chaves por entrada',
  STUDIO_SLICE_CATALOG.every((s) => Object.keys(s).length === 10));
gate('G423-49-C06 — esta fatia nasce merged', entry.status === 'merged');
gate('G423-49-C07 — zero active_slice e zero open_pull_request',
  STUDIO_SLICE_CATALOG.filter((s) => s.status === 'active_slice').length === 0
  && STUDIO_SLICE_CATALOG.filter((s) => s.status.startsWith('open_pull_request')).length === 0);
gate('G423-49-C08 — a fatia 48 continua intacta',
  STUDIO_SLICE_CATALOG[47].sliceId === 'typecheck-environment-hygiene-governance'
  && STUDIO_SLICE_CATALOG[47].primaryArtifactPatterns.length === 13);
gate('G423-49-C09 — zero compatibilidade de consumidor histórico',
  STUDIO_SLICE_CATALOG.filter((s) => s.historicalBranchConsumerCompatibility === true).length === 0);

/* ---------------- autorização ---------------- */
gate('G423-49-A01 — os três artefatos canônicos pertencem só a esta fatia',
  [TEST_REL, GATE_REL, `${EV_REL}/README.md`]
    .every((f) => findOwningStudioSlices(f).map((s) => s.sliceId).join() === SLICE));
gate('G423-49-A02 — cada artefato próprio não governado é declarado e sem dono duplicado',
  OWN_NON_GOVERNED.every((f) => !isStudioGovernedDomainPath(f)
    && findOwningStudioSlices(f).map((s) => s.sliceId).join() === SLICE));
gate('G423-49-A03 — uma autorização cruzada por arquivo corrigido',
  entry.crossSliceAuthorizedPatterns.length === CROSS_ALL.length && CROSS_ALL.length === 13,
  String(entry.crossSliceAuthorizedPatterns.length));
gate('G423-49-A04 — cada arquivo corrigido casa exatamente um padrão cruzado',
  CROSS_ALL.every((f) => entry.crossSliceAuthorizedPatterns.filter((r) => r.test(f)).length === 1));
gate('G423-49-A05 — nenhum padrão cruzado sobra sem alvo',
  entry.crossSliceAuthorizedPatterns.every((p) => CROSS_ALL.filter((f) => p.test(f)).length === 1));
gate('G423-49-A06 — todo padrão cruzado é ancorado nas duas pontas',
  entry.crossSliceAuthorizedPatterns.every((p) => p.source.startsWith('^') && p.source.endsWith('$')));
gate('G423-49-A07 — nenhum curinga em autorização cruzada',
  entry.crossSliceAuthorizedPatterns.every((p) => !p.source.includes('.*') && !p.source.includes('.+')));
gate('G423-49-A08 — cruzado é de OUTRA fatia, sempre anterior',
  CROSS_ALL.every((f) => {
    const donos = findOwningStudioSlices(f);
    return donos.length === 1 && donos[0].sliceOrdinal < ORDINAL;
  }));
gate('G423-49-A09 — nenhuma autorização admite caminho proibido',
  [...entry.primaryArtifactPatterns, ...entry.crossSliceAuthorizedPatterns,
    ...entry.sharedGovernancePatterns].every((p) =>
    !['backend/src/server.js', 'src/App.jsx', 'prisma/schema.prisma',
      'src/modules/x.js', 'src/framework/y.js', 'migrations/001.sql'].some((f) => p.test(f))));
gate('G423-49-A10 — zero autorização explícita de caminho proibido',
  entry.explicitlyAuthorizedForbiddenPatterns.length === 0);
gate('G423-49-A11 — marker único, estreito e resolvendo esta fatia',
  entry.branchMarkerPatterns.length === 1
  && resolveActiveStudioSlice([`${EV_REL}/README.md`]).sliceId === SLICE);
gate('G423-49-A12 — compartilhado é só registry e package.json',
  entry.sharedGovernancePatterns.length === 2
  && entry.sharedGovernancePatterns.some((r) => r.test(REGISTRY_REL))
  && entry.sharedGovernancePatterns.some((r) => r.test('package.json')));
gate('G423-49-A13 — o guard e o lockfile NÃO são autorizados por via alguma',
  isPathAuthorizedForStudioSlice(GUARD_REL, SLICE) === false
  && isPathAuthorizedForStudioSlice('package-lock.json', SLICE) === false);
gate('G423-49-A14 — os artefatos desta fatia não vazam para outras fatias',
  STUDIO_SLICE_CATALOG.filter((s) => s.sliceId !== SLICE).every((s) =>
    [TEST_REL, GATE_REL, ...OWN_NON_GOVERNED]
      .every((f) => isPathAuthorizedForStudioSlice(f, s.sliceId) === false)));

/* ---------------- baseline e enforcement ---------------- */
const baselineDoc = (() => {
  try { return JSON.parse(read(BASELINE_REL)); } catch { return null; }
})();
gate('G423-49-E01 — a baseline existe e é JSON válido', baselineDoc !== null);
gate('G423-49-E02 — a baseline é única em config/', (() => {
  const b = fs.readdirSync(path.join(ROOT, 'config'))
    .filter((f) => /baseline/i.test(f) && /typecheck/i.test(f));
  return b.length === 1 && b[0] === 'typecheck-production-baseline.json';
})());
gate('G423-49-E03 — a baseline governa o escopo de produção',
  baselineDoc?.project === './jsconfig.typecheck.json'
  && baselineDoc?.positionalEvidenceIsAuthoritative === false);
gate('G423-49-E04 — a baseline não invade testes, backend nem caminho absoluto',
  Array.isArray(baselineDoc?.entries) && baselineDoc.entries.length > 0
  && baselineDoc.entries.every((e) => !String(e.path).startsWith('src/runtime/__tests__/')
    && !/^backend\//.test(String(e.path)) && !path.isAbsolute(String(e.path))));
gate('G423-49-E05 — os totais da baseline batem com as entradas',
  baselineDoc?.totalDiagnostics === baselineDoc?.entries.reduce((n, e) => n + e.count, 0)
  && baselineDoc?.totalFiles === new Set(baselineDoc.entries.map((e) => e.path)).size,
  `${baselineDoc?.totalDiagnostics} diagnósticos · ${baselineDoc?.totalFiles} arquivos`);
gate('G423-49-E06 — a dívida foi CONGELADA, não corrigida nesta fatia',
  (baselineDoc?.totalDiagnostics ?? 0) > 0 && read(WRAPPER_REL).includes('TD-016'));

// A varredura de higiene do wrapper roda sobre o CÓDIGO, nunca sobre a prosa: o
// cabeçalho dele CITA o bypass removido para documentar que acabou, e uma busca no
// texto inteiro confundiria a citação com o uso.
const wrapperCode = read(WRAPPER_REL)
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
gate('G423-49-E07 — a remoção de comentários preservou o código',
  !wrapperCode.includes('KNOWN_P1_02B_BLOCKER') && wrapperCode.includes('compareToBaseline('));
gate('G423-49-E08 — o wrapper não tem escape de shell nem de CI',
  [['continue', 'on', 'error'].join('-'), ['|', '|', ' true'].join(''), ['set', ' +e'].join('')]
    .every((p) => !wrapperCode.includes(p)));
gate('G423-49-E09 — o wrapper não lê ambiente nem argumentos, e nunca escreve',
  !/process\.env\b/.test(wrapperCode) && !/process\.argv\b/.test(wrapperCode)
  && !/writeFileSync|appendFileSync|createWriteStream/.test(wrapperCode));
gate('G423-49-E10 — o único subprocesso do wrapper é o tsc de produção',
  [...wrapperCode.matchAll(/spawnSync\(\s*'([^']+)'|spawnSync\(\s*"([^"]+)"/g)]
    .map((m) => m[1] ?? m[2]).join() === 'npx');
gate('G423-49-E11 — o wrapper nunca invoca a ferramenta de captura',
  !wrapperCode.includes('capture-typecheck-production-baseline'));
gate('G423-49-E12 — a captura exige --write explícito e tem dry-run', (() => {
  const src = read('scripts/capture-typecheck-production-baseline.mjs');
  return src.includes('includes("--write")') && /DRY-RUN/.test(src)
    && !/process\.env\.[A-Z_]+/.test(src);
})());

/* ---------------- escopo da missão ---------------- */
const pkg = JSON.parse(read('package.json'));
gate('G423-49-P01 — scripts da fatia na convenção do repositório',
  pkg.scripts[`test:runtime:${SLICE}`] === `node --test ${TEST_REL}`
  && pkg.scripts[`gate:g423-${SLICE}`] === `node ${GATE_REL}`);
gate('G423-49-P02 — o teste da fatia entra em test:runtime',
  pkg.scripts['test:runtime'].includes(TEST_REL));
gate('G423-49-P03 — verify:ci roda o contrato do enforcement',
  pkg.scripts['verify:ci'].includes('npm run test:typecheck-governance'));
gate('G423-49-P04 — nenhuma dependência adicionada',
  pkg.devDependencies['@types/node'] === '^22.13.5' && pkg.dependencies?.['@types/node'] === undefined);
gate('G423-49-P05 — o escopo de produção não foi alargado nem estreitado', (() => {
  const cfg = JSON.parse(read('jsconfig.typecheck.json'));
  const base = JSON.parse(read('jsconfig.json'));
  return cfg.extends === './jsconfig.json' && cfg.compilerOptions === undefined
    && JSON.stringify(cfg.exclude)
      === JSON.stringify(['node_modules', 'dist', 'src/vite-plugins', 'src/runtime/__tests__'])
    && JSON.stringify(base.compilerOptions.types) === '[]'
    && base.compilerOptions.checkJs === true;
})());

const wf = read(WORKFLOW_REL);
const wfNames = [...wf.matchAll(/^\s*-\s*name:\s*(.+)$/gm)].map((m) => m[1].trim());
gate('G423-49-W01 — os três steps de typecheck existem e estão em ordem', (() => {
  const at = ['npm run test:typecheck-scope-governance', 'npm run test:typecheck-governance',
    'npm run typecheck:governance'].map((c) => wf.indexOf(c));
  return at.every((i) => i > 0) && at[0] < at[1] && at[1] < at[2] && at[0] > wf.indexOf('npm run lint');
})());
gate('G423-49-W02 — nenhum step ainda se anuncia como auditoria permissiva',
  wfNames.length > 0 && wfNames.filter((n) => /governance audit/i.test(n)).length === 0
  && wfNames.includes('Typecheck (fail-closed legacy baseline)'));
gate('G423-49-W03 — nenhum escape de CI no workflow',
  [['continue', 'on', 'error'].join('-'), ['|', '|', ' true'].join(''), ['set', ' +e'].join(''),
    'workflow_dispatch', 'repository_dispatch'].every((p) => !wf.includes(p)));

/* ---------------- fail-closed ---------------- */
gate('G423-49-N01 — caminho Studio não registrado continua recusado',
  ['src/studio/unregistered-future-artifact.js', 'src/runtime/__tests__/unregistered-future.test.js',
    'scripts/gates/unregistered-future-gate.mjs'].every((p) => {
    const r = consumer([`${EV_REL}/README.md`, p]);
    return r.safe === false && r.unknown.includes(p) && r.blockers.includes('unknown_scope');
  }));
gate('G423-49-N02 — caminho proibido continua recusado mesmo com o marker',
  ['backend/src/server.js', 'src/App.jsx', 'prisma/schema.prisma'].every((p) => {
    const r = consumer([`${EV_REL}/README.md`, p]);
    return r.safe === false && r.forbidden.includes(p) && r.blockers.includes('forbidden_scope');
  }) && ['backend/src/server.js', 'src/App.jsx', 'prisma/schema.prisma']
    .every((p) => classifyStudioScopePath(p) === 'forbidden_scope'));
gate('G423-49-N03 — infraestrutura compartilhada sozinha não elege fatia',
  ['package.json', REGISTRY_REL, GUARD_REL]
    .every((p) => resolveActiveStudioSlice([p]).reason === 'no_active_slice_resolved'));
gate('G423-49-N04 — dois markers permanecem ambíguos',
  resolveActiveStudioSlice([`${EV_REL}/README.md`,
    'docs/evidence/post-foundation-c-typecheck-environment-hygiene-governance/README.md',
  ]).reason === 'ambiguous_active_slice');
gate('G423-49-N05 — caller desconhecido não obtém autorização',
  consumer([`${EV_REL}/README.md`, TEST_REL], 'fatia-que-nao-existe').safe === false);
gate('G423-49-N06 — diff vazio nunca é aprovação',
  evaluateStudioBranchScope([], { callerSliceId: SLICE }).safe === false);

/* ---------------- a branch atual ---------------- */
if (branchPaths === null || branchPaths.length === 0) {
  gate('G423-49-B00 — sem diff de branch para julgar (main)', true);
} else {
  const a = resolveActiveStudioSlice(branchPaths);
  gate('G423-49-B01 — a branch resolve exatamente a Slice 49',
    a.ok === true && a.sliceId === SLICE && a.candidates.length === 1,
    `reason=${a.reason} candidates=${a.candidates.join(',')}`);
  const core = evaluateStudioBranchScope(branchPaths, { callerSliceId: SLICE });
  gate('G423-49-B02 — o núcleo aprova o diff desta branch',
    core.safe === true && core.unknown.length === 0 && core.forbidden.length === 0
    && core.chronologicalViolation.length === 0,
    `unknown=${core.unknown.join(',')} forbidden=${core.forbidden.join(',')}`);
  const r = consumer(branchPaths);
  gate('G423-49-B03 — o consumidor aprova o diff desta branch',
    r.safe === true && r.blockers.length === 0, JSON.stringify(r.blockers));
  gate('G423-49-B04 — a branch não toca produto, backend, Prisma, lockfile nem o guard',
    branchPaths.every((p) => !/^backend\//.test(p) && !/(^|\/)prisma(\/|$)/i.test(p)
      && !/\.sql$/i.test(p) && !/^src\/modules\//.test(p) && !/^src\/framework\//.test(p)
      && p !== 'src/App.jsx' && p !== 'package-lock.json' && p !== GUARD_REL));
  const declarado = new Set([TEST_REL, GATE_REL, REGISTRY_REL, 'package.json',
    ...OWN_NON_GOVERNED, ...CROSS_ALL]);
  const naoDeclarado = branchPaths.filter((p) => !p.startsWith(`${EV_REL}/`) && !declarado.has(p));
  gate('G423-49-B05 — todo arquivo do diff está declarado neste gate',
    naoDeclarado.length === 0, naoDeclarado.join(', '));
  gate('G423-49-B06 — os corrigidos acompanharam o catálogo vigente', (() => {
    const n = STUDIO_SLICE_CATALOG.length;
    return CROSS_CARDINALITY.every((f) => {
      const found = [...new Set([...read(f).matchAll(/STUDIO_SLICE_CATALOG\.length(?:,| ===) (\d+)/g)]
        .map((m) => Number(m[1])))];
      return found.length === 1 && found[0] === n;
    });
  })());
}

console.log(`\nPASS: ${passed}/${passed + failures.length}`);
if (failures.length > 0) {
  console.log(`FAIL: ${failures.length}`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log('\nGATE G423 SLICE 49 FAILED');
  process.exit(1);
}
console.log('\nGATE G423 SLICE 49 PASSED');
