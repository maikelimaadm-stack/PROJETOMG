import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const ensureUsuarioPreferenciaTable = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "UsuarioPreferencia" (
      "id" TEXT NOT NULL,
      "usuario_id" VARCHAR(64) NOT NULL,
      "cliente_id" VARCHAR(64) NOT NULL,
      "screen_key" VARCHAR(128) NOT NULL,
      "config" JSONB NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "UsuarioPreferencia_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "UsuarioPreferencia_usuario_id_screen_key_key"
    ON "UsuarioPreferencia"("usuario_id", "screen_key");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "UsuarioPreferencia_cliente_id_usuario_id_idx"
    ON "UsuarioPreferencia"("cliente_id", "usuario_id");
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'UsuarioPreferencia_usuario_id_fkey'
      ) THEN
        ALTER TABLE "UsuarioPreferencia"
        ADD CONSTRAINT "UsuarioPreferencia_usuario_id_fkey"
        FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$;
  `);
};

ensureUsuarioPreferenciaTable()
  .then(() => {
    console.log("Tabela UsuarioPreferencia garantida.");
  })
  .catch((error) => {
    console.error("Falha ao garantir tabela UsuarioPreferencia:", error.message);
    process.exit(0);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
