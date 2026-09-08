/**
 * SLICE 47 — STUDIO SCOPE GOVERNANCE NON-STUDIO RUNTIME COMPATIBILITY
 *
 * A Slice 46 criou o estado de aplicabilidade `non_studio_branch`. Os consumidores
 * escritos antes dela enumeram exaustivamente os estados legítimos de uma branch, e o
 * ramo final dessas enumerações exigia `empty_branch_diff`. Uma branch cujo diff inteiro
 * está fora do território governado — o caso do CI, que só toca `.github/workflows/**` —
 * caía nesse ramo e derrubava `npm run test:runtime` com 24 falhas, nenhuma delas defeito
 * de produto. Foi o que aconteceu na PR #502.
 *
 * Esta suíte prova as duas metades do contrato:
 *   1. o caminho non-Studio é reconhecido e ASSERIDO POSITIVAMENTE, nunca ignorado;
 *   2. governed / mixed / unknown / forbidden / core continuam fail-closed.
 *
 * Headless, determinística, em memória: sem rede, sem banco, sem credencial, sem
 * dependência nova.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  STUDIO_SLICE_CATALOG,
  STUDIO_GOVERNED_DOMAIN_PATTERNS,
  FORBIDDEN_SCOPE_PATTERNS,
} from '../../../scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
import {
  evaluateStudioBranchScope,
  evaluateStudioBranchConsumerScope,
  evaluateStudioBranchDiffScope,
  resolveActiveStudioSlice,
  isStudioGovernedDomainPath,
  classifyStudioScopePath,
} from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const SLICE = 'studio-scope-governance-non-studio-runtime-compatibility';
const ORDINAL = 47;
const TEST_REL = `src/runtime/__tests__/${SLICE}.test.js`;
const GATE_REL = `scripts/gates/g423-${SLICE}.mjs`;
const EV_REL = `docs/evidence/post-foundation-c-${SLICE}/`;

const WORKFLOW = '.github/workflows/foundation-governance.yml';

/** Os catorze consumidores históricos que esta fatia corrige, um a um. */
const CORRECTED = Object.freeze([
  'src/runtime/__tests__/studio-module-blueprint-authoring-foundation-contract.test.js',
  'src/runtime/__tests__/studio-module-blueprint-authoring-implementation-plan.test.js',
  'src/runtime/__tests__/studio-module-blueprint-authoring-runtime.test.js',
  'src/runtime/__tests__/studio-dev-preview-app-integration-contract.test.js',
  'src/runtime/__tests__/studio-dev-preview-app-integration-implementation-plan.test.js',
  'src/runtime/__tests__/studio-dev-preview-app-integration.test.js',
  'src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-contract.test.js',
  'src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-implementation-plan.test.js',
  'src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge.test.js',
  'src/runtime/__tests__/studio-scope-governance-historical-branch-consumers.test.js',
  'src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js',
  'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js',
  'src/runtime/__tests__/studio-builder-lifecycle-normalization.test.js',
  'src/runtime/__tests__/studio-scope-governance-non-studio-branch-applicability.test.js',
]);

/**
 * O gate da fatia 46 repete as asserções de cardinalidade do catálogo que existem no teste
 * dela. Crescer o catálogo para 47 as torna falsas nos dois lugares, então ele também é
 * corrigido — e por isso também é autorizado, um arquivo, um padrão.
 */
const CORRECTED_GATES = Object.freeze([
  'scripts/gates/g423-studio-scope-governance-non-studio-branch-applicability.mjs',
]);
const AUTHORIZED = Object.freeze([...CORRECTED, ...CORRECTED_GATES]);

const entry = () => STUDIO_SLICE_CATALOG.find((s) => s.sliceId === SLICE);
const consumer = (paths, caller = SLICE) =>
  evaluateStudioBranchConsumerScope(paths, { callerSliceId: caller });
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const changedOnThisBranch = () => {
  try {
    return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' })
      .trim().split('\n').filter(Boolean);
  } catch { return null; }
};

/** O envelope completo do estado non-Studio, provado por inteiro. */
const assertNonStudioEnvelope = (r, label) => {
  assert.equal(r.reason, 'non_studio_branch', label);
  assert.equal(r.notApplicable, true, label);
  assert.equal(r.applicable, false, label);
  assert.equal(r.safe, true, label);
  assert.equal(r.activeSliceId, null, label);
  assert.deepEqual(r.blockers, [], label);
  assert.deepEqual(r.forbidden, [], label);
  assert.deepEqual(r.unknown, [], label);
};

// ===========================================================================
// C — CATÁLOGO
// ===========================================================================

test('C001 o catálogo tem exatamente 47 entradas', () => {
  assert.equal(STUDIO_SLICE_CATALOG.length, 47);
});

test('C002 os ordinais são contíguos de 1 a 47', () => {
  STUDIO_SLICE_CATALOG.forEach((s, i) => assert.equal(s.sliceOrdinal, i + 1));
});

test('C003 todo sliceId é único', () => {
  const ids = STUDIO_SLICE_CATALOG.map((s) => s.sliceId);
  assert.equal(new Set(ids).size, ids.length);
});

test('C004 esta fatia existe e é a de ordinal 47', () => {
  const e = entry();
  assert.ok(e, 'entrada 47 ausente');
  assert.equal(e.sliceOrdinal, ORDINAL);
  assert.equal(STUDIO_SLICE_CATALOG[46].sliceId, SLICE);
});

test('C005 as entradas 1..46 conservam a forma de dez chaves', () => {
  const KEYS = ['sliceId', 'sliceOrdinal', 'title', 'primaryArtifactPatterns',
    'branchMarkerPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns',
    'explicitlyAuthorizedForbiddenPatterns', 'historicalBranchConsumerCompatibility', 'status'];
  for (const s of STUDIO_SLICE_CATALOG) {
    assert.deepEqual(Object.keys(s).sort(), [...KEYS].sort(), s.sliceId);
  }
});

test('C006 nenhuma entrada anterior declara compatibilidade histórica', () => {
  assert.equal(STUDIO_SLICE_CATALOG.filter((s) => s.historicalBranchConsumerCompatibility).length, 0);
});

test('C007 esta fatia não declara compatibilidade histórica', () => {
  assert.equal(entry().historicalBranchConsumerCompatibility, false);
});

test('C008 o catálogo está congelado', () => {
  assert.equal(Object.isFrozen(STUDIO_SLICE_CATALOG), true);
  for (const s of STUDIO_SLICE_CATALOG) assert.equal(Object.isFrozen(s), true);
});

// ===========================================================================
// A — AUTORIZAÇÃO: EXATA, SEM WILDCARD, SEM CAMINHO PROIBIDO
// ===========================================================================

test('A001 há exatamente uma autorização cruzada por arquivo corrigido', () => {
  assert.equal(entry().crossSliceAuthorizedPatterns.length, AUTHORIZED.length);
  assert.equal(AUTHORIZED.length, 15);
});

test('A002 cada arquivo corrigido é autorizado, e nenhum outro', () => {
  const pats = entry().crossSliceAuthorizedPatterns;
  for (const f of AUTHORIZED) {
    assert.equal(pats.filter((r) => r.test(f)).length, 1, f);
  }
  for (const p of pats) {
    assert.equal(AUTHORIZED.filter((f) => p.test(f)).length, 1, p.source);
  }
});

test('A012 o gate corrigido da fatia 46 acompanha o teste dela', () => {
  const src = read(CORRECTED_GATES[0]);
  assert.ok(src.includes('forty-seven'), 'cardinalidade do gate não acompanhou o catálogo');
  assert.ok(!src.includes('forty-six slices'), 'cardinalidade antiga remanescente');
});

test('A003 nenhuma autorização cruzada é wildcard de diretório', () => {
  for (const p of entry().crossSliceAuthorizedPatterns) {
    assert.ok(p.source.startsWith('^'), p.source);
    assert.ok(p.source.endsWith('$'), `sem âncora final: ${p.source}`);
    assert.ok(!p.source.includes('.*'), `curinga: ${p.source}`);
    assert.ok(!p.source.includes('.+'), `curinga: ${p.source}`);
  }
});

test('A004 nenhuma autorização cruzada admite um caminho proibido', () => {
  const PROIBIDOS = ['backend/src/server.js', 'src/App.jsx', 'prisma/schema.prisma',
    'src/modules/x.js', 'src/pages/x.jsx', 'backend/prisma/schema.prisma'];
  for (const p of entry().crossSliceAuthorizedPatterns) {
    for (const f of PROIBIDOS) assert.equal(p.test(f), false, `${p.source} admite ${f}`);
  }
});

test('A005 zero autorização explícita de caminho proibido', () => {
  assert.deepEqual(entry().explicitlyAuthorizedForbiddenPatterns, []);
});

test('A006 o guard é compartilhado, nunca cruzado — esta fatia não o altera', () => {
  const GUARD = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';
  assert.equal(entry().crossSliceAuthorizedPatterns.some((r) => r.test(GUARD)), false);
  assert.equal(entry().sharedGovernancePatterns.some((r) => r.test(GUARD)), true);
});

test('A007 o marker é estreito: só a pasta de evidência desta fatia', () => {
  const m = entry().branchMarkerPatterns;
  assert.equal(m.length, 1);
  assert.equal(m[0].test(`${EV_REL}README.md`), true);
  assert.equal(m[0].test('docs/evidence/post-foundation-c-studio-scope-governance-non-studio-branch-applicability/README.md'), false);
});

test('A008 os artefatos primários são só o teste, o gate e a evidência', () => {
  const p = entry().primaryArtifactPatterns;
  assert.equal(p.length, 3);
  assert.ok(p.some((r) => r.test(TEST_REL)));
  assert.ok(p.some((r) => r.test(GATE_REL)));
  assert.ok(p.some((r) => r.test(`${EV_REL}README.md`)));
});

test('A009 nenhum marker de outra fatia é reivindicado', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    if (s.sliceId === SLICE) continue;
    for (const m of s.branchMarkerPatterns) {
      assert.equal(m.test(`${EV_REL}README.md`), false, `${s.sliceId} reivindica o marker desta fatia`);
    }
  }
});

// ===========================================================================
// B — MATRIZ POSITIVA: BRANCHES LEGITIMAMENTE NON-STUDIO
// ===========================================================================

test('B001 workflow-only é non_studio_branch', () => {
  assertNonStudioEnvelope(consumer([WORKFLOW]), 'workflow-only');
});

test('B002 tooling e docs realmente fora do território', () => {
  assertNonStudioEnvelope(consumer(['README.md', 'vite.config.js', 'eslint.config.js', '.gitignore']), 'tooling');
});

test('B003 vários caminhos non-Studio continuam non_studio_branch', () => {
  assertNonStudioEnvelope(consumer([WORKFLOW, 'README.md', '.gitignore', 'vite.config.js']), 'multi');
});

test('B004 a boundary de diff concorda com a de consumidor', () => {
  const d = evaluateStudioBranchDiffScope([WORKFLOW]);
  assert.equal(d.reason, 'non_studio_branch');
  assert.equal(d.safe, true);
  assert.equal(d.notApplicable, true);
});

test('B005 todos os 47 callers veem o mesmo veredito num diff workflow-only', () => {
  const falhas = [];
  for (const s of STUDIO_SLICE_CATALOG) {
    const r = consumer([WORKFLOW], s.sliceId);
    if (r.safe !== true || r.reason !== 'non_studio_branch') falhas.push(s.sliceId);
  }
  assert.deepEqual(falhas, []);
});

test('B006 nenhum caminho non-Studio pertence ao domínio governado', () => {
  for (const p of [WORKFLOW, 'README.md', 'vite.config.js', 'eslint.config.js', '.gitignore']) {
    assert.equal(isStudioGovernedDomainPath(p), false, p);
  }
});

// ===========================================================================
// N — MATRIZ NEGATIVA: NADA FOI RELAXADO
// ===========================================================================

const MISTOS = [
  ['unregistered Studio', 'src/studio/unregistered-future-artifact.js'],
  ['unregistered runtime', 'src/runtime/__tests__/unregistered-future.test.js'],
  ['unregistered gate', 'scripts/gates/unregistered-future-gate.mjs'],
  ['forbidden backend', 'backend/src/server.js'],
  ['forbidden UI', 'src/App.jsx'],
  ['forbidden prisma', 'prisma/schema.prisma'],
];

for (const [rotulo, intruso] of MISTOS) {
  test(`N001 workflow + ${rotulo} continua fail-closed`, () => {
    const r = consumer([WORKFLOW, intruso]);
    assert.equal(r.safe, false, rotulo);
    assert.notEqual(r.reason, 'non_studio_branch', rotulo);
    assert.ok(r.blockers.length > 0, rotulo);
  });
}

test('N002 um diff misto nunca é lido como non-Studio pela boundary de diff', () => {
  const r = evaluateStudioBranchDiffScope([WORKFLOW, 'backend/src/server.js']);
  assert.notEqual(r.reason, 'non_studio_branch');
  assert.equal(r.safe, false);
});

test('N003 o núcleo continua fail-closed para o mesmo diff workflow-only', () => {
  const core = evaluateStudioBranchScope([WORKFLOW], { callerSliceId: SLICE });
  assert.equal(core.safe, false);
  assert.ok(core.blockers.includes('no_active_slice_resolved'), JSON.stringify(core.blockers));
  assert.ok(core.blockers.includes('unknown_scope'), JSON.stringify(core.blockers));
});

test('N004 o workflow continua sendo unknown_scope para o classificador', () => {
  assert.equal(classifyStudioScopePath(WORKFLOW), 'unknown_scope');
});

test('N005 backend continua proibido, e o domínio continua o mesmo', () => {
  assert.ok(FORBIDDEN_SCOPE_PATTERNS.some((r) => r.test('backend/src/server.js')));
  assert.equal(isStudioGovernedDomainPath('backend/src/server.js'), true);
  assert.equal(classifyStudioScopePath('backend/src/server.js'), 'forbidden_scope');
});

test('N006 as raízes governadas não mudaram', () => {
  const fontes = STUDIO_GOVERNED_DOMAIN_PATTERNS.map((r) => r.source).sort();
  assert.deepEqual(fontes, [
    '^docs\\/evidence\\/', '^package-lock\\.json$', '^package\\.json$',
    '^scripts\\/gates\\/', '^src\\/runtime\\/', '^src\\/studio\\/',
  ].sort());
});

test('N007 uma branch que resolve duas fatias continua ambígua', () => {
  const r = resolveActiveStudioSlice([
    `${EV_REL}README.md`,
    'docs/evidence/post-foundation-c-studio-scope-governance-non-studio-branch-applicability/README.md',
  ]);
  assert.equal(r.ok, false);
  assert.equal(r.candidates.length, 2);
});

// ===========================================================================
// E — O DIFF VAZIO CONTINUA SENDO OUTRO ESTADO
// ===========================================================================

test('E001 diff vazio continua empty_branch_diff', () => {
  const r = consumer([]);
  assert.equal(r.reason, 'empty_branch_diff');
  assert.notEqual(r.reason, 'non_studio_branch');
  assert.equal(r.activeSliceId, null);
  assert.equal(r.safe, true);
});

test('E002 a boundary de diff também distingue vazio de non-Studio', () => {
  const o = { callerSliceId: SLICE };
  assert.equal(evaluateStudioBranchDiffScope([], o).reason, 'empty_branch_diff');
  assert.equal(evaluateStudioBranchDiffScope([WORKFLOW], o).reason, 'non_studio_branch');
});

// ===========================================================================
// R — REGRESSÃO: OS CATORZE CORRIGIDOS RECONHECEM E PROVAM O ESTADO
// ===========================================================================

for (const rel of CORRECTED) {
  test(`R001 ${path.basename(rel)} reconhece non_studio_branch`, () => {
    assert.ok(read(rel).includes('non_studio_branch'), rel);
  });
}

test('R002 todo consumidor corrigido prova o estado, não apenas o nomeia', () => {
  for (const rel of CORRECTED) {
    const src = read(rel);
    // Nomear o estado não basta: o arquivo tem de asserir o envelope. A prova pode estar
    // no helper compartilhado ou no próprio teste, então a busca é no arquivo inteiro.
    assert.ok(src.includes('non_studio_branch'), rel);
    assert.ok(/activeSliceId, null\)|activeSliceId === null/.test(src),
      `${rel} não prova activeSliceId`);
    assert.ok(/notApplicable/.test(src), `${rel} não prova notApplicable`);
    assert.ok(/\.safe, true\)|safe === true/.test(src), `${rel} não prova safe`);
  }
});

test('R003 nenhum corrigido usa skip, todo ou only', () => {
  for (const rel of CORRECTED) {
    const src = read(rel);
    assert.ok(!/\b(test|it|describe)\.(skip|todo|only)\b/.test(src), rel);
  }
});

test('R004 nenhum corrigido decide por variável de ambiente', () => {
  for (const rel of CORRECTED) {
    assert.ok(!/process\.env\.CI/.test(read(rel)), rel);
  }
});

test('R005 nenhum corrigido decide por nome de branch', () => {
  // Procura USO, não menção: um dos corrigidos mantém uma lista de tokens PROIBIDOS e
  // afirma a ausência deles — citar o token ali é o oposto de decidir por ele.
  for (const rel of CORRECTED) {
    const src = read(rel);
    assert.ok(!/(execSync|spawnSync)\([^)]*abbrev-ref/.test(src), `${rel} lê o nome da branch`);
    assert.ok(!/process\.env\.GITHUB_/.test(src), `${rel} decide por evento do GitHub`);
    assert.ok(!/process\.env\.(CI|GITHUB_[A-Z_]+)\b\s*(\?|&&|\|\||===|!==|\))/.test(src), rel);
  }
});

test('R006 nenhum corrigido usa uma lista de caminhos como porta de saída', () => {
  for (const rel of CORRECTED) {
    const src = read(rel);
    assert.ok(!/includes\('\.github/.test(src), `${rel} decide por caminho literal`);
    assert.ok(!/startsWith\('\.github\/'\)\)\s*return/.test(src), rel);
  }
});

test('R007 nenhum corrigido engole erro em catch vazio', () => {
  for (const rel of CORRECTED) {
    const src = read(rel);
    assert.ok(!/catch\s*\{\s*\/\*\s*ignore/.test(src), rel);
    assert.ok(!/catch\s*\(\s*\w*\s*\)\s*\{\s*\}/.test(src), rel);
  }
});

test('R008 a porta do estado non-Studio é o veredito, nunca a lista de candidatos vazia', () => {
  // Um caminho Studio NÃO REGISTRADO também produz zero candidatos. Se algum consumidor
  // usasse `candidates.length === 0` como porta, esse caminho entraria pela mesma brecha.
  const naoRegistrado = ['src/studio/unregistered-future-artifact.js'];
  assert.equal(resolveActiveStudioSlice(naoRegistrado).candidates.length, 0);
  const r = consumer(naoRegistrado);
  assert.equal(r.safe, false);
  assert.notEqual(r.reason, 'non_studio_branch');
});

// ===========================================================================
// S — ARTEFATOS DESTA FATIA
// ===========================================================================

test('S001 o teste e o gate desta fatia existem', () => {
  assert.ok(fs.existsSync(path.join(ROOT, TEST_REL)));
  assert.ok(fs.existsSync(path.join(ROOT, GATE_REL)));
});

test('S002 a pasta de evidência existe e não está vazia', () => {
  const dir = path.join(ROOT, EV_REL);
  assert.ok(fs.existsSync(dir));
  assert.ok(fs.readdirSync(dir).length >= 5);
});

test('S003 esta fatia não altera o guard nem o productionUiGuard', () => {
  const f = changedOnThisBranch();
  if (f === null || f.length === 0) return;
  const r = consumer(f);
  if (r.reason === 'non_studio_branch') { assertNonStudioEnvelope(r, 'branch'); return; }
  assert.equal(f.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs'), false);
  assert.equal(f.includes('scripts/gates/lib/productionUiGuard.mjs'), false);
});

test('S004 esta branch não toca produto, backend, Prisma nem workflow', () => {
  const f = changedOnThisBranch();
  if (f === null || f.length === 0) return;
  const r = consumer(f);
  if (r.reason === 'non_studio_branch') { assertNonStudioEnvelope(r, 'branch'); return; }
  for (const p of f) {
    assert.equal(/^backend\//.test(p), false, p);
    assert.equal(/^prisma\//.test(p), false, p);
    assert.equal(/^src\/(App\.jsx|modules|pages|framework|bos)/.test(p), false, p);
    assert.equal(/^\.github\//.test(p), false, p);
    assert.equal(p === 'package-lock.json', false, p);
  }
});

test('S005 esta branch é sound para esta fatia, ou legitimamente inaplicável', () => {
  const f = changedOnThisBranch();
  if (f === null || f.length === 0) return;
  const r = consumer(f);
  if (r.reason === 'non_studio_branch') { assertNonStudioEnvelope(r, 'branch'); return; }
  assert.deepEqual(r.forbidden, []);
  assert.deepEqual(r.unknown, []);
  assert.deepEqual(r.chronologicalViolation, []);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
});
