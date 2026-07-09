# Post-Foundation C — Module Diagrams

Empresas Dev-Only Visual Preview — position, flow, and isolation from the production Empresas screen.

---

## Dev-Only Visual Preview — isolated visualization wiring

```mermaid
flowchart TB
  CP[Controlled Preview] --> PM[Preview Model]
  PM --> DVP[Empresas Dev-Only Visual Preview]
  DVP --> PT[Preview Table]
  DVP --> PF[Preview Form]
  DVP --> PD[Preview Diagnostics]

  EUI[Empresas UI real] -. não controlada .-> LEG[Runtime legado]

  DVP -->|flag off default / produção| CLOSED[render null — fail closed]
  DVP -->|flag on em dev| VIEW[createEmpresasDevPreviewModel]
  VIEW -->|preview model inválido| FALLBACK[view model fallback seguro — não lança]
  VIEW -->|input pollution| ERR001[throw EmpresasDevPreviewError MAK-L3-DEV-PREVIEW-001]

  VIEW --> PT
  VIEW --> PF
  VIEW --> PD
```

**Depends on:** `createEmpresasDevPreviewModel`/`isEmpresasDevPreviewEnabled` (pure, framework-free core) + the ControlledPreview preview model. The React components are dev-only and never exported from the runtime barrel.
**Consumed by:** an isolated dev harness only. Never mounted in production navigation, never a public route, never in the main menu.

---

## Testability split — React under node --test

```mermaid
flowchart LR
  subgraph Pure["devPreviewConfig.js (.js — framework-free)"]
    FLAG[isEmpresasDevPreviewEnabled]
    BUILD[createEmpresasDevPreviewModel]
  end
  subgraph View["dev/*.jsx (presentational only)"]
    C1[EmpresasDevPreview.jsx]
    C2[PreviewTable.jsx]
    C3[PreviewForm.jsx]
    C4[PreviewDiagnostics.jsx]
  end
  TEST[node --test] --> Pure
  TEST -. source-scan (regex, não importa JSX) .-> View
  VITE[Vite build] --> View
  ESLINT[eslint src] --> View
  BARREL[src/runtime/index.js] --> Pure
  BARREL -. NÃO exporta .-> View
```

`node --test` exercita o core puro e inspeciona os `.jsx` como texto; Vite compila e ESLint valida os `.jsx`; o barrel do runtime exporta apenas os helpers puros — nenhum React entra no core framework-free.

---

## Isolation guarantee

```mermaid
flowchart LR
  subgraph Production["Produção — inalterada"]
    UI2[Empresas UI] --> LEG2[Runtime legado]
    MENU[Menu principal] -. sem novo item .-> UI2
    APP[src/App.jsx] -. intocado .-> UI2
  end
  subgraph Dev["Dev-only preview — opt-in, fail-closed"]
    DVP2[EmpresasDevPreview] --> V2[View Model]
  end
  Dev -. sem rota, sem menu, sem side effect, sem executar ações .-> Production
```

Com a flag desligada (padrão) ou em produção sem override, `EmpresasDevPreview` renderiza `null` — efeito zero. Nenhum preview é montado em produção; nenhuma rota/menu é adicionado.
