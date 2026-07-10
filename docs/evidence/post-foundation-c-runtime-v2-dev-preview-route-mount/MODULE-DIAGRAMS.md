# Post-Foundation C — Module Diagrams

Runtime v2 Dev Preview Route Mount — mount gate, flow, and isolation.

---

## Mount gate — dev-only, flag-protected

```mermaid
flowchart TB
  GUARD[App/Router Dev Guard\nshouldMountRuntimeV2DevPreviewRoute] --> ROUTE[Runtime v2 Dev Preview Route]
  ROUTE --> HUB[Runtime v2 Dev Preview Hub]
  HUB --> DS[Controlled Dev Dataset]
  DS --> EMPD[Empresas Dataset]
  DS --> CADD[cadcps Dataset]

  EUI[Empresas UI real] -. não controlada .-> LEG[Runtime legado]
  CUI[cadcps UI real] -. não controlada .-> LEG

  GUARD -->|não dev ou flag off ou produção| CLOSED[shouldMount = false → não monta / null]
  GUARD -->|dev + route flag on| MOUNT[shouldMount = true → rota montável]
```

**Mount gate:** `shouldMountRuntimeV2DevPreviewRoute(env) = isRuntimeV2DevEnvironment(env) && isRuntimeV2DevPreviewRouteEnabled(env)`.
**Path:** `/__dev/runtime-v2/previews` — dev-only, never in the main menu, never public.

---

## Opt-in wiring — one guarded line, App.jsx untouched

```mermaid
flowchart LR
  subgraph App["src/App.jsx (central Routes) — INTOCADO"]
    ROUTES["<Routes> ... </Routes>"]
  end
  subgraph Mount["preview/dev/route — mount mechanism"]
    GATE[shouldMountRuntimeV2DevPreviewRoute]
    PATH[RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH]
    RC[RuntimeV2DevPreviewRoute]
  end
  Mount -. opt-in de 1 linha (mantenedor):\n{shouldMount() && <Route path={PATH} element={<RuntimeV2DevPreviewRoute/>} />} .-> ROUTES
  App -. NÃO editado neste slice (invariante do programa) .-> Mount
```

Editar `src/App.jsx` faria a checagem "no production UI change (src/App.jsx…)" de ~11 gates falhar. Por isso o mecanismo de montagem é entregue pronto, com o opt-in reduzido a uma linha dev-guarded que o mantenedor aplica quando quiser.

---

## Flag gating — three flags, fail-closed

```mermaid
flowchart TB
  ENV[env] --> DEVQ{import.meta.env.DEV?}
  DEVQ -->|não (produção)| OFF[não monta — fail closed]
  DEVQ -->|sim| RFQ{route flag on?}
  RFQ -->|não| OFF2[não monta]
  RFQ -->|sim| MOUNTED[rota montável]
  MOUNTED --> HUBF[hub controlado por sua flag]
  MOUNTED --> DSF[dataset controlado por sua flag]
```
