# Post-Foundation C — Module Diagrams

Empresas Table/Form Shadow Projection — position, flow, and isolation from the production Empresas screen.

---

## Table/Form Shadow — passive projection wiring

```mermaid
flowchart TB
  EUI[Empresas UI atual] --> LEG[Runtime legado]
  EUI -. não controlada pela projeção .-> LEG

  ETF[Empresas Table/Form Shadow] --> ESP[EmpresasShadowPilot / RuntimeShadowMode]
  ETF --> RE[Render Engine M12]
  ETF --> PE[Permission Engine M09]
  ETF --> VE[Validation Engine M15]
  ETF --> PROJ[Table/Form Projection]
  ETF --> DIAG[Diagnostics Report]

  ETF --> LSNAP[createLegacyTableFormSnapshot]
  ETF --> V2PROJ[createRuntimeV2TableFormProjection]
  ETF --> RUN[run input]

  RUN -->|flag desligada default| SKIP[skipped: true — no-op]
  RUN -->|flag ligada| PROJ
  RUN -->|input pollution/depth| ERR001[throw EmpresasShadowPilotError MAK-L3-SHADOW-PILOT-001]
  RUN -->|Render/Permission/Validation falha| CAP[error capturado no relatório — nunca propagado]

  PROJ --> TBL[projectTable — columns/visibleColumns/actions metadata]
  PROJ --> FRM[projectForm — fields/validation/permission/actions/workflows metadata]
  PROJ --> RT[buildRenderTree — intermediate, no DOM/React]
  LSNAP --> CMP[compareTableForm via RuntimeShadowMode — estrutural, mascarado]
  V2PROJ --> CMP
  CMP --> DIAG
```

**Depends on (all optional/injectable):** `RuntimeShadowMode` (default construído internamente), Permission Engine (M09), Validation Engine (M15), Render Engine (M12), Observability (M24). Nenhum obrigatório.
**Consumed by:** um futuro preview visual controlado / segundo módulo piloto. Nunca consumido pelo render de produção, Studio ou Marketplace.

---

## Projection shape — intermediate, never renderable

```mermaid
flowchart TB
  DESC[EMPRESAS_TABLE_FORM_DESCRIPTOR] --> PT[projectTable]
  DESC --> PF[projectForm]
  PT --> TABLE["table:\ncolumns[], visibleColumns[], actions[] (metadata only)"]
  PF --> FORM["form:\nfields[] (type/required/permission/validation),\nvisibleFields[], actions[]+workflows[] (metadata only)"]
  TABLE --> BRT[buildRenderTree]
  FORM --> BRT
  BRT --> RTREE["renderTree (intermediate):\n{type:'view', component:'TableFormView', children:[TableView, FormView]}"]
  RTREE -. objeto plano serializável, sem nó DOM / elemento React .-> SAFE[Sem render real]
```

Actions e workflows aparecem **apenas como metadados** `{id, kind, ref}` — nunca há função de execução; o Action/Workflow/Connector Engine nunca é invocado (mesmo contrato do Render Engine, que "never dispatches").

---

## Legacy vs Runtime v2 — divergence surfaced

```mermaid
flowchart TB
  D[Descritor Empresas] --> L[createLegacyTableFormSnapshot]
  D --> V[createRuntimeV2TableFormProjection]
  L -->|tipos crus, sem filtro de permissão| LS[Legacy Snapshot]
  V -->|tipos canônicos + M09 marca/filtra negados + validação| VP[Runtime v2 Projection]
  LS --> C[compareTableForm — RuntimeShadowMode]
  VP --> C
  C --> R["differences controladas\n(path: form quando há drift de tipo;\n+ renderTree quando permissão filtra)"]
```

---

## Isolation guarantee

```mermaid
flowchart LR
  subgraph Production["Produção — inalterada"]
    UI2[Empresas UI] --> LEG2[Runtime legado]
  end
  subgraph Shadow["Projeção shadow — opt-in, desligável"]
    ETF2[EmpresasTableFormShadow] --> PROJ2[Table/Form Projection]
    ETF2 --> DIAG2[Diagnostics]
  end
  Shadow -. sem render real, sem side effect, sem salvar/editar/excluir .-> Production
```

Com a flag desligada (padrão), `run()` retorna `{ skipped: true }` sem construir projeção — efeito zero sobre a tela Empresas.
