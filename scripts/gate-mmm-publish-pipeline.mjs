#!/usr/bin/env node
/**
 * Gate G422 — MMM Publish Pipeline C-1→C-16 (Program 4.04)
 */
import fs from "node:fs";
import path from "node:path";
import { PUBLISH_PHASES, MMM_CRB_VERSION, signIntegrityHash, verifySignature } from "../backend/src/modules/mmm/publish/mmmPublishConstants.js";
import { normalizePublishGraph } from "../backend/src/modules/mmm/publish/mmmPublishNormalize.js";
import { compileRegistries, assembleCrb } from "../backend/src/modules/mmm/publish/mmmPublishCompile.js";

const ROOT = process.cwd();
const PUBLISH_DIR = path.join(ROOT, "backend/src/modules/mmm/publish");

const results = [];
const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const requiredFiles = [
  "mmmPublishConstants.js",
  "mmmPublishRepository.js",
  "mmmPublishCollect.js",
  "mmmPublishValidate.js",
  "mmmPublishNormalize.js",
  "mmmPublishCompile.js",
  "mmmPublishCache.js",
  "mmmPublishPipeline.js",
  "mmmPublishService.js",
];

try {
  for (const file of requiredFiles) {
    gate(`G422-file-${file}`, fs.existsSync(path.join(PUBLISH_DIR, file)));
  }

  gate("G422-phases-count", PUBLISH_PHASES.length === 16, `phases=${PUBLISH_PHASES.length}`);
  gate("G422-crb-version", MMM_CRB_VERSION === "mmm-crb-v1");

  const migration = path.join(ROOT, "backend/prisma/migrations/20260630140000_mmm_publish_engine/migration.sql");
  gate("G422-migration", fs.existsSync(migration));

  const sampleRows = [
    {
      object_id: "550e8400-e29b-41d4-a716-446655440001",
      object_type: "field",
      tenant_id: "tenant-a",
      envelope_version: "mmm-envelope-v1",
      scope: { moduleId: "empresas" },
      status: "approved",
      payload: { code: "nome", dataType: "string" },
      lineage: { source: "system" },
      dependencies: null,
      labels: [{ locale: "pt-BR", label: "Nome" }],
      revision: 1,
      content_hash: "abc",
      module_id: "empresas",
      created_at: new Date(),
      updated_at: new Date(),
      created_by: null,
      updated_by: null,
    },
  ];

  const normalized = normalizePublishGraph(sampleRows);
  gate("G422-normalize", normalized.objectCount === 1);

  const { registries, routes, menu } = compileRegistries(normalized.envelopes);
  gate("G422-compile-registries", Boolean(registries.field?.empresas?.length));

  const integrityHash = "sample-integrity-hash";
  const signatureRef = signIntegrityHash(integrityHash);
  gate("G422-sign", signatureRef.startsWith("mmm-sig-v1:"));
  gate("G422-verify-signature", verifySignature(integrityHash, signatureRef));

  const crb = assembleCrb({
    tenantId: "tenant-a",
    moduleId: "empresas",
    baseTemplateId: "modelobase1",
    definitionVersionId: "dv-test",
    semver: "1.0.0",
    revision: 1,
    normalized,
    registries,
    routes,
    menu,
    contentHash: "content-hash",
    integrityHash,
    signatureRef,
    compiledBy: "gate",
  });
  gate("G422-assemble-crb", crb.crbVersion === "mmm-crb-v1" && crb.objects.length === 1);

  const routesFile = fs.readFileSync(path.join(ROOT, "backend/src/modules/mmm/routes.js"), "utf8");
  gate("G422-route-publish", routesFile.includes("/api/mmm/v1/publish"));
  gate("G422-route-rollback", routesFile.includes("/api/mmm/v1/publish/rollback"));

  const failed = results.filter((item) => !item.ok);
  if (failed.length) {
    console.error(`\nG422 FAILED (${failed.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`\nG422 PASSED (${results.length}/${results.length})`);
} catch (error) {
  console.error("G422 gate error:", error.message);
  process.exit(1);
}
