# Empresas — UI Flow Map

Mapa do fluxo visual atual (auditoria; UI **não** alterada).

## Entrada na tela

- `PAGEMP.jsx` renderiza `<ModeloBase1CadastroPage config={empresasModeloBase1Config} />`.
- Toda a UI é dirigida pelo **motor ModeloBase1** — a página do módulo contém apenas configuração.

## Estrutura da tela (dirigida por ModeloBase1)

- **Tabela** (`tbl-emp`): colunas configuráveis, ordenação, largura, congelamento, visibilidade,
  agregações, tamanho de página; paginação/scroll infinito via `useEmpresasInfiniteData`.
- **Formulário** (`formEmp`): campos do `empresasSchema` + campos personalizados
  (`formEmp.customFields.jsx`), título derivado de `razao_social`/`nome_empresa`.
- **Filtros** (`tblEmp.filters.js`, `empFilterFieldsLayout`): filtros por coluna, busca "contains".
- **Search view** (`empSearchView.constants.js`): dropdown de busca, favoritos, visibilidade.
- **Toolbar** (`empresasToolbarConfig.js`): ações e componentes de toolbar.
- **Ações**: novo, duplicar (`buildDuplicateRecord`), editar, excluir, exportar (PDF/Excel).
- **Dialogs/modais**: formulário de registro, anexos, campos personalizados.
- **Preferências/layout**: hidratação e persistência de layout/colunas/filtros por usuário/escopo.

## Fluxo de ações

| Ação | Caminho |
|---|---|
| Entrar | PAGEMP → ModeloBase1CadastroPage → data config → `empRepository.listPage` → `EmpresaApi.listEmpresas` |
| Listar/paginar | `useEmpresasInfiniteData` + `empresasListCache` |
| Filtrar/buscar | filtros ModeloBase1 + `empSearchContains` |
| Criar | form → `empRepository.create` → `EmpresaApi.createEmpresa` |
| Editar | form → `empRepository.update` → `EmpresaApi.updateEmpresa` |
| Excluir | `empRepository.delete` → `EmpresaApi.deleteEmpresa` |
| Exportar | `buildEmpresaExportRows` + export config |
| Preferências | subsistema `preferences/` (cache local + adapter remoto + cross-tab) |

## Pontos sensíveis de UI

- **Preferências/layout do usuário**: hidratação complexa (bootstrap, cross-tab, flush, perf marks).
  Quebra aqui = usuário perde colunas/filtros/ordenação salvos.
- **Multiempresa/escopo**: a listagem respeita o seletor global de empresa (`erp_empresa_id`).
- **Campos personalizados**: acoplados a cadcps; alteração pode afetar formulário e tabela.
- **Cache otimista** (`patchEmpresasCache`): create/update/delete atualizam o cache antes do refetch.

## Riscos visuais

- Regressão de layout/colunas ao mexer em preferências.
- Divergência de render entre config atual e `runtimeReadModel` beta (mitigado por shadow/parity tests).
- Perda de estado de filtros/favoritos.

## O que deve ser preservado

- A UI atual byte-idêntica quando a flag beta está desligada.
- Todo o subsistema de preferências e o cache otimista.
- O comportamento multiempresa/escopo.
- A paridade visual já coberta por `empresas-read-ui-parity-hardening` e pelos previews/shadows.
