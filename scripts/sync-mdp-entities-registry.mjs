#!/usr/bin/env node
/**
 * Sync cadastro-modules.registry.json from MDP Entity Dictionary export.
 * Requires DATABASE_URL for live export; otherwise validates config/mdp-entities.export.json exists.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exportPath = path.join(repoRoot, "config/mdp-entities.export.json");

const run = async () => {
  if (process.env.DATABASE_URL) {
    const result = spawnSync("node", ["scripts/exportMdpEntitiesRegistry.js"], {
      cwd: path.join(repoRoot, "backend"),
      stdio: "inherit",
      env: process.env,
    });
    if (result.status !== 0) process.exit(result.status ?? 1);
    return;
  }

  try {
    await fs.access(exportPath);
    console.log(`[sync-mdp-registry] DATABASE_URL ausente — usando export existente: ${exportPath}`);
  } catch {
    console.error("[sync-mdp-registry] Export ausente e DATABASE_URL não configurada.");
    process.exit(1);
  }
};

run().catch((error) => {
  console.error("[sync-mdp-registry] FATAL:", error.message);
  process.exit(1);
});
