import { performance } from "node:perf_hooks";
import { buildGroupedRows } from "../src/modules/empresas/components/tblEmp.grouping.js";

const SCALE_TARGETS = [100_000, 500_000, 1_000_000];
const GROUP_COLUMN_ID = "cliente";
const CITIES = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Curitiba",
  "Recife",
  "Fortaleza",
  "Porto Alegre",
  "Manaus",
  "Goiânia",
  "Brasília",
];
const CLIENT_BUCKETS = 1200;

const toMs = (start) => Number((performance.now() - start).toFixed(2));

const buildDataset = (size) =>
  Array.from({ length: size }, (_, index) => ({
    id: `emp-${index + 1}`,
    codempresa: index + 1,
    cliente: `Cliente ${index % CLIENT_BUCKETS}`,
    cidade: CITIES[index % CITIES.length],
    status: index % 3 === 0 ? "Ativa" : "Inativa",
  }));

const buildCollapsedKeys = () =>
  Object.fromEntries(
    Array.from({ length: CLIENT_BUCKETS }, (_, index) => [`|${GROUP_COLUMN_ID}:Cliente ${index}`, true])
  );

const runScenario = (size) => {
  const metrics = {
    size,
    generateMs: 0,
    filterMs: 0,
    sortMs: 0,
    groupMs: 0,
    filteredRows: 0,
    groupedRows: 0,
  };

  const generateStart = performance.now();
  const dataset = buildDataset(size);
  metrics.generateMs = toMs(generateStart);

  const filterStart = performance.now();
  const filtered = dataset.filter((row) => row.cidade === "São Paulo" || row.status === "Ativa");
  metrics.filterMs = toMs(filterStart);
  metrics.filteredRows = filtered.length;

  const sortStart = performance.now();
  filtered.sort((left, right) => {
    const clientCmp = left.cliente.localeCompare(right.cliente, "pt-BR", {
      numeric: true,
      sensitivity: "base",
    });
    if (clientCmp !== 0) return clientCmp;
    return left.codempresa - right.codempresa;
  });
  metrics.sortMs = toMs(sortStart);

  const groupStart = performance.now();
  const groupedResult = buildGroupedRows({
    items: filtered,
    groupedColumns: [{ id: GROUP_COLUMN_ID }],
    collapsedGroupKeys: buildCollapsedKeys(),
    getFieldValue: (row, columnId) => row[columnId],
    sortConfig: [{ key: GROUP_COLUMN_ID, direction: "asc" }],
  });
  metrics.groupMs = toMs(groupStart);
  metrics.groupedRows = groupedResult.rows.length;

  return metrics;
};

const formatRow = (row) => [
  `escala=${row.size.toLocaleString("pt-BR")}`,
  `geração=${row.generateMs}ms`,
  `filtro=${row.filterMs}ms`,
  `ordenação=${row.sortMs}ms`,
  `agrupamento=${row.groupMs}ms`,
  `filtrados=${row.filteredRows.toLocaleString("pt-BR")}`,
  `linhas-grupo=${row.groupedRows.toLocaleString("pt-BR")}`,
].join(" | ");

const results = SCALE_TARGETS.map(runScenario);

console.log("=== BENCHMARK TABELA EMPRESAS (filtro + ordenação + agrupamento) ===");
results.forEach((row) => {
  console.log(formatRow(row));
});
