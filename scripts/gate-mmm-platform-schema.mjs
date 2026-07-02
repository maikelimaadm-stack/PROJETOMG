#!/usr/bin/env node
/**
 * Gate G421 — MMM PlatformSchema Coverage (Program 4.03)
 * Validates 226 PlatformSchemas, envelope, manifest completeness.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SPEC_ROOT = path.join(ROOT, "docs/meta-model/spec");
const MANIFEST_PATH = path.join(SPEC_ROOT, "object-type-manifest.json");
const ENVELOPE_PATH = path.join(SPEC_ROOT, "mmm-envelope-v1.schema.json");
const OPENAPI_PATH = path.join(SPEC_ROOT, "mmm-api-v1.openapi.yaml");
const DEFINITIONS_PATH = path.join(SPEC_ROOT, "schemas/_definitions.schema.json");
const TYPES_DIR = path.join(SPEC_ROOT, "schemas/types");

const results = [];
const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

try {
  gate("G421-spec-root", fs.existsSync(SPEC_ROOT), SPEC_ROOT);

  const manifest = readJson(MANIFEST_PATH);
  gate("G421-manifest-present", Boolean(manifest.manifestVersion));
  gate("G421-platform-schema-count", manifest.platformSchemaCount === 226, `count=${manifest.platformSchemaCount}`);
  gate("G421-taxonomy-count", manifest.taxonomyCount === 227, `count=${manifest.taxonomyCount}`);

  const platformTypes = manifest.objectTypes.filter((entry) => entry.platformSchema);
  gate("G421-platform-types-listed", platformTypes.length === 226, `listed=${platformTypes.length}`);

  const typeIds = platformTypes.map((entry) => entry.objectType);
  const uniqueTypeIds = new Set(typeIds);
  gate("G421-no-duplicate-objectType", uniqueTypeIds.size === typeIds.length);

  const excluded = manifest.excludedFromPlatformSchema?.map((entry) => entry.objectType) || [];
  gate("G421-record-excluded", excluded.includes("record"));

  const schemaFiles = fs.readdirSync(TYPES_DIR).filter((name) => name.endsWith(".schema.json"));
  gate("G421-type-schema-files", schemaFiles.length === 226, `files=${schemaFiles.length}`);

  let invalidJson = 0;
  let missingManifestPath = 0;
  for (const entry of platformTypes) {
    const schemaPath = path.join(SPEC_ROOT, entry.schemaPath);
    if (!fs.existsSync(schemaPath)) {
      missingManifestPath += 1;
      continue;
    }
    try {
      const schema = readJson(schemaPath);
      if (!schema.$schema?.includes("2020-12")) invalidJson += 1;
    } catch {
      invalidJson += 1;
    }
  }
  gate("G421-manifest-schema-paths", missingManifestPath === 0, `missing=${missingManifestPath}`);
  gate("G421-schema-json-valid", invalidJson === 0, `invalid=${invalidJson}`);

  const envelope = readJson(ENVELOPE_PATH);
  gate("G421-envelope-present", envelope.properties?.envelopeVersion?.const === "mmm-envelope-v1");

  const definitions = readJson(DEFINITIONS_PATH);
  const objectTypeEnum = definitions.$defs?.ObjectTypeEnum?.enum || [];
  gate("G421-definitions-objectType-enum", objectTypeEnum.length >= 226, `enum=${objectTypeEnum.length}`);
  gate("G421-definitions-includes-record", objectTypeEnum.includes("record"));

  gate("G421-openapi-present", fs.existsSync(OPENAPI_PATH));

  const backendModule = path.join(ROOT, "backend/src/modules/mmm/mmmSchemaRegistry.js");
  gate("G421-persistence-registry", fs.existsSync(backendModule));

  const migration = path.join(ROOT, "backend/prisma/migrations/20260630120000_mmm_persistence/migration.sql");
  gate("G421-persistence-migration", fs.existsSync(migration));

  const failed = results.filter((item) => !item.ok);
  if (failed.length > 0) {
    console.error(`\nG421 FAILED (${failed.length}/${results.length})`);
    process.exit(1);
  }

  console.log(`\nG421 PASSED (${results.length}/${results.length})`);
} catch (error) {
  console.error("G421 gate error:", error.message);
  process.exit(1);
}
