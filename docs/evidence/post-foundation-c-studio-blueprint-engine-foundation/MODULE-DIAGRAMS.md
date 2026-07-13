# Module Diagrams

## Fluxo de composição (createStudioBlueprintEngine)

```
options.blueprint
   │
   ▼
createStudioDraftBlueprint ──► normalizeStudioBlueprint
                                     │
        ┌────────────────────────────┼─────────────────────────────┐
        ▼                            ▼                             ▼
validateStudioBlueprint  validateStudioBlueprintSafety  validateStudioBlueprintAgainstHardening
        └────────────────────────────┼─────────────────────────────┘
                                     ▼
                         createStudioBlueprintManifest
                                     ▼
                     verifyStudioBlueprintEngineManifest
                                     │
     ┌───────────────────────────────┼────────────────────────────────┐
     ▼                               ▼                                ▼
createStudioHeadlessPreviewMetadata  createStudioBlueprintEngineReadiness  checkStudioBlueprintEngineCompatibility (opcional)
                                     ▼
                     createStudioBlueprintEngineNextDecision
                                     ▼
                          createStudioBlueprintDiagnostics
                                     ▼
                            (engine package + Empresas reference-only)
```

## Dependências externas (todas read-only)

```
generic-model kernel  ──►  digest / plain-object / safe-clone
hardening certificado ──►  evaluateStudioField
empresas mirror       ──►  createEmpresasCertifiedBlueprintMirror (reference-only)
```
