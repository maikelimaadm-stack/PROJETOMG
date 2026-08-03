# Root cause — por que o estado pós-merge não podia permanecer

## O que a PR #495 deixou na `main`

A PR #495 foi mergeada em `5bfecd60`. O catálogo ficou, transitoriamente, assim:

```
bridge-decision-core-envelope-builder · ordinal 41
  status                                = open_pull_request_495
  historicalBranchConsumerCompatibility = true

studio-scope-governance-historical-branch-consumers · ordinal 44
  status                                = active_slice
```

Nenhuma dessas três afirmações é verdadeira depois do merge.

## Por que `compatibility: true` numa fatia mergeada é perigoso

O campo foi criado na fatia 44 para resolver
`B-CONSUMER-INAPPLICABILITY-NOT-CATALOG-BOUND`: sem ele, **qualquer** fatia cronologicamente
anterior permitia que um consumidor posterior se declarasse inaplicável, o que reabria na prática
toda fatia já mergeada.

A regra que o campo estabelece é: **no máximo uma** branch histórica **ainda aberta** pode
carregar consumidores posteriores, e isso precisa ser declarado explicitamente.

Deixar `true` numa fatia **mergeada** reintroduz exatamente o defeito que o campo existe para
impedir — de forma mais silenciosa, porque agora está escrito no catálogo e parece intencional.

A própria evidência da fatia 44 registrou isso como obrigação:

> Quando a #495 for mergeada, sua entrada deve voltar a
> `historicalBranchConsumerCompatibility: false` numa fatia corretiva própria — manter `true` numa
> fatia mergeada é exatamente o defeito que este campo existe para impedir.

## Por que `status` também precisa mover

`status` não decide nada no guard — isso é verificado por teste e por gate, e continua verdadeiro.
Mas ele é a memória declarada do ciclo de vida. Um catálogo que diz `open_pull_request_495` para
uma PR fechada, e `active_slice` para uma fatia mergeada, mente sobre o próprio estado e torna
qualquer auditoria futura mais difícil, não mais fácil.

## O que NÃO é causa raiz

Nada no Builder, no guard central, no wrapper de aplicabilidade, no core cronológico ou nos 36
consumidores migrados. Todos permanecem intocados. Esta fatia move três campos e ajusta as
asserções que falavam do estado transitório.
