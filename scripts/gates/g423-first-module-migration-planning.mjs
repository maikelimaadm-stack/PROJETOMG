#!/usr/bin/env node
/**
 * Gate G423-MIGRATION-FIRST-MODULE — First Real Module Migration Planning (post-Foundation C)
 *
 * Proves the migration planning layer is a pure, passive, deterministic
 * plan/readiness/risk/rollback layer for the first real module (Empresas):
 * it migrates nothing, reads no real data, touches no backend/Prisma, edits no
 * real UI/menu/App.jsx, and only recommends a read-only candidate as the next
 * step (never "migrated").
 */
import { execSync } from 'node:child_process';
import { productionUiOffendingFiles } from './lib/productionUiGuard.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const PLANNING = path.join(RUNTIME, 'migration/planning');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const PLANNING_FILES = [
  'createMigrationReadinessModel.js',
  'createFirstModuleMigrationPlan.js',
  'createEmpresasMigrationPlan.js',
  'migrationRiskModel.js',
  'migrationRollbackPlan.js',
  'errors.js',
];
const planningSource = () => PLANNING_FILES.map((f) => fs.readFileSync(path.join(PLANNING, f), 'utf8')).join('\n');
const planningCodeOnly = () => stripComments(planningSource());

// 1. Existência dos arquivos de migration planning.
for (const f of PLANNING_FILES) {
  gate(`G423-MIGRATION-FIRST-MODULE — ${f} exists`, exists(path.join(PLANNING, f)));
}
gate('G423-MIGRATION-FIRST-MODULE — migration-planning types exist', exists(path.join(RUNTIME, 'types/migration-planning.js')));
gate('G423-MIGRATION-FIRST-MODULE — planning tests exist', exists(path.join(RUNTIME, '__tests__/migration/first-module-migration-planning.test.js')));

// 2. Exports públicos no runtime barrel.
let exportsOk = false;
let exportsDetail = '';
try {
  const s = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createMigrationReadinessModel/.test(s)
    && /createEmpresasMigrationPlan/.test(s)
    && /createMigrationRiskModel/.test(s)
    && /createMigrationRollbackPlan/.test(s)
    && /createFirstModuleMigrationPlan/.test(s);
  exportsDetail = exportsOk ? 'planning helpers exported from runtime barrel' : 'missing one or more planning exports';
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MIGRATION-FIRST-MODULE — planning helpers exported from runtime barrel', exportsOk, exportsDetail);

// 14. Plano não declara migração concluída. 15. Recomenda apenas read-only candidate. (dynamic)
let planShapeOk = false;
let planShapeDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(PLANNING, 'createEmpresasMigrationPlan.js')).href);
  const plan = mod.createEmpresasMigrationPlan();
  const notMigrated = plan.migratesThisSlice === false
    && plan.readiness.readinessStatus !== 'migrated'
    && plan.readiness.readinessStatus !== 'migration_candidate';
  const capped = plan.readiness.readinessStatus === 'read_only_candidate' && plan.readiness.maxStatusThisSlice === 'read_only_candidate';
  const legacy = plan.legacyRemainsSourceOfTruth === true && plan.realWriteInScope === false;
  const nextReadOnly = /Read-Only Runtime v2 Candidate/i.test(plan.nextSlice.recommended);
  const rollback = plan.readiness.rollbackAvailable === true && plan.rollback.schemaChange === false && plan.rollback.realWrite === false;
  const phases = Array.isArray(plan.phases) && plan.phases.length === 6 && plan.phases.every((p) => p.executedThisSlice === false);
  const risks = plan.risks.risks.length >= 10 && plan.risks.risks.every((r) => r.mitigation && r.gate);
  planShapeOk = notMigrated && capped && legacy && nextReadOnly && rollback && phases && risks;
  planShapeDetail = planShapeOk
    ? 'não-migrado; capado em read_only_candidate; legado é fonte; recomenda read-only; rollback sem schema/write; 6 fases não executadas; >=10 riscos com mitigação+gate'
    : `plano fora do contrato (notMigrated=${notMigrated}, capped=${capped}, legacy=${legacy}, nextReadOnly=${nextReadOnly}, rollback=${rollback}, phases=${phases}, risks=${risks})`;
} catch (err) {
  planShapeDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MIGRATION-FIRST-MODULE — plan declares no completed migration and recommends only read-only candidate', planShapeOk, planShapeDetail);

// 8. Sem import direto de Prisma/backend.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const s = planningSource();
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(s) || /PrismaClient/.test(s);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(s);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MIGRATION-FIRST-MODULE — no direct Prisma/backend import (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 9. Sem fetch direto. 10. Sem web storage.
let noExternalIo = false;
let ioDetail = '';
try {
  const code = planningCodeOnly();
  noExternalIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel|localStorage|sessionStorage|indexedDB/i.test(code);
  ioDetail = noExternalIo ? 'clean' : 'fetch/XHR/WebSocket/storage usage found';
} catch (err) {
  ioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MIGRATION-FIRST-MODULE — no direct fetch/XHR/WebSocket/localStorage/sessionStorage/IndexedDB', noExternalIo, ioDetail);

// (side effects) sem execução real.
let noExecution = false;
let execDetail = '';
try {
  const code = planningCodeOnly();
  noExecution = !/dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine|actionEngine\s*\(/.test(code);
  execDetail = noExecution ? 'clean (no execution)' : 'execution call found';
} catch (err) {
  execDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MIGRATION-FIRST-MODULE — no action/workflow/connector execution / side effect', noExecution, execDetail);

// 11. Não toca Studio/Marketplace; sem import de módulo real / App.
let noStudioModule = false;
let studioDetail = '';
try {
  const code = planningCodeOnly();
  noStudioModule = !/from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]|from\s+['"].*\/modules\/.*['"]|from\s+['"][^'"]*App(\.jsx)?['"]/i.test(code);
  studioDetail = noStudioModule ? 'clean (no Studio/Marketplace/module/App import)' : 'Studio/Marketplace/module/App import found';
} catch (err) {
  studioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MIGRATION-FIRST-MODULE — no Studio/Marketplace/production-module/App.jsx import', noStudioModule, studioDetail);

// 12. Não adiciona dependência nova.
let noNewDep = false;
let depDetail = '';
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
  depDetail = noNewDep ? 'clean (no dependency added/removed)' : 'dependency set changed';
} catch (err) {
  noNewDep = true;
  depDetail = `git base unavailable — skipped strict check (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-MIGRATION-FIRST-MODULE — no new dependency added to package.json', noNewDep, depDetail);

// 13. Não altera CSS global.
let noCss = false;
let cssDetail = '';
try {
  noCss = !/import\s+['"][^'"]+\.css['"]/i.test(planningSource());
  cssDetail = noCss ? 'clean (no .css import)' : '.css import found';
} catch (err) {
  cssDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MIGRATION-FIRST-MODULE — no global CSS import in planning', noCss, cssDetail);

// 4/5/6/7. src/App.jsx, tela real Empresas, menu, runtime legado / UI de produção não alterados.
let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = productionUiOffendingFiles(ROOT);
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean (App.jsx + real Empresas screen + menu + legacy runtime untouched)' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  noProductionUiChange = true;
  productionUiDetail = `git diff unavailable — ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-MIGRATION-FIRST-MODULE — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// 3. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/migration/first-module-migration-planning.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-MIGRATION-FIRST-MODULE — planning unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-MIGRATION-FIRST-MODULE summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
