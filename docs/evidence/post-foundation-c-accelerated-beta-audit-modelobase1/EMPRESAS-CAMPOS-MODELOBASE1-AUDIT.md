# EMPRESAS / CAMPOS PERSONALIZADOS / MODELOBASE1 — AUDIT

## Cadastro de Empresa

- **Page:** `src/modules/empresas/pages/PAGEMP.jsx` — renderiza `<ModeloBase1CadastroPage config={empresasModeloBase1Config} />` (config-only, o motor é o ModeloBase1).
- **Config ModeloBase1:** `src/modules/empresas/config/modeloBase1/empresasModeloBase1Config.js` — `buildModeloBase1ConfigFromMakModule(empresasMakModule, { scopeCssClass, tableKey:'tbl-emp', preferencesAdapter, customFields, moduleDefinition, components, labels, hooks, data, helpers, export })`.
- **MAK module:** `src/modules/empresas/config/empresasMakModule.js` — `defineMakModule(empresasModuleDefinition, empresasModuleMetadata, { listQueryKey, repository: empRepository, cadastroConfig, components:{ LoadBatchControls, SearchPanel }, … }, empresasPreferencesAdapter)`.
- **Config satélites:** `config/moduleDefinition.js`, `config/empresasSchema.js`, `config/empresasCadastroConfig.js`, `config/empresasModuleMetadata.js`, `config/modeloBase1/{empresasLayoutConfig,empresasToolbarConfig,empresasSearchViewConfig}.js`.
- **Dados:** `data/empresasListCache.js`, `hooks/useEmpresasInfiniteData.js`, `repositories/empRepository.jsx` (→ backend via API).
- **Runtime local:** `runtime/empresasTableRuntime.js` (só um resolvedor de valor de célula por coluna; puro).
- **Campos atuais:** tipo_pessoa, tipo_vinculo, codempresa, razao_social, nome_fantasia, status, cpf_cnpj, inscricao_estadual, telefone, whatsapp, … (ver schema/descritor).
- **Rota:** `/CadastroEmpresas` (App.jsx:242, montada direto).
- **Uso de runtime v2:** **nenhum** (a tela real nunca foi tocada pela cadeia v2).
- **Pontos de acoplamento:** AuthContext (scope de empresas), preferências (bootstrap/cache/storage), repository→backend, ModeloBase1 engine.
- **Riscos de alteração direta:** regressão visual/funcional na listagem/formulário; preferências; export. **Mitigável** por flag + fallback para a config atual.

## Campos Personalizados (cadcps)

- **Page:** `src/modules/cadcps/pages/PAGCPS.jsx` — `<ModeloBase1CadastroPage config={cadcpsModeloBase1Config} />`.
- **Config ModeloBase1:** `src/modules/cadcps/config/cadcpsModeloBase1Config.js` — mesmo `buildModeloBase1ConfigFromMakModule(cadcpsMakModule, {...})`.
- **MAK module:** `src/modules/cadcps/config/cadcpsMakModule.js`.
- **Config satélites:** `config/cadcpsSchema.js`, `config/cpsForm.constants.js`, `config/cadcpsCadastroConfig.js`, `config/moduleDefinition.js`, `config/cadastroModuleRegistry.js`.
- **Relação com modeloBase1:** idêntica à de Empresas — consumidor config-driven.
- **Relação com preferências/config:** `preferences/registerCadcpsPreferencesBootstrap.js`, adapter próprio.
- **Configurador de campos (framework):** `src/framework/cadastro/configurators/EmpConfiguracaoCamposDialog.jsx`, `src/framework/cadastro/fields/campoEngine.jsx` — o motor de campos personalizados vive no framework/cadastro; **Risco Alto** (framework compartilhado) salvo ponto explícito.
- **Rota:** `/CadastroCamposPersonalizados` (gerada).
- **Riscos de alteração direta:** o dialog/engine de campos é framework compartilhado — mexer nele afeta outros cadastros. O **módulo cadcps** em si (`src/modules/cadcps`) é escopo autorizado; o **framework/cadastro** não.

## modeloBase1

- **Localização:** `src/ModeloBase1/` — ~35 subdiretórios (`render`, `table`, `form`, `toolbar`, `search`, `layout`, `export`, `filters`, `grouping`, `pagination`, `selection`, `sorting`, `preferences`, `hooks`, `services`, `metadata`, `permissions`, `fieldConfig`, `validationConfig`, `formulaConfig`, `eventsConfig`, `actionsConfig`, `workflowConfig`, …).
- **É:** um **motor de cadastro config-driven** (não uma tela específica). Cada módulo passa uma config e o ModeloBase1 renderiza a página de cadastro completa.
- **Entrada:** `ModeloBase1/render/ModeloBase1CadastroPage.jsx` (componente de página), `ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js` + `defineModeloBase1Config.js` (builders de config).
- **Como Empresas se conecta:** `PAGEMP → ModeloBase1CadastroPage(empresasModeloBase1Config)`; config via `buildModeloBase1ConfigFromMakModule(empresasMakModule)`.
- **Como Campos se conecta:** `PAGCPS → ModeloBase1CadastroPage(cadcpsModeloBase1Config)`; config via `buildModeloBase1ConfigFromMakModule(cadcpsMakModule)`.
- **Uso atual:** ativo — é o motor real das telas de cadastro.
- **Lacunas para beta direto:** o ModeloBase1 hoje é alimentado por `makModule` (definição declarativa + repository→backend). Para um beta **read-only alimentado por runtime v2**, falta um ponto de injeção onde a config do ModeloBase1 possa receber um **read model do runtime v2** (view model read-only + controlled dataset) em vez do repository real — atrás de flag, com fallback.

## Conexão atual (resumo)

**Empresas e Campos Personalizados JÁ compartilham o mesmo ModeloBase1.** A conexão "Empresas ↔ modeloBase1" e "Campos ↔ modeloBase1" **já existe** no nível de config. O que falta para o beta é o **wiring runtime v2 → ModeloBase1** (alimentar a leitura por runtime v2 atrás de flag), não uma nova conexão a modeloBase1.

## Onde pode mexer direto (próximo slice)

- `src/modules/empresas/**` (config, page, satélites) — **escopo autorizado**.
- `src/modules/cadcps/**` — **escopo autorizado**.
- `src/ModeloBase1/**` (com cuidado; ponto de injeção da leitura beta) — **escopo autorizado, gate forte**.
- `src/runtime/**` relacionado (view model read-only, dataset, adaptador de leitura) — **escopo autorizado**.
- `src/App.jsx` — apenas se precisar de flag/rota beta (linha mínima, gate estrito).

## Pontos proibidos (Risco Alto, próximo slice)

- backend / APIs (`src/apis/**`), Prisma, schema.
- `src/framework/**` compartilhado (incl. `framework/cadastro/*` — motor de campos), salvo ponto de injeção explícito e isolado.
- `src/modules/makBootstrap/runtimeBridge/**` (runtimeBridge global), makBootstrap global.
- runtime legado global, SSOT (`docs/meta-model`, `docs/platform-*`, `docs/runtime-implementation`).
- Studio (`src/studio`), Marketplace, BOS (`src/bos`), outras telas de `src/modules` fora de empresas/cadcps.
- CSS global, auth/permissões globais, menu principal (salvo o mínimo).
