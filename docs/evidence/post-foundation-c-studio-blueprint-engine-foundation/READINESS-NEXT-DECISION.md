# Readiness & Next Decision

## Readiness
`createStudioBlueprintEngineReadiness({ validation, safety, hardening, verification })`:
- `engineFoundationReady: true` — a fundação do engine está pronta como kernel de contrato.
- `blueprintReady` — true apenas quando estrutura válida + segurança ok + hardening
  passa + manifest verificado.
- `emitsGeneratedModule: false` e `generationAllowedNow: false` — mesmo um blueprint
  pronto permanece headless; **nenhum módulo é gerado aqui**.
- readiness final: `blueprint_engine_foundation_ready` (ou `blocked`).

## Next Decision
`createStudioBlueprintEngineNextDecision({ readiness, compatibility })` nomeia o próximo
slice CONTRACT-ONLY, sem autorizar efeito colateral:
- há blockers → `fix_blueprint`.
- compatibilidade breaking → `bump_major_version` (STUDIO BLUEPRINT ENGINE — VERSIONING SLICE).
- pronto → `proceed_to_reference_planner` (STUDIO BLUEPRINT → MODULE REFERENCE PLANNER).

`authorizesGeneration/Ui/Backend/Persistence/RewriteEmpresas`: todos **false**.
