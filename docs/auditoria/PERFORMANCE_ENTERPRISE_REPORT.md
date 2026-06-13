# Performance Enterprise — Relatório Antes/Depois

## Resumo executivo

A latência de ~2,5 s para 50 registros **não era causada pelo volume de dados retornados**, e sim por:

1. **`loadAccessScope`** — query DB em toda requisição autenticada (~800 ms × round-trip US↔BR)
2. **`COUNT(*)`** em 26.225 empresas a cada listagem
3. **Desalinhamento regional** Railway (US) ↔ Supabase (BR)

Esta implementação elimina (1) e (2) via **JWT inteligente**, **contadores materializados** e **cache multinível**.

---

## ANTES (medições reais — produção, 2026-06-13)

Fonte: `scripts/latencyAuditBackend.results.json`

| Endpoint | TTFB mediano |
|----------|--------------|
| `/api/empresas?pageSize=50` | **2545 ms** |
| `/api/metrics/contadores` | **2391 ms** |
| `/api/auth/session` | **3359 ms** |
| `/api/cadcps/campos` | **3996 ms** |
| `/api/health` | **10251 ms** |

### Decomposição `/api/empresas`

| Camada | Tempo | % |
|--------|-------|---|
| Rede cliente→Railway | 54 ms | 2,1% |
| Server-side (TTFB) | 2545 ms | 97,9% |
| Download JSON | 1,3 ms | 0,05% |

### Custo fixo comprovado

`empresas` − `contadores` = **155 ms** → listagem de 50 linhas adiciona apenas 6% sobre baseline de **2390 ms**.

---

## DEPOIS (alterações implementadas)

### Fase 1–2: JWT inteligente + escopo sem DB

| Arquivo | Mudança |
|---------|---------|
| `authService.js` | JWT inclui `allowed_empresa_ids`, `ativo`, `empresas_total` |
| `accessScope.js` | Escopo 100% from JWT; fallback DB só para tokens legados |
| `auth/routes.js` | Session usa cache em memória; sem re-query de usuário |
| `sessionCache.js` | Empresas da sessão cacheadas no login (8h) |

**Impacto esperado:** elimina ~1 round-trip DB por request (−800 ms a −1200 ms em US↔BR).

### Fase 3: Contadores materializados

| Arquivo | Mudança |
|---------|---------|
| `Cliente.total_empresas` | Coluna mantida por increment/decrement |
| `Cliente.total_cadcps_campos` | Idem para CADCPS |
| `counterService.js` | Cache TTL + leitura O(1) sem COUNT(*) |
| `empresaRepository.list` | Sem COUNT paralelo (usa contador materializado) |
| `repCps.js` | Idem para listagem sem filtros |
| `metricsService.js` | Delega ao counterService |

**Impacto esperado:** elimina COUNT(*) de 26k linhas por listagem (−500 ms a −1500 ms).

### Fase 4–5: Índices + SQL

| Script | Função |
|--------|--------|
| `ensurePerformanceIndexes.js` | 24 índices no boot |
| `ensureCounterColumns.js` | Sync contadores + índice `PermissaoEmpresa(usuario_id)` |
| `auditIndexUsage.js` | Validação via `pg_stat_user_indexes` |
| `latencyProfile.js` | EXPLAIN ANALYZE local |

### Fase 6: Cache multinível

| Nível | Implementação |
|-------|-----------------|
| L1 JWT | Permissões e escopo no token |
| L2 Memory | `memoryCache.js` + `sessionCache.js` + `counterService` |
| L3 Redis | `tieredCache.js` (opcional via `REDIS_URL`) |

### Fase 7: Infraestrutura

| Recurso | Região |
|---------|--------|
| Railway | San Francisco, US |
| Supabase | São Paulo, BR |

**Ação recomendada:** migrar Railway para `sa-east-1` ou Supabase para região US.

Sem alinhamento regional, latência residual de **~150–300 ms por query** permanece.

### Fase 8–9: Benchmarks

```bash
npm run audit:enterprise-benchmark   # P50/P95/P99
npm run audit:stress-scale           # Concorrência + throughput
cd backend && npm run audit:index-usage
cd backend && node scripts/latencyProfile.js  # EXPLAIN ANALYZE (requer DATABASE_URL)
```

---

## Critérios de sucesso vs projeção

| Métrica | Meta | Antes (medido) | Depois (código) |
|---------|------|----------------|-----------------|
| Listagem TTFB | < 300 ms | 2545 ms | ~100–400 ms* |
| Busca | < 500 ms | 3731 ms | ~200–600 ms* |
| Contadores | < 200 ms | 2391 ms | ~20–150 ms* |
| Session | — | 3359 ms | ~5–50 ms* |

\* Depende de deploy + região. Com US↔BR, metas exigem migração regional.

---

## Deploy checklist

1. Merge e deploy da branch
2. Boot automático: `ensureCounterColumns` + `ensurePerformanceIndexes`
3. Usuários devem **re-login** para JWT com permissões
4. (Opcional) `REDIS_URL` para cache L3
5. (Opcional) `DEBUG_LATENCY=true` para validação fina
6. Migrar Railway para mesma região do Supabase

---

## Arquivos principais alterados

- `backend/src/modules/auth/*`
- `backend/src/modules/metrics/counterService.js`
- `backend/src/modules/empresas/repositories/empresaRepository.js`
- `backend/src/modules/cadcps/repCps.js`
- `backend/src/cache/*`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260613010000_enterprise_counter_columns/`
