# Enterprise V13 — Layout Configuration Engine Report

## Missão

Promover integralmente a Layout Configuration Engine do Cadastro de Empresas para o ModeloBase1, sem reimplementação.

## O que foi promovido

| Componente | Origem | Destino oficial |
|------------|--------|-----------------|
| LayoutEngine | cadastro-engine | `framework/mak/layoutConfig` + `ModeloBase1/layoutConfig` |
| LayoutPreferencesEngine | cadastro-engine | idem |
| CadLayoutConfigurator | EmpLayoutConfiguratorDialog (re-export) | idem |
| CadastroModuleConfig | cadastro-engine | metadata por módulo (*CadastroConfig.js) |
| useCadastroForm | cadastro-engine | consumido por MakCadastroForm |

## O que foi generalizado

1. **systemPanelIds** — removido hardcode Empresas em `MakCadastroForm.jsx`; usa `cadastroConfig.systemPanelIds`.
2. **Scope CSS** — formulário usa `buildModeloBase1ScopeCssClass(moduleId)` em todos os modos (loading, layout config, normal).
3. **fixedPanelIds / fixedVisibleFieldIds / brandTheme** — declarados em `CadastroModuleConfig` e repassados ao configurador.
4. **buildMakLayoutConfigMetadata** — metadata declarativa extraída de cadastroConfig para qualquer módulo.
5. **createMakLayoutConfigEngine** — fachada que instancia CadastroEngine existente (zero reescrita).
6. **registerMakLayoutConfigEngine** — bootstrap automático para empresas, produtos, marcas, cadcps.
7. **buildModeloBase1ConfigFromMakModule** — expõe `layoutEngine` no config ModeloBase1.

## O que passou a ser metadata

- `moduleId`, `entityName`, `screenKey`, `storagePrefix`
- `mainTabId`, `systemPanelIds`, `fixedPanelIds`, `fixedVisibleFieldIds`, `brandTheme`
- `basePanels`, `defaultFlatLayout` (via cadastroConfig)
- Chaves de storage e eventos de layout (`layoutUpdatedEvent`, `layoutHydratedEvent`)

## Como um novo módulo usa a Engine

```js
// 1. Criar cadastroConfig
export const meuModuloCadastroConfig = createCadastroModuleConfig({
  moduleId: "meumodulo",
  entityName: "MeuModuloCadastro",
  screenKey: "meumodulo.form_layout",
  storagePrefix: "mm",
  getDefaultLayoutConfig: buildMeuFormDefaultConfig,
  basePanels: MEU_FORM_BASE_PANELS,
  defaultFlatLayout: MEU_FORM_DEFAULT_LAYOUT,
  systemPanelIds: ["principais"],
});

// 2. Wire no makModule
defineMakModule(definition, metadata, {
  cadastroConfig: meuModuloCadastroConfig,
  ...
});

// 3. Registrar no bootstrap (cadastro-modules.registry.json + registerMakLayoutConfigEngine)
```

O formulário (`MakCadastroForm`) e o configurador (`CadLayoutConfigurator`) passam a funcionar automaticamente — mesma árvore React, mesmos componentes.

## Gates (G156–G165)

Script: `npm run gate:layout-config-engine-v13`

## Validação final (15 perguntas)

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Configuração visual exclusiva Empresas? | NÃO |
| 2 | Layout não controlável pelo ModeloBase1? | NÃO |
| 3 | Config estrutural hardcoded? | NÃO |
| 4 | Toolbar exclusiva Empresas? | NÃO |
| 5 | Cards exclusivos Empresas? | NÃO |
| 6 | Tabela exclusiva Empresas? | NÃO |
| 7 | Formulário exclusivo Empresas? | NÃO |
| 8 | Search exclusivo Empresas? | NÃO |
| 9 | Dock exclusivo Empresas? | NÃO |
| 10 | Dialog exclusivo Empresas? | NÃO |
| 11 | Painéis exclusivos Empresas? | NÃO |
| 12 | Layout exclusivo Empresas? | NÃO |
| 13 | Preferências exclusivas Empresas? | NÃO |
| 14 | Tela Lançamentos exclusiva Empresas? | NÃO |
| 15 | Comportamento estrutural dependente só Empresas? | NÃO |

## Deploy Railway

PR #274 mergeada em `main` (commit `e7917699`). Branch de integração `cursor/table-card-style-7d24` sincronizada para disparar deploy.

## Paridade

Empresas continua usando exatamente `CadLayoutConfigurator` → `EmpLayoutConfiguratorDialog` — única diference aceita: localização dos exports oficiais em `ModeloBase1/layoutConfig`.
