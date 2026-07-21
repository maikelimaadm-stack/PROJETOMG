# Prototype Relink Prohibition

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Proibicao (`createBridgePrototypeRelinkProhibition.js`, `FORBIDDEN_PROTOTYPE_PATHS`)

A ponte **nunca** re-liga o antigo prototipo Studio:
`src/studio/{components,shell,designers,pages,navigation,dock,panels,editor}`.

- `prototype_reference_validation` bloqueia qualquer referencia a esses caminhos.
- O gate faz varredura estatica confirmando ausencia de import/mencao a caminhos de prototipo.
- Nenhum wiring de App/rota/menu e introduzido.

## Resultado

A superficie da ponte e isolada da arvore de prototipo legada; nao ha caminho de reativacao acidental.
