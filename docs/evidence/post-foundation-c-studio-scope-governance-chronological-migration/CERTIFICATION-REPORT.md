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

## Correção pós-auditoria (mesma PR #496)

Dois blockers da auditoria foram corrigidos nesta mesma branch:

- **B-EXPLICIT-FORBIDDEN-NOT-CATALOG-BOUND** — a autorização de caminho proibido passou a ser um campo de TODA entrada do catálogo (42/42), declarado apenas pela fatia `dev-preview-app-integration` (2 padrões). A opção de caller foi removida de `evaluateStudioBranchScope`; a autorização vem exclusivamente da fatia ATIVA, entra em `allowed` e em `explicitForbiddenAuthorized`, e nunca cai em `unknown` nem é herdada. Ver `EXPLICIT-FORBIDDEN-CATALOG-BINDING.md` e `APP-INTEGRATION-OWN-SLICE-REGRESSION.md`.
- **B-HISTORICAL-SUBSTRING-GUARDS-GLOBALLY-WEAKENED** — as regras originais dos 17 testes e 12 gates históricos foram restauradas literalmente; a única exceção é a lista EXATA de caminhos autorizados para a fatia de migration, aplicada somente quando ela é a ativa. Caminhos apenas semelhantes e não catalogados continuam falhando. Ver `HISTORICAL-SUBSTRING-SEMANTICS-PRESERVATION.md`.

Novos helpers puros no guard: `getAuthorizedPatternsForStudioSlice`, `isPathAuthorizedForStudioSlice`, `getExplicitlyAuthorizedForbiddenPatternsForStudioSlice`.
