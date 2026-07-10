# Post-Foundation C — Module Diagrams

**Slice:** Post-Foundation C — Empresas Runtime Bridge Read Slot Candidate

---

## 1. Composição do read slot candidate

```mermaid
flowchart TD
  DryRun["Bridge Dry Run"] --> Candidate["Runtime Bridge Read Slot Candidate"]
  Candidate --> Contract["Read Slot Contract"]
  Candidate --> Payload["Read Slot Payload"]
  Payload --> Validation["Payload Validation"]
  Candidate --> MountPlan["Mount Plan"]
  MountPlan -. não monta de verdade .-> FutureActivation["Future Read Slot Dev Activation"]
  Bridge["RuntimeBridge Real"] -. não alterado .-> Legacy["Runtime Legado"]
  RealUI["Empresas UI Real"] -. não controlada .-> Legacy
```

## 2. Gate de habilitação (dev-only, fail-closed em produção)

```mermaid
flowchart LR
  Env["env"] --> Flag{"MAK_RUNTIME_V2_EMPRESAS_READ_SLOT_CANDIDATE === 'true'?"}
  Flag -- "não (default)" --> Off["enabled=false · skipped · contract/payload/plan null · componente = fallback"]
  Flag -- "sim" --> Prod{"produção?"}
  Prod -- "sim, sem ALLOW_PROD" --> Blocked["enabled=false · productionBlocked=true"]
  Prod -- "não / ALLOW_PROD" --> On["enabled=true · compõe dry run · contract + payload + validation + mount plan"]
```

## 3. Contrato + payload + validação + mount plan

```mermaid
flowchart TD
  Contract["Read Slot Contract"] --> Allowed["allowed (6): receive/render/inspect/report"]
  Contract --> Blocked["blocked (16): create/.../mutateRuntimeBridge/replaceProductionUi"]
  Payload["Read Slot Payload (serializável)"] --> Val{"Payload Validation"}
  Val -- "sem função/handler/React/pollution; writeGuard ok" --> Valid["valid=true · safeToProceed=true"]
  Val -- "problema encontrado" --> Invalid["valid=false · blockers[]"]
  Plan["Mount Plan"] --> Pre{"preconditions (dry run ready + contract read-only + payload valid)"}
  Pre -- "sim" --> Safe["wouldMount=true · safeToProceed=true · mountedAnythingReal=false"]
  Pre -- "não" --> Unsafe["wouldMount=false · blockedReasons[]"]
```

## 4. Write bloqueado (guard + contrato + payload)

```mermaid
flowchart LR
  Candidate["Read Slot Candidate"] --> Guard["writeGuard (da cadeia)"]
  Guard --> BlockedG["create/update/delete/... → { blocked:true, code }"]
  Candidate --> ContractB["contract.blockedOperations (16)"]
  Candidate --> PayloadB["payload.writeGuard summary (writeBlocked:true)"]
  Candidate -. nunca .-> Real["write real / mount real / bridge mutation"]
```
