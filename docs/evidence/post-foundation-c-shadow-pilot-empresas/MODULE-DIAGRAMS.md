# Post-Foundation C — Module Diagrams

Empresas Runtime v2 Shadow Pilot — position, flow, and isolation from the production Empresas screen.

---

## Empresas Shadow Pilot — passive diagnostic wiring

```mermaid
flowchart TB
  EUI[Empresas UI atual] --> LEG[Runtime legado]
  EUI -. não controlada pelo piloto .-> LEG

  ESP[Empresas Shadow Pilot] --> SM[RuntimeShadowMode]
  SM --> V2[Runtime v2]
  SM --> OBS[Observability]
  SM --> COMP[Runtime Completion]
  ESP --> DIAG[Diagnostics Report]

  ESP --> LSNAP[createLegacySnapshot input — tipos crus]
  ESP --> V2SNAP[createRuntimeV2Input input — tipos canônicos]
  ESP --> RUN[run input]

  RUN -->|flag desligada default| SKIP[skipped: true — no-op]
  RUN -->|flag ligada| SM
  RUN -->|input pollution/depth| ERR001[throw EmpresasShadowPilotError MAK-L3-SHADOW-PILOT-001]
  RUN -->|shadow/interno falha| CAP[error capturado no relatório — nunca propagado]

  LSNAP --> CMP[compareWithLegacy — estrutural, mascarado]
  V2SNAP --> CMP
  CMP --> DIAG
  RUN --> DIAG
```

**Depends on (all optional/injectable):** `RuntimeShadowMode` (default construído internamente com `enabled: true`), Observability, Runtime Completion, `loadRuntimeV2`. Nenhum obrigatório.
**Consumed by:** um futuro hook passivo e feature-flagged da UI Empresas. Nunca consumido diretamente pelo render de produção, Studio ou Marketplace.

---

## Decoupling — runtime não importa o módulo

```mermaid
flowchart LR
  subgraph Runtime["src/runtime — camada runtime"]
    ESP2[EmpresasShadowPilot] --> DESC[EMPRESAS_DEFAULT_DESCRIPTOR\ndescritor estrutural passivo]
    ESP2 -. aceita override .-> INPUT[input do chamador\n(field defs vivos, futuro)]
  end

  subgraph Module["src/modules/empresas — UI de produção"]
    EMPUI[CadastroEmpresas / EMP_FORM_FIELD_DEFS]
  end

  Runtime -. NÃO importa .-> Module
  Module -. poderia (futuro) entregar input passivo .-> Runtime
```

O runtime nunca importa `src/modules/empresas/*` nem `src/App.jsx` (isso inverteria a camada). O descritor canônico vive no runtime; a UI real poderá, no futuro, entregar seus field defs como `input` sem criar dependência runtime→módulo. Verificado por teste e gate.

---

## Legacy vs Runtime v2 — structural drift surfaced

```mermaid
flowchart TB
  DESC2[Descritor Empresas] --> L[createLegacySnapshot]
  DESC2 --> V[createRuntimeV2Input]
  L -->|tipos crus: tel, cpf_cnpj, text| LSNAP2[Legacy Snapshot]
  V -->|canônicos: phone, document, string| VSNAP2[Runtime v2 Snapshot]
  LSNAP2 --> CMP2[compareWithLegacy]
  VSNAP2 --> CMP2
  CMP2 --> REPORT[equivalent + differences\n(path: fields quando há drift)]
```

O piloto revela, de forma determinística e controlada, o drift de normalização de tipos entre o que o runtime legado representa e o que o runtime v2 produziria — sem tocar nenhum dado real ou tela.

---

## Two-tier failure model

```mermaid
flowchart TB
  IN[Entrada / operação do piloto] --> KIND{Tipo de falha}
  KIND -->|Estrutural: opção inválida,\npoluição de protótipo, profundidade| THROW[throw EmpresasShadowPilotError\nMAK-L3-SHADOW-PILOT-001/002]
  KIND -->|Execução: RuntimeShadowMode falha\ndurante run| DATA[return ok:false + error\ncapturado, nunca propagado para a UI Empresas]
```
