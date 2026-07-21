# Resource Limit Enforcement

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Limites da ponte (`enforceBridgeResourceLimits.js` + `resolveBridgeLimits`)

Consome `DEFAULT_BRIDGE_RESOURCE_LIMITS` e `BRIDGE_RESOURCE_LIMIT_DIMENSIONS` do Plano de Implementacao.

- Os limites da ponte sao **mais estritos** que os do runtime (coerencia intencional, nao-silenciosa).
- Violacao => bloqueador deterministico; **nenhum alvo parcial**.
- Incoerencia entre limites da ponte e do runtime e sinalizada explicitamente, nao mascarada.

## Dimensoes

Cada dimensao em `BRIDGE_RESOURCE_LIMIT_DIMENSIONS` e verificada; exceder qualquer uma bloqueia a ponte
com o codigo correspondente.
