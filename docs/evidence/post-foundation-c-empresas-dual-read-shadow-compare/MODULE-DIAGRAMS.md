# Post-Foundation C — Module Diagrams

**Slice:** Post-Foundation C — Empresas Dual Read Shadow Compare

---

## 1. Composição do dual-read compare

```mermaid
flowchart TD
  Legacy["Empresas Legacy Snapshot"] --> Compare["Dual Read Compare"]
  V2Snap["Empresas Runtime v2 Read Snapshot"] --> Compare
  Candidate["Empresas Read-Only Candidate"] --> V2Snap
  Compare --> Diff["Difference Model"]
  Diff --> Diagnostics["Diagnostics"]
  Diagnostics --> Next["Next Step Recommendation"]
  RealUI["Empresas UI Real"] -. não controlada .-> LegacyRuntime["Runtime Legado (fonte da verdade)"]
```

## 2. Gate de habilitação (dev-only, fail-closed em produção)

```mermaid
flowchart LR
  Env["env"] --> Flag{"MAK_RUNTIME_V2_EMPRESAS_DUAL_READ_COMPARE === 'true'?"}
  Flag -- "não (default)" --> Off["enabled=false · skipped · snapshots null"]
  Flag -- "sim" --> Prod{"produção?"}
  Prod -- "sim, sem ALLOW_PROD" --> Blocked["enabled=false · productionBlocked=true"]
  Prod -- "não / ALLOW_PROD" --> On["enabled=true · compara snapshots"]
```

## 3. Classificação de diferenças e parity status

```mermaid
flowchart TD
  Compare["compareEmpresasReadSnapshots"] --> Diffs["differences[] (severity + category)"]
  Diffs --> Summary["summarizeDifferences"]
  Summary --> P{"critical ou blocking?"}
  P -- "0 diffs" --> Parity["parityStatus: parity"]
  P -- "sem critical/blocking" --> Drift["parityStatus: acceptable_drift"]
  P -- "critical/blocking" --> BlockedS["parityStatus: blocked"]
  Parity --> NextOK["next: Guarded Read UI Slice"]
  Drift --> NextOK
  BlockedS --> NextDrift["next: Dual Read Drift Resolution"]
```

## 4. Write guard permanece ativo

```mermaid
flowchart LR
  Compare["Dual Read Compare"] --> Guard["Write Guard (11 ops)"]
  Guard --> Blocked["create/update/delete/... → blocked (code)"]
  Compare -. nunca .-> Write["write real"]
```
