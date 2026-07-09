# Post-Foundation C — Module Diagrams

Runtime v2 Shadow Mode — position, dependencies, and isolation from production UI.

---

## Shadow Mode — parallel diagnostics, not migration

```mermaid
flowchart TB
  UI[UI atual / produção] --> LEGACY[Legacy Runtime — runtimeBridge]
  UI -. NÃO controlada pelo shadow .-> LEGACY

  SM[Runtime v2 Shadow Mode] --> V2[Runtime v2 — loadRuntimeBundle]
  SM --> OBS[Observability Engine M24]
  SM --> COMP[Runtime Completion]
  SM --> DIAG[Diagnostics Report]

  SM --> READY[checkReadiness runtime]
  SM --> PASS[runShadowPass input]
  SM --> CMP[compareWithLegacy legacySnapshot, v2Snapshot]
  SM --> GETDIAG[getDiagnostics]
  SM --> CLEAR[clear]

  PASS -->|enabled = false default| SKIP[skipped: true — no-op]
  PASS -->|enabled = true| V2
  PASS -->|runtime v2 throws| CAPTURED[error captured as data — never propagated]
  PASS -->|input pollution/depth| ERR001[throw RuntimeShadowModeError MAK-L3-SHADOW-001]

  READY --> COMP
  CMP -->|invalid snapshot argument| ERR003[throw RuntimeShadowModeError MAK-L3-SHADOW-003]
  CMP --> REDACT[mask sensitive values in reported diffs]

  PASS --> OBS
  PASS --> DIAG
  CMP --> DIAG

  LEGACY -. snapshot via getRuntimeBridgeStatus .-> CMP
  V2 -. snapshot .-> CMP
```

**Depends on (all optional/injectable):** `loadRuntime` (host-supplied builder of a runtime v2 result), Observability Engine (M24), Runtime Completion. None are mandatory — with none wired, Shadow Mode still constructs and short-circuits safely when disabled.
**Consumed by:** future host wiring behind a feature flag (a pilot module in shadow mode). Never consumed by production UI, Studio, or Marketplace.

---

## Isolation guarantee

```mermaid
flowchart LR
  subgraph Production["Produção — inalterada"]
    UI2[UI atual] --> LEG2[Legacy Runtime]
  end

  subgraph Shadow["Modo sombra — opt-in, desligável"]
    SM2[RuntimeShadowMode] --> V22[Runtime v2]
    SM2 --> DIAG2[Diagnostics]
  end

  SM2 -. lê snapshot, não controla .-> LEG2
  Shadow -. sem side effect, sem render, sem action/workflow/connector real .-> Production
```

Com `enabled: false` (padrão), o bloco Shadow é inerte: `runShadowPass()` retorna `{ skipped: true }`. Nenhuma tela real passa a depender do runtime v2; nenhuma ação de usuário muda.

---

## Two-tier failure model

```mermaid
flowchart TB
  IN[Entrada / operação do Shadow Mode] --> KIND{Tipo de falha}
  KIND -->|Estrutural: opção inválida, poluição de protótipo,\nprofundidade, argumento de comparação inválido, overflow| THROW[throw RuntimeShadowModeError\nMAK-L3-SHADOW-001..004]
  KIND -->|Execução: runtime v2 falha durante o pass| DATA[return success:false + error\ncapturado, nunca propagado para UI]
```

Falhas do próprio adaptador (contrato/segurança) são lançadas para o desenvolvedor; falhas do runtime v2 sob diagnóstico são isoladas como dado — a fronteira que garante que o modo sombra nunca possa derrubar produção.
