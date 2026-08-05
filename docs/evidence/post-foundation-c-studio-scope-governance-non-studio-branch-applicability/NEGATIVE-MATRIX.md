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

A última linha é a mais importante: o núcleo **não** foi relaxado. Só os dois boundaries
concluem `non_studio_branch`, e apenas sobre a pergunta "este check se aplica a esta branch?".
