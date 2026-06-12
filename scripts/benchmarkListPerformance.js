/**
 * Benchmark de listagem paginada (simula custo por página, não volume total em memória).
 * Uso: node scripts/benchmarkListPerformance.js
 */
import { performance } from "node:perf_hooks";

const PAGE_SIZES = [25, 50, 100, 150, 200];
const DATASET_SIZES = [25_000, 50_000, 100_000];

const estimateRecordBytes = 2800;
const estimateDomNodesPerRow = 18;

console.log("=== ERP MAK — Benchmark teórico pós-otimização ===\n");

for (const total of DATASET_SIZES) {
  console.log(`Dataset: ${total.toLocaleString("pt-BR")} registros`);
  for (const pageSize of PAGE_SIZES) {
    const memoryMb = (pageSize * estimateRecordBytes) / (1024 * 1024);
    const domNodes = pageSize * estimateDomNodesPerRow;
    const requestsToLoadAll = Math.ceil(total / pageSize);
    console.log(
      `  pageSize=${pageSize} | memória ~${memoryMb.toFixed(1)} MB | DOM ~${domNodes} nodes | páginas totais=${requestsToLoadAll}`
    );
  }
  console.log("");
}

const beforeMemory = (25_000 * estimateRecordBytes) / (1024 * 1024);
const afterMemory = (50 * estimateRecordBytes) / (1024 * 1024);
console.log("Comparação (25k registros, scroll infinito vs paginação 50):");
console.log(`  Antes (acúmulo total): ~${beforeMemory.toFixed(0)} MB em memória`);
console.log(`  Depois (1 página):     ~${afterMemory.toFixed(1)} MB em memória`);
console.log(`  Redução estimada:      ~${Math.round((1 - afterMemory / beforeMemory) * 100)}%`);

const start = performance.now();
let sum = 0;
for (let i = 0; i < 50; i += 1) {
  sum += i;
}
console.log(`\nSanity check: ${(performance.now() - start).toFixed(3)}ms`);
