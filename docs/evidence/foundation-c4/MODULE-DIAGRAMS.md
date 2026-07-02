# Foundation C.4 — Module Diagrams

Permanent requirement (C.4+): each Runtime module ships with a Mermaid diagram showing position and dependencies.

---

## M07 — Dependency Resolver

```mermaid
flowchart TB
  CRB[CrbPayload.objects] --> DA[DependencyAnalyzer]
  DA --> DG[DependencyGraph]
  DV[DependencyValidator] --> DR[DependencyResolver]
  DS[DependencySorter] --> DR
  DA --> DR
  DR --> OUT[Immutable initOrder + DAG]
  M06[M06 CRB Loader] --> CRB
  DR --> M20[M20 Service Locator C.5]
  DR --> M01[M01 Bootstrap RT-3.1]
```

**Depends on:** M06 CRB Loader (object envelopes)  
**Consumed by:** M01 Bootstrap, M20 Service Locator, M08 Router (indirect via init order)

---

## M08 — Runtime Router

```mermaid
flowchart TB
  CRB[CrbPayload.route] --> RM[RouteMetadata]
  RM --> RR[RouteRegistry]
  RMatch[RouteMatcher] --> RRes[RouteResolver]
  RR --> RT[RuntimeRouter]
  RRes --> RT
  RT --> NAV[NavigationTable]
  RT --> MATCH[RouteMatch screenId + params]
  M04[M04 Registry routes] -.-> RR
  M06[M06 CRB Loader] --> CRB
  RT --> M12[M12 Render Engine C.8]
  M09[M09 Permission canActivate C.5] -.-> RT
```

**Depends on:** M06 CRB Loader, M04 Registry (route entries)  
**Consumed by:** M12 Render Engine, host navigation (C.8+)

---

## C.4 Pipeline Position

```mermaid
flowchart TD
  B[Bootstrap M01] --> C[Context M02]
  C --> S[Session M03]
  S --> R[Registry M04]
  R --> L[Loader M05]
  L --> CRB[CRB Loader M06]
  CRB --> DEP[Dependency Resolver M07]
  DEP --> RT[Runtime Router M08]
  RT --> READY[Runtime Ready]
```
