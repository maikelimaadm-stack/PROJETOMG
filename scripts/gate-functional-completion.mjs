#!/usr/bin/env node
/**
 * Gates G137–G145 — Cobertura funcional ModeloBase1.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const CERTIFIED = ["empresas", "produtos", "marcas", "cadcps"];

const results = [];
const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const read = (filePath) => fs.readFileSync(filePath, "utf8");
const exists = (filePath) => fs.existsSync(filePath);

gate(
  "G137 — MgFilterPanel metadata-driven",
  !read(path.join(ROOT, "src/framework/mak/layout/MgFilterPanel.jsx")).includes("MG_FILTER_SIDEBAR_FIELDS")
);

gate(
  "G138 — ModeloBase1 passa sidebarFilter metadata",
  read(path.join(ROOT, "src/ModeloBase1/render/ModeloBase1CadastroPage.jsx")).includes(
    "sidebarFilterConfig"
  )
);

const modulesWithSidebar = CERTIFIED.filter((moduleId) => {
  const metaPath = path.join(ROOT, "src/modules", moduleId, "config", `${moduleId}ModuleMetadata.js`);
  return exists(metaPath) && read(metaPath).includes("filters:") && read(metaPath).includes("sidebar:");
});
gate(
  "G139 — Módulos certificados declaram filters.sidebar",
  modulesWithSidebar.length === CERTIFIED.length,
  `faltando: ${CERTIFIED.filter((id) => !modulesWithSidebar.includes(id)).join(", ")}`
);

gate(
  "G140 — launchPanelStyle storage genérico",
  exists(path.join(ROOT, "src/framework/mak/preferences/createMakLaunchPanelStyleStorage.js"))
);

const bootstrapRegistered = CERTIFIED.filter((moduleId) => {
  const registerPath = path.join(ROOT, "src/modules", moduleId, "preferences");
  if (moduleId === "empresas") {
    return exists(path.join(registerPath, "registerEmpresasPreferencesBootstrap.js"));
  }
  return exists(path.join(registerPath, `register${moduleId.charAt(0).toUpperCase()}${moduleId.slice(1)}PreferencesBootstrap.js`));
});
gate(
  "G141 — Bootstrap registrado para módulos certificados",
  bootstrapRegistered.length === CERTIFIED.length
);

gate(
  "G142 — useAppPreferencesBootstrap multi-módulo",
  read(path.join(ROOT, "src/modules/makBootstrap/useAppPreferencesBootstrap.js")).includes("produtos") &&
    read(path.join(ROOT, "src/modules/makBootstrap/useAppPreferencesBootstrap.js")).includes("cadcps")
);

gate(
  "G143 — buildMakStandardDynamicFields expandido",
  read(path.join(ROOT, "src/framework/mak/metadata/buildMakStandardDynamicFields.jsx")).includes("MakCmdSelect") &&
    read(path.join(ROOT, "src/framework/mak/metadata/buildMakStandardDynamicFields.jsx")).includes("EmpFormImageField")
);

gate(
  "G144 — Prefetch login multi-módulo",
  exists(path.join(ROOT, "src/modules/makBootstrap/prefetchMakPreferencesAtLogin.js"))
);

gate(
  "G145 — Build produção",
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
console.log(`\nG137-G145: ${passed}/${results.length} aprovados`);
process.exit(passed === results.length ? 0 : 1);
