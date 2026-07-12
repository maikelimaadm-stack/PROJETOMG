# Next Slice Spec

## POST-FOUNDATION C — STUDIO FOUNDATION CONTRACTS

Objetivo: criar a **primeira base headless do Studio**, ainda **sem UI, sem módulo real e sem backend**.

Escopo futuro provável:
- `src/studio/foundation/` ou `src/Studio/foundation/` (padrão a decidir no slice)
- StudioFoundationContract
- StudioMetamodelContract
- StudioBlueprintContract
- StudioSafetyPolicy
- StudioDiagnostics
- StudioFallback
- tests
- gates
- evidence

## Proibido no próximo slice

criar tela Studio · criar rota · criar menu · criar módulo novo · alterar Empresas · alterar
ModeloBase1 · alterar backend · alterar Prisma · migration · marketplace · persistência real.

## Critério

O próximo slice deve ser **headless e contract-only** — nada de UI, produção ou geração de módulo real.
