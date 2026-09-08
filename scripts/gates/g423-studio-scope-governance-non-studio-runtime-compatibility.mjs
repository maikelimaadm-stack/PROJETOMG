#!/usr/bin/env node
/**
 * GATE G423 — SLICE 47 · STUDIO SCOPE GOVERNANCE NON-STUDIO RUNTIME COMPATIBILITY
 *
 * Verifica, de forma estática e comportamental, que:
 *   - o catálogo tem 48 entradas contíguas e as 1..46 seguem íntegras;
 *   - as autorizações da fatia 47 são exatas, sem wildcard e sem caminho proibido;
 *   - os catorze consumidores corrigidos reconhecem `non_studio_branch` e o PROVAM;
 *   - nenhum deles usa skip/todo/only, env, nome de branch ou lista de caminhos;
 *   - governed / mixed / unknown / forbidden e o núcleo continuam fail-closed;
 *   - o diff vazio continua sendo um estado distinto.
 *
 * Read-only. Sem rede, sem banco, sem credencial, sem dependência nova.
 * Falha fechada: qualquer verificação vermelha encerra com exit 1.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  STUDIO_SLICE_CATALOG,
  STUDIO_GOVERNED_DOMAIN_PATTERNS,
  FORBIDDEN_SCOPE_PATTERNS,
} from './lib/studioScopeGovernanceRegistry.mjs';
import {
  evaluateStudioBranchScope,
  evaluateStudioBranchConsumerScope,
  evaluateStudioBranchDiffScope,
  resolveActiveStudioSlice,
  isStudioGovernedDomainPath,
  classifyStudioScopePath,
} from './lib/studioScopeGovernanceGuard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const SLICE = 'studio-scope-governance-non-studio-runtime-compatibility';
const TEST_REL = `src/runtime/__tests__/${SLICE}.test.js`;
const GATE_REL = `scripts/gates/g423-${SLICE}.mjs`;
const EV_REL = `docs/evidence/post-foundation-c-${SLICE}`;
const WORKFLOW = '.github/workflows/foundation-governance.yml';

const CORRECTED = [
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
];

// O gate da fatia 46 repete as cardinalidades do catálogo do teste dela e por isso também
// é corrigido — e também autorizado, um arquivo, um padrão.
const CORRECTED_GATES = [
  'scripts/gates/g423-studio-scope-governance-non-studio-branch-applicability.mjs',
  'scripts/gates/g423-studio-scope-governance-chronological-migration.mjs',
];
const AUTHORIZED = [...CORRECTED, ...CORRECTED_GATES];

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

console.log('=== G423 — Slice 47 · Non-Studio Runtime Compatibility ===\n');

/* ---------------- catálogo ---------------- */
gate('G423-47-C01 — catálogo com 48 entradas', STUDIO_SLICE_CATALOG.length === 48,
  String(STUDIO_SLICE_CATALOG.length));
gate('G423-47-C02 — ordinais contíguos 1..47',
  STUDIO_SLICE_CATALOG.every((s, i) => s.sliceOrdinal === i + 1));
gate('G423-47-C03 — sliceIds únicos',
  new Set(STUDIO_SLICE_CATALOG.map((s) => s.sliceId)).size === STUDIO_SLICE_CATALOG.length);
gate('G423-47-C04 — a entrada 47 é esta fatia', Boolean(entry) && entry.sliceOrdinal === 47);
gate('G423-47-C05 — catálogo congelado',
  Object.isFrozen(STUDIO_SLICE_CATALOG) && STUDIO_SLICE_CATALOG.every(Object.isFrozen));
gate('G423-47-C06 — nenhuma fatia declara compatibilidade histórica',
  STUDIO_SLICE_CATALOG.every((s) => s.historicalBranchConsumerCompatibility === false));

if (!entry) {
  console.log('\nEntrada 47 ausente — gate encerrado.');
  process.exit(1);
}

/* ---------------- autorização ---------------- */
gate('G423-47-A01 — uma autorização cruzada por arquivo corrigido',
  entry.crossSliceAuthorizedPatterns.length === AUTHORIZED.length && AUTHORIZED.length === 16,
  String(entry.crossSliceAuthorizedPatterns.length));
gate('G423-47-A02 — cada arquivo corrigido casa exatamente um padrão',
  AUTHORIZED.every((f) => entry.crossSliceAuthorizedPatterns.filter((r) => r.test(f)).length === 1));
gate('G423-47-A03 — nenhum padrão cruzado sobra sem alvo',
  entry.crossSliceAuthorizedPatterns.every((p) => AUTHORIZED.filter((f) => p.test(f)).length === 1));
gate('G423-47-A12 — o gate corrigido da fatia 46 acompanha o catálogo',
  read(CORRECTED_GATES[0]).includes('forty-seven')
  && !read(CORRECTED_GATES[0]).includes('forty-six slices'));
gate('G423-47-A04 — todo padrão cruzado é ancorado',
  entry.crossSliceAuthorizedPatterns.every((p) => p.source.startsWith('^') && p.source.endsWith('$')));
gate('G423-47-A05 — nenhum curinga em autorização cruzada',
  entry.crossSliceAuthorizedPatterns.every((p) => !p.source.includes('.*') && !p.source.includes('.+')));
gate('G423-47-A06 — nenhuma autorização cruzada admite caminho proibido',
  entry.crossSliceAuthorizedPatterns.every((p) =>
    !['backend/src/server.js', 'src/App.jsx', 'prisma/schema.prisma', 'src/modules/x.js']
      .some((f) => p.test(f))));
gate('G423-47-A07 — zero autorização explícita de caminho proibido',
  entry.explicitlyAuthorizedForbiddenPatterns.length === 0);
gate('G423-47-A08 — marker único e estreito', entry.branchMarkerPatterns.length === 1
  && entry.branchMarkerPatterns[0].test(`${EV_REL}/README.md`));
gate('G423-47-A09 — o guard é shared, nunca cross',
  !entry.crossSliceAuthorizedPatterns.some((r) => r.test('scripts/gates/lib/studioScopeGovernanceGuard.mjs'))
  && entry.sharedGovernancePatterns.some((r) => r.test('scripts/gates/lib/studioScopeGovernanceGuard.mjs')));
gate('G423-47-A10 — nenhuma outra fatia reivindica este marker',
  STUDIO_SLICE_CATALOG.filter((s) => s.sliceId !== SLICE)
    .every((s) => !s.branchMarkerPatterns.some((m) => m.test(`${EV_REL}/README.md`))));
gate('G423-47-A11 — três artefatos primários', entry.primaryArtifactPatterns.length === 3);

/* ---------------- artefatos ---------------- */
gate('G423-47-S01 — teste da fatia presente', fs.existsSync(path.join(ROOT, TEST_REL)));
gate('G423-47-S02 — gate da fatia presente', fs.existsSync(path.join(ROOT, GATE_REL)));
gate('G423-47-S03 — evidência presente',
  fs.existsSync(path.join(ROOT, EV_REL)) && fs.readdirSync(path.join(ROOT, EV_REL)).length >= 5,
  `${fs.existsSync(path.join(ROOT, EV_REL)) ? fs.readdirSync(path.join(ROOT, EV_REL)).length : 0} docs`);

/* ---------------- consumidores corrigidos ---------------- */
for (const rel of CORRECTED) {
  const nome = path.basename(rel);
  const existe = fs.existsSync(path.join(ROOT, rel));
  if (!gate(`G423-47-R01 — presente: ${nome}`, existe)) continue;
  const src = read(rel);
  gate(`G423-47-R02 — reconhece non_studio_branch: ${nome}`, src.includes('non_studio_branch'));
  gate(`G423-47-R03 — prova o envelope: ${nome}`,
    /activeSliceId, null\)|activeSliceId === null/.test(src) && /notApplicable/.test(src));
  gate(`G423-47-R04 — sem skip/todo/only: ${nome}`,
    !/\b(test|it|describe)\.(skip|todo|only)\b/.test(src));
  gate(`G423-47-R05 — sem decisão por env: ${nome}`, !/process\.env\.GITHUB_/.test(src));
  gate(`G423-47-R06 — sem decisão por nome de branch: ${nome}`,
    !/(execSync|spawnSync)\([^)]*abbrev-ref/.test(src));
  gate(`G423-47-R07 — sem porta por caminho literal: ${nome}`, !/includes\('\.github/.test(src));
  gate(`G423-47-R08 — sem catch vazio: ${nome}`,
    !/catch\s*\{\s*\/\*\s*ignore/.test(src) && !/catch\s*\(\s*\w*\s*\)\s*\{\s*\}/.test(src));
}

/* ---------------- matriz positiva ---------------- */
const positivos = [
  ['workflow-only', [WORKFLOW]],
  ['tooling e docs', ['README.md', 'vite.config.js', 'eslint.config.js', '.gitignore']],
  ['múltiplos non-Studio', [WORKFLOW, 'README.md', '.gitignore']],
];
for (const [rotulo, paths] of positivos) {
  const r = consumer(paths);
  gate(`G423-47-B01 — non_studio_branch: ${rotulo}`,
    r.reason === 'non_studio_branch' && r.notApplicable === true && r.applicable === false
    && r.safe === true && r.activeSliceId === null && r.blockers.length === 0,
    `reason=${r.reason} safe=${r.safe}`);
}
gate('G423-47-B02 — os 47 callers concordam no diff workflow-only',
  STUDIO_SLICE_CATALOG.every((s) => {
    const r = consumer([WORKFLOW], s.sliceId);
    return r.safe === true && r.reason === 'non_studio_branch';
  }));
gate('G423-47-B03 — nenhum caminho non-Studio está no domínio governado',
  [WORKFLOW, 'README.md', 'vite.config.js', '.gitignore'].every((p) => !isStudioGovernedDomainPath(p)));

/* ---------------- matriz negativa ---------------- */
const negativos = [
  ['unregistered Studio', 'src/studio/unregistered-future-artifact.js'],
  ['unregistered runtime', 'src/runtime/__tests__/unregistered-future.test.js'],
  ['unregistered gate', 'scripts/gates/unregistered-future-gate.mjs'],
  ['forbidden backend', 'backend/src/server.js'],
  ['forbidden UI', 'src/App.jsx'],
  ['forbidden prisma', 'prisma/schema.prisma'],
];
for (const [rotulo, intruso] of negativos) {
  const r = consumer([WORKFLOW, intruso]);
  gate(`G423-47-N01 — fail-closed: workflow + ${rotulo}`,
    r.safe === false && r.reason !== 'non_studio_branch' && r.blockers.length > 0,
    `reason=${r.reason} safe=${r.safe}`);
}
const core = evaluateStudioBranchScope([WORKFLOW], { callerSliceId: SLICE });
gate('G423-47-N02 — núcleo continua fail-closed no workflow-only',
  core.safe === false && core.blockers.includes('no_active_slice_resolved')
  && core.blockers.includes('unknown_scope'), JSON.stringify(core.blockers));
gate('G423-47-N03 — workflow continua unknown_scope', classifyStudioScopePath(WORKFLOW) === 'unknown_scope');
gate('G423-47-N04 — backend continua forbidden_scope',
  classifyStudioScopePath('backend/src/server.js') === 'forbidden_scope'
  && FORBIDDEN_SCOPE_PATTERNS.some((r) => r.test('backend/src/server.js')));
gate('G423-47-N05 — raízes governadas inalteradas', STUDIO_GOVERNED_DOMAIN_PATTERNS.length === 6);
gate('G423-47-N06 — diff misto nunca lido como non-Studio',
  evaluateStudioBranchDiffScope([WORKFLOW, 'backend/src/server.js'], { callerSliceId: SLICE }).reason
    !== 'non_studio_branch');
gate('G423-47-N07 — marker duplicado continua ambíguo',
  resolveActiveStudioSlice([
    `${EV_REL}/README.md`,
    'docs/evidence/post-foundation-c-studio-scope-governance-non-studio-branch-applicability/README.md',
  ]).ok === false);
gate('G423-47-N08 — caminho Studio não registrado não entra pela porta non-Studio', (() => {
  const r = consumer(['src/studio/unregistered-future-artifact.js']);
  return r.safe === false && r.reason !== 'non_studio_branch';
})());

/* ---------------- diff vazio ---------------- */
const vazio = consumer([]);
gate('G423-47-E01 — diff vazio continua empty_branch_diff',
  vazio.reason === 'empty_branch_diff' && vazio.safe === true && vazio.activeSliceId === null,
  `reason=${vazio.reason}`);
gate('G423-47-E02 — vazio e non-Studio são estados distintos',
  evaluateStudioBranchDiffScope([], { callerSliceId: SLICE }).reason === 'empty_branch_diff'
  && evaluateStudioBranchDiffScope([WORKFLOW], { callerSliceId: SLICE }).reason === 'non_studio_branch');

/* ---------------- higiene ----------------
 * A higiene destes consumidores é verificada em R04..R08 acima, que olham para USO:
 * skip/todo/only, decisão por variável de ambiente, leitura do nome da branch, porta por
 * caminho literal e catch vazio.
 *
 * Deliberadamente NÃO se procura aqui por `continue-on-error`, `|| true` ou `set +e`:
 * são construções de YAML e de shell, sem sentido num arquivo de teste JS, e dois dos
 * arquivos corrigidos CITAM esses tokens justamente para proibi-los. Uma busca textual
 * confundiria a menção com o uso e reprovaria quem policia a mesma regra — além de
 * tornar este gate auto-falsificante ao escrever os literais no próprio código.
 */

console.log('\n--- G423 Slice 47 summary ---');
console.log(`PASS: ${passed}/${passed + failures.length}`);
if (failures.length > 0) {
  console.log('\nFALHAS:');
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log('\nGATE G423 SLICE 47 FAILED');
  process.exit(1);
}
console.log('GATE G423 SLICE 47 PASSED');
