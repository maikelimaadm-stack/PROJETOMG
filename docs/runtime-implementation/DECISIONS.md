# Runtime Implementation Decisions (D-RI)

**Status:** Official SSOT · **Version:** 1.0.0 · **Mission:** Foundation C.0

---

## D-RI-01 — Plan does not alter architecture

**Decision:** `docs/runtime-implementation/` is **derived** from five pillars. Conflicts resolve upstream — never in this plan.

---

## D-RI-02 — New runtime root at `src/runtime/`

**Decision:** Universal Runtime v2 lives under `src/runtime/`. Existing `src/framework/mak/runtime/` remains **transitional** until Foundation E elimination.

---

## D-RI-03 — UEP is implementation contract

**Decision:** All Runtime modules implement [platform-protocol/](../platform-protocol/). No parallel message shapes.

---

## D-RI-04 — CRB-only configuration

**Decision:** Post–Foundation C modules consume **signed CRB only** (D-PA-03). Boot cache reads transitional until G423-20 legacy adapter gate.

---

## D-RI-05 — Module gate namespace G423-NN

**Decision:** Runtime sub-gates use **G423-01 through G423-24**. Master gate **G423** certifies Foundation C complete. Does **not** renumber G424 (Studio) per [GATE-REGISTRY.md](../engineering/GATE-REGISTRY.md).

---

## D-RI-06 — Backend vs frontend runtime split

**Decision:** RT-0→RT-3 split: **frontend** bootstrap/hydrate/render; **backend** permission TX, GR, workflow persistence, event outbox. Shared: UEC schema, error codes, contracts.

---

## D-RI-07 — Generic Repository deferred partial

**Decision:** Foundation C ships **GR adapter interface** + cadastro bridge. Full GR (Foundation G) not blocking G423 if empresas/cadcps paths work via bridge.

---

## D-RI-08 — Event Bus stub in C

**Decision:** C ships **EventBusClient** interface + in-process stub. Production DB bus = Foundation F (G426). Runtime emits to stub; F replaces transport.

---

## D-RI-09 — Delivery slices not programs

**Decision:** Work tracked as **C.1–C.24 slices** in [10-DELIVERY-PLANNING.md](./10-DELIVERY-PLANNING.md) — not new Program IDs.

---

## D-RI-10 — Reuse frozen engines

**Decision:** Expression/Formula evaluation reuses frozen Studio engines (G302) via adapter — no reimplementation.

---

## D-RI-11 — View adapters incremental

**Decision:** Foundation C certifies **table + form** adapters first; other nine view modes follow in slices C.15–C.17 without blocking G423.

---

## D-RI-12 — Workflow host minimal in C

**Decision:** C ships workflow **instance host** + human step queue. Full timer/escalation requires Foundation F scheduler.

---

## D-RI-13 — No MMM DB from Runtime

**Decision:** Runtime never queries MMM persistence (D-PA-03). Pin/CRB fetch via Internal API only.

---

## D-RI-14 — C.0 authorizes implementation start

**Decision:** Code implementation begins after C.0 audit PASS. Each slice requires its G423-NN gate PASS before merge.

---

## D-RI-15 — Sixth block complete

**Decision:** meta-model + architecture + behavior + protocol + authoring + **runtime-implementation** = complete pre-code foundation set.

---

*End of document.*
