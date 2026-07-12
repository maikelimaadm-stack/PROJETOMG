# Empresas — File Inventory

Inventário dos arquivos que compõem o Cadastro de Empresas (auditoria; nenhum arquivo alterado).

## Entrada / página

| Arquivo | Tipo | Função |
|---|---|---|
| `src/modules/empresas/pages/PAGEMP.jsx` | página | Renderiza `<ModeloBase1CadastroPage config={empresasModeloBase1Config} />` — só configuração; o motor é o ModeloBase1 |

## Config (o coração do módulo)

| Arquivo | Tipo | Função |
|---|---|---|
| `config/moduleDefinition.js` | config | `createCadastroModuleDefinition({ moduleId:"empresas", repository: empRepository, api: EmpresaApi, schema })` |
| `config/empresasMakModule.js` | config | MAK module (fonte para `buildModeloBase1ConfigFromMakModule`) |
| `config/empresasModuleMetadata.js` | config | Metadata do módulo |
| `config/empresasSchema.js` | config | Schema de campos do cadastro |
| `config/empresasCadastroConfig.js` | config | Config do cadastro (layout keys etc.) |
| `config/empresasPreferencesAdapter.js` | config | Adapter de preferências (remoto/local) |
| `config/empPdfExportConfig.jsx` | config | Config de export PDF/Excel |
| `config/modeloBase1/empresasModeloBase1Config.js` | config | **Ponto de integração ModeloBase1** — monta a config final + injeta `runtimeReadModel` beta (flag) |
| `config/modeloBase1/empresasSearchViewConfig.js` | config | data config, preferences adapter, custom fields |
| `config/modeloBase1/empresasToolbarConfig.js` | config | Componentes de toolbar |
| `config/modeloBase1/empresasLayoutConfig.js` | config | Layout |
| `config/modeloBase1/empresasSearchViewConfig.js` | config | Search view |

## Componentes

| Arquivo | Tipo | Função |
|---|---|---|
| `components/tblEmp.constants.js` | componente/const | Constantes da tabela (chaves de preferências, colunas) |
| `components/tblEmp.filters.js` | componente | Filtros da tabela |
| `components/formEmp.constants.js` | componente/const | Constantes do formulário |
| `components/formEmp.customFields.jsx` | componente | Campos personalizados no formulário |
| `components/empSearchView.constants.js` | componente/const | Constantes da busca |

## Hooks / runtime / data

| Arquivo | Tipo | Função |
|---|---|---|
| `hooks/useEmpresasInfiniteData.js` | hook | Paginação/scroll infinito de empresas |
| `runtime/empresasTableRuntime.js` | runtime | Runtime da tabela |
| `data/empresasListCache.js` | data | Cache da lista (patch/otimista) |
| `data/empresasListConstants.js` | data | Constantes de listagem |

## Preferências (subsistema grande — 15 arquivos)

`preferences/` — bootstrap, cache, cross-tab, flush, hydration, perf marks, query keys,
scope state, storage, feature flags, prefetch-at-login, register/use bootstrap. Persistência de
layout/preferências do usuário, sincronizada com o backend (`UsuarioPreferencia`) via adapter +
query keys, com cache local e eventos cross-tab.

## Repositório / API / persistência

| Arquivo | Tipo | Função |
|---|---|---|
| `repositories/empRepository.jsx` | repo | CRUD → delega para `EmpresaApi` |
| `src/apis/empresa/EmpresaApi.js` | api | REST client (`/api/empresas`, `/api/empresas/campos`) |
| `src/apis/http/apiClient.js` | api | HTTP client (JWT, base URL de produção Railway, escopo multiempresa) |

## Utils

`utils/` — `empCodigoUtils` (normalize/strip payload), `empExportRows`, `empFilterFieldsLayout`,
`empSearchContains`, `empTableColumnCatalog`.

## Backend / Prisma (já existente, produção)

| Arquivo | Tipo | Função |
|---|---|---|
| `backend/prisma/schema.prisma` | schema | Modelos `Empresa`, `CadCpsCampo*`, `UsuarioPreferencia`, registro MDP |
| `backend/src/routes/index.js` | backend | Rotas Fastify |
| `backend/src/database/prismaClient.js` | backend | Prisma client |

## Testes / gates já existentes (Empresas)

- **Testes** (14): `empresas-cadcps-consuming-generic-kernel`, `migration/empresas-*` (dual-read
  shadow-compare, guarded-read UI slice/overlay, read-UI parity hardening, runtime-bridge dry-run,
  readonly runtime-v2 candidate, runtime-bridge read-slot candidate), `preview/empresas-*`,
  `shadow/empresas-*`.
- **Gates** (14): `g423-empresas-*` correspondentes + `g423-modelobase1-empresas-campos-direct-beta`.

## Arquivos que NÃO devem ser tocados sem slice explícito

**Todos os listados acima.** Em especial: `config/modeloBase1/empresasModeloBase1Config.js` (ponto
de integração), `repositories/empRepository.jsx`, `src/apis/empresa/EmpresaApi.js`,
`src/apis/http/apiClient.js`, todo o `backend/` e `backend/prisma/schema.prisma`, e todo o
subsistema `preferences/`.
