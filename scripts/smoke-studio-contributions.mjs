#!/usr/bin/env node
/** Smoke test — Studio Contribution Engine (Program 2.1A.7) */
import {
  getContributionManager,
  getRegistryManager,
  validateMakPackageManifest,
} from "../src/studio/contributions/index.js";

const cm = getContributionManager();
const rm = getRegistryManager();

const explorerId = cm.registerExplorerContribution("smoke-designer", {
  contributionId: "smoke:explorer:1",
  label: "Smoke Explorer",
});

cm.enable(explorerId);
cm.disable(explorerId);

const manifest = validateMakPackageManifest({
  packageId: "smoke.pkg",
  version: "1.0.0",
  contributions: [{ type: "command", contribution: { contributionId: "cmd-1", label: "Smoke" } }],
});
if (!manifest.valid) throw new Error("Manifest validation failed");

const ids = cm.registerPackageContributions({
  packageId: "smoke.pkg",
  version: "1.0.0",
  contributions: [{ type: "command", contribution: { contributionId: "pkg-cmd-1", label: "Pkg Cmd" } }],
});
if (!ids.length) throw new Error("Package contributions failed");

if (!rm.listOfficialRegistryIds().includes("components")) {
  throw new Error("Registry manager missing components registry");
}

console.log("[smoke-studio-contributions] OK");
