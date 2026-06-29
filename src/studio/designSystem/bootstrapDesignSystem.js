import { DESIGN_SYSTEM_VERSION } from "./designSystemConstants.js";
import { registerDesignToken } from "./registry/tokenRegistry.js";
import { registerDesignTheme } from "./registry/themeRegistry.js";
import { registerDesignMotion } from "./registry/motionRegistry.js";
import { registerAccessibilityProfile } from "./registry/accessibilityRegistry.js";
import { getComponentManifestCount } from "./registry/manifestRegistry.js";
import { DESIGN_TOKEN_CATALOG } from "./catalogs/designTokens.catalog.js";
import { DESIGN_THEME_CATALOG } from "./catalogs/designThemes.catalog.js";
import { DESIGN_MOTION_CATALOG } from "./catalogs/designMotions.catalog.js";
import { DESIGN_ACCESSIBILITY_CATALOG } from "./catalogs/designAccessibility.catalog.js";
import { integrateDesignSystemWithStudioRegistries } from "./integration/registryIntegration.js";

let bootstrapped = false;

/**
 * Idempotent bootstrap — requires Studio registries bootstrapped first.
 * @param {object} [options]
 * @param {boolean} [options.integrateManifests=true]
 */
export function bootstrapDesignSystem(options = {}) {
  if (bootstrapped) {
    return getDesignSystemSnapshot();
  }

  DESIGN_TOKEN_CATALOG.forEach((def) => registerDesignToken(def.tokenId, def));
  DESIGN_THEME_CATALOG.forEach((def) => registerDesignTheme(def.themeId, def));
  DESIGN_MOTION_CATALOG.forEach((def) => registerDesignMotion(def.motionId, def));
  DESIGN_ACCESSIBILITY_CATALOG.forEach((def) => registerAccessibilityProfile(def.a11yId, def));

  let integration = { integratedCount: 0, componentIds: [] };
  if (options.integrateManifests !== false) {
    integration = integrateDesignSystemWithStudioRegistries(options.integration);
  }

  bootstrapped = true;
  return getDesignSystemSnapshot(integration);
}

export function isDesignSystemBootstrapped() {
  return bootstrapped;
}

export function getDesignSystemSnapshot(integration = null) {
  return Object.freeze({
    version: DESIGN_SYSTEM_VERSION,
    bootstrapped,
    counts: {
      tokens: DESIGN_TOKEN_CATALOG.length,
      themes: DESIGN_THEME_CATALOG.length,
      motions: DESIGN_MOTION_CATALOG.length,
      accessibility: DESIGN_ACCESSIBILITY_CATALOG.length,
      manifests: getComponentManifestCount(),
    },
    integration: integration ?? null,
  });
}

export default bootstrapDesignSystem;
