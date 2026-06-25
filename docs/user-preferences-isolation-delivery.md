# Entrega — Isolamento de preferências por usuário

Branch: `cursor/user-preferences-isolation-7d24`

## Chave única

| Camada | Antes | Depois |
| ------ | ----- | ------ |
| PostgreSQL | `UNIQUE(cliente_id, usuario_id, modulo, tela)` (já existia) | Mantido |
| localStorage listagem | `emp_col_visiveis`, `emp_col_ordem`, … (compartilhado) | `mg_pref_v2:{clienteId}:{userId}:{modulo}:{tela}:{field}` |
| localStorage formulário | `cadastro:{userId}:emp:…` | `cadastro:{clienteId}:{userId}:emp:…` |
| React Query bootstrap | `["user-preferences-bootstrap", userId]` | `["user-screen-preferences", clienteId, userId, "bootstrap"]` |

## Estratégia de migração

- **Banco**: sem duplicação automática; registros legados permanecem por `usuario_id`.
- **localStorage legado (`emp_*`)**: fallback **somente leitura**; escrita sempre em chave scoped.
- **Removido**: upload automático de localStorage compartilhado para backend no login de outro usuário (`migrateLocalPreferencesIfNeeded` agora só migra dados **scoped** do próprio usuário).

## Payload real

### GET bootstrap

```http
GET /api/user/preferences/bootstrap
Authorization: Bearer <token>
```

Resposta (por usuário autenticado):

```json
{
  "preferences": [
    {
      "modulo": "empresas",
      "tela": "listagem",
      "versao_schema": 1,
      "preferencias": { "version": 1, "table": { "visibleColumns": ["codempresa"] } },
      "updatedAt": "2026-06-24T20:00:00.000Z"
    }
  ]
}
```

### PUT preferência

```http
PUT /api/user/preferences/empresas/listagem
Authorization: Bearer <token>
Content-Type: application/json

{
  "versao_schema": 1,
  "preferencias": {
    "version": 1,
    "table": { "visibleColumns": ["codempresa", "telefone"] }
  },
  "expectedUpdatedAt": "2026-06-24T20:00:00.000Z"
}
```

Campos **rejeitados** no body (400): `usuario_id`, `userId`, `cliente_id`, `clienteId`, `tenant_id`, `tenantId`.

## Arquivos principais alterados

| Arquivo | Alteração |
| ------- | --------- |
| `src/shared/preferences/userPreferencesScope.js` | Escopo ativo + builder de chaves |
| `src/modules/empresas/preferences/empresasPreferencesCache.js` | Read/write scoped + eventos com user/cliente |
| `src/modules/empresas/preferences/empresasPreferencesStorage.js` | Migração scoped-only |
| `src/modules/empresas/preferences/useEmpresasPreferencesBootstrap.js` | Query key completa |
| `src/shared/contexts/AuthContext.jsx` | Set/clear scope no login/logout |
| `src/framework/cadastro-engine/core/CadastroModuleConfig.js` | Layout key com clienteId |
| `backend/src/modules/preferences/routes.js` | Rejeita identity fields no body |
| `backend/scripts/testPreferencesUserIsolation.js` | Testes de isolamento |
| `scripts/tests/user-preferences-scope.unit.mjs` | Testes frontend |

## Testes executados

| Teste | Resultado |
| ----- | --------- |
| `npm run test:preferences:frontend` | PASS |
| `backend npm run test:preferences:backend` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `npm run test:preferences:isolation-mock` (Etapas 2–5) | **PASS (5/5)** |

## Tabela de isolamento (mock E2E + unitários)

| Cenário | Usuário A | Usuário B | Usuário C (outro tenant) | Status |
| ------- | --------- | --------- | ------------------------ | ------ |
| localStorage scoped | Telefone oculto / cards | Não herda A / table+email | Tenant isolado | **Mock PASS** |
| PUT individual | Persiste A | Persiste B | Persiste C | PASS (memory repo) |
| PUT sem IDs sensíveis | — | — | — | **Mock PASS** |
| Troca sessão A→B→C→A | Restaura prefs A | Prefs B | Prefs C | **Mock PASS** |
| Eventos entre abas | Filtra por scope | Não recebe de A | — | **Mock PASS** |
| Legacy `emp_*` read-only | — | Scoped só após ação | — | **Mock PASS** |
| Leitura cruzada | — | Não lê A | Não lê A/B | PASS |
| Body malicioso `usuario_id` | — | Rejeitado 400 (branch) | — | PASS (unit) |

## Itens pendentes (requer staging/manual)

| Item | Motivo |
| ---- | ------ |
| SQL evidência staging (`validatePreferencesSchemaEvidence.js`) | `DATABASE_URL` ausente no cloud |
| E2E real Usuário A/B/C contra staging | Produção só tem `maike/maike`; backend produção ainda aceita `usuario_id` no PUT |
| Migration deploy Railway staging PR #223 | Sem `RAILWAY_TOKEN` |
| CadCPS `cps_col_*` | Fora de escopo desta PR — ainda compartilhado |

Relatório completo: `docs/pr223-final-validation-report.md`

## Critério de aprovação

**Não emitido** — evidência SQL/staging e E2E real A/B/C pendentes; CadCPS não isolado.
