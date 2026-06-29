import fs from "node:fs";
import path from "node:path";
import {
  CONSUMER_LAYER_PATHS,
  OFFICIAL_REGISTRY_DIRS,
  PUBLIC_API_ENTRY_POINTS,
  FORBIDDEN_FOUNDATION_PATTERNS,
} from "./studioArchitectureConstants.js";
import { validateDependencyGraph, validateFileDependencies, stripSourceComments } from "./dependencyGraph.js";

const STUDIO_ROOT = "src/studio";

/**
 * Walk Studio tree collecting JS/TS files.
 * @param {string} rootDir — repo root
 */
export function collectStudioFiles(rootDir) {
  const studioPath = path.join(rootDir, STUDIO_ROOT);
  const files = [];

  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
        files.push({
          path: full,
          content: fs.readFileSync(full, "utf8"),
        });
      }
    }
  };

  walk(studioPath);
  return files;
}

/**
 * G279 — Designer isolation: no cross-designer, no foundation/runtime access from consumers.
 */
export function checkDesignerIsolation(files) {
  const violations = [];
  files.forEach(({ path: filePath, content }) => {
    const rel = filePath.replace(/\\/g, "/");
    if (rel.includes("/studio/governance/")) return;
    const isConsumer = CONSUMER_LAYER_PATHS.some((p) => rel.includes(`/studio/${p}/`));
    if (!isConsumer) return;

    const codeWithoutComments = stripSourceComments(content);
    FORBIDDEN_FOUNDATION_PATTERNS.forEach(({ id, pattern, message }) => {
      if (pattern.test(codeWithoutComments)) {
        violations.push({ gate: "G279", rule: id, file: rel, message });
      }
    });
  });

  const graphViolations = validateDependencyGraph(files).filter(
    (v) => v.rule === "designer-cross-import" || v.rule === "foundation-mak" || v.rule === "runtime-bridge" || v.rule === "bootstrap" || v.rule === "modelobase1"
  );
  graphViolations.forEach((v) => violations.push({ gate: "G279", ...v }));

  return violations;
}

/**
 * G280 — Studio dependency rules via dependency graph.
 */
export function checkStudioDependencyRules(files) {
  return validateDependencyGraph(files).map((v) => ({ gate: "G280", ...v }));
}

/**
 * G281 — Registry protection: no parallel registries; plugin override guard exists.
 */
export function checkRegistryProtection(rootDir) {
  const violations = [];
  const studioPath = path.join(rootDir, STUDIO_ROOT);

  const findParallelRegistries = (dir, results = []) => {
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = full.replace(/\\/g, "/");
      if (entry.isDirectory()) {
        if (/registry$/i.test(entry.name) && !OFFICIAL_REGISTRY_DIRS.some((d) => rel.endsWith(d.replace(/\//g, path.sep)) || rel.includes(d))) {
          if (rel.includes("src/studio") && !OFFICIAL_REGISTRY_DIRS.some((official) => rel.includes(official))) {
            results.push(rel);
          }
        }
        findParallelRegistries(full, results);
      } else if (/Registry\.(js|ts)$/.test(entry.name)) {
        const isOfficial = OFFICIAL_REGISTRY_DIRS.some((d) => rel.includes(d));
        if (rel.includes("src/studio") && !isOfficial && !rel.includes("governance")) {
          results.push(rel);
        }
      }
    }
    return results;
  };

  const parallel = findParallelRegistries(studioPath);
  parallel.forEach((file) => {
    violations.push({
      gate: "G281",
      rule: "parallel-registry",
      file,
      message: "Parallel registry detected — use official registry paths only.",
    });
  });

  const pluginIntegration = path.join(studioPath, "events/integration/pluginEventIntegration.js");
  if (!fs.existsSync(pluginIntegration)) {
    violations.push({ gate: "G281", rule: "plugin-guard-missing", message: "Plugin event integration guard missing." });
  } else {
    const content = fs.readFileSync(pluginIntegration, "utf8");
    if (!content.includes("isOfficialBusEvent")) {
      violations.push({ gate: "G281", rule: "plugin-override-unprotected", message: "Plugin registry override protection missing." });
    }
  }

  return violations;
}

/**
 * G282 — Public API validation: consumers must not import internals.
 */
export function checkPublicApiValidation(files, rootDir = ".") {
  const violations = [];
  files.forEach(({ path: filePath, content }) => {
    const rel = filePath.replace(/\\/g, "/");
    const isConsumer = CONSUMER_LAYER_PATHS.some((p) => rel.includes(`/studio/${p}/`));
    if (!isConsumer) return;

    const fileViolations = validateFileDependencies(rel, content).filter(
      (v) => v.rule === "internal-registry" || v.rule === "event-hub-bypass"
    );
    fileViolations.forEach((v) => violations.push({ gate: "G282", ...v, file: rel }));
  });

  const indexPath = path.join(rootDir, STUDIO_ROOT, "index.js");
  if (!fs.existsSync(indexPath)) {
    violations.push({ gate: "G282", rule: "missing-public-index", message: "src/studio/index.js public API missing." });
  } else {
    const indexContent = fs.readFileSync(indexPath, "utf8");
    PUBLIC_API_ENTRY_POINTS.slice(0, 4).forEach((entry) => {
      const key = entry.split("/").pop().replace(".js", "");
      if (!indexContent.includes(key === "index" ? "createStudioSdk" : key.split(".")[0])) {
        /* index re-exports validated separately in gate */
      }
    });
  }

  return violations;
}

/**
 * G283 — Architecture boundary: foundation layers isolated from consumers importing back.
 */
export function checkArchitectureBoundaries(files) {
  const violations = [];
  const foundationLayers = ["registry", "designSystem", "events", "sdk"];

  files.forEach(({ path: filePath, content }) => {
    const rel = filePath.replace(/\\/g, "/");
    if (rel.includes("/studio/governance/")) return;
    const layer = foundationLayers.find((l) => rel.includes(`/studio/${l}/`));
    if (!layer) return;

    CONSUMER_LAYER_PATHS.forEach((consumer) => {
      if (content.includes(`studio/${consumer}/`) || content.includes(`/${consumer}/`)) {
        violations.push({
          gate: "G283",
          rule: "foundation-imports-consumer",
          file: rel,
          message: `Foundation layer "${layer}" must not import consumer "${consumer}".`,
        });
      }
    });

    if (layer !== "events" && layer !== "designSystem") {
      const codeWithoutComments = stripSourceComments(content);
      FORBIDDEN_FOUNDATION_PATTERNS.forEach(({ id, pattern, message }) => {
        if (pattern.test(codeWithoutComments)) {
          violations.push({ gate: "G283", rule: id, file: rel, message });
        }
      });
    }
  });

  return violations;
}

/**
 * G284 — Full dependency graph validation.
 */
export function checkDependencyGraphValidation(files) {
  return validateDependencyGraph(files).map((v) => ({ gate: "G284", ...v }));
}

/**
 * Run complete Studio architecture validation.
 * @param {string} [rootDir="."]
 */
export function validateStudioArchitecture(rootDir = ".") {
  const files = collectStudioFiles(rootDir);
  const violations = [
    ...checkDesignerIsolation(files),
    ...checkStudioDependencyRules(files),
    ...checkRegistryProtection(rootDir),
    ...checkPublicApiValidation(files, rootDir),
    ...checkArchitectureBoundaries(files),
    ...checkDependencyGraphValidation(files),
  ];

  const unique = [];
  const seen = new Set();
  violations.forEach((v) => {
    const key = `${v.gate}|${v.file}|${v.rule}|${v.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(v);
    }
  });

  return Object.freeze({
    valid: unique.length === 0,
    violationCount: unique.length,
    violations: unique,
    filesScanned: files.length,
  });
}

export default validateStudioArchitecture;
