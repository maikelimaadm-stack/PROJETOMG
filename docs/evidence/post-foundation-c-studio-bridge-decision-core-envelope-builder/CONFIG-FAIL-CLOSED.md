# Config fail-closed

## Aceito

- config omitida, `null` ou `{}`;
- `maxStructureDepth` inteiro em `1..MAX_STRUCTURE_DEPTH` (64).

## Rejeitado (nunca substituído pelo default)

chave desconhecida · `strict:true` · `strict:false` · `strict` de tipo inválido · depth não inteiro · depth ≤ 0 · depth > MAX · `NaN` · getter/accessor · proxy hostil · ciclo · prototype customizado · pollution key · array · override crítico proibido.

Um default é aplicado SOMENTE quando a propriedade está ausente. Um valor presente e inválido é rejeição — nunca fallback.

## `strict` removido

`strict` não existia no contrato nem no plano e não tinha efeito algum no código. Manter a opção seria ficção, então ela foi removida da API e do default. Em seu lugar existe o fato:

```js
export const BUILDER_ALWAYS_STRICT = true;
export const BUILDER_CONFIG_ALLOWED_KEYS = ['maxStructureDepth'];
```

Uma config rejeitada produz um builder que REJEITA toda build (`ok:false`, `coreEnvelope:null`), nunca um builder silenciosamente default.
