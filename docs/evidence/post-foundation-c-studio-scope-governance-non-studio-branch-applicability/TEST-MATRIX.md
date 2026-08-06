# Matriz de teste A–O — Slice 46

| caso | entrada | esperado |
|---|---|---|
| A | `.github/workflows/foundation-governance.yml` | `non_studio_branch` · notApplicable · safe · active=null · listas vazias |
| A-core | idem, via `evaluateStudioBranchScope` | fail-closed: `no_active_slice_resolved` + `unknown_scope` |
| B | `README.md` | `non_studio_branch` |
| C | `vite.config.js` e diff multi-arquivo non-Studio | `non_studio_branch`, para **todos** os callers de governança |
| D | `src/studio/unregistered-future-artifact.js` | nunca non-Studio · safe=false |
| E | `src/runtime/unregistered-future-artifact.js` | `forbidden_scope` · safe=false |
| F | gate e evidência não registrados | `unknown_scope` · safe=false |
| G | diff real da fatia 46 | resolve slice 46 · unknown=[] · safe=true |
| H | slice 46 + `README.md` | slice 46 resolvida · `unknown_scope` · safe=false |
| I | marker45 + marker46 | `ambiguous_active_slice` · safe=false |
| J | `package.json` | `no_active_slice_resolved` · safe=false |
| K | `src/App.jsx` | `forbidden_scope` · safe=false |
| L | `src/App.jsx` + workflow | nunca non-Studio · safe=false |
| M | matriz histórica 24/41/42/43/44/45 × callers posteriores | fail-closed, inalterada |
| N | input inválido / caller desconhecido | `invalid_changed_paths` / `unknown_caller_slice` |
| O | diff vazio | `empty_branch_diff` — razão **distinta** de `non_studio_branch` |

Cobertura adicional: seções `R` (catálogo), `DOM` (domínio), `S` (pureza de fonte),
`E` (evidência) e `T` (esta branch julgada por suas próprias regras).


## BLD — gate do Builder ownership-aware

| caso | entrada | esperado |
|---|---|---|
| BLD-A | diff real da fatia 46 + gate do Builder | PASS · owner=false · safe=true |
| BLD-B | branch do Builder sem guards | PASS · owner=true |
| BLD-C | branch do Builder + guard central | **FAIL** |
| BLD-C2 | branch do Builder + productionUiGuard | **FAIL** |
| BLD-D | fatia 46 + `README.md` | **FAIL** (`unknown_scope`) |
| BLD-E | dois markers | **FAIL** (`ambiguous_active_slice`) |
| BLD-F | fixture 24 (anterior ao Builder) | **FAIL** (`active_slice_before_caller`) |
| BLD-G | workflow-only | PASS · `non_studio_branch` · owner=false |
| BLD-H | input inválido e shared sem marker | **FAIL** |
| BLD-S001..S007 | forma da fonte do gate do Builder | import, identidade, ownership por `activeSliceId`, `safe===true`, sem bypass, sem branch/PR/env/status, teste do Builder intocado |

Mais `R014b..R014g`: cross = 3 exatos, teste do Builder não autorizado, gate do Builder só
como cross, sem wildcard, guard permanece shared, e nenhuma autorização vazia.
