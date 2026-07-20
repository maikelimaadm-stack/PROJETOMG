# SSOT / Certification / Module Boundary

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Fronteira de SSOT (`createBridgeSsotBoundary.js`, `validateSourceSsotBoundary.js`)

- O blueprint certificado permanece a **SSOT canonica**; a ponte e somente-leitura sobre ele.
- Nenhum arquivo em `docs/runtime-implementation/` e alterado.
- A ponte **nao** gera modulo, **nao** registra modulo, **nao** certifica nada.

## Fronteira de certificacao

- `certification_boundary_validation` garante que a ponte nao atravessa para o dominio de certificacao.
- O alvo e um **candidato** de sandbox de preview (metadados), jamais um artefato certificado ou de produto.
