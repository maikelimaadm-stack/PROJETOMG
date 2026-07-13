# Engine Architecture

## Pipeline (determinística, pura, headless)

```
draft  →  normalize  →  validate  →  safety  →  hardening  →  manifest  →  verify
                                                                              │
       preview metadata  ←──────────────────────────────────────────────────┤
       readiness         ←──────────────────────────────────────────────────┤
       next decision     ←──────────────────────────────────────────────────┘
(compare + compatibility são opcionais, contra um blueprint anterior)
```

## Camadas

| Arquivo | Papel |
| --- | --- |
| `studioBlueprintEngineConfig.js` | versões, flags MAK_*, capabilities congeladas, digest, env |
| `errors.js` | catálogo tipado de códigos `STUDIO_BLUEPRINT_ENGINE_*` |
| `createStudioBlueprintEngineDigest.js` | digest FNV-1a com sanitização de segredos, bloqueio de função/circular |
| `createStudioDraftBlueprint.js` | constrói draft a partir de descrição simples |
| `normalizeStudioBlueprint.js` | forma canônica: ordena, faz trim, colapsa duplicados |
| `validateStudioBlueprint.js` | validação estrutural (módulo/campos/telas/permissões/persistência) |
| `validateStudioBlueprintSafety.js` | invariantes headless / fail-closed / default-deny |
| `validateStudioBlueprintAgainstHardening.js` | consome `evaluateStudioField` certificado |
| `createStudioBlueprintManifest.js` | agrega digests por estágio → overallDigest |
| `verifyStudioBlueprintEngineManifest.js` | recomputa digest (tamper) + invariantes |
| `compareStudioBlueprints.js` | diff estrutural (added/removed/retyped/nowRequired) |
| `checkStudioBlueprintEngineCompatibility.js` | classifica compatível/backward/breaking/invalid |
| `createStudioBlueprintDiagnostics.js` | diagnóstico passivo, sem segredos |
| `createStudioBlueprintFallback.js` | fallback fail-closed (safeToEmit=false) |
| `createStudioHeadlessPreviewMetadata.js` | descrição de preview (renderiza nada) |
| `createStudioBlueprintEngineReadiness.js` | veredito de readiness |
| `createStudioBlueprintEngineNextDecision.js` | próxima decisão contract-only |
| `createStudioBlueprintEngine.js` | composer raiz |
| `index.js` | barrel |

## Dependências (import)

Somente o kernel `src/runtime/generic-model` (isGenericModelPlainObject,
safeCloneGenericModel, createGenericModelChecksum), o hardening certificado
(`evaluateStudioField`) e o Empresas mirror certificado (reference-only). Sem React, sem
backend, sem Prisma, sem fetch.
