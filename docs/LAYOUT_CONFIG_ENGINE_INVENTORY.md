# Layout Configuration Engine — Inventário Técnico (Fase 1)

Inventário da Engine madura do Cadastro de Empresas promovida para ModeloBase1 (Enterprise V13).

## Motor central (cadastro-engine)

| Capacidade | Localização | Tipo | Consumidores | ModeloBase1 |
|------------|-------------|------|--------------|-------------|
| LayoutEngine | `src/framework/cadastro-engine/layout/LayoutEngine.js` | Código | useCadastroForm, RenderEngine | Re-export via `ModeloBase1/layoutConfig` |
| LayoutPreferencesEngine | `src/framework/cadastro-engine/preferences/LayoutPreferencesEngine.js` | Código | useCadastroForm, AuthContext | Re-export |
| CadLayoutConfigurator | `src/framework/cadastro-engine/design-system/CadLayoutConfigurator.jsx` → `EmpLayoutConfiguratorDialog` | UI | MakCadastroForm | Re-export (sem duplicação) |
| CadastroModuleConfig | `src/framework/cadastro-engine/core/CadastroModuleConfig.js` | Metadata factory | *CadastroConfig.js por módulo | Sim |
| useCadastroForm | `src/framework/cadastro-engine/hooks/useCadastroForm.js` | Hook | MakCadastroForm | Re-export |
| RenderEngine | `src/framework/cadastro-engine/render/RenderEngine.jsx` | UI | MakCadastroForm | Via cadastro-engine |
| layoutConfigV3 | `src/framework/cadastro/layouts/layoutConfigV3.js` | Schema | LayoutEngine, configurador | Metadata (version: 3) |
| empFormLayoutStore | `src/framework/cadastro/layouts/empFormLayoutStore.js` | Persistência local | LayoutPreferencesEngine | Generalizado por moduleId |

## Configurador visual (EmpLayoutConfiguratorDialog)

| Capacidade | Localização | Metadata |
|------------|-------------|----------|
| Painéis / Abas | EmpLayoutConfiguratorDialog | `basePanels`, `systemPanelIds` em cadastroConfig |
| Cards / Linhas / Campos | layoutConfigV3 + layoutConfiguratorMutations | `layout[panelId].cards[]` |
| Drag & drop | layoutConfiguratorDrag.js | — |
| Visibilidade condicional | EmpConditionalVisibilityEditor | `visibilityRules` |
| Valores padrão | EmpLayoutFieldDefaultValueEditor | `fieldDefaultValues` |
| Agregação tabela | aggregationConfig | metadata layout |
| Toolbar configurador | LayoutConfigToolbar.jsx | bridge via onLayoutToolbarBridge |

## Formulário (MakCadastroForm)

| Capacidade | Antes V13 | Depois V13 |
|------------|-----------|------------|
| systemPanelIds | Hardcoded Empresas (linha 944) | `cadastroConfig.systemPanelIds` |
| Scope CSS | `mg-empresas-scope` fixo | `buildModeloBase1ScopeCssClass(moduleId)` |
| fixedPanelIds / brandTheme | Hardcoded | `cadastroConfig.*` |

## Listagem / Search / Cards / Filtros

| Capacidade | Localização | Generalizado |
|------------|-------------|--------------|
| Cards layout | buildSearchViewFromMakModule | Sim — por moduleId |
| Filter fields layout | useModeloBase1FilterFieldsLayout | Sim |
| View mode | useModeloBase1ViewModePreference | Sim |
| Toolbar | MgActionBar / MakToolbar | Sim — metadata |
| Tabela | MakCadastroTable | Sim — metadata.table |
| Dock | MakDock | Sim — ModeloBase1 |

## Módulos com cadastroConfig

| Módulo | Arquivo | systemPanelIds |
|--------|---------|----------------|
| empresas | empresasCadastroConfig.js | principais, endereco, observacoes, campos_personalizados |
| produtos | produtosCadastroConfig.js | principais |
| marcas | marcasCadastroConfig.js | principais |
| cadcps | cadcpsCadastroConfig.js | principais |

## Registro bootstrap

`registerMakLayoutConfigEngine.js` — registra engine por módulo ativo em `cadastro-modules.registry.json`.

## Persistência

- localStorage scoped por userId + clienteId + storagePrefix
- Sync remoto via UsuarioPreferencia (screenKey: `{moduleId}.form_layout`)
- Eventos: `cadastro-layout-updated:{moduleId}`, `cadastro-layout-hydrated:{moduleId}`

## O que permanece regra de negócio (não layout)

- Validação Zod por entidade
- Campos nativos / custom fields por módulo
- Repository / API calls
- Permissões RBAC
