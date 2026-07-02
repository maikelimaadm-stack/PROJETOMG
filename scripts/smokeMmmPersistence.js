#!/usr/bin/env node
/**
 * Smoke test — MMM persistence API (Program 4.03)
 * Requires DATABASE_URL and seeded bootstrap user.
 */
import { getMmmSchemaRegistry, getManifestSummary } from "../backend/src/modules/mmm/mmmSchemaRegistry.js";
import { validateMmmEnvelope } from "../backend/src/modules/mmm/mmmValidator.js";

const sampleEnvelope = {
  envelopeVersion: "mmm-envelope-v1",
  objectId: "550e8400-e29b-41d4-a716-446655440099",
  objectType: "field",
  tenantId: "smoke-tenant",
  scope: { moduleId: "empresas" },
  status: "draft",
  labels: [{ locale: "pt-BR", label: "Campo smoke" }],
  lineage: { source: "system" },
  payload: { code: "smoke_field", dataType: "string" },
  revision: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const run = async () => {
  console.log("MMM persistence smoke — schema registry");
  const registry = await getMmmSchemaRegistry();
  console.log(`✓ Registry loaded (${registry.payloadValidators.size} payload validators)`);

  const summary = await getManifestSummary();
  console.log(`✓ Manifest summary platformSchemaCount=${summary.platformSchemaCount}`);

  await validateMmmEnvelope({ envelope: sampleEnvelope, registry, mode: "create", tenantId: "smoke-tenant" });
  console.log("✓ Sample envelope validation passed");

  try {
    await validateMmmEnvelope({
      envelope: { ...sampleEnvelope, objectType: "record" },
      registry,
      mode: "create",
    });
    console.error("✗ record type should be rejected");
    process.exit(1);
  } catch (error) {
    console.log(`✓ record type rejected (${error.code})`);
  }

  console.log("\nMMM persistence smoke PASSED");
};

run().catch((error) => {
  console.error("MMM persistence smoke FAILED:", error);
  process.exit(1);
});
