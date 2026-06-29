#!/usr/bin/env node
/**
 * Gate G285 — MAK Studio UX Framework (Program 2.0.9)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const UX_DOC = path.join(ROOT, "docs/architecture/MAK-STUDIO-UX-FRAMEWORK.md");
const ARCH_DOC = path.join(ROOT, "docs/architecture/MAK-STUDIO-ARCHITECTURE.md");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const read = (filePath) => fs.readFileSync(filePath, "utf8");
const exists = (filePath) => fs.existsSync(filePath);

gate("G285 — MAK Studio UX Framework document exists", exists(UX_DOC));

const requiredSections = [
  "## 4.1 Workspace",
  "## 4.2 Dock System",
  "## 4.3 Explorer",
  "## 4.5 Property Grid",
  "## 4.9 Command Palette",
  "## 4.10 History",
  "## 4.11 Preview",
  "## 5.3 Keyboard shortcuts",
  "## 6. Accessibility",
  "## 11. Designer Compliance Checklist",
];

const uxContent = exists(UX_DOC) ? read(UX_DOC) : "";
const missingSections = requiredSections.filter((s) => !uxContent.includes(s));

gate(
  "G285 — UX Framework required sections",
  missingSections.length === 0,
  missingSections.join(", ")
);

gate(
  "G285 — UX Framework referenced in Studio Architecture",
  exists(ARCH_DOC) && read(ARCH_DOC).includes("MAK-STUDIO-UX-FRAMEWORK.md")
);

gate(
  "G285 — UX Framework version and decision registered",
  uxContent.includes("D-036") && uxContent.includes("1.0.0")
);

const failed = results.filter((r) => !r.ok);
console.log(`\nG285: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
