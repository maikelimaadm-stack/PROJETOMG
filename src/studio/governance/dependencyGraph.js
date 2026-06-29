import path from "node:path";
import {
  DEPENDENCY_STACK,
  CONSUMER_LAYER_PATHS,
  INTERNAL_REGISTRY_PATHS,
  FORBIDDEN_FOUNDATION_PATTERNS,
  OFFICIAL_REGISTRY_DIRS,
  DESIGNER_FOLDER_PATTERN,
} from "./studioArchitectureConstants.js";

/**
 * Resolve Studio sub-layer from file path relative to src/studio/.
 * @param {string} relativePath — e.g. "designers/layout/index.js"
 */
export function resolveStudioLayer(relativePath) {
  const segment = relativePath.split("/")[0];
  for (const entry of DEPENDENCY_STACK) {
    if (entry.paths.includes(segment)) return entry.layerId;
  }
  if (relativePath === "index.js") return "studio-root";
  return "unknown";
}

/**
 * Returns layer index in stack (lower = may be imported by higher).
 * @param {string} layerId
 */
export function getLayerIndex(layerId) {
  const idx = DEPENDENCY_STACK.findIndex((l) => l.layerId === layerId);
  return idx >= 0 ? idx : DEPENDENCY_STACK.length;
}

/**
 * Strip comments before forbidden-pattern analysis.
 * @param {string} content
 */
export function stripSourceComments(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

/**
 * Extract import specifiers from source.
 * @param {string} content
 */
export function extractImportSpecifiers(content) {
  const specifiers = [];
  const staticImport = /import\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  const dynamicImport = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match;
  while ((match = staticImport.exec(content)) !== null) specifiers.push(match[1]);
  while ((match = dynamicImport.exec(content)) !== null) specifiers.push(match[1]);
  return specifiers;
}

/**
 * Validate a single file against dependency graph rules.
 * @param {string} filePath — absolute or relative to repo root
 * @param {string} content
 */
export function validateFileDependencies(filePath, content) {
  const violations = [];
  const normalized = filePath.replace(/\\/g, "/");
  const studioIdx = normalized.indexOf("src/studio/");
  if (studioIdx < 0) return violations;

  const relativePath = normalized.slice(studioIdx + "src/studio/".length);
  if (relativePath.startsWith("governance/")) return violations;

  const sourceLayer = resolveStudioLayer(relativePath);
  const sourceLayerIndex = getLayerIndex(sourceLayer);
  const codeWithoutComments = stripSourceComments(content);

  FORBIDDEN_FOUNDATION_PATTERNS.forEach(({ id, pattern, message }) => {
    if (pattern.test(codeWithoutComments)) {
      violations.push({ rule: id, file: relativePath, message });
    }
  });

  const imports = extractImportSpecifiers(content);
  imports.forEach((specifier) => {
    const resolved = specifier.replace(/\\/g, "/");

    if (CONSUMER_LAYER_PATHS.some((p) => relativePath.startsWith(`${p}/`))) {
      INTERNAL_REGISTRY_PATHS.forEach((internal) => {
        if (resolved.includes(internal)) {
          violations.push({
            rule: "internal-registry",
            file: relativePath,
            message: `Consumer must not import internal registry path: ${internal}`,
            import: specifier,
          });
        }
      });

      if (resolved.includes("/events/hub/") && !resolved.includes("governance")) {
        violations.push({
          rule: "event-hub-bypass",
          file: relativePath,
          message: "Use getStudioEventHub() public API — do not import Event Hub internals.",
          import: specifier,
        });
      }
    }

    DEPENDENCY_STACK.forEach((targetEntry) => {
      const matchesTarget = targetEntry.paths.some((p) => resolved.includes(`studio/${p}/`) || resolved.includes(`/${p}/`));
      if (!matchesTarget) return;

      const targetLayerIndex = getLayerIndex(targetEntry.layerId);
      if (sourceLayer === "studio-root") return;
      if (sourceLayer === "studio-registry" && targetEntry.layerId === "studio-sdk") {
        if (resolved.includes("/sdk/studio") || resolved.includes("Contract") || resolved.includes("Constants")) return;
      }
      if (sourceLayerIndex > targetLayerIndex && sourceLayer !== targetEntry.layerId) {
        if (targetEntry.layerId === "studio-governance" && sourceLayer === "studio-consumer") return;
        violations.push({
          rule: "dependency-inversion",
          file: relativePath,
          message: `Dependency inversion: ${sourceLayer} must not import ${targetEntry.layerId}.`,
          import: specifier,
        });
      }
    });
  });

  const designerMatch = relativePath.match(DESIGNER_FOLDER_PATTERN);
  if (designerMatch) {
    const thisDesigner = designerMatch[1];
    imports.forEach((specifier) => {
      const crossMatch = specifier.match(/designers\/([^/'"]+)/);
      if (crossMatch && crossMatch[1] !== thisDesigner) {
        violations.push({
          rule: "designer-cross-import",
          file: relativePath,
          message: `Designer "${thisDesigner}" must not import designer "${crossMatch[1]}".`,
          import: specifier,
        });
      }
    });
  }

  return violations;
}

/**
 * Scan all Studio source files for dependency violations.
 * @param {Array<{path: string, content: string}>} files
 */
export function validateDependencyGraph(files) {
  const violations = [];
  files.forEach(({ path: filePath, content }) => {
    violations.push(...validateFileDependencies(filePath, content));
  });
  return violations;
}

export default validateDependencyGraph;
