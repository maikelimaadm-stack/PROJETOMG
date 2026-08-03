# Post-merge revalidation plan

Esta branch **não pode** certificar a `main`. A regressão que ela corrige existiu exatamente
porque a certificação anterior mediu apenas o ambiente em que os checks podiam passar.

## O que deve ser executado NA `main`, depois do merge manual

```bash
git fetch origin --prune
git checkout main
git pull --ff-only origin main
git status --short          # precisa estar limpa
git rev-parse HEAD          # precisa conter o merge commit desta PR

npm run test:runtime                 # OBRIGATÓRIO: zero fail, total >= 20425
npm run gate:g423                    # OBRIGATÓRIO: 7/7
npm run lint
npm run build
```

Depois, individualmente na `main`, com diff vazio:

```bash
npm run test:runtime:studio-scope-governance-main-diff-correction
npm run gate:g423-studio-scope-governance-main-diff-correction
npm run test:runtime:studio-scope-governance-chronological-migration
npm run gate:g423-studio-scope-governance-chronological-migration
```

E os 22 gates Studio, um a um. Critério de aceite:

```
22/22 exit 0
zero gate com "blocked: no_active_slice_resolved"
zero gate com "unit tests PASS — 0 scenarios"
```

E o sweep completo `gate:g423*`:

```
nenhum gate Studio vermelho
eventuais vermelhos exclusivamente pré-Studio, classificados arquivo a arquivo
nenhum vermelho novo
```

## Por que a prova na branch não basta

Na branch o diff é não vazio, então o caminho exercitado é o da delegação ao core. Na `main` o
diff é vazio, e o caminho exercitado é o da borda. Os dois caminhos são cobertos por cenários
diretos (`D001`–`D028`), mas a execução real na `main` é a única prova de que os consumidores
realmente atravessam a borda como esperado.

## Só depois disso

A PR #495 pode incorporar a `main` e ser revalidada por inteiro. Antes disso, incorporar a `main`
importaria as 41 falhas do baseline para dentro dela.
