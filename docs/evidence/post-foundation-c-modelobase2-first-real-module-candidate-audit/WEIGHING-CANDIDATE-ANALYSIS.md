# Weighing (Pesagem) Candidate Analysis

## Arquivos existentes

**Nenhum módulo real de pesagem.** Matches de `pesag`/`peso`/`balanc`:

- `src/runtime/__tests__/modelobase2-operational-runtime-foundation.test.js` — fixture MB2
  (`moduleId:'pesagem'`).
- `src/index.css`, `src/styles/erp-responsive.css` — `font-weight` ("peso" da fonte).
- `src/framework/cadastro/layouts/empFormRowBalance.js` e afins — **"balance"** de layout flexível,
  não balança de pesagem.

⇒ Pesagem é candidato **greenfield**.

## Migrations / legacy

Nenhuma migration ou legacy de pesagem. Não há `balança`/device driver, nem tabela/serviço.

## Fluxo atual

Não há. O fluxo **alvo** (novo) também é append, porém com **cálculo** e potencial **integração de
device**:

- criar pesagem: `{ bruto, tara, liquido = bruto - tara, ticket?, itemId? }`
- editar/remover: `updateEntry`/`removeEntry`
- validar/salvar/submeter local: idem fuel

## Dados de entrada

`{ data, bruto, tara, ticket?, itemId?, operador? }` — inclui **derivação** (líquido) e, no mundo
real, leitura de **balança** (hardware) — acoplamento adicional.

## Dados de saída

- draft de pesagens + event log + read state + snapshot (igual estrutura do runtime).

## Dependências

- **backend/API**: nenhuma no headless; porém o valor real depende de integração com balança/ticket.
- **Prisma/schema**: nenhuma no headless.
- **device (balança)**: acoplamento futuro (fora do escopo headless, mas é um risco de design).

## Offline/local

Compatível com localOnly, mas a captura real costuma vir de um periférico (balança), o que adiciona
uma camada de integração que o fuel não tem.

## Compatibilidade ModeloBase2

- **event log / command / snapshot / payload**: boa — pesagens são appends.
- Ponto de atrito: **cálculo derivado** (líquido) e **device** empurram complexidade para além do
  append puro já no primeiro slice.

## Riscos

- Modelar cedo a integração com balança/ticket.
- Regras de negócio de tara/estorno adicionam validação não trivial.

## Classificação

- **risco:** médio (greenfield, mas com device/cálculo latentes)
- **prontidão ModeloBase2:** média-alta
- **recomendação:** **candidato SIM, porém ADIAR** — depois do fuel, quando o padrão headless estiver
  provado com um domínio mais simples.
