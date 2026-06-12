# Relatório de Performance — Listagens ERP MAK Gestão

Data: 12/06/2026  
Branch: `cursor/listing-performance-9593`

Este documento resume a auditoria de performance das listagens do ERP, as melhorias aplicadas e os débitos técnicos remanescentes.

---

## 1. Problemas encontrados

### Críticos (corrigidos nesta entrega)

| Problema | Módulo | Impacto |
|----------|--------|---------|
| Listagem principal podia solicitar até **500 registros** por página | Backend Empresas | Memória e latência elevadas com bases grandes |
| Filtros de coluna executados **no frontend** (somente página atual) | TBLEMP / TBLCPS | Resultados incorretos e falsa sensação de filtro |
| Ordenação client-side em modo servidor | TBLEMP / TBLCPS | Ordenação limitada à página visível |
| Cards e dropdown sem debounce consistente | PAGEMP / PAGCPS | Requisições a cada tecla |
| Page sizes inconsistentes (`[25,50,100]` vs padrão ERP) | SRCHEMP, paginação | UX divergente do padrão 25–200 |
| Campos config carregava **500 registros** de uma vez | `empresaRepository.listCampos` | Pico de memória no diálogo de campos |
| Prefetch React Query com **queryKey incompleta** | AuthContext | Cache miss na 1ª navegação pós-login |
| Ausência de overlay de loading na paginação | TBLCPS | UX inferior ao módulo Empresas |
| Índices insuficientes para busca ILIKE e JSONB | PostgreSQL | Full scan em tabelas >100k linhas |

### Médios (parcialmente endereçados)

| Problema | Status |
|----------|--------|
| Navegação prev/next no formulário limitada à **página atual** em server mode | Pendente |
| `EmpConfiguracaoCamposDialog` carrega todos os campos sem paginação | Pendente |
| Filtros de coluna CadCPS ainda **client-side** (sem `onServerColumnFiltersChange`) | Pendente |
| Módulos futuros (Produtos, Fornecedores, Estoque, Financeiro, Fiscal) **não existem** ainda | Aguardando implementação |
| Template scaffold não adota `useServerListQuery` | Pendente |

### Baixos

| Problema | Status |
|----------|--------|
| Helpers mortos `filterEmpresasContains` / `paginateEmpresasList` | Mantidos como reexport/legado |
| `hasActiveFilters` calculado mas não ligado ao ícone de filtro | Calculado; UI do botão ainda sem estado ativo |

---

## 2. Melhorias aplicadas

### Infraestrutura compartilhada (`src/shared/`)

| Arquivo | Função |
|---------|--------|
| `listing/listQueryConfig.js` | Opções **25/50/100/150/200**, default **50**, max **200**, debounce **350ms**, stale/gc cache |
| `hooks/useDebouncedValue.js` | Debounce reutilizável para campos de busca |
| `hooks/useServerListQuery.js` | React Query padrão com `placeholderData`, `isInitialLoading`, `isPageFetching` |
| `utils/normalizeSearchQuery.js` | Normalização trim + colapso de espaços |
| `listing/buildEmpresaListFilters.js` | Painel lateral + filtros de coluna → payload API |

### Backend

- **`MAX_PAGE_SIZE = 200`** em `empresaRepository.js` e `repCps.js`
- Filtros expandidos: `contains`, `equals`, `number`, `__in` para multi-seleção
- Filtro `filters.ids` para favoritos
- Busca server-side em ~15 campos + JSONB `campos_personalizados`
- **`listCampos` config**: pageSize reduzido de 500 → **200**

### Frontend — Empresas (`PAGEMP`)

- Listagem principal via `useServerListQuery` (paginação, busca, sort, filtros no servidor)
- Dropdown de pesquisa: preview **10 registros**, busca debounced **350ms**
- Filtros do painel aplicados no **Aplicar** (não a cada keystroke)
- Filtros de coluna delegados ao servidor via `onServerColumnFiltersChange`
- Cards (`SRCHEMP`) reutilizam mesma query paginada da tabela
- Overlay **"Carregando registros..."** na paginação (tabela + cards)

### Frontend — Campos personalizados (`PAGCPS`)

- `useServerListQuery` + debounce na busca
- Overlay de loading na paginação (`isFetchingCampos`)
- Modo servidor na tabela (sem filtro/ordenação client-side)

### Paginação

- `EmpTablePagination` usa `LIST_PAGE_SIZE_OPTIONS` compartilhado
- `SRCHEMP` alinhado ao padrão **25–200**

### Cache React Query

| Query key | staleTime | Uso |
|-----------|-----------|-----|
| `emp-cadastro` | 30s | Listagem empresas |
| `cadcps-campos` | 30s | Campos personalizados |
| `emp-cadastro-dropdown` | 30s | Preview dropdown |
| `metrics-contadores` | ∞ | Contadores globais |
| Prefetch pós-login | 60s | 1ª página empresas + campos |

### UX de carregamento

- Skeleton/loading inicial (`isInitialLoading`)
- Overlay em refetch de página (`isPageFetching`)
- Empty states existentes preservados
- Paginação desabilitada durante fetch (`isBusy`)

---

## 3. Consultas otimizadas

### Empresas — listagem paginada

```sql
-- Equivalente Prisma (empresaRepository.list)
SELECT * FROM "Empresa"
WHERE cliente_id = $1
  AND (razao_social ILIKE $2 OR nome_fantasia ILIKE $2 OR ... OR id IN (...))
  AND status = $3  -- filtros opcionais
ORDER BY codempresa ASC
OFFSET $skip LIMIT $take;

SELECT COUNT(*) FROM "Empresa" WHERE ...;  -- apenas quando necessário para totalPages
```

**Parâmetros padrão:** `page=1`, `pageSize=50`, `skip=0`, `take=50`

### Campos personalizados — listagem paginada

```sql
SELECT * FROM "CadCpsCampo"
WHERE cliente_id = $1
  AND (nome ILIKE $2 OR field_name ILIKE $2 OR codigo = $3)
ORDER BY codigo ASC
OFFSET $skip LIMIT $take;
```

### Dropdown de pesquisa (preview)

- `pageSize: 10` — nunca carrega listagem completa
- Probe de favoritos: `pageSize: 1` + `filters.ids`

### Anti-patterns eliminados

- ~~`findMany` sem skip/take no frontend~~
- ~~`filter()` / `sort()` em arrays grandes no React~~
- ~~pageSize 500 no backend~~

---

## 4. Índices recomendados e criados

Migration: `backend/prisma/migrations/20260612120000_listing_performance_indexes/migration.sql`

### Índices B-tree (Prisma schema + SQL)

| Tabela | Índice | Uso |
|--------|--------|-----|
| `Empresa` | `(cliente_id, nome_fantasia)` | Filtro + sort |
| `Empresa` | `(cliente_id, cpf_cnpj)` | Busca documento |
| `Empresa` | `(cliente_id, cidade)` | Filtro cidade |
| `Empresa` | `(cliente_id, estado)` | Filtro UF |
| `Empresa` | `(cliente_id, updatedAt)` | Ordenação por data |
| `CadCpsCampo` | `(cliente_id, nome)` | Busca |
| `CadCpsCampo` | `(cliente_id, field_name)` | Busca técnica |
| `CadCpsCampo` | `(cliente_id, codigo)` | Sort + filtro |
| `Cliente` | `nome`, `cpf_cnpj`, `status`, `ativo` | Admin futuro |
| `CadastroRegistro` | `(cliente_id, codigo)`, `(cliente_id, status)` | Cadastros genéricos |

### Índices especiais (SQL raw)

| Tipo | Tabela | Campo | Uso |
|------|--------|-------|-----|
| **GIN jsonb_path_ops** | `Empresa` | `campos_personalizados` | Busca em campos custom |
| **GIN pg_trgm** | `Empresa` | `razao_social`, `nome_fantasia`, `cpf_cnpj` | ILIKE `%termo%` |
| **GIN pg_trgm** | `CadCpsCampo` | `nome` | ILIKE `%termo%` |

### Prioridade para módulos futuros

Quando Produtos, Fornecedores, Estoque, Financeiro e Fiscal forem implementados, criar índices compostos:

```
(cliente_id, nome)
(cliente_id, codigo)
(cliente_id, cpf_cnpj)
(cliente_id, status)
(cliente_id, categoria_id)
(cliente_id, createdAt)
(cliente_id, produto_id)   -- FKs de relacionamento
(cliente_id, fornecedor_id)
(cliente_id, cliente_id)   -- quando aplicável
```

---

## 5. Telas que ainda necessitam otimização

| Tela / Componente | Prioridade | Ação necessária |
|-------------------|------------|-----------------|
| `EmpConfiguracaoCamposDialog` | Alta | Paginação server-side na listagem de campos (modo config) |
| Navegação de registro (form prev/next) | Média | Buscar registro adjacente via API ou cursor server-side |
| `TBLCPS` filtros de coluna | Média | Implementar `onServerColumnFiltersChange` + backend |
| Template scaffold (`PAGTemplate`) | Média | Adotar `useServerListQuery` e page sizes padrão |
| `idGlobalService` / scripts admin | Baixa | `findMany` sem paginação — OK para jobs batch |
| Produtos, Fornecedores, Estoque, Financeiro, Fiscal | — | Módulos não implementados; aplicar padrão desde o scaffold |
| Botão filtro (`MgActionBar`) | Baixa | Indicador visual quando `hasActiveFilters === true` |
| Exportação Excel/PDF | Média | Garantir export via API paginada/stream, não array em memória |

---

## Padrão obrigatório para novos módulos

```javascript
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useServerListQuery } from "@/shared/hooks/useServerListQuery";
import {
  LIST_DEFAULT_PAGE_SIZE,
  LIST_SEARCH_DEBOUNCE_MS,
} from "@/shared/listing/listQueryConfig";

const debouncedSearch = useDebouncedValue(searchDraft, LIST_SEARCH_DEBOUNCE_MS);

const { items, total, isInitialLoading, isPageFetching } = useServerListQuery({
  queryKey: ["modulo", page, pageSize, debouncedSearch, sortKey, sortDir, filtersKey],
  queryFn: () => repository.listPage({ page, pageSize, search: debouncedSearch, ... }),
});
```

**Backend:** sempre `skip`/`take` (Prisma) ou `range()` (Supabase), `MAX_PAGE_SIZE = 200`, filtros no WHERE, ORDER BY no banco.

---

## Verificação

```bash
npm run lint
npm run dev                    # frontend em http://127.0.0.1:5173
cd backend && npm run dev      # API local (opcional)
```

Testar manualmente:
1. Empresas → paginar 25/50/100/150/200 com overlay de loading
2. Busca global → resultados de todo o banco, não só da página
3. Cards ↔ Tabela → mesmos dados paginados
4. Campos personalizados → busca com debounce + paginação

Deploy da migration:
```bash
cd backend && npx prisma migrate deploy
```
