# MAK Platform Protocol — Documentation Hub

**Status:** Official SSOT — Universal Execution Protocol (UEP)  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Foundation B.6 — Universal Execution Protocol  
**Authority:** Subordinate to [Constitution](../constitution/00-MAK-CONSTITUTION.md); implements [platform-behavior](../platform-behavior/) and [platform-architecture](../platform-architecture/)

> **Rule:** Foundation C (Runtime) is an **implementation of UEP** — not a parallel design. No Runtime code until [25-AUTORIZACAO.md](./25-AUTORIZACAO.md) certifies **PASS**.

---

## Four pillars

| Pillar | Path | Answers |
|--------|------|---------|
| What exists | [docs/meta-model/](../meta-model/) | Taxonomy, envelope, schemas |
| How built | [docs/platform-architecture/](../platform-architecture/) | Layers, components, topology |
| How behaves | [docs/platform-behavior/](../platform-behavior/) | Lifecycles, USM, operational rules |
| How executes | [docs/platform-protocol/](./) | Messages, context, pipeline, contracts |

---

## Document index

| # | Document | Topic |
|---|----------|-------|
| 01 | [UNIVERSAL-EXECUTION-PROTOCOL](./01-UNIVERSAL-EXECUTION-PROTOCOL.md) | Official platform protocol |
| 02 | [UNIVERSAL-CONTEXT](./02-UNIVERSAL-CONTEXT.md) | Runtime Context (UEC) |
| 03 | [UNIVERSAL-REQUEST](./03-UNIVERSAL-REQUEST.md) | Request envelope |
| 04 | [UNIVERSAL-RESPONSE](./04-UNIVERSAL-RESPONSE.md) | Response envelope |
| 05 | [UNIVERSAL-COMMAND](./05-UNIVERSAL-COMMAND.md) | Command pattern |
| 06 | [UNIVERSAL-QUERY](./06-UNIVERSAL-QUERY.md) | Query pattern |
| 07 | [UNIVERSAL-ACTION](./07-UNIVERSAL-ACTION.md) | Action protocol |
| 08 | [UNIVERSAL-EVENT](./08-UNIVERSAL-EVENT.md) | Event protocol |
| 09 | [UNIVERSAL-PIPELINE](./09-UNIVERSAL-PIPELINE.md) | Execution pipeline |
| 10 | [UNIVERSAL-HANDLER](./10-UNIVERSAL-HANDLER.md) | Handler registry |
| 11 | [UNIVERSAL-SERVICES](./11-UNIVERSAL-SERVICES.md) | DI, locator, discovery |
| 12 | [UNIVERSAL-PERMISSIONS](./12-UNIVERSAL-PERMISSIONS.md) | Permission injection |
| 13 | [UNIVERSAL-TRANSACTIONS](./13-UNIVERSAL-TRANSACTIONS.md) | TX protocol |
| 14 | [UNIVERSAL-CACHE-CONTRACT](./14-UNIVERSAL-CACHE-CONTRACT.md) | Cache protocol |
| 15 | [UNIVERSAL-ASYNC](./15-UNIVERSAL-ASYNC.md) | Async, jobs, DLQ |
| 16 | [UNIVERSAL-PLUGINS](./16-UNIVERSAL-PLUGINS.md) | Plugin protocol |
| 17 | [UNIVERSAL-CONNECTORS](./17-UNIVERSAL-CONNECTORS.md) | External connectors |
| 18 | [UNIVERSAL-OBSERVABILITY-CONTRACT](./18-UNIVERSAL-OBSERVABILITY-CONTRACT.md) | Logs, metrics, traces |
| 19 | [UNIVERSAL-SECURITY-CONTRACT](./19-UNIVERSAL-SECURITY-CONTRACT.md) | Auth, tokens, signatures |
| 20 | [UNIVERSAL-FAILURE-MODEL](./20-UNIVERSAL-FAILURE-MODEL.md) | Timeout, retry, circuit breaker |
| 21 | [UNIVERSAL-EXECUTION-SEQUENCE](./21-UNIVERSAL-EXECUTION-SEQUENCE.md) | End-to-end diagrams |
| 22 | [UNIVERSAL-CONTRACT-MAP](./22-UNIVERSAL-CONTRACT-MAP.md) | Contract dependency map |
| 23 | [UNIVERSAL-PROTOCOL-DECISIONS](./23-UNIVERSAL-PROTOCOL-DECISIONS.md) | D-UP-01+ |
| 24 | [AUDITORIA](./24-AUDITORIA.md) | Gap audit |
| 25 | [AUTORIZACAO](./25-AUTORIZACAO.md) | Foundation C authorization |

---

## Protocol version

**`mak-uep-v1`** — all envelopes include `"protocolVersion": "mak-uep-v1"`.

---

*End of document.*
