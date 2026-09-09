/**
 * SLICE 49 — TYPECHECK FAIL-CLOSED BASELINE GOVERNANCE (P1-02B)
 *
 * A fatia 48 normalizou o ESCOPO do typecheck e deixou o wrapper como ponte permissiva
 * declarada. Esta fatia remove a ponte. O que este arquivo governa é a fatia em si —
 * catálogo, autorizações e o diff desta branch — não o enforcement, que tem bateria
 * própria em `scripts/tests/typecheck-governance.test.mjs`.
 *
 * Blocos:
 *   C   catálogo e identidade da fatia
 *   A   autorizações: próprias, cruzadas e compartilhadas
 *   S   escopo: nada de produto, backend, Prisma ou dependência nova
 *   B   a branch atual, medida a partir do diff real contra origin/main
 *   R   fail-closed: o que NÃO está registrado continua sendo recusado
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { STUDIO_SLICE_CATALOG } from '../../../scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
import {
  evaluateStudioBranchScope,
  evaluateStudioBranchConsumerScope,
  resolveActiveStudioSlice,
  classifyStudioScopePath,
  findOwningStudioSlices,
  isStudioGovernedDomainPath,
  isPathAuthorizedForStudioSlice,
} from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const SLICE = 'typecheck-fail-closed-baseline-governance';
const ORDINAL = 49;
const TEST_REL = `src/runtime/__tests__/${SLICE}.test.js`;
const GATE_REL = `scripts/gates/g423-${SLICE}.mjs`;
const EV_REL = `docs/evidence/post-foundation-c-${SLICE}`;
const REGISTRY_REL = 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
const GUARD_REL = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';

/** Artefatos PRÓPRIOS que vivem fora do território governado. */
const OWN_NON_GOVERNED = Object.freeze([
  'config/typecheck-production-baseline.json',
  'scripts/lib/typecheckGovernance.mjs',
  'scripts/capture-typecheck-production-baseline.mjs',
  'scripts/tests/typecheck-governance.test.mjs',
  '.github/workflows/foundation-governance.yml',
  'docs/engineering/P1-02B-TYPECHECK-FAIL-CLOSED-BASELINE-REPORT.md',
]);

/** Arquivos de OUTRAS fatias corrigidos aqui, por cardinalidade do catálogo. */
const CROSS_CARDINALITY = Object.freeze([
  'src/runtime/__tests__/studio-scope-governance-non-studio-branch-applicability.test.js',
  'scripts/gates/g423-studio-scope-governance-non-studio-branch-applicability.mjs',
  'src/runtime/__tests__/studio-scope-governance-non-studio-runtime-compatibility.test.js',
  'scripts/gates/g423-studio-scope-governance-non-studio-runtime-compatibility.mjs',
  'src/runtime/__tests__/typecheck-environment-hygiene-governance.test.js',
  'scripts/gates/g423-typecheck-environment-hygiene-governance.mjs',
]);

/** Arquivos de OUTRAS fatias corrigidos aqui, por supersessão da ponte permissiva. */
const CROSS_SUPERSESSION = Object.freeze([
  'scripts/run-typecheck-governance.mjs',
  'scripts/tests/typecheck-scope-governance.test.mjs',
  'AGENTS.md',
  'docs/ai/skills/dev-workflow.md',
  'docs/engineering/CURRENT-STATE.md',
  'docs/engineering/TECH-DEBT.md',
  'docs/engineering/ENGINEERING-JOURNAL.md',
]);

const CROSS_ALL = Object.freeze([...CROSS_CARDINALITY, ...CROSS_SUPERSESSION]);

const entry = () => STUDIO_SLICE_CATALOG.find((s) => s.sliceId === SLICE);
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const consumer = (paths, caller = SLICE) =>
  evaluateStudioBranchConsumerScope(paths, { callerSliceId: caller });

/** O diff REAL desta branch contra origin/main. `null` quando não há base para comparar. */
const branchPaths = (() => {
  try {
    const out = execSync('git diff --name-only origin/main...HEAD', {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.split('\n').map((l) => l.trim()).filter(Boolean);
  } catch {
    return null;
  }
})();

// ===========================================================================
// C — CATÁLOGO
// ===========================================================================

test('C001 o catálogo tem exatamente 49 entradas', () => {
  assert.equal(STUDIO_SLICE_CATALOG.length, 49);
});

test('C002 os ordinais são contíguos de 1 a 49', () => {
  STUDIO_SLICE_CATALOG.forEach((s, i) => assert.equal(s.sliceOrdinal, i + 1));
});

test('C003 todo sliceId é único', () => {
  const ids = STUDIO_SLICE_CATALOG.map((s) => s.sliceId);
  assert.equal(new Set(ids).size, ids.length);
});

test('C004 esta fatia existe e é a de ordinal 49', () => {
  const e = entry();
  assert.ok(e, 'a fatia 49 não está no catálogo');
  assert.equal(e.sliceOrdinal, ORDINAL);
  assert.equal(e.title, 'Typecheck Fail-Closed Baseline Governance');
});

test('C005 toda entrada carrega exatamente as dez chaves da convenção', () => {
  for (const s of STUDIO_SLICE_CATALOG) assert.equal(Object.keys(s).length, 10, s.sliceId);
});

test('C006 esta fatia nasce merged, e nenhuma fatia fica em aberto', () => {
  assert.equal(entry().status, 'merged');
  assert.equal(STUDIO_SLICE_CATALOG.filter((s) => s.status === 'active_slice').length, 0);
  assert.equal(STUDIO_SLICE_CATALOG.filter((s) => s.status.startsWith('open_pull_request')).length, 0);
});

test('C007 a fatia 49 vem depois da 48, e a 48 continua intacta', () => {
  const anterior = STUDIO_SLICE_CATALOG[ORDINAL - 2];
  assert.equal(anterior.sliceId, 'typecheck-environment-hygiene-governance');
  assert.equal(anterior.sliceOrdinal, 48);
  assert.equal(anterior.primaryArtifactPatterns.length, 13);
});

test('C008 esta fatia não habilita compatibilidade de consumidor histórico', () => {
  assert.equal(entry().historicalBranchConsumerCompatibility, false);
  assert.equal(
    STUDIO_SLICE_CATALOG.filter((s) => s.historicalBranchConsumerCompatibility === true).length, 0,
  );
});

// ===========================================================================
// A — AUTORIZAÇÕES
// ===========================================================================

test('A001 os três artefatos canônicos pertencem a esta fatia, e a nenhuma outra', () => {
  for (const f of [TEST_REL, GATE_REL, `${EV_REL}/README.md`]) {
    const donos = findOwningStudioSlices(f).map((s) => s.sliceId);
    assert.deepEqual(donos, [SLICE], f);
  }
});

test('A002 cada artefato próprio não governado é declarado, e sem sobreposição de dono', () => {
  for (const f of OWN_NON_GOVERNED) {
    assert.equal(isStudioGovernedDomainPath(f), false, `${f} não deveria ser território governado`);
    const donos = findOwningStudioSlices(f).map((s) => s.sliceId);
    assert.deepEqual(donos, [SLICE], `${f} tem dono errado: ${donos.join(',')}`);
  }
});

test('A003 todo padrão próprio é ancorado e sem curinga de diretório', () => {
  for (const p of entry().primaryArtifactPatterns) {
    assert.ok(p.source.startsWith('^'), p.source);
    assert.ok(!p.source.includes('.*'), `curinga: ${p.source}`);
    assert.ok(!p.source.includes('.+'), `curinga: ${p.source}`);
    // A raiz de evidência é o único padrão de diretório, e é a convenção da casa.
    if (!p.source.endsWith('$')) assert.ok(p.source.includes('docs\\/evidence'), p.source);
  }
});

test('A004 uma autorização cruzada por arquivo corrigido, sem sobra e sem falta', () => {
  const pats = entry().crossSliceAuthorizedPatterns;
  assert.equal(pats.length, CROSS_ALL.length);
  assert.equal(CROSS_ALL.length, 13);
  for (const f of CROSS_ALL) assert.equal(pats.filter((r) => r.test(f)).length, 1, f);
  for (const r of pats) assert.equal(CROSS_ALL.filter((f) => r.test(f)).length, 1, r.source);
});

test('A005 todo padrão cruzado é ancorado nas duas pontas, sem curinga', () => {
  for (const p of entry().crossSliceAuthorizedPatterns) {
    assert.ok(p.source.startsWith('^') && p.source.endsWith('$'), p.source);
    assert.ok(!p.source.includes('.*') && !p.source.includes('.+'), p.source);
  }
});

test('A006 nenhum arquivo cruzado é artefato próprio — cross é de OUTRA fatia', () => {
  for (const f of CROSS_ALL) {
    const donos = findOwningStudioSlices(f).map((s) => s.sliceOrdinal);
    assert.equal(donos.length, 1, `${f} deveria ter exatamente um dono: ${donos.join(',')}`);
    assert.notEqual(donos[0], ORDINAL, `${f} está declarado como próprio e como cruzado`);
    assert.ok(donos[0] < ORDINAL, `${f} pertence a uma fatia posterior (${donos[0]})`);
  }
});

test('A007 nenhuma autorização — própria, cruzada ou compartilhada — admite caminho proibido', () => {
  const proibidos = [
    'backend/src/server.js', 'src/App.jsx', 'prisma/schema.prisma',
    'src/modules/empresas/x.js', 'src/framework/y.js', 'migrations/001.sql',
  ];
  const todos = [
    ...entry().primaryArtifactPatterns,
    ...entry().crossSliceAuthorizedPatterns,
    ...entry().sharedGovernancePatterns,
  ];
  for (const f of proibidos) {
    assert.equal(todos.filter((r) => r.test(f)).length, 0, f);
    assert.equal(classifyStudioScopePath(f), 'forbidden_scope', f);
  }
});

test('A008 zero autorização explícita de caminho proibido', () => {
  assert.deepEqual(entry().explicitlyAuthorizedForbiddenPatterns, []);
});

test('A009 o marker é único, estreito e resolve exatamente esta fatia', () => {
  assert.equal(entry().branchMarkerPatterns.length, 1);
  const r = resolveActiveStudioSlice([`${EV_REL}/README.md`]);
  assert.equal(r.ok, true);
  assert.equal(r.sliceId, SLICE);
  assert.deepEqual(r.candidates, [SLICE]);
});

test('A010 o compartilhado é só registry e package.json — o guard NÃO é tocado', () => {
  const shared = entry().sharedGovernancePatterns;
  assert.equal(shared.length, 2);
  assert.ok(shared.some((r) => r.test(REGISTRY_REL)));
  assert.ok(shared.some((r) => r.test('package.json')));
  assert.equal(shared.filter((r) => r.test(GUARD_REL)).length, 0);
  assert.equal(shared.filter((r) => r.test('package-lock.json')).length, 0);
  // E o guard não é autorizado por nenhuma via.
  assert.equal(isPathAuthorizedForStudioSlice(GUARD_REL, SLICE), false);
  assert.equal(isPathAuthorizedForStudioSlice('package-lock.json', SLICE), false);
});

// ===========================================================================
// S — ESCOPO DA MISSÃO
// ===========================================================================

test('S001 a baseline existe, é única e cobre apenas o escopo de produção', () => {
  const dir = path.join(ROOT, 'config');
  const b = fs.readdirSync(dir).filter((f) => /baseline/i.test(f) && /typecheck/i.test(f));
  assert.deepEqual(b, ['typecheck-production-baseline.json']);
  const doc = JSON.parse(read('config/typecheck-production-baseline.json'));
  assert.equal(doc.project, './jsconfig.typecheck.json');
  assert.equal(doc.positionalEvidenceIsAuthoritative, false);
  assert.ok(doc.entries.length > 0);
  for (const e of doc.entries) {
    assert.ok(!e.path.startsWith('src/runtime/__tests__/'), e.path);
    assert.ok(!/^backend\//.test(e.path), e.path);
    assert.ok(!path.isAbsolute(e.path), e.path);
  }
});

test('S002 o escopo do typecheck de produção NÃO foi alargado nem estreitado por esta fatia', () => {
  const cfg = JSON.parse(read('jsconfig.typecheck.json'));
  assert.equal(cfg.extends, './jsconfig.json');
  assert.deepEqual(cfg.exclude, ['node_modules', 'dist', 'src/vite-plugins', 'src/runtime/__tests__']);
  // `types: []` preservado: habilitar os globais do Node esconderia erros de produção.
  const base = JSON.parse(read('jsconfig.json'));
  assert.deepEqual(base.compilerOptions.types, []);
  assert.equal(base.compilerOptions.checkJs, true);
  assert.equal(cfg.compilerOptions, undefined, 'esta fatia não redeclara compilerOptions');
});

test('S003 nenhuma dependência foi adicionada e o lockfile não é autorizado', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.devDependencies['@types/node'], '^22.13.5');
  assert.equal(pkg.dependencies?.['@types/node'], undefined);
  assert.equal(isPathAuthorizedForStudioSlice('package-lock.json', SLICE), false);
});

test('S004 os scripts da fatia seguem a convenção do repositório', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts[`test:runtime:${SLICE}`], `node --test ${TEST_REL}`);
  assert.equal(pkg.scripts[`gate:g423-${SLICE}`], `node ${GATE_REL}`);
  assert.equal(pkg.scripts['test:typecheck-governance'],
    'node --test scripts/tests/typecheck-governance.test.mjs');
  assert.equal(pkg.scripts['typecheck:baseline:capture'],
    'node scripts/capture-typecheck-production-baseline.mjs');
  assert.ok(pkg.scripts['test:runtime'].includes(TEST_REL), 'a fatia não entra em test:runtime');
  assert.ok(pkg.scripts['verify:ci'].includes('npm run test:typecheck-governance'));
});

test('S005 o CI executa os três steps do typecheck, e o enforcement é o último', () => {
  const wf = read('.github/workflows/foundation-governance.yml');
  const passos = [
    'npm run test:typecheck-scope-governance',
    'npm run test:typecheck-governance',
    'npm run typecheck:governance',
  ].map((c) => wf.indexOf(c));
  for (const [i, at] of passos.entries()) assert.ok(at > 0, `step ${i + 1} ausente do workflow`);
  assert.ok(passos[0] < passos[1] && passos[1] < passos[2], 'os steps estão fora de ordem');
  assert.ok(passos[0] > wf.indexOf('npm run lint'), 'os steps precisam vir depois do Lint');

  // O nome antigo descrevia uma auditoria permissiva e não pode sobreviver COMO NOME.
  // A varredura é sobre os `- name:` do workflow, não sobre o arquivo inteiro: o
  // comentário que documenta a substituição CITA o nome removido, e uma busca no texto
  // todo confundiria a citação com o uso.
  const nomes = [...wf.matchAll(/^\s*-\s*name:\s*(.+)$/gm)].map((m) => m[1].trim());
  assert.ok(nomes.length > 0, 'o workflow não declara steps nomeados');
  assert.equal(nomes.filter((n) => /governance audit/i.test(n)).length, 0,
    'um step ainda se anuncia como auditoria');
  assert.ok(nomes.includes('Typecheck (fail-closed legacy baseline)'),
    'falta o step que declara o regime fail-closed');
});

test('S006 nenhum escape de CI foi introduzido no workflow', () => {
  const wf = read('.github/workflows/foundation-governance.yml');
  for (const proibido of [
    ['continue', 'on', 'error'].join('-'),
    ['|', '|', ' true'].join(''),
    ['set', ' +e'].join(''),
    'workflow_dispatch',
    'repository_dispatch',
  ]) {
    assert.ok(!wf.includes(proibido), `escape proibido no workflow: ${proibido}`);
  }
});

test('S007 a dívida legada NÃO foi corrigida nesta fatia — ela foi congelada', () => {
  const doc = JSON.parse(read('config/typecheck-production-baseline.json'));
  assert.ok(doc.totalDiagnostics > 0, 'uma baseline vazia significaria dívida corrigida aqui');
  // E o enforcement nomeia o registro que rastreia essa dívida.
  assert.ok(read('scripts/run-typecheck-governance.mjs').includes('TD-016'));
});

// ===========================================================================
// B — A BRANCH ATUAL
// ===========================================================================

test('B001 a branch resolve exatamente esta fatia, sem ambiguidade', () => {
  if (branchPaths === null || branchPaths.length === 0) return assert.ok(true, 'sem diff (main)');
  const a = resolveActiveStudioSlice(branchPaths);
  assert.equal(a.ok, true, `reason=${a.reason} candidates=${a.candidates.join(',')}`);
  assert.equal(a.sliceId, SLICE);
  assert.equal(a.sliceOrdinal, ORDINAL);
  assert.deepEqual(a.candidates, [SLICE]);
});

test('B002 o diff desta branch é integralmente autorizado — núcleo e consumidor', () => {
  if (branchPaths === null || branchPaths.length === 0) return assert.ok(true, 'sem diff (main)');
  const core = evaluateStudioBranchScope(branchPaths, { callerSliceId: SLICE });
  assert.deepEqual(core.unknown, [], `unknown_scope: ${core.unknown.join(', ')}`);
  assert.deepEqual(core.forbidden, [], `forbidden_scope: ${core.forbidden.join(', ')}`);
  assert.deepEqual(core.chronologicalViolation, []);
  assert.equal(core.safe, true, JSON.stringify(core.blockers));

  const r = consumer(branchPaths);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
  assert.deepEqual(r.blockers, []);
});

test('B003 a branch não toca produto, backend, Prisma, lockfile nem o guard', () => {
  if (branchPaths === null) return assert.ok(true, 'sem diff (main)');
  for (const p of branchPaths) {
    assert.ok(!/^backend\//.test(p), p);
    assert.ok(!/(^|\/)prisma(\/|$)/i.test(p), p);
    assert.ok(!/\.sql$/i.test(p), p);
    assert.ok(!/^src\/modules\//.test(p), p);
    assert.ok(!/^src\/framework\//.test(p), p);
    assert.notEqual(p, 'src/App.jsx');
    assert.notEqual(p, 'package-lock.json');
    assert.notEqual(p, GUARD_REL);
  }
});

test('B004 todo arquivo do diff está declarado em ALGUMA lista desta fatia', () => {
  if (branchPaths === null) return assert.ok(true, 'sem diff (main)');
  const declarado = new Set([
    TEST_REL, GATE_REL, REGISTRY_REL, 'package.json',
    ...OWN_NON_GOVERNED, ...CROSS_ALL,
  ]);
  for (const p of branchPaths) {
    if (p.startsWith(`${EV_REL}/`)) continue;
    assert.ok(declarado.has(p), `arquivo não declarado no teste da fatia: ${p}`);
  }
});

test('B005 os arquivos corrigidos acompanharam o catálogo vigente', () => {
  const n = STUDIO_SLICE_CATALOG.length;
  for (const f of CROSS_CARDINALITY) {
    const src = read(f);
    const afirmacoes = [...src.matchAll(/STUDIO_SLICE_CATALOG\.length(?:,| ===) (\d+)/g)]
      .map((m) => Number(m[1]));
    assert.ok(afirmacoes.length > 0, `${f} não afirma a cardinalidade do catálogo`);
    assert.deepEqual([...new Set(afirmacoes)], [n],
      `${f} afirma ${JSON.stringify(afirmacoes)}, catálogo vigente é ${n}`);
  }
});

// ===========================================================================
// R — FAIL-CLOSED
// ===========================================================================

test('R001 um caminho Studio NÃO registrado continua sendo recusado', () => {
  for (const p of [
    'src/studio/unregistered-future-artifact.js',
    'src/runtime/__tests__/unregistered-future.test.js',
    'scripts/gates/unregistered-future-gate.mjs',
  ]) {
    const r = consumer([`${EV_REL}/README.md`, p]);
    assert.equal(r.safe, false, p);
    assert.ok(r.unknown.includes(p), p);
    assert.ok(r.blockers.includes('unknown_scope'), p);
  }
});

test('R002 um caminho proibido continua sendo recusado mesmo com o marker presente', () => {
  for (const p of ['backend/src/server.js', 'src/App.jsx', 'prisma/schema.prisma']) {
    const r = consumer([`${EV_REL}/README.md`, p]);
    assert.equal(r.safe, false, p);
    assert.ok(r.forbidden.includes(p), p);
    assert.ok(r.blockers.includes('forbidden_scope'), p);
  }
});

test('R003 sem marker nenhuma fatia é eleita — infraestrutura compartilhada não elege', () => {
  for (const p of ['package.json', REGISTRY_REL, GUARD_REL]) {
    const r = resolveActiveStudioSlice([p]);
    assert.equal(r.ok, false, p);
    assert.equal(r.reason, 'no_active_slice_resolved', p);
  }
});

test('R004 dois markers permanecem ambíguos', () => {
  const r = resolveActiveStudioSlice([
    `${EV_REL}/README.md`,
    'docs/evidence/post-foundation-c-typecheck-environment-hygiene-governance/README.md',
  ]);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'ambiguous_active_slice');
  assert.equal(r.candidates.length, 2);
});

test('R005 os artefatos desta fatia não são autorizados para outras fatias', () => {
  const outras = STUDIO_SLICE_CATALOG.filter((s) => s.sliceId !== SLICE);
  for (const f of [TEST_REL, GATE_REL, ...OWN_NON_GOVERNED]) {
    for (const s of outras) {
      assert.equal(isPathAuthorizedForStudioSlice(f, s.sliceId), false, `${f} vazou para ${s.sliceId}`);
    }
  }
});

test('R006 um caller desconhecido não obtém autorização alguma', () => {
  const r = evaluateStudioBranchConsumerScope([`${EV_REL}/README.md`, TEST_REL],
    { callerSliceId: 'fatia-que-nao-existe' });
  assert.equal(r.safe, false);
  assert.ok(r.blockers.length > 0);
  assert.equal(isPathAuthorizedForStudioSlice(TEST_REL, 'fatia-que-nao-existe'), false);
});

test('R007 o diff vazio nunca é lido como aprovação', () => {
  const r = evaluateStudioBranchScope([], { callerSliceId: SLICE });
  assert.equal(r.safe, false);
  assert.ok(r.blockers.includes('no_active_slice_resolved'), JSON.stringify(r.blockers));
});
