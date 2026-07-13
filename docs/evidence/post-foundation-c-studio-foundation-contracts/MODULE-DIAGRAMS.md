# MODULE DIAGRAMS

## Composição da fundação

```
createStudioFoundationContract()
        │
        ├── createStudioMetamodelContract        (19 entidades)
        ├── createStudioBlueprintContract         (envelope + estados)
        ├── createStudioModuleBlueprintContract
        ├── createStudioFieldBlueprintContract
        ├── createStudioScreenBlueprintContract
        ├── createStudioValidationBlueprintContract
        ├── createStudioPermissionBlueprintContract
        ├── createStudioRouteMenuBlueprintContract
        ├── createStudioPersistenceBoundaryContract
        ├── createStudioRuntimeBindingContract
        ├── createStudioSafetyPolicy              (20 invariantes)
        ├── createStudioDiagnostics
        │
        ├── createStudioContractManifest ──► overallDigest
        └── verifyStudioFoundationContracts ──► { valid, status, readiness }
```

## Fluxo de integridade

```
sub-digests ──► manifest.overallDigest ──► verifier recomputa ──► match? ──► valid
                                                              └─ mismatch ─► invalid (tampering)
```

## Governança de compatibilidade

```
checkStudioContractCompatibility(current, next)
   ├─ libera capacidade sensível / remove guard ─► breaking (major)
   ├─ apenas adições ───────────────────────────► backward_compatible
   ├─ mudança neutra ───────────────────────────► conditionally_compatible
   ├─ nada mudou ───────────────────────────────► compatible
   └─ input inválido ───────────────────────────► invalid (contractInvalidated)
```

## Referências de runtime

```
cadastro     → ModeloBase1 (referência)
operacional  → ModeloBase2 (experimental)
seed model   → empresas-local-read-contract@1.0.0 (certificado, não reescrito)
kernel       → src/runtime/generic-model
```
