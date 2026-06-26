#!/usr/bin/env node
/**
 * Gates G31–G45 — Certificação ModeloBase1 (semântica, hooks, produtos config-only).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/workspace";
const MB1 = path.join(ROOT, "src/ModeloBase1");

const results = [];
const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const read = (filePath) => fs.readFileSync(filePath, "utf8");

const grepInDir = (dir, pattern) => {
  let total = 0;
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
        const content = read(full);
        const re = new RegExp(pattern, "gi");
        const matches = content.match(re);
        if (matches) total += matches.length;
      }
    }
  };
  walk(dir);
  return total;
};

// G31 — Nenhuma referência semântica a Empresas no ModeloBase1.
// Props de compatibilidade Emp (empresas=, isLoadingEmpresas, etc.) são permitidas para paridade G58–G72.
const empPatterns =
  /editingEmp|empFavorites|empresasFiltradas|tableFilteredEmpresas|codempresa|razao_social|useEmp[A-Z]/;
const allowedEmpPassthrough =
  /empresas=\{filteredPanelRecords\}|empresas:\s*filteredPanelRecords|isLoadingEmpresas:\s*recordsLoading|isFetchingEmpresas:\s*recordsFetching|onFilteredEmpresasChange:\s*handleFilteredRecordsChange/g;
const countEmpRefs = (dir) => {
  let total = 0;
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
        const content = read(full).replace(allowedEmpPassthrough, "");
        const re = new RegExp(empPatterns.source, "gi");
        const matches = content.match(re);
        if (matches) total += matches.length;
      }
    }
  };
  walk(dir);
  return total;
};
const empRefs = countEmpRefs(MB1);
gate(
  "G31 — Sem referências Empresas no ModeloBase1 (exceto props compat)",
  empRefs === 0,
  empRefs ? `${empRefs} ocorrências` : ""
);

// G32 — Hooks genéricos exportados
const hooksIndex = read(path.join(MB1, "hooks/index.js"));
gate(
  "G32 — Hooks genéricos no ModeloBase1",
  hooksIndex.includes("useModeloBase1Favorites") &&
    hooksIndex.includes("useModeloBase1InfiniteListData")
);

// G33 — SearchPanel genérico (MakSearchPanel / ModeloBase1SearchPanel)
gate(
  "G33 — SearchPanel genérico exportado",
  read(path.join(MB1, "render/ModeloBase1PanelSections.jsx")).includes("ModeloBase1SearchPanel")
);

// G34 — Preferências genéricas
gate(
  "G34 — Bootstrap preferências genérico",
  hooksIndex.includes("useModeloBase1PreferencesBootstrap")
);

// G35 — Infinite scroll genérico
gate(
  "G35 — Infinite scroll genérico",
  fs.existsSync(path.join(MB1, "hooks/useModeloBase1InfiniteListData.js"))
);

// G36 — Motor único
const motherPage = read(path.join(ROOT, "src/framework/mak/page/MakCadastroMotherPage.jsx"));
gate(
  "G36 — MakCadastroMotherPage alias ModeloBase1",
  motherPage.includes("ModeloBase1CadastroPage") && motherPage.includes("buildModeloBase1ConfigFromMakModule")
);

// G37 — Produtos config-only
const pagPro = read(path.join(ROOT, "src/modules/produtos/pages/PAGPRO.jsx"));
gate(
  "G37 — Produtos criado por configuração",
  pagPro.includes("produtosModeloBase1Config") && pagPro.includes("ModeloBase1CadastroPage")
);

// G38-G44 — Sem duplicação de componentes no módulo Produtos
const produtosDir = path.join(ROOT, "src/modules/produtos");
const forbidden = ["Toolbar", "SearchPanel", "FormPanel", "TablePanel", "Dock", "useProd"];
let dupCount = 0;
const walkProd = (d) => {
  for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, entry.name);
    if (entry.isDirectory()) walkProd(full);
    else {
      const base = entry.name;
      if (forbidden.some((f) => base.includes(f) && !base.includes("ModeloBase1"))) dupCount++;
    }
  }
};
walkProd(produtosDir);
gate("G38-G44 — Produtos sem componentes duplicados", dupCount === 0, dupCount ? `${dupCount} arquivos` : "");

// G45 — Propagação records no MakCadastroTable
const table = read(path.join(ROOT, "src/framework/mak/table/MakCadastroTable.jsx"));
gate("G45 — MakCadastroTable aceita records", table.includes("records: recordsProp"));

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG31-G45: ${passed}/${total} aprovados`);
process.exit(passed === total ? 0 : 1);
