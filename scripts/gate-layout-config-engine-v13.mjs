#!/usr/bin/env node
/**
 * Gates G156–G165 — Layout Configuration Engine V13 (ModeloBase1 Capability Pack V1).
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

gate(
  "G156 — Layout Config Engine foundation",
  exists(path.join(MAK, "layoutConfig/createMakLayoutConfigEngine.js"))
);

const mb1Layout = read(path.join(MB1, "layoutConfig/index.js"));
gate(
  "G157 — ModeloBase1/layoutConfig re-exporta foundation",
  mb1Layout.includes("framework/mak/layoutConfig") && mb1Layout.includes("CadLayoutConfigurator")
);

const makForm = read(path.join(MAK, "form/MakCadastroForm.jsx"));
gate(
  "G158 — MakCadastroForm sem systemPanelIds hardcoded Empresas",
  !makForm.includes('systemPanelIds={["principais", "endereco"') &&
    makForm.includes("cadastroConfig.systemPanelIds")
);

const registry = read(path.join(ROOT, "src/modules/makBootstrap/registerMakLayoutConfigEngine.js"));
gate(
  "G159 — Layout engine registrada para módulos certificados",
  ["empresas", "produtos", "marcas", "cadcps"].every((id) => registry.includes(`${id}CadastroConfig`))
);

const cadLayout = read(path.join(ROOT, "src/framework/cadastro-engine/design-system/CadLayoutConfigurator.jsx"));
gate(
  "G160 — CadLayoutConfigurator é re-export (não duplicado)",
  cadLayout.includes("EmpLayoutConfiguratorDialog") &&
    !exists(path.join(MB1, "layoutConfig/CadLayoutConfigurator.jsx"))
);

gate(
  "G161 — buildMakLayoutConfigMetadata declarativo",
  read(path.join(MAK, "layoutConfig/buildMakLayoutConfigMetadata.js")).includes("screenKey")
);

gate(
  "G162 — Bootstrap registra layout engine",
  read(path.join(ROOT, "src/modules/makBootstrap/registerMakPreferencesBootstrapModules.js")).includes(
    "registerMakLayoutConfigEngine"
  )
);

const modules = ["produtos", "marcas", "cadcps"].map((id) =>
  read(path.join(ROOT, `src/modules/${id}/config/${id}CadastroConfig.js`))
);
gate(
  "G163 — Módulos certificados com cadastroConfig + systemPanelIds",
  modules.every((content) => content.includes("systemPanelIds") && content.includes("createCadastroModuleConfig"))
);

gate(
  "G164 — Sem Layout Engine paralela no ModeloBase1",
  !exists(path.join(MB1, "layoutConfig/LayoutEngine.js")) &&
    !exists(path.join(MB1, "layoutConfig/LayoutConfigurator.jsx"))
);

gate(
  "G165 — Build produção",
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
