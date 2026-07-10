# Post-Foundation C — Module Diagrams

Runtime v2 Dev Preview Route — position, flow, and isolation from production.

---

## Dev preview route — dev-only, flag-protected

```mermaid
flowchart TB
  ROUTE[Dev Preview Route] --> HUB[Runtime v2 Dev Preview Hub]
  HUB --> DS[Controlled Dev Dataset]
  DS --> EMPD[Empresas Dataset]
  DS --> CADD[cadcps Dataset]
  HUB --> EMPP[Empresas Preview]
  HUB --> CADP[cadcps Preview]

  EUI[Empresas UI real] -. não controlada .-> LEG[Runtime legado]
  CUI[cadcps UI real] -. não controlada .-> LEG

  ROUTE -->|flag off default / produção| FALLBACK[safe fallback — dev-only notice]
  ROUTE -->|flag on em dev| MODEL[createRuntimeV2DevPreviewRouteModel]
  MODEL --> PAGE[RuntimeV2DevPreviewRoutePage]
```

**Path:** `/__dev/runtime-v2/previews` — dev-only, declared as a constant/descriptor, NOT mounted into the production router or main menu.
**Depends on:** the hub model builder + controlled dataset (opt-in). The route React components are never exported from the runtime barrel and never wired into `src/App.jsx`.

---

## Flag gating — three flags, fail-closed

```mermaid
flowchart TB
  ENV[env] --> RF{MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE === true?}
  RF -->|não| OFF[route off — safe fallback]
  RF -->|sim| PRODQ{produção?}
  PRODQ -->|sim, sem override| OFF2[fail closed — safe fallback]
  PRODQ -->|não / override explícito| HUBQ{hub flag on?}
  HUBQ -->|não| NOHUB[route renders, hub not rendered]
  HUBQ -->|sim| DSQ{dataset flag on?}
  DSQ -->|não| HUBONLY[hub previews, no dataset summary]
  DSQ -->|sim| FULL[hub previews + dataset summary]
```

---

## Wiring decision — exportable, not mounted

```mermaid
flowchart LR
  subgraph Production["src/App.jsx (central router) — INTOCADO"]
    APP[Routes] -. guarded by every prior gate .-> UI[Real screens]
  end
  subgraph Route["preview/dev/route — exportable route unit"]
    RC[RuntimeV2DevPreviewRoute] --> RP[RuntimeV2DevPreviewRoutePage]
    DESC[getRuntimeV2DevPreviewRouteDescriptor path+Component]
  end
  Route -. pronta para montar (futuro dev-only) .-> Production
  Production -. NÃO alterada neste slice .-> Route
```

Montar a rota em `src/App.jsx` faria a checagem "no production UI change (src/App.jsx…)" de todos os gates anteriores falhar. Por isso a rota é entregue como unidade exportável e auto-protegida, com o path correto, pronta para montar — sem alterar `src/App.jsx`.
