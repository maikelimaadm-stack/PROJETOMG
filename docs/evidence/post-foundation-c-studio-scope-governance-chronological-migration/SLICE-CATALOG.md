# Slice catalog

`STUDIO_SLICE_CATALOG` é o único SSOT de cronologia do programa Studio. Cada entrada declara o que a fatia POSSUI, o que a identifica numa branch, o que ela pode tocar fora do seu escopo e o que ela compartilha.

| ordinal | sliceId | título | primary | markers | cross | shared | status |
|---|---|---|---|---|---|---|---|
| 1 | `studio-foundation-audit` | Studio Foundation Audit | 3 | 1 | 0 | 2 | merged |
| 2 | `studio-foundation-contracts` | Studio Foundation Contracts | 3 | 1 | 0 | 2 | merged |
| 3 | `studio-blueprint-contract-hardening` | Studio Blueprint Contract Hardening | 3 | 1 | 0 | 2 | merged |
| 4 | `studio-blueprint-contract-certification` | Studio Blueprint Contract Certification | 3 | 1 | 0 | 2 | merged |
| 5 | `studio-first-module-policy` | Studio First Module Policy | 3 | 1 | 0 | 2 | merged |
| 6 | `studio-blueprint-engine-foundation` | Studio Blueprint Engine Foundation | 3 | 1 | 0 | 2 | merged |
| 7 | `studio-blueprint-module-reference-planner` | Studio Blueprint Module Reference Planner | 4 | 2 | 0 | 2 | merged |
| 8 | `module-preview-sandbox` | Studio Module Preview Sandbox Contract | 4 | 2 | 0 | 2 | merged |
| 9 | `studio-scope-governance-maintenance` | Studio Scope Governance Maintenance | 3 | 1 | 9 | 4 | merged |
| 10 | `studio-scope-governance-self-guard-fix` | Studio Scope Governance Self Guard Fix | 1 | 1 | 0 | 2 | merged |
| 11 | `dev-preview-contract-bridge` | Studio Dev Preview Contract Bridge | 4 | 2 | 0 | 2 | merged |
| 12 | `dev-preview-visual-contract` | Studio Dev Preview Visual Contract | 4 | 2 | 0 | 2 | merged |
| 13 | `dev-preview-runtime-shell-contract` | Studio Dev Preview Runtime Shell Contract | 4 | 2 | 0 | 2 | merged |
| 14 | `dev-preview-isolated-runtime-implementation-plan` | Studio Dev Preview Isolated Runtime Implementation Plan | 4 | 2 | 0 | 2 | merged |
| 15 | `dev-preview-isolated-runtime` | Studio Dev Preview Isolated Runtime | 4 | 2 | 0 | 2 | merged |
| 16 | `dev-preview-runtime-ui-contract` | Studio Dev Preview Runtime UI Contract | 4 | 2 | 0 | 2 | merged |
| 17 | `dev-preview-runtime-ui-implementation-plan` | Studio Dev Preview Runtime UI Implementation Plan | 4 | 2 | 0 | 2 | merged |
| 18 | `dev-preview-runtime-ui` | Studio Dev Preview Runtime UI | 4 | 2 | 0 | 2 | merged |
| 19 | `dev-preview-route-menu-contract` | Studio Dev Preview Route/Menu Contract | 4 | 2 | 0 | 2 | merged |
| 20 | `dev-preview-route-menu-implementation-plan` | Studio Dev Preview Route/Menu Implementation Plan | 4 | 2 | 0 | 2 | merged |
| 21 | `dev-preview-route-menu` | Studio Dev Preview Route/Menu | 4 | 2 | 0 | 2 | merged |
| 22 | `dev-preview-app-integration-contract` | Studio Dev Preview App Integration Contract | 4 | 2 | 0 | 2 | merged |
| 23 | `dev-preview-app-integration-implementation-plan` | Studio Dev Preview App Integration Implementation Plan | 4 | 2 | 0 | 2 | merged |
| 24 | `dev-preview-app-integration` | Studio Dev Preview App Integration | 4 | 2 | 0 | 2 | merged |
| 25 | `module-blueprint-authoring-foundation-contract` | Studio Module Blueprint Authoring Foundation Contract | 4 | 2 | 0 | 2 | merged |
| 26 | `module-blueprint-authoring-implementation-plan` | Studio Module Blueprint Authoring Implementation Plan | 4 | 2 | 0 | 2 | merged |
| 27 | `module-blueprint-authoring-runtime` | Studio Module Blueprint Authoring Runtime | 4 | 2 | 0 | 2 | merged |
| 28 | `authoring-runtime-to-preview-bridge-contract` | Studio Authoring Runtime-to-Preview Bridge Contract | 4 | 2 | 0 | 2 | merged |
| 29 | `authoring-runtime-to-preview-bridge-implementation-plan` | Studio Authoring Runtime-to-Preview Bridge Implementation Plan | 4 | 2 | 0 | 2 | merged |
| 30 | `authoring-runtime-to-preview-bridge-source-shape-alignment` | Studio Bridge Source-Shape Alignment Correction | 3 | 1 | 0 | 2 | merged |
| 31 | `authoring-runtime-to-preview-bridge` | Studio Authoring Runtime-to-Preview Bridge | 4 | 2 | 0 | 2 | merged |
| 32 | `authoring-runtime-to-preview-bridge-hardening` | Studio Authoring Runtime-to-Preview Bridge Hardening | 3 | 1 | 0 | 2 | merged |
| 33 | `bridge-to-preview-sandbox-runtime-contract` | Studio Bridge-to-Preview Sandbox Runtime Contract | 4 | 2 | 0 | 2 | merged |
| 34 | `bridge-decision-envelope-identity-contract` | Studio Bridge Decision Envelope Identity Contract | 4 | 2 | 0 | 2 | merged |
| 35 | `bridge-to-preview-sandbox-runtime-implementation-plan` | Studio Bridge-to-Preview Sandbox Runtime Implementation Plan | 4 | 2 | 0 | 2 | merged |
| 36 | `bridge-decision-core-envelope-contract` | Studio Bridge Decision Core Envelope Contract (v2) | 4 | 2 | 0 | 2 | merged |
| 37 | `bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment` | Studio Bridge Sandbox Runtime Implementation Plan Alignment Amendment | 4 | 2 | 0 | 2 | merged |
| 38 | `bridge-decision-core-envelope-builder-contract` | Studio Bridge Decision Core Envelope Builder Contract | 4 | 2 | 0 | 2 | merged |
| 39 | `bridge-decision-core-envelope-builder-verification-state-correction` | Studio Core Envelope Builder Verification State Correction | 0 | 0 | 0 | 2 | merged_without_dedicated_artifacts |
| 40 | `bridge-decision-core-envelope-builder-implementation-plan` | Studio Bridge Decision Core Envelope Builder Implementation Plan | 4 | 2 | 0 | 2 | merged |
| 41 | `bridge-decision-core-envelope-builder` | Studio Bridge Decision Core Envelope Builder | 4 | 2 | 2 | 3 | open_pull_request_495 |
| 42 | `studio-scope-governance-chronological-migration` | Studio Scope Governance Chronological Migration | 3 | 1 | 33 | 4 | active_slice |

## Campos

- `sliceId` — identificador único e estável.
- `sliceOrdinal` — inteiro positivo único; **menor = mais antigo**.
- `primaryArtifactPatterns` — artefatos que a fatia POSSUI. Cada padrão pertence a exatamente uma fatia.
- `branchMarkerPatterns` — subconjunto estreito que identifica QUAL fatia uma branch está construindo: o subtree próprio e o diretório de evidências. Arquivos de teste e de gate NÃO são markers, porque uma fatia posterior pode tocá-los por autorização cruzada exata — e isso não pode fazer duas fatias parecerem ativas ao mesmo tempo.
- `crossSliceAuthorizedPatterns` — lista EXATA de artefatos alheios que a fatia pode tocar. Nunca herdada, nunca libera caminho proibido.
- `sharedGovernancePatterns` — infraestrutura compartilhada (manifests de pacote, registry, guard). Nunca resolve fatia ativa.
- `status` — `merged`, `merged_without_dedicated_artifacts`, `open_pull_request_495` ou `active_slice`.

## Invariantes provados

- IDs únicos · ordinais únicos, positivos e contíguos 1..N
- zero sobreposição de ownership
- todo padrão ancorado em `^`
- zero wildcard amplo
- nenhum caminho proibido declarado como primary, cross ou shared
- `KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS` DERIVADO do catálogo — não pode divergir
