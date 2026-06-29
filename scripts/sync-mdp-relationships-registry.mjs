#!/usr/bin/env node
/**
 * Sync MDP Relationship Dictionary export (MDP-3).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exportPath = path.join(repoRoot, "config/mdp-relationships.export.json");

const run = async () => {
  if (process.env.DATABASE_URL) {
    const result = spawnSync("node", ["scripts/validateMdpRelationshipsApi.js"], {
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
    if (!payload.physicalCount || payload.physicalCount < 3) {
      throw new Error("Export inválido — physicalCount < 3.");
    }
    console.log(`[sync-mdp-relationships] DATABASE_URL ausente — export válido: ${exportPath}`);
  } catch (error) {
    console.error("[sync-mdp-relationships] FATAL:", error.message);
    process.exit(1);
  }
};

run().catch((error) => {
  console.error("[sync-mdp-relationships] FATAL:", error.message);
  process.exit(1);
});
