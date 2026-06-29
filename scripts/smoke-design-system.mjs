#!/usr/bin/env node
/**
 * Smoke test — MAK Design System Foundation (Program 2.0.6)
 */
import { bootstrapStudioRegistries } from "../src/studio/registry/bootstrapStudioRegistries.js";
import { bootstrapDesignSystem, getDesignSystemSnapshot } from "../src/studio/designSystem/bootstrapDesignSystem.js";
import { getDesignToken, resolveTokenValue } from "../src/studio/designSystem/registry/tokenRegistry.js";
import { getDesignTheme } from "../src/studio/designSystem/registry/themeRegistry.js";
import { getDesignMotion } from "../src/studio/designSystem/registry/motionRegistry.js";
import { getAccessibilityProfile } from "../src/studio/designSystem/registry/accessibilityRegistry.js";
import {
  getComponentManifest,
  getUniversalComponent,
  validateManifestIntegrity,
} from "../src/studio/designSystem/registry/manifestRegistry.js";
import { validateUniversalComponent } from "../src/studio/designSystem/contracts/universalComponentModel.js";

const run = () => {
  bootstrapStudioRegistries();
  const snapshot = bootstrapDesignSystem();

  if (!snapshot.bootstrapped) throw new Error("Design System failed to bootstrap.");
  if (snapshot.counts.tokens < 10) throw new Error("Token registry under-populated.");
  if (snapshot.counts.themes < 7) throw new Error("Theme registry under-populated.");
  if (snapshot.counts.motions < 5) throw new Error("Motion registry under-populated.");
  if (snapshot.counts.manifests < 1) throw new Error("Manifest integration failed.");

  const token = getDesignToken("color.primary");
  if (!token || token.category !== "colors") throw new Error("Token registry invalid.");
  if (!resolveTokenValue("color.primary", "light")) throw new Error("Token resolution failed.");

  if (!getDesignTheme("light")?.status) throw new Error("Theme registry invalid.");
  if (!getDesignMotion("fade")?.durationMs) throw new Error("Motion registry invalid.");
  if (!getAccessibilityProfile("keyboard.navigation")) throw new Error("A11y registry invalid.");

  const manifest = getComponentManifest("mak.panel.container");
  const manifestValidation = validateManifestIntegrity(manifest);
  if (!manifestValidation.valid) {
    throw new Error(`Manifest invalid: ${manifestValidation.errors.join(" ")}`);
  }
  if (!manifest?.ai?.description) throw new Error("AI component knowledge missing.");

  const universal = getUniversalComponent("mak.panel.container");
  const modelValidation = validateUniversalComponent(universal);
  if (!modelValidation.valid) {
    throw new Error(`Universal model invalid: ${modelValidation.errors.join(" ")}`);
  }
  if (universal.platform !== "mak") throw new Error("Universal model must be platform mak.");
  if (!universal.renderers.react && !universal.renderers.preview) {
    throw new Error("Universal model requires renderer bindings.");
  }

  console.log("[smoke-design-system] OK —", JSON.stringify(getDesignSystemSnapshot().counts));
};

try {
  run();
} catch (error) {
  console.error("[smoke-design-system] FATAL:", error.message);
  process.exit(1);
}
