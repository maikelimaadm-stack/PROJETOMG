#!/usr/bin/env node
/**
 * Gate G307 — Business Operating Shell MVP (Program 3.9, D-074/D-075)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const BOS = path.join(ROOT, "src/bos");
const APP = path.join(ROOT, "src/App.jsx");
const CADASTRO_ROUTES = path.join(ROOT, "src/framework/mak/routes/makCadastroRoutes.js");
const GENERATED_MODULES = path.join(ROOT, "src/modules/generatedModules.json");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredBosFiles = [
  "index.js",
  "shell/BosShell.jsx",
  "shell/BosHeader.jsx",
  "shell/BosLayoutRoute.jsx",
  "pages/BosHomePage.jsx",
  "pages/BusinessFirstPage.jsx",
  "pages/ExpertModePage.jsx",
  "config/bosCapabilityCatalog.js",
  "config/bosAssetCatalog.js",
  "config/bosNavConfig.js",
  "config/bosHomeContent.js",
  "components/CapabilityCard.jsx",
  "components/AssetCard.jsx",
  "guards/StudioTechnicalGuard.jsx",
  "styles/bos.css",
];

gate(
  "G307 — BOS package structure exists",
  requiredBosFiles.every((f) => exists(path.join(BOS, f)))
);

const appSource = read(APP);

gate(
  "G307 — Default route `/` maps to BOS home",
  appSource.includes('path="/"') && appSource.includes("<BosHomePage />")
);

gate(
  "G307 — `/CadastroEmpresas` preserved for Empresas runtime",
  appSource.includes('path="/CadastroEmpresas"') && appSource.includes("<EmpresasPage />")
);

gate(
  "G307 — Catch-all redirects to BOS home (not module menu)",
  appSource.includes('<Navigate to="/" replace />') &&
    !appSource.includes('<Navigate to="/CadastroEmpresas" replace />')
);

gate(
  "G307 — Business First entry route registered",
  appSource.includes('path="/bos/business-first"') && appSource.includes("<BusinessFirstPage />")
);

gate(
  "G307 — Expert Mode entry route registered",
  appSource.includes('path="/bos/expert"') && appSource.includes("<ExpertModePage />")
);

gate(
  "G307 — Studio formula route guarded for business users",
  appSource.includes("StudioTechnicalGuard") && read(path.join(BOS, "guards/StudioTechnicalGuard.jsx")).includes("formula")
);

gate(
  "G307 — `/` is not a cadastro/MG route",
  read(CADASTRO_ROUTES).includes('normalized === "/") return false')
);

gate(
  "G307 — Cadastro Empresas remains cadastro route",
  read(CADASTRO_ROUTES).includes("MAK_CADASTRO_ROUTE_PREFIXES") &&
    JSON.parse(read(GENERATED_MODULES)).some((m) => m.routePath === "/CadastroEmpresas")
);

const bosShell = read(path.join(BOS, "shell/BosShell.jsx"));
const bosHeader = read(path.join(BOS, "shell/BosHeader.jsx"));
const bosHome = read(path.join(BOS, "pages/BosHomePage.jsx"));

gate(
  "G307 — BOS shell declares official surface marker",
  bosShell.includes('data-surface="business-operating-shell"')
);

gate(
  "G307 — BOS brand uses Business OS identity (not ERP module menu)",
  bosHeader.includes("MAK Business OS") && !bosHeader.includes("MAK Gestão ERP")
);

const homeSections = [
  "objectives",
  "capabilities",
  "assets",
  "operations",
  "health",
];

const homeComponentSources = [
  bosHome,
  read(path.join(BOS, "components/ObjectivesSection.jsx")),
  read(path.join(BOS, "components/HealthAndActivitySections.jsx")),
];

gate(
  "G307 — BOS home includes mandatory regions",
  homeSections.every((section) =>
    homeComponentSources.some((source) => source.includes(`id="${section}"`))
  )
);

gate(
  "G307 — Capability catalog maps runtime operations",
  read(path.join(BOS, "config/bosCapabilityCatalog.js")).includes("operationRoute") &&
    read(GENERATED_MODULES).includes("/CadastroEmpresas")
);

const businessFirst = read(path.join(BOS, "pages/BusinessFirstPage.jsx"));
gate(
  "G307 — Business First uses Intent Resolver (not Formula Builder UI)",
  businessFirst.includes("resolveFromBusinessLanguage") &&
    !businessFirst.includes("/studio/formula") &&
    !businessFirst.includes("FormulaEditor")
);

const expertPage = read(path.join(BOS, "pages/ExpertModePage.jsx"));
gate(
  "G307 — Expert Mode page blocks Studio/Formula identity",
  expertPage.includes("Formula Builder") && expertPage.includes("não abre Studio")
);

gate(
  "G307 — BOS isolated from Studio designer imports",
  !read(path.join(BOS, "index.js")).includes("/studio/designers/")
);

try {
  execSync("npm run gate:business-computed-fields", { cwd: ROOT, stdio: "pipe" });
  gate("G307 — G306 Business Computed Fields still green", true);
} catch {
  gate("G307 — G306 Business Computed Fields still green", false, "G306 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG307: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
