/** MAK Studio Architecture Governance — Program 2.0.8 constants. */

export const STUDIO_GOVERNANCE_VERSION = "mak-studio-governance-v1";

/**
 * Official dependency stack (top → bottom).
 * Higher layers may depend on lower; inversions are forbidden.
 */
export const DEPENDENCY_STACK = Object.freeze([
  { layerId: "studio-consumer", label: "Studio Shell / Designers / Dock", paths: ["shell", "designers", "dock", "navigation", "workspace", "pages", "panels", "mock"] },
  { layerId: "studio-editor", label: "Studio Editor Engine", paths: ["editor"] },
  { layerId: "studio-expression", label: "Studio Expression Engine", paths: ["expression"] },
  { layerId: "studio-som", label: "Studio Object Model", paths: ["som"] },
  { layerId: "studio-core", label: "Studio Core Engine", paths: ["core"] },
  { layerId: "studio-domain", label: "Studio Domain Engine", paths: ["domain"] },
  { layerId: "studio-contributions", label: "Studio Contribution Engine", paths: ["contributions"] },
  { layerId: "studio-universal-components", label: "Universal Studio Components", paths: ["components"] },
  { layerId: "studio-governance", label: "Architecture Governance", paths: ["governance"] },
  { layerId: "studio-sdk", label: "Studio SDK", paths: ["sdk"] },
  { layerId: "studio-events", label: "Studio Event Hub", paths: ["events"] },
  { layerId: "studio-design-system", label: "Design System", paths: ["designSystem"] },
  { layerId: "studio-registry", label: "Studio Registries", paths: ["registry"] },
  { layerId: "mdp-apis", label: "MDP APIs", paths: ["services"] },
  { layerId: "runtime-bridge", label: "Runtime Bridge", paths: [] },
  { layerId: "foundation", label: "Foundation", paths: [] },
]);

/** Consumer layers subject to designer isolation rules. */
export const CONSUMER_LAYER_PATHS = Object.freeze([
  "shell",
  "designers",
  "dock",
  "navigation",
  "workspace",
  "pages",
  "panels",
  "mock",
]);

/** Public API entry points — consumer code must use these, not internals. */
export const PUBLIC_API_ENTRY_POINTS = Object.freeze([
  "src/studio/index.js",
  "src/studio/sdk/index.js",
  "src/studio/events/index.js",
  "src/studio/designSystem/index.js",
  "src/studio/governance/index.js",
  "src/studio/components/index.js",
  "src/studio/domain/index.js",
  "src/studio/contributions/index.js",
  "src/studio/core/index.js",
  "src/studio/som/index.js",
  "src/studio/editor/index.js",
  "src/studio/expression/index.js",
  "src/studio/services/",
]);

/** Internal registry paths — forbidden for consumer direct imports. */
export const INTERNAL_REGISTRY_PATHS = Object.freeze([
  "/registry/componentRegistry",
  "/registry/propertyRegistry",
  "/registry/eventRegistry",
  "/registry/actionRegistry",
  "/registry/capabilityRegistry",
  "/registry/designerRegistry",
  "/registry/bootstrapStudioRegistries",
  "/designSystem/registry/",
  "/events/registry/",
  "/events/hub/studioEventHub",
]);

/** Forbidden patterns for all Studio code (no layer may import these). */
export const FORBIDDEN_FOUNDATION_PATTERNS = Object.freeze([
  { id: "foundation-mak", pattern: /framework\/mak/, message: "Direct Foundation (framework/mak) access forbidden." },
  { id: "modelobase1", pattern: /ModeloBase1/, message: "Direct ModeloBase1 access forbidden." },
  { id: "runtime-bridge", pattern: /runtimeBridge|registerRuntimeBridge/, message: "Direct Runtime Bridge access forbidden." },
  { id: "bootstrap", pattern: /makBootstrap|registerMak(?!Cadastro)/, message: "Direct Bootstrap/Runtime registration forbidden." },
  { id: "prisma", pattern: /\bprisma\./, message: "Direct Prisma access forbidden in Studio." },
  { id: "mdp-mutation", pattern: /mdpPublishService|mdpRegistryService\.(create|update|delete)/, message: "Direct MDP mutation bypass forbidden — use official API clients." },
]);

/** Allowed official registry root directories. */
export const OFFICIAL_REGISTRY_DIRS = Object.freeze([
  "src/studio/registry",
  "src/studio/designSystem/registry",
  "src/studio/events/registry",
]);

/** Designer IDs for cross-import detection. */
export const DESIGNER_FOLDER_PATTERN = /studio\/designers\/([^/]+)/;
