# Runtime Implementation Contracts

**Foundation C.0** · Plan-level contracts (cross-module)

---

## C-RI-01 — Plan authority

| Field | Value |
|-------|-------|
| Provider | Five SSOT pillars |
| Consumer | `docs/runtime-implementation/` |
| Rule | Plan is derived; conflicts resolve upstream |

---

## C-RI-02 — UEP compliance

| Field | Value |
|-------|-------|
| Provider | [platform-protocol/](../platform-protocol/) |
| Consumer | All Runtime modules M10, M16, M22 |
| Guarantee | UEC request/response shapes unchanged |
| Version | `mak-uep-v1` |

---

## C-RI-03 — CRB as sole config

| Field | Value |
|-------|-------|
| Provider | M06 CRB Loader |
| Consumer | M04, M08, M09, M12 |
| Guarantee | Post–G423 modules consume signed CRB only |
| Exception | Legacy adapter until Foundation E |

---

## C-RI-04 — Gate before merge

| Field | Value |
|-------|-------|
| Provider | CI gate scripts G423-NN |
| Consumer | Every PR touching `src/runtime/` |
| Guarantee | Corresponding module gate PASS |

---

## C-RI-05 — No MMM DB access

| Field | Value |
|-------|-------|
| Forbidden | Runtime → MMM persistence |
| Allowed | Internal API → Pin/CRB fetch |
| SSOT | D-PA-03, D-RI-13 |

---

## C-RI-06 — Event Bus upgrade path

| Field | Value |
|-------|-------|
| Foundation C | `IEventBus` + in-process stub |
| Foundation F | Replace transport; interface stable |
| Event envelope SSOT | UP-08 |
| SSOT | D-RI-08 |

---

## C-RI-07 — GR partial delivery

| Field | Value |
|-------|-------|
| Foundation C | `IGenericRepository` interface + cadastro bridge |
| Foundation G | Full GR implementation |
| SSOT | D-RI-07 |

---

## C-RI-08 — Observability propagation

| Field | Value |
|-------|-------|
| Provider | M24 Observability |
| Consumer | All modules |
| Guarantee | `traceId` from M02 Context on every span/log |

---

## C-RI-09 — Bootstrap orchestration

| Field | Value |
|-------|-------|
| Provider | M01 Bootstrap |
| Consumer | Host app |
| Guarantee | RT-0→RT-8 sequential; fail-closed on RT-2 failure |
| Forbidden | Other modules calling bootstrap recursively |

---

## C-RI-10 — Studio boundary

| Field | Value |
|-------|-------|
| Runtime | Consumes published CRB |
| Studio (G424) | Authors MMM objects |
| Rule | Runtime never writes MMM |

---

*Module-level contracts: [04-MODULE-CONTRACTS.md](./04-MODULE-CONTRACTS.md)*
