# Module Diagrams — Empresas Production Baseline Audit

## Diagrama 1 — Empresas hoje

```mermaid
flowchart TD
  EMP[Empresas] --> MB1[ModeloBase1]
  EMP --> UI[UI Real]
  EMP --> POL[Production Lab Policy]
  MB1 --> RRM[Runtime Read Model]
  RRM -. flag off .-> FB[Fallback config atual]
  RRM -. flag on dev .-> DIAG[Diagnostics / paridade]
  EMP --> REPO[empRepository] --> API[EmpresaApi] --> APIC[apiClient] --> BE[Backend Fastify]
  BE --> PR[Prisma model Empresa]
```

## Diagrama 2 — Estrutura da auditoria

```mermaid
flowchart TD
  AUD[Empresas Production Baseline Audit] --> INV[File Inventory]
  AUD --> UIF[UI Flow Map]
  AUD --> DPM[Data Persistence Map]
  AUD --> BPR[Backend Prisma Readiness]
  AUD --> RR[Risk Register]
  AUD --> NSS[Next Slice Spec]
```

## Diagrama 3 — Política e caminho controlado

```mermaid
flowchart TD
  FUEL[Fuel Sandbox] -. não produção .-> MB2[ModeloBase2 Experimental]
  SFP[Studio First Policy] -. bloqueia módulos novos .-> NM[New Modules]
  EPL[Empresas Production Lab Policy] --> FCP[Future Controlled Persistence Pilot]
  FCP -. exige .-> CTP[Controlled Test Plan]
```

## Leitura

- Empresas já é **produção real**: ModeloBase1 → repository → EmpresaApi → apiClient → backend
  Fastify → Prisma `Empresa`. O `runtimeReadModel` runtime-v2 existe como beta read-only atrás de flag.
- A auditoria produz inventário, mapa de UI, mapa de dados/persistência, readiness de backend/Prisma,
  registro de riscos e a spec do próximo slice.
- Qualquer piloto real segue o caminho controlado (Test Plan → Read/Write/Persistence Pilot), sempre
  com gate + fallback + aprovação. Fuel/ModeloBase2 permanecem fora do caminho de produção.
