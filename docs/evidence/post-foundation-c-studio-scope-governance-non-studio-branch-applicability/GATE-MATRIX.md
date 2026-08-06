# Matriz do gate — Slice 46

`npm run gate:g423-studio-scope-governance-non-studio-branch-applicability`

O gate roda checks **vivos** (chamadas reais ao guard), nunca prova por grep apenas:

| grupo | verifica |
|---|---|
| catálogo | 46 entradas · ordinais 1..46 · 10 chaves · zero active/open/compatibility · slice46 merged |
| domínio | raízes congeladas · forbidden dentro do domínio · não registrado governado continua governado |
| segurança | a derivação `!== 'unknown_scope'` NÃO aparece em `isStudioGovernedDomainPath` |
| boundaries | `non_studio_branch` existe nos dois boundaries e em nenhum outro lugar |
| núcleo | `evaluateStudioBranchScope` não conhece o predicado nem a razão |
| matriz A–O | cada caso reexecutado por chamada real |
| histórico | matriz de consumidor histórico fail-closed |
| pureza | guard importa só o registry; sem execSync/fetch/env/clock no guard e no registry |
| cross | exatamente 3 padrões, sem wildcard, teste do Builder ausente, guard permanece shared |
| Builder ownership | BLD-A..H por chamada real + BLD-S001..S007 por varredura da fonte |
| escopo | esta branch não toca `.github/`, produto, backend, Prisma nem evidência alheia |
