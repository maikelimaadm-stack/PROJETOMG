#!/usr/bin/env node
/**
 * Gates G186–G195 — ModeloBase1 Final Consolidation V15.1.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const MB1 = path.join(ROOT, "src/ModeloBase1");
const EMP = path.join(ROOT, "src/modules/empresas");

const results = [];
const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const read = (filePath) => fs.readFileSync(filePath, "utf8");
const exists = (filePath) => fs.existsSync(filePath);

gate(
  "G186 — Único motor estrutural ModeloBase1CadastroPage",
  read(path.join(EMP, "pages/PAGEMP.jsx")).includes("ModeloBase1CadastroPage") &&
    !exists(path.join(ROOT, "src/ModeloBase"))
);

gate(
  "G187 — Sem layout shim empresas/layout (39 re-exports removidos)",
  !exists(path.join(EMP, "layout"))
);

gate(
  "G188 — Config modeloBase1 sem barrel órfão",
  !exists(path.join(EMP, "config/modeloBase1/index.js")) &&
    exists(path.join(EMP, "config/modeloBase1/empresasModeloBase1Config.js"))
);

gate(
  "G189 — Empresas wiring toolbar via factory",
  read(path.join(EMP, "config/modeloBase1/empresasModeloBase1Config.js")).includes(
    "components: empresasToolbarComponents"
  )
);

gate(
  "G190 — Sem wrappers FORMEMP/TBLEMP/SRCHEMP",
  !exists(path.join(EMP, "components/FORMEMP.jsx")) &&
    !exists(path.join(EMP, "components/TBLEMP.jsx")) &&
    !exists(path.join(EMP, "components/SRCHEMP.jsx"))
);

gate(
  "G191 — MakCadastroTable usa LoadBatchControls genérico",
  read(path.join(ROOT, "src/framework/mak/table/MakCadastroTable.jsx")).includes(
    "<LoadBatchControls"
  ) && !read(path.join(ROOT, "src/framework/mak/table/MakCadastroTable.jsx")).includes(
    "<EmpLoadBatchControls"
  )
);

gate(
  "G192 — Metadata usa hooks ModeloBase1 (não useEmp* shims)",
  read(path.join(EMP, "config/empresasModuleMetadata.js")).includes(
    "useModeloBase1CustomFields"
  ) &&
    !read(path.join(EMP, "config/empresasModuleMetadata.js")).includes("useEmpCamposPersonalizados")
);

gate(
  "G193 — Factory SSOT buildModeloBase1ConfigFromMakModule",
  exists(path.join(MB1, "config/buildModeloBase1ConfigFromMakModule.js")) &&
    read(path.join(ROOT, "src/modules/cadcps/config/cadcpsModeloBase1Config.js")).includes(
      "buildModeloBase1ConfigFromMakModule"
    )
);

gate(
  "G194 — Assets visuais promovidos ModeloBase1",
  exists(path.join(MB1, "search/MakCadastroSearchPanel.jsx")) &&
    exists(path.join(MB1, "cards/MgCardsVirtualGrid.jsx")) &&
    exists(path.join(MB1, "render/ModeloBase1PanelSections.jsx"))
);

gate(
  "G195 — Build produção",
  (() => {
    try {
      execSync("npm run build", { cwd: ROOT, stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  })()
);

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} gates passed`);
if (failed.length) {
  process.exit(1);
}
