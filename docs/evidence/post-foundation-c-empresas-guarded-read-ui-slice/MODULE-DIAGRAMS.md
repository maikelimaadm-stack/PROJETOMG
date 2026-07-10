# Post-Foundation C — Module Diagrams

**Slice:** Post-Foundation C — Empresas Guarded Read UI Slice

---

## 1. Composição do guarded read UI

```mermaid
flowchart TD
  Model["Empresas Guarded Read UI Model"] --> Candidate["Empresas Read-Only Candidate"]
  Model --> Compare["Empresas Dual Read Compare"]
  Slice["Empresas Guarded Read UI Slice (container)"] --> Table["Empresas Guarded Read Table"]
  Slice --> Form["Empresas Guarded Read Form"]
  Slice --> Diagnostics["Empresas Guarded Read Diagnostics"]
  Slice --> WriteBlocked["Write Blocked Panel"]
  Model --> Slice
  RealUI["Empresas UI Real"] -. não controlada .-> Legacy["Runtime Legado (fonte da verdade)"]
```

## 2. Gate de habilitação (dev-only, fail-closed em produção)

```mermaid
flowchart LR
  Env["env"] --> Flag{"MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI === 'true'?"}
  Flag -- "não (default)" --> Off["enabled=false · skipped · viewModel null · componente = fallback"]
  Flag -- "sim" --> Prod{"produção?"}
  Prod -- "sim, sem ALLOW_PROD" --> Blocked["enabled=false · productionBlocked=true"]
  Prod -- "não / ALLOW_PROD" --> On["enabled=true · compõe read-only + dual-read · UI read-only"]
```

## 3. Render do container

```mermaid
flowchart TD
  Container["EmpresasGuardedReadUiSlice(model)"] --> Check{"model.enabled && !skipped?"}
  Check -- "não" --> Fallback["fallback seguro (nada da tela real)"]
  Check -- "sim" --> Render["Table + Form + Diagnostics + WriteBlockedPanel"]
  Render -. read-only .-> NoWrite["sem save/edit/delete · sem onClick/onSubmit com efeito"]
```

## 4. Write bloqueado (guard ativo)

```mermaid
flowchart LR
  Panel["Write Blocked Panel"] --> Guard["writeGuard.attempt(op)"]
  Guard --> Blocked["create/update/delete/... → { blocked:true, code }"]
  Panel -. nunca .-> Real["write real"]
```
