# Module Diagrams — Empresas Local Read Parity Hardening

## Diagrama 1 — Pipeline de hardening

```mermaid
flowchart TD
  DS[Scaled Synthetic Dataset] --> QM[Composite Query Matrix]
  QM --> RR[Read-Only Repository]
  RR --> AA[API Adapter]
  AA --> RP[Runtime Projection]
  RP --> PSR[Parity Scenario Runner]
  PSR --> PD[Parity Digest]
  PD --> HD[Hardening Diagnostics]
```

## Diagrama 2 — Isolamento e permissões

```mermaid
flowchart TD
  TFM[Tenant Fuzz Matrix] --> TI[Tenant Isolation]
  PM[Permission Matrix] --> PFC[Permission Fail Closed]
  TI --> RR[Read-Only Repository]
  PFC --> RR
  TL[Tenant Leakage] -. bloqueia .-> CERT[Certification]
  PB[Permission Bypass] -. bloqueia .-> CERT
```

## Diagrama 3 — Performance (não é SLA)

```mermaid
flowchart TD
  PB[Performance Baseline] --> T[Tiny Dataset]
  PB --> S[Small Dataset]
  PB --> M[Medium Dataset]
  PB --> L[Large Dataset]
  PB -. não é SLA .-> PROD[Production]
```

## Diagrama 4 — Blockers

```mermaid
flowchart TD
  MA[Mutation Attempt] --> MB[Mutation Blocker]
  PA[Production Attempt] --> PBK[Production Blocker]
  BA[Backend Attempt] --> BBK[Backend Blocker]
  PRA[Prisma Attempt] --> PRBK[Prisma Blocker]
  FA[Fetch Attempt] --> FBK[Fetch Blocker]
  MB --> HF[Hardening Fallback]
  PBK --> HF
  BBK --> HF
  PRBK --> HF
  FBK --> HF
```
