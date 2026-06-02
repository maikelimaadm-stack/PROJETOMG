/// Modelo base para módulo __MODULE_ID__
/// Copie para backend/prisma/schema.prisma e ajuste os campos do domínio.
model __MODULE_ID_PASCAL__ {
  id             String   @id @default(cuid())
  cliente_id     String   @db.VarChar(64)
  empresa_id     String   @db.VarChar(64)
  codempresa Int
  nome_empresa   String   @db.VarChar(255)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([cliente_id, empresa_id, createdAt])
  @@index([cliente_id, codempresa])
}

