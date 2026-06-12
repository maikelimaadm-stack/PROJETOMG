# Relatório de Performance — Listagens ERP MAK Gestão (100%)

Data: 12/06/2026  
Branch: `cursor/listing-performance-9593`  
Status: **Nível alto — implementação completa nos módulos existentes**

---

## 1. Problemas encontrados (todos endereçados)

| Problema | Status |
|----------|--------|
| Frontend carregava até 500 registros/página | ✅ Corrigido (`MAX_PAGE_SIZE = 200`) |
| Filtros/ordenação client-side na tabela | ✅ Corrigido (server mode Empresas + CADCPS) |
| Navegação prev/next limitada à página atual | ✅ Corrigido (`useServerRecordNavigation`) |
| Export Excel/PDF só da página visível | ✅ Corrigido (`fetchAllListPages` + filtros server) |
| Config campos carregava tudo de uma vez | ✅ Corrigido (paginação server no dialog) |
| Seletor de empresas renderizava todas no DOM | ✅ Corrigido (`ErpEmpresaSelector` + API `/selector`) |
| Login carregava todas empresas | ✅ Corrigido (máx. 50 + `hasMore`) |
| TBLCPS filtros de coluna inoperantes | ✅ Corrigido (`onServerColumnFiltersChange` + backend) |
| Debounce/page sizes inconsistentes | ✅ Corrigido (padrão 25–200, 350ms) |
| Índices PostgreSQL insuficientes | ✅ Migration criada |

---

## 2. Melhorias aplicadas

### Infraestrutura (`src/shared/`)

| Arquivo | Função |
|---------|--------|
| `listing/listQueryConfig.js` | Page sizes 25–200, default 50, debounce 350ms |
| `hooks/useServerListQuery.js` | React Query com placeholderData |
| `hooks/useDebouncedValue.js` | Debounce reutilizável |
| `hooks/useServerRecordNavigation.js` | Prev/next entre páginas no formulário |
| `utils/fetchAllListPages.js` | Export paginado sem estourar memória de uma vez |
| `listing/buildEmpresaListFilters.js` | Filtros painel + coluna → API |
| `listing/buildCadcpsColumnFilters.js` | Filtros coluna CADCPS → API |
| `layouts/ErpEmpresaSelector.jsx` | Combobox com busca server-side |

### Módulos

- **PAGEMP**: listagem, cards, dropdown, export, navegação global, `filterActive`
- **PAGCPS**: listagem, filtros coluna server, navegação global, loading overlay
- **EmpConfiguracaoCamposDialog**: paginação + busca server
- **ErpShell**: seletor de empresa sem renderizar milhares de `<option>`

### Backend

- `GET /api/empresas/selector` — busca paginada para header
- `GET /api/empresas/campos?mode=config` — resposta paginada
- `GET /api/cadcps/campos` — suporte a `filters` JSON
- Auth: empresas limitadas a 50 no login + metadados `total`/`hasMore`
- Migration de índices B-tree, GIN JSONB, pg_trgm

---

## 3. Consultas otimizadas

Todas as listagens usam `skip`/`take` (Prisma) equivalente a `range()`/`limit()`:

```sql
SELECT * FROM "Empresa"
WHERE cliente_id = $1 AND (...filtros/busca...)
ORDER BY codempresa ASC
OFFSET $skip LIMIT $take;
```

Export: loop de páginas de 200 registros até `totalPages`, respeitando filtros ativos.

Dropdown: `pageSize: 10`. Selector header: `pageSize: 30` com busca debounced.

---

## 4. Índices criados

Migration: `backend/prisma/migrations/20260612120000_listing_performance_indexes/migration.sql`

Deploy:
```bash
cd backend && npx prisma migrate deploy
```

---

## 5. Módulos futuros (Produtos, Financeiro, etc.)

Ainda **não existem** no codebase. Ao implementá-los, usar o scaffold atualizado e os hooks em `src/shared/listing/`.

Template scaffold (`PAG__MODULE_ID_PASCAL__.jsx.tpl`) permanece como referência — novos módulos devem copiar o padrão de `PAGEMP.jsx`.

---

## Checklist de verificação

```bash
npm run lint          # ✅
npm run dev           # http://127.0.0.1:5173
cd backend && npm run dev
```

Testar:
1. Empresas — paginar, buscar, cards, prev/next no formulário atravessando páginas
2. Export Excel/PDF — deve incluir todos os registros filtrados (com overlay de progresso)
3. Campos personalizados — filtros de coluna + paginação
4. Config campos — busca + paginação no dialog
5. Header — seletor de empresa com busca (sem travar com muitas empresas)
