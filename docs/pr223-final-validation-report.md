# PR #223 — Relatório de Validação Final

Branch: `cursor/user-preferences-isolation-7d24`  
PR: https://github.com/maikelimaadm-stack/PROJETOMG/pull/223

---

## Etapa 1 — Migration e schema staging

### Evidência Prisma (código)

Model `UsuarioPreferencia` em `backend/prisma/schema.prisma`:

- `usuario_id String` (NOT NULL)
- `@@unique([cliente_id, usuario_id, modulo, tela])`
- `@@index([cliente_id, usuario_id])`

Migration `20260624140500_user_screen_preferences` cria:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS "UsuarioPreferencia_cliente_usuario_modulo_tela_key"
  ON "UsuarioPreferencia"("cliente_id", "usuario_id", "modulo", "tela");
```

### Checklist staging

| # | Verificação | Status |
| - | ----------- | ------ |
| 1 | Tabela existe | **PENDENTE** — `validatePreferencesSchemaEvidence.js` |
| 2 | `usuario_id NOT NULL` | **PENDENTE** |
| 3 | UNIQUE 4 colunas | **PENDENTE** |
| 4 | Índice leitura | **PENDENTE** |
| 5 | Sem UNIQUE antigo tenant-only | **PENDENTE** |
| 6 | `prisma migrate deploy` | **PENDENTE** |
| 7 | Railway staging boot | **PENDENTE** |
| 8 | Healthcheck | **PARCIAL** — produção OK, staging PR #223 não confirmado |

Healthcheck produção (referência, não substitui staging):

```json
{"ok":true,"db":{"connected":true}}
```

---

## Etapa 2 — E2E A, B, C

| Usuário | Tenant | Produção | Mock E2E |
| ------- | ------ | -------- | -------- |
| A | Tenant 1 | maike/maike OK | PASS |
| B | Tenant 1 | userb inexistente | PASS (mock) |
| C | Tenant 2 | tenant2 inexistente | PASS (mock) |

PUT em produção com `usuario_id`: HTTP **200** (PR #223 backend **não deployado** em produção).

Mock valida: PUT sem `cliente_id`/`usuario_id`; prefs A/B distintas; chaves scoped separadas.

---

## Etapa 3 — Troca de sessão

| Troca | React Query | localStorage | GET | Snapshot | PUT indevido | Status |
| ----- | ----------- | ------------ | --- | -------- | ------------ | ------ |
| A → B | Reload | Scoped user-b | Token B | Prefs B | Não | Mock PASS |
| B → C | Reload | tenant-2 | Token C | Default | Não | Mock PASS |
| C → A | Reload | Scoped user-a | Token A | Prefs A | Não | Mock PASS |

Real staging: **PENDENTE**.

---

## Etapa 4 — Eventos entre abas

- Eventos incluem `clienteId`, `userId`, `version: "v2"`: **Mock PASS**
- Aba B não recebe eventos de A após troca: **Mock PASS**

---

## Etapa 5 — Legacy `emp_*`

- Fallback somente leitura: **Unit PASS**
- B não migra legacy compartilhado: **Mock PASS**
- Primeira escrita gera chave scoped: **Mock PASS**

---

## Etapa 6 — Lançamentos (Empresas listagem)

Todas as prefs `emp_*` / `erp_*` de listagem/cards/filtros/form passam por `mg_pref_v2:{clienteId}:{userId}:empresas:listagem:{field}` ou `cadastro:{clienteId}:{userId}:emp:form_layout_config`. Backend: `empresas/listagem` e `empresas/form_layout`.

### Ainda NÃO isoladas nesta PR

| Preferência | Chave | Backend | Risco |
| ----------- | ----- | ------- | ----- |
| CadCPS colunas | `cps_col_*` | Não | Alto |
| Tema ERP | `erp_tema` | Não | Baixo |
| Export config | por módulo | Não | Médio |

**Isolamento completo do sistema: não declarado.**

---

## Etapa 7 — Comandos

```bash
npm run test:preferences:frontend
cd backend && npm run test:preferences:backend
npm run lint && npm run build
npm run test:preferences:isolation-mock
DATABASE_URL=... npm run test:preferences:schema-evidence
VALIDATE_BASE_URL=... npm run test:preferences:isolation-api
```

---

## Critério final

**Frase de aprovação NÃO emitida.**

Pendências: deploy staging PR #223, SQL evidência, E2E real A/B/C, CadCPS fora de escopo.
