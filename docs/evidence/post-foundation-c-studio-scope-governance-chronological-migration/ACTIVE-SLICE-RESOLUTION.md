# Active slice resolution

`resolveActiveStudioSlice(changedPaths)` responde: **qual fatia esta branch está construindo?**

## Entradas permitidas

Somente os caminhos alterados e os `branchMarkerPatterns` do catálogo. Explicitamente NÃO usa: nome da branch, rede, GitHub, relógio, variáveis de ambiente, `execSync`, `fetch` ou qualquer I/O. O guard importa apenas o registry — provado por inspeção das importações no teste e no gate.

## Resultado

| situação | resultado |
|---|---|
| exatamente um marker distinto | `{ ok:true, sliceId, sliceOrdinal }` |
| zero markers | `{ ok:false, reason:'no_active_slice_resolved' }` |
| dois ou mais markers | `{ ok:false, reason:'ambiguous_active_slice' }` |

Ambos os fracassos BLOQUEIAM. Não há "melhor palpite".

## Por que teste e gate não são markers

Uma fatia posterior pode tocar um teste/gate anterior por autorização cruzada EXATA — é exatamente o que esta migração faz. Se esses arquivos fossem markers, a branch da migração pareceria estar construindo 23 fatias ao mesmo tempo e a resolução ficaria ambígua. Markers são o subtree próprio e o diretório de evidências: coisas que só aparecem quando a fatia é de fato o assunto da branch.

## Infraestrutura compartilhada

`package.json`, `package-lock.json`, o registry e o guard aparecem em quase toda branch Studio. Eles são `sharedGovernancePatterns` e nunca resolvem fatia ativa — provado individualmente para cada um.

## Provas vivas

- diff REAL da PR #495 (90 caminhos) → `bridge-decision-core-envelope-builder`
- diff no formato desta migração → `studio-scope-governance-chronological-migration`
- diff sem marker → `no_active_slice_resolved`
- diff com marker do Builder + marker da migração → `ambiguous_active_slice`
