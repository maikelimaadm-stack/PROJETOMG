# Studio Module Preview Sandbox Contract — Relatório

O **Module Preview Sandbox Contract** consome o Studio Blueprint Engine e o Module
Reference Planner (como contratos headless) e produz APENAS metadata de preview de módulo.

## O que produz

sessão de sandbox · table/form/detail/field/action/permission preview metadata ·
route-menu blocked metadata · persistence blocked metadata · runtime binding metadata ·
readiness decision · manifest · verifier · compatibility checker · diagnostics · fallback.

## O que NÃO faz

Não cria UI real, não cria componente React, não gera módulo real, não escreve em
`src/modules`, não ativa rota/menu, não cria backend/Prisma/migration, não acessa
produção/staging, não executa mutation, não cria persistência real, não reescreve Empresas.

## Pipeline

`planner → session → (table|form|detail|field|action|permission) preview metadata →
route-menu blocked → persistence blocked → runtime binding → readiness → manifest →
verifier → compatibility → diagnostics → fallback`.

## Números

- 20 arquivos-fonte · 229 cenários de teste · 18 docs.
- readiness: `module_preview_sandbox_contract_ready`; readyForRealModuleGeneration/Production: `false`.
