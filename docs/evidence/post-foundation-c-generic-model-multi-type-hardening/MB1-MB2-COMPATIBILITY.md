# MB1 / MB2 Compatibility

## O que ModeloBase1 prova

- Um modelo **cadastro** (table/form, CRUD local) consome o generic kernel via
  `generic-model-adapter/` e passa a conformance de `cadastro` (score 1.00).
- `eventAppend` false é **aceito** para cadastro.

## O que ModeloBase2 prova

- Um modelo **operacional** (entries + timeline de eventos locais, append) consome o **mesmo**
  kernel e passa a conformance de `operacional` (score 1.00).
- `eventAppend` true, `sent` false, `persistenceReal` false.

## Contratos compartilhados

Ambos usam os mesmos primitivos genéricos (runtime/read/write contracts, safety, snapshot,
versioning, diagnostics, fallback, in-memory adapter). A multi-type suite valida os dois
**simultaneamente** com os mesmos invariantes comuns.

## Diferenças (permitidas e documentadas)

| | cadastro | operacional |
|---|---|---|
| superfície central | table/form | entries/timeline/event |
| estilo de escrita | crud-local | event-append |
| eventAppend | false | true |
| sent | n/a | false |

## Invariantes comuns (provados pela suite)

- `backendTouched` / `prismaTouched` / `runtimeBridgeTouched`: **false**
- `dangerousCapabilities`: **false**
- `persistenceReal`: **false**
- `fallback` e `diagnostics` disponíveis
- retornos são cópias seguras; sem mutação de input
- sem fetch; sem storage obrigatório

## O que prova que o Generic Kernel serve para >1 tipo

Dois `modelFamily` distintos (`modeloBase1`/cadastro e `modeloBase2`/operacional) passam
conformance formal contra o **mesmo** registry/capability-matrix/kernel, com shapes de leitura e
estilos de escrita diferentes, **sem o kernel importar nenhum dos dois** (adapters injetados).

## Riscos restantes

- conformance rígida demais (bloquear um adapter futuro legítimo) ou frouxa demais.
- registry virar abstração prematura.
- tipos futuros (movimentacao/financeiro/workflow) exigirem novos contracts (ex.: transação).

## Próximo passo

**ModeloBase2 Operational Runtime Foundation** — dar corpo ao runtime operacional sobre a base já
provada conformante.
