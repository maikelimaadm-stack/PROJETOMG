# ModeloBase1 Consolidation — Inventário V15.1

## Modelo estrutural oficial

**Único motor:** `ModeloBase1CadastroPage` via `buildModeloBase1ConfigFromMakModule`.

## Removido nesta missão

| Caminho | Motivo |
|---------|--------|
| `src/modules/empresas/layout/*` (39 arquivos) | Re-exports órfãos → `@/framework/mak/layout` |
| `config/modeloBase1/index.js` + 7 barrels | Nunca importados em runtime |
| `PAGEMP.sections.jsx` | Re-export duplicado de `ModeloBase1PanelSections` |
| `FORMEMP.jsx`, `TBLEMP.jsx`, `SRCHEMP.jsx` | Wrappers legados fora do render path |
| 11 hooks `useEmp*` / `useEmpresa*` | Aliases deprecated |
| 4 component shims | Re-exports ModeloBase1 |
| `empresasFormRuntime.jsx`, `empresasMakRuntime.js` | Consolidados na Foundation V15 |

## Mantido (domínio Empresas)

- `empresasModeloBase1Config.js` — overrides domínio + `components: empresasToolbarComponents`
- `empresasSearchViewConfig.js` — data/search adapters
- `empresasLayoutConfig.js` / `empresasToolbarConfig.js` — metadados gate/paridade
- `empresasModuleMetadata.js`, preferences, repository

## Respostas Fase 1

Todas **NÃO** para implementação paralela após limpeza.
