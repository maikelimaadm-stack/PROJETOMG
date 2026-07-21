# Validation Pipeline

> **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge** · evidencia de implementacao.
> Slice autorizado pela decisao Fable 5 `READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE` (PR #484 mergeado).
> Ponte **real, headless, dev-only, synthetic-only, in-memory, ephemeral, deterministica, imutavel, fail-closed e side-effect-free**.
> Subarvore: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge/` (apenas `.js`). Sem UI, sem App, sem rota/menu, sem preview montado, sem persistencia, sem backend, sem exposicao ao produto.


## Pipeline atomico de 13 estagios (`createBridgeValidationPipeline.js`)

Ordem deterministica (`BRIDGE_VALIDATION_STAGES`):

1. `source_shape_validation`
2. `source_identity_validation`
3. `source_version_validation`
4. `source_digest_validation`
5. `source_synthetic_boundary_validation`
6. `source_ssot_boundary_validation`
7. `mapping_contract_validation`
8. `target_version_validation`
9. `target_shape_validation`
10. `product_exposure_validation`
11. `module_generation_validation`
12. `certification_boundary_validation`
13. `prototype_reference_validation`

## Atomicidade

Qualquer estagio que emita um bloqueador aborta a montagem do alvo. As `issues` sao agregadas e **ordenadas
deterministicamente** (`sortBridgeIssues.js`) para que a saida seja estavel entre execucoes.
