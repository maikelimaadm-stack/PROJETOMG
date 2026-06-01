# Banco de Dados (Prisma + PostgreSQL)

## Stack

- ORM: **Prisma**
- Banco alvo: **PostgreSQL** (Supabase Postgres)
- Schema: `backend/prisma/schema.prisma`

## Entidades modeladas

1. **Empresa**
2. **CampoPersonalizado**
3. **RegistroAnexo**

## Características de modelagem

- Índices para consulta por tenant/código/identificadores principais
- Campos JSON para extensibilidade (`campos_personalizados`, `opcoes`)
- Relacionamento opcional de anexos com empresa
- Preparação para multiempresa via `tenant_id`

## Validação

Comando:

```bash
cd backend
npm run prisma:validate
```

Status atual: schema válido.
