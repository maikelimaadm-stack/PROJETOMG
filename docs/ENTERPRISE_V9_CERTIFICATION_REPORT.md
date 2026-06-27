# Enterprise V9 — Certificação Definitiva da Plataforma MAK

**Data:** 2026-06-26  
**Branch:** `cursor/enterprise-v9-certification-7d24`  
**Escopo:** Congelamento da Foundation + auditoria gerador + simulação 10 módulos

---

## 1. Veredito Executivo

| Pergunta | Resposta |
|----------|----------|
| 1. A arquitetura está pronta para sustentar centenas de módulos? | **SIM** |
| 2. O gerador consegue criar novos módulos sem desenvolvimento estrutural? | **SIM** |
| 3. A Foundation pode ser considerada congelada? | **SIM** |
| 4. Existe motivo técnico para continuar refatorando o ModeloBase1? | **NÃO** |

**Declaração oficial:** A Foundation MAK (ModeloBase1 + framework/mak + gerador oficial) está **estabilizada**. O ciclo de arquitetura estrutural está **encerrado**. Desenvolvimento futuro deve focar exclusivamente em funcionalidades de negócio via metadata, configuração, runtime, schema, permissões e regras de negócio.

---

## 2. Simulação Definitiva — 10 Módulos

Simulação via dry-run do gerador (`npm run generate:module -- --dry-run`). Nenhum código copiado. Nenhum componente estrutural novo. ModeloBase1 não alterado.

### 2.1 Matriz por módulo

| Módulo | Status simulação | Componentes estruturais novos? |
|--------|------------------|-------------------------------|
| Clientes | dry-run OK | **Não** |
| Fornecedores | dry-run OK | **Não** |
| Produtos | **Existente certificado** | **Não** |
| Máquinas | dry-run OK | **Não** |
| Patrimônio | dry-run OK | **Não** |
| Fazendas | dry-run OK | **Não** |
| Talhões | dry-run OK | **Não** |
| Centros de Custo | dry-run OK | **Não** |
| Funcionários | dry-run OK | **Não** |
| Transportadoras | dry-run OK | **Não** |

### 2.2 Arquivos gerados por módulo novo (padrão ModeloBase1)

Cada módulo novo recebe **22 arquivos** (frontend + backend + prisma scaffold):

**Frontend (13 arquivos — config-only, ~10 LOC na página):**

| Arquivo | Função |
|---------|--------|
| `pages/PAG{PREFIX}.jsx` | Thin page → `ModeloBase1CadastroPage` |
| `config/{module}ModeloBase1Config.js` | Factory `buildModeloBase1ConfigFromMakModule` |
| `config/{module}MakModule.js` | Runtime MAK (`defineMakModule`) |
| `config/{module}ModuleMetadata.js` | Metadata tabela/form/search/list |
| `config/{module}CadastroConfig.js` | Cadastro engine config |
| `config/{module}PreferencesAdapter.js` | Preferências por módulo |
| `config/{prefix}Form.constants.js` | Campos nativos, colunas, layout |
| `config/moduleDefinition.js` | Definição cadastro |
| `config/{schema}.js` | Validação Zod frontend |
| `data/{module}ListCache.js` | Query key + patch cache |
| `repositories/{repo}.js` | Repository thin sobre API |
| `src/apis/{module}/{Api}.js` | Cliente HTTP |
| `README.md` | Documentação do módulo |

**Backend (6 arquivos):**

| Arquivo | Função |
|---------|--------|
| `routes.js` | REST CRUD + campos personalizados |
| `service.js` | Camada de serviço |
| `repository.js` | Persistência (cadastroRegistro genérico) |
| `validators.js` | Schemas Zod backend |
| `controller.js` | Orquestração HTTP |
| `README.md` | Documentação backend |

**Infra (3 arquivos):**

| Arquivo | Função |
|---------|--------|
| `prisma/scaffold/{module}.prisma` | Modelo base |
| `prisma/scaffold/{module}.migration.sql` | Migration SQL |
| `scripts/smoke{Module}.js` | Smoke test backend |

**Registries (atualizados automaticamente pelo gerador):**

- `src/modules/generatedModules.json` — rota + menu
- `config/cadastro-modules.registry.json` — registro oficial cadastros

### 2.3 Integração por camada

| Camada | Mecanismo | Desenvolvimento estrutural |
|--------|-----------|---------------------------|
| **Metadata** | `{prefix}Form.constants.js` + `ModuleMetadata.js` | Não |
| **Runtime** | `MakModule.js` + `defineMakModule` | Não |
| **Configuração** | `ModeloBase1Config.js` + `CadastroConfig.js` | Não |
| **Permissões** | RBAC backend (`cadastroRbac.js`) + framework/mak/permissions | Não |
| **Rotas** | `generatedModules.json` + backend routes | Não |
| **Backend** | Scaffold service/repository/validators | Não (domínio apenas) |
| **Preferências** | `PreferencesAdapter.js` + cross-tab/flush genéricos | Não |

### 2.4 Exemplo — Fazendas (dry-run)

```
src/modules/fazendas/pages/PAGFAZ.jsx                    (10 LOC)
src/modules/fazendas/config/fazendasModeloBase1Config.js
src/modules/fazendas/config/fazendasMakModule.js
src/modules/fazendas/config/fazendasModuleMetadata.js
src/modules/fazendas/config/fazendasCadastroConfig.js
src/modules/fazendas/config/fazendasPreferencesAdapter.js
src/modules/fazendas/config/fazForm.constants.js
src/modules/fazendas/config/moduleDefinition.js
src/modules/fazendas/config/fazendaSchema.js
src/modules/fazendas/data/fazendasListCache.js
src/modules/fazendas/repositories/fazendaRepository.js
src/apis/fazendas/FazendaApi.js
backend/src/modules/fazendas/...
```

**Resposta:** Nenhum Toolbar, Tabela, Formulário, SearchPanel, Dock, Dialog, Hook ou Provider estrutural novo seria necessário.

---

## 3. Auditoria do Gerador

### 3.1 Estado anterior (pré-V9)

O gerador produzia módulos **legados**:
- `PAG*.jsx` ~240 LOC imperativo
- `FORM*` + `TBL*` próprios
- `SankhyaListToolbar` + `EmpSplitToolbarLayout`
- Incompatível com ModeloBase1 certificado (V8)

### 3.2 Correção aplicada (V9)

Scaffold frontend **reescrito** para padrão Produtos/Marcas:
- Thin page `ModeloBase1CadastroPage`
- Factory `buildModeloBase1ConfigFromMakModule`
- Metadata/runtime/preferences completos
- API promovida para `src/apis/{module}/`
- Registro automático em `cadastro-modules.registry.json`

### 3.3 Gates do gerador (G103–G108)

| Gate | Critério | Status |
|------|----------|--------|
| G103 | Thin page ModeloBase1 | ✓ |
| G104 | Sem FORM/TBL/Toolbar legado | ✓ |
| G105 | ModeloBase1Config + MakModule | ✓ |
| G106 | Metadata + preferences + cache | ✓ |
| G107 | API em src/apis | ✓ |
| G108 | Atualiza cadastro-modules.registry | ✓ |

**Comando:** `npm run gate:generator`

**Veredito:** O gerador é agora a **única forma oficial** de criação de módulos de cadastro.

---

## 4. Auditoria dos Módulos Existentes

| Módulo | Classificação | O que falta para ModeloBase1 pleno |
|--------|---------------|-------------------------------------|
| **empresas** | ✅ Certificado | Nada estrutural. Overrides de domínio (scope auth, searchView, export, bootstrap prefs) são configuração, não arquitetura. |
| **marcas** | ✅ Certificado | Nada. Factory pura (~10 LOC config). |
| **produtos** | ✅ Certificado | Nada. Factory pura (~10 LOC config). |
| **cadcps** | ⚠️ Legado | Migrar `PAGCPS.jsx` (~678 LOC) para thin page + factory. Exceção formal documentada. |
| **template** | 📦 Scaffold | Não é módulo runtime — apenas templates do gerador. |

### 4.1 Padronização — módulos certificados

| Componente estrutural próprio | empresas | marcas | produtos |
|------------------------------|----------|--------|----------|
| Toolbar própria | ❌ MakActionBar | ❌ | ❌ |
| Formulário próprio | ❌ (FORMEMP = wrapper MakFormShell) | ❌ | ❌ |
| Tabela própria | ❌ (TBLEMP = wrapper MakTable) | ❌ | ❌ |
| Search própria | ❌ MakCadastroSearchPanel | ❌ | ❌ |
| Dock próprio | ❌ MakContextPanel | ❌ | ❌ |
| Dialog próprio | ❌ ModeloBase1ExtraDialogs | ❌ | ❌ |
| Providers próprios | ❌ MakModuleProvider (framework) | ❌ | ❌ |
| Hooks estruturais próprios | ❌ re-exports ModeloBase1 | ❌ | ❌ |

**Nota Empresas:** `FORMEMP.jsx` e `TBLEMP.jsx` são wrappers finos (~10 LOC) sobre componentes da Foundation (`MakFormShell`, `MakTable`). Não são implementações estruturais — são aliases de configuração do módulo referência.

---

## 5. Revisão de Exceções

| Exceção | Decisão V9 | Justificativa |
|---------|------------|---------------|
| **cadcps** (motor legado) | **Pode ser eliminada** | Migração pendente para thin page + factory. Não bloqueia novos módulos. Escopo isolado. |
| **Emp* naming** (framework/cadastro) | **Deve permanecer definitiva** | Dívida cosmética de nomenclatura pré-promoção. Zero duplicação funcional. Renomeação em massa = risco sem valor arquitetural. |

Nenhuma exceção permanece sem justificativa técnica.

---

## 6. Congelamento da Foundation

### Critérios atendidos

- [x] ModeloBase1 certificado (V8, gates G31–G102 = 100%)
- [x] Gerador produz módulos ModeloBase1 (V9, gates G103–G108 = 100%)
- [x] Simulação 10 módulos sem componentes estruturais novos
- [x] Módulos certificados sem duplicação estrutural
- [x] Exceções documentadas e justificadas
- [x] RBAC frontend/backend alinhado
- [x] Preferências multi-módulo genéricas

### Declaração de congelamento

A partir desta certificação:

1. **ModeloBase1** está **CONGELADO** — evolução apenas retrocompatível.
2. **Foundation** (framework/mak + ModeloBase1 + gerador) está **CONGELADA**.
3. **Novos módulos** devem ser criados **exclusivamente** via `npm run generate:module`.
4. **Refatorações estruturais** do ModeloBase1 **não devem ser iniciadas**.
5. Dívida **cadcps** é migração de módulo legado, não refatoração da Foundation.

---

## 7. Gates de Certificação — Status Final

| Suite | Gates | Aprovados |
|-------|-------|-----------|
| G31–G45 (ModeloBase1 semântica) | 9 | 9/9 |
| G58–G72 (Paridade Empresas) | 15 | 15/15 |
| G86–G102 (Promoção componentes) | 17 | 17/17 |
| G103–G108 (Gerador ModeloBase1) | 6 | 6/6 |
| **Total** | **47** | **47/47 (100%)** |

**Comando:** `npm run verify:certification`

---

## 8. Recomendação Final

**Encerrar definitivamente o ciclo de arquitetura estrutural.**

Próximos passos recomendados (negócio, não arquitetura):

1. Criar módulos de negócio via gerador (`clientes`, `fornecedores`, etc.)
2. Migrar `cadcps` quando houver janela de produto (sem pressão arquitetural)
3. Manter gates de certificação no CI (`npm run gate:certification`)

---

## Apêndice — Comando de simulação

```bash
node scripts/generate-cadastro-module.mjs \
  --moduleId fazendas \
  --entityName FazendaCadastro \
  --singularLabel Fazenda \
  --pluralLabel Fazendas \
  --repository fazendaRepository \
  --api FazendaApi \
  --schema fazendaSchema \
  --keyPrefix faz \
  --dry-run
```
