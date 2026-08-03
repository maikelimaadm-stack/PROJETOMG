# Verificador de compatibilidade — exatidão real

`subsetOf()` foi REMOVIDO. Nenhuma comparação de contenção parcial permanece no módulo.

## Snapshot + avaliador

- `BUILDER_COMPATIBILITY_SNAPSHOT` — tudo o que o builder declara localmente (27 chaves).
- `evaluateBuilderCompatibilitySnapshot(candidate)` — INTERNO (fora do index público); avalia um snapshot candidato contra os upstreams reais e devolve a lista de blockers.
- `verifyBuilderCompatibility()` = avaliação do snapshot real + probe vivo da superfície pública.

Isso permite provar DETECÇÃO, não apenas `ok:true`: cada chave do snapshot, quando adulterada, produz ≥1 blocker. Subset estrito, superset estrito e reordenação das listas de target são blockers.

## Comparações

| Alvo | Tipo |
|---|---|
| source fields | ORDEM exata |
| required / eligibility / security source | SET exato |
| core allowlist | SET exato + `allowlist = source − digest` |
| envelope fields | ORDEM exata |
| envelope invariants | chave + VALOR |
| pipeline stages | ORDEM exata |
| issue codes | SET exato |
| issue shape | ORDEM exata |
| resource dimensions | ORDEM exata |
| resource limits | VALOR por dimensão |
| target fields / required / security / version / digest | ORDEM exata (contra o upstream real) |
| target invariants | chave + VALOR |
| target kind + tupla de versão + handoff kind/version | VALOR exato |
| builder contract / core envelope v2 / bridge versions | VALOR exato |
| superfície pública | exatamente `{ build }` |

`exactComparisonsPerformed: true` e `subsetComparisonsPerformed: false` refletem o código.
