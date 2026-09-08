# Causa-raiz

O padrão presente em todos os consumidores afetados:

```js
if (scope.consumerApplicable) {
  ...
} else if (scope.reason === 'consumer_slice_after_active_slice') {
  ...
} else {
  assert.equal(scope.reason, 'empty_branch_diff');   // <-- ramo final fechado
  assert.equal(scope.activeSliceId, null);
}
```

A enumeração é **exaustiva e fechada**. Ela é correta para os três estados que
existiam quando foi escrita. A Slice 46 acrescentou um quarto:

```
notApplicable = true
applicable    = false
reason        = 'non_studio_branch'
safe          = true
activeSliceId = null
blockers      = []
```

Como o quarto estado nunca foi ensinado ao ramo final, ele era lido como violação.

A segunda forma da mesma causa: asserções que exigiam uma slice ativa resolvida —
`assert.equal(resolveActiveStudioSlice(f).ok, true)` — numa branch em que,
por construção, nenhuma slice é construída.

## Por que NÃO é defeito do guard

O guard responde exatamente o que a Slice 46 certificou. O núcleo
`evaluateStudioBranchScope` continua `safe=false` para os mesmos caminhos. A
boundary nunca prometeu que os consumidores antigos a conheceriam.

A incompatibilidade é dos consumidores, e é neles que foi corrigida.
