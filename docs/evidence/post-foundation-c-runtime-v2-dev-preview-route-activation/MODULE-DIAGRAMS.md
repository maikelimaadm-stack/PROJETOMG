# Post-Foundation C — Module Diagrams

**Slice:** Post-Foundation C — Runtime v2 Dev Preview Route Activation

---

## 1. Ativação da rota no roteador central (`src/App.jsx`)

```mermaid
flowchart TD
  App["src/App.jsx — &lt;Routes&gt; central"] --> Guard{"shouldMountRuntimeV2DevPreviewRoute()"}
  Guard -- "false (default / produção)" --> Skip["ramo não renderizado<br/>(Vite elimina em prod build)"]
  Guard -- "true (dev + flag)" --> Route["&lt;Route path={RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH}&gt;"]
  Route --> Susp["&lt;Suspense fallback={ModuleLoadingFallback}&gt;"]
  Susp --> Lazy["lazy(() =&gt; import RuntimeV2DevPreviewRoute.jsx)"]
  Lazy --> RouteCmp["RuntimeV2DevPreviewRoute"]
  RouteCmp --> Hub["RuntimeV2DevPreviewHub (mock-only)"]
```

## 2. Gate de montagem (dev-only, fail-closed em produção)

```mermaid
flowchart LR
  Env["env (import.meta.env / process.env)"] --> DevEnv{"isRuntimeV2DevEnvironment"}
  Env --> Flag{"isRuntimeV2DevPreviewRouteEnabled<br/>(MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE === 'true')"}
  DevEnv -- "DEV / dev label / ALLOW_PROD" --> AND(("AND"))
  Flag -- "flag on (+ prod só com ALLOW_PROD)" --> AND
  AND --> Mount["shouldMountRuntimeV2DevPreviewRoute → true"]
  DevEnv -- "produção sem override" --> Closed["→ false (fail-closed)"]
  Flag -- "flag off (default)" --> Closed
```

## 3. Guard de produção compartilhado (exceção precisa, não genérica)

```mermaid
flowchart TD
  Gate["21 gates que guardam src/App.jsx"] --> Guard["productionUiOffendingFiles(ROOT)"]
  Guard --> Diff["git diff --name-only origin/main...HEAD -- src/App.jsx src/shared src/framework src/modules src/studio"]
  Diff -- "vazio" --> Clean["'' (limpo)"]
  Diff --> Each{"para cada arquivo alterado"}
  Each -- "não é src/App.jsx" --> Offend["sempre ofensor"]
  Each -- "src/App.jsx" --> AppChk{"appJsxChangeIsOnlyDevRouteMount"}
  AppChk -- "apenas adições + marker dev + sem token proibido + só path dev" --> Tolerate["tolerado (exceção)"]
  AppChk -- "qualquer outra mudança" --> Offend
  Offend --> Fail["gate falha"]
  Clean --> Pass["gate passa"]
  Tolerate --> Pass
```

## 4. Independência de flags (hub / dataset / rota)

```mermaid
flowchart LR
  RouteFlag["MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE"] --> Route["monta a rota"]
  HubFlag["MAK_RUNTIME_V2_DEV_PREVIEW_HUB"] --> Hub["hub avançado"]
  DatasetFlag["MAK_RUNTIME_V2_CONTROLLED_DEV_DATASET"] --> Dataset["dataset de dev controlado"]
  Route -.->|"não força"| Hub
  Route -.->|"não força"| Dataset
```
