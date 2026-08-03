# Next — PR #495 revalidation

Esta fatia NÃO atualiza a #495. A sequência obrigatória, após o merge desta PR de governança:

1. merge manual desta PR de governança;
2. auditoria pós-merge desta PR (registry, guard, 9 testes, 22 gates, `gate:g423`, `test:runtime`, lint, build, dist);
3. só então atualizar a branch da #495 com `origin/main`;
4. resolver o registry na #495 SEM duplicação — o commit `Register Studio core envelope builder scope` da #495 adicionava as quatro entradas do Builder à lista plana; essas quatro entradas já existem no catálogo cronológico como a fatia `bridge-decision-core-envelope-builder` (ordinal 41, status `open_pull_request_495`), portanto a resolução correta é ficar com o catálogo e descartar a versão plana;
5. reexecutar toda a matriz da #495 na branch atualizada;
6. auditar novamente a #495;
7. só então autorizar o merge manual da #495.

## O que já está garantido para a #495

O diff real de 90 caminhos da #495 foi avaliado contra o novo guard e é `safe` para os nove chamadores do agregado e para os vinte e dois gates Studio, com zero proibido e zero desconhecido. A fatia do Builder já está catalogada com os quatro caminhos primários exatos e as duas autorizações cruzadas de lifecycle.

## O que NÃO está garantido

O estado da #495 após incorporar `origin/main` não foi medido — ele não existe ainda. Nada nesta fatia autoriza merge, ready ou revalidação da #495.
