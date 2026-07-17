/**
 * Studio Scope Governance Registry — Post-Foundation C.
 *
 * Central, EXPLICIT declaration of scope governance for the Studio headless slice
 * sequence. It exists so that the branch-relative scope checks of EARLIER Studio slices
 * do not falsely block LATER, legitimate Studio headless artifacts (which appear in the
 * diff-vs-main until they merge), WITHOUT ever weakening the blocking of forbidden paths.
 *
 * Design rules (audited):
 *  - No broad allow wildcard. There is deliberately NO `^src/studio/`, `^src/`,
 *    `^backend/`, or `^src/modules/` allow-entry. Every allowed later artifact is a
 *    SPECIFIC path prefix or file.
 *  - Forbidden always wins. A path matching FORBIDDEN_SCOPE_PATTERNS is `forbidden_scope`
 *    regardless of anything else.
 *  - This file is pure data + regexes. It imports no production code, performs no I/O,
 *    runs no command, and touches no network/backend/Prisma.
 *
 * @module scripts/gates/lib/studioScopeGovernanceRegistry
 */

/**
 * Paths that are ALWAYS forbidden in a Studio headless slice, no matter what. These are
 * the dangerous surfaces the whole Studio-first policy protects. Matching any of these
 * makes a path `forbidden_scope`.
 * @type {RegExp[]}
 */
export const FORBIDDEN_SCOPE_PATTERNS = Object.freeze([
  /^src\/modules\//,
  /^src\/ModeloBase1\//,
  /^src\/ModeloBase2\//,
  /^src\/pages\//,
  /^src\/components\//,
  /^src\/App\.jsx$/,
  /^src\/apis\//,
  /^src\/framework\//,
  /^src\/bos\//,
  /^backend\//,
  /^backend\/prisma\//,
  /schema\.prisma$/,
  /(^|\/)prisma(\/|$)/i,
  /^migrations\//,
  /migration/i,
  /runtimeBridge/i,
  /makBootstrap/i,
  /PAGEMP/i,
  /ModeloBase1CadastroPage/i,
  /\.css$/,
  // Production runtime (anything under src/runtime that is NOT a test).
  /^src\/runtime\/(?!__tests__\/)/,
  // Sensitive governance file: the production UI guard is forbidden unless the CURRENT
  // slice explicitly authorizes it (see classifyStudioScopePath `ownSliceAllowed`).
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
]);

/**
 * The EXPLICIT list of later Studio headless artifacts that earlier slices' branch-
 * relative scope checks may TOLERATE. Each entry is a specific subtree or file — never a
 * broad wildcard. A path here is classified `known_later_studio_headless_artifact` (only
 * when it is NOT also forbidden). It is NEVER reclassified as `own_slice_allowed`.
 * @type {RegExp[]}
 */
export const KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS = Object.freeze([
  // Studio Authoring Runtime-to-Preview Bridge Implementation Plan — headless, contract-only, metadata-
  // only, plan-only, synthetic-only, deterministic, fail-closed plan for a future headless bridge (every
  // phase planned, none implemented; no bridge/adapter/validator/payload/mount/UI/persistence/backend/
  // module/certification/product exposure).
  /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-implementation-plan\//,
  /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-implementation-plan\.test\.js$/,
  /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-implementation-plan\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-implementation-plan\//,
  // Studio Authoring Runtime-to-Preview Bridge Contract — headless, contract-only, metadata-only,
  // synthetic-only, deterministic, fail-closed bridge contract between the Authoring Runtime's
  // synthetic_preview_candidate handoff and the Module Preview Sandbox contract (no bridge/adapter/
  // payload/mount/UI/persistence/backend/module/certification/product exposure implemented).
  /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-contract\//,
  /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-contract\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-contract\//,
  // Studio Module Blueprint Authoring Runtime — headless, synthetic, in-memory, deterministic,
  // immutable, fail-closed authoring runtime (no UI/editor/persistence/module/backend/product exposure).
  /^src\/studio\/blueprint-engine\/module-blueprint-authoring-runtime\//,
  /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-runtime\.test\.js$/,
  /^scripts\/gates\/g423-studio-module-blueprint-authoring-runtime\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-runtime\//,
  // Studio Module Blueprint Authoring Implementation Plan — headless plan-only plan for a future
  // authoring runtime (no runtime/UI/editor/module/persistence/product exposure).
  /^src\/studio\/blueprint-engine\/module-blueprint-authoring-implementation-plan\//,
  /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-implementation-plan\.test\.js$/,
  /^scripts\/gates\/g423-studio-module-blueprint-authoring-implementation-plan\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-implementation-plan\//,
  // Studio Module Blueprint Authoring Foundation Contract — headless contract-only foundation for
  // future Module Blueprint authoring (no runtime/UI/editor/module/persistence/product exposure).
  /^src\/studio\/blueprint-engine\/module-blueprint-authoring-foundation-contract\//,
  /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-foundation-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-module-blueprint-authoring-foundation-contract\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-foundation-contract\//,
  // Studio Dev Preview App Integration — minimal dev-only App mount (this slice). App.jsx and
  // productionUiGuard.mjs are NOT listed here (forbidden always wins); they are authorized for THIS
  // slice ONLY via the guard's explicitlyAuthorizedForbidden mechanism — see
  // STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN below.
  /^src\/studio\/blueprint-engine\/dev-preview-app-integration\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-app-integration\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-app-integration\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-app-integration\//,
  // Studio Dev Preview App Integration Implementation Plan — headless plan-only (PR #477).
  /^src\/studio\/blueprint-engine\/dev-preview-app-integration-implementation-plan\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-app-integration-implementation-plan\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-app-integration-implementation-plan\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-app-integration-implementation-plan\//,
  // Studio Dev Preview App Integration Contract — headless contract-only (PR #476).
  /^src\/studio\/blueprint-engine\/dev-preview-app-integration-contract\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-app-integration-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-app-integration-contract\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-app-integration-contract\//,
  // Studio Dev Preview Route/Menu — first isolated dev-only route/menu runtime (PR #475).
  /^src\/studio\/blueprint-engine\/dev-preview-route-menu\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-route-menu\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-route-menu\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu\//,
  // Studio Dev Preview Route/Menu Implementation Plan (PR #474).
  /^src\/studio\/blueprint-engine\/dev-preview-route-menu-implementation-plan\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-route-menu-implementation-plan\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-route-menu-implementation-plan\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu-implementation-plan\//,
  // Studio Dev Preview Route/Menu Contract (PR #473).
  /^src\/studio\/blueprint-engine\/dev-preview-route-menu-contract\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-route-menu-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-route-menu-contract\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu-contract\//,
  // Studio Dev Preview Runtime UI (PR #472 — first isolated UI runtime; .jsx is confined here).
  /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-runtime-ui\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-runtime-ui\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-ui\//,
  // Studio Dev Preview Runtime UI Implementation Plan (PR #471).
  /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui-implementation-plan\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-runtime-ui-implementation-plan\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-runtime-ui-implementation-plan\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-ui-implementation-plan\//,
  // Studio Dev Preview Runtime UI Contract (PR #470).
  /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui-contract\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-runtime-ui-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-runtime-ui-contract\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-ui-contract\//,
  // Studio Dev Preview Isolated Runtime (PR #469).
  /^src\/studio\/blueprint-engine\/dev-preview-isolated-runtime\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-isolated-runtime\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-isolated-runtime\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-isolated-runtime\//,
  // Studio Dev Preview Isolated Runtime Implementation Plan (PR #468).
  /^src\/studio\/blueprint-engine\/dev-preview-isolated-runtime-implementation-plan\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-isolated-runtime-implementation-plan\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-isolated-runtime-implementation-plan\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-isolated-runtime-implementation-plan\//,
  // Studio Dev Preview Runtime Shell Contract (PR #467).
  /^src\/studio\/blueprint-engine\/dev-preview-runtime-shell-contract\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-runtime-shell-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-runtime-shell-contract\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-shell-contract\//,
  // Studio Dev Preview Visual Contract (PR #466).
  /^src\/studio\/blueprint-engine\/dev-preview-visual-contract\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-visual-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-visual-contract\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-visual-contract\//,
  // Studio Dev Preview Contract Bridge (PR #465).
  /^src\/studio\/blueprint-engine\/dev-preview-contract-bridge\//,
  /^src\/runtime\/__tests__\/studio-dev-preview-contract-bridge\.test\.js$/,
  /^scripts\/gates\/g423-studio-dev-preview-contract-bridge\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-dev-preview-contract-bridge\//,
  // Studio Module Preview Sandbox Contract (PR #462).
  /^src\/studio\/blueprint-engine\/module-preview-sandbox\//,
  /^src\/runtime\/__tests__\/studio-module-preview-sandbox-contract\.test\.js$/,
  /^scripts\/gates\/g423-studio-module-preview-sandbox-contract\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-module-preview-sandbox-contract\//,
  // Studio Blueprint Module Reference Planner (already merged; kept for robustness).
  /^src\/studio\/blueprint-engine\/module-reference-planner\//,
  /^src\/runtime\/__tests__\/studio-blueprint-module-reference-planner\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-module-reference-planner\.mjs$/,
  /^docs\/evidence\/post-foundation-c-studio-blueprint-module-reference-planner\//,
  // This Studio Scope Governance Maintenance slice's own artifacts, so the earlier
  // slices' scope checks tolerate them on this governance branch too.
  /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
  /^scripts\/gates\/lib\/studioScopeGovernanceGuard\.mjs$/,
  /^scripts\/gates\/g423-studio-scope-governance-maintenance\.mjs$/,
  /^src\/runtime\/__tests__\/studio-scope-governance-maintenance\.test\.js$/,
  /^docs\/evidence\/post-foundation-c-studio-scope-governance-maintenance\//,
  /^docs\/evidence\/post-foundation-c-studio-scope-governance-self-guard-fix\//,
  // Prior scope-check host files that THIS governance slice minimally wires to consume the
  // central guard (branch-relative scope check only — no functional/safety assert changed).
  // Enumerated explicitly (specific files, never a wildcard) so a sibling gate does not
  // flag the governance slice's own wiring edits.
  /^src\/runtime\/__tests__\/studio-blueprint-engine-foundation\.test\.js$/,
  /^scripts\/gates\/g423-studio-blueprint-engine-foundation\.mjs$/,
  /^scripts\/gates\/g423-studio-blueprint-module-reference-planner\.mjs$/,
  /^scripts\/gates\/g423-studio-blueprint-contract-certification\.mjs$/,
  /^scripts\/gates\/g423-studio-blueprint-contract-hardening\.mjs$/,
  /^scripts\/gates\/g423-studio-foundation-contracts\.mjs$/,
  /^scripts\/gates\/g423-empresas-certified-blueprint-mirror-alignment-audit\.mjs$/,
  /^scripts\/gates\/g423-empresas-local-read-contract-certification\.mjs$/,
  /^scripts\/gates\/g423-studio-first-module-policy\.mjs$/,
]);

/**
 * The full set of enterprise-chain gate files whose branch-relative scope checks consume
 * the central guard. Used by the governance test/gate to prove coverage.
 * @type {string[]}
 */
export const STUDIO_SCOPE_GUARD_CONSUMER_GATES = Object.freeze([
  'scripts/gates/g423-studio-blueprint-engine-foundation.mjs',
  'scripts/gates/g423-studio-blueprint-module-reference-planner.mjs',
  'scripts/gates/g423-studio-blueprint-contract-certification.mjs',
  'scripts/gates/g423-studio-blueprint-contract-hardening.mjs',
  'scripts/gates/g423-studio-foundation-contracts.mjs',
  'scripts/gates/g423-empresas-certified-blueprint-mirror-alignment-audit.mjs',
  'scripts/gates/g423-empresas-local-read-contract-certification.mjs',
  'scripts/gates/g423-studio-first-module-policy.mjs',
]);

/**
 * Forbidden paths the CURRENT slice (Studio Dev Preview App Integration) explicitly authorizes for
 * its OWN gate — passed as `explicitlyAuthorizedForbidden` to `classifyStudioScopePath`. This is the
 * ONLY sanctioned way a forbidden path (App.jsx / productionUiGuard) is tolerated, and ONLY for this
 * slice's own gate: `src/App.jsx` receives the minimal additive dev-only route mount, and
 * `scripts/gates/lib/productionUiGuard.mjs` receives the additive Studio dev-route marker. It never
 * relaxes protection for any other path, and prior slices' gates (which pass no such option) still
 * treat both as forbidden. Specific files only — never a broad wildcard.
 * @type {RegExp[]}
 */
export const STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN = Object.freeze([
  /^src\/App\.jsx$/,
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
]);

/** Path shapes that are structurally test/gate/evidence/package (used for reporting). */
export const SCOPE_SHAPE_PATTERNS = Object.freeze({
  test_only: /^src\/runtime\/__tests__\/.+\.test\.js$/,
  gate_only: /^scripts\/gates\/g423-[a-z0-9-]+\.mjs$/,
  evidence_only: /^docs\/evidence\/.+/,
  package_script_only: /^package(-lock)?\.json$/,
});

/**
 * Broad-wildcard sources that must NEVER appear in the allow lists. Used by the
 * governance test to prove the registry never opens a dangerous blanket.
 * @type {string[]}
 */
export const FORBIDDEN_BROAD_ALLOW_SOURCES = Object.freeze([
  '/^src\\/studio\\//',
  '/^src\\//',
  '/^backend\\//',
  '/^src\\/modules\\//',
  '/.*/',
  '/^.*$/',
]);

export default {
  FORBIDDEN_SCOPE_PATTERNS,
  KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS,
  SCOPE_SHAPE_PATTERNS,
  FORBIDDEN_BROAD_ALLOW_SOURCES,
};
