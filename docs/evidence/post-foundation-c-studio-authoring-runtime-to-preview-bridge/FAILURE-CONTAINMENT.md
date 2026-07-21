# Failure Containment

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Contencao (`createBridgeFailureContainment.js`)

Falhas sao **contidas, nao propagadas**:

- Qualquer bloqueador => `status = bridge_blocked`, `targetDescriptor = null`.
- Nenhuma excecao vaza para o chamador no caminho de validacao — problemas viram `issues` estruturadas.
- Erros de uso programatico (entrada nao-objeto) sao normalizados via `normalizeBridgeInput`/`errors.js`.

## Determinismo da falha

Para a mesma entrada invalida, o conjunto e a ordem de `issues` sao identicos a cada execucao —
comportamento fail-closed e reproduzivel.
