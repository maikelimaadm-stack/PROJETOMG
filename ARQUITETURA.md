# Arquitetura Atual do ERP

## Frontend

- **React + Vite**
- **React Query**
- **Tailwind + Shadcn/UI**
- Arquitetura organizada em:
  - `src/framework/cadastro/*` (framework reutilizável)
  - `src/modules/empresas/*` (módulo oficial)
  - `src/shared/*` (infra compartilhada)
  - `src/apis/*` (contratos de acesso da UI)
  - `src/integrations/supabase/*` (integração de auth/storage no cliente)

## Backend

- **Fastify** em `backend/src/server.js`
- Módulos:
  - `backend/src/modules/empresas/*`
  - `backend/src/modules/anexos/*`
  - `backend/src/modules/auth/*`
- Repositórios com fallback:
  - Prisma (quando `DATABASE_URL` disponível)
  - memória (quando indisponível)

## Padrão de Módulo Futuro

Novo módulo = **Framework Cadastro** + **Repository/Config do domínio**.

Exemplos:
- Fazendas
- Currais
- Produtos
- Fornecedores

Todos podem reutilizar os blocos de `src/framework/cadastro`.
