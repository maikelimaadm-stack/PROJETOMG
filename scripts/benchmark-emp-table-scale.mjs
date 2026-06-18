import { performance } from "node:perf_hooks";

const SCALE_TARGETS = [100_000, 500_000, 1_000_000];
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

const toMs = (start) => Number((performance.now() - start).toFixed(2));

const buildDataset = (size) =>
  Array.from({ length: size }, (_, index) => ({
    id: `emp-${index + 1}`,
    codempresa: index + 1,
    cidade: CITIES[index % CITIES.length],
    status: index % 3 === 0 ? "Ativa" : "Inativa",
  }));

const runScenario = (size) => {
  const metrics = {
    size,
    generateMs: 0,
    filterMs: 0,
    sortMs: 0,
    filteredRows: 0,
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
    const cityCmp = left.cidade.localeCompare(right.cidade, "pt-BR", {
      numeric: true,
      sensitivity: "base",
    });
    if (cityCmp !== 0) return cityCmp;
    return left.codempresa - right.codempresa;
  });
  metrics.sortMs = toMs(sortStart);

  return metrics;
};

console.log("Empresas table scale benchmark (filter + sort)");
for (const size of SCALE_TARGETS) {
  const metrics = runScenario(size);
  console.log(JSON.stringify(metrics));
}
