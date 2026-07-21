# Bridge Overview Report

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## O que a ponte faz

`execute({ sourceHandoff, expectedDraftId })` -> `{ bridgeDecision }`.

A `bridgeDecision` contem: status (`bridge_ready` | `bridge_blocked`), lista deterministica e ordenada de
`issues`, o `targetDescriptor` (`module_preview_sandbox_candidate`, deep-frozen) somente quando pronta, o
`candidateDraftId` ecoado da identidade estrita, o digest da decisao e o contrato de replay.

## Fluxo de alto nivel

1. Recebe o handoff real (20 campos) e o `expectedDraftId` esperado.
2. Clona a entrada (a fonte nunca e mutada).
3. Executa o pipeline deterministico de 13 estagios (`BRIDGE_VALIDATION_STAGES`).
4. Se algum estagio emite bloqueador => contem a falha (alvo nulo) e retorna decisao bloqueada.
5. Caso contrario, executa os mapeamentos de campo declarados pelo contrato e monta o descritor-alvo.
6. Congela profundamente a decisao e o alvo; calcula digest; devolve contrato de replay.

## Identidade

- `BRIDGE_NAME` = `studio-authoring-runtime-to-preview-bridge`
- `BRIDGE_VERSION` = `studio-authoring-runtime-to-preview-bridge@1.0.0`
- `BRIDGE_MODE` = `headless_authoring_runtime_to_preview_bridge`
- `SOURCE_HANDOFF_VERSION` = `authoring-preview-handoff@1.0.0`
