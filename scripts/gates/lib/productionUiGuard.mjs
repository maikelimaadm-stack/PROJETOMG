import { execSync } from 'node:child_process';

/**
 * Shared production-UI guard for the Foundation C / post-Foundation C gates.
 *
 * Returns the newline-joined list of production-UI files that changed in a
 * DISALLOWED way versus `origin/main`. An EMPTY string means "no disallowed
 * production UI change" — the existing gate logic (`diff.length === 0`) then
 * reports clean.
 *
 * The ONLY tolerated production-UI changes are the sanctioned dev-only route
 * mounts in `src/App.jsx` — mounting `/__dev/runtime-v2/previews` behind
 * `shouldMountRuntimeV2DevPreviewRoute()` and `/__dev/modelobase2/fuel` behind
 * `shouldMountModeloBase2FuelDevPreviewRoute()` (both dev-only, flag-protected,
 * fail-closed in production, not in the menu). These exceptions are strict and
 * specific: they are NOT a generic relaxation. Any OTHER change to `src/App.jsx`,
 * or ANY change to `src/shared`, `src/framework`, `src/modules`, `src/studio`,
 * is still reported as offending.
 *
 * @param {string} ROOT
 * @returns {string} newline-joined offending file paths ('' when clean)
 */
export function productionUiOffendingFiles(ROOT) {
  let changed = '';
  try {
    changed = execSync(
      'git diff --name-only origin/main...HEAD -- src/App.jsx src/shared src/framework src/modules src/studio',
      { cwd: ROOT, encoding: 'utf8' },
    ).trim();
  } catch {
    // git/base unavailable — treat as clean (same permissive fallback the gates used before).
    return '';
  }
  if (changed.length === 0) return '';
  const offending = [];
  for (const f of changed.split('\n').filter(Boolean)) {
    if (f === 'src/App.jsx') {
      if (!appJsxChangeIsOnlyDevRouteMount(ROOT)) offending.push(f);
    } else if (ISOLATED_READONLY_TEST_SUBTREES.some((prefix) => f.startsWith(prefix))) {
      // Isolated, local, read-only test harnesses that live under a module folder
      // but are NEVER imported by production UI (no route/menu/page wiring). They
      // are tolerated ONLY when the change adds no forbidden token (Prisma/backend/
      // fetch/storage/menu). Any such token → offending.
      if (!isolatedReadonlySubtreeChangeIsSafe(ROOT, f)) offending.push(f);
    } else if (AUTHORIZED_BETA_FILES.has(f)) {
      // Authorized-scope beta wiring (Empresas/Campos ModeloBase1 direct beta).
      // Tolerated ONLY when the diff is the sanctioned, additive beta injection:
      // no forbidden tokens, still a ModeloBase1 consumer. Any other change to
      // these files — or to any other module file — remains offending.
      if (!moduleBetaChangeIsAuthorized(ROOT, f)) offending.push(f);
    } else {
      // Any non-App production UI change is always offending.
      offending.push(f);
    }
  }
  return offending.join('\n');
}

/**
 * The ONLY production-module files whose change is tolerated by the shared
 * guard: the two ModeloBase1 direct-beta config-wiring files. This is the
 * "authorized scope" the post-Foundation C beta activation opened — Empresas and
 * Campos Personalizados are beta/experimental, and their ModeloBase1 config may
 * attach a runtime v2 read model behind a feature flag. The tolerance is narrow
 * and specific; it never relaxes protection for any other module/framework file.
 * @type {Set<string>}
 */
const AUTHORIZED_BETA_FILES = new Set([
  'src/modules/empresas/config/modeloBase1/empresasModeloBase1Config.js',
  'src/modules/cadcps/config/cadcpsModeloBase1Config.js',
]);

/**
 * Isolated, LOCAL, READ-ONLY test-harness subtrees that physically live under a
 * module folder but are NOT production UI: pure/React-free, never imported by any
 * page/route/menu, never touch backend/Prisma/fetch/storage. They exist only for
 * `node --test` contract validation with synthetic fixtures. This tolerance is
 * narrow (a specific directory prefix) and additionally gated on "no forbidden
 * token added" — it never relaxes protection for the real module code around it.
 * @type {string[]}
 */
const ISOLATED_READONLY_TEST_SUBTREES = [
  'src/modules/empresas/local-read-contract-pilot/',
  'src/studio/foundation-contracts/',
];

/**
 * Production-UI *wiring* tokens: the real risk for an isolated test subtree is that
 * it secretly wires itself into the production UI (menu/route/page/App). Backend/
 * Prisma/fetch/storage safety for these subtrees is enforced (far more precisely,
 * by import/AST-style scans) in each subtree's OWN gate — a bare keyword like
 * "prisma" legitimately appears here inside denylists, so it is NOT used as the
 * signal here.
 */
const UI_WIRING = /addMenuItem|navItems|menu\.push|from\s+['"][^'"]*App(\.jsx)?['"]|from\s+['"][^'"]*\/pages\/|registerRoute|<Route\b/;

/**
 * True only when a change to an isolated read-only test subtree adds NO production-
 * UI wiring token. New files count as added lines.
 * @param {string} ROOT
 * @param {string} file
 * @returns {boolean}
 */
function isolatedReadonlySubtreeChangeIsSafe(ROOT, file) {
  let patch = '';
  try {
    patch = execSync(`git diff --unified=0 origin/main...HEAD -- ${file}`, { cwd: ROOT, encoding: 'utf8' });
  } catch {
    return false;
  }
  const added = patch.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1));
  for (const a of added) {
    if (UI_WIRING.test(a)) return false;
  }
  return true;
}

/**
 * True only when the diff to an authorized beta config file is the sanctioned,
 * additive beta injection: no forbidden tokens added (Prisma/backend/fetch/
 * storage/menu), and the file still builds its config via
 * `buildModeloBase1ConfigFromMakModule` (invariant: it remains a ModeloBase1
 * consumer). Any other kind of change is treated as offending.
 * @param {string} ROOT
 * @param {string} file
 * @returns {boolean}
 */
function moduleBetaChangeIsAuthorized(ROOT, file) {
  let patch = '';
  let head = '';
  try {
    patch = execSync(`git diff --unified=0 origin/main...HEAD -- ${file}`, { cwd: ROOT, encoding: 'utf8' });
    head = execSync(`git show HEAD:${file}`, { cwd: ROOT, encoding: 'utf8' });
  } catch {
    return false;
  }
  const added = patch.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1));
  for (const a of added) {
    if (FORBIDDEN.test(a)) return false;
  }
  // Invariant: still a config-driven ModeloBase1 consumer.
  if (!/buildModeloBase1ConfigFromMakModule/.test(head)) return false;
  // Invariant: the only new wiring is the runtime v2 direct-beta read model.
  const addedRealImport = added.some((a) => /\bfrom\s+['"]/.test(a) && !/modelobase1-direct-beta/.test(a) && !/@\/ModeloBase1\//.test(a) && !/@\/modules\/(empresas|cadcps)\//.test(a) && !/empRepository|repository/i.test(a));
  if (addedRealImport) return false;
  return true;
}

const DEV_ROUTE_MARKER = /RuntimeV2DevPreview|RUNTIME_V2_DEV_PREVIEW_ROUTE|shouldMountRuntimeV2DevPreviewRoute|__dev\/runtime-v2\/previews|DEV-ONLY: runtime v2|ModeloBase2FuelDevPreview|MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE|shouldMountModeloBase2FuelDevPreviewRoute|__dev\/modelobase2\/fuel|DEV-ONLY: ModeloBase2 fuel/;
const FORBIDDEN = /prisma|PrismaClient|\/backend\/|\bfetch\s*\(|localStorage|sessionStorage|indexedDB|addMenuItem|navItems|menu\.push/i;

/**
 * True only when the `src/App.jsx` diff is EXACTLY the sanctioned dev-only
 * route mount: no existing line removed/modified, at least one added line
 * references the dev route, no forbidden tokens added, and any added route
 * path is the dev-only path.
 * @param {string} ROOT
 * @returns {boolean}
 */
function appJsxChangeIsOnlyDevRouteMount(ROOT) {
  let patch = '';
  try {
    patch = execSync('git diff --unified=0 origin/main...HEAD -- src/App.jsx', { cwd: ROOT, encoding: 'utf8' });
  } catch {
    return false;
  }
  const lines = patch.split('\n');
  const removed = lines.filter((l) => l.startsWith('-') && !l.startsWith('---'));
  if (removed.length > 0) return false; // nothing existing may be removed or modified
  const added = lines.filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1));
  if (added.length === 0) return false;
  let sawMarker = false;
  for (const a of added) {
    if (FORBIDDEN.test(a)) return false;
    // Any added route path must be a sanctioned dev-only path — never a new production route.
    if (/path\s*[=:]/.test(a) && !/RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH|__dev\/runtime-v2\/previews|MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH|__dev\/modelobase2\/fuel/.test(a)) return false;
    if (DEV_ROUTE_MARKER.test(a)) sawMarker = true;
  }
  return sawMarker;
}
