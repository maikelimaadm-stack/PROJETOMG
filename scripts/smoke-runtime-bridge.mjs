#!/usr/bin/env node
/**
 * G143 smoke — Runtime Bridge CRB hydration for empresas pilot.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCrbHydrationPlan } from "../src/modules/makBootstrap/runtimeBridge/crbHydrationAdapter.js";
import { validateRuntimeBridgeCacheEnvelope } from "../src/modules/makBootstrap/runtimeBridge/runtimeValidation.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cachePath = path.join(repoRoot, "config/mdp-compiled-bundle.cache.json");

const run = () => {
  if (!fs.existsSync(cachePath)) {
    throw new Error("config/mdp-compiled-bundle.cache.json ausente.");
  }

  const envelope = JSON.parse(fs.readFileSync(cachePath, "utf8"));
  const validation = validateRuntimeBridgeCacheEnvelope(envelope);
  if (!validation.valid) {
    throw new Error(`Cache envelope inválido: ${validation.errors.join(" ")}`);
  }

  const plan = buildCrbHydrationPlan(envelope.payload, {
    fieldDefinitions: [{ id: "razao_social" }, { id: "tipo_pessoa" }],
    nativeRequiredFieldNames: ["razao_social", "tipo_pessoa"],
  });

  if (!plan.layout.entryId) throw new Error("Hydration plan sem layout entry.");
  if (!plan.field.entryId) throw new Error("Hydration plan sem field_config entry.");
  if (!plan.validation.entryId) throw new Error("Hydration plan sem validation entry.");
  if (plan.validation.nativeRequiredFieldNames.length < 1) {
    throw new Error("Hydration plan sem nativeRequiredFieldNames.");
  }

  console.log(
    `[smoke-runtime-bridge] OK — empresas CRB hydration (${plan.registryEntryIds.length} engine entries)`
  );
};

try {
  run();
} catch (error) {
  console.error("[smoke-runtime-bridge] FATAL:", error.message);
  process.exit(1);
}
