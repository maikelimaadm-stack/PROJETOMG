#!/usr/bin/env node
/**
 * Smoke test — MAK Studio SDK & Registry Foundation (Program 2.0.5)
 */
import { createStudioSdk } from "../src/studio/sdk/createStudioSdk.js";
import { validateStudioDesigner } from "../src/studio/sdk/studioDesignerContract.js";
import { bootstrapStudioRegistries, getStudioRegistrySnapshot } from "../src/studio/registry/bootstrapStudioRegistries.js";
import { getStudioComponent, listStudioComponents } from "../src/studio/registry/componentRegistry.js";
import { getStudioProperty, listStudioProperties } from "../src/studio/registry/propertyRegistry.js";
import { getStudioEvent } from "../src/studio/registry/eventRegistry.js";
import { getStudioAction } from "../src/studio/registry/actionRegistry.js";
import { designerHasCapability } from "../src/studio/registry/capabilityRegistry.js";

const run = () => {
  const snapshot = bootstrapStudioRegistries();
  if (!snapshot.bootstrapped) throw new Error("Registries failed to bootstrap.");

  const sdk = createStudioSdk();
  const apis = [
    "workspace",
    "dock",
    "explorer",
    "inspector",
    "history",
    "preview",
    "publish",
    "command",
    "selection",
    "clipboard",
    "dragDrop",
    "plugin",
  ];
  apis.forEach((key) => {
    if (!sdk[key]) throw new Error(`Studio SDK missing API: ${key}`);
  });

  const layoutComponent = getStudioComponent("mak.panel.container");
  if (!layoutComponent?.runtime?.preview) {
    throw new Error("Component registry missing preview metadata.");
  }

  if (!getStudioProperty("label")?.valueType) {
    throw new Error("Property registry missing label.");
  }
  if (!getStudioEvent("onPublish")) throw new Error("Event registry missing onPublish.");
  if (!getStudioAction("compile")) throw new Error("Action registry missing compile.");
  if (!designerHasCapability("layout", "dragDrop")) {
    throw new Error("Capability registry missing layout.dragDrop.");
  }

  const designerValidation = validateStudioDesigner({
    designerId: "layout",
    label: "Layout Studio",
    supportedEntryTypes: ["layout", "section", "panel"],
    supportedBaseTemplates: ["modelobase1"],
  });
  if (!designerValidation.valid) {
    throw new Error(`Designer contract validation failed: ${designerValidation.errors.join(" ")}`);
  }

  const layoutComponents = listStudioComponents({ category: "layout" });
  if (layoutComponents.length < 2) {
    throw new Error("Expected at least 2 layout category components.");
  }

  if (listStudioProperties({ group: "display" }).length < 3) {
    throw new Error("Expected display property group entries.");
  }

  console.log(
    `[smoke-studio-sdk] OK — SDK v${sdk.version}, registries:`,
    JSON.stringify(getStudioRegistrySnapshot().counts)
  );
};

try {
  run();
} catch (error) {
  console.error("[smoke-studio-sdk] FATAL:", error.message);
  process.exit(1);
}
