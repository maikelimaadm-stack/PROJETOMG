# Arrays hostis — leitura só por descritor

O ramo de array de `safeCloneAndNormalize` não avalia mais `v.length` nem `v[i]`:

- `length` vem de `Object.getOwnPropertyDescriptor(v, 'length')`; accessor, valor não inteiro seguro ou negativo → rejeição fail-closed.
- cada elemento vem de `Object.getOwnPropertyDescriptor(v, String(i))`; ausência → `BUILDER_SOURCE_SPARSE_ARRAY`; getter/setter → `BUILDER_SOURCE_ACCESSOR_FORBIDDEN`.
- nenhuma chave própria além dos índices e `length`: um array carregando propriedade extra é rejeitado.
- chaves de prototype pollution rejeitadas.
- comprimento acima de `maxSourceDecisionFields` rejeitado.

Consequência provada: um `Proxy` sobre array com trap `get` contando acessos registra ZERO invocações durante a normalização, e o clone é uma cópia destacada por valor.
