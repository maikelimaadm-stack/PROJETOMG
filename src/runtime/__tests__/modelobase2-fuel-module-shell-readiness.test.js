import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createModeloBase2FuelModuleShellReadiness,
  createModeloBase2FuelModuleContract,
  createModeloBase2FuelModuleMetadata,
  createModeloBase2FuelModuleRoutePlan,
  createModeloBase2FuelModuleMenuPlan,
  createModeloBase2FuelModulePermissionPlan,
  createModeloBase2FuelModulePersistenceBoundary,
  createModeloBase2FuelModuleUiComposition,
  createModeloBase2FuelModuleReadinessDiagnostics,
  createModeloBase2FuelModuleFallback,
  FUEL_MODULE_SHELL_READINESS_FLAG,
  FUEL_MODULE_NEXT_STEPS,
} from '../../ModeloBase2/fuel-module-shell/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHELL_DIR = path.resolve(__dirname, '../../ModeloBase2/fuel-module-shell');
const ENABLED_ENV = { DEV: 'true', [FUEL_MODULE_SHELL_READINESS_FLAG]: 'true' };

const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && /\.(js|jsx)$/.test(e.name) ? [full] : [];
}) : []);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const importsOf = (files) => files.flatMap((f) => [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]));
const pureFiles = () => walk(SHELL_DIR).filter((f) => f.endsWith('.js'));
const jsxFiles = () => walk(SHELL_DIR).filter((f) => f.endsWith('.jsx'));

test('1. module shell readiness is created', () => {
  const r = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.equal(r.kind, 'modelobase2-fuel-module-shell-readiness');
  assert.ok(typeof r.readinessId === 'string' && r.readinessId.length > 0);
});

test('2. declares domain fuel', () => {
  const r = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.equal(r.domain, 'fuel');
});

test('3. declares moduleId modelobase2-fuel', () => {
  const r = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.equal(r.moduleId, 'modelobase2-fuel');
});

test('4. declares modelFamily modeloBase2', () => {
  const r = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.equal(r.modelFamily, 'modeloBase2');
});

test('5. declares modelType operacional', () => {
  const r = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.equal(r.modelType, 'operacional');
});

test('6. moduleRegistered false', () => {
  const r = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.equal(r.moduleRegistered, false);
});

test('7. routeRegistered false', () => {
  const r = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.equal(r.routeRegistered, false);
});

test('8. menuRegistered false', () => {
  const r = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.equal(r.menuRegistered, false);
});

test('9. backendRegistered false', () => {
  const r = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.equal(r.backendRegistered, false);
});

test('10. persistenceReal false', () => {
  const r = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.equal(r.persistenceReal, false);
  assert.equal(r.persistenceBoundary.persistenceReal, false);
});

test('11. localOnly true', () => {
  const r = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.equal(r.localOnly, true);
});

test('12. sent false', () => {
  const r = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.equal(r.sent, false);
});

test('13. module contract contains fuel commands', () => {
  const c = createModeloBase2FuelModuleContract();
  assert.ok(c.commands.includes('createFuelDraft'));
  assert.ok(c.commands.includes('appendFuelEntry'));
  assert.ok(c.commands.includes('submitFuelDraft'));
  assert.equal(c.commands.length, 10);
});

test('14. module contract contains fuel events', () => {
  const c = createModeloBase2FuelModuleContract();
  assert.ok(c.events.includes('fuel.draft.created'));
  assert.ok(c.events.includes('fuel.entry.added'));
  assert.ok(c.events.includes('fuel.draft.submitted.simulated'));
});

test('15. dangerous capabilities false', () => {
  const c = createModeloBase2FuelModuleContract();
  assert.equal(c.capabilities.backendWrite, false);
  assert.equal(c.capabilities.connector, false);
  assert.equal(c.capabilities.workflow, false);
  assert.equal(c.capabilities.marketplacePublish, false);
  for (const v of Object.values(c.dangerousCapabilities)) assert.equal(v, false);
});

test('16. metadata contains displayName Combustível', () => {
  const m = createModeloBase2FuelModuleMetadata();
  assert.equal(m.displayName, 'Combustível');
});

test('17. metadata contains category Operacional', () => {
  const m = createModeloBase2FuelModuleMetadata();
  assert.equal(m.category, 'Operacional');
});

test('18. route plan contains devPreviewRoutePath /__dev/modelobase2/fuel', () => {
  const rp = createModeloBase2FuelModuleRoutePlan();
  assert.equal(rp.devPreviewRoutePath, '/__dev/modelobase2/fuel');
});

test('19. route plan does not register a production route', () => {
  const rp = createModeloBase2FuelModuleRoutePlan();
  assert.equal(rp.routeRegistered, false);
  assert.equal(rp.currentAppJsChange, false);
  assert.equal(rp.productionAllowed, false);
});

test('20. menu plan does not register menu', () => {
  const mp = createModeloBase2FuelModuleMenuPlan();
  assert.equal(mp.menuRegistered, false);
  assert.equal(mp.productionAllowed, false);
});

test('21. permission plan does not change global auth', () => {
  const pp = createModeloBase2FuelModulePermissionPlan();
  assert.equal(pp.authGlobalChanged, false);
  assert.equal(pp.permissionsRegistered, false);
});

test('22. permission plan failClosed true', () => {
  const pp = createModeloBase2FuelModulePermissionPlan();
  assert.equal(pp.failClosed, true);
  assert.ok(pp.blocked.includes('fuel.backend_write'));
});

test('23. persistence boundary blocks backend write', () => {
  const pb = createModeloBase2FuelModulePersistenceBoundary();
  assert.ok(pb.blockedNow.includes('backend write'));
  assert.equal(pb.backendTouched, false);
});

test('24. persistence boundary blocks Prisma write', () => {
  const pb = createModeloBase2FuelModulePersistenceBoundary();
  assert.ok(pb.blockedNow.includes('Prisma write'));
  assert.equal(pb.prismaTouched, false);
});

test('25. persistence boundary blocks required storage', () => {
  const pb = createModeloBase2FuelModulePersistenceBoundary();
  assert.ok(pb.blockedNow.includes('IndexedDB required'));
  assert.ok(pb.blockedNow.includes('localStorage required'));
  assert.equal(pb.storageMode, 'memory_validation');
});

test('26. ui composition references sandbox shell', () => {
  const ui = createModeloBase2FuelModuleUiComposition();
  assert.equal(ui.shellComponent, 'ModeloBase2FuelSandboxShell');
  assert.ok(ui.reuses.includes('ModeloBase2FuelSandboxShell'));
});

test('27. ui composition mountedInApp false', () => {
  const ui = createModeloBase2FuelModuleUiComposition();
  assert.equal(ui.mountedInApp, false);
  assert.equal(ui.routeRegistered, false);
  assert.equal(ui.menuRegistered, false);
});

test('28. ui composition productionReady false', () => {
  const ui = createModeloBase2FuelModuleUiComposition();
  assert.equal(ui.productionReady, false);
  assert.ok(ui.missingForProduction.includes('route registration'));
});

test('29. diagnostics readiness ready_for_beta_shell or partial (documented)', () => {
  const ui = createModeloBase2FuelModuleUiComposition();
  const d = createModeloBase2FuelModuleReadinessDiagnostics({ enabled: true, uiComposition: ui });
  assert.ok(['ready_for_beta_shell', 'partial'].includes(d.readiness));
  // Disabled → blocked (documented).
  const dOff = createModeloBase2FuelModuleReadinessDiagnostics({ enabled: false, uiComposition: ui });
  assert.equal(dOff.readiness, 'blocked');
});

test('30. fallback for flag off registers nothing', () => {
  const fb = createModeloBase2FuelModuleFallback({ scenario: 'readiness_flag_off' });
  assert.equal(fb.moduleRegistered, false);
  assert.equal(fb.routeRegistered, false);
  assert.equal(fb.menuRegistered, false);
  assert.equal(fb.backendTouched, false);
  assert.ok(typeof fb.fallbackReason === 'string');
  assert.equal(fb.rollbackPlan.passive, true);
});

test('31. fallback for invalid contract registers nothing', () => {
  const fb = createModeloBase2FuelModuleFallback({ scenario: 'invalid_module_contract' });
  assert.equal(fb.scenario, 'invalid_module_contract');
  assert.equal(fb.moduleRegistered, false);
  assert.equal(fb.persistenceReal, false);
});

test('32. returns are safe copies', () => {
  const a = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  const b = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.notEqual(a.moduleContract, b.moduleContract);
  assert.deepEqual(a.moduleContract.commands, b.moduleContract.commands);
});

test('33. mutating a return does not change internal state', () => {
  const a = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  a.moduleContract.commands.push('HACK');
  a.metadata.displayName = 'MUTATED';
  const b = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.ok(!b.moduleContract.commands.includes('HACK'));
  assert.equal(b.metadata.displayName, 'Combustível');
});

test('34. does not touch src/modules (no import)', () => {
  assert.ok(importsOf(walk(SHELL_DIR)).every((p) => !/\/modules\//.test(p)));
});

test('35. does not touch src/pages (no import)', () => {
  assert.ok(importsOf(walk(SHELL_DIR)).every((p) => !/\/pages\//.test(p)));
});

test('36. does not touch App.jsx (no import)', () => {
  assert.ok(importsOf(walk(SHELL_DIR)).every((p) => !/App\.jsx/.test(p)));
});

test('37. does not touch menu (no menu registration tokens)', () => {
  const code = walk(SHELL_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  assert.ok(!/addMenuItem|navItems|menu\.push/.test(code));
});

test('38. does not touch backend (no import)', () => {
  assert.ok(importsOf(walk(SHELL_DIR)).every((p) => !/\/backend\/|\/apis\//i.test(p)));
});

test('39. does not touch Prisma/schema (no import)', () => {
  assert.ok(importsOf(walk(SHELL_DIR)).every((p) => !/prisma|schema\.prisma/i.test(p)));
});

test('40. does not touch runtimeBridge real (no import)', () => {
  assert.ok(importsOf(walk(SHELL_DIR)).every((p) => !/makBootstrap|runtimeBridge/.test(p)));
});

test('41. does not use fetch', () => {
  const code = stripComments(walk(SHELL_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code));
});

test('42. does not use required storage', () => {
  const code = stripComments(walk(SHELL_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
  assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
});

test('43. does not add a new dependency (only relative + generic-model imports)', () => {
  const external = importsOf(pureFiles()).filter((p) => !p.startsWith('.') && !p.startsWith('/'));
  assert.deepEqual(external, []); // pure files import nothing external
});

test('44. React appears only in the optional shell component, not in pure helpers', () => {
  assert.ok(importsOf(pureFiles()).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
  const jsx = jsxFiles();
  assert.ok(jsx.length >= 1);
  assert.ok(importsOf(jsx).some((p) => p === 'react'));
});

test('45. gate: fuel dev preview route gate still exists', () => {
  assert.ok(fs.existsSync(path.resolve(__dirname, '../../../scripts/gates/g423-modelobase2-fuel-dev-preview-route.mjs')));
});

test('46. gate: fuel UI sandbox gate still exists', () => {
  assert.ok(fs.existsSync(path.resolve(__dirname, '../../../scripts/gates/g423-modelobase2-fuel-beta-ui-sandbox.mjs')));
});

test('47. gate: fuel headless gate still exists', () => {
  assert.ok(fs.existsSync(path.resolve(__dirname, '../../../scripts/gates/g423-modelobase2-fuel-headless-candidate.mjs')));
});

test('48. next step is a controlled module registration/candidate, not backend write', () => {
  const r = createModeloBase2FuelModuleShellReadiness({ env: ENABLED_ENV });
  assert.deepEqual(r.nextSteps, [...FUEL_MODULE_NEXT_STEPS]);
  assert.ok(r.nextSteps.some((s) => /Registration|Candidate/i.test(s)));
  assert.ok(r.nextSteps.every((s) => !/backend\s*write/i.test(s)));
});
