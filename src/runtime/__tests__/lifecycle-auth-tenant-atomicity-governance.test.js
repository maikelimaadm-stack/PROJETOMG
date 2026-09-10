/**
 * SLICE 50 — Lifecycle Auth, Tenant Isolation and Atomic Decisions Governance (P1-03)
 *
 * Este teste governa a FATIA, não o produto: prova que a entrada de catálogo desta fatia é
 * exata, que a autorização forbidden que ela pede é a mais estreita possível, e que a branch
 * desta PR é integralmente explicada por essa entrada. A correção de segurança em si é provada
 * pela bateria adversarial (`backend/scripts/testLifecycleSecurityIsolation.js`) e pelo gate
 * G403, que a executa — este arquivo NÃO os duplica; ele afirma que existem e que estão presos
 * ao pipeline.
 *
 * Headless, determinístico, sem rede, sem banco, sem credencial, sem escrita.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  STUDIO_SLICE_CATALOG,
  FORBIDDEN_SCOPE_PATTERNS,
} from '../../../scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
import {
  getStudioSliceById, findOwningStudioSlices, resolveActiveStudioSlice,
  classifyStudioScopePath, evaluateStudioBranchScope, evaluateStudioBranchConsumerScope,
  createResolvedActiveStudioSlicePathAuthorizer, isPathAuthorizedForStudioSlice,
  getExplicitlyAuthorizedForbiddenPatternsForStudioSlice,
} from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
/** Varre CÓDIGO, não prosa: os arquivos desta fatia CITAM o defeito removido para documentá-lo. */
const code = (rel) => read(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const SLICE = 'lifecycle-auth-tenant-atomicity-governance';
const ORDINAL = 50;
const EV_REL = 'docs/evidence/post-foundation-c-lifecycle-auth-tenant-atomicity-governance';
const TEST_REL = 'src/runtime/__tests__/lifecycle-auth-tenant-atomicity-governance.test.js';
const GATE_REL = 'scripts/gates/g423-lifecycle-auth-tenant-atomicity-governance.mjs';
const SECURITY_GATE_REL = 'scripts/gate-lifecycle-security-isolation.mjs';
const SUITE_REL = 'backend/scripts/testLifecycleSecurityIsolation.js';
const PIPELINE_REL = 'scripts/gate-deploy-pipeline.mjs';
const GUARD_REL = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';
const REGISTRY_REL = 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs';

/** Os SETE arquivos de backend que a correção de segurança toca. Nada além destes. */
const BACKEND_TOCADOS = Object.freeze([
  'backend/package.json',
  'backend/scripts/testLifecycleSecurityIsolation.js',
  'backend/src/modules/lifecycle/routes.js',
  'backend/src/modules/lifecycle/lifecycleService.js',
  'backend/src/modules/lifecycle/lifecycleRepository.js',
  'backend/src/modules/lifecycle/lifecycleSyncService.js',
  'backend/src/modules/lifecycle/lifecycleTenant.js',
  // Segunda rodada — modelo de tenant do Lifecycle (owner ≠ tenant é legítimo).
  'backend/src/modules/lifecycle/lifecycleSyncRepository.js',
  'backend/prisma/schema.prisma',
  'backend/prisma/migrations/20260910130000_lifecycle_sync_state_tenant_scoped_unique/migration.sql',
]);

/** Produto que a fatia possui como artefato PRIMÁRIO exato: a única mudança de frontend. */
const PRODUTO_DECLARADO = Object.freeze([
  'src/intelligence/lifecycle/sync/lifecycleSyncEngine.js',
]);

/** Backend que a fatia NÃO toca — o contraste que torna a autorização verificável. */
const BACKEND_NAO_TOCADOS = Object.freeze([
  'backend/src/server.js',
  'backend/src/modules/auth/accessScope.js',
  'backend/src/modules/mmm/mmmService.js',
  'backend/src/modules/lifecycle/lifecycleController.js',
  'backend/prisma/migrations/20260630140000_mmm_publish_engine/migration.sql',
]);

const entry = () => getStudioSliceById(SLICE);
const consumer = (paths, caller = SLICE) =>
  evaluateStudioBranchConsumerScope(paths, { callerSliceId: caller });

/** O diff REAL desta branch contra origin/main. `null` quando não há base de comparação. */
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
// A — A ENTRADA DE CATÁLOGO
// ===========================================================================

test('A001 a fatia existe, é ordinal 50 e é a última do catálogo', () => {
  const e = entry();
  assert.ok(e, SLICE);
  assert.equal(e.sliceOrdinal, ORDINAL);
  assert.equal(STUDIO_SLICE_CATALOG.length, ORDINAL);
  assert.equal(STUDIO_SLICE_CATALOG[STUDIO_SLICE_CATALOG.length - 1].sliceId, SLICE);
});

test('A002 a entrada é congelada e carrega exatamente as dez chaves', () => {
  assert.equal(Object.isFrozen(entry()), true);
  assert.equal(Object.keys(entry()).length, 10);
});

test('A003 a fatia nasce merged e não autoriza consumidores históricos', () => {
  assert.equal(entry().status, 'merged');
  assert.equal(entry().historicalBranchConsumerCompatibility, false);
});

test('A004 todo padrão declarado é ancorado no início', () => {
  const e = entry();
  for (const grupo of ['primaryArtifactPatterns', 'branchMarkerPatterns', 'crossSliceAuthorizedPatterns',
    'sharedGovernancePatterns', 'explicitlyAuthorizedForbiddenPatterns']) {
    for (const re of e[grupo]) {
      assert.ok(re instanceof RegExp, `${grupo}`);
      assert.ok(re.source.startsWith('^'), `${grupo} ${re.source}`);
    }
  }
});

test('A005 o marcador de branch é a evidência, e é subconjunto dos artefatos primários', () => {
  const e = entry();
  assert.equal(e.branchMarkerPatterns.length, 1);
  assert.ok(e.branchMarkerPatterns[0].test(`${EV_REL}/README.md`));
  for (const m of e.branchMarkerPatterns) {
    assert.ok(e.primaryArtifactPatterns.some((p) => p.toString() === m.toString()), m.source);
  }
});

test('A006 o escopo compartilhado é o mínimo: registry e package.json, sem lockfile e sem guard', () => {
  const fontes = entry().sharedGovernancePatterns.map((r) => r.source);
  assert.deepEqual(fontes, ['^scripts\\/gates\\/lib\\/studioScopeGovernanceRegistry\\.mjs$', '^package\\.json$']);
  assert.equal(isPathAuthorizedForStudioSlice('package-lock.json', SLICE), false);
  assert.equal(isPathAuthorizedForStudioSlice(GUARD_REL, SLICE), false);
});

// ===========================================================================
// B — A AUTORIZAÇÃO FORBIDDEN É A MAIS ESTREITA POSSÍVEL
// ===========================================================================

test('B001 a fatia autoriza exatamente os sete arquivos de backend que toca', () => {
  const declarados = getExplicitlyAuthorizedForbiddenPatternsForStudioSlice(SLICE);
  assert.equal(declarados.length, BACKEND_TOCADOS.length);
  for (const f of BACKEND_TOCADOS) {
    assert.equal(declarados.filter((re) => re.test(f)).length, 1, f);
  }
  for (const re of declarados) {
    assert.equal(BACKEND_TOCADOS.filter((f) => re.test(f)).length, 1, re.source);
  }
});

test('B002 cada autorização forbidden é um arquivo exato, ancorado nas duas pontas', () => {
  for (const re of getExplicitlyAuthorizedForbiddenPatternsForStudioSlice(SLICE)) {
    assert.ok(re.source.startsWith('^') && re.source.endsWith('$'), re.source);
    const literal = re.source.slice(1, -1).replace(/\\[./]/g, '');
    assert.ok(!/[.*+?[\]()|{}^$\\]/.test(literal), `curinga em ${re.source}`);
  }
});

test('B003 cada caminho autorizado é REALMENTE proibido — a autorização não é decorativa', () => {
  for (const f of BACKEND_TOCADOS) {
    assert.ok(FORBIDDEN_SCOPE_PATTERNS.some((re) => re.test(f)), f);
    assert.equal(classifyStudioScopePath(f), 'forbidden_scope', f);
  }
});

test('B004 backend que a fatia NÃO toca continua proibido e não autorizado', () => {
  for (const f of BACKEND_NAO_TOCADOS) {
    assert.equal(classifyStudioScopePath(f), 'forbidden_scope', f);
    assert.equal(isPathAuthorizedForStudioSlice(f, SLICE), false, f);
    const r = evaluateStudioBranchScope([`${EV_REL}/README.md`, f], { callerSliceId: SLICE });
    assert.ok(r.forbidden.includes(f), f);
    assert.equal(r.safe, false, f);
  }
});

test('B005 a autorização não vaza: nenhuma OUTRA fatia alcança estes sete arquivos', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    if (s.sliceId === SLICE) continue;
    for (const f of BACKEND_TOCADOS) {
      assert.equal(isPathAuthorizedForStudioSlice(f, s.sliceId), false, `${s.sliceId} ${f}`);
      assert.equal(
        s.explicitlyAuthorizedForbiddenPatterns.some((re) => re.test(f)), false, `${s.sliceId} ${f}`,
      );
    }
  }
});

test('B006 produto, outras migrations e lockfile continuam fora do alcance desta fatia', () => {
  for (const f of ['src/App.jsx', 'src/modules/empresas/index.js', 'prisma/schema.prisma',
    'backend/prisma/migrations/0001_init/migration.sql', 'package-lock.json',
    'scripts/gates/lib/productionUiGuard.mjs',
    'src/intelligence/lifecycle/sync/lifecycleSyncApiClient.js',
    'src/intelligence/lifecycle/sync/lifecycleSyncContracts.js']) {
    assert.equal(isPathAuthorizedForStudioSlice(f, SLICE), false, f);
  }
});

test('B007 o schema e a migration autorizados são EXATOS — o diretório de migrations não é', () => {
  assert.equal(isPathAuthorizedForStudioSlice('backend/prisma/schema.prisma', SLICE), true);
  assert.equal(isPathAuthorizedForStudioSlice(
    'backend/prisma/migrations/20260910130000_lifecycle_sync_state_tenant_scoped_unique/migration.sql', SLICE), true);
  for (const f of ['backend/prisma/migrations/20260910130000_lifecycle_sync_state_tenant_scoped_unique/rollback.sql',
    'backend/prisma/migrations/20260910130001_outra/migration.sql',
    'backend/prisma/migrations/migration_lock.toml', 'backend/prisma/seed.js']) {
    assert.equal(isPathAuthorizedForStudioSlice(f, SLICE), false, f);
  }
  // E a única mudança de produto do frontend é um arquivo exato, primário, sem irmãos.
  assert.equal(isPathAuthorizedForStudioSlice(PRODUTO_DECLARADO[0], SLICE), true);
  assert.equal(findOwningStudioSlices(PRODUTO_DECLARADO[0]).map((x) => x.sliceId).join(), SLICE);
});

// ===========================================================================
// C — O QUE A FATIA CRUZA, E COM QUE LIMITE
// ===========================================================================

const RAIZES_CRUZADAS = Object.freeze([
  'src/runtime/__tests__/',   // (a) e (b) — testes de fatia de outras fatias
  'scripts/gates/',           // (b) — gates de fatia de outras fatias
  'docs/engineering/',        // (c) — os diários de engenharia, que a fatia 48 possui
]);

test('C001 a fatia cruza apenas testes, gates e diários — nunca produção', () => {
  for (const re of entry().crossSliceAuthorizedPatterns) {
    const probe = re.source.replace(/^\^/, '').replace(/\$$/, '').replace(/\\\//g, '/').replace(/\\\./g, '.');
    assert.ok(RAIZES_CRUZADAS.some((r) => probe.startsWith(r)), probe);
    assert.ok(!FORBIDDEN_SCOPE_PATTERNS.some((f) => f.test(probe)), probe);
  }
});

test('C001b as raízes cruzadas são as três declaradas — nenhuma outra é admitida', () => {
  // A frase só tem valor se souber reprovar: um caminho de produto sob outra raiz não passa.
  for (const p of ['src/App.jsx', 'src/modules/empresas/index.js', 'backend/src/server.js',
    'config/typecheck-production-baseline.json', '.github/workflows/foundation-governance.yml']) {
    assert.equal(RAIZES_CRUZADAS.some((r) => p.startsWith(r)), false, p);
    assert.equal(
      entry().crossSliceAuthorizedPatterns.some((re) => re.test(p)), false, `cruzado indevidamente: ${p}`,
    );
  }
});

test('C002 toda autorização cruzada é um arquivo exato, sem curinga de diretório', () => {
  for (const re of entry().crossSliceAuthorizedPatterns) {
    assert.ok(re.source.startsWith('^') && re.source.endsWith('$'), re.source);
    assert.ok(!re.source.includes('.*') && !re.source.includes('.+'), re.source);
  }
});

test('C003 nenhum arquivo cruzado muda de dono — a propriedade primária continua onde estava', () => {
  for (const re of entry().crossSliceAuthorizedPatterns) {
    const probe = re.source.replace(/^\^/, '').replace(/\$$/, '').replace(/\\\//g, '/').replace(/\\\./g, '.');
    const donos = findOwningStudioSlices(probe).map((s) => s.sliceId);
    assert.equal(donos.includes(SLICE), false, `${probe} passou a ser primário da fatia 50`);
  }
});

test('C004 nenhuma autorização cruzada é vazia — todo arquivo cruzado é de fato tocado', () => {
  if (branchPaths === null || branchPaths.length === 0) return assert.ok(true, 'sem diff (main)');
  for (const re of entry().crossSliceAuthorizedPatterns) {
    assert.ok(branchPaths.some((p) => re.test(p)), `autorização cruzada não exercida: ${re.source}`);
  }
});

test('C005 os artefatos primários desta fatia não vazam para nenhuma outra', () => {
  for (const f of [TEST_REL, GATE_REL, SECURITY_GATE_REL, `${EV_REL}/README.md`]) {
    for (const s of STUDIO_SLICE_CATALOG) {
      if (s.sliceId === SLICE) continue;
      assert.equal(isPathAuthorizedForStudioSlice(f, s.sliceId), false, `${f} vazou para ${s.sliceId}`);
    }
  }
});

// ===========================================================================
// D — A BRANCH DESTA PR
// ===========================================================================

test('D001 a branch resolve exatamente esta fatia, sem ambiguidade', () => {
  if (branchPaths === null || branchPaths.length === 0) return assert.ok(true, 'sem diff (main)');
  const a = resolveActiveStudioSlice(branchPaths);
  assert.equal(a.ok, true, `reason=${a.reason} candidates=${a.candidates.join(',')}`);
  assert.deepEqual(a.candidates, [SLICE]);
  assert.equal(a.sliceOrdinal, ORDINAL);
});

test('D002 o diff é integralmente autorizado — núcleo e consumidor concordam', () => {
  if (branchPaths === null || branchPaths.length === 0) return assert.ok(true, 'sem diff (main)');
  const core = evaluateStudioBranchScope(branchPaths, { callerSliceId: SLICE });
  assert.deepEqual(core.unknown, [], `unknown_scope: ${core.unknown.join(', ')}`);
  assert.deepEqual(core.forbidden, [], `forbidden_scope: ${core.forbidden.join(', ')}`);
  assert.deepEqual(core.chronologicalViolation, []);
  assert.equal(core.safe, true, JSON.stringify(core.blockers));

  const r = consumer(branchPaths);
  assert.deepEqual(r.blockers, [], JSON.stringify(r.blockers));
  assert.equal(r.safe, true);
});

test('D003 os ÚNICOS caminhos proibidos do diff são os dez declarados', () => {
  if (branchPaths === null || branchPaths.length === 0) return assert.ok(true, 'sem diff (main)');
  const proibidos = branchPaths.filter((p) => classifyStudioScopePath(p) === 'forbidden_scope').sort();
  assert.deepEqual(proibidos, [...BACKEND_TOCADOS].sort());
  assert.deepEqual([...consumer(branchPaths).explicitForbiddenAuthorized].sort(), [...BACKEND_TOCADOS].sort());
});

test('D004 a branch não toca lockfile, workflow, guard nem produto — salvo o exatamente declarado', () => {
  if (branchPaths === null) return assert.ok(true, 'sem diff (main)');
  const declarado = new Set([...BACKEND_TOCADOS, ...PRODUTO_DECLARADO]);
  for (const p of branchPaths) {
    // Incondicionais: nenhuma declaração da fatia alcança estes.
    assert.ok(!/^\.github\//.test(p), p);
    assert.notEqual(p, 'package-lock.json');
    assert.notEqual(p, GUARD_REL);
    if (declarado.has(p)) continue;
    // Para tudo o mais, Prisma/migration/produto continuam proibidos.
    assert.ok(!/(^|\/)prisma(\/|$)/i.test(p), p);
    assert.ok(!/migrations?\//i.test(p), p);
    assert.ok(!/\.sql$/i.test(p), p);
    assert.ok(!/^src\/(App\.jsx|main\.jsx|modules|shared|framework|apis|bos|intelligence|ModeloBase1|ModeloBase2)/.test(p), p);
  }
});

test('D005 a única alteração em src/runtime é em __tests__ — nada de produção de runtime', () => {
  if (branchPaths === null) return assert.ok(true, 'sem diff (main)');
  for (const p of branchPaths.filter((x) => x.startsWith('src/runtime/'))) {
    assert.ok(p.startsWith('src/runtime/__tests__/'), `produção de runtime alterada: ${p}`);
  }
});

test('D006 o autorizador resolvido admite todo o diff e recusa o que está fora dele', () => {
  if (branchPaths === null || branchPaths.length === 0) return assert.ok(true, 'sem diff (main)');
  const a = createResolvedActiveStudioSlicePathAuthorizer(branchPaths);
  assert.equal(a.ok, true, JSON.stringify(a));
  assert.equal(a.activeSliceId, SLICE);
  for (const p of branchPaths) assert.equal(a.isAuthorized(p), true, p);
  for (const p of ['src/App.jsx', 'backend/src/server.js', GUARD_REL, 'package-lock.json',
    'docs/evidence/fatia-inexistente/README.md']) {
    assert.equal(a.isAuthorized(p), false, p);
  }
});

// ===========================================================================
// E — FAIL-CLOSED
// ===========================================================================

test('E001 um caminho não catalogado continua sendo recusado nesta branch', () => {
  for (const p of ['src/studio/artefato-futuro-nao-registrado.js',
    'src/runtime/__tests__/fatia-futura-nao-registrada.test.js',
    'scripts/gates/gate-futuro-nao-registrado.mjs']) {
    const r = consumer([`${EV_REL}/README.md`, p]);
    assert.ok(r.unknown.includes(p), p);
    assert.equal(r.safe, false, p);
  }
});

test('E002 um caller desconhecido não obtém autorização alguma', () => {
  const r = consumer([`${EV_REL}/README.md`, TEST_REL], 'fatia-que-nao-existe');
  assert.equal(r.safe, false);
  assert.ok(r.blockers.length > 0);
  for (const f of BACKEND_TOCADOS) {
    assert.equal(isPathAuthorizedForStudioSlice(f, 'fatia-que-nao-existe'), false, f);
  }
});

test('E003 um diff vazio não prova esta fatia', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer([]);
  assert.equal(a.ok, false);
  assert.equal(a.reason, 'empty_branch_diff');
  assert.equal(a.isAuthorized(TEST_REL), false);
});

test('E004 sem o marcador, os arquivos de backend NÃO são liberados', () => {
  // A autorização é da FATIA ATIVA, não do arquivo: sem o marcador que elege a fatia 50,
  // o mesmo caminho volta a ser proibido. É isto que impede a autorização de virar um
  // salvo-conduto global para `backend/src/modules/lifecycle/`.
  const semMarcador = BACKEND_TOCADOS.filter((p) => p !== 'backend/package.json');
  const a = createResolvedActiveStudioSlicePathAuthorizer(semMarcador);
  assert.equal(a.ok, false, JSON.stringify(a));
  for (const f of semMarcador) assert.equal(a.isAuthorized(f), false, f);
});

// ===========================================================================
// S50-NEG — ANTI-WEAKENING
// ===========================================================================
// Uma autorização de caminho proibido só é segura se for possível PROVAR o que ela
// NÃO alcança. Cada caso abaixo é uma negativa: se algum dia passar, é porque a
// governança foi afrouxada — e a fatia 50 é a suspeita óbvia.

test('S50-NEG-01 backend/src/server.js continua recusado', () => {
  const f = 'backend/src/server.js';
  assert.equal(classifyStudioScopePath(f), 'forbidden_scope');
  assert.equal(isPathAuthorizedForStudioSlice(f, SLICE), false);
  const r = evaluateStudioBranchScope([`${EV_REL}/README.md`, f], { callerSliceId: SLICE });
  assert.ok(r.forbidden.includes(f));
  assert.equal(r.safe, false);
});

test('S50-NEG-02 backend/src/modules/auth/accessScope.js continua recusado', () => {
  const f = 'backend/src/modules/auth/accessScope.js';
  assert.equal(isPathAuthorizedForStudioSlice(f, SLICE), false);
  assert.equal(evaluateStudioBranchScope([`${EV_REL}/README.md`, f], { callerSliceId: SLICE }).safe, false);
});

test('S50-NEG-03 Prisma fora dos DOIS arquivos exatos continua recusado', () => {
  // O schema e UMA migration são autorizados como arquivos exatos (B007). Tudo o mais
  // sob prisma/ — outra migration, o lock, um seed, o schema na raiz — segue proibido.
  for (const f of ['prisma/schema.prisma', 'backend/prisma/migrations/0002_x/migration.sql',
    'backend/prisma/migrations/20260910130000_lifecycle_sync_state_tenant_scoped_unique/extra.sql',
    'backend/prisma/migrations/migration_lock.toml', 'backend/prisma/seed.js']) {
    assert.equal(isPathAuthorizedForStudioSlice(f, SLICE), false, f);
    assert.equal(evaluateStudioBranchScope([`${EV_REL}/README.md`, f], { callerSliceId: SLICE }).safe, false, f);
  }
});

test('S50-NEG-12 o vizinho do único arquivo de frontend declarado NÃO herda a autorização', () => {
  for (const f of ['src/intelligence/lifecycle/sync/lifecycleSyncApiClient.js',
    'src/intelligence/lifecycle/sync/evil-new-file.js', 'src/intelligence/index.js',
    'src/intelligence/dna/engine/businessDnaStore.js', 'src/bos/pages/BosHomePage.jsx']) {
    assert.equal(isPathAuthorizedForStudioSlice(f, SLICE), false, f);
    assert.equal(evaluateStudioBranchScope([`${EV_REL}/README.md`, f], { callerSliceId: SLICE }).safe, false, f);
  }
});

test('S50-NEG-04 .github/workflows/foundation-governance.yml continua recusado', () => {
  const f = '.github/workflows/foundation-governance.yml';
  assert.equal(isPathAuthorizedForStudioSlice(f, SLICE), false);
});

test('S50-NEG-05 um arquivo NOVO no mesmo diretório autorizado continua recusado', () => {
  // A autorização é por ARQUIVO EXATO, não por diretório: o vizinho não herda nada.
  for (const f of ['backend/src/modules/lifecycle/evil-new-file.js',
    'backend/src/modules/lifecycle/lifecycleController.js',
    'backend/src/modules/lifecycle/lifecycleSyncRepository.test.js']) {
    assert.equal(isPathAuthorizedForStudioSlice(f, SLICE), false, f);
    assert.equal(evaluateStudioBranchScope([`${EV_REL}/README.md`, f], { callerSliceId: SLICE }).safe, false, f);
  }
});

test('S50-NEG-06 um regex amplo é reprovado pelo predicado de exatidão', () => {
  // O mesmo predicado que o teste 26a da fatia de manutenção usa. Se ele parar de
  // reprovar, aquela frase e esta viram decorativas ao mesmo tempo.
  const exato = (src) => {
    if (!src.startsWith('^') || !src.endsWith('$')) return false;
    return !/[.*+?[\]()|{}^$\\]/.test(src.slice(1, -1).replace(/\\[./]/g, ''));
  };
  for (const amplo of ['^backend\\/', '^backend\\/.*$', '^backend\\/.+$',
    '^backend\\/src\\/modules\\/lifecycle\\/.*$', '^backend\\/(src|scripts)\\/x\\.js$']) {
    assert.equal(exato(amplo), false, amplo);
  }
  assert.equal(exato('^backend\\/src\\/modules\\/lifecycle\\/routes\\.js$'), true);
  // E a fatia real passa no predicado, arquivo a arquivo.
  for (const re of getExplicitlyAuthorizedForbiddenPatternsForStudioSlice(SLICE)) {
    assert.equal(exato(re.source), true, re.source);
  }
});

test('S50-NEG-07 sem o marcador da fatia 50, os sete arquivos voltam a ser recusados', () => {
  const semMarcador = BACKEND_TOCADOS.filter((p) => p !== 'backend/package.json');
  const a = createResolvedActiveStudioSlicePathAuthorizer(semMarcador);
  assert.equal(a.ok, false, JSON.stringify(a));
  for (const f of semMarcador) assert.equal(a.isAuthorized(f), false, f);
});

test('S50-NEG-08 uma fatia inexistente não herda o allow da fatia 50', () => {
  for (const fantasma of ['lifecycle-auth-tenant-atomicity-governance-v2', 'slice-51',
    'fatia-que-nao-existe', '']) {
    for (const f of BACKEND_TOCADOS) {
      assert.equal(isPathAuthorizedForStudioSlice(f, fantasma), false, `${fantasma} ${f}`);
    }
    assert.deepEqual(getExplicitlyAuthorizedForbiddenPatternsForStudioSlice(fantasma), []);
  }
});

test('S50-NEG-09 nenhuma fatia histórica passou a POSSUIR os sete arquivos de backend', () => {
  for (const f of BACKEND_TOCADOS) {
    const donos = findOwningStudioSlices(f).map((x) => x.sliceId);
    assert.deepEqual(donos.filter((d) => d !== SLICE), [], `${f} → ${donos.join(',')}`);
    for (const s of STUDIO_SLICE_CATALOG) {
      if (s.sliceId === SLICE) continue;
      assert.equal(s.crossSliceAuthorizedPatterns.some((re) => re.test(f)), false, `${s.sliceId} ${f}`);
      assert.equal(s.sharedGovernancePatterns.some((re) => re.test(f)), false, `${s.sliceId} ${f}`);
    }
  }
});

test('S50-NEG-10 FORBIDDEN_SCOPE_PATTERNS continua cobrindo backend/**', () => {
  assert.ok(FORBIDDEN_SCOPE_PATTERNS.some((re) => re.source === '^backend\\/'),
    `padrões: ${FORBIDDEN_SCOPE_PATTERNS.map((r) => r.source).join(' ')}`);
  for (const f of ['backend/a.js', 'backend/src/x/y.js', ...BACKEND_TOCADOS]) {
    assert.equal(classifyStudioScopePath(f), 'forbidden_scope', f);
  }
});

test('S50-NEG-11 o guard central não está no diff desta branch', () => {
  if (branchPaths === null) return assert.ok(true, 'sem diff (main)');
  assert.equal(branchPaths.includes(GUARD_REL), false, 'o guard central foi alterado');
});

// ===========================================================================
// F — OS ARTEFATOS DE SEGURANÇA EXISTEM E ESTÃO PRESOS AO PIPELINE
// ===========================================================================

test('F001 a bateria adversarial e os dois gates existem', () => {
  for (const rel of [SUITE_REL, SECURITY_GATE_REL, GATE_REL, TEST_REL, `${EV_REL}/README.md`]) {
    assert.ok(exists(rel), rel);
  }
});

test('F002 G403 está no agregado que o CI de fato executa', () => {
  // `gate:deploy-pipeline` é o único agregado de validação de backend que o workflow roda.
  assert.match(code(PIPELINE_REL), /gate:lifecycle-security/);
});

test('F003 os dois gates estão registrados como scripts npm', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['gate:lifecycle-security'], `node ${SECURITY_GATE_REL}`);
  assert.equal(pkg.scripts[`gate:g423-${SLICE}`], `node ${GATE_REL}`);
});

test('F004 o teste desta fatia está na lista que o CI executa', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.ok(pkg.scripts['test:runtime'].includes(TEST_REL), 'test:runtime não inclui o teste da fatia');
});

test('F005 a bateria do backend está registrada no package.json do backend', () => {
  const pkg = JSON.parse(read('backend/package.json'));
  assert.equal(pkg.scripts['test:lifecycle-security'], 'node scripts/testLifecycleSecurityIsolation.js');
});

test('F006 nenhum artefato desta fatia contém escape de teste ou supressão de erro', () => {
  // Uma varredura textual que ESCREVE o token proibido encontra a si mesma: a primeira versão
  // deste teste falhou exatamente assim, no literal `continue-on-error` da própria asserção.
  // Por isso cada agulha é montada em tempo de execução, a partir de fragmentos que nunca
  // formam o token no código-fonte deste arquivo.
  // Cada token é montado a partir de FRAGMENTOS, e o exemplo positivo é montado dos MESMOS
  // fragmentos — assim a agulha e a prova de que ela funciona nascem juntas, e nenhuma das
  // duas escreve o token inteiro no fonte deste arquivo.
  const j = (...partes) => partes.join('');
  const TOKENS = [
    ['escape de teste', [j('.', 'sk', 'ip', '('), j('.', 'on', 'ly', '('), j('.', 'to', 'do', '(')]],
    ['supressão de erro', [j('|', '|', ' ', 'tr', 'ue')]],
    ['supressão de tipo', [j('@', 'ts', '-', 'ignore'), j('@', 'ts', '-', 'nocheck')]],
    ['continuação após erro no CI', [j('continue', '-', 'on', '-', 'error')]],
    ['silenciamento de shell', [j('set', ' ', '+', 'e')]],
  ];
  const contem = (src, tokens) => tokens.some((t) => src.includes(t));
  // A varredura precisa ser capaz de reprovar, ou a frase seria vazia.
  for (const [rotulo, tokens] of TOKENS) {
    for (const t of tokens) {
      assert.ok(contem(`prefixo ${t} sufixo`, tokens), `a agulha "${rotulo}" não detecta nem o caso óbvio: ${t}`);
    }
    assert.equal(contem('nada de suspeito aqui', tokens), false, rotulo);
  }
  for (const rel of [TEST_REL, GATE_REL, SECURITY_GATE_REL, SUITE_REL, ...BACKEND_TOCADOS.slice(2)]) {
    const src = code(rel);
    for (const [rotulo, tokens] of TOKENS) assert.equal(contem(src, tokens), false, `${rotulo} em ${rel}`);
  }
});

test('F007 a evidência desta fatia é substantiva, não um marcador vazio', () => {
  const doc = read(`${EV_REL}/README.md`);
  assert.ok(doc.length > 1200, `evidência com ${doc.length} caracteres`);
  assert.match(doc, /tenant/i);
  assert.match(doc, /\$transaction|atomic/i);
  assert.match(doc, /G403/);
});
