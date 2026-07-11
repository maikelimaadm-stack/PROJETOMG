# Module Diagrams — ModeloBase2 Operational Runtime Foundation

```mermaid
flowchart TD
  RT[ModeloBase2 Operational Runtime] --> SESS[Operational Session]
  SESS --> SM[State Machine]
  SESS --> CR[Command Resolver]
  CR --> PV[Payload Validation]
  PV --> AC[Apply Command]
  AC --> EL[Event Log]
  EL --> RS[Derived Read State]
  RS --> SB[Snapshot Bridge]
  SB --> GMS[Generic Model Snapshot]
  SB --> MEM[Generic InMemory Adapter]
  RT --> GMR[Generic Model Runtime]
  GMR --> MT[Multi-Type Conformance]
  FUT[Fuel/Pesagem Candidate] -. proximo .-> RT
```

## Ciclo local completo

```mermaid
flowchart LR
  A[idle] -->|createDraft| B[draft]
  B -->|appendEntry| C[dirty]
  C -->|validateDraft ok| D[valid]
  C -->|validateDraft fail| E[invalid]
  D -->|saveDraft| F[saved_local]
  E -->|saveDraft warn| F
  F -->|submitDraft| G[submitted_simulated]
  G -->|createSnapshot| G
  G -->|restoreSnapshot| G
  G -->|resetDraft| H[reset]
```

## Composição / isolamento

```mermaid
flowchart LR
  OR[operational-runtime/*] --> PROTO[ModeloBase2 prototype-adapter]
  OR --> K[runtime/generic-model kernel]
  OR -. NÃO importa .-> MB1[ModeloBase1]
  OR -. NÃO importa .-> MOD[src/modules/empresas|cadcps]
  OR -. NÃO importa .-> RB[backend/Prisma/runtimeBridge/React]
```
