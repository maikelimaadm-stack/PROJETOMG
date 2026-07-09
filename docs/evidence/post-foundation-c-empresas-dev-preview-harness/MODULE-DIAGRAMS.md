# Post-Foundation C — Module Diagrams

Empresas Dev-Only Preview Harness — position, flow, and isolation from the production Empresas screen.

---

## Dev-Only Preview Harness — safe fixture wiring

```mermaid
flowchart TB
  FIX[Fixture Mock Seguro] --> HARN[Empresas Dev Preview Harness]
  HARN --> DVP[EmpresasDevPreview]
  DVP --> PT[PreviewTable]
  DVP --> PF[PreviewForm]
  DVP --> PD[PreviewDiagnostics]

  EUI[Empresas UI real] -. não controlada .-> LEG[Runtime legado]

  HARN -->|flag off default / produção| CLOSED[render null — fail closed]
  HARN -->|flag on em dev| FIX
  FIX -->|determinística, mock, sem dados reais, sensíveis mascarados| DVP
```

**Depends on:** `createEmpresasDevPreviewFixture` + `isEmpresasDevPreviewHarnessEnabled` (pure, framework-free) and `EmpresasDevPreview` (dev-only component). The harness React component is never exported from the runtime barrel.
**Consumed by:** a manual dev harness mount only. Never a public production route, never in the main menu, never auto-mounted.

---

## Fixture — safe, deterministic, no real data

```mermaid
flowchart LR
  FX[createEmpresasDevPreviewFixture] --> MODEL["PreviewModel válido\n{table, form, diagnostics, meta}"]
  MODEL --> T["table: colunas estruturais + rowActions (metadata)"]
  MODEL --> F["form: campos + validation + permission + denied\n+ formActions/formWorkflows (metadata)"]
  MODEL --> D["diagnostics: warnings, differences, deniedFields,\nunsupportedFeatures (metadata-only)"]
  MODEL --> M["meta: source=mock-fixture, mocked=true,\napiKey → [REDACTED]"]
  FX -. sem banco, sem backend, sem Prisma, sem fetch, sem dados reais .-> SAFE[Mock seguro]
```

---

## Isolation & opt-in gating

```mermaid
flowchart TB
  ENV[env] --> HFLAG{MAK_..._DEV_PREVIEW_HARNESS === true?}
  HFLAG -->|não| OFF[harness off — render null]
  HFLAG -->|sim| PRODQ{produção?}
  PRODQ -->|sim, sem override| OFF2[fail closed — render null]
  PRODQ -->|não / override explícito| ON[harness monta preview com fixture]
  ON --> INNER[EmpresasDevPreview recebe env efetivo\n(liga o preview interno; PROD ainda fail-closed)]
```

Duas camadas de proteção: a flag do harness (dev-only, fail-closed em produção) e o próprio `EmpresasDevPreview` (que também re-checa produção). Nenhuma rota/menu é adicionada; `src/App.jsx` permanece intocado.
