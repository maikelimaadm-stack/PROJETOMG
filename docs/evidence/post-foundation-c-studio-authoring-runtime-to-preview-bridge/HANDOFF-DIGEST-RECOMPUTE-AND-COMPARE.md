# Handoff Digest — Recompute and Compare

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Estrategia

`recomputeAndValidateHandoffDigest.js` **recalcula e compara** — nunca confia no digest recebido.

1. Constroi `core` = handoff menos o campo `handoffDigest`.
2. Recalcula `createDeterministicDigest(core)` reutilizando o helper do Authoring Runtime
   (FNV-1a -> `fnv1a-` + 8 hex sobre `stableSerialize` com chaves ordenadas).
3. Compara com o `handoffDigest` fornecido.

- Igual => ok. Diferente => bloqueador `BRIDGE_HANDOFF_DIGEST_MISMATCH` (adulteracao detectada).
- `handoffDigest` ausente/malformado => bloqueador deterministico.

## Reuso canonico

Nenhum serializer/digest paralelo e implementado — a ponte importa `stableSerialize` e
`createDeterministicDigest` do runtime, garantindo byte-igualdade com a origem.
