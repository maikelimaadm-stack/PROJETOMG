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

## Tabela de isolamento (unitários)

| Cenário | Usuário A | Usuário B | Usuário C (outro tenant) | Status |
| ------- | --------- | --------- | ------------------------ | ------ |
| localStorage scoped | Telefone oculto | Não herda A | N/A | PASS (unit) |
| PUT individual | Persiste A | Persiste B | Persiste C | PASS (memory repo) |
| Leitura cruzada | — | Não lê A | Não lê A/B | PASS |
| Body malicioso `usuario_id` | — | Rejeitado 400 | — | PASS |
| Query key por user+cliente | — | — | — | PASS (impl) |
| Eventos entre abas | Filtra por scope | Filtra por scope | — | PASS (unit) |

## Itens não concluídos (requer staging/manual)

| Item | Motivo |
| ---- | ------ |
| E2E real Usuário A/B/C no browser | Requer backend staging + credenciais de 3 usuários |
| Migration deploy Railway staging | Sem `RAILWAY_TOKEN` no ambiente cloud |
| Evidência visual reload/logout/nova aba | Pendente E2E staging |
| Lançamentos (módulo separado) | Usa mesmo padrão de scope quando integrado a preferências remotas |

## Critério de aprovação

**Não emitido** — E2E real com Usuário A/B/C em staging e migration deploy pendentes.

Frase de aprovação só após E2E staging completo:

```text
Preferências agora são isoladas corretamente por cliente, usuário, módulo e tela. Um usuário não lê, não recebe e não sobrescreve preferências de outro usuário.
```
