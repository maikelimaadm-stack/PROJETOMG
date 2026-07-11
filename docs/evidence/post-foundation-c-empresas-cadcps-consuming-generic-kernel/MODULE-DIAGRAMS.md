# Module Diagrams — Empresas/cadcps Consuming Generic Kernel

```mermaid
flowchart TD
  Empresas[Empresas /CadastroEmpresas] --> MB1[ModeloBase1]
  cadcps[cadcps /CadastroCamposPersonalizados] --> MB1
  MB1 --> RRM[RuntimeReadModel beta]
  RRM --> ADP[ModeloBase1 Generic Adapter]
  ADP --> GMR[Generic Model Runtime]
  GMR --> GRC[Generic Read Contract]
  GMR --> GSAF[Generic Safety]
  GMR --> GDIAG[Generic Diagnostics]
  GMR --> GFB[Generic Fallback]
  ADP --> MST[ModeloBase1 State]
  MST --> UI[ModeloBase1 UI]
  LW[Local Write] -. continua localOnly .-> MB1
  PER[Persistence] -. persistenceReal false .-> MEM[InMemory Adapter]
```

## Caminho de decisão (flag)

```mermaid
flowchart TD
  A[readState MB1 aplicado] --> B{consumption flag on AND betaApplied?}
  B -- não --> L[fluxo atual verbatim<br/>consumptionApplied:false]
  B -- sim --> C[adapter.mapReadToGeneric]
  C --> D{generic.ok?}
  D -- não --> F[fallback: fluxo atual<br/>reason: generic-validation-failed]
  D -- sim --> E[adapter.mapGenericToRead]
  E --> G{objeto válido?}
  G -- não --> F2[fallback: reason invalid-read-model]
  G -- sim --> H[merge no readState original<br/>genericKernelApplied:true]
  C -. throw .-> FA[fallback: reason adapter-failure]
```

## Camadas (isolamento)

```mermaid
flowchart LR
  ACT[activation/*] --> ADP2[generic-model-adapter/*]
  ADP2 --> GK[runtime/generic-model/*]
  ACT -. React só no hook .-> HOOK[useModeloBase1GenericKernelConsumption]
  ACT -. NÃO importa .-> X1[backend/APIs/Prisma]
  ACT -. NÃO importa .-> X2[runtimeBridge/makBootstrap]
  ACT -. NÃO importa .-> X3[src/modules/empresas|cadcps]
```
