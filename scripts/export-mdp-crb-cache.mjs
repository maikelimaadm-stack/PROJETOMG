#!/usr/bin/env node
/**
 * Generates config/mdp-compiled-bundle.cache.json for Runtime Bridge offline boot.
 * Uses MDP-4 empresas seed registry entries when DATABASE_URL is unavailable.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { CRB_VERSION } from "../backend/src/modules/mdp/mdpPublishConstants.js";
import { EMPRESAS_REGISTRY_SEED } from "../backend/src/modules/mdp/mdpRegistryConstants.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cachePath = path.join(repoRoot, "config/mdp-compiled-bundle.cache.json");

const hashPayload = (payload) =>
  createHash("sha256").update(JSON.stringify(payload)).digest("hex");

const serializeRegistryEntry = (row) => ({
  entryId: row.entry_id,
  entryType: row.entry_type,
  moduleId: row.module_id,
  entityId: row.entity_id ?? null,
  status: row.status,
  enabled: row.enabled ?? true,
  baseTemplateId: row.base_template_id ?? "modelobase1",
  contentHash: hashPayload(row.payload ?? {}),
  payload: row.payload ?? {},
  bindings: (row.bindings ?? []).map((b) => ({
    bindingKind: b.binding_kind,
    targetId: b.target_id,
  })),
  labels: row.label ? [{ locale: "pt-BR", label: row.label }] : [],
});

const buildOfflineCrbPayload = () => {
  const publishedRegistry = EMPRESAS_REGISTRY_SEED.filter(
    (entry) => entry.status === "published" && entry.enabled !== false
  ).map(serializeRegistryEntry);

  const payload = {
    crbVersion: CRB_VERSION,
    moduleId: "empresas",
    baseTemplateId: "modelobase1",
    versionId: "mdp-platform-v1",
    semver: "1.0.0",
    revision: 1,
    status: "published",
    compiledAt: new Date().toISOString(),
    locale: "pt-BR",
    entities: [
      {
        entityId: "EmpresaCadastro",
        moduleId: "empresas",
        entityKind: "business",
        baseTemplateId: "modelobase1",
        lifecycle: "active",
      },
    ],
    fields: [],
    relationships: [],
    registry: publishedRegistry,
    dependencyGraph: { nodes: [], edges: [] },
    versionGraph: {
      versionId: "mdp-platform-v1",
      semver: "1.0.0",
      revision: 1,
      status: "published",
      parentVersionId: null,
      parent: null,
    },
    meta: {
      entityCount: 1,
      fieldCount: 0,
      relationshipCount: 0,
      registryCount: publishedRegistry.length,
      signatureReady: true,
    },
  };

  return payload;
};

const run = async () => {
  const payload = buildOfflineCrbPayload();
  const integrityHash = hashPayload(payload);

  const envelope = {
    version: "runtime-bridge-cache-v1",
    exportedAt: new Date().toISOString(),
    moduleId: "empresas",
    baseTemplateId: "modelobase1",
    versionId: payload.versionId,
    integrityHash,
    crbVersion: CRB_VERSION,
    source: "boot-cache",
    payload: {
      ...payload,
      integrityHash,
    },
  };

  await fs.writeFile(cachePath, `${JSON.stringify(envelope, null, 2)}\n`, "utf8");
  console.log(`[export-mdp-crb-cache] OK — ${cachePath} (${envelope.payload.registry.length} registry entries)`);
};

run().catch((error) => {
  console.error("[export-mdp-crb-cache] FATAL:", error.message);
  process.exit(1);
});
