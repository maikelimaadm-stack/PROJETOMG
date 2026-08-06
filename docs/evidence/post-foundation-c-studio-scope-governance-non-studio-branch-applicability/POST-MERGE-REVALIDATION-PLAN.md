# Plano de revalidação pós-merge — Slice 46

Executar **na `main` real**, depois do merge manual, com diff vazio.

## 1. Estado

```bash
git checkout main && git pull --ff-only origin main
git diff --name-only origin/main...HEAD     # deve ser vazio
```

## 2. Bateria

```bash
npm run test:runtime
npm run gate:g423
npm run test:runtime:studio-scope-governance-non-studio-branch-applicability
npm run gate:g423-studio-scope-governance-non-studio-branch-applicability
npm run lint && npm run build
npm run typecheck:governance
npm run gate:certification && npm run gate:governance && npm run gate:deploy-pipeline
```

Metas: zero fail, zero skipped, `gate:g423` 7/7, gate desta fatia 100%.

## 3. Catálogo em repouso

```
46 entradas · ordinais 1..46 · 10 chaves
merged-family 46 · plain merged 45 · slice39 merged_without_dedicated_artifacts
active_slice 0 · open_pull_request_* 0 · compatibility true 0
```

## 4. Aplicabilidade na main

Com diff vazio, todo consumidor deve reportar `empty_branch_diff` — **não**
`non_studio_branch`. As duas razões não podem se confundir.

## 5. Pré-requisito liberado

Com esta fatia na `main`, uma branch contendo apenas
`.github/workflows/foundation-governance.yml` deve produzir `non_studio_branch` /
`notApplicable` / `safe` em todos os consumidores. Só então a PR de enforcement de CI
(P1-01) deve ser aberta.

`mainVerifiedGreen` só vira `true` quando tudo acima estiver verde na `main`.
