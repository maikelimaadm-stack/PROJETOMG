# Migração Executada

## 1) Limpeza

- Código órfão removido definitivamente
- `legacy_archive/` removido
- Estruturas antigas (dynamic/filters/lotes/pesagens legadas) eliminadas

## 2) Reorganização arquitetural

- Criação de:
  - `src/framework/cadastro/*`
  - `src/modules/empresas/*`
  - `src/shared/*`
  - `src/apis/*`
  - `src/integrations/{base44,supabase}/*`
  - `src/database/*`
  - `src/storage/*`

## 3) Empresas como padrão de framework

- Componentes genéricos extraídos para `framework/cadastro`
- Domínio específico mantido em `modules/empresas`

## 4) Desacoplamento de acesso

- Componentes não acessam provider externo diretamente
- Acesso centralizado via contratos:
  - `AuthApi`
  - `EmpresaApi`
  - `AnexosApi`

## 5) Backend próprio criado

- Fastify + Prisma + módulos de empresas/anexos/auth
- Endpoints ativos e validados

## 6) Prisma + PostgreSQL

- `backend/prisma/schema.prisma` criado e validado

## 7) Supabase preparado

- Cliente frontend (`src/integrations/supabase/client.js`)
- Cliente admin backend (`backend/src/integrations/supabase/adminClient.js`)
- Fallback local para ambiente sem credenciais

## 8) Base44 removido do runtime

- Dependências removidas de `package.json`
- Plugin removido de `vite.config.js`
- Código de integração ativa removido
- Sem referências `base44` no código-fonte atual
