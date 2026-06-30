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

## 2. Current state (transition)

| Element | Today | Target |
|---------|-------|--------|
| Default home | Module menu / Cadastro routes | BOS home |
| Mental model | "Open Empresas module" | "Operate Clientes capability" |
| Registry | `cadastro-modules.registry.json` | Capability catalog + Business Assets registry |
| SSOT for capabilities | Engineering gates G262–G306 | User-facing capability catalog (future UI) |

**Classification:** Module navigation = **TRANSITION**, not target.

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

Changing navigation UI = **future implementation** after BOS shell exists. This document is **SSOT for when that work begins**. No route changes in D-073 remediation.

---

*VA-04 registered. Preserves current routes for compatibility.*
