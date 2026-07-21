# Replay & Idempotency

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Contrato de replay (`createBridgeReplayContract.js`)

- `execute()` e idempotente: mesma entrada => mesma `bridgeDecision`.
- O replay e **byte-equivalente** (verificado por igualdade profunda e por igualdade de digest da decisao,
  `createBridgeDecisionDigest.js`).
- A fonte nunca e mutada; a decisao e o alvo sao deep-frozen, impossibilitando alteracao pos-retorno.

## Sem estado global

A fabrica (`createStudioAuthoringRuntimeToPreviewBridge.js`) **nao** mantem singleton global. Instancias
distintas sao independentes; a configuracao e deep-frozen na construcao.
