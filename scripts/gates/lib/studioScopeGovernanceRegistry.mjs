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
  // Studio Dev Preview Runtime Shell Contract (this slice).
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
