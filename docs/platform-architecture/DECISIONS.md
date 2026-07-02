# Platform Architecture Decisions (D-PA)

**Status:** Official SSOT  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Foundation Architecture Audit

---

## D-PA-01 — Canonical layer model L0–L10

**Decision:** Platform architecture is documented using **L0–L10** in [01-LAYERS.md](./01-LAYERS.md). MAK-2035 L0–L7 remains valid as **compatibility mapping**, not duplicate topology.

---

## D-PA-02 — MMM is Foundation B (frozen)

**Decision:** Programs 4.01–4.04 (spec, persistence, publish) constitute **Foundation B — Universal Meta Model**. No taxonomy or envelope changes without D-MMM amendment.

---

## D-PA-03 — Runtime consumes CRB only

**Decision:** All user-visible behavior originates from **signed `mmm-crb-v1`** loaded via EnvironmentPin. Boot cache and static JS module factories are **transitional mirrors**, never SSOT (R-02, D-MMM-04).

---

## D-PA-04 — Universal Render Engine lives inside Runtime (L3)

**Decision:** Render Engine is not a separate product layer. It is **RT-7** in Runtime, implemented by Foundation + BaseTemplate + view adapters ([07-RENDER-ENGINE.md](./07-RENDER-ENGINE.md)).

---

## D-PA-05 — Action Engine = V19 registry + Runtime dispatcher

**Decision:** Every button/action resolves through **Action Engine** (config V19 + Runtime RT-8). No ad-hoc onClick handlers in certified modules.

---

## D-PA-06 — Workflow Engine = V20 registry + state machine host

**Decision:** Workflows compile to V20 registry; Runtime hosts **single universal state machine executor** ([09-WORKFLOW-ENGINE.md](./09-WORKFLOW-ENGINE.md)).

---

## D-PA-07 — Studio designer catalog closed

**Decision:** Seventeen **core** Studio designers are **normative** for Foundation D phase 1 ([03-STUDIO.md](./03-STUDIO.md)). Full catalog of **28 designers** (17 core + 11 extended) per [D-UA-06](../platform-authoring/DECISIONS.md#d-ua-06--designer-catalog-closed-at-28). New designers require D-PA amendment + PlatformSchema additive type.

---

## D-PA-08 — Low-code creation path closed

**Decision:** Any system (ERP, CRM, WMS, RH) is created only via **Application → Module → BusinessObject → Field → Layout → Workflow → Publish** ([04-LOW-CODE.md](./04-LOW-CODE.md)). No parallel generator path after Foundation H.

---

## D-PA-09 — AI write boundary

**Decision:** AI **never** writes MMM objects directly. Output is always **AICandidate → human review → Intent → Derivation → MMM draft** (D-MMM-09, D-074 P-09).

---

## D-PA-10 — BOS is L9 experience shell

**Decision:** BOS remains primary user surface (D-074). Studio (L4) and Runtime (L3) are **never** product identity. No architectural conflict ([11-BOS.md](./11-BOS.md)).

---

## D-PA-11 — Marketplace package format

**Decision:** Marketplace distributes **`.makpkg`** — signed archive of MMM envelopes + manifest. Install creates **draft** objects with `lineage.source=marketplace` (R-18).

---

## D-PA-12 — Security hierarchy

**Decision:** Isolation order: **Platform → Tenant (cliente) → Application → Module → Company (empresa) → OU**. Permissions evaluated at Runtime RT-5 ([13-SECURITY.md](./13-SECURITY.md)).

---

## D-PA-13 — API taxonomy closed

**Decision:** Seven API classes: Public, Internal, Partner, Runtime, Mobile, AI Gateway, Marketplace ([14-APIS.md](./14-APIS.md)). `/api/mmm/v1` is Internal.

---

## D-PA-14 — Scalability without topology change

**Decision:** Scale 100→10M tenants via **horizontal API replicas, read replicas, Redis, CDN, shard-by-tenant** — no layer redesign ([15-SCALABILITY.md](./15-SCALABILITY.md)).

---

## D-PA-15 — Meta-model taxonomy closed

**Decision:** **227 objectTypes / 226 PlatformSchemas** is complete for platform v1. No missing types for Runtime, Studio, Marketplace, or AI. Additions only via R-19 additive process.

---

## D-PA-16 — Record dual meaning resolved

**Decision:** `record` (MMM taxonomy) = L0 data row reference only (R-14). **Generic Repository Record** = runtime persistence entity — mapped via `business_object` + adapters, not MMM `record` type.

---

## D-PA-17 — Event bus in Platform Core (L1)

**Decision:** Domain Event Bus is **L1 Platform Core** service (D-074 VA-07). Intelligence, workflow, and audit **subscribe**; they do not own transport.

---

## D-PA-18 — Offline sync boundary

**Decision:** Offline is **L0 infrastructure + L1 sync service**. CRB and Record deltas sync; MMM authoring requires online (except read-only cached CRB).

---

## D-PA-19 — Implementation resume gates

**Decision:** Code resumes only when [18-FOUNDATION-ROADMAP.md](./18-FOUNDATION-ROADMAP.md) certifies the target **Foundation** gate PASS. Global freeze until this documentation merge. **Authorized code start:** after **G420E** (C.0 audit PASS) + **Foundation C.0.2** slice clearance per [runtime-implementation/](../runtime-implementation/).

---

## D-PA-20 — Intent layer (L5) position

**Decision:** Intent Engine sits **above MMM write, below Studio/BOS UI**. Business Language → Intent Document → Resolver → DerivationPlan → MMM batch.

---

## D-PA-21 — Corporate Intelligence (L10) read-only to MMM

**Decision:** L10 engines (Memory, Knowledge, Consulting, etc.) **read** events and projections; **never mutate** MMM or Records without approved Intent path.

---

## D-PA-22 — Applications vs Modules

**Decision:** **Application** = deployable product boundary (ERP package). **Module** = functional domain inside application. One tenant may run multiple applications; modules may declare `module_dependency`.

---

## D-PA-23 — Plugin model

**Decision:** Plugins are **Integration objectType** + signed **plugin_manifest** in CRB. Runtime loads plugins from CRB registries only — no dynamic remote code load in production.

---

## D-PA-24 — Version rollback semantics

**Decision:** MMM object rollback ≠ publish rollback. **Publish rollback** = EnvironmentPin to prior DefinitionVersion (immutable CRB). Object rollback = authoring revision only.

---

## D-PA-25 — Render view type catalog closed

**Decision:** Eleven canonical view modes: table, cards, calendar, kanban, timeline, dashboard, map, tree, form, wizard, shell ([07-RENDER-ENGINE.md](./07-RENDER-ENGINE.md)).

---

*End of document.*
