# Reset da autorização de compatibilidade histórica

## A mudança

```js
// bridge-decision-core-envelope-builder, ordinal 41
historicalBranchConsumerCompatibility: true  →  false
```

## O que isso muda, medido

Com a autorização, um consumidor posterior sobre a branch do Builder recebia:

```
notApplicable = true · consumer_slice_after_active_slice
certifiedAgainstActiveSlice = true · evaluatedAsSliceId = bridge-decision-core-envelope-builder
safe = true
```

Sem a autorização, a mesma chamada recebe:

```
notApplicable = false · historical_branch_consumer_compatibility_not_authorized
certifiedAgainstActiveSlice = false · evaluatedAsSliceId = null
blockers = ['active_slice_before_caller'] · safe = false
allowed/crossAuthorized/explicitForbiddenAuthorized = [] · total = 0
```

A autocertificação **não é sequer tentada**. O veredito devolvido é o do core, verbatim.

Isso vale para os callers 42, 43, 44 e 45 — e agora vale igualmente para a fatia 24 e para
qualquer outra fatia mergeada. Não existe mais exceção alguma no catálogo.

## O que NÃO muda

- o guard não foi tocado: a capacidade de autorizar uma futura branch histórica continua lá,
  intacta, apenas sem nenhum consumidor autorizado hoje;
- `resolveActiveStudioSlice`, `evaluateStudioBranchScope`, `evaluateStudioBranchDiffScope`,
  `evaluateStudioBranchConsumerScope` e `createResolvedActiveStudioSlicePathAuthorizer` são
  idênticos ao que a `main` já tinha;
- a branch do Builder continua **sã para a própria fatia**: `evaluateStudioBranchScope(fixture,
  { callerSliceId: builder })` → `safe: true`. A recusa é sobre autorização, não sobre qualidade
  da branch;
- classificação `forbidden`/`unknown`, eleição de fatia ativa e ambiguidade são anteriores ao
  portão de autorização e permanecem exatamente como eram.

## Ordem de decisão, confirmada

```
entrada inválida → caller desconhecido → diff vazio →
ativa irresolvível / ambígua → ativa >= consumidor (delega) →
ativa < consumidor SEM autorização → FAIL (é aqui que o Builder cai agora) →
ativa < consumidor COM autorização e self suja → FAIL →
ativa < consumidor COM autorização e self limpa → inaplicável e seguro
```

Ambiguidade continua vindo antes da autorização: `fixture + segundo marcador` reprova com
`ambiguous_active_slice`, não com a razão de autorização.

## Quando o campo volta a `true`

Somente se outra branch histórica precisar ficar aberta enquanto fatias posteriores são
mergeadas — e então na entrada **daquela** fatia, enquanto ela estiver aberta, e por uma fatia
que declare isso explicitamente.
