# Round 4/5 — integração da main pós-#498 e correção dos consumidores de governança

## 1. O que foi integrado

A `main` foi incorporada nesta branch por **merge**, nunca rebase, preservando os nove commits
históricos do Builder.

```
main incorporada : 377ca48ff11f8bd87d6c5be836f622920eb3aeed
                   (merge da PR #498, head aprovado 22717e13)
merge commit     : parents 9634c364 + 377ca48f
```

A `main` traz as fatias de governança 42 (chronological migration), 43 (main-diff correction) e
44 (historical branch consumers).

## 2. Conflitos — dois, ambos previstos

### `scripts/gates/lib/studioScopeGovernanceRegistry.mjs`

Resolvido tomando **integralmente a versão da main**. A branch ainda carregava o registry *flat*
pré-cronologia; o `STUDIO_SLICE_CATALOG` cronológico o substitui por completo. Nenhum resquício
flat permaneceu, nenhuma entrada Builder duplicada, nenhum regex duplicado.

O catálogo resultante: 44 entradas, dez chaves em todas, ordinais contíguos 1..44, fatias 42 e 43
`merged`, fatia 44 `active_slice`.

### `package.json`

Resolvido por **união consciente**: base da main, mais os dois scripts do Builder reinseridos
junto aos irmãos `implementation-plan`, mais o teste do Builder acrescentado ao `test:runtime`
agregado. Zero script removido, zero renomeado, `dependencies`/`devDependencies` idênticas à main,
`package-lock.json` intocado.

### Auto-merge conferido — `g423-studio-bridge-decision-core-envelope-builder-implementation-plan.mjs`

União real, verificada linha a linha contra os dois lados:

- da branch: as correções **lifecycle-safe** que substituíram asserções temporais de ausência
  física por provas declarativas permanentes;
- da main: `createResolvedActiveStudioSlicePathAuthorizer` no lugar da consulta ao catálogo sem
  cronologia.

Sem import duplicado, sem `isKnownLaterStudioHeadlessArtifact` remanescente, 123 checks — nenhuma
redução (a branch tinha 123, a main 120).

## 3. O defeito encontrado na integração

```
B-GOVERNANCE-SELF-SCOPE-ASSERTIONS-UNGUARDED-ON-FOREIGN-BRANCH
```

Com a main integrada, os testes e gates das fatias 42–44 passam a rodar **nesta** branch, cuja
fatia ativa é o Builder no ordinal 41. O wrapper central respondeu corretamente:

```
notApplicable = true · reason = consumer_slice_after_active_slice
certifiedAgainstActiveSlice = true · safe = true
```

Mas cinco **autoasserções de escopo próprio** continuavam executando incondicionalmente:

| fatia | asserção |
|---|---|
| 42 | `this branch touches no production code and no Builder file` |
| 43 | `this branch touches no Studio blueprint-engine source` |
| 44 | `this branch touches no Studio blueprint-engine source` |
| 44 | `this branch diff carries no Builder path` |
| 44 | `no historical evidence directory of an earlier slice is touched` |

Cada frase é verdadeira sobre a branch **da própria fatia** e falsa aqui — elas afirmavam algo
sobre o trabalho de outra fatia. O defeito nunca esteve no Builder, na resolução do registry, na
união do package, no core cronológico nem no wrapper.

## 4. A correção

Cada um dos seis consumidores calcula **uma** avaliação de aplicabilidade e admite exatamente dois
estados:

```
A. consumerApplicable === true
   → a fatia É a certificadora; suas autoasserções executam integralmente.

B. seguramente inaplicável:
   safe = true, notApplicable = true, e
     empty_branch_diff
     ou consumer_slice_after_active_slice
        + certifiedAgainstActiveSlice = true
        + evaluatedAsSliceId === activeSliceId
        + activeSliceOrdinal < consumerSliceOrdinal
        + forbidden/unknown/chronologicalViolation vazios
```

Qualquer outro estado **reprova**: caller desconhecido, entrada inválida, fatia ativa irresolvível
ou ambígua, `historical_branch_consumer_compatibility_not_authorized`,
`active_slice_scope_invalid`, `safe === false`. Um `if (scope.notApplicable) return;` genérico é
deliberadamente **não** usado.

No estado B a inaplicabilidade é **registrada**, nunca silenciosa: prova-se que a branch foi
recertificada contra a própria fatia ativa e que nenhuma lista de segurança foi descartada.

As verificações **universais** não dependem disso e executam em todos os estados: `forbidden`,
`unknown`, `chronologicalViolation`, segurança, resolução de fatia ativa, não-regressão do core.
Onde uma autoasserção foi estreitada, uma contrapartida universal entrou no lugar:

- o catálogo nunca autoriza a fatia 44 (nem a 42) a um caminho do Builder, em estado algum;
- todo caminho de evidência na branch pertence à fatia **ativa**, qualquer que seja ela.

## 5. Empty diff

O check da fatia 44 dizia `branchPaths.length > 20`, o que reprovava na `main`, onde o diff é
legitimamente vazio. Agora:

```js
branchPaths.length === 0 || branchPaths.length > 20
```

com texto honesto — *branch diff is empty on main or substantive on a real slice branch* — e dois
checks novos que provam os dois casos: um diff vazio só é admitido como o estado seguro
`empty_branch_diff`, e um diff não vazio nunca é lido como vazio.

Verificado num worktree efêmero em `origin/main` (diff = 0 caminhos): gate **510/510**, exit 0.

## 6. Extensão exata do cross scope do Builder

Como esta PR passou a modificar seis artefatos das fatias 42–44, a entrada Builder precisa
autorizá-los explicitamente. `crossSliceAuthorizedPatterns` vai de **2 para 8**:

```
LIFECYCLE (2, pré-existentes)
  ^src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan\.test\.js$
  ^scripts/gates/g423-studio-bridge-decision-core-envelope-builder-implementation-plan\.mjs$

GOVERNANCE INTEGRATION (6, novos)
  ^src/runtime/__tests__/studio-scope-governance-chronological-migration\.test\.js$
  ^scripts/gates/g423-studio-scope-governance-chronological-migration\.mjs$
  ^src/runtime/__tests__/studio-scope-governance-main-diff-correction\.test\.js$
  ^scripts/gates/g423-studio-scope-governance-main-diff-correction\.mjs$
  ^src/runtime/__tests__/studio-scope-governance-historical-branch-consumers\.test\.js$
  ^scripts/gates/g423-studio-scope-governance-historical-branch-consumers\.mjs$
```

Oito únicos, todos ancorados em `^…$`, cada um um arquivo exato. Nenhum diretório, nenhum
`docs/evidence`, nenhum guard, nenhum caminho de produção, nenhum caminho de package, nenhum
curinga.

Cobertura negativa medida: um sétimo artefato de governança não listado
(`studio-scope-governance-maintenance`), um vizinho com sufixo diferente, um arquivo de evidência
da fatia 44 e `studioScopeGovernanceGuard.mjs` são todos **recusados**. `src/App.jsx`,
`backend/server.js` e `src/modules/x.js` continuam `forbidden_scope`. A extensão não altera
classificação, não altera eleição de fatia ativa, não altera
`historicalBranchConsumerCompatibility`, e um caminho cross nunca elege fatia.

## 7. O core não mudou

`resolveActiveStudioSlice`, `evaluateStudioBranchScope`, `evaluateStudioBranchDiffScope`,
`evaluateStudioBranchConsumerScope` e `createResolvedActiveStudioSlicePathAuthorizer` estão
intactos. `scripts/gates/lib/studioScopeGovernanceGuard.mjs` **não** está no diff desta PR. Os
outros 36 consumidores migrados não foram tocados.

## 8. Diff real certificado

```
96 caminhos
active slice        bridge-decision-core-envelope-builder · ordinal 41 · candidates 1
self-certification  safe = true · allowed 96/96 · cross 8 · forbidden 0 · unknown 0 · chrono 0
```

Todo caminho da branch é *owned*, *shared* ou exatamente *cross-authorized* pelo Builder.

| caller | wrapper | core |
|---|---|---|
| 42 | `notApplicable`, `consumer_slice_after_active_slice`, cert=true, safe=true | `safe=false`, `active_slice_before_caller` |
| 43 | idem | idem |
| 44 | idem | idem |

E, em fixture da **própria** fatia, as autoasserções voltam a executar e detectam contaminação —
a proteção é de aplicabilidade, não de severidade.

## 9. Limpeza pós-merge ainda obrigatória

Depois que esta PR for mergeada, uma limpeza final única e sequencial deve:

```
Builder status → merged
Builder historicalBranchConsumerCompatibility → false
fatia 44 status → normalização definida pelo catálogo
validar a main
encerrar sem PR aberta
```

Manter `historicalBranchConsumerCompatibility: true` numa fatia mergeada é exatamente o defeito
que esse campo existe para impedir. Nada disso é executado agora.
