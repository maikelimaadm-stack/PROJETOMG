# Module Test / Gate Plan

`createModuleTestGatePlan` planeja os testes e gates de um futuro slice de módulo.

Testes planejados: contract tests, blueprint validation tests, field tests, screen plan
tests, permission tests, tenant tests, persistence boundary tests, route/menu guard
tests, preview sandbox tests, no-production/no-mutation tests.

Gates planejados: scope guard, production guard, module generation guard, route/menu
guard, backend/prisma guard, mutation guard, migration guard, dependency guard.

Regras: descritivo apenas; `createsTestFileNow:false`, `createsGateFileNow:false`.
