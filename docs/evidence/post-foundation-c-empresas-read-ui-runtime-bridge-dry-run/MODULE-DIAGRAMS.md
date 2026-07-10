# Post-Foundation C — Module Diagrams

**Slice:** Post-Foundation C — Empresas Read UI Runtime Bridge Dry Run

---

## 1. Composição do dry run

```mermaid
flowchart TD
  Hardening["Empresas Read UI Parity Hardening"] --> DryRun["Bridge Dry Run"]
  DryRun --> Contract["Bridge Read Contract"]
  DryRun --> Sim["Mount Simulation"]
  Sim -. não monta de verdade .-> FutureSlot["Future Read Slot"]
  Contract --> Diagnostics["Diagnostics"]
  Diagnostics --> Next["Next Step Recommendation"]
  RealUI["Empresas UI Real"] -. não controlada .-> Legacy["Runtime Legado (fonte da verdade)"]
  Bridge["RuntimeBridge Real"] -. não alterado .-> Legacy
```

## 2. Gate de habilitação (dev-only, fail-closed em produção)

```mermaid
flowchart LR
  Env["env"] --> Flag{"MAK_RUNTIME_V2_EMPRESAS_READ_UI_BRIDGE_DRY_RUN === 'true'?"}
  Flag -- "não (default)" --> Off["enabled=false · skipped · contract/sim null · componente = fallback"]
  Flag -- "sim" --> Prod{"produção?"}
  Prod -- "sim, sem ALLOW_PROD" --> Blocked["enabled=false · productionBlocked=true"]
  Prod -- "não / ALLOW_PROD" --> On["enabled=true · compõe hardening · contract + mount simulation"]
```

## 3. Contrato read-only + simulação de montagem

```mermaid
flowchart TD
  Contract["Bridge Read Contract"] --> Allowed["allowed: readModel, renderReadOnly, inspectDiagnostics, compareSnapshots, reportReadiness"]
  Contract --> Blocked["blocked: create/update/delete/save/submit/bulk*/action/workflow/connector/mutateLegacyRuntime/writeBackend/writeStorage"]
  Sim["Mount Simulation"] --> Pre{"preconditions ok?"}
  Pre -- "sim" --> Safe["wouldMount=true · safeToProceed=true · mountTarget=dev_preview_only"]
  Pre -- "não" --> Unsafe["wouldMount=false · safeToProceed=false · blockedReasons[]"]
  Safe -. nunca monta de verdade .-> Nothing["mountedAnythingReal=false"]
```

## 4. Write bloqueado (guard ativo + contrato)

```mermaid
flowchart LR
  DryRun["Dry Run Model"] --> Guard["writeGuard (da cadeia read-only)"]
  Guard --> BlockedG["create/update/delete/... → { blocked:true, code }"]
  DryRun --> ContractB["Bridge Contract blockedOperations"]
  ContractB --> BlockedC["mutateLegacyRuntime / writeBackend / writeStorage bloqueados"]
  DryRun -. nunca .-> Real["write real / mount real"]
```
