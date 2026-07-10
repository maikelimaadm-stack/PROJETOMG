# Post-Foundation C — Module Diagrams

**Slice:** Post-Foundation C — Empresas Read-Only Runtime v2 Candidate

---

## 1. Composição do candidate read-only

```mermaid
flowchart TD
  Candidate["Empresas Read-Only Candidate"] --> ViewModel["ViewModel Read-Only"]
  ViewModel --> Dataset["Controlled Dataset (mock, mascarado)"]
  ViewModel --> Projection["Empresas Table/Form Projection (runtime v2)"]
  Candidate --> Guard["Write Guard (11 ops bloqueadas)"]
  Candidate --> Diagnostics["Diagnostics"]
  Diagnostics --> Rollback["Rollback Plan (flag off)"]
  RealUI["Empresas UI Real"] -. não controlada .-> Legacy["Runtime Legado (fonte da verdade)"]
```

## 2. Gate de habilitação (dev-only, fail-closed em produção)

```mermaid
flowchart LR
  Env["env (import.meta.env / process.env)"] --> Flag{"MAK_RUNTIME_V2_EMPRESAS_READONLY === 'true'?"}
  Flag -- "não (default)" --> Off["enabled=false · skipped · noSideEffects · viewModel=null"]
  Flag -- "sim" --> Prod{"produção?"}
  Prod -- "sim, sem ALLOW_PROD" --> Blocked["enabled=false · productionBlocked=true (fail-closed)"]
  Prod -- "não / ALLOW_PROD" --> On["enabled=true · mode=read_only_candidate · gera viewModel"]
```

## 3. Write guard — write real impossível

```mermaid
flowchart TD
  Attempt["attempt(operation, payload)"] --> P1{"flag off?"}
  P1 -- "sim" --> C1["code 001 (flag disabled)"]
  P1 -- "não" --> P2{"produção bloqueada?"}
  P2 -- "sim" --> C2["code 002 (production blocked)"]
  P2 -- "não" --> P3{"prototype pollution no payload?"}
  P3 -- "sim" --> C7["code 007 (pollution blocked)"]
  P3 -- "não" --> P4{"operação reconhecida?"}
  P4 -- "não" --> C4["code 004 (invalid operation)"]
  P4 -- "sim (create/update/delete/...)" --> C3["code 003 (write blocked)"]
  C1 --> Blocked["{ ok:false, blocked:true }"]
  C2 --> Blocked
  C7 --> Blocked
  C4 --> Blocked
  C3 --> Blocked
```

## 4. Próximo passo condicionado

```mermaid
flowchart LR
  ReadOnly["Empresas Read-Only Candidate PASS"] --> Cond{"writeGuard + route + hub + dataset + shadow + planning PASS?<br/>rollback available? sem blockers?"}
  Cond -- "sim" --> Next["Post-Foundation C — Empresas Dual Read Shadow Compare"]
  Cond -- "não" --> Hold["mantém read-only candidate"]
  Next -. ainda proibido .-> NoWrite["salvar/editar/excluir · substituir tela real · remover legado · backend/Prisma"]
```
