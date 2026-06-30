# Navigation & Capability Model — SSOT

**Status:** Official  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Decision:** D-073 · **VA-04**  
**Parent:** [MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md](../architecture/MAK-BUSINESS-OPERATING-SHELL-ARCHITECTURE.md)

---

## 1. Principle

> The user does not buy modules. The user administers capabilities, assets, and objectives.

Navigation SSOT is **capability-centric, asset-centric, business-centric** — not module-centric.

---

## 2. Current state (post–Program 3.9)

| Element | Today | Target (complete) |
|---------|-------|-------------------|
| Default home | **BOS home (`/`)** ✅ | BOS home |
| Mental model | Capability/asset-centric home + legacy cadastro via Operations | Full Intelligence integration |
| Registry | `bosCapabilityCatalog.js` + `generatedModules.json` | Live capability registry API |
| SSOT for capabilities | BOS UI + engineering gates G262–G307 | User-facing catalog + backend |

**Classification:** Module navigation in cadastro chrome = **legacy access path**, not product identity.

---

## 3. Capability vs module

| Module (technical) | Capability (business) |
|--------------------|----------------------|
| `empresas` | Cliente/Empresa management |
| `cadcps` | Custom field administration (transition → Asset admin) |
| Engineering gate ID | Business capability user sees |

Modules remain **Runtime deployment units**. Capabilities are **what the user enables**.

---

## 4. Navigation hierarchy (target)

```
BOS Home
├── Objectives (user-declared)
├── Capabilities (enabled business functions)
│   └── Operations (Runtime projections — may use ModeloBase1)
├── Assets (registry — all Business Assets)
├── Health & Evolution
└── Marketplace (future)
```

Module paths (`/CadastroEmpresas`) map under **Operations → {Capability}** — never top-level product identity.

---

## 5. Implementation boundary

BOS MVP shipped Program 3.9 (G307). Cadastro routes preserved; module sidebar includes **Business OS** return link.

---

*VA-04 registered. Preserves current routes for compatibility.*
