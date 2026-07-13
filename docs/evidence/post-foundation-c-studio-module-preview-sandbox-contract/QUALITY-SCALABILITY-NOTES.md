# QUALITY & SCALABILITY NOTES — STUDIO MODULE PREVIEW SANDBOX CONTRACT

## Objetivo

Criar um contrato headless de preview sandbox que transforma o Module Reference Plan em
metadata de preview, sem criar UI real ou módulo real.

## Qualidade

- separa preview metadata de React/UI
- impede geração prematura de módulo
- impede file write em src/modules
- mantém route/menu bloqueados
- mantém persistence/backend/Prisma bloqueados
- mantém produção/mutation bloqueados
- mantém Empresas referenceOnly
- mantém Studio-first policy
- evita alteração de testes/gates antigos

## Escalabilidade

- base para futuro dev preview bridge
- base para visual adapter contract
- base para previews table/form/detail
- base para futuro Studio UI
- base para module registry
- base para geração controlada futura
- base para BI/KPI/Pivot metadata futuros

## Riscos

- preview metadata ser confundido com UI real
- alguém criar React component dentro do sandbox
- route/menu serem ativados cedo demais
- preview virar produção
- persistence ser ligada antes do registry
- module generation antes do registry
- Empresas ser reescrita cedo demais
- allowlists antigas crescerem sem controle
- stacking sobre PR #461 até merge (artefato branch-relative)

## Mitigações

- previewMetadataOnly true
- reactComponentCreated false
- uiCreated false
- route/menu false
- moduleGenerated false
- filesWrittenToModule false
- backend/prisma false
- production/mutation false
- verifier
- compatibility checker
- gate próprio de escopo (tolerante ao planner PR inherited; prova net-new)
- gate check dedicado: testes/gates antigos e productionUiGuard não alterados
- próximo slice ainda é Dev Preview Contract Bridge, não UI real
