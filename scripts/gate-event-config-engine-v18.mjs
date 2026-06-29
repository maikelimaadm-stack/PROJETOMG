#!/usr/bin/env node
/**
 * Gates G229–G239 — Events Configuration Engine V18.
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
  "G229 — Events Config Engine foundation",
  exists(path.join(MAK, "events/createMakEventConfigEngine.js"))
);

gate(
  "G230 — ModeloBase1/eventsConfig re-exporta foundation",
  read(path.join(MB1, "eventsConfig/index.js")).includes("createMakEventConfigEngine")
);

gate(
  "G231 — useMakFormEventHandlers integrado MakCadastroForm",
  read(path.join(ROOT, "src/framework/mak/form/MakCadastroForm.jsx")).includes("useMakFormEventHandlers")
);

gate(
  "G232 — Metadata events declarativa",
  read(path.join(MAK, "events/buildMakEventConfigMetadata.js")).includes("MAK_EVENT_METADATA_KEYS")
);

const prefsBootstrap = read(path.join(ROOT, "src/modules/makBootstrap/registerMakPreferencesBootstrapModules.js"));
gate(
  "G233 — Bootstrap registra events engine",
  prefsBootstrap.includes("registerMakEventConfigEngine") ||
    prefsBootstrap.includes("registerRuntimeBridge")
);

const bootstrap = read(path.join(ROOT, "src/modules/makBootstrap/registerMakEventConfigEngine.js"));
gate(
  "G234 — Módulos certificados + eventscert registrados",
  bootstrap.includes("eventscert") && bootstrap.includes("registerMakEventConfigEngine")
);

const catalog = read(path.join(MAK, "events/eventCertificationCatalog.js"));
const actions = read(path.join(MAK, "events/makEventBuiltinActions.js"));
const requiredEvents = ["onLoad", "onChange", "onSave", "onDelete", "onFormulaCalculated", "onValidationCompleted"];
gate(
  "G235 — Catálogo certificação cobre eventos oficiais",
  requiredEvents.every((evt) => catalog.includes(evt) || actions.includes(evt))
);

gate(
  "G236 — Módulo fictício eventscert metadata-only",
  exists(path.join(ROOT, "src/modules/eventscert/config/eventCertModuleMetadata.js")) &&
    read(path.join(ROOT, "src/modules/eventscert/config/eventCertModuleMetadata.js")).includes(
      "MAK_EVENT_CERTIFICATION_DEFINITIONS"
    )
);

gate(
  "G237 — Factory ModeloBase1 embeds eventEngine metadata",
  read(path.join(MB1, "config/buildModeloBase1ConfigFromMakModule.js")).includes("eventEngineMetadata")
);

gate(
  "G238 — Sem Events Engine paralela no ModeloBase1",
  !exists(path.join(MB1, "eventsConfig/EventRenderer.jsx")) &&
    !exists(path.join(MB1, "eventsConfig/MakEventForm.jsx"))
);

gate(
  "G239 — Build produção",
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
console.log(`\nG229-G239: ${results.length - failed.length}/${results.length} gates passed`);
if (failed.length) {
  process.exit(1);
}
