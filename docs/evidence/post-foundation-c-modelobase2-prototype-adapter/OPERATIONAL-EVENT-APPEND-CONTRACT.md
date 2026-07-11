# Operational Event / Append Contract

`createModeloBase2OperationalEventContract({ moduleId, seed?, clock? })` cria eventos **locais,
append-only e determinísticos** para o draft operacional.

## Event types

`draft.created`, `draft.updated`, `entry.added`, `entry.updated`, `entry.removed`, `draft.saved`,
`draft.submitted.simulated`, `draft.reset`.

## Shape do evento

```
{ kind: 'modelobase2-operational-event',
  eventId, sequence, moduleId, modelId, eventType, operationType, payload,
  status: 'recorded', localOnly: true, sent: false,
  backendTouched: false, prismaTouched: false, runtimeBridgeTouched: false,
  createdAt, actor, parentEventId, checksum, diagnostics }
```

## Sequence

Contador **local crescente** (seed injetável, default 1). `createEvent` aceita `sequence` explícita
(o mutation passa `priorEvents.length + 1`) ou usa o próximo contador interno. `nextSequence()`
expõe o próximo valor.

## Append rules

- Append-only: eventos não são removidos, apenas anexados ao `events[]` do draft.
- `parentEventId` permite encadear (default `null`).
- Cada mutation local anexa exatamente um evento.

## Checksum

Determinístico (FNV-1a via `createGenericModelChecksum`) sobre o conteúdo
`{ modelId, moduleId, eventType, operationType, sequence, payload, parentEventId, createdAt }`.
`eventId = mb2-evt-<moduleId>-<sequence>-<checksum>`. Mesmo seed + mesmo input ⇒ mesmo checksum
(provado em teste).

## localOnly / sent:false

Todo evento é `localOnly: true`, `sent: false`, `backendTouched/prismaTouched/runtimeBridgeTouched:
false`. O clock é injetável (default fixo `2025-01-01T00:00:00.000Z`) — sem `Date.now`.

## Fail-closed

`createEvent` rejeita (throw `MAK-MB2-P-004`) event type desconhecido ou payload inseguro
(sanitizado via `sanitizeGenericModelPayload`).

## Limitações

- Sem transações reais ainda — cada evento é um append local isolado.
- Sem envio/replicação — `sent` permanece `false`; offline-first é passo futuro.
- Sem storage obrigatório — o timeline vive apenas no draft em memória.
