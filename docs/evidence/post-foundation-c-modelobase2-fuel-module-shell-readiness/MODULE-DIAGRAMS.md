# Module Diagrams — Fuel Module Shell Readiness

```mermaid
flowchart TD
  R[Fuel Module Shell Readiness] --> C[Fuel Module Contract]
  C --> M[Fuel Metadata]
  C --> RP[Route Plan]
  C --> MP[Menu Plan]
  C --> PP[Permission Plan]
  C --> PB[Persistence Boundary]
  C --> UI[UI Composition]
  UI --> S[Fuel UI Sandbox]
  S --> H[Fuel Headless]
  H --> OR[ModeloBase2 Operational Runtime]

  R -. não registra .-> MOD[src/modules]
  R -. não altera .-> APP[App.jsx]
  R -. não aparece .-> MENU[Menu]
  R -. não usa .-> BE[Backend]
  R -. não usa .-> PRISMA[Prisma]
```

## Leitura

- A **readiness** é o topo: compõe o contrato e todos os planos/boundaries.
- O **contrato** aponta para metadata, planos de rota/menu/permissão, persistence boundary e
  UI composition.
- A **UI composition** reutiliza o **Fuel UI Sandbox**, que consome o **Fuel Headless**, que roda
  sobre o **ModeloBase2 Operational Runtime**.
- As arestas tracejadas mostram tudo o que a readiness **não** faz: não registra módulo, não
  altera App.jsx, não aparece no menu, não usa backend nem Prisma.
