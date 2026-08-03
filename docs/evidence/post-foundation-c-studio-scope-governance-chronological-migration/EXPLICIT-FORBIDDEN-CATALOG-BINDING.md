# Explicit forbidden — catalog-bound

## Defeito corrigido (B-EXPLICIT-FORBIDDEN-NOT-CATALOG-BOUND)

`evaluateStudioBranchScope` aceitava `explicitlyAuthorizedForbiddenPatterns` vindo do CALLER. Qualquer chamador podia tentar injetar uma regex ampla, e um caminho como `src/App.jsx` podia sair de `forbidden` mas reaparecer em `unknown`, porque não entrava nos padrões admitidos da fatia ativa. O teste anterior provava apenas `forbidden=[]`, não `safe=true`.

## Correção

`explicitlyAuthorizedForbiddenPatterns` passou a ser um campo de TODA entrada do `STUDIO_SLICE_CATALOG` — 42/42 declaram o campo. Apenas UMA fatia declara algo:

```
dev-preview-app-integration:
  /^src\/App\.jsx$/
  /^scripts\/gates\/lib\/productionUiGuard\.mjs$/
```

Todas as outras 41 declaram `[]`.

`STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN` deixou de ser lista independente: passou a ser DERIVADO da entrada do catálogo, portanto não pode divergir.

A opção de caller foi REMOVIDA da API de `evaluateStudioBranchScope`. A autorização vem exclusivamente de `activeSlice.explicitlyAuthorizedForbiddenPatterns`. Provado por inspeção do corpo da função: não existe leitura de `o.explicitlyAuthorizedForbidden*`, e existe leitura de `activeSlice.explicitlyAuthorizedForbiddenPatterns`.

## Semântica

Quando a fatia ATIVA autoriza um caminho proibido, ele:

- entra em `allowed`;
- **não** entra em `unknown`;
- aparece em `explicitForbiddenAuthorized`;
- não é herdado por nenhuma outra fatia.

Quando a fatia ativa não resolve (zero ou ambígua), NADA é autorizado — nem proibido.

## Provas

| prova | resultado |
|---|---|
| 42/42 entradas declaram o campo | sim |
| exatamente 1 fatia com autorização, com exatamente 2 padrões | sim |
| ambos os padrões ancorados `^…$` e realmente proibidos em `FORBIDDEN_SCOPE_PATTERNS` | sim |
| nenhum deles em `FORBIDDEN_BROAD_ALLOW_SOURCES` | sim |
| export derivado espelha a entrada do catálogo | sim |
| caller injetando `/.*/ ` em 3 formas distintas | bloqueado, `App.jsx` permanece em `forbidden` |
| Builder ativo + `App.jsx` | bloqueado, `explicitForbiddenAuthorized=[]` |
| Migration ativa + `App.jsx` | bloqueado |
| terceiro proibido no App Integration (`src/pages/…`, `backend/…`, `src/modules/…`, `migrations/…`) | bloqueado |
| active não resolvido + `App.jsx` | bloqueado |
| helpers com sliceId desconhecido | retornam vazio |
