# READINESS CHECKLIST — EMPRESAS

Espelho legível de `createMigrationReadinessModel()`. Status atual: **`read_only_candidate`** (máximo permitido neste slice; nunca `migrated`).

| Item | Status | Evidência | Risco | Decisão |
|---|---|---|---|---|
| Shadow pipeline (Empresas) | ✅ ready | `gate:g423-shadow-empresas` · `test:runtime:shadow:empresas` | RISK-02 | avançar |
| Table/form shadow projection | ✅ ready | `gate:g423-shadow-empresas-table-form` | RISK-01, RISK-03 | avançar |
| Controlled preview | ✅ ready | `gate:g423-preview-empresas` | RISK-05 | avançar |
| Dev preview hub | ✅ ready | `gate:g423-preview-hub` | RISK-05 | avançar |
| Controlled dev dataset | ✅ ready | `gate:g423-preview-dataset` | RISK-06 | avançar |
| Dev preview route | ✅ ready | `gate:g423-preview-route` · `gate:g423-preview-route-mount` | RISK-04 | avançar |
| Route activation (montada no roteador real) | ✅ ready | `gate:g423-preview-route-activation` | RISK-04 | avançar |
| Legado ainda é fonte da verdade | ✅ sim | plano fase 0 | RISK-09 | avançar |
| Usa dados reais? | ✅ não | mock-only | RISK-06 | avançar |
| Escreve dados reais? | ✅ não | sem write path | RISK-07 | avançar |
| Rollback disponível | ✅ sim | ROLLBACK-PLAN.md | RISK-07 | avançar |
| Reversível por flag | ✅ sim | `MAK_RUNTIME_V2_EMPRESAS_READONLY` off | RISK-07 | avançar |
| Migração concluída? | ⛔ não (proibido neste slice) | `migratesThisSlice = false` | — | bloquear até próximo slice |
| Write real habilitado? | ⛔ não (fora de escopo) | fases 4–5 out-of-scope | RISK-07 | bloquear |

## Blockers

Nenhum com os sinais atuais de Empresas. Um blocker (ex.: shadow falhando, legado deixando de ser fonte, write real) força o status para `blocked`.

## Warnings

Nenhum com os sinais atuais. Soft-signals (preview/dataset/route incompletos, uso de dados reais) são surfacados como warnings sem bloquear.

## Decisão final

**Empresas está apto a `read_only_candidate`.** O próximo slice permitido é **Post-Foundation C — Empresas Read-Only Runtime v2 Candidate**, condicionado a todos os gates de shadow/preview/route permanecerem verdes e ao rollback continuar disponível.
