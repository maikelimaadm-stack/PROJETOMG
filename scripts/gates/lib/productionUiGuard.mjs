import { execSync } from 'node:child_process';

/**
 * Shared production-UI guard for the Foundation C / post-Foundation C gates.
 *
 * Returns the newline-joined list of production-UI files that changed in a
 * DISALLOWED way versus `origin/main`. An EMPTY string means "no disallowed
 * production UI change" — the existing gate logic (`diff.length === 0`) then
 * reports clean.
 *
 * The ONLY tolerated production-UI change is the single, sanctioned dev-only
 * route mount in `src/App.jsx` — mounting `/__dev/runtime-v2/previews` behind
 * `shouldMountRuntimeV2DevPreviewRoute()` (dev-only, flag-protected,
 * fail-closed in production, not in the menu). This exception is strict and
 * specific: it is NOT a generic relaxation. Any OTHER change to `src/App.jsx`,
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
    } else {
      // Any non-App production UI change is always offending.
      offending.push(f);
    }
  }
  return offending.join('\n');
}

const DEV_ROUTE_MARKER = /RuntimeV2DevPreview|RUNTIME_V2_DEV_PREVIEW_ROUTE|shouldMountRuntimeV2DevPreviewRoute|__dev\/runtime-v2\/previews|DEV-ONLY: runtime v2/;
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
    // Any added route path must be the dev-only path — never a new production route.
    if (/path\s*[=:]/.test(a) && !/RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH|__dev\/runtime-v2\/previews/.test(a)) return false;
    if (DEV_ROUTE_MARKER.test(a)) sawMarker = true;
  }
  return sawMarker;
}
