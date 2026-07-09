# Skill — Prisma & Backend (portável)

**Substitui no Cursor:** Skills `prisma-cli-*` (migrate, generate, seed, db-push, etc.)  
**Use quando:** schema, migrations, seed, queries backend

---

## Localização

| Item | Path |
|------|------|
| Schema | `backend/prisma/schema.prisma` |
| Migrations | `backend/prisma/migrations/` |
| Client | gerado em `backend/node_modules/.prisma/client` |
| Env | `backend/.env` (copiar de `backend/.env.example`) |

## Comandos (sempre em `backend/`)

```bash
cd backend

# Gerar client após mudança no schema
npm run prisma:generate

# Validar schema
npm run prisma:validate

# Seed bootstrap (usuário default maike/maike/123)
npm run seed

# Dev server
npm run dev   # porta 3001

# Reset completo (CUIDADO — apaga dados)
npm run db:reset-all
```

## Variáveis obrigatórias (`backend/.env`)

```
DATABASE_URL=
DIRECT_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
```

Opcional alinhamento E2E:
```
SEED_CLIENTE_CODIGO=kaiman
```

## Convenções schema (deste projeto)

- `@id @default(autoincrement())` ou `cuid()` conforme modelo
- `createdAt` / `updatedAt` onde aplicável
- `cliente_id` em modelos operacionais (multi-tenant)
- Relações com `@relation` nos dois lados

## Modelos principais (59 total)

- **ERP:** Cliente, Usuario, Empresa, CadCps*, PermissaoEmpresa, …
- **MDP:** MdpEntity, MdpField, MdpRelationship, MdpCompiledBundle, …
- **MMM:** MmmObject, MmmCompiledBundle, …

## MDP scripts (metadata)

```bash
npm run seed:mdp-entities
npm run export:mdp-compiled-bundle
npm run smoke:mdp-publish
```

## Regras deste projeto

1. **Runtime frontend (`src/runtime/`)** não importa Prisma — D-RI-13
2. **Dual DDL:** existe `ensureSchema.js` além de migrations (TD-005) — preferir Prisma migrate
3. Após mudança schema: `prisma:generate` + reiniciar `npm run dev` no backend
4. Hot reload backend usa `node --watch` — client Prisma precisa regenerate manual

## Migrations (produção)

```bash
cd backend
npx prisma migrate deploy
```

Dev local (só se autorizado pelo owner):
```bash
npx prisma migrate dev --name <descricao>
```

**Foundation C slices** raramente alteram schema — workflow C.7 pode adicionar `workflow_instance`.

## Smokes úteis

```bash
npm run smoke:empresas
npm run smoke:cadcps
npm run smoke:auth-permissoes
```

## Equivalente Cursor Skills

| Cursor Skill | Ação neste repo |
|--------------|----------------|
| prisma-cli-generate | `npm run prisma:generate` |
| prisma-cli-migrate-dev | `npx prisma migrate dev` (cuidado) |
| prisma-cli-migrate-deploy | `npx prisma migrate deploy` |
| prisma-cli-db-seed | `npm run seed` |
| prisma-cli-validate | `npm run prisma:validate` |
| prisma-client-api-* | ler código em `backend/src/database/` |
