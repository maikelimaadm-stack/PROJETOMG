#!/usr/bin/env node
/**
 * Gates G146–G154 — Foundation Completion (Enterprise V12).
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const MAK = path.join(ROOT, "src/framework/mak");
const MB1 = path.join(ROOT, "src/ModeloBase1");

const results = [];
const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const read = (filePath) => fs.readFileSync(filePath, "utf8");
const exists = (filePath) => fs.existsSync(filePath);

const countEmptyExportStubs = (dir) => {
  let count = 0;
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/index\.js$/.test(entry.name)) {
        const content = read(full).trim();
        if (/^export\s*\{\s*\}\s*;?\s*$/.test(content) || content.includes("placeholder documentado")) {
          count += 1;
        }
      }
    }
  };
  walk(dir);
  return count;
};

gate("G146 — Import Engine foundation exists", exists(path.join(MAK, "import/createMakImportEngine.js")));
gate("G147 — History Engine foundation exists", exists(path.join(MAK, "history/createMakHistoryEngine.js")));
gate(
  "G148 — Import noop backend adapter",
  read(path.join(MAK, "import/createMakImportBackendAdapter.js")).includes("isAvailable")
);
gate(
  "G149 — History noop backend adapter",
  read(path.join(MAK, "history/createMakHistoryBackendAdapter.js")).includes("isAvailable")
);

const importIndex = read(path.join(MB1, "import/index.js"));
gate(
  "G150 — ModeloBase1/import re-exporta foundation",
  importIndex.includes("framework/mak/import") && !importIndex.includes("export {}")
);

const masterHistory = read(path.join(MAK, "ux/MakMasterHistory.jsx"));
gate(
  "G151 — MakMasterHistory usa History Engine",
  masterHistory.includes("useMakHistoryData") && !masterHistory.includes("em desenvolvimento")
);

gate(
  "G152 — Grouping engine certificada (disabled contract)",
  read(path.join(MAK, "grouping/createMakGroupingEngine.js")).includes("DISABLED")
);

gate(
  "G153 — Foundation engines registradas",
  exists(path.join(ROOT, "src/modules/makBootstrap/registerMakFoundationEngines.js"))
);

const emptyStubs = countEmptyExportStubs(MB1);
gate("G154 — Sem export {} stubs no ModeloBase1", emptyStubs === 0, emptyStubs ? `${emptyStubs} arquivos` : "");

gate(
  "G155 — Build produção",
  (() => {
    try {
      execSync("npm run build", { cwd: ROOT, stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  })()
);

const passed = results.filter((r) => r.ok).length;
console.log(`\nG146-G155: ${passed}/${results.length} aprovados`);
process.exit(passed === results.length ? 0 : 1);
