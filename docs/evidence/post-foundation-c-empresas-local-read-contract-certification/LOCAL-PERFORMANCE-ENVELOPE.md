# Local Performance Envelope

`createEmpresasLocalPerformanceEnvelope()` — **não é SLA de produção**.

## Consolida

datasetProfiles (tiny/small/medium/large), largestDataset (2000), operations, sampleCount (≥32),
complexityClassification, hardwareIndependentRules, anomalyPolicy, certificationStatus.

## Regras de certificação (independentes de hardware)

- toda operação termina (tempos finitos);
- sem crescimento explosivo incompatível com O(n)/O(n log n);
- sem timeout; sem rede; sem backend/Prisma; sem mutation;
- large limitado a 2000; sem benchmark flaky por limite rígido de milissegundos.

`hasAnomaly: false` → `certificationStatus: certified`. Anomalia crítica invalida a certificação.
