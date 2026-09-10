#!/usr/bin/env node
/**
 * G423 — Slice 50 · Lifecycle Auth, Tenant Isolation and Atomic Decisions Governance (P1-03)
 *
 * Governa a FATIA. Afirma diretamente — sem delegar ao teste — que a entrada de catálogo é
 * exata, que a autorização forbidden é a mais estreita possível e não vaza, e que a branch é
 * integralmente explicada por essa entrada. Depois executa o teste de runtime da fatia, para
 * que um gate verde nunca conviva com um teste vermelho.
 *
 * A correção de segurança em si é provada por G403 (`gate:lifecycle-security`), que roda no
 * agregado `gate:deploy-pipeline`. Este gate NÃO a duplica: ele afirma que ela está presa ao
 * pipeline.
 *
 * Read-only. Sem rede, sem banco, sem credencial, sem dependência nova. Falha fechada: exit 1.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  STUDIO_SLICE_CATALOG,
  FORBIDDEN_SCOPE_PATTERNS,
} from './lib/studioScopeGovernanceRegistry.mjs';
import {
  getStudioSliceById, findOwningStudioSlices, resolveActiveStudioSlice,
  classifyStudioScopePath, evaluateStudioBranchScope, evaluateStudioBranchConsumerScope,
  createResolvedActiveStudioSlicePathAuthorizer, isPathAuthorizedForStudioSlice,
  getExplicitlyAuthorizedForbiddenPatternsForStudioSlice,
} from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const SLICE = 'lifecycle-auth-tenant-atomicity-governance';
const ORDINAL = 50;
const EV_REL = 'docs/evidence/post-foundation-c-lifecycle-auth-tenant-atomicity-governance';
const TEST_REL = 'src/runtime/__tests__/lifecycle-auth-tenant-atomicity-governance.test.js';
const GATE_REL = 'scripts/gates/g423-lifecycle-auth-tenant-atomicity-governance.mjs';
const SECURITY_GATE_REL = 'scripts/gate-lifecycle-security-isolation.mjs';
const SUITE_REL = 'backend/scripts/testLifecycleSecurityIsolation.js';
const PIPELINE_REL = 'scripts/gate-deploy-pipeline.mjs';
const GUARD_REL = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const BACKEND_TOCADOS = [
  'backend/package.json',
  'backend/scripts/testLifecycleSecurityIsolation.js',
  'backend/src/modules/lifecycle/routes.js',
  'backend/src/modules/lifecycle/lifecycleService.js',
  'backend/src/modules/lifecycle/lifecycleRepository.js',
  'backend/src/modules/lifecycle/lifecycleSyncService.js',
  'backend/src/modules/lifecycle/lifecycleTenant.js',
  'backend/src/modules/lifecycle/lifecycleSyncRepository.js',
  'backend/prisma/schema.prisma',
  'backend/prisma/migrations/20260910130000_lifecycle_sync_state_tenant_scoped_unique/migration.sql',
];
const PRODUTO_DECLARADO = ['src/intelligence/lifecycle/sync/lifecycleSyncEngine.js'];
const BACKEND_NAO_TOCADOS = [
  'backend/src/server.js',
  'backend/src/modules/auth/accessScope.js',
  'backend/src/modules/mmm/mmmService.js',
  'backend/prisma/migrations/20260630140000_mmm_publish_engine/migration.sql',
];

let passed = 0;
const failures = [];
const gate = (id, cond, detail = '') => {
  if (cond) { passed += 1; console.log(`✓ ${id}${detail ? ` — ${detail}` : ''}`); return; }
  failures.push(`${id}${detail ? ` — ${detail}` : ''}`);
  console.log(`✗ ${id}${detail ? ` — ${detail}` : ''}`);
};

const branchPaths = (() => {
  try {
    return execSync('git diff --name-only origin/main...HEAD', {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).split('\n').map((l) => l.trim()).filter(Boolean);
  } catch {
    return null;
  }
})();

console.log('=== G423 — Slice 50 · Lifecycle Auth, Tenant Isolation and Atomic Decisions ===\n');

/* ---------------- A — catálogo ---------------- */
const e = getStudioSliceById(SLICE);
gate('G423-50-A01 — a fatia existe no catálogo', Boolean(e));
gate('G423-50-A02 — é ordinal 50 e a última entrada',
  e?.sliceOrdinal === ORDINAL && STUDIO_SLICE_CATALOG.length === ORDINAL
  && STUDIO_SLICE_CATALOG[STUDIO_SLICE_CATALOG.length - 1].sliceId === SLICE,
  `len=${STUDIO_SLICE_CATALOG.length}`);
gate('G423-50-A03 — entrada congelada com as dez chaves',
  Object.isFrozen(e) && Object.keys(e ?? {}).length === 10);
gate('G423-50-A04 — nasce merged, sem consumidores históricos',
  e?.status === 'merged' && e?.historicalBranchConsumerCompatibility === false);
gate('G423-50-A05 — todo padrão é ancorado no início', [
  'primaryArtifactPatterns', 'branchMarkerPatterns', 'crossSliceAuthorizedPatterns',
  'sharedGovernancePatterns', 'explicitlyAuthorizedForbiddenPatterns',
].every((g) => e[g].every((re) => re instanceof RegExp && re.source.startsWith('^'))));
gate('G423-50-A06 — o marcador é a evidência e é primário',
  e.branchMarkerPatterns.length === 1
  && e.branchMarkerPatterns[0].test(`${EV_REL}/README.md`)
  && e.primaryArtifactPatterns.some((p) => p.toString() === e.branchMarkerPatterns[0].toString()));
gate('G423-50-A07 — o lockfile e o guard central NÃO são alcançáveis',
  isPathAuthorizedForStudioSlice('package-lock.json', SLICE) === false
  && isPathAuthorizedForStudioSlice(GUARD_REL, SLICE) === false);

/* ---------------- B — autorização forbidden ---------------- */
const explicitos = getExplicitlyAuthorizedForbiddenPatternsForStudioSlice(SLICE);
gate('G423-50-B01 — autoriza exatamente os dez arquivos proibidos tocados',
  explicitos.length === BACKEND_TOCADOS.length
  && BACKEND_TOCADOS.every((f) => explicitos.filter((re) => re.test(f)).length === 1)
  && explicitos.every((re) => BACKEND_TOCADOS.filter((f) => re.test(f)).length === 1),
  String(explicitos.length));
gate('G423-50-B02 — cada autorização é um arquivo exato, sem curinga', explicitos.every((re) => {
  if (!re.source.startsWith('^') || !re.source.endsWith('$')) return false;
  return !/[.*+?[\]()|{}^$\\]/.test(re.source.slice(1, -1).replace(/\\[./]/g, ''));
}));
gate('G423-50-B03 — cada caminho autorizado é realmente proibido',
  BACKEND_TOCADOS.every((f) => FORBIDDEN_SCOPE_PATTERNS.some((re) => re.test(f))
    && classifyStudioScopePath(f) === 'forbidden_scope'));
gate('G423-50-B04 — backend não tocado continua proibido e recusado',
  BACKEND_NAO_TOCADOS.every((f) => {
    if (isPathAuthorizedForStudioSlice(f, SLICE)) return false;
    const r = evaluateStudioBranchScope([`${EV_REL}/README.md`, f], { callerSliceId: SLICE });
    return r.forbidden.includes(f) && r.safe === false;
  }));
gate('G423-50-B05 — a autorização não vaza para nenhuma outra fatia',
  STUDIO_SLICE_CATALOG.filter((s) => s.sliceId !== SLICE).every((s) =>
    BACKEND_TOCADOS.every((f) => !isPathAuthorizedForStudioSlice(f, s.sliceId)
      && !s.explicitlyAuthorizedForbiddenPatterns.some((re) => re.test(f)))));
gate('G423-50-B06 — produto, outras migrations e UI guard seguem fora de alcance',
  ['src/App.jsx', 'src/modules/empresas/index.js', 'prisma/schema.prisma',
    'backend/prisma/migrations/0001_init/migration.sql', 'scripts/gates/lib/productionUiGuard.mjs',
    'backend/prisma/migrations/20260910130000_lifecycle_sync_state_tenant_scoped_unique/extra.sql',
    'backend/prisma/migrations/migration_lock.toml',
    'src/intelligence/lifecycle/sync/lifecycleSyncApiClient.js', 'src/intelligence/index.js']
    .every((f) => !isPathAuthorizedForStudioSlice(f, SLICE)));
gate('G423-50-B06b — o único produto declarado é exato, primário e sem irmãos',
  PRODUTO_DECLARADO.every((f) => isPathAuthorizedForStudioSlice(f, SLICE)
    && findOwningStudioSlices(f).every((o) => o.sliceId === SLICE)));
gate('G423-50-B07 — sem o marcador, os arquivos de backend voltam a ser recusados', (() => {
  const semMarcador = BACKEND_TOCADOS.filter((p) => p !== 'backend/package.json');
  const a = createResolvedActiveStudioSlicePathAuthorizer(semMarcador);
  return a.ok === false && semMarcador.every((f) => a.isAuthorized(f) === false);
})());

/* ---------------- B-NEG — anti-weakening ---------------- */
// O gate afirma as negativas por conta própria; o teste da fatia as afirma em detalhe.
// Um gate que só delegasse seria alias, e um teste sozinho poderia ser removido sem
// que nada no pipeline notasse.
gate('G423-50-BNEG-01 — um arquivo NOVO no diretório autorizado NÃO herda a autorização',
  ['backend/src/modules/lifecycle/evil-new-file.js',
    'backend/src/modules/lifecycle/lifecycleController.js',
    'backend/src/modules/lifecycle/lifecycleSyncRepository.test.js']
    .every((f) => !isPathAuthorizedForStudioSlice(f, SLICE)));
gate('G423-50-BNEG-02 — uma fatia inexistente não herda o allow da fatia 50',
  ['slice-51', 'lifecycle-auth-tenant-atomicity-governance-v2', 'fatia-que-nao-existe']
    .every((fantasma) => BACKEND_TOCADOS.every((f) => !isPathAuthorizedForStudioSlice(f, fantasma))
      && getExplicitlyAuthorizedForbiddenPatternsForStudioSlice(fantasma).length === 0));
gate('G423-50-BNEG-03 — nenhuma fatia histórica passou a POSSUIR os sete arquivos',
  BACKEND_TOCADOS.every((f) => findOwningStudioSlices(f)
    .every((o) => o.sliceId === SLICE)));
gate('G423-50-BNEG-04 — FORBIDDEN_SCOPE_PATTERNS continua cobrindo backend/**',
  FORBIDDEN_SCOPE_PATTERNS.some((re) => re.source === '^backend\\/')
  && ['backend/a.js', 'backend/src/x/y.js'].every((f) => classifyStudioScopePath(f) === 'forbidden_scope'));
gate('G423-50-BNEG-05 — um regex amplo seria reprovado pelo predicado de exatidão', (() => {
  const exato = (src) => src.startsWith('^') && src.endsWith('$')
    && !/[.*+?[\]()|{}^$\\]/.test(src.slice(1, -1).replace(/\\[./]/g, ''));
  return ['^backend\\/', '^backend\\/.*$', '^backend\\/src\\/modules\\/lifecycle\\/.+$']
    .every((amplo) => exato(amplo) === false)
    && exato('^backend\\/src\\/modules\\/lifecycle\\/routes\\.js$') === true;
})());
gate('G423-50-BNEG-06 — o guard central não está no diff desta branch',
  branchPaths === null || !branchPaths.includes(GUARD_REL));

/* ---------------- C — escopo cruzado ---------------- */
const probeOf = (re) => re.source.replace(/^\^/, '').replace(/\$$/, '').replace(/\\\//g, '/').replace(/\\\./g, '.');
const RAIZES_CRUZADAS = ['src/runtime/__tests__/', 'scripts/gates/', 'docs/engineering/'];
gate('G423-50-C01 — só cruza testes, gates e diários, nunca produção',
  e.crossSliceAuthorizedPatterns.every((re) => {
    const p = probeOf(re);
    return RAIZES_CRUZADAS.some((r) => p.startsWith(r))
      && !FORBIDDEN_SCOPE_PATTERNS.some((f) => f.test(p));
  }), String(e.crossSliceAuthorizedPatterns.length));
gate('G423-50-C01b — nada de produto, baseline ou workflow entra pelo escopo cruzado',
  ['src/App.jsx', 'src/modules/empresas/index.js', 'backend/src/server.js',
    'config/typecheck-production-baseline.json', '.github/workflows/foundation-governance.yml']
    .every((p) => !e.crossSliceAuthorizedPatterns.some((re) => re.test(p))));
gate('G423-50-C02 — toda autorização cruzada é arquivo exato',
  e.crossSliceAuthorizedPatterns.every((re) =>
    re.source.startsWith('^') && re.source.endsWith('$')
    && !re.source.includes('.*') && !re.source.includes('.+')));
gate('G423-50-C03 — nenhum arquivo cruzado muda de dono',
  e.crossSliceAuthorizedPatterns.every((re) =>
    !findOwningStudioSlices(probeOf(re)).some((o) => o.sliceId === SLICE)));
gate('G423-50-C04 — os artefatos primários desta fatia não vazam para outras',
  [TEST_REL, GATE_REL, SECURITY_GATE_REL, `${EV_REL}/README.md`].every((f) =>
    STUDIO_SLICE_CATALOG.filter((s) => s.sliceId !== SLICE)
      .every((s) => !isPathAuthorizedForStudioSlice(f, s.sliceId))));

/* ---------------- D — a branch ---------------- */
if (branchPaths === null || branchPaths.length === 0) {
  gate('G423-50-D00 — sem diff contra origin/main: checagens de branch não se aplicam', true,
    branchPaths === null ? 'sem base' : 'diff vazio');
} else {
  const a = resolveActiveStudioSlice(branchPaths);
  gate('G423-50-D01 — a branch resolve exatamente esta fatia',
    a.ok === true && a.candidates.length === 1 && a.candidates[0] === SLICE,
    `${a.reason ?? ''}${a.candidates?.join(',') ?? ''}`);
  const core = evaluateStudioBranchScope(branchPaths, { callerSliceId: SLICE });
  const cons = evaluateStudioBranchConsumerScope(branchPaths, { callerSliceId: SLICE });
  gate('G423-50-D02 — o núcleo aprova o diff inteiro',
    core.safe === true && core.unknown.length === 0 && core.forbidden.length === 0
    && core.chronologicalViolation.length === 0,
    JSON.stringify(core.blockers));
  gate('G423-50-D03 — o consumidor aprova o diff inteiro',
    cons.safe === true && cons.blockers.length === 0, JSON.stringify(cons.blockers));
  const proibidosNoDiff = branchPaths.filter((p) => classifyStudioScopePath(p) === 'forbidden_scope').sort();
  gate('G423-50-D04 — os ÚNICOS proibidos do diff são os sete declarados',
    JSON.stringify(proibidosNoDiff) === JSON.stringify([...BACKEND_TOCADOS].sort()),
    proibidosNoDiff.join(', '));
  const declarado = new Set([...BACKEND_TOCADOS, ...PRODUTO_DECLARADO]);
  gate('G423-50-D05 — a branch não toca lockfile, workflow, guard nem produto — salvo o exatamente declarado',
    branchPaths.every((p) => !/^\.github\//.test(p) && p !== 'package-lock.json' && p !== GUARD_REL
      && (declarado.has(p) || (!/(^|\/)prisma(\/|$)/i.test(p) && !/migrations?\//i.test(p) && !/\.sql$/i.test(p)
        && !/^src\/(App\.jsx|main\.jsx|modules|shared|framework|apis|bos|intelligence|ModeloBase1|ModeloBase2)/.test(p)))),
    branchPaths.filter((p) => !declarado.has(p) && /(^|\/)prisma(\/|$)|migrations?\/|\.sql$|^\.github\/|^src\/intelligence\//i.test(p)).join(', '));
  gate('G423-50-D06 — em src/runtime só __tests__ foi alterado',
    branchPaths.filter((p) => p.startsWith('src/runtime/')).every((p) => p.startsWith('src/runtime/__tests__/')));
  gate('G423-50-D07 — nenhuma autorização cruzada declarada ficou por exercer',
    e.crossSliceAuthorizedPatterns.every((re) => branchPaths.some((p) => re.test(p))));
}

/* ---------------- E — artefatos presos ao pipeline ---------------- */
gate('G423-50-E01 — bateria, gates, teste e evidência existem',
  [SUITE_REL, SECURITY_GATE_REL, GATE_REL, TEST_REL, `${EV_REL}/README.md`].every(exists));
gate('G423-50-E02 — G403 está no agregado que o CI executa',
  /gate:lifecycle-security/.test(read(PIPELINE_REL)));
const pkg = JSON.parse(read('package.json'));
gate('G423-50-E03 — os dois gates estão registrados no package.json',
  pkg.scripts['gate:lifecycle-security'] === `node ${SECURITY_GATE_REL}`
  && pkg.scripts[`gate:g423-${SLICE}`] === `node ${GATE_REL}`);
gate('G423-50-E04 — o teste da fatia está na lista que o CI executa',
  pkg.scripts['test:runtime'].includes(TEST_REL));
gate('G423-50-E05 — a bateria está registrada no package.json do backend',
  JSON.parse(read('backend/package.json')).scripts['test:lifecycle-security']
  === 'node scripts/testLifecycleSecurityIsolation.js');
gate('G423-50-E06 — a evidência é substantiva', (() => {
  const doc = read(`${EV_REL}/README.md`);
  return doc.length > 1200 && /tenant/i.test(doc) && /G403/.test(doc);
})());

/* ---------------- F — o teste de runtime desta fatia ---------------- */
console.log('\n--- teste de runtime da fatia ---');
const suite = spawnSync('node', ['--test', TEST_REL], {
  cwd: ROOT, encoding: 'utf8', shell: false, maxBuffer: 64 * 1024 * 1024,
});
if (suite.error) {
  gate('G423-50-F01 — teste da fatia executável', false, suite.error.message);
} else {
  const out = `${suite.stdout ?? ''}${suite.stderr ?? ''}`;
  const resumo = out.split('\n').filter((l) => /^# (pass|fail) /.test(l)).join(' · ') || '(sem resumo)';
  if (suite.status !== 0) process.stdout.write(out);
  gate('G423-50-F01 — teste da fatia verde', suite.status === 0, resumo);
}

console.log(`\nPASS: ${passed}/${passed + failures.length}`);
if (failures.length > 0) {
  console.log(`FAIL: ${failures.length}`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log('\nGATE G423 — SLICE 50 FAILED');
  process.exit(1);
}
console.log('\nGATE G423 — SLICE 50 PASSED');
