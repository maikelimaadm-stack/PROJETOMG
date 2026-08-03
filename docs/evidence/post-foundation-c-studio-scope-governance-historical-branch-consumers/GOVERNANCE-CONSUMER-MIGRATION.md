# Migração dos consumidores de governança

## Quem é consumidor

Consumidor, aqui, é o artefato que **julga um diff de branch**. Um teste que apenas exercita a
API do guard diretamente não é consumidor: ele não pergunta "esta branch está sã?", ele pergunta
"esta função responde o que deve?".

Por isso a lista tem **cinco** entradas, não seis:

```
scripts/gates/g423-studio-scope-governance-maintenance.mjs
src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js
scripts/gates/g423-studio-scope-governance-chronological-migration.mjs
src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js
scripts/gates/g423-studio-scope-governance-main-diff-correction.mjs
```

`src/runtime/__tests__/studio-scope-governance-maintenance.test.js` está **deliberadamente fora**.
Ele nunca chamou `evaluateStudioBranchDiffScope` — verificável em `origin/main` — e continua sem
chamar nada de fronteira. Consequência prática: ele **não** está na lista de
`crossSliceAuthorizedPatterns` desta fatia. Autorização cruzada que não corresponde a um arquivo
realmente tocado é escopo morto, e escopo morto enfraquece a regra de que a lista é exata.

## O que mudou em cada um

| arquivo | antes | agora |
|---|---|---|
| `g423-studio-scope-governance-maintenance.mjs` | filtros diretos, sem julgamento cronológico de branch | acrescenta `CALLER_SLICE_ID` + julgamento por `evaluateStudioBranchConsumerScope`, ao lado dos filtros que já existiam |
| `studio-scope-governance-chronological-migration.test.js` | `evaluateStudioBranchDiffScope` no bloco de branch | `evaluateStudioBranchConsumerScope` no bloco de branch; mantém os testes **diretos** de `evaluateStudioBranchScope` e `evaluateStudioBranchDiffScope` como semântica do core |
| `g423-studio-scope-governance-chronological-migration.mjs` | idem | idem |
| `studio-scope-governance-main-diff-correction.test.js` | idem | idem |
| `g423-studio-scope-governance-main-diff-correction.mjs` | idem | idem |

O ponto crítico: os dois testes de governança **continuam** exercitando o core diretamente. Se
alguém enfraquecer `evaluateStudioBranchScope` ou `evaluateStudioBranchDiffScope`, eles reprovam.
A migração trocou apenas o julgamento *da própria branch*, não a cobertura da semântica.

## Ajustes de catálogo nos testes das fatias 42 e 43

- asserções de tamanho do catálogo passaram de igualdade rígida para `>= n` + contiguidade a
  partir de 1, para não quebrarem a cada fatia nova;
- "exatamente uma fatia ativa" passou a ser verificado por contagem, não pelo id fixo;
- as varreduras de fonte agora esperam `evaluateStudioBranchConsumerScope`;
- a fatia 44 entrou nas exclusões de herança cruzada e no mapa de marcadores (`44`), e o par
  `[43, 44]` entrou na matriz de ambiguidade.
