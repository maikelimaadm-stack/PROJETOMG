# Módulo __PLURAL_LABEL__ (ModeloBase1)

Gerado automaticamente pelo gerador oficial de cadastros MAK.

## Padrão certificado

Este módulo segue o **ModeloBase1 config-only** — mesma arquitetura de Produtos/Marcas:

- Página fina (`pages/PAG__PAGE_CODE__.jsx`) → `ModeloBase1CadastroPage`
- Config via `buildModeloBase1ConfigFromMakModule`
- Sem Toolbar/Tabela/Formulário/Search/Dock próprios

## Definição base

| Campo | Valor |
|-------|-------|
| moduleId | `__MODULE_ID__` |
| entityName | `__ENTITY_NAME__` |
| keyPrefix | `__KEY_PREFIX__` |
| pageCode | `__PAGE_CODE__` |
| repository | `__REPOSITORY_NAME__` |
| api | `__API_NAME__` |
| schema | `__SCHEMA_NAME__` |

## Arquivos gerados (frontend)

- `pages/PAG__PAGE_CODE__.jsx` — thin page ModeloBase1
- `config/__MODULE_ID__ModeloBase1Config.js`
- `config/__MODULE_ID__MakModule.js`
- `config/__MODULE_ID__ModuleMetadata.js`
- `config/__MODULE_ID__CadastroConfig.js`
- `config/__MODULE_ID__PreferencesAdapter.js`
- `config/__KEY_PREFIX__Form.constants.js`
- `config/moduleDefinition.js`
- `config/__SCHEMA_NAME__.js`
- `data/__MODULE_ID__ListCache.js`
- `repositories/__REPOSITORY_NAME__.js`
- `src/apis/__MODULE_ID__/__API_NAME__.js`

## Backend

- `backend/src/modules/__MODULE_ID__/` — routes, service, repository, validators
- `backend/prisma/scaffold/` — modelo Prisma e migration base

## Próximos passos manuais

1. Registrar rotas backend no bootstrap Fastify
2. Executar migration Prisma (se aplicável)
3. Adicionar entrada em `config/cadastro-modules.registry.json` (ou re-gerar com registry update)
4. Ajustar campos em `__KEY_PREFIX__Form.constants.js` conforme domínio de negócio
