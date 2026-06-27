# CADCPS — Relatório de Migração ModeloBase1

## Veredito

**O módulo Cadastro de Campos Personalizados agora é um consumidor completo do ModeloBase1?**

**SIM**

---

## 1. Arquivos migrados / criados

| Arquivo | Papel |
|---------|-------|
| `src/modules/cadcps/pages/PAGCPS.jsx` | Thin page (~10 LOC) |
| `src/modules/cadcps/config/cadcpsModeloBase1Config.js` | Factory ModeloBase1 |
| `src/modules/cadcps/config/cadcpsMakModule.js` | MakModule wired |
| `src/modules/cadcps/config/cadcpsModuleMetadata.js` | Metadata declarativa |
| `src/modules/cadcps/config/cadcpsCadastroConfig.js` | Cadastro engine config |
| `src/modules/cadcps/config/cadcpsPreferencesAdapter.js` | Preferências `cps` |
| `src/modules/cadcps/config/cpsForm.constants.js` | Colunas, layout, empty form |
| `src/modules/cadcps/data/cadcpsListCache.js` | Cache `["cps-cadastro"]` |
| `src/modules/cadcps/runtime/cadcpsFormRuntime.jsx` | Regras de domínio do formulário |
| `src/modules/cadcps/runtime/cadcpsTableRuntime.js` | Formatação de células |
| `src/modules/cadcps/runtime/useCadcpsFormResources.js` | Recursos (telas, empresas, fórmulas) |
| `config/cadastro-modules.registry.json` | Registro certificado |
| `scripts/governance-baseline.json` | Remoção exceção legada |

## 2. Componentes removidos

- `PAGCPS.sections.jsx` (~37 LOC)
- `FORMCPS.jsx` (~690 LOC)
- `TBLCPS.jsx` (~1050 LOC)
- `tblCps.constants.js`, `tblCps.filters.js`
- `formCps.constants.js` (substituído por `cpsForm.constants.js`)

**Total eliminado:** ~2.850 LOC estruturais legadas.

## 3. Componentes promovidos (Foundation)

Extensões retrocompatíveis em `buildMakFormMetadata` / `buildMakTableMetadata` / `MakCadastroForm` / `MakCadastroTable`:

- `buildDynamicFields`, `mapRecordToForm`, `prepareSubmitPayload`, `validateFormExtra`, `useFormResourcesHook`
- `resolveFieldValue`, `resolveComparableValue`

Beneficiam todos os módulos futuros sem alterar Empresas.

## 4. Componentes reutilizados

- `ModeloBase1CadastroPage`
- `MakFormPanel`, `MakTablePanel`, `MakCadastroSearchPanel`
- `MakLoadBatchControls`, `MakFilterFieldsConfigDialog`
- `buildModeloBase1ConfigFromMakModule`
- `buildCadcpsColumnFilters` (já registrado)

## 5. Regras de negócio preservadas

- 19 tipos de campo, aplicação todas/específicas, flags de visibilidade
- Lock de tela após criação, geração `field_name`, opções de lista, máscaras, numérico
- Construtor de fórmula (`EmpCalculationBuilder`), relação entre cadastros
- Validação tela/nome/empresas específicas, payload API compatível
- Adaptadores legados (`legacyDialogAdapter.js`) intactos
- Backend `/api/cadcps/*` inalterado

## 6. Testes executados

| Comando | Resultado |
|---------|-----------|
| `npm run build` | OK |
| `npm run lint` | OK |
| `npm run typecheck` | OK (ruído conhecido shadcn) |
| `npm run verify:governance:cycles` | **5/5 ciclos OK** — G31–G126 100% |

## 7. Evidências

- PAGCPS bundle: ~23 KB (vs motor imperativo ~678 LOC source)
- Gates G109–G126: cadcps certificado com 6 arquivos obrigatórios G114
- G111/G112: zero componentes/hooks estruturais exclusivos
- Registry: 4 módulos certificados (empresas, marcas, produtos, **cadcps**)

## 8. ANTES → DEPOIS

| Aspecto | ANTES | DEPOIS |
|---------|-------|--------|
| Página | `PAGCPS.jsx` 678 LOC imperativo | Thin page 10 LOC |
| Formulário | `FORMCPS.jsx` exclusivo | `MakFormShell` + runtime metadata |
| Tabela | `TBLCPS.jsx` server-paginated | `MakTablePanel` infinite scroll |
| Toolbar/Search/Dock | Wrappers legados | ModeloBase1 unificado |
| Preferências | localStorage ad-hoc `cps_*` | `cadcpsPreferencesAdapter` |
| List cache | `["cadcps-campos"]` | `["cps-cadastro"]` |
| Governança | `legacyModuleExceptions` | Registry certificado |
| Menu Modelo Base1 | Ausente | Incluído |

---

*Migração concluída em branch `cursor/cadcps-modelobase1-migration-7d24`.*
