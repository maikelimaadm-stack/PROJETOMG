# Command & Event Log

## Comandos (12)

`createDraft`, `updateDraft`, `appendEntry`, `updateEntry`, `removeEntry`, `validateDraft`,
`saveDraft`, `submitDraft`, `resetDraft`, `createSnapshot`, `restoreSnapshot`, `inspectDiagnostics`.

`resolveModeloBase2OperationalCommand({ commandType, moduleId, payload })` → `{ ok, command, errors }`.
Cada comando resolvido: `{ commandId, commandType, operation, eventType, moduleId, modelId, payload,
localOnly, sent:false, persistenceReal:false, expectedState, safety, diagnostics }`. Comando
desconhecido → `ok:false` (fail-closed).

## Validação de payload

`validateModeloBase2OperationalCommandPayload` (fail-closed) bloqueia: commandType desconhecido;
payload não-objeto quando exigido (appendEntry/updateEntry/restoreSnapshot); função/handler/elemento
React/prototype pollution; target proibido (`backend`/`prisma`/`runtimebridge`/`fetch`/`api`/
`storage`/`database`/`db`); `writeMode` ≠ `localOnly`; `persistenceReal:true`; `sent:true`. Retorna
`sanitizedPayload` (funções removidas, sensíveis mascarados).

## Eventos (13)

`draft.created`, `draft.updated`, `entry.added`, `entry.updated`, `entry.removed`,
`draft.validated`, `draft.saved`, `draft.submitted.simulated`, `snapshot.created`,
`snapshot.restored`, `draft.reset`, `command.blocked`, `fallback.applied`.

## Event log

`createModeloBase2OperationalEventLog({ moduleId, seed, clock })`:

- `append(input)` — cria um evento determinístico (assigns `sequence`, `createdAt`, `checksum`) e
  armazena; retorna cópia segura. Fail-closed em event type desconhecido ou payload inseguro.
- `list()`, `getLast()`, `getById(eventId)`, `clear()`, `deriveSummary()`, `nextSequence()`, `size`.

### Regras

- **sequence** crescente local (seed injetável).
- **append-only**: delete físico apenas via `clear()`/reset local.
- eventos retornados como **cópia** (mutar o retorno não altera o log).
- **checksum** FNV-1a determinístico sobre o conteúdo do evento; muda quando o evento muda.
- `sent:false`, `localOnly:true`, `backend/prisma/runtimeBridge Touched:false` em todo evento.
- clock injetável (default fixo `2025-01-01T00:00:00.000Z`) — sem `Date.now`.

## Shape do evento

```
{ kind:'modelobase2-operational-runtime-event', eventId, sequence, moduleId, modelId, eventType,
  operationType, payload, parentEventId, createdAt, status:'recorded', localOnly:true, sent:false,
  backendTouched:false, prismaTouched:false, runtimeBridgeTouched:false, checksum }
```

## Limitações

- Sem transações reais — cada evento é um append local isolado.
- Sem envio/replicação (`sent:false`); offline-first é passo futuro.
