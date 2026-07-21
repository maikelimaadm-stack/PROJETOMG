# Strict Draft Identity

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Politica (`STRICT_DRAFT_IDENTITY_POLICY`)

`validateStrictDraftIdentity.js` exige um `expectedDraftId` explicito e nao-vazio, comparado por
identidade estrita (`===`) com `sourceHandoff.draftId`.

- **Sem fallback de rascunho unico.** A ponte nunca chama `findDraft` nem assume "o unico draft".
- `expectedDraftId` ausente/vazio => bloqueador `BRIDGE_EXPECTED_DRAFT_ID_MISSING`.
- `expectedDraftId !== draftId` => bloqueador `BRIDGE_DRAFT_IDENTITY_MISMATCH`.
- Em sucesso, o `candidateDraftId` e ecoado na decisao para rastreabilidade.

## Motivacao

Impede que a ponte "adivinhe" o rascunho e vaze um alvo para o handoff errado. A identidade e sempre fornecida
externamente e verificada, nunca inferida.
