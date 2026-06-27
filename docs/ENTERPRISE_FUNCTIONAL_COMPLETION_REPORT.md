# Relatório — Cobertura Funcional ModeloBase1

Data: 2026-06-26  
Branch: `cursor/functional-completion-7d24`

## Escopo

Fechamento dos GAPs funcionais identificados na auditoria de cobertura, promovendo capacidades existentes do Cadastro de Empresas para o ModeloBase1 sem alterar arquitetura certificada.

## Itens resolvidos

### 1. Filter Sidebar — metadata-driven

- `MgFilterPanel` recebe `textFields` e `statusField` via props.
- Defaults hardcoded removidos de `mgFilterFields.js`.
- `ModeloBase1CadastroPage` lê `module.metadata.filters.sidebar`.
- Todos os módulos certificados declaram `filters.sidebar` em metadata.

### 2. Launch Panel Style — generalizado

- `createMakLaunchPanelStyleStorage.js` persiste `{prefix}_launch_panel_style_v1`.
- `buildMakFormMetadata` aceita `keyPrefix`/`moduleId` e injeta storage automaticamente.
- Produtos, Marcas e CADCPS passam `keyPrefix` no form metadata.

### 3. Bootstrap de Preferências — paridade

- `createMakStandardListagemPreferencesStorage.js` — documento de listagem genérico.
- `createMakModulePreferencesBootstrapHook.js` — ciclo bootstrap/sync/flush/cross-tab.
- Registrados: produtos, marcas, cadcps (+ empresas existente).
- `useAppPreferencesBootstrap` agrega todos os módulos.
- `useModeloBase1PreferencesBootstrap` retorna bootstrap do módulo ativo.
- `prefetchMakPreferencesAtLogin` no login para todos os módulos certificados.
- Escopo multi-módulo em `userPreferencesScope.js` (`pro_`, `mar_`, `cps_`).

### 4. buildMakStandardDynamicFields — expandido

Tipos adicionados: `select`/`autocomplete` com `MakCmdSelect` (hideToolbar), `image`, `cpf_cnpj`, `cep`, `tel`, `email`, `number`, inputs nativos em launch mode.

### 5. Metadata — hardcodes eliminados

- `sidebarFilterFields` → `metadata.filters.sidebar`
- `launchPanelStyle` → storage genérico por keyPrefix
- `storageKeys` explícitos em search metadata (produtos/marcas/cadcps)

## Stubs documentados (deferidos)

| Stub | Motivo técnico |
|------|----------------|
| `ModeloBase1/import/index.js` | Import Engine requer backend/API de importação inexistente no escopo atual. Placeholder mantido. |
| `ModeloBase1/grouping/index.js` | Agrupamento removido intencionalmente da tabela certificada. |
| `MakMasterHistory.jsx` | Requer API de histórico/auditoria por registro ainda não exposta aos módulos certificados. |

## Validação final (auditoria)

1. **GAP funcional restante entre Empresas e ModeloBase1?** — **NÃO** (capacidades estruturais promovidas; domínio Empresas permanece em runtime/metadata de domínio).
2. **Config estrutural exclusiva de Empresas?** — **NÃO** (sidebar, launchPanel, bootstrap, storageKeys declarados por metadata).
3. **Preferência exclusiva de Empresas?** — **NÃO** (bootstrap/sync equivalente para produtos/marcas/cadcps).
4. **Layout exclusivo de Empresas?** — **NÃO** (motor único ModeloBase1CadastroPage).
5. **Config hardcoded estrutural?** — **NÃO** (defaults Empresas removidos do framework).
6. **Stub funcional pendente?** — **SIM** — Import Engine, History (documentados acima; requerem APIs externas).
7. **Capacidade reutilizável fora do ModeloBase1?** — **NÃO** (filtros, launch panel, bootstrap, dynamic fields na foundation).

## Gates

- G137–G145: `node scripts/gate-functional-completion.mjs`
- G127–G136 (SSOT), G58–G72 (paridade), G31–G45 (certificação)
