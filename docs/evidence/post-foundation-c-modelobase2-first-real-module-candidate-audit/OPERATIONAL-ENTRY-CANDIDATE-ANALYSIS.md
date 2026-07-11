# Operational Entry (Apontamento) Candidate Analysis

## Arquivos existentes

**Nenhum módulo real de apontamento/lançamento operacional.** Matches de `apont`/`lancament`/
`ordem`/`offline`:

- `src/ModeloBase2/**` e testes — fixtures MB2 (`operationType:'lancamento'`).
- `src/modules/empresas/preferences/*`, `src/framework/mak/preferences/*` — "ordem" de colunas/
  campos (preferências de UI), **não** ordem de serviço.
- `src/apis/auth/AuthApi.js` — comentário com "offline".

⇒ Apontamento é candidato **greenfield** e **o menos definido** dos três.

## Fluxo atual

Não há. O domínio "apontamento operacional" é o **mais amplo e variável**: atividade, operador,
serviço, ordem, execução, tempo, quantidade — o shape muda muito por operação (campo, oficina,
transporte, etc.).

## Dados de entrada

Altamente variável: `{ atividade, operador, servico?, ordemId?, inicio?, fim?, quantidade? }` — sem
um shape mínimo consensual. Isso é um **risco de modelagem prematura**.

## Dados de saída

- draft de apontamentos + event log + read state + snapshot (estrutura do runtime), porém com
  entries heterogêneas.

## Dependências

- **backend/API/Prisma**: nenhuma no headless; mas o valor real depende de ligar a ordens/serviços
  que **também não existem** ainda.

## Compatibilidade ModeloBase2

- **event log / command / snapshot**: compatível (é append), mas a **falta de shape estável** torna
  a validação de payload e o read state derivado menos claros que no fuel.

## Riscos

- Shape indefinido → alto risco de retrabalho.
- Tende a puxar dependências (ordens, serviços, operadores) que não existem.

## Classificação

- **risco:** médio-alto (shape variável, dependências latentes)
- **prontidão ModeloBase2:** média-baixa
- **recomendação:** **candidato SIM em teoria, ADIAR** — só depois que fuel (e talvez pesagem)
  consolidarem o padrão headless e o vocabulário de shape.
