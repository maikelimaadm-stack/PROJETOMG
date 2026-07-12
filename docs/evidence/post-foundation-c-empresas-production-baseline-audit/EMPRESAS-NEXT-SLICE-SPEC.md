# Empresas — Next Slice Spec

## Próximo slice recomendado

**POST-FOUNDATION C — EMPRESAS CONTROLLED PRODUCTION TEST PLAN**

Objetivo: **planejar** (ainda **sem implementar**) como testar produção real em Empresas, dado que
Empresas já é um sistema vivo com backend/Prisma/persistência real.

> O próximo passo é um **plano controlado**, não implementação direta de backend/Prisma.

## Objetivo do próximo slice

Produzir o plano de testes que precede qualquer piloto real (read → write → persistence), com
critérios objetivos para liberar cada etapa.

## Escopo permitido (próximo slice)

- `docs/evidence/post-foundation-c-empresas-controlled-production-test-plan/`
- `src/runtime/__tests__/post-foundation-c-empresas-controlled-production-test-plan.test.js`
- `scripts/gates/g423-empresas-controlled-production-test-plan.mjs`
- `package.json`

## Escopo proibido (próximo slice)

- alterar `src/modules/empresas/`, `src/modules/cadcps/`, `src/ModeloBase1/`, `src/ModeloBase2/`
- alterar `src/pages/`, `src/App.jsx`, menu, CSS global
- alterar `backend/`, `schema.prisma`, migrations
- alterar runtimeBridge/makBootstrap real
- implementar qualquer backend/Prisma/persistência
- dependência nova

## Testes necessários (próximo slice)

- teste que valida a existência e a coerência dos documentos do test plan
- validação de que nenhuma implementação de backend/Prisma ocorreu

## Gates necessários (próximo slice)

- `g423-empresas-controlled-production-test-plan` (docs existem; escopo respeitado; backend/Prisma
  intocados; próximo passo = pilot read-only controlado)

## Evidências necessárias (próximo slice)

- CERTIFICATION-REPORT
- TEST-STRATEGY (read → write → persistence, com gates por etapa)
- READ-PILOT-CRITERIA / WRITE-PILOT-CRITERIA / PERSISTENCE-PILOT-CRITERIA
- ROLLBACK-FALLBACK-PLAN
- DATA-SAFETY (dados de teste isolados de produção)

## Critérios para permitir backend/Prisma futuramente

- test plan aprovado
- paridade de leitura verde (já existente) + paridade de escrita definida
- backup/rollback plan
- dados de teste isolados
- gate próprio por etapa
- aprovação explícita do mantenedor

## Critérios de rollback/fallback

- toda ativação atrás de flag reversível (fail-closed em produção)
- fallback = comportamento atual byte-idêntico
- rollback de dados via backup/migration plan

## Relatório final esperado (próximo slice)

Relatório curto confirmando: plano criado, nada implementado, backend/Prisma intocados, próximo
passo = Read Pilot controlado sob aprovação.
