import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createMigrationReadinessModel,
  resolveReadinessStatus,
  MAX_READINESS_THIS_SLICE,
} from '../../migration/planning/createMigrationReadinessModel.js';
import { createMigrationRiskModel } from '../../migration/planning/migrationRiskModel.js';
import { createMigrationRollbackPlan } from '../../migration/planning/migrationRollbackPlan.js';
import { createFirstModuleMigrationPlan } from '../../migration/planning/createFirstModuleMigrationPlan.js';
import { createEmpresasMigrationPlan } from '../../migration/planning/createEmpresasMigrationPlan.js';
import { MigrationPlanningError } from '../../migration/planning/errors.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLANNING_DIR = path.join(HERE, '../../migration/planning');
const PLANNING_FILES = [
  'createMigrationReadinessModel.js',
  'createFirstModuleMigrationPlan.js',
  'createEmpresasMigrationPlan.js',
  'migrationRiskModel.js',
  'migrationRollbackPlan.js',
  'errors.js',
];
function planningSource() {
  return PLANNING_FILES.map((f) => fs.readFileSync(path.join(PLANNING_DIR, f), 'utf8')).join('\n');
}
function planningCodeOnly() {
  return planningSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

describe('First Real Module Migration Planning (post-Foundation C)', () => {
  // 1
  it('createMigrationReadinessModel cria model determinístico', () => {
    const a = createMigrationReadinessModel({ moduleId: 'empresas' });
    const b = createMigrationReadinessModel({ moduleId: 'empresas' });
    assert.deepEqual(a, b);
    assert.equal(a.kind, 'migration-readiness-model');
  });

  // 2
  it('model default para Empresas não marca como migrated', () => {
    const m = createMigrationReadinessModel();
    assert.notEqual(m.readinessStatus, 'migrated');
    assert.notEqual(m.readinessStatus, 'migration_candidate');
  });

  // 3
  it('model permite no máximo read_only_candidate', () => {
    const m = createMigrationReadinessModel();
    assert.equal(m.readinessStatus, 'read_only_candidate');
    assert.equal(m.maxStatusThisSlice, 'read_only_candidate');
    assert.equal(MAX_READINESS_THIS_SLICE, 'read_only_candidate');
  });

  // 4
  it('model lista blockers', () => {
    const clean = createMigrationReadinessModel();
    assert.deepEqual(clean.blockers, []);
    const blocked = createMigrationReadinessModel({ signals: { shadowReady: false } });
    assert.equal(blocked.blockers.length > 0, true);
    assert.equal(blocked.readinessStatus, 'blocked');
  });

  // 5
  it('model lista warnings', () => {
    const m = createMigrationReadinessModel({ signals: { controlledDatasetReady: false } });
    assert.equal(Array.isArray(m.warnings), true);
    assert.equal(m.warnings.some((w) => /dataset/i.test(w)), true);
  });

  // 6
  it('model lista requiredGates', () => {
    const m = createMigrationReadinessModel();
    assert.equal(m.requiredGates.includes('gate:g423-migration-first-module'), true);
    assert.equal(m.requiredGates.includes('gate:g423'), true);
  });

  // 7
  it('model lista requiredTests', () => {
    const m = createMigrationReadinessModel();
    assert.equal(m.requiredTests.includes('test:runtime:migration:first-module'), true);
    assert.equal(m.requiredTests.includes('test:runtime'), true);
  });

  // 8
  it('model marca rollbackAvailable', () => {
    const m = createMigrationReadinessModel();
    assert.equal(m.rollbackAvailable, true);
    assert.equal(m.reversible, true);
  });

  // 9
  it('model bloqueia prototype pollution', () => {
    assert.throws(() => createMigrationReadinessModel(JSON.parse('{"__proto__": {"x": 1}}')), MigrationPlanningError);
    assert.throws(() => createMigrationReadinessModel({ signals: JSON.parse('{"constructor": {"y": 2}}') }), MigrationPlanningError);
  });

  // 10
  it('model mascara dados sensíveis', () => {
    const m = createMigrationReadinessModel({ signals: { password: 'hunter2', token: 'abc' } });
    assert.equal(m.signals.password, '[REDACTED]');
    assert.equal(m.signals.token, '[REDACTED]');
  });

  // 11
  it('createEmpresasMigrationPlan cria fases 0–5', () => {
    const plan = createEmpresasMigrationPlan();
    assert.deepEqual(plan.phases.map((p) => p.id), ['phase-0', 'phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5']);
  });

  // 12
  it('plano declara que este slice não migra tela real', () => {
    const plan = createEmpresasMigrationPlan();
    assert.equal(plan.migratesThisSlice, false);
    assert.equal(plan.phases.every((p) => p.executedThisSlice === false), true);
  });

  // 13
  it('plano declara que runtime legado continua fonte principal', () => {
    const plan = createEmpresasMigrationPlan();
    assert.equal(plan.legacyRemainsSourceOfTruth, true);
  });

  // 14
  it('plano declara que write real está fora de escopo', () => {
    const plan = createEmpresasMigrationPlan();
    assert.equal(plan.realWriteInScope, false);
    const p4 = plan.phases.find((p) => p.id === 'phase-4');
    const p5 = plan.phases.find((p) => p.id === 'phase-5');
    assert.equal(p4.outOfScope, true);
    assert.equal(p5.outOfScope, true);
  });

  // 15
  it('risk model contém riscos mínimos', () => {
    const rm = createMigrationRiskModel();
    assert.equal(rm.risks.length >= 10, true);
    assert.equal(rm.summary.total, rm.risks.length);
  });

  // 16
  it('cada risco tem mitigation', () => {
    const rm = createMigrationRiskModel();
    assert.equal(rm.risks.every((r) => typeof r.mitigation === 'string' && r.mitigation.length > 0), true);
  });

  // 17
  it('cada risco tem gate', () => {
    const rm = createMigrationRiskModel();
    assert.equal(rm.risks.every((r) => typeof r.gate === 'string' && /^gate:/.test(r.gate)), true);
  });

  // 18
  it('rollback plan contém feature flag off', () => {
    const rb = createMigrationRollbackPlan();
    assert.equal(rb.featureFlagDefault, 'off');
    assert.equal(rb.guarantees.some((g) => /flag off/i.test(g)), true);
  });

  // 19
  it('rollback plan contém fallback para legado', () => {
    const rb = createMigrationRollbackPlan();
    assert.equal(/legacy/i.test(rb.fallback.target), true);
    assert.equal(/legacy/i.test(rb.fallback.dataSource), true);
  });

  // 20
  it('rollback plan não depende de schema migration', () => {
    const rb = createMigrationRollbackPlan();
    assert.equal(rb.schemaChange, false);
    assert.equal(rb.destructive, false);
    assert.equal(rb.realWrite, false);
  });

  // 21
  it('próximo slice recomendado é read-only candidate', () => {
    const plan = createEmpresasMigrationPlan();
    assert.equal(/Read-Only Runtime v2 Candidate/i.test(plan.nextSlice.recommended), true);
    assert.equal(plan.nextSlice.allowed, true);
    assert.equal(plan.nextSlice.stillNotAllowed.includes('save real data'), true);
  });

  // 22 — não altera src/App.jsx
  it('não altera src/App.jsx (planning não referencia App.jsx)', () => {
    assert.equal(/from\s+['"][^'"]*App(\.jsx)?['"]/i.test(planningCodeOnly()), false);
  });

  // 23 — não altera menu principal
  it('não altera menu principal', () => {
    assert.equal(/addMenuItem|navItems|menu\.push|ErpShell/i.test(planningCodeOnly()), false);
  });

  // 24 — não altera tela real Empresas
  it('não altera / não importa a tela real Empresas', () => {
    assert.equal(/from\s+['"].*\/modules\/empresas.*['"]/i.test(planningCodeOnly()), false);
    assert.equal(/PAGEMP|CadastroEmpresas/.test(planningCodeOnly()), false);
  });

  // 25 — não chama backend/fetch
  it('não chama backend/fetch', () => {
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket|from\s+['"].*backend.*['"]/i.test(planningCodeOnly()), false);
  });

  // 26 — não consulta Prisma/MMM direto
  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const s = planningSource();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(s), false);
    assert.equal(/PrismaClient/.test(s), false);
  });

  // 27 — sem storage
  it('não usa localStorage/sessionStorage/IndexedDB', () => {
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(planningCodeOnly()), false);
  });

  // 28 — sem execução
  it('não executa action/workflow/connector', () => {
    assert.equal(/dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine|actionEngine\s*\(/.test(planningCodeOnly()), false);
  });

  // 29 — sem dados reais
  it('não usa dados reais (sem import de src/modules)', () => {
    assert.equal(/from\s+['"].*\/modules\/.*['"]/i.test(planningCodeOnly()), false);
  });

  // 30 — sem dependência nova (imports relativos)
  it('não adiciona dependência nova (todos os imports são relativos)', () => {
    for (const f of PLANNING_FILES) {
      const src = fs.readFileSync(path.join(PLANNING_DIR, f), 'utf8');
      const imports = [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const imp of imports) assert.equal(imp.startsWith('.'), true, `import não-relativo "${imp}" em ${f}`);
    }
  });

  // 31 — sem CSS global
  it('não altera CSS global (sem import de .css)', () => {
    assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(planningSource()), false);
  });

  // 32 — barrel exporta helpers puros; determinismo do plano completo
  it('runtime barrel exporta os helpers de planning; plano é determinístico e seguro para mutação', () => {
    const indexSrc = fs.readFileSync(path.join(HERE, '../../index.js'), 'utf8');
    assert.equal(/createEmpresasMigrationPlan/.test(indexSrc), true);
    assert.equal(/createMigrationReadinessModel/.test(indexSrc), true);
    // Determinismo do plano completo (first module + empresas).
    assert.deepEqual(createFirstModuleMigrationPlan({ moduleId: 'empresas', moduleName: 'Empresas' }), createEmpresasMigrationPlan());
    // Mutar o retorno não afeta a próxima chamada (deep copy seguro).
    const plan = createEmpresasMigrationPlan();
    plan.phases.length = 0;
    plan.readiness.blockers.push('mutated');
    assert.equal(createEmpresasMigrationPlan().phases.length, 6);
    assert.deepEqual(createEmpresasMigrationPlan().readiness.blockers, []);
  });

  // resolveReadinessStatus unit coverage
  it('resolveReadinessStatus é capado em read_only_candidate e força blocked com blocker', () => {
    const full = {
      shadowReady: true, tableFormShadowReady: true, controlledPreviewReady: true,
      previewHubReady: true, controlledDatasetReady: true, devPreviewRouteReady: true,
      routeActivationReady: true, legacyStillSourceOfTruth: true, usesRealData: false, writesRealData: false,
    };
    assert.equal(resolveReadinessStatus(full, []), 'read_only_candidate');
    assert.equal(resolveReadinessStatus(full, ['x']), 'blocked');
    assert.equal(resolveReadinessStatus({ ...full, shadowReady: false }, []), 'not_ready');
  });
});
