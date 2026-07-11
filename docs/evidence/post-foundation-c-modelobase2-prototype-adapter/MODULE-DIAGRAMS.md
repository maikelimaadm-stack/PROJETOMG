# Module Diagrams — ModeloBase2 Prototype Adapter

```mermaid
flowchart TD
  MB2[ModeloBase2 Prototype Adapter] --> GMR[Generic Model Runtime]
  MB2 --> GRC[Generic Read Contract]
  MB2 --> GWC[Generic Write Contract]
  MB2 --> OEC[Operational Event Contract]
  OEC --> TL[Local Event Timeline]
  TL --> DR[Operational Draft]
  DR --> SNP[Generic Snapshot]
  SNP --> MEM[Generic InMemory Adapter]
  MB1[ModeloBase1] -. coexistente .-> GMR
  EC[Empresas/cadcps] -. inalterados .-> MB1
```

## Fluxo de mutation → evento

```mermaid
flowchart TD
  A[applyMutation operation+payload] --> B{operação conhecida?}
  B -- não --> F[fail-closed: erro]
  B -- sim --> C[writeContract.validateOperation → generic op]
  C --> D{payload válido/seguro?}
  D -- não --> F2[fail-closed: blockers]
  D -- sim --> E[muta draft imutável entries/status]
  E --> G[eventContract.createEvent append-only + checksum]
  G --> H[draft novo: events+summary, sent:false, persistenceReal:false]
```

## Coexistência multi-tipo

```mermaid
flowchart LR
  K[runtime/generic-model kernel puro] --> A1[modeloBase1 adapter cadastro]
  K --> A2[modeloBase2 prototype adapter operacional]
  A1 -. table/form .-> K
  A2 -. entries/event timeline .-> K
  A2 -. NÃO importa .-> A1
  A2 -. NÃO importa .-> M[src/modules/empresas|cadcps]
```
