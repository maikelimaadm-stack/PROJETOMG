#!/usr/bin/env node
/**
 * Gates G240–G250 — Actions Configuration Engine V19.
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
  "G240 — Actions Config Engine foundation",
  exists(path.join(MAK, "actions/createMakActionConfigEngine.js"))
);

gate(
  "G241 — ModeloBase1/actionsConfig re-exporta foundation",
  read(path.join(MB1, "actionsConfig/index.js")).includes("createMakActionConfigEngine")
);

gate(
  "G242 — useMakFormActionHandlers integrado MakCadastroForm",
  read(path.join(ROOT, "src/framework/mak/form/MakCadastroForm.jsx")).includes("useMakFormActionHandlers")
);

gate(
  "G243 — Events Engine delega Actions Engine",
  read(path.join(MAK, "events/makEventBuiltinActions.js")).includes("executeMakAction")
);

gate(
  "G244 — Metadata actions declarativa",
  read(path.join(MAK, "actions/buildMakActionConfigMetadata.js")).includes("MAK_ACTION_METADATA_KEYS")
);

const prefsBootstrap = read(path.join(ROOT, "src/modules/makBootstrap/registerMakPreferencesBootstrapModules.js"));
gate(
  "G245 — Bootstrap registra actions engine",
  prefsBootstrap.includes("registerMakActionConfigEngine") ||
    prefsBootstrap.includes("registerRuntimeBridge")
);

const bootstrap = read(path.join(ROOT, "src/modules/makBootstrap/registerMakActionConfigEngine.js"));
gate(
  "G246 — Módulos certificados + actionscert registrados",
  bootstrap.includes("actionscert") && bootstrap.includes("registerMakActionConfigEngine")
);

const catalog = read(path.join(MAK, "actions/actionCertificationCatalog.js"));
const types = read(path.join(MAK, "actions/makActionBuiltinTypes.js"));
const requiredActions = ["save", "duplicate", "setFields", "openDialog", "closeDialog", "executeApi", "parallel", "when", "rollback"];
gate(
  "G247 — Catálogo certificação cobre ações oficiais",
  requiredActions.every((act) => catalog.includes(act) || types.includes(`"${act}"`))
);

gate(
  "G248 — Módulo fictício actionscert metadata-only",
  exists(path.join(ROOT, "src/modules/actionscert/config/actionCertModuleMetadata.js")) &&
    read(path.join(ROOT, "src/modules/actionscert/config/actionCertModuleMetadata.js")).includes(
      "MAK_ACTION_CERTIFICATION_DEFINITIONS"
    )
);

gate(
  "G249 — Factory ModeloBase1 embeds actionEngine metadata",
  read(path.join(MB1, "config/buildModeloBase1ConfigFromMakModule.js")).includes("actionEngineMetadata")
);

gate(
  "G250 — Sem Actions Engine paralela + build produção",
  !exists(path.join(MB1, "actionsConfig/ActionRenderer.jsx")) &&
    !exists(path.join(MB1, "actionsConfig/MakActionForm.jsx")) &&
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
console.log(`\nG240-G250: ${results.length - failed.length}/${results.length} gates passed`);
if (failed.length) {
  process.exit(1);
}
