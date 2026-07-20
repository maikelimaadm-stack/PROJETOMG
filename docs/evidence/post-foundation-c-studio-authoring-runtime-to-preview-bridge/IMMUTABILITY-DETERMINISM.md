# Immutability & Determinism

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Imutabilidade

- `deepFreeze.js` congela profundamente configuracao, decisao e descritor-alvo.
- `execute()` clona as entradas antes de qualquer uso — `sourceHandoff` original permanece intacto.

## Determinismo

- Nenhuma fonte de nao-determinismo: sem `Date.now()`, sem `Math.random`, sem I/O, sem rede.
- O verificador (`verifyAuthoringRuntimeToPreviewBridge.js`) contem a regex de deteccao de nao-determinismo;
  as varreduras de determinismo do gate **excluem** esse arquivo para nao casar com a propria regex.
- Ordenacao estavel de `issues` e serializacao canonica garantem saida reproduzivel.
