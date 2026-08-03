# Root cause — B-HISTORICAL-OPEN-PR-LATER-CONSUMERS-BLOCK

## O que a auditoria pós-merge da #497 não podia ver

A auditoria pós-merge declarou `READY_TO_UPDATE_PR495_WITH_MAIN` com base num
`git merge-tree --write-tree` — que detecta **conflitos de texto**, não incompatibilidade
**semântica** de governança. Os dois conflitos previstos (`package.json` e o registry) são reais,
mas não são o problema mais grave.

## O blocker

A PR #495 constrói a fatia:

```
bridge-decision-core-envelope-builder · sliceOrdinal 41
```

A `main` hoje carrega consumidores branch-relative de fatias **posteriores**:

```
studio-scope-governance-chronological-migration        · 42
studio-scope-governance-main-diff-correction           · 43
studio-scope-governance-historical-branch-consumers    · 44 (esta)
```

Cada um deles julga o diff atual usando a **própria** identidade como caller:

```js
evaluateStudioBranchDiffScope(branchPaths, { callerSliceId: 'studio-scope-governance-main-diff-correction' })
```

Ao incorporar a `main` na branch da #495, o diff passa a resolver a fatia ativa 41, enquanto o
caller é 42, 43 ou 44. O core responde corretamente:

```
active_slice_before_caller
safe = false
```

Reproduzido na `main` em `fd2c38a0`, sem alterar arquivo algum, com o conjunto representativo do
Builder:

| caller | ordinal | resultado |
|---|---|---|
| `bridge-decision-core-envelope-builder` | 41 | `safe = true` |
| `studio-scope-governance-chronological-migration` | 42 | `safe = false` · `active_slice_before_caller` |
| `studio-scope-governance-main-diff-correction` | 43 | `safe = false` · `active_slice_before_caller` |

Portanto, mesmo com registry e `package.json` resolvidos, os consumidores 42 e 43 bloqueariam a
branch histórica da #495 dentro do `test:runtime`.

## Isto NÃO é defeito do core

O core responde com precisão à pergunta que lhe é feita:

> "esta branch pode ser certificada do ponto de vista desta fatia posterior?"

E a resposta honesta é **não**: uma fatia posterior não pode certificar uma branch que constrói
uma fatia anterior. Relaxar isso reabriria exatamente a classe de defeito que as fatias 42 e 43
fecharam.

## Onde está o defeito

No **consumidor**. Um teste/gate posterior, executando dentro de uma branch histórica anterior,
presume que ele próprio precisa ser aplicável. Ele é um passageiro, não o certificador.

Faltava separar duas perguntas distintas:

```
CERTIFICAÇÃO DE BRANCH
  "esta branch é válida do ponto de vista da fatia que ela constrói?"

APLICABILIDADE DE CONSUMIDOR
  "eu, um check posterior, sou aplicável a esta branch — e, se não sou, ela continua sã?"
```

A fatia 44 introduz a segunda pergunta como uma borda própria, sem tocar na primeira.

## O que NÃO foi feito

- não foi adicionado modo permissivo a nenhuma API existente;
- não existe `allowHistorical`, `ignoreChronology` ou equivalente;
- `active_slice_before_caller` continua existindo e continua reprovando;
- `status`, nome de branch, relógio, env, rede e GitHub continuam fora do guard.
