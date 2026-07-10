# Post-Foundation C — Module Diagrams

**Slice:** Post-Foundation C — Empresas Read UI Parity Hardening

---

## 1. Composição do hardening

```mermaid
flowchart TD
  Route["Runtime v2 Dev Preview Route"] --> Overlay["Empresas Guarded Read UI Overlay"]
  Overlay --> Hardening["Empresas Read UI Parity Hardening"]
  Hardening --> Checklist["Parity Checklist (6 categorias)"]
  Hardening --> Score["Parity Score / readiness"]
  Hardening --> Diagnostics["Diagnostics"]
  Hardening --> Next["Next Step Recommendation"]
  RealUI["Empresas UI Real"] -. não controlada .-> Legacy["Runtime Legado (fonte da verdade)"]
```

## 2. Gate de habilitação (dev-only, fail-closed em produção)

```mermaid
flowchart LR
  Env["env"] --> Flag{"MAK_RUNTIME_V2_EMPRESAS_READ_UI_PARITY_HARDENING === 'true'?"}
  Flag -- "não (default)" --> Off["enabled=false · skipped · checklist skipped · componente = fallback"]
  Flag -- "sim" --> Prod{"produção?"}
  Prod -- "sim, sem ALLOW_PROD" --> Blocked["enabled=false · productionBlocked=true"]
  Prod -- "não / ALLOW_PROD" --> On["enabled=true · compõe overlay · checklist/score/diagnostics"]
```

## 3. Fluxo checklist → score → readiness

```mermaid
flowchart TD
  Overlay["Overlay Model"] --> Items["Checklist Items (status/severity/blocking)"]
  Items --> Score["createEmpresasReadUiParityScore"]
  Score --> R{"critical/blocking?"}
  R -- "sim" --> Blocked["readiness: blocked → Hardening Fixes"]
  R -- "fail não crítico" --> Needs["readiness: needs_hardening → Hardening Fixes"]
  R -- "só warnings / tudo pass" --> Ready["readiness: ready_for_next_slice → Runtime Bridge Dry Run"]
```

## 4. Write bloqueado (guard ativo herdado)

```mermaid
flowchart LR
  Hardening["Hardening Model"] --> Guard["writeGuard (do overlay/guarded read UI)"]
  Guard --> Blocked["create/update/delete/... → { blocked:true, code }"]
  Hardening -. nunca .-> Real["write real"]
```
