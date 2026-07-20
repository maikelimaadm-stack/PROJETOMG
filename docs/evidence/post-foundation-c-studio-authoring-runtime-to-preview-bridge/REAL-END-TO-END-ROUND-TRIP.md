# Real End-to-End Round-Trip

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Round-trip real (sem mock no caminho principal)

O teste dirige a **API real** do Authoring Runtime para produzir handoffs genuinos:
`createAuthoringRuntimeSession` -> `executeAuthoringOperation` -> `createSyntheticPreviewHandoff`,
e entao alimenta a ponte com `{ sourceHandoff, expectedDraftId }`.

## Verificacoes do round-trip

- Handoff valido => `status = bridge_ready`, `targetDescriptor` frozen, `candidateDraftId === draftId`.
- `sourceHandoff` **nao** e mutado apos `execute()`.
- Replay => decisao deep-equal e digest-equal.
- Adulteracoes rejeitadas: id mismatch, id ausente, digest tamper, alias legado, versao divergente,
  `realDataAttached`/`productExposed`/`previewMounted` verdadeiros.

Cobertura >=700 cenarios reais de round-trip (numerados + series D e E).
