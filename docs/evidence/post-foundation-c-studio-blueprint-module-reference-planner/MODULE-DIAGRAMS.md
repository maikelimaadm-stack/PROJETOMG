# Module Diagrams

## Fluxo de composição (createStudioBlueprintModuleReferencePlanner)

```
options.blueprint
   │
   ▼
createStudioBlueprintEngine  (draft→normalize→validate→safety→hardening→manifest→verify)
   │  (normalized blueprint + overallDigest + readiness)
   ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ identityPlan · filePlan · screenPlan · fieldTableFormPlan · permissionPlan  │
│ routeMenuPlan · persistencePlan · runtimeBindingPlan · testGatePlan         │
│ evidencePlan · riskPlan · readinessDecision                                 │
└───────────────────────────────────────────────────────────────────────────┘
   │
   ▼
createModuleReferencePlannerManifest  →  verifyModuleReferencePlan
   │                                          │
   ▼                                          ▼
checkModuleReferencePlanCompatibility   createModuleReferencePlannerDiagnostics
   │
   ▼
createModuleReferencePlannerFallback (fail-closed, non-consumption)
```

## Dependências externas (todas read-only)

```
blueprint engine     ──►  createStudioBlueprintEngine (validação do blueprint)
generic-model kernel ──►  digest / plain-object / safe-clone
empresas mirror      ──►  referenceOnly quando source=empresas
```
