#!/usr/bin/env node
/**
 * Smoke test — MAK Studio Architecture Governance (Program 2.0.8)
 */
import {
  validateStudioArchitecture,
  checkDesignerIsolation,
  checkRegistryProtection,
  DEPENDENCY_STACK,
} from "../src/studio/governance/index.js";
import { validateFileDependencies } from "../src/studio/governance/dependencyGraph.js";

const run = () => {
  const result = validateStudioArchitecture(process.cwd());
  if (!result.valid) {
    throw new Error(`Architecture violations: ${JSON.stringify(result.violations.slice(0, 5))}`);
  }
  if (result.filesScanned < 50) {
    throw new Error(`Expected 50+ studio files scanned, got ${result.filesScanned}`);
  }

  if (DEPENDENCY_STACK.length < 7) {
    throw new Error("Dependency stack under-defined.");
  }

  const fakeDesignerViolation = validateFileDependencies(
    "src/studio/designers/layout/LayoutDesigner.js",
    `import { foo } from "../workflow/WorkflowDesigner.js";
     import { registerMak } from "src/framework/mak/register.js";`
  );
  if (fakeDesignerViolation.length < 2) {
    throw new Error("Dependency validator should detect cross-designer and foundation imports.");
  }

  const registryOk = checkRegistryProtection(process.cwd());
  if (registryOk.length > 0) {
    throw new Error(`Registry protection failed: ${registryOk[0].message}`);
  }

  const isolationOk = checkDesignerIsolation([]);
  if (isolationOk.length > 0) {
    throw new Error("Empty consumer scan should pass.");
  }

  console.log("[smoke-studio-governance] OK —", result.filesScanned, "files scanned, 0 violations");
};

try {
  run();
} catch (error) {
  console.error("[smoke-studio-governance] FATAL:", error.message);
  process.exit(1);
}
