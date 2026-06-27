# Business Boundary Certification — Inventário (Fase 1 V15)

Auditoria completa do módulo `src/modules/empresas/` — arquivos exclusivos e classificação preliminar.

## Resumo executivo

| Categoria | Arquivos | Infra promovida V15 | Permanece domínio |
|-----------|----------|---------------------|-------------------|
| Config | 20 | 0 (metadata/wiring) | 20 |
| Runtime | 2 | 1 (form → wrapper) | 1 (table resolve) |
| Components | 12 | 2 (filters, masks) | 10 |
| Hooks | 11 | 0 (shims ModeloBase1) | 11 shims |
| Preferences | 15 | 0 (adapter domínio) | 15 |
| Utils | 5 | 2 (filter layout, range) | 3 |
| Layout | ~40 | 0 (re-exports foundation) | 0 lógica |
| Pages | 2 | 0 | 2 |
| Repository/Data | 3 | 0 | 3 |

## Motor promovido nesta missão

| Componente | Origem Empresas | Destino Foundation |
|------------|-----------------|-------------------|
| `buildEmpresasDynamicFields` (290 linhas imperativas) | `runtime/empresasFormRuntime.jsx` | `buildMakDynamicFieldsWithCustomFields` + `EMP_FORM_FIELD_DEFS` |
| Custom fields append | `empresasFormRuntime.jsx` | `appendMakCustomDynamicFields.js` |
| `formatMaskedNumber`, `splitDateTimeValue` | `formEmp.constants.js` | `cadastro-engine/field/maskUtils.js` |
| Range filter helpers | `tblEmp.filters.js` | `shared/filters/columnRangeFilters.js` |
| Filter fields layout | `utils/empFilterFieldsLayout.js` | `mak/filters/createMakFilterFieldsLayoutStorage.js` |
| `resolveLabel` / upload aliases | implícito em runtime | `buildMakStandardDynamicFields.jsx` |

## Arquivos por categoria

### Config (domínio — metadata e wiring)

- `config/moduleDefinition.js` — schema, API, repository binding
- `config/empresasSchema.js` — validação Zod frontend
- `config/empresasCadastroConfig.js` — cadastro engine config
- `config/empresasMakModule.js` — defineMakModule
- `config/empresasModuleMetadata.js` — SSOT declarativa (consome Foundation builders)
- `config/empresasPreferencesAdapter.js` — adapter prefs (domínio + infra)
- `config/modeloBase1/*` — slices ModeloBase1 (re-exports + wiring)
- `config/empPdfExportConfig.jsx` — export PDF/Excel domínio

### Runtime

- `runtime/empresasFormRuntime.jsx` — **MISTO → wrapper V15** (deprecated, delega Foundation)
- `runtime/empresasTableRuntime.js` — **REGRA DE NEGÓCIO** (labels tipo_vinculo, colunas Empresa)

### Form

- `components/formEmp.constants.js` — **MISTO**: `EMP_FORM_FIELD_DEFS` (domínio) + layouts/panels (domínio)
- `components/formEmp.customFields.jsx` — shim infra

### Tabela / Filtros

- `components/tblEmp.constants.js` — **REGRA DE NEGÓCIO** (colunas Empresa)
- `components/tblEmp.filters.js` — **INFRA** (re-export shared + columnRangeFilters)
- `utils/empTableColumnCatalog.js` — **MISTO** (catálogo colunas + custom fields Empresa)

### Search / Cards

- `components/empSearchView.constants.js` — **REGRA DE NEGÓCIO** (aliases, catálogo cards Empresa)

### Preferences (permanece — adapter domínio)

- `preferences/*` — storage keys `emp_*`, bootstrap Empresas, cross-tab sync

### Layout (~40 arquivos)

- Todos re-exports de `@/framework/mak/layout/` — **sem lógica Empresas**

### Hooks

- Todos wrappers/aliases ModeloBase1 — **shims compatibilidade**, zero lógica nova

### Backend

- `backend/src/modules/empresas/*` — **REGRA DE NEGÓCIO** (service, repository, validators)

## buildEmpresasDynamicFields — desmontagem V15

| Parte | Classificação | Destino |
|-------|---------------|---------|
| Select tipo_pessoa / tipo_vinculo / status | REGRA DE NEGÓCIO (opções) | `EMP_FORM_FIELD_DEFS` |
| Render select/autocomplete | INFRAESTRUTURA | `buildMakStandardDynamicFields` |
| CPF/CNPJ dinâmico por tipo_pessoa | REGRA DE NEGÓCIO | `resolveLabel` em field def |
| Logo upload | INFRA (render) + REGRA (label) | Foundation image type + def domínio |
| Campos personalizados mapping | INFRAESTRUTURA | `appendMakCustomDynamicFields` |
| Máscaras tel/cep/email | INFRAESTRUTURA | FieldRegistry + standard builder |
