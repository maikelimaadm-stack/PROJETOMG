# Matriz negativa — Slice 46

Tudo abaixo continua **fail-closed**. A aplicabilidade não relaxou nenhum destes estados.

| cenário | entrada | resultado |
|---|---|---|
| governado não registrado (studio) | `src/studio/unregistered-future-artifact.js` | `unknown_scope` · safe=false |
| governado não registrado (runtime) | `src/runtime/unregistered-future-artifact.js` | `forbidden_scope` · safe=false |
| governado não registrado (gate) | `scripts/gates/unregistered-future-gate.mjs` | `unknown_scope` · safe=false |
| governado não registrado (evidência) | `docs/evidence/unregistered-future-evidence/README.md` | `unknown_scope` · safe=false |
| misto Studio + desconhecido | marker46 + `README.md` | `unknown_scope` · safe=false |
| misto infra + marker | infra + marker46 | governado · safe=false |
| dois markers | marker45 + marker46 | `ambiguous_active_slice` · safe=false |
| shared sem marker | `package.json` | `no_active_slice_resolved` · safe=false |
| forbidden | `src/App.jsx` | `forbidden_scope` · safe=false |
| forbidden + infra | `src/App.jsx` + workflow | `forbidden_scope` · safe=false · **nunca** non_studio |
| input inválido | `'nope'`, `[1]`, `[null]` | `invalid_changed_paths` · safe=false |
| caller desconhecido | non-Studio + caller inexistente | `unknown_caller_slice` · safe=false |
| consumidor histórico | fixtures 24/41/42/43/44/45 | `historical_branch_consumer_compatibility_not_authorized` · safe=false |
| **núcleo** com diff non-Studio | workflow | `no_active_slice_resolved` + `unknown_scope` · safe=false |

## Gate do Builder — ownership, não aplicabilidade

| cenário | dono? | resultado |
|---|---|---|
| branch da fatia 46 | não | PASS — o Builder não reivindica branch alheia |
| branch do Builder sem guards | sim | PASS |
| branch do Builder + `studioScopeGovernanceGuard.mjs` | sim | **FAIL** |
| branch do Builder + `productionUiGuard.mjs` | sim | **FAIL** |
| fatia 46 + path desconhecido | não | **FAIL** (`unknown_scope`) |
| dois markers | não | **FAIL** (`ambiguous_active_slice`) |
| histórica anterior não autorizada (24 < 41) | não | **FAIL** (`active_slice_before_caller`) |
| workflow-only | não | PASS (`non_studio_branch`) |
| input inválido / shared sem marker | não | **FAIL** |

Inaplicabilidade nunca é dispensa: a asserção exige `branchConsumerScope.safe === true`
ANTES de considerar quem é o dono.

A última linha da tabela anterior é a mais importante: o núcleo **não** foi relaxado. Só os dois boundaries
concluem `non_studio_branch`, e apenas sobre a pergunta "este check se aplica a esta branch?".
