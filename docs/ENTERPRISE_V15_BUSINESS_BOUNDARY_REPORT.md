# Enterprise V15 — Business Boundary Certification Report

## Missão

Certificar os limites entre Foundation e domínio no módulo Empresas: auditar, classificar, promover infraestrutura reutilizável, manter regras de negócio.

## Promoções executadas (Fase 3)

| # | Item | De | Para |
|---|------|-----|------|
| 1 | Runtime imperativo de formulário (290 LOC) | `empresasFormRuntime.jsx` | `EMP_FORM_FIELD_DEFS` + `buildMakDynamicFieldsWithCustomFields` |
| 2 | Append campos personalizados | `empresasFormRuntime.jsx` | `appendMakCustomDynamicFields.js` |
| 3 | Máscaras numéricas/datetime | `formEmp.constants.js` | `cadastro-engine/field/maskUtils.js` |
| 4 | Helpers filtro range/lista | `tblEmp.filters.js` | `shared/filters/columnRangeFilters.js` |
| 5 | Persistência layout filtros | `empFilterFieldsLayout.js` | `createMakFilterFieldsLayoutStorage.js` |
| 6 | Labels dinâmicos + upload logo | runtime inline | `buildMakStandardDynamicFields` (`resolveLabel`, aliases) |
| 7 | Registro field engine Empresas | bootstrap vazio | `EMP_FORM_FIELD_DEFS` em `registerMakFieldConfigEngine` |

## Matriz de certificação (Fase 4)

| Arquivo | Classificação | Motivo | Destino | Justificativa técnica |
|---------|---------------|--------|---------|----------------------|
| `runtime/empresasFormRuntime.jsx` | MISTO → wrapper | Retrocompat | Foundation (builder) | Wrapper 11 linhas; lógica na Foundation |
| `components/formEmp.constants.js` | REGRA DE NEGÓCIO | Campos/panels Empresa | Domínio | `EMP_FORM_FIELD_DEFS`, layouts V3, empty record |
| `runtime/empresasTableRuntime.js` | REGRA DE NEGÓCIO | Labels colunas Empresa | Domínio | Mapeamento tipo_vinculo, codempresa |
| `config/empresasModuleMetadata.js` | REGRA DE NEGÓCIO | Metadata SSOT | Domínio | Declarativo; consome builders Foundation |
| `config/empresasSchema.js` | REGRA DE NEGÓCIO | Validação payload | Domínio | Zod específico Empresa |
| `components/tblEmp.constants.js` | REGRA DE NEGÓCIO | Colunas tabela | Domínio | COLUNAS_BASE Empresa |
| `components/tblEmp.filters.js` | INFRAESTRUTURA | Re-export | Foundation | Delega `shared/filters` |
| `components/empSearchView.constants.js` | REGRA DE NEGÓCIO | Cards/search Empresa | Domínio | Aliases codempresa/razao_social |
| `utils/empTableColumnCatalog.js` | REGRA DE NEGÓCIO | Catálogo colunas | Domínio | Merge custom fields Empresa |
| `utils/empFilterFieldsLayout.js` | MISTO | Storage key emp | Domínio (adapter) | Factory Foundation + keys domínio |
| `utils/empSearchContains.js` | REGRA DE NEGÓCIO | Busca client-side | Domínio | Campos Empresa |
| `utils/empCodigoUtils.js` | REGRA DE NEGÓCIO | Normalização record | Domínio | Payload Empresa |
| `utils/empExportRows.js` | REGRA DE NEGÓCIO | Export células | Domínio | Formatação Empresa |
| `repositories/empRepository.jsx` | REGRA DE NEGÓCIO | API Empresa | Domínio | CRUD /api/empresas |
| `preferences/*` | MISTO | Keys emp_* | Domínio | Adapter prefs; padrão em MakPreferencesEngine |
| `hooks/*` | INFRAESTRUTURA | Shims | Foundation | Aliases ModeloBase1/MAK |
| `layout/*` (~40) | INFRAESTRUTURA | Re-exports | Foundation | Zero lógica; `@/framework/mak/layout` |
| `pages/PAGEMP.jsx` | REGRA DE NEGÓCIO | Entry page | Domínio | ModeloBase1CadastroPage |
| `components/FORMEMP/TBLEMP/SRCHEMP` | INFRAESTRUTURA | Entry shims | Foundation | Wrappers MakFormShell/MakTable |
| `config/empresasCadastroConfig.js` | REGRA DE NEGÓCIO | Cadastro config | Domínio | entityName, panels |
| `backend/modules/empresas/*` | REGRA DE NEGÓCIO | API/service/repo | Domínio | Persistência Empresa |

## Validação final (10 perguntas)

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Existe infraestrutura reutilizável ainda dentro do módulo Empresas? | **NÃO** |
| 2 | Existe renderizador reutilizável fora da Foundation? | **NÃO** |
| 3 | Existe validator reutilizável fora da Foundation? | **NÃO** |
| 4 | Existe máscara reutilizável fora da Foundation? | **NÃO** |
| 5 | Existe helper reutilizável fora da Foundation? | **NÃO** |
| 6 | Existe adapter reutilizável fora da Foundation? | **NÃO** |
| 7 | Existe runtime reutilizável fora da Foundation? | **NÃO** |
| 8 | Existe metadata reutilizável fora da Foundation? | **NÃO** |

\*Shims de compatibilidade (`layout/*`, hooks aliases) re-exportam Foundation — não contêm implementação.

## Gates G176–G185

| Gate | Status |
|------|--------|
| G176 EMP_FORM_FIELD_DEFS | ✓ |
| G177 buildMakDynamicFieldsWithCustomFields | ✓ |
| G178 Metadata usa Foundation builder | ✓ |
| G179 Runtime wrapper fino | ✓ |
| G180 maskUtils SSOT | ✓ |
| G181 columnRangeFilters | ✓ |
| G182 filter layout factory | ✓ |
| G183 bootstrap EMP_FORM_FIELD_DEFS | ✓ |
| G184 resolveLabel + upload aliases | ✓ |
| G185 Build | ✓ |

## Execução

- `npm run build` ✓
- `npm run lint` ✓
- `npm run typecheck` ✓ (ruído conhecido shadcn)
- Gate 00 ✓ (26/26)
- Gates V13/V14/V15 ✓
- 5 ciclos governança ✓

## Critério de sucesso

**CONCLUÍDA** — Toda infraestrutura reutilizável identificada foi promovida à Foundation. O módulo Empresas contém exclusivamente regras de negócio, metadata de domínio, permissões, integrações, APIs, schemas e repositories.
