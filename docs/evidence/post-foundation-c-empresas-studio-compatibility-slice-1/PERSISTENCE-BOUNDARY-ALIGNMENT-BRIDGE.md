# PERSISTENCE BOUNDARY ALIGNMENT BRIDGE

`createEmpresasPersistenceBoundaryAlignmentBridge()` formaliza a ponte entre o Studio
canonical persistence boundary e a realidade de Empresas.

- currentBoundary: existingProduction/referenceOnly
- allowedNow: read reference · contract-only alignment · documentação
- prohibitedNow: schema change · migration · backend call · prisma call · mutation ·
  production write · staging access

## Estados futuros

referenceOnly → contractOnlyAligned → uiAlignmentReady → runtimeBindingPilotReady →
backendPrismaReadinessDocumented → stagingReadinessFuture → productionWriteControlledFuture.

## Exigências para mudança futura

- evidence: slice dedicado, plano de teste controlado, rollback/cleanup, environment safety matrix
- gates: no-production-write, tenant-isolation, permission fail-closed
- rollback: testRunId cleanup, captura explícita de ids, rollback por não-consumo

Regra: schemaChangeAllowed/migrationAllowed/mutationAllowed/backendAccessed/prismaAccessed/
productionAccessed = false; não cria schema/migration; não usa DATABASE_URL.
