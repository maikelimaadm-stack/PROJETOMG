# Estabilização de Produção — Relatório Etapa 1

**Data:** 2026-06-13  
**API:** `https://projetomg-production.up.railway.app`

## Situação crítica

| Item | Status |
|------|--------|
| Login | ❌ **QUEBRADO** |
| Causa | Código deployado referencia `Cliente.total_empresas` via Prisma Client; coluna **não existe** no PostgreSQL |
| Índices performance | ❌ **3/24** aplicados |
| ERP | ❌ Indisponível |

## Migrations no repositório (6)

1. `20260603010000_cadcps_module`
2. `20260604120000_id_global_corporativo`
3. `20260604200000_erp_restructure_definitivo`
4. `20260612120000_listing_performance_indexes`
5. `20260612180000_performance_optimization_indexes`
6. `20260613010000_enterprise_counter_columns` ← **pendente em produção**

## Colunas ausentes (produção)

- `Cliente.total_empresas` — **ausente** (bloqueia login no deploy atual)
- `Cliente.total_cadcps_campos` — **ausente**

## Índices ausentes (21 de 24)

Ver `/api/health` → `performanceIndexes.missing`

## Correção implementada (aguarda redeploy)

1. **Removidas** colunas opcionais do `schema.prisma` — Prisma Client não referencia colunas inexistentes
2. **Modo compatibilidade** — `counterService` usa raw SQL ou COUNT fallback
3. **Boot bloqueante** — `runBlockingDatabaseBoot.js`: `migrate deploy` → `ensureCounterColumns` → `ensurePerformanceIndexes` **antes** do `listen`
4. **Falha fatal** — servidor não inicia se migrations falharem

## Validar após redeploy

```bash
npm run smoke:production
cd backend && npm run report:production-schema
```

JSON completo: `docs/auditoria/PRODUCTION_STABILIZATION_REPORT.json`
