# Execução real dos 23 stages

`executeBuilderValidationPipeline(bridgeDecision, builderConfig)` é INTERNO (não exportado pelo `index.js` público) e é o único caminho de validação — `createBridgeDecisionCoreEnvelopeBuilder().build()` delega inteiramente a ele.

## Ordem canônica executada

1. `source_structure_normalization` — clone seguro + profundidade + bytes/strings
2. `source_decision_shape_validation` — shape 33 campos + extensões proibidas + limite de campos
3. `source_decision_eligibility_validation`
4. `source_version_validation`
5. `source_security_boundary_validation`
6. `source_target_descriptor_validation` — shape exato 23 campos + tupla de versão exata + limite
7. `core_allowlist_resolution`
8. `core_extraction_validation`
9. `core_completeness_validation` — + limites de core
10. `core_extra_field_validation`
11. `digest_presence_validation`
12. `digest_recompute_validation`
13. `same_decision_atomicity_validation`
14. `core_envelope_version_validation`
15. `core_envelope_shape_validation` — + teto de bytes ANTES da emissão
16. `identity_verification_state_validation`
17. `ssot_boundary_validation`
18. `preview_mount_boundary_validation`
19. `real_data_boundary_validation`
20. `module_generation_boundary_validation`
21. `certification_boundary_validation`
22. `product_exposure_boundary_validation`
23. `prototype_reference_validation`

Os stages 17–23 são checagens REAIS, não cobertura implícita.

## Atomicidade por stage

O loop registra o stage em `executedStages`, executa apenas a responsabilidade daquele stage e, se qualquer issue tiver `blocksBuilder === true`, retorna imediatamente com `ok:false`, `core:null`, `envelope:null` e `stoppedAtStage`. Nenhum stage posterior é executado; nenhuma issue de stage posterior é emitida.

`executedStages` carrega apenas NOMES de stage — nunca source, target, payload ou segredo — e é deep-frozen.
