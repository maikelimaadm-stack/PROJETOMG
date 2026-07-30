# Twenty-two Studio gate migration

Os 22 gates Studio listados no inventário da PR #495 passaram a declarar `CALLER_SLICE_ID` e a consumir `evaluateStudioBranchScope` numa única avaliação memoizada por execução.

| gate | callerSliceId |
|---|---|
| `g423-studio-foundation-audit` | `studio-foundation-audit` |
| `g423-studio-module-preview-sandbox-contract` | `module-preview-sandbox` |
| `g423-studio-dev-preview-contract-bridge` | `dev-preview-contract-bridge` |
| `g423-studio-dev-preview-visual-contract` | `dev-preview-visual-contract` |
| `g423-studio-dev-preview-runtime-shell-contract` | `dev-preview-runtime-shell-contract` |
| `g423-studio-dev-preview-isolated-runtime-implementation-plan` | `dev-preview-isolated-runtime-implementation-plan` |
| `g423-studio-dev-preview-isolated-runtime` | `dev-preview-isolated-runtime` |
| `g423-studio-dev-preview-runtime-ui-contract` | `dev-preview-runtime-ui-contract` |
| `g423-studio-dev-preview-runtime-ui-implementation-plan` | `dev-preview-runtime-ui-implementation-plan` |
| `g423-studio-dev-preview-runtime-ui` | `dev-preview-runtime-ui` |
| `g423-studio-dev-preview-route-menu-contract` | `dev-preview-route-menu-contract` |
| `g423-studio-dev-preview-route-menu-implementation-plan` | `dev-preview-route-menu-implementation-plan` |
| `g423-studio-dev-preview-route-menu` | `dev-preview-route-menu` |
| `g423-studio-dev-preview-app-integration-contract` | `dev-preview-app-integration-contract` |
| `g423-studio-dev-preview-app-integration-implementation-plan` | `dev-preview-app-integration-implementation-plan` |
| `g423-studio-dev-preview-app-integration` | `dev-preview-app-integration` |
| `g423-studio-module-blueprint-authoring-foundation-contract` | `module-blueprint-authoring-foundation-contract` |
| `g423-studio-module-blueprint-authoring-implementation-plan` | `module-blueprint-authoring-implementation-plan` |
| `g423-studio-module-blueprint-authoring-runtime` | `module-blueprint-authoring-runtime` |
| `g423-studio-authoring-runtime-to-preview-bridge-contract` | `authoring-runtime-to-preview-bridge-contract` |
| `g423-studio-authoring-runtime-to-preview-bridge-implementation-plan` | `authoring-runtime-to-preview-bridge-implementation-plan` |
| `g423-studio-authoring-runtime-to-preview-bridge` | `authoring-runtime-to-preview-bridge` |

## Checks migrados

Somente os três checks branch-relative equivalentes a: forbidden scope, authorized scope only e prior gates/tests NOT altered. O número de `gate(...)` de cada arquivo é preservado; nenhuma prova funcional foi tocada.

`dev-preview-app-integration` continua sendo a ÚNICA fatia que passa `explicitlyAuthorizedForbiddenPatterns`, e apenas para os dois caminhos que ela sempre teve (`src/App.jsx` e `productionUiGuard.mjs`). Sem essa opção, ambos permanecem proibidos até para ela mesma — provado.
