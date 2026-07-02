# 05 — Folder Structure

**Foundation C.0** · Layout definitivo de `src/runtime/`

> D-RI-02: novo root `src/runtime/`. Código em `src/framework/mak/runtime/` permanece **transitional** até Foundation E.

---

## 1. Árvore completa

```
src/runtime/
├── index.ts                    # Public API barrel
├── types/                      # Shared types (UEC-aligned)
│   ├── uec.ts
│   ├── crb.ts
│   ├── context.ts
│   └── index.ts
├── core/
│   ├── bootstrap/
│   │   ├── IRuntimeBootstrap.ts
│   │   ├── bootstrap.ts
│   │   ├── hydrate.ts
│   │   └── phases/             # RT-0..RT-8 step handlers
│   │       ├── rt0-shell.ts
│   │       ├── rt1-load-pin.ts
│   │       ├── rt2-verify-crb.ts
│   │       ├── rt3-hydrate.ts
│   │       ├── rt4-session.ts
│   │       ├── rt5-authorize.ts
│   │       ├── rt6-route.ts
│   │       ├── rt7-render.ts
│   │       └── rt8-execute.ts
│   ├── context/
│   │   ├── IRuntimeContext.ts
│   │   └── createContext.ts
│   ├── session/
│   │   ├── ISessionManager.ts
│   │   ├── webSession.ts
│   │   └── backendSession.ts
│   ├── registry/
│   │   ├── IRegistry.ts
│   │   └── registry.ts
│   ├── loader/
│   │   ├── ILoader.ts
│   │   └── loader.ts
│   ├── crb/
│   │   ├── ICrbLoader.ts
│   │   ├── fetch.ts
│   │   ├── verify.ts
│   │   └── hydrateRegistries.ts
│   ├── dependency/
│   │   ├── IDependencyResolver.ts
│   │   └── resolver.ts
│   └── router/
│       ├── IRouter.ts
│       ├── match.ts
│       └── guards.ts
├── engines/
│   ├── permission/
│   │   ├── IPermissionEngine.ts
│   │   └── permissionEngine.ts
│   ├── action/
│   │   ├── IActionEngine.ts
│   │   ├── actionEngine.ts
│   │   └── handlers/
│   ├── workflow/
│   │   ├── IWorkflowEngine.ts
│   │   └── workflowEngine.ts
│   ├── render/
│   │   ├── IRenderEngine.ts
│   │   ├── renderEngine.ts
│   │   └── adapters/
│   │       ├── table/
│   │       ├── form/
│   │       ├── kanban/         # post-C slice
│   │       └── ...
│   ├── expression/
│   │   ├── IExpressionEngine.ts
│   │   └── adapterG302.ts      # D-RI-10
│   ├── formula/
│   │   ├── IFormulaEngine.ts
│   │   └── adapterG302.ts
│   ├── validation/
│   │   ├── IValidationEngine.ts
│   │   └── validationEngine.ts
│   ├── execution/
│   │   ├── IExecutionEngine.ts
│   │   ├── executionEngine.ts
│   │   └── pipeline/           # UP-09 5 stages
│   │       ├── stage1-validate.ts
│   │       ├── stage2-authorize.ts
│   │       ├── stage3-execute.ts
│   │       ├── stage4-audit.ts
│   │       └── stage5-respond.ts
│   ├── state/
│   │   ├── IStateEngine.ts
│   │   ├── screenState.ts
│   │   └── usmState.ts
│   ├── plugin/
│   │   ├── IPluginEngine.ts
│   │   └── pluginEngine.ts
│   └── connector/
│       ├── IConnectorEngine.ts
│       └── connectors/
│           └── http.ts
├── infra/
│   ├── service-locator/
│   │   ├── IServiceLocator.ts
│   │   └── serviceLocator.ts
│   ├── cache/
│   │   ├── ICache.ts
│   │   ├── memoryCache.ts
│   │   └── redisCache.ts       # BE optional
│   ├── event-bus/
│   │   ├── IEventBus.ts
│   │   ├── inProcessBus.ts     # Foundation C stub
│   │   └── outboxStub.ts
│   ├── transaction/
│   │   ├── ITransactionManager.ts
│   │   └── transactionManager.ts
│   └── observability/
│       ├── IObservability.ts
│       ├── tracer.ts
│       ├── logger.ts
│       └── health.ts
├── adapters/                   # Bridges to legacy / L0-L1
│   ├── gr-bridge/              # D-RI-07 cadastro bridge
│   │   └── cadastroAdapter.ts
│   ├── legacy-runtime/         # Transitional from framework/mak
│   │   └── createMakRuntimeBridge.ts
│   └── api-client/
│       └── internalApiClient.ts
├── host/                       # FE integration
│   ├── react/
│   │   ├── RuntimeProvider.tsx
│   │   ├── useRuntime.ts
│   │   └── ScreenHost.tsx
│   └── web/
│       └── mount.ts
└── __tests__/                  # Per-module tests (gates)
    ├── bootstrap/
    ├── crb/
    ├── execution/
    └── ...
```

---

## 2. Backend mirror (Fastify)

```
backend/src/runtime/
├── index.ts
├── handlers/                   # UEP handlers registered
├── middleware/
│   ├── contextMiddleware.ts
│   ├── permissionMiddleware.ts
│   └── traceMiddleware.ts
├── workflow/
│   └── persistence/
└── transaction/
    └── prismaTransactionManager.ts
```

**Rule (D-RI-06):** Shared contracts in `src/runtime/types/`; BE imports types only — no FE React in backend tree.

---

## 3. Module → path mapping

| Module | Path |
|--------|------|
| M01 Bootstrap | `core/bootstrap/` |
| M02 Context | `core/context/` |
| M03 Session | `core/session/` |
| M04 Registry | `core/registry/` |
| M05 Loader | `core/loader/` |
| M06 CRB Loader | `core/crb/` |
| M07 Dependency Resolver | `core/dependency/` |
| M08 Router | `core/router/` |
| M09 Permission | `engines/permission/` |
| M10 Action | `engines/action/` |
| M11 Workflow | `engines/workflow/` |
| M12 Render | `engines/render/` |
| M13 Expression | `engines/expression/` |
| M14 Formula | `engines/formula/` |
| M15 Validation | `engines/validation/` |
| M16 Execution | `engines/execution/` |
| M17 State | `engines/state/` |
| M18 Plugin | `engines/plugin/` |
| M19 Connector | `engines/connector/` |
| M20 Service Locator | `infra/service-locator/` |
| M21 Cache | `infra/cache/` |
| M22 Event Bus | `infra/event-bus/` |
| M23 Transaction | `infra/transaction/` |
| M24 Observability | `infra/observability/` |

---

## 4. Public exports (`index.ts`)

```typescript
// Minimal public surface — host apps import from '@mak/runtime'
export { bootstrap, hydrate, destroy } from './core/bootstrap';
export type { IRuntimeContext, RuntimeInstance } from './types';
export { RuntimeProvider, useRuntime } from './host/react';
```

Internal modules **not** exported from barrel — access via Service Locator only.

---

## 5. Transitional coexistence

| Legacy path | Transitional role | Elimination |
|-------------|-------------------|-------------|
| `src/framework/mak/runtime/` | Bridge via `adapters/legacy-runtime/` | Foundation E |
| `src/modules/*/runtime/` | Module-specific views → migrate to render adapters | C.8–C.17 |
| Boot cache JS | Pin/CRB fetch fallback | G423-20 gate |

---

## 6. Test layout

Each module gate **G423-NN** requires tests under `src/runtime/__tests__/{module}/` covering done criteria from [08-DONE-CRITERIA](./08-DONE-CRITERIA.md).

---

*Próximo: [06-BOOTSTRAP-SEQUENCE](./06-BOOTSTRAP-SEQUENCE.md)*
