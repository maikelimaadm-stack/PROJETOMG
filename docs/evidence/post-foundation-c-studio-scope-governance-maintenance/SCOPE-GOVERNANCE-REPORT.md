# Scope Governance Report

## Mecanismo

`classifyStudioScopePath(path, options)` retorna uma de:

`own_slice_allowed` · `known_later_studio_headless_artifact` · `evidence_only` ·
`test_only` · `gate_only` · `package_script_only` · `forbidden_scope` · `unknown_scope`.

Ordem de prioridade (maior primeiro):
1. **forbidden_scope** — casa `FORBIDDEN_SCOPE_PATTERNS` (só escapa se o slice ATUAL
   autorizar explicitamente aquele path exato via `explicitlyAuthorizedForbidden`).
2. **own_slice_allowed** — paths autorizados pelo slice atual.
3. **known_later_studio_headless_artifact** — artifact posterior registrado explicitamente.
4. **evidence_only / test_only / gate_only / package_script_only** — forma estrutural.
5. **unknown_scope** — o resto (falha por padrão).

## Consumo pelos scope-checks antigos

Cada scope-check branch-relative antigo calcula `outside` e agora filtra os
`known_later_studio_headless_artifact`:

```js
const outside = changed
  .filter((f) => !AUTHORIZED.some((re) => re.test(f)))
  .filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
```

Forbidden nunca é tolerado: caminhos proibidos não estão na known-later list, então
continuam surgindo em `outside`.

## Funções exportadas

`classifyStudioScopePath` · `isKnownLaterStudioHeadlessArtifact` ·
`filterForbiddenScopePaths` · `filterUnknownScopePaths` ·
`filterKnownLaterStudioHeadlessArtifacts` · `assertNoForbiddenScopePaths` ·
`createStudioScopeGovernanceReport`.
