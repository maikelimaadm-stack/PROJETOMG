# Fuel Runtime Compatibility

## ModeloBase2 Operational Runtime (reutilizado)

- `createModeloBase2OperationalRuntime` + `createSession` — o fuel adapter possui um runtime + session.
- `applyModeloBase2OperationalCommand` (via `session.dispatch`) — dirige o ciclo.
- **State machine** — o fuel herda idle→draft→dirty→valid/invalid→saved_local→submitted_simulated→reset.
- **Event log** — o fuel event mapper mapeia os eventos operacionais append-only para eventos fuel.
- **Command resolver** — o fuel command mapper mapeia comandos fuel → operacionais (fail-closed).
- **Snapshot bridge** — o fuel snapshot embrulha o snapshot genérico (roundtrip in-memory).
- **Diagnostics / fallback** — reaproveitados e projetados para o domínio fuel.

## Generic Model Runtime (reutilizado)

- `createGenericModelChecksum` (event mapper), `createGenericModelSnapshot`/
  `validateGenericModelSnapshot`/`createGenericModelInMemoryAdapter` (snapshot),
  `sanitizeGenericModelPayload`/`detectGenericModelUnsafeMarkers` (payload validation),
  `createGenericModelDiagnostics`/`createGenericModelFallback`/`createGenericModelRollbackPlan`.

## Limites

- O fuel é uma **camada de domínio** sobre o runtime — não duplica nem altera o runtime/kernel.
- Sem UI/rota/menu/src-modules; sem backend/Prisma/fetch/runtimeBridge/React/DOM.
- Sem persistência real; eventos nunca enviados.
- Domínio mínimo (sem financeiro/estoque/device/sync).

## Invariantes provados (teste + gate)

`localOnly:true`, `sent:false`, `persistenceReal:false`,
`backend/prisma/runtimeBridge Touched:false`, dangerous capabilities false; retornos são cópias
seguras; sem mutação de input; fail-closed em comando/payload/target inseguro.
