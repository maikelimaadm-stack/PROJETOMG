#!/usr/bin/env node
/**
 * Sync MDP Compiled Runtime Bundle export (MDP-5).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exportPath = path.join(repoRoot, "config/mdp-compiled-bundle.export.json");

const run = async () => {
  if (process.env.DATABASE_URL) {
    const result = spawnSync("node", ["scripts/validateMdpPublishApi.js"], {
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
    if (!payload.bundleCount || payload.bundleCount < 1) {
      throw new Error("Export inválido — bundleCount < 1.");
    }
    if (!payload.hasDependencyGraph) {
      throw new Error("Export inválido — missing dependencyGraph flag.");
    }
    console.log(`[sync-mdp-compiled-bundle] DATABASE_URL ausente — export válido: ${exportPath}`);
  } catch (error) {
    console.error("[sync-mdp-compiled-bundle] FATAL:", error.message);
    process.exit(1);
  }
};

run().catch((error) => {
  console.error("[sync-mdp-compiled-bundle] FATAL:", error.message);
  process.exit(1);
});
