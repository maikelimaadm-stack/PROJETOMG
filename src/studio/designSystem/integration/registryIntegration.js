import { MANIFEST_SCHEMA_VERSION } from "../designSystemConstants.js";
import { getStudioComponent, listStudioComponents } from "../../registry/componentRegistry.js";
import { getStudioProperty } from "../../registry/propertyRegistry.js";
import { getStudioEvent } from "../../registry/eventRegistry.js";
import { getStudioAction } from "../../registry/actionRegistry.js";
import { getStudioCapabilities } from "../../registry/capabilityRegistry.js";
import { buildAiComponentKnowledge } from "../contracts/aiComponentKnowledge.js";
import { registerUniversalComponent } from "../registry/manifestRegistry.js";

/**
 * Builds Component Manifest from existing Studio registries (non-breaking integration).
 * @param {string} componentId
 * @param {object} [overrides]
 */
export function buildComponentManifestFromRegistries(componentId, overrides = {}) {
  const component = getStudioComponent(componentId);
  if (!component) {
    throw new Error(`buildComponentManifestFromRegistries: unknown component ${componentId}`);
  }

  const properties = (component.properties ?? [])
    .map((id) => getStudioProperty(id))
    .filter(Boolean)
    .map((p) => p.propertyId);

  const events = (component.events ?? [])
    .map((id) => getStudioEvent(id))
    .filter(Boolean)
    .map((e) => e.eventId);

  const actions = (component.actions ?? [])
    .map((id) => getStudioAction(id))
    .filter(Boolean)
    .map((a) => a.actionId);

  const capabilities = overrides.capabilities ?? component.compatibility?.engines ?? [];

  return {
    componentId,
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    properties,
    events,
    actions,
    tokens: overrides.tokens ?? ["color.primary", "spacing.md", "radius.md"],
    themes: overrides.themes ?? ["light", "dark"],
    permissions: overrides.permissions ?? [],
    runtime: component.runtime ?? {},
    preview: {
      engine: component.runtime?.preview ?? null,
      componentId,
    },
    marketplace: overrides.marketplace ?? { exportable: true, packageable: true },
    documentation: overrides.documentation ?? { label: component.label, description: component.description },
    examples: overrides.examples ?? [],
    limitations: overrides.limitations ?? [],
    dependencies: overrides.dependencies ?? [],
    capabilities,
    accessibility: overrides.accessibility ?? ["keyboard.navigation", "focus.visible", "contrast.wcag-aa"],
    ai: buildAiComponentKnowledge({
      description: component.description ?? component.label,
      examples: overrides.aiExamples ?? [],
      limitations: overrides.aiLimitations ?? [],
      bestPractices: overrides.aiBestPractices ?? [`Use ${componentId} via Component Registry — never hardcode.`],
      suggestions: overrides.aiSuggestions ?? [],
      contextHints: overrides.aiContextHints ?? [`category:${component.category}`],
    }),
  };
}

/**
 * Builds Universal Component Model from Studio component + manifest.
 * @param {string} componentId
 * @param {object} [overrides]
 */
export function buildUniversalComponentFromRegistries(componentId, overrides = {}) {
  const component = getStudioComponent(componentId);
  if (!component) {
    throw new Error(`buildUniversalComponentFromRegistries: unknown component ${componentId}`);
  }

  const manifest = buildComponentManifestFromRegistries(componentId, overrides);
  const runtime = component.runtime ?? {};

  return {
    componentId,
    platform: "mak",
    manifest,
    renderers: Object.freeze({
      react: runtime.render ? { component: runtime.render, engine: runtime.engine } : null,
      preview: runtime.preview ? { component: runtime.preview, engine: runtime.engine } : null,
      desktop: overrides.renderers?.desktop ?? null,
      mobile: overrides.renderers?.mobile ?? null,
      pwa: overrides.renderers?.pwa ?? null,
      pdf: overrides.renderers?.pdf ?? null,
      marketplace: overrides.renderers?.marketplace ?? { componentId },
    }),
  };
}

/**
 * Integrates Design System manifests with Studio registries for all registered components.
 * @param {object} [options]
 * @param {string[]} [options.componentIds]
 */
export function integrateDesignSystemWithStudioRegistries(options = {}) {
  const components = options.componentIds
    ? options.componentIds.map((id) => getStudioComponent(id)).filter(Boolean)
    : listStudioComponents();

  const integrated = [];
  for (const component of components) {
    const model = buildUniversalComponentFromRegistries(component.componentId, options.overrides?.[component.componentId]);
    registerUniversalComponent(model);
    integrated.push(component.componentId);
  }

  return Object.freeze({
    integratedCount: integrated.length,
    componentIds: integrated,
  });
}

/** Resolves designer capabilities from Capability Registry (read-only bridge). */
export function resolveDesignerCapabilities(designerId) {
  return getStudioCapabilities(designerId)?.capabilityIds ?? [];
}

export default integrateDesignSystemWithStudioRegistries;
