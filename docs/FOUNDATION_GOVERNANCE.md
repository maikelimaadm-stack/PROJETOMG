# MAK Foundation — Guia Oficial de Arquitetura

**Status:** CONGELADA (Enterprise V10)  
**Versão:** 1.0.0  
**Última atualização:** 2026-06-27

---

## 1. Visão Geral

A **Foundation MAK** é a camada estrutural certificada do ERP. Ela permite criar centenas de módulos de cadastro **sem desenvolvimento estrutural**, apenas via:

- metadata
- configuração
- runtime
- schema
- permissões
- regras de negócio

### Componentes congelados

| Componente | Localização | Função |
|------------|-------------|--------|
| **ModeloBase1** | `src/ModeloBase1/` | Motor de cadastro (toolbar, tabela, form, search, dock, dialogs) |
| **framework/mak** | `src/framework/mak/` | Runtime, metadata, preferências, permissões |
| **Gerador oficial** | `scripts/generate-cadastro-module.mjs` | Única forma de criar novos módulos |
| **Registry** | `config/cadastro-modules.registry.json` | Módulos certificados |

---

## 2. Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│  PAG*.jsx (thin page ~10 LOC)                           │
│  └── ModeloBase1CadastroPage                            │
│       └── buildModeloBase1ConfigFromMakModule           │
│            └── defineMakModule + metadata + repository  │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ModeloBase1          framework/mak         backend API
   (motor UI)           (runtime/prefs)      (CRUD/RBAC)
```

### Responsabilidades

| Camada | Responsabilidade | NÃO deve |
|--------|------------------|----------|
| **Página do módulo** | Importar config e renderizar `ModeloBase1CadastroPage` | Implementar toolbar/tabela/form |
| **Config do módulo** | Metadata, campos, layout, preferências | Duplicar componentes UI |
| **ModeloBase1** | Motor genérico de cadastro | Conhecer domínio específico |
| **framework/mak** | Runtime, hooks, metadata builders | Importar modules/* |
| **Backend** | CRUD, RBAC, persistência | Lógica de UI |

---

## 3. Criar um Novo Módulo

### Passo 1 — Gerar scaffold

```bash
npm run generate:module -- \
  --moduleId clientes \
  --entityName ClienteCadastro \
  --singularLabel Cliente \
  --pluralLabel Clientes \
  --repository clienteRepository \
  --api ClienteApi \
  --schema clienteSchema \
  --keyPrefix cli \
  --dry-run   # remover para gerar de fato
```

### Passo 2 — Ajustar domínio

Editar apenas arquivos de **configuração**:

- `config/cliForm.constants.js` — campos, colunas, layout
- `config/clienteSchema.js` — validação Zod
- `repositories/clienteRepository.js` — normalização de records
- Backend: service, repository, validators, Prisma model

### Passo 3 — Registrar rotas backend

Registrar `registerModuleRoutes` no bootstrap Fastify.

### Passo 4 — Validar

```bash
npm run verify:governance
```

### Arquivos gerados (não editar estruturalmente)

| Arquivo | Propósito |
|---------|-----------|
| `pages/PAGCLI.jsx` | Thin page ModeloBase1 |
| `config/*ModeloBase1Config.js` | Factory |
| `config/*MakModule.js` | Runtime |
| `config/*ModuleMetadata.js` | Metadata tabela/form/search |
| `config/*CadastroConfig.js` | Cadastro engine |
| `config/*PreferencesAdapter.js` | Preferências |
| `data/*ListCache.js` | Query key + cache |
| `src/apis/clientes/ClienteApi.js` | Cliente HTTP |

---

## 4. Convenções

### Naming

| Item | Padrão | Exemplo |
|------|--------|---------|
| moduleId | lowercase, hífen | `centros-custo` |
| keyPrefix | 3 letras | `ccu` |
| pageCode | `PAG` + prefix upper | `PAGCCU` |
| entityName | PascalCase + Cadastro | `CentroCustoCadastro` |
| constants | `{PREFIX}_COLUNAS_BASE` | `CCU_COLUNAS_BASE` |

### Módulos certificados atuais

- `empresas` — módulo referência (overrides de domínio permitidos)
- `marcas` — factory pura
- `produtos` — factory pura

### Exceções formais

Documentadas em `docs/MODELOBASE1_CERTIFICATION_EXCEPTIONS.md`:

- **cadcps** — legado, migração pendente
- **Emp* naming** — dívida cosmética definitiva
- **template** — scaffold/demo, não runtime

---

## 5. Pontos de Extensão (permitidos)

| Extensão | Como |
|----------|------|
| Novos campos | `*Form.constants.js` + schema |
| Colunas customizadas | metadata `table.columns` |
| Filtros | `registerMakListFilterBuilder` |
| Permissões | RBAC backend (`cadastroRbac.js`) + `useMakPermissions` |
| Preferências | `createMakModulePreferencesAdapter` |
| Layout form | `*CadastroConfig.js` panels/layout |
| Search cards | metadata `search.cardFields` |
| Overrides Empresas | `buildModeloBase1ConfigFromMakModule(module, overrides)` |

---

## 6. Proibições (CI falha)

O CI (`npm run gate:governance`) bloqueia:

- Toolbar, SearchPanel, Tabela, Formulário, Dock, Dialog **próprios**
- Hooks estruturais próprios (Toolbar/Table/Form/Search/Dock)
- Providers estruturais duplicados
- Páginas cadastro imperativas (>25 LOC sem ModeloBase1)
- Imports de `modules/*` dentro do ModeloBase1
- Imports cruzados entre módulos de cadastro
- Scaffold legado (FORM/TBL/SankhyaListToolbar)
- Novos TODO/FIXME em ModeloBase1/framework/mak
- Módulos runtime não certificados sem exceção formal

---

## 7. Gates de Proteção

| Suite | Gates | Comando |
|-------|-------|---------|
| Certificação ModeloBase1 | G31–G45 | `npm run gate:modelo-base1` |
| Paridade Empresas | G58–G72 | `npm run gate:paridade-empresas` |
| Promoção componentes | G86–G102 | `npm run gate:promocao` |
| Gerador | G103–G108 | `npm run gate:generator` |
| **Governança V10** | **G109–G125** | **`npm run gate:governance` |

Verificação completa:

```bash
npm run verify:governance          # 1 ciclo
npm run verify:governance:cycles   # 5 ciclos
```

---

## 8. Regras de Evolução

1. **Foundation congelada** — evolução apenas retrocompatível
2. **Novos módulos** — exclusivamente via gerador
3. **Alteração arquitetural** — exceção formal com justificativa técnica
4. **Refatoração estrutural** — proibida sem aprovação de exceção
5. **Desenvolvimento futuro** — foco em funcionalidades de negócio

---

## 9. Referências

- Exceções: `docs/MODELOBASE1_CERTIFICATION_EXCEPTIONS.md`
- Certificação V8: PR #268
- Certificação V9: `docs/ENTERPRISE_V9_CERTIFICATION_REPORT.md`
- Governança V10: `docs/ENTERPRISE_V10_GOVERNANCE_REPORT.md`
- Baseline CI: `scripts/governance-baseline.json`
