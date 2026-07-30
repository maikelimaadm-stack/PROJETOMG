# Cross-slice authorization

Uma autorização cruzada é uma lista EXATA de artefatos alheios que uma fatia pode tocar. Ela vale apenas quando aquela fatia é a ATIVA, não é herdada por ninguém e nunca libera caminho proibido.

## Builder (PR #495) — exatamente 2

```
src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js
scripts/gates/g423-studio-bridge-decision-core-envelope-builder-implementation-plan.mjs
```

Provado que o Builder REJEITA qualquer terceiro teste/gate anterior — por exemplo o teste do authoring runtime, o gate do route/menu ou o teste de manutenção de governança. Nenhum deles é admitido.

## Migration — exatamente 33

Os 9 testes migrados + os 22 gates Studio migrados + o teste e o gate da fatia de manutenção (regressão da nova API). Nada além disso.

## Não-herança

Provado, para o gate migrado `g423-studio-dev-preview-route-menu.mjs`, que NENHUMA outra fatia do catálogo o declara em sua lista cruzada. A autorização vive exclusivamente na fatia que a declarou.

## Nunca libera proibido

Para toda entrada cruzada de toda fatia, um caminho-sonda derivado do padrão é testado contra `FORBIDDEN_SCOPE_PATTERNS` e nunca casa.
