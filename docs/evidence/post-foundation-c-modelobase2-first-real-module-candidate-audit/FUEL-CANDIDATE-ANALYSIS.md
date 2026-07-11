# Fuel (Combustível) Candidate Analysis

## Arquivos existentes

**Nenhum módulo real de combustível.** Os únicos matches de `combust`/`fuel`/`litros` são
**fixtures** do ModeloBase2 (`src/ModeloBase2/prototype-adapter/*`,
`src/ModeloBase2/operational-runtime/createModeloBase2OperationalRuntime.js`, e os testes), onde
`moduleId:'combustivel'` e `values:{ litros }` são usados como exemplo.

⇒ Combustível é um candidato **greenfield** (a construir do zero, headless).

## Fluxo atual

Não há fluxo atual (não existe módulo). O fluxo **alvo** (novo) é um clássico event/append:

- **criar lançamento**: 1 abastecimento = 1 entry (`appendEntry`)
- **editar lançamento**: `updateEntry`
- **remover lançamento**: `removeEntry`
- **validar/salvar/submeter local**: `validateDraft` → `saveDraft` → `submitDraft` (simulado)
- **snapshot/restore**: revisão local

## Dados de entrada (proposta mínima)

`{ data, maquinaId, litros, horimetro?, tanque?, operador? }` — todos escalares simples, sem objeto
aninhado obrigatório.

## Dados de saída

- draft operacional com entries de abastecimento
- event log append-only (`entry.added`/`entry.updated`/…)
- read state derivado (entries + summary: totalLitros implícito via entries + timeline)
- snapshot local para conferência

## Dependências

- **backend/API**: nenhuma necessária no modo headless (greenfield).
- **Prisma/schema**: nenhuma (não persiste real).
- **runtimeBridge**: nenhuma.
- **UI**: nenhuma no primeiro slice.

## Offline/local

Naturalmente offline-first: um abastecimento é registrado no campo e sincronizado depois. Casa
perfeitamente com `localOnly:true` / `sent:false` / `persistenceReal:false` do runtime.

## Compatibilidade ModeloBase2

- **event log**: excelente — cada abastecimento é um append natural.
- **command resolver**: excelente — mapeia 1:1 (createDraft/appendEntry/…).
- **snapshot**: excelente — draft de abastecimentos serializa trivialmente.
- **payload validation**: excelente — campos escalares, sem função/handler/target.

## Riscos

- Definir campos mínimos sem escopo excessivo (evitar modelar tanque/bomba/estoque agora).
- Não introduzir persistência real cedo demais.

## Classificação

- **risco:** baixo (greenfield, headless)
- **prontidão ModeloBase2:** alta
- **recomendação:** **candidato SIM — melhor primeiro**
