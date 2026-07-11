# Operational Session & State Machine

## Session shape

`createModeloBase2OperationalSession({ runtimeId, moduleId, clock })` — controlador local com estado
interno (draft + event log + status) e métodos:

- `dispatch(command)` — dirige o ciclo (command = `{ commandType, payload }` ou string)
- `getState()` — snapshot seguro `{ sessionId, runtimeId, modelId, moduleId, modelType, status,
  draft, eventLog, readState, diagnostics, localOnly, sent, persistenceReal, ...Touched:false }`
- `getReadState()`, `getEventLog()`, `getDiagnostics()`
- `createSnapshot()`, `restoreSnapshot(snapshot)`, `reset()`

Invariantes: `localOnly:true`, `sent:false`, `persistenceReal:false`,
`backend/prisma/runtimeBridge Touched:false`.

## Estados (10)

`idle`, `draft`, `dirty`, `valid`, `invalid`, `saved_local`, `submitted_simulated`, `reset`,
`blocked`, `fallback`.

## Transições

| de | comando | para |
|---|---|---|
| idle | createDraft | draft |
| draft/dirty/valid/invalid/saved_local | appendEntry/updateEntry/removeEntry/updateDraft | dirty |
| dirty | validateDraft (ok) | valid |
| dirty | validateDraft (fail) | invalid |
| valid/dirty/saved_local | saveDraft | saved_local |
| invalid | saveDraft | saved_local (**com warning**) |
| saved_local | submitDraft | submitted_simulated |
| any | resetDraft | reset |
| any | fallback | fallback |
| any | comando inválido/perigoso | blocked |
| — | createSnapshot/restoreSnapshot/inspectDiagnostics | (não-mutante) |

## Regras

- `validateDraft`: **inválido** se não houver entries, se houver entry `status:'invalid'`, ou se o
  payload trouxer `forceInvalid:true`; caso contrário **válido**.
- `saveDraft` a partir de `invalid` é **permitido com warning** (documentado).
- `submitDraft` exige `saved_local`.
- Comando **blocked** é **reportado** no resultado e registrado no event log (`command.blocked`),
  mas **não** é comitado como estado persistente da sessão — a sessão continua utilizável.
- `dispatch` nunca muta o comando de entrada; retornos são cópias seguras.
- clock/seed injetáveis; determinístico.

## blocked / fallback

- `blocked`: comando desconhecido, payload inseguro, target proibido ou transição inválida →
  `ok:false`, sem side effect.
- `fallback`: gerado via `createModeloBase2OperationalRuntimeFallback` (generic fallback + rollback
  plan passivo).

## Limitações

- Não é workflow real; é uma máquina de estado local para o ciclo de rascunho operacional.
- `blocked` não é um estado terminal comitado (escolha de design para manter a sessão usável).
