/**
 * Studio Scope Governance Registry — Post-Foundation C.
 *
 * SINGLE SOURCE OF TRUTH for the CHRONOLOGY of the Studio headless slice sequence.
 *
 * The previous design exposed a flat list of "known later artifacts" that received no
 * identity from the calling slice, so a registered path was not necessarily LATER than
 * the caller — it merely existed. `STUDIO_SLICE_CATALOG` replaces that with an explicit
 * ordinal per slice, so a branch-relative scope check can ask a question that actually
 * has a truth value: "is the slice active on this branch the same as me, or after me?"
 *
 * Design rules (audited):
 *  - `sliceId` unique; `sliceOrdinal` a unique positive integer; a LOWER ordinal means an
 *    OLDER slice.
 *  - Every pattern is anchored. There is deliberately NO `^src/studio/`, `^src/`,
 *    `^backend/` or `^src/modules/` allow-entry.
 *  - Every `primaryArtifactPatterns` entry belongs to EXACTLY ONE slice — ownership never
 *    overlaps.
 *  - No forbidden path ever appears as primary, cross-slice or shared.
 *  - `branchMarkerPatterns` is the narrow subset that identifies WHICH slice a branch is
 *    building (its own subtree and its own evidence directory). Test and gate files are
 *    deliberately NOT markers: a later slice may legitimately touch them through an exact
 *    cross-slice authorization, and that must not make two slices look active at once.
 *  - `sharedGovernancePatterns` (package manifests, the registry, the guard) are shared
 *    infrastructure and never resolve an active slice.
 *  - `crossSliceAuthorizedPatterns` is an EXACT list of foreign artifacts a slice is
 *    allowed to touch. It is never inherited by another slice and never releases a
 *    forbidden path.
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
  // DB migration artifacts, targeted precisely. The previous blanket /migration/i also matched any path whose
  // NAME merely contained the word, which is not what it was protecting. These patterns are strictly stronger for
  // real migration artifacts (they add .sql and nested migrations directories), and anything they no longer catch
  // still fails closed as `unknown_scope` unless a slice explicitly owns it.
  /^migrations\//,
  /(^|\/)migrations?\//i,
  /(^|\/)prisma\/migrations?(\/|$)/i,
  /\.sql$/i,
  /(^|\/)migrate[A-Za-z0-9_-]*\.(js|mjs|cjs|ts|sql)$/i,
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
 * The chronological catalog of every Studio slice represented in this repository, oldest
 * first. This is the ONLY place chronology is declared.
 *
 * @typedef {Object} StudioSlice
 * @property {string} sliceId
 * @property {number} sliceOrdinal
 * @property {string} title
 * @property {RegExp[]} primaryArtifactPatterns artifacts the slice OWNS
 * @property {RegExp[]} branchMarkerPatterns narrow subset that identifies the active slice
 * @property {RegExp[]} crossSliceAuthorizedPatterns exact foreign artifacts it may touch
 * @property {RegExp[]} sharedGovernancePatterns shared infrastructure it may touch
 * @property {string} status
 * @type {StudioSlice[]}
 */
export const STUDIO_SLICE_CATALOG = Object.freeze([
  {
    sliceId: 'studio-foundation-audit',
    sliceOrdinal: 1,
    title: 'Studio Foundation Audit',
    primaryArtifactPatterns: [
      /^src\/runtime\/__tests__\/post-foundation-c-studio-foundation-audit\.test\.js$/,
      /^scripts\/gates\/g423-studio-foundation-audit\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-foundation-audit\//,
    ],
    branchMarkerPatterns: [
      /^docs\/evidence\/post-foundation-c-studio-foundation-audit\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'studio-foundation-contracts',
    sliceOrdinal: 2,
    title: 'Studio Foundation Contracts',
    primaryArtifactPatterns: [
      /^src\/runtime\/__tests__\/post-foundation-c-studio-foundation-contracts\.test\.js$/,
      /^scripts\/gates\/g423-studio-foundation-contracts\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-foundation-contracts\//,
    ],
    branchMarkerPatterns: [
      /^docs\/evidence\/post-foundation-c-studio-foundation-contracts\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'studio-blueprint-contract-hardening',
    sliceOrdinal: 3,
    title: 'Studio Blueprint Contract Hardening',
    primaryArtifactPatterns: [
      /^src\/runtime\/__tests__\/post-foundation-c-studio-blueprint-contract-hardening\.test\.js$/,
      /^scripts\/gates\/g423-studio-blueprint-contract-hardening\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-blueprint-contract-hardening\//,
    ],
    branchMarkerPatterns: [
      /^docs\/evidence\/post-foundation-c-studio-blueprint-contract-hardening\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'studio-blueprint-contract-certification',
    sliceOrdinal: 4,
    title: 'Studio Blueprint Contract Certification',
    primaryArtifactPatterns: [
      /^src\/runtime\/__tests__\/post-foundation-c-studio-blueprint-contract-certification\.test\.js$/,
      /^scripts\/gates\/g423-studio-blueprint-contract-certification\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-blueprint-contract-certification\//,
    ],
    branchMarkerPatterns: [
      /^docs\/evidence\/post-foundation-c-studio-blueprint-contract-certification\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'studio-first-module-policy',
    sliceOrdinal: 5,
    title: 'Studio First Module Policy',
    primaryArtifactPatterns: [
      /^src\/runtime\/__tests__\/post-foundation-c-studio-first-module-policy\.test\.js$/,
      /^scripts\/gates\/g423-studio-first-module-policy\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-first-module-policy\//,
    ],
    branchMarkerPatterns: [
      /^docs\/evidence\/post-foundation-c-studio-first-module-policy\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'studio-blueprint-engine-foundation',
    sliceOrdinal: 6,
    title: 'Studio Blueprint Engine Foundation',
    primaryArtifactPatterns: [
      /^src\/runtime\/__tests__\/studio-blueprint-engine-foundation\.test\.js$/,
      /^scripts\/gates\/g423-studio-blueprint-engine-foundation\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-blueprint-engine-foundation\//,
    ],
    branchMarkerPatterns: [
      /^docs\/evidence\/post-foundation-c-studio-blueprint-engine-foundation\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'studio-blueprint-module-reference-planner',
    sliceOrdinal: 7,
    title: 'Studio Blueprint Module Reference Planner',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/module-reference-planner\//,
      /^src\/runtime\/__tests__\/studio-blueprint-module-reference-planner\.test\.js$/,
      /^scripts\/gates\/g423-studio-blueprint-module-reference-planner\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-blueprint-module-reference-planner\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/module-reference-planner\//,
      /^docs\/evidence\/post-foundation-c-studio-blueprint-module-reference-planner\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'module-preview-sandbox',
    sliceOrdinal: 8,
    title: 'Studio Module Preview Sandbox Contract',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/module-preview-sandbox\//,
      /^src\/runtime\/__tests__\/studio-module-preview-sandbox-contract\.test\.js$/,
      /^scripts\/gates\/g423-studio-module-preview-sandbox-contract\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-module-preview-sandbox-contract\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/module-preview-sandbox\//,
      /^docs\/evidence\/post-foundation-c-studio-module-preview-sandbox-contract\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'studio-scope-governance-maintenance',
    sliceOrdinal: 9,
    title: 'Studio Scope Governance Maintenance',
    primaryArtifactPatterns: [
      /^src\/runtime\/__tests__\/studio-scope-governance-maintenance\.test\.js$/,
      /^scripts\/gates\/g423-studio-scope-governance-maintenance\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-scope-governance-maintenance\//,
    ],
    branchMarkerPatterns: [
      /^docs\/evidence\/post-foundation-c-studio-scope-governance-maintenance\//,
    ],
    crossSliceAuthorizedPatterns: [
      /^scripts\/gates\/g423-studio-blueprint-engine-foundation\.mjs$/,
      /^scripts\/gates\/g423-studio-blueprint-module-reference-planner\.mjs$/,
      /^scripts\/gates\/g423-studio-blueprint-contract-certification\.mjs$/,
      /^scripts\/gates\/g423-studio-blueprint-contract-hardening\.mjs$/,
      /^scripts\/gates\/g423-studio-foundation-contracts\.mjs$/,
      /^scripts\/gates\/g423-empresas-certified-blueprint-mirror-alignment-audit\.mjs$/,
      /^scripts\/gates\/g423-empresas-local-read-contract-certification\.mjs$/,
      /^scripts\/gates\/g423-studio-first-module-policy\.mjs$/,
      /^src\/runtime\/__tests__\/studio-blueprint-engine-foundation\.test\.js$/,
    ],
    sharedGovernancePatterns: [
      /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
      /^scripts\/gates\/lib\/studioScopeGovernanceGuard\.mjs$/,
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'studio-scope-governance-self-guard-fix',
    sliceOrdinal: 10,
    title: 'Studio Scope Governance Self Guard Fix',
    primaryArtifactPatterns: [
      /^docs\/evidence\/post-foundation-c-studio-scope-governance-self-guard-fix\//,
    ],
    branchMarkerPatterns: [
      /^docs\/evidence\/post-foundation-c-studio-scope-governance-self-guard-fix\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'dev-preview-contract-bridge',
    sliceOrdinal: 11,
    title: 'Studio Dev Preview Contract Bridge',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-contract-bridge\//,
      /^src\/runtime\/__tests__\/studio-dev-preview-contract-bridge\.test\.js$/,
      /^scripts\/gates\/g423-studio-dev-preview-contract-bridge\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-contract-bridge\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-contract-bridge\//,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-contract-bridge\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'dev-preview-visual-contract',
    sliceOrdinal: 12,
    title: 'Studio Dev Preview Visual Contract',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-visual-contract\//,
      /^src\/runtime\/__tests__\/studio-dev-preview-visual-contract\.test\.js$/,
      /^scripts\/gates\/g423-studio-dev-preview-visual-contract\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-visual-contract\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-visual-contract\//,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-visual-contract\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'dev-preview-runtime-shell-contract',
    sliceOrdinal: 13,
    title: 'Studio Dev Preview Runtime Shell Contract',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-runtime-shell-contract\//,
      /^src\/runtime\/__tests__\/studio-dev-preview-runtime-shell-contract\.test\.js$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-shell-contract\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-shell-contract\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-runtime-shell-contract\//,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-shell-contract\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'dev-preview-isolated-runtime-implementation-plan',
    sliceOrdinal: 14,
    title: 'Studio Dev Preview Isolated Runtime Implementation Plan',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-isolated-runtime-implementation-plan\//,
      /^src\/runtime\/__tests__\/studio-dev-preview-isolated-runtime-implementation-plan\.test\.js$/,
      /^scripts\/gates\/g423-studio-dev-preview-isolated-runtime-implementation-plan\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-isolated-runtime-implementation-plan\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-isolated-runtime-implementation-plan\//,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-isolated-runtime-implementation-plan\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'dev-preview-isolated-runtime',
    sliceOrdinal: 15,
    title: 'Studio Dev Preview Isolated Runtime',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-isolated-runtime\//,
      /^src\/runtime\/__tests__\/studio-dev-preview-isolated-runtime\.test\.js$/,
      /^scripts\/gates\/g423-studio-dev-preview-isolated-runtime\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-isolated-runtime\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-isolated-runtime\//,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-isolated-runtime\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'dev-preview-runtime-ui-contract',
    sliceOrdinal: 16,
    title: 'Studio Dev Preview Runtime UI Contract',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui-contract\//,
      /^src\/runtime\/__tests__\/studio-dev-preview-runtime-ui-contract\.test\.js$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-ui-contract\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-ui-contract\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui-contract\//,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-ui-contract\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'dev-preview-runtime-ui-implementation-plan',
    sliceOrdinal: 17,
    title: 'Studio Dev Preview Runtime UI Implementation Plan',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui-implementation-plan\//,
      /^src\/runtime\/__tests__\/studio-dev-preview-runtime-ui-implementation-plan\.test\.js$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-ui-implementation-plan\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-ui-implementation-plan\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui-implementation-plan\//,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-ui-implementation-plan\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'dev-preview-runtime-ui',
    sliceOrdinal: 18,
    title: 'Studio Dev Preview Runtime UI',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui\//,
      /^src\/runtime\/__tests__\/studio-dev-preview-runtime-ui\.test\.js$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-ui\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-ui\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-runtime-ui\//,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-runtime-ui\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'dev-preview-route-menu-contract',
    sliceOrdinal: 19,
    title: 'Studio Dev Preview Route/Menu Contract',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-route-menu-contract\//,
      /^src\/runtime\/__tests__\/studio-dev-preview-route-menu-contract\.test\.js$/,
      /^scripts\/gates\/g423-studio-dev-preview-route-menu-contract\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu-contract\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-route-menu-contract\//,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu-contract\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'dev-preview-route-menu-implementation-plan',
    sliceOrdinal: 20,
    title: 'Studio Dev Preview Route/Menu Implementation Plan',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-route-menu-implementation-plan\//,
      /^src\/runtime\/__tests__\/studio-dev-preview-route-menu-implementation-plan\.test\.js$/,
      /^scripts\/gates\/g423-studio-dev-preview-route-menu-implementation-plan\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu-implementation-plan\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-route-menu-implementation-plan\//,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu-implementation-plan\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'dev-preview-route-menu',
    sliceOrdinal: 21,
    title: 'Studio Dev Preview Route/Menu',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-route-menu\//,
      /^src\/runtime\/__tests__\/studio-dev-preview-route-menu\.test\.js$/,
      /^scripts\/gates\/g423-studio-dev-preview-route-menu\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-route-menu\//,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-route-menu\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'dev-preview-app-integration-contract',
    sliceOrdinal: 22,
    title: 'Studio Dev Preview App Integration Contract',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-app-integration-contract\//,
      /^src\/runtime\/__tests__\/studio-dev-preview-app-integration-contract\.test\.js$/,
      /^scripts\/gates\/g423-studio-dev-preview-app-integration-contract\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-app-integration-contract\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-app-integration-contract\//,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-app-integration-contract\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'dev-preview-app-integration-implementation-plan',
    sliceOrdinal: 23,
    title: 'Studio Dev Preview App Integration Implementation Plan',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-app-integration-implementation-plan\//,
      /^src\/runtime\/__tests__\/studio-dev-preview-app-integration-implementation-plan\.test\.js$/,
      /^scripts\/gates\/g423-studio-dev-preview-app-integration-implementation-plan\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-app-integration-implementation-plan\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-app-integration-implementation-plan\//,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-app-integration-implementation-plan\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'dev-preview-app-integration',
    sliceOrdinal: 24,
    title: 'Studio Dev Preview App Integration',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-app-integration\//,
      /^src\/runtime\/__tests__\/studio-dev-preview-app-integration\.test\.js$/,
      /^scripts\/gates\/g423-studio-dev-preview-app-integration\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-app-integration\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/dev-preview-app-integration\//,
      /^docs\/evidence\/post-foundation-c-studio-dev-preview-app-integration\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [
      // The ONLY forbidden paths any slice may ever touch: this slice receives the minimal additive
      // dev-only route mount in App.jsx and the additive Studio dev-route marker in the production UI
      // guard. Bound to THIS catalog entry, so no caller can supply it and no slice can inherit it.
      /^src\/App\.jsx$/,
      /^scripts\/gates\/lib\/productionUiGuard\.mjs$/,
    ],
    status: 'merged',
  },
  {
    sliceId: 'module-blueprint-authoring-foundation-contract',
    sliceOrdinal: 25,
    title: 'Studio Module Blueprint Authoring Foundation Contract',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/module-blueprint-authoring-foundation-contract\//,
      /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-foundation-contract\.test\.js$/,
      /^scripts\/gates\/g423-studio-module-blueprint-authoring-foundation-contract\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-foundation-contract\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/module-blueprint-authoring-foundation-contract\//,
      /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-foundation-contract\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'module-blueprint-authoring-implementation-plan',
    sliceOrdinal: 26,
    title: 'Studio Module Blueprint Authoring Implementation Plan',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/module-blueprint-authoring-implementation-plan\//,
      /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-implementation-plan\.test\.js$/,
      /^scripts\/gates\/g423-studio-module-blueprint-authoring-implementation-plan\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-implementation-plan\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/module-blueprint-authoring-implementation-plan\//,
      /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-implementation-plan\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'module-blueprint-authoring-runtime',
    sliceOrdinal: 27,
    title: 'Studio Module Blueprint Authoring Runtime',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/module-blueprint-authoring-runtime\//,
      /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-runtime\.test\.js$/,
      /^scripts\/gates\/g423-studio-module-blueprint-authoring-runtime\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-runtime\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/module-blueprint-authoring-runtime\//,
      /^docs\/evidence\/post-foundation-c-studio-module-blueprint-authoring-runtime\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'authoring-runtime-to-preview-bridge-contract',
    sliceOrdinal: 28,
    title: 'Studio Authoring Runtime-to-Preview Bridge Contract',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-contract\//,
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-contract\.test\.js$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-contract\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-contract\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-contract\//,
      /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-contract\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'authoring-runtime-to-preview-bridge-implementation-plan',
    sliceOrdinal: 29,
    title: 'Studio Authoring Runtime-to-Preview Bridge Implementation Plan',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-implementation-plan\//,
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-implementation-plan\.test\.js$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-implementation-plan\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-implementation-plan\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge-implementation-plan\//,
      /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-implementation-plan\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'authoring-runtime-to-preview-bridge-source-shape-alignment',
    sliceOrdinal: 30,
    title: 'Studio Bridge Source-Shape Alignment Correction',
    primaryArtifactPatterns: [
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-source-shape-alignment\.test\.js$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-source-shape-alignment\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-source-shape-alignment\//,
    ],
    branchMarkerPatterns: [
      /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-source-shape-alignment\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'authoring-runtime-to-preview-bridge',
    sliceOrdinal: 31,
    title: 'Studio Authoring Runtime-to-Preview Bridge',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge\//,
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge\.test\.js$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/authoring-runtime-to-preview-bridge\//,
      /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'authoring-runtime-to-preview-bridge-hardening',
    sliceOrdinal: 32,
    title: 'Studio Authoring Runtime-to-Preview Bridge Hardening',
    primaryArtifactPatterns: [
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-hardening\.test\.js$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-hardening\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-hardening\//,
    ],
    branchMarkerPatterns: [
      /^docs\/evidence\/post-foundation-c-studio-authoring-runtime-to-preview-bridge-hardening\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'bridge-to-preview-sandbox-runtime-contract',
    sliceOrdinal: 33,
    title: 'Studio Bridge-to-Preview Sandbox Runtime Contract',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-to-preview-sandbox-runtime-contract\//,
      /^src\/runtime\/__tests__\/studio-bridge-to-preview-sandbox-runtime-contract\.test\.js$/,
      /^scripts\/gates\/g423-studio-bridge-to-preview-sandbox-runtime-contract\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-contract\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-to-preview-sandbox-runtime-contract\//,
      /^docs\/evidence\/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-contract\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'bridge-decision-envelope-identity-contract',
    sliceOrdinal: 34,
    title: 'Studio Bridge Decision Envelope Identity Contract',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-decision-envelope-identity-contract\//,
      /^src\/runtime\/__tests__\/studio-bridge-decision-envelope-identity-contract\.test\.js$/,
      /^scripts\/gates\/g423-studio-bridge-decision-envelope-identity-contract\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-bridge-decision-envelope-identity-contract\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-decision-envelope-identity-contract\//,
      /^docs\/evidence\/post-foundation-c-studio-bridge-decision-envelope-identity-contract\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'bridge-to-preview-sandbox-runtime-implementation-plan',
    sliceOrdinal: 35,
    title: 'Studio Bridge-to-Preview Sandbox Runtime Implementation Plan',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-to-preview-sandbox-runtime-implementation-plan\//,
      /^src\/runtime\/__tests__\/studio-bridge-to-preview-sandbox-runtime-implementation-plan\.test\.js$/,
      /^scripts\/gates\/g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-implementation-plan\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-to-preview-sandbox-runtime-implementation-plan\//,
      /^docs\/evidence\/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-implementation-plan\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'bridge-decision-core-envelope-contract',
    sliceOrdinal: 36,
    title: 'Studio Bridge Decision Core Envelope Contract (v2)',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-decision-core-envelope-contract\//,
      /^src\/runtime\/__tests__\/studio-bridge-decision-core-envelope-contract\.test\.js$/,
      /^scripts\/gates\/g423-studio-bridge-decision-core-envelope-contract\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-bridge-decision-core-envelope-contract\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-decision-core-envelope-contract\//,
      /^docs\/evidence\/post-foundation-c-studio-bridge-decision-core-envelope-contract\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment',
    sliceOrdinal: 37,
    title: 'Studio Bridge Sandbox Runtime Implementation Plan Alignment Amendment',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment\//,
      /^src\/runtime\/__tests__\/studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment\.test\.js$/,
      /^scripts\/gates\/g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment\//,
      /^docs\/evidence\/post-foundation-c-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'bridge-decision-core-envelope-builder-contract',
    sliceOrdinal: 38,
    title: 'Studio Bridge Decision Core Envelope Builder Contract',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-decision-core-envelope-builder-contract\//,
      /^src\/runtime\/__tests__\/studio-bridge-decision-core-envelope-builder-contract\.test\.js$/,
      /^scripts\/gates\/g423-studio-bridge-decision-core-envelope-builder-contract\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-bridge-decision-core-envelope-builder-contract\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-decision-core-envelope-builder-contract\//,
      /^docs\/evidence\/post-foundation-c-studio-bridge-decision-core-envelope-builder-contract\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'bridge-decision-core-envelope-builder-verification-state-correction',
    sliceOrdinal: 39,
    title: 'Studio Core Envelope Builder Verification State Correction',
    primaryArtifactPatterns: [],
    branchMarkerPatterns: [],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged_without_dedicated_artifacts',
  },
  {
    sliceId: 'bridge-decision-core-envelope-builder-implementation-plan',
    sliceOrdinal: 40,
    title: 'Studio Bridge Decision Core Envelope Builder Implementation Plan',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-decision-core-envelope-builder-implementation-plan\//,
      /^src\/runtime\/__tests__\/studio-bridge-decision-core-envelope-builder-implementation-plan\.test\.js$/,
      /^scripts\/gates\/g423-studio-bridge-decision-core-envelope-builder-implementation-plan\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-bridge-decision-core-envelope-builder-implementation-plan\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-decision-core-envelope-builder-implementation-plan\//,
      /^docs\/evidence\/post-foundation-c-studio-bridge-decision-core-envelope-builder-implementation-plan\//,
    ],
    crossSliceAuthorizedPatterns: [],
    sharedGovernancePatterns: [
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'bridge-decision-core-envelope-builder',
    sliceOrdinal: 41,
    title: 'Studio Bridge Decision Core Envelope Builder',
    primaryArtifactPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-decision-core-envelope-builder\//,
      /^src\/runtime\/__tests__\/studio-bridge-decision-core-envelope-builder\.test\.js$/,
      /^scripts\/gates\/g423-studio-bridge-decision-core-envelope-builder\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-bridge-decision-core-envelope-builder\//,
    ],
    branchMarkerPatterns: [
      /^src\/studio\/blueprint-engine\/bridge-decision-core-envelope-builder\//,
      /^docs\/evidence\/post-foundation-c-studio-bridge-decision-core-envelope-builder\//,
    ],
    crossSliceAuthorizedPatterns: [
      /^src\/runtime\/__tests__\/studio-bridge-decision-core-envelope-builder-implementation-plan\.test\.js$/,
      /^scripts\/gates\/g423-studio-bridge-decision-core-envelope-builder-implementation-plan\.mjs$/,
    ],
    sharedGovernancePatterns: [
      /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'open_pull_request_495',
  },
  {
    sliceId: 'studio-scope-governance-chronological-migration',
    sliceOrdinal: 42,
    title: 'Studio Scope Governance Chronological Migration',
    primaryArtifactPatterns: [
      /^src\/runtime\/__tests__\/studio-scope-governance-chronological-migration\.test\.js$/,
      /^scripts\/gates\/g423-studio-scope-governance-chronological-migration\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-scope-governance-chronological-migration\//,
    ],
    branchMarkerPatterns: [
      /^docs\/evidence\/post-foundation-c-studio-scope-governance-chronological-migration\//,
    ],
    crossSliceAuthorizedPatterns: [
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-contract\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-implementation-plan\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-dev-preview-app-integration-contract\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-dev-preview-app-integration-implementation-plan\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-dev-preview-app-integration\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-foundation-contract\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-implementation-plan\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-runtime\.test\.js$/,
      /^scripts\/gates\/g423-studio-foundation-audit\.mjs$/,
      /^scripts\/gates\/g423-studio-module-preview-sandbox-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-contract-bridge\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-visual-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-shell-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-isolated-runtime-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-isolated-runtime\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-ui-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-ui-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-ui\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-route-menu-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-route-menu-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-route-menu\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-app-integration-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-app-integration-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-app-integration\.mjs$/,
      /^scripts\/gates\/g423-studio-module-blueprint-authoring-foundation-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-module-blueprint-authoring-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-module-blueprint-authoring-runtime\.mjs$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge\.mjs$/,
      /^src\/runtime\/__tests__\/studio-scope-governance-maintenance\.test\.js$/,
      /^scripts\/gates\/g423-studio-scope-governance-maintenance\.mjs$/,
      // Extra artifacts whose branch-relative substring heuristics collide with this slice's own MANDATED
      // name (`migration`), with the route-menu gate file names, or with the guard file this slice owns.
      // Declared exactly, one path at a time — see REQUIRED-SCOPE-EXTENSION.md.
      /^src\/runtime\/__tests__\/empresas-certified-blueprint-mirror-alignment-audit\.test\.js$/,
      /^src\/runtime\/__tests__\/empresas-local-read-contract-certification\.test\.js$/,
      /^src\/runtime\/__tests__\/empresas-local-read-only-contract-pilot\.test\.js$/,
      /^src\/runtime\/__tests__\/empresas-local-read-parity-hardening\.test\.js$/,
      /^src\/runtime\/__tests__\/empresas-studio-compatibility-slice-1\.test\.js$/,
      /^src\/runtime\/__tests__\/post-foundation-c-empresas-controlled-production-test-plan\.test\.js$/,
      /^src\/runtime\/__tests__\/post-foundation-c-studio-foundation-audit\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-hardening\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-source-shape-alignment\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-blueprint-contract-certification\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-blueprint-contract-hardening\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-blueprint-engine-foundation\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-blueprint-module-reference-planner\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-bridge-decision-envelope-identity-contract\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-bridge-to-preview-sandbox-runtime-contract\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-foundation-contracts\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-module-preview-sandbox-contract\.test\.js$/,
      /^scripts\/gates\/g423-studio-blueprint-engine-foundation\.mjs$/,
      /^scripts\/gates\/g423-studio-blueprint-module-reference-planner\.mjs$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-source-shape-alignment\.mjs$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-hardening\.mjs$/,
      /^scripts\/gates\/g423-studio-bridge-to-preview-sandbox-runtime-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-bridge-decision-envelope-identity-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-bridge-decision-core-envelope-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment\.mjs$/,
      /^scripts\/gates\/g423-studio-bridge-decision-core-envelope-builder-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-bridge-decision-core-envelope-builder-implementation-plan\.mjs$/,
    ],
    sharedGovernancePatterns: [
      /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
      /^scripts\/gates\/lib\/studioScopeGovernanceGuard\.mjs$/,
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'studio-scope-governance-main-diff-correction',
    sliceOrdinal: 43,
    title: 'Studio Scope Governance Main-Diff Correction',
    primaryArtifactPatterns: [
      /^src\/runtime\/__tests__\/studio-scope-governance-main-diff-correction\.test\.js$/,
      /^scripts\/gates\/g423-studio-scope-governance-main-diff-correction\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-scope-governance-main-diff-correction\//,
    ],
    branchMarkerPatterns: [
      /^docs\/evidence\/post-foundation-c-studio-scope-governance-main-diff-correction\//,
    ],
    // One exact regex per historical file this correction really rewires. No directory wildcard,
    // no `^src/runtime/__tests__/`, no `^scripts/gates/`, no duplicate. The union below is exactly
    // the intended diff of this slice.
    crossSliceAuthorizedPatterns: [
      // The nine aggregate tests whose branch-relative scenario is fail-closed on an empty diff.
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-contract\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-implementation-plan\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-dev-preview-app-integration-contract\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-dev-preview-app-integration-implementation-plan\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-dev-preview-app-integration\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-foundation-contract\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-implementation-plan\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-runtime\.test\.js$/,
      // The previous governance slice's own test and gate (section "THIS BRANCH").
      /^src\/runtime\/__tests__\/studio-scope-governance-chronological-migration\.test\.js$/,
      /^scripts\/gates\/g423-studio-scope-governance-chronological-migration\.mjs$/,
      // The twenty-two Studio gates that consume the branch-relative evaluation.
      /^scripts\/gates\/g423-studio-foundation-audit\.mjs$/,
      /^scripts\/gates\/g423-studio-module-preview-sandbox-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-contract-bridge\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-visual-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-shell-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-isolated-runtime-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-isolated-runtime\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-ui-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-ui-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-ui\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-route-menu-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-route-menu-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-route-menu\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-app-integration-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-app-integration-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-app-integration\.mjs$/,
      /^scripts\/gates\/g423-studio-module-blueprint-authoring-foundation-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-module-blueprint-authoring-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-module-blueprint-authoring-runtime\.mjs$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge\.mjs$/,
      // The seventeen historical tests whose local `migrationExempt` helper is centralized here.
      /^src\/runtime\/__tests__\/empresas-certified-blueprint-mirror-alignment-audit\.test\.js$/,
      /^src\/runtime\/__tests__\/empresas-local-read-contract-certification\.test\.js$/,
      /^src\/runtime\/__tests__\/empresas-local-read-only-contract-pilot\.test\.js$/,
      /^src\/runtime\/__tests__\/empresas-local-read-parity-hardening\.test\.js$/,
      /^src\/runtime\/__tests__\/empresas-studio-compatibility-slice-1\.test\.js$/,
      /^src\/runtime\/__tests__\/post-foundation-c-empresas-controlled-production-test-plan\.test\.js$/,
      /^src\/runtime\/__tests__\/post-foundation-c-studio-foundation-audit\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-hardening\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-source-shape-alignment\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-blueprint-contract-certification\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-blueprint-contract-hardening\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-blueprint-engine-foundation\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-blueprint-module-reference-planner\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-bridge-decision-envelope-identity-contract\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-bridge-to-preview-sandbox-runtime-contract\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-foundation-contracts\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-module-preview-sandbox-contract\.test\.js$/,
      // The twelve historical gates whose exemption is chronology-free or prefix-bound today.
      /^scripts\/gates\/g423-studio-blueprint-engine-foundation\.mjs$/,
      /^scripts\/gates\/g423-studio-blueprint-module-reference-planner\.mjs$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-source-shape-alignment\.mjs$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-hardening\.mjs$/,
      /^scripts\/gates\/g423-studio-bridge-to-preview-sandbox-runtime-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-bridge-decision-envelope-identity-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-bridge-decision-core-envelope-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment\.mjs$/,
      /^scripts\/gates\/g423-studio-bridge-decision-core-envelope-builder-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-bridge-decision-core-envelope-builder-implementation-plan\.mjs$/,
    ],
    sharedGovernancePatterns: [
      /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
      /^scripts\/gates\/lib\/studioScopeGovernanceGuard\.mjs$/,
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'merged',
  },
  {
    sliceId: 'studio-scope-governance-historical-branch-consumers',
    sliceOrdinal: 44,
    title: 'Studio Scope Governance Historical Branch Consumers',
    primaryArtifactPatterns: [
      /^src\/runtime\/__tests__\/studio-scope-governance-historical-branch-consumers\.test\.js$/,
      /^scripts\/gates\/g423-studio-scope-governance-historical-branch-consumers\.mjs$/,
      /^docs\/evidence\/post-foundation-c-studio-scope-governance-historical-branch-consumers\//,
    ],
    branchMarkerPatterns: [
      /^docs\/evidence\/post-foundation-c-studio-scope-governance-historical-branch-consumers\//,
    ],
    // One exact regex per branch-relative CONSUMER this slice rewires. No directory wildcard, no
    // historical evidence path, no Builder path, no production path.
    crossSliceAuthorizedPatterns: [
      // The nine aggregate tests whose "this branch" section judges the current diff.
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-contract\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge-implementation-plan\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-authoring-runtime-to-preview-bridge\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-dev-preview-app-integration-contract\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-dev-preview-app-integration-implementation-plan\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-dev-preview-app-integration\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-foundation-contract\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-implementation-plan\.test\.js$/,
      /^src\/runtime\/__tests__\/studio-module-blueprint-authoring-runtime\.test\.js$/,
      // The twenty-two Studio gates with the same branch-relative section.
      /^scripts\/gates\/g423-studio-foundation-audit\.mjs$/,
      /^scripts\/gates\/g423-studio-module-preview-sandbox-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-contract-bridge\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-visual-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-shell-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-isolated-runtime-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-isolated-runtime\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-ui-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-ui-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-runtime-ui\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-route-menu-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-route-menu-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-route-menu\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-app-integration-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-app-integration-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-dev-preview-app-integration\.mjs$/,
      /^scripts\/gates\/g423-studio-module-blueprint-authoring-foundation-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-module-blueprint-authoring-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-module-blueprint-authoring-runtime\.mjs$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-contract\.mjs$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge-implementation-plan\.mjs$/,
      /^scripts\/gates\/g423-studio-authoring-runtime-to-preview-bridge\.mjs$/,
      // The governance consumers that judge a branch diff (ordinals 9, 42 and 43).
      // studio-scope-governance-maintenance.test.js is deliberately absent: it only
      // exercises the guard API directly and never judges a branch diff, so it is not
      // a consumer and needs no cross-slice authorization from this slice.
      /^scripts\/gates\/g423-studio-scope-governance-maintenance\.mjs$/,
      /^src\/runtime\/__tests__\/studio-scope-governance-chronological-migration\.test\.js$/,
      /^scripts\/gates\/g423-studio-scope-governance-chronological-migration\.mjs$/,
      /^src\/runtime\/__tests__\/studio-scope-governance-main-diff-correction\.test\.js$/,
      /^scripts\/gates\/g423-studio-scope-governance-main-diff-correction\.mjs$/,
    ],
    sharedGovernancePatterns: [
      /^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/,
      /^scripts\/gates\/lib\/studioScopeGovernanceGuard\.mjs$/,
      /^package\.json$/,
      /^package-lock\.json$/,
    ],
    explicitlyAuthorizedForbiddenPatterns: [],
    status: 'active_slice',
  },

].map(Object.freeze));

/** The slice that fixes the post-merge empty-diff boundary. Chronologically after the migration. */
export const MAIN_DIFF_CORRECTION_SLICE_ID = 'studio-scope-governance-main-diff-correction';

/**
 * The slice that separates BRANCH CERTIFICATION from CONSUMER APPLICABILITY, so a branch-relative
 * check belonging to a LATER slice can run inside an EARLIER slice's still-open branch without
 * either weakening the core or falsely certifying the branch.
 */
export const HISTORICAL_BRANCH_CONSUMERS_SLICE_ID = 'studio-scope-governance-historical-branch-consumers';

/** Ordinals of the slices whose branch-relative scope checks this migration rewires. */
export const CHRONOLOGICAL_MIGRATION_SLICE_ID = 'studio-scope-governance-chronological-migration';

/**
 * The 21 pre-Studio gates that are deliberately NOT migrated by this slice. They belong to
 * the ModeloBase / Empresas / Generic Model programs, are outside the Studio catalog, and
 * are neither in the official `test:runtime` nor in the official `gate:g423`. They need
 * their own governance decision — they are NOT declared PASS and NOT masked.
 * @type {string[]}
 */
export const LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED = Object.freeze([
  'scripts/gates/g423-modelobase1-empresas-campos-direct-beta.mjs',
  'scripts/gates/g423-modelobase1-runtime-wiring.mjs',
  'scripts/gates/g423-modelobase1-beta-ui-hardening.mjs',
  'scripts/gates/g423-modelobase1-controlled-local-write-plan.mjs',
  'scripts/gates/g423-modelobase1-controlled-local-write-activation.mjs',
  'scripts/gates/g423-modelobase1-local-persistence-validation.mjs',
  'scripts/gates/g423-generic-model-contracts-foundation.mjs',
  'scripts/gates/g423-modelobase1-adapter-to-generic-kernel.mjs',
  'scripts/gates/g423-empresas-cadcps-consuming-generic-kernel.mjs',
  'scripts/gates/g423-modelobase2-prototype-adapter.mjs',
  'scripts/gates/g423-generic-model-multi-type-hardening.mjs',
  'scripts/gates/g423-modelobase2-operational-runtime-foundation.mjs',
  'scripts/gates/g423-modelobase2-fuel-headless-candidate.mjs',
  'scripts/gates/g423-modelobase2-fuel-beta-ui-sandbox.mjs',
  'scripts/gates/g423-modelobase2-fuel-dev-preview-route.mjs',
  'scripts/gates/g423-modelobase2-fuel-module-shell-readiness.mjs',
  'scripts/gates/g423-empresas-production-baseline-audit.mjs',
  'scripts/gates/g423-empresas-controlled-production-test-plan.mjs',
  'scripts/gates/g423-empresas-local-read-only-contract-pilot.mjs',
  'scripts/gates/g423-empresas-local-read-parity-hardening.mjs',
  'scripts/gates/g423-empresas-studio-compatibility-slice-1.mjs',
]);

/**
 * LEGACY, DERIVED export kept for the consumers that have not been migrated yet. It is the
 * union of every catalogued slice's primary, cross-slice and shared patterns — it is NOT a
 * hand-maintained list any more, so it can never drift from the catalog. It carries no
 * chronology: prefer `evaluateStudioBranchScope` with a `callerSliceId`.
 * @type {RegExp[]}
 */
export const KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS = Object.freeze(
  STUDIO_SLICE_CATALOG.flatMap((s) => [
    ...s.primaryArtifactPatterns, ...s.crossSliceAuthorizedPatterns, ...s.sharedGovernancePatterns,
  ]),
);

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
 * DERIVED from the catalog entry of `dev-preview-app-integration` — never a second, independent list. It exists
 * only so older call sites can read the same two patterns; the authorization itself is applied by
 * `evaluateStudioBranchScope` from the ACTIVE slice's own entry, never from a caller-supplied option.
 * @type {RegExp[]}
 */
export const STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN = Object.freeze([
  ...(STUDIO_SLICE_CATALOG.find((s) => s.sliceId === 'dev-preview-app-integration')?.explicitlyAuthorizedForbiddenPatterns ?? []),
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
  STUDIO_SLICE_CATALOG,
  KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS,
  LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED,
  SCOPE_SHAPE_PATTERNS,
  FORBIDDEN_BROAD_ALLOW_SOURCES,
};
