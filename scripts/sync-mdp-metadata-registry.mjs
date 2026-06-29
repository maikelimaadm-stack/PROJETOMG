#!/usr/bin/env node
/**
 * Sync MDP Metadata Registry export (MDP-4).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exportPath = path.join(repoRoot, "config/mdp-metadata-registry.export.json");

const run = async () => {
  if (process.env.DATABASE_URL) {
    const result = spawnSync("node", ["scripts/validateMdpMetadataRegistryApi.js"], {
      cwd: path.join(repoRoot, "backend"),
      stdio: "inherit",
      env: process.env,
    });
    if (result.status !== 0) process.exit(result.status ?? 1);
    return;
  }

  try {
    await fs.access(exportPath);
    const raw = await fs.readFile(exportPath, "utf8");
    const payload = JSON.parse(raw);
    if (!payload.empresasLayoutCount || payload.empresasLayoutCount < 1) {
      throw new Error("Export inválido — empresasLayoutCount < 1.");
    }
    if (!payload.empresasFieldConfigCount || payload.empresasFieldConfigCount < 1) {
      throw new Error("Export inválido — empresasFieldConfigCount < 1.");
    }
    if (!payload.empresasValidationCount || payload.empresasValidationCount < 1) {
      throw new Error("Export inválido — empresasValidationCount < 1.");
    }
    console.log(`[sync-mdp-metadata-registry] DATABASE_URL ausente — export válido: ${exportPath}`);
  } catch (error) {
    console.error("[sync-mdp-metadata-registry] FATAL:", error.message);
    process.exit(1);
  }
};

run().catch((error) => {
  console.error("[sync-mdp-metadata-registry] FATAL:", error.message);
  process.exit(1);
});
