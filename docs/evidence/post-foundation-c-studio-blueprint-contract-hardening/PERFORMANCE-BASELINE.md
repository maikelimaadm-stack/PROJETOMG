# PERFORMANCE BASELINE (LOCAL, NÃO-SLA)

`createStudioContractPerformanceBaseline({ profile })` mede o custo local de rodar as
matrizes/suites. **Sem rede, sem backend, sem Prisma, sem mutation, sem I/O.**

## Perfis

tiny (1) · small (3) · medium (8) · large (20) iterações.

## Operações medidas

invalidCaseMatrix · dangerousMatrix · fieldMatrix · permissionMatrix ·
persistenceTransitions · compatibilityMatrix · digestSuite · safetyRunner.

## Métricas por operação

iterations · scenarioCount · minMs · maxMs · avgMs · p50Ms · p95Ms · complexityNote.

## Regras

Valida apenas conclusão e ausência de explosão anormal (`performanceStatus: ok` quando
o pior `maxMs < 2000`). Não é SLA produtivo e não depende de hardware específico
(`usesHardHardwareLimit: false`).
