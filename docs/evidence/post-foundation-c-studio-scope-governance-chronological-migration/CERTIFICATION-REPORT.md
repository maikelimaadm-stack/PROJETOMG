# Certification report — Studio Scope Governance Chronological Migration

Fatia de governança SEPARADA. Não contém o Builder. Deixa a PR #495 aberta e bloqueada.

## Problema resolvido

`isKnownLaterStudioHeadlessArtifact(path)` consultava um registry global e plano, sem receber a identidade cronológica da fatia chamadora. Um caminho registrado não era necessariamente posterior ao chamador — apenas existia. A regra "nenhum teste/gate anterior alterado" ficava enfraquecida em vez de satisfeita.

## Solução

`STUDIO_SLICE_CATALOG` declara ordinais estáveis por fatia; `evaluateStudioBranchScope(changedPaths, { callerSliceId })` resolve exatamente uma fatia ATIVA a partir dos markers da branch, recusa resolução vazia ou ambígua e admite apenas o que a fatia ativa possui, tem autorização cruzada exata para tocar, ou compartilha.

```
caller conhecido · active conhecido · ordinais estáveis
active >= caller · cross apenas por lista exata
forbidden sempre bloqueia · unknown sempre bloqueia · active ambíguo bloqueia
```

## Escopo

Alterado: registry, guard, 9 testes do agregado oficial, 22 gates Studio, teste/gate/evidências desta fatia, `package.json`.

Não alterado: `productionUiGuard.mjs`, qualquer `src/studio/blueprint-engine/`, o Builder da #495, contratos, runtimes, App/UI, `src/modules`, backend/Prisma, migrations, os 21 gates pré-Studio.

Sem dependência nova. Sem código de produção. Sem rede, backend, Prisma, relógio ou ambiente.

## Estado

Detalhes por eixo nos demais documentos desta pasta; números finais no relatório da PR.
