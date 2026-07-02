# 08 — Done Criteria

**Foundation C.0** · Critérios objetivos por módulo (gate PASS requirements)

---

## Formato

Each module requires: **tests**, **interface compliance**, **contract compliance**, **no forbidden deps**.

---

## M01 — Bootstrap

- [ ] `bootstrap()` completes RT-0→RT-3 in integration test
- [ ] `destroy()` cleans all scoped services
- [ ] Failure at RT-2 shows maintenance screen (no partial hydrate)
- [ ] Gate script: `npm run gate:g423-01`

## M02 — Context

- [ ] Context is immutable after `child()` creation
- [ ] `traceId` present on every context instance
- [ ] Tenant isolation: cross-tenant context creation throws
- [ ] Gate: `gate:g423-02`

## M03 — Session

- [ ] Auth + refresh flow E2E (mock L1)
- [ ] Logout invalidates AccessScope cache
- [ ] JWT expiry triggers silent refresh (FE)
- [ ] Gate: `gate:g423-03`

## M04 — Registry

- [ ] Register/resolve for all 12 RegistryTypes
- [ ] Duplicate key throws typed error
- [ ] Post-hydrate registry is frozen (no new registers)
- [ ] Gate: `gate:g423-04`

## M05 — Loader

- [ ] Load remote CRB with cache hit/miss
- [ ] Invalidation on publish event
- [ ] Gate: `gate:g423-05`

## M06 — CRB Loader

- [ ] Rejects unsigned CRB in prod mode
- [ ] Rejects hash mismatch
- [ ] Hydrates V13–V20 completely from fixture CRB
- [ ] Gate: `gate:g423-06`

## M07 — Dependency Resolver

- [ ] Detects cycle in test graph
- [ ] Returns topological order for valid graph
- [ ] Gate: `gate:g423-07`

## M08 — Router

- [ ] URL match → screenId + params
- [ ] Guard blocks unauthorized routes
- [ ] Deep link works after refresh
- [ ] Gate: `gate:g423-08`

## M09 — Permission Engine

- [ ] Deny > Allow > Default deny verified with matrix test
- [ ] `filterVisible` hides denied UI elements
- [ ] BE middleware blocks before handler
- [ ] Gate: `gate:g423-09`

## M10 — Action Engine

- [ ] Dispatches UEC Command to registered handler
- [ ] Unknown action returns typed UEC error
- [ ] Gate: `gate:g423-10`

## M11 — Workflow Engine

- [ ] Start instance + transition via USM operation
- [ ] Human step queued (stub UI)
- [ ] Instance persisted (BE)
- [ ] Gate: `gate:g423-11`

## M12 — Render Engine

- [ ] Table adapter renders list from CRB fixture
- [ ] Form adapter renders create/edit from CRB fixture
- [ ] Permission-filtered fields omitted
- [ ] Gate: `gate:g423-12`

## M13 — Expression Engine

- [ ] Evaluates `{field}` bindings correctly
- [ ] Invalid expression returns validation error
- [ ] Uses G302 adapter (no reimplementation)
- [ ] Gate: `gate:g423-13`

## M14 — Formula Engine

- [ ] Computes dependent field values
- [ ] `getDependencies` matches CRB field graph
- [ ] Gate: `gate:g423-14`

## M15 — Validation Engine

- [ ] Sync rules block invalid payload
- [ ] Async rules resolve before execution
- [ ] UEC validation error shape compliant
- [ ] Gate: `gate:g423-15`

## M16 — Execution Engine

- [ ] Full 5-stage pipeline (UP-09) integration test
- [ ] Stage 2 blocks unauthorized
- [ ] Stage 5 emits events to M22
- [ ] Gate: `gate:g423-16`

## M17 — State Engine

- [ ] Route-scoped state isolated between routes
- [ ] USM transition updates entity state
- [ ] Subscribers notified on change
- [ ] Gate: `gate:g423-17`

## M18 — Plugin Engine

- [ ] Loads manifest without eval
- [ ] Extension point registration works
- [ ] Invalid manifest rejected
- [ ] Gate: `gate:g423-18`

## M19 — Connector Engine

- [ ] HTTP connector invoke with retry stub
- [ ] Circuit breaker opens after threshold
- [ ] Gate: `gate:g423-19`

## M20 — Service Locator

- [ ] Singleton vs scoped lifetimes correct
- [ ] All M01–M24 services resolvable post RT-3
- [ ] Gate: `gate:g423-20`

## M21 — Cache

- [ ] CRB cache key pattern matches PA-02
- [ ] Invalidation on publish event
- [ ] Gate: `gate:g423-21`

## M22 — Event Bus

- [ ] Publish/subscribe in-process
- [ ] UEC event envelope compliant (UP-06)
- [ ] Interface compatible with Foundation F upgrade
- [ ] Gate: `gate:g423-22`

## M23 — Transaction Manager

- [ ] Rollback on handler failure (BE)
- [ ] Idempotency key dedup
- [ ] Gate: `gate:g423-23`

## M24 — Observability

- [ ] traceId in all log lines during RT-0→RT-8 test
- [ ] Health endpoint returns `{ status: 'ok' }`
- [ ] Metrics hook callable without throw
- [ ] Gate: `gate:g423-24`

---

## Master gate G423 — Foundation C complete

All **G423-01 through G423-24** PASS, plus:

- [ ] Full RT-0→RT-8 E2E on empresas module via CRB (not boot cache)
- [ ] No Runtime import of MMM DB
- [ ] `npm run gate:g423` green
- [ ] Legacy bridge documented and functional

---

*Próximo: [09-GATES](./09-GATES.md)*
