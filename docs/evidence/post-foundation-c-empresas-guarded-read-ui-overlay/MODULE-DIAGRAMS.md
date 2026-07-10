# Post-Foundation C — Module Diagrams

**Slice:** Post-Foundation C — Empresas Guarded Read UI Overlay

---

## 1. Composição e integração dev-only

```mermaid
flowchart TD
  Route["Runtime v2 Dev Preview Route (/__dev/runtime-v2/previews)"] --> Overlay["Empresas Guarded Read UI Overlay"]
  Overlay --> Slice["Empresas Guarded Read UI Slice"]
  Slice --> Candidate["Empresas Read-Only Candidate"]
  Slice --> Compare["Empresas Dual Read Compare"]
  Overlay --> Status["Write Blocked Overlay Status"]
  RealUI["Empresas UI Real"] -. não controlada .-> Legacy["Runtime Legado (fonte da verdade)"]
```

## 2. Gate de habilitação (dev-only, fail-closed em produção)

```mermaid
flowchart LR
  Env["env"] --> Flag{"MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI_OVERLAY === 'true'?"}
  Flag -- "não (default)" --> Off["enabled=false · skipped · guardedReadUi null · componente = fallback"]
  Flag -- "sim" --> Prod{"produção?"}
  Prod -- "sim, sem ALLOW_PROD" --> Blocked["enabled=false · productionBlocked=true"]
  Prod -- "não / ALLOW_PROD" --> On["enabled=true · compõe guarded read UI · overlay panel"]
```

## 3. Render do container do overlay

```mermaid
flowchart TD
  Container["EmpresasGuardedReadUiOverlay(model, env)"] --> M{"model presente?"}
  M -- "não" --> E{"flag on (env)?"}
  E -- "não" --> FbOff["fallback: overlay desligado"]
  E -- "sim" --> FbModel["fallback: forneça overlay model"]
  M -- "sim" --> En{"enabled && !skipped?"}
  En -- "não" --> FbOff2["fallback seguro"]
  En -- "sim" --> Render["Status + Panel (guarded read UI slice)"]
```

## 4. Write bloqueado (guard ativo herdado)

```mermaid
flowchart LR
  Overlay["Overlay Model"] --> Guard["writeGuard (do guarded read UI)"]
  Guard --> Blocked["create/update/delete/... → { blocked:true, code }"]
  Overlay -. nunca .-> Real["write real"]
```
