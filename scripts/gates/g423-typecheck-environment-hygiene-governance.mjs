#!/usr/bin/env node
/**
 * GATE G423 — SLICE 48 · TYPECHECK ENVIRONMENT HYGIENE GOVERNANCE
 *
 * Prova o contrato essencial da fatia sem duplicar a suíte dedicada:
 * catálogo 48/48, propriedade estreita, zero curinga, zero autorização proibida,
 * package-lock e guard fora das autorizações, config de produção presente,
 * a branch resolvendo a Slice 48, fail-closed preservado, P1-02B não iniciada.
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
} from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const SLICE = 'typecheck-environment-hygiene-governance';
const ORDINAL_48 = 48;
const TEST_REL = `src/runtime/__tests__/${SLICE}.test.js`;
const GATE_REL = `scripts/gates/g423-${SLICE}.mjs`;
const EV_REL = `docs/evidence/post-foundation-c-${SLICE}`;

const CROSS_CORRECTED = [
  'src/runtime/__tests__/studio-scope-governance-non-studio-branch-applicability.test.js',
  'scripts/gates/g423-studio-scope-governance-non-studio-branch-applicability.mjs',
  'src/runtime/__tests__/studio-scope-governance-non-studio-runtime-compatibility.test.js',
  'scripts/gates/g423-studio-scope-governance-non-studio-runtime-compatibility.mjs',
];

const OWN_NON_GOVERNED = [
  'jsconfig.typecheck.json',
  'scripts/run-typecheck-governance.mjs',
  'scripts/run-governance-cycles.mjs',
  'scripts/tests/typecheck-scope-governance.test.mjs',
  'AGENTS.md',
  'docs/ai/skills/dev-workflow.md',
  'docs/engineering/CURRENT-STATE.md',
  'docs/engineering/TECH-DEBT.md',
  'docs/engineering/ENGINEERING-JOURNAL.md',
  'docs/engineering/P1-02A-TYPECHECK-ENVIRONMENT-HYGIENE-REPORT.md',
];

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
const consumer = (paths) => evaluateStudioBranchConsumerScope(paths, { callerSliceId: SLICE });
const branchPaths = (() => {
  try {
    return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' })
      .trim().split('\n').filter(Boolean);
  } catch { return null; }
})();

console.log('=== G423 — Slice 48 · Typecheck Environment Hygiene Governance ===\n');

/* ---------------- catálogo ---------------- */
gate('G423-48-C01 — catálogo com 49 entradas', STUDIO_SLICE_CATALOG.length === 49,
  String(STUDIO_SLICE_CATALOG.length));
gate('G423-48-C02 — ordinais contíguos 1..48',
  STUDIO_SLICE_CATALOG.every((s, i) => s.sliceOrdinal === i + 1));
gate('G423-48-C03 — sliceIds únicos',
  new Set(STUDIO_SLICE_CATALOG.map((s) => s.sliceId)).size === STUDIO_SLICE_CATALOG.length);
gate('G423-48-C04 — a entrada 48 é esta fatia', Boolean(entry) && entry.sliceOrdinal === 48);
gate('G423-48-C05 — status merged', entry?.status === 'merged');
gate('G423-48-C06 — catálogo congelado',
  Object.isFrozen(STUDIO_SLICE_CATALOG) && STUDIO_SLICE_CATALOG.every(Object.isFrozen));

if (!entry) {
  console.log('\nEntrada 48 ausente — gate encerrado.');
  process.exit(1);
}

/* ---------------- propriedade ---------------- */
gate('G423-48-O01 — marker único', entry.branchMarkerPatterns.length === 1
  && entry.branchMarkerPatterns[0].test(`${EV_REL}/README.md`));
gate('G423-48-O02 — nenhuma outra fatia reivindica este marker',
  STUDIO_SLICE_CATALOG.filter((s) => s.sliceId !== SLICE)
    .every((s) => !s.branchMarkerPatterns.some((m) => m.test(`${EV_REL}/README.md`))));
gate('G423-48-O03 — os três artefatos canônicos são próprios',
  [TEST_REL, GATE_REL, `${EV_REL}/README.md`]
    .every((f) => entry.primaryArtifactPatterns.some((r) => r.test(f))));
gate('G423-48-O04 — cada artefato próprio não-governado casa exatamente um padrão',
  OWN_NON_GOVERNED.every((f) => entry.primaryArtifactPatterns.filter((r) => r.test(f)).length === 1));
gate('G423-48-O05 — nenhum curinga amplo em artefato primário',
  entry.primaryArtifactPatterns.every((r) =>
    r.source.startsWith('^') && !r.source.includes('.*') && !r.source.includes('.+')));
gate('G423-48-O06 — governança compartilhada é exatamente registry + package.json',
  entry.sharedGovernancePatterns.length === 2
  && entry.sharedGovernancePatterns.some((r) => r.test('scripts/gates/lib/studioScopeGovernanceRegistry.mjs'))
  && entry.sharedGovernancePatterns.some((r) => r.test('package.json')));
gate('G423-48-O07 — uma autorização cruzada por consumidor de cardinalidade quebrado',
  entry.crossSliceAuthorizedPatterns.length === CROSS_CORRECTED.length
  && CROSS_CORRECTED.length === 4
  && CROSS_CORRECTED.every((f) => entry.crossSliceAuthorizedPatterns.filter((r) => r.test(f)).length === 1)
  && entry.crossSliceAuthorizedPatterns.every((r) => CROSS_CORRECTED.filter((f) => r.test(f)).length === 1),
  String(entry.crossSliceAuthorizedPatterns.length));
gate('G423-48-O07b — toda autorização cruzada é ancorada, sem curinga',
  entry.crossSliceAuthorizedPatterns.every((r) =>
    r.source.startsWith('^') && r.source.endsWith('$')
    && !r.source.includes('.*') && !r.source.includes('.+')));
gate('G423-48-O08 — zero autorização explícita de caminho proibido',
  entry.explicitlyAuthorizedForbiddenPatterns.length === 0);

const todosPadroes = [...entry.primaryArtifactPatterns, ...entry.sharedGovernancePatterns,
  ...entry.crossSliceAuthorizedPatterns];
gate('G423-48-O09 — package-lock NÃO autorizado (não muda nesta fatia)',
  !todosPadroes.some((r) => r.test('package-lock.json')));
gate('G423-48-O10 — guards NÃO autorizados (não são alterados)',
  !todosPadroes.some((r) => r.test('scripts/gates/lib/studioScopeGovernanceGuard.mjs'))
  && !todosPadroes.some((r) => r.test('scripts/gates/lib/productionUiGuard.mjs')));
gate('G423-48-O11 — nenhum padrão admite produto, backend, Prisma ou workflow',
  ['backend/src/server.js', 'src/App.jsx', 'src/main.jsx', 'prisma/schema.prisma',
    'src/modules/x.js', 'src/shared/ui/x.jsx', '.github/workflows/foundation-governance.yml']
    .every((f) => !todosPadroes.some((r) => r.test(f))));

/* ---------------- artefatos ---------------- */
gate('G423-48-S01 — teste presente', fs.existsSync(path.join(ROOT, TEST_REL)));
gate('G423-48-S02 — gate presente', fs.existsSync(path.join(ROOT, GATE_REL)));
gate('G423-48-S03 — evidência presente',
  fs.existsSync(path.join(ROOT, EV_REL)) && fs.readdirSync(path.join(ROOT, EV_REL)).length >= 2);

/* ---------------- P1-02A preservada ---------------- */
const prodCfgExists = fs.existsSync(path.join(ROOT, 'jsconfig.typecheck.json'));
gate('G423-48-P01 — config de produção presente', prodCfgExists);
if (prodCfgExists) {
  const prod = JSON.parse(read('jsconfig.typecheck.json'));
  const base = JSON.parse(read('jsconfig.json'));
  gate('G423-48-P02 — estende o config base', prod.extends === './jsconfig.json');
  gate('G423-48-P03 — types: [] preservado, não redeclarado',
    Array.isArray(base.compilerOptions.types) && base.compilerOptions.types.length === 0
    && prod.compilerOptions?.types === undefined);
  const novas = (prod.exclude ?? []).filter((e) => !new Set(base.exclude ?? []).has(e));
  gate('G423-48-P04 — única exclusão nova é src/runtime/__tests__',
    novas.length === 1 && novas[0] === 'src/runtime/__tests__', JSON.stringify(novas));
}
const cfgDir = path.join(ROOT, 'config');
// Supersessão P1-02B: nasceu afirmando a AUSÊNCIA da baseline, porque criá-la era
// escopo da fatia seguinte. A fatia seguinte chegou, e a verificação passa a exigir que
// a baseline exista, seja única e respeite o escopo de produção que ESTA fatia definiu.
gate('G423-48-P05 — a baseline de typecheck existe, é única e respeita este escopo', (() => {
  if (!fs.existsSync(cfgDir)) return false;
  const b = fs.readdirSync(cfgDir).filter((f) => /baseline/i.test(f) && /typecheck/i.test(f));
  if (b.length !== 1 || b[0] !== 'typecheck-production-baseline.json') return false;
  const doc = JSON.parse(fs.readFileSync(path.join(cfgDir, b[0]), 'utf8'));
  return doc.project === './jsconfig.typecheck.json'
    && Array.isArray(doc.entries) && doc.entries.length > 0
    && doc.entries.every((e) => !String(e.path).startsWith('src/runtime/__tests__/'));
})());
const pkg = JSON.parse(read('package.json'));
gate('G423-48-P06 — scripts da fatia registrados na convenção do repositório',
  pkg.scripts[`test:runtime:${SLICE}`] === `node --test ${TEST_REL}`
  && pkg.scripts[`gate:g423-${SLICE}`] === `node ${GATE_REL}`);
gate('G423-48-P07 — o teste da fatia entra em test:runtime',
  pkg.scripts['test:runtime'].includes(TEST_REL));
gate('G423-48-P08 — nenhuma dependência adicionada',
  pkg.devDependencies['@types/node'] === '^22.13.5' && pkg.dependencies?.['@types/node'] === undefined);
// Supersessão P1-02B: esta verificação exigia que o bypass permanecesse EXPLÍCITO
// enquanto existisse — a fatia 48 não podia removê-lo, mas também não podia disfarçá-lo.
// P1-02B o removeu de fato, e exigir hoje a marca `BYPASS CONHECIDO` seria exigir que o
// bypass voltasse. A verificação não some: passa a exigir o estado que a substituiu.
gate('G423-48-P09 — o wrapper deixou de ser ponte permissiva (blocker fechado por P1-02B)', (() => {
  const src = read('scripts/run-typecheck-governance.mjs');
  return src.includes('P1-02B') && /FAIL-CLOSED/.test(src) && src.includes('compareToBaseline');
})());

/* ---------------- a branch atual ---------------- */
if (branchPaths === null || branchPaths.length === 0) {
  gate('G423-48-B00 — sem diff de branch para julgar (main)', true);
} else {
  const a = resolveActiveStudioSlice(branchPaths);
  // ESCOPO DE BRANCH PROPRIA (P1-02B): uma fatia ESTRITAMENTE POSTERIOR pode ser a ativa.
  // A resolucao inequivoca nunca e dispensada; o que passa a ser aceito e que a fatia
  // eleita seja esta OU uma posterior, e nesse caso a inaplicabilidade e afirmada.
  const posterior = a.ok && a.sliceOrdinal > ORDINAL_48;
  gate('G423-48-B01 — a branch resolve exatamente a Slice 48, ou uma fatia posterior',
    a.ok === true && a.candidates.length === 1
    && (a.candidates[0] === SLICE
      || (posterior && consumer(branchPaths).certifiedAgainstActiveSlice === false
        && consumer(branchPaths).blockers.length === 0)),
    JSON.stringify(a.candidates));
  const r = consumer(branchPaths);
  gate('G423-48-B02 — a branch é sound', r.safe === true, JSON.stringify(r.blockers));
  gate('G423-48-B03 — zero unknown', r.unknown.length === 0, JSON.stringify(r.unknown));
  gate('G423-48-B04 — zero forbidden', r.forbidden.length === 0, JSON.stringify(r.forbidden));
  gate('G423-48-B05 — zero violação cronológica', r.chronologicalViolation.length === 0);
  gate('G423-48-B06 — o núcleo também aprova',
    evaluateStudioBranchScope(branchPaths, { callerSliceId: SLICE }).safe === true);
  // `.github/**` e regra de branch PROPRIA: a slice 49 possui o workflow. Backend, Prisma,
  // migration, produto e lockfile continuam proibidos para TODA branch — inclusive a
  // posterior — e sao verificados em G423-48-B07b logo abaixo.
  // Mesma cobertura da regra de branch propria, menos `.github/**` — o unico item cuja
  // inaplicabilidade a fatia 49 justifica. Correcao da auditoria: restaura a redundancia.
  gate('G423-48-B07b — nem a fatia posterior toca backend, Prisma, migration ou produto',
    branchPaths.every((p) => !/^backend\//.test(p) && !/^prisma\//.test(p)
      && !/migrations?\//.test(p) && p !== 'package-lock.json'
      && !/^src\/(App\.jsx|main\.jsx|shared|framework|modules|bos|intelligence|apis|ModeloBase1|ModeloBase2)/.test(p)));
  if (posterior) {
    gate('G423-48-B07 — regra de branch própria inaplicável: a fatia ativa é posterior',
      consumer(branchPaths).certifiedAgainstActiveSlice === false
      && consumer(branchPaths).safe === true,
      `ativa=${a.sliceOrdinal}`);
  } else
  gate('G423-48-B07 — a branch não toca produto, backend, Prisma, migration ou workflow',
    branchPaths.every((p) => !/^backend\//.test(p) && !/^prisma\//.test(p)
      && !/migrations?\//.test(p) && !/^\.github\//.test(p) && p !== 'package-lock.json'
      && !/^src\/(App\.jsx|main\.jsx|shared|framework|modules|bos|intelligence|apis|ModeloBase1|ModeloBase2)/.test(p)));
  gate('G423-48-B08 — a única alteração em src/runtime é sob __tests__',
    branchPaths.filter((p) => p.startsWith('src/runtime/'))
      .every((p) => p.startsWith('src/runtime/__tests__/')));
  gate('G423-48-B09 — guards ausentes do diff',
    !branchPaths.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs')
    && !branchPaths.includes('scripts/gates/lib/productionUiGuard.mjs'));
}

/* ---------------- fail-closed ---------------- */
const BASE = ['package.json', 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs',
  TEST_REL, GATE_REL, `${EV_REL}/README.md`, ...OWN_NON_GOVERNED];
for (const [rot, intruso] of [
  ['unregistered Studio', 'src/studio/unregistered-future-artifact.js'],
  ['unregistered runtime', 'src/runtime/__tests__/unregistered-future.test.js'],
  ['unregistered gate', 'scripts/gates/unregistered-future-gate.mjs'],
  ['forbidden backend', 'backend/src/server.js'],
  ['forbidden UI', 'src/App.jsx'],
  ['forbidden prisma', 'prisma/schema.prisma'],
]) {
  const r = consumer([...BASE, intruso]);
  gate(`G423-48-N01 — fail-closed com ${rot}`, r.safe === false, `reason=${r.reason}`);
}
gate('G423-48-N02 — o núcleo reprova o diff misto',
  evaluateStudioBranchScope([...BASE, 'backend/src/server.js'], { callerSliceId: SLICE }).safe === false);
const vazio = consumer([]);
gate('G423-48-N03 — diff vazio continua empty_branch_diff',
  vazio.reason === 'empty_branch_diff' && vazio.activeSliceId === null && vazio.safe === true);
gate('G423-48-N04 — o diff próprio, isolado, é seguro', consumer([...BASE]).safe === true);

console.log('\n--- G423 Slice 48 summary ---');
console.log(`PASS: ${passed}/${passed + failures.length}`);
if (failures.length > 0) {
  console.log('\nFALHAS:');
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log('\nGATE G423 SLICE 48 FAILED');
  process.exit(1);
}
console.log('GATE G423 SLICE 48 PASSED');
