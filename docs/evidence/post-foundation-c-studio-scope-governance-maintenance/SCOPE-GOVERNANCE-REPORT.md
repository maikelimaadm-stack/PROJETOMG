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

## Cobertura completa da cadeia enterprise (complemento PR #463)

Todos os 8 gates standalone da cadeia Studio/Empresas atual consomem o guard central nos
seus branch-relative scope checks (filtram `known_later_studio_headless_artifact` tanto do
`bad`/FORBIDDEN quanto do `outside`/AUTHORIZED). Forbidden e unknown continuam falhando —
`isKnownLaterStudioHeadlessArtifact` retorna `false` para qualquer path forbidden (forbidden
vence em `classify`), então filtrar o `bad` por ele nunca libera um caminho proibido.

Gates migrados:
- g423-studio-blueprint-engine-foundation
- g423-studio-blueprint-module-reference-planner
- g423-studio-blueprint-contract-certification
- g423-studio-blueprint-contract-hardening
- g423-studio-foundation-contracts
- g423-empresas-certified-blueprint-mirror-alignment-audit
- g423-empresas-local-read-contract-certification
- g423-studio-first-module-policy

Teste `studio-blueprint-engine-foundation` (S16) também consome o guard. Nenhum outro gate
da cadeia atual precisou migrar. Nenhum assert funcional/segurança/contrato/digest/verifier/
fallback/mutation foi alterado; apenas a linha de scope check. `productionUiGuard` intacto;
sem dependência nova; sem wildcard amplo.
