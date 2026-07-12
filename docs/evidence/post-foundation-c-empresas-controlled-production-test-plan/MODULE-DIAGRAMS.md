# Module Diagrams — Empresas Controlled Production Test Plan

## Diagrama 1 — Camadas de teste

```mermaid
flowchart TD
  CTP[Empresas Controlled Test Plan] --> UT[Unit Tests]
  CTP --> LI[Local Integration]
  CTP --> ST[Staging Isolado]
  CTP -. proíbe mutation .-> PROD[Produção]
```

## Diagrama 2 — Run sintético e cleanup

```mermaid
flowchart TD
  RUN[Synthetic Test Run] --> TID[TestRunId]
  TID --> TT[Tenant Sintético]
  TID --> TU[Usuário Sintético]
  TID --> TE[Empresa Sintética]
  TE --> CL[Cleanup]
  CL --> EV[Evidence]
```

## Diagrama 3 — Paridade e fallback

```mermaid
flowchart TD
  MB1[ModeloBase1] --> LRP[Legacy Read Path]
  RV2[Runtime v2] --> RRM[Runtime Read Model]
  LRP --> PG[Parity Gate]
  RRM --> PG
  RRM --> FB[Fallback]
  FB --> LRP
```

## Diagrama 4 — Gates de segurança

```mermaid
flowchart TD
  EG[Environment Gate] -. bloqueia .-> PM[Production Mutation]
  FG[Fixture Gate] -. bloqueia .-> RD[Real Data]
  PG2[Permission Gate] -. bloqueia .-> TL[Tenant Leakage]
  CG[Cleanup Gate] -. bloqueia .-> IT[Incomplete Test Run]
  MG[Migration Gate] -. bloqueia .-> PSC[Production Schema Change]
```

## Leitura

- Testes progridem de unit → local integration → staging isolado; **produção nunca recebe mutation**.
- Todo run sintético é rastreado por `testRunId`, com tenant/usuário/empresa sintéticos e cleanup por ID.
- Paridade ModeloBase1 × runtime-v2 é verificada; fallback volta ao caminho legado byte-idêntico.
- Cinco gates de segurança bloqueiam produção, dados reais, tenant leakage, run incompleto e migration.
