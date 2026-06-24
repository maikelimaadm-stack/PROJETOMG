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
      "modulo" VARCHAR(64) NOT NULL DEFAULT 'legacy',
      "tela" VARCHAR(64) NOT NULL DEFAULT 'legacy',
      "versao_schema" INTEGER NOT NULL DEFAULT 1,
      "preferencias_json" JSONB NOT NULL DEFAULT '{}'::jsonb,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "UsuarioPreferencia_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "UsuarioPreferencia"
      ADD COLUMN IF NOT EXISTS "modulo" VARCHAR(64) NOT NULL DEFAULT 'legacy',
      ADD COLUMN IF NOT EXISTS "tela" VARCHAR(64) NOT NULL DEFAULT 'legacy',
      ADD COLUMN IF NOT EXISTS "versao_schema" INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "preferencias_json" JSONB NOT NULL DEFAULT '{}'::jsonb;
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE "UsuarioPreferencia"
    SET
      "modulo" = COALESCE(NULLIF(split_part("screen_key", '.', 1), ''), 'legacy'),
      "tela" = CASE
        WHEN position('.' in "screen_key") > 0
          THEN COALESCE(NULLIF(substring("screen_key" from position('.' in "screen_key") + 1), ''), 'legacy')
        ELSE COALESCE(NULLIF("screen_key", ''), 'legacy')
      END,
      "versao_schema" = COALESCE("versao_schema", 1),
      "preferencias_json" = COALESCE("preferencias_json", "config", '{}'::jsonb)
    WHERE
      "modulo" = 'legacy'
      OR "tela" = 'legacy'
      OR "preferencias_json" = '{}'::jsonb;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "UsuarioPreferencia_usuario_id_screen_key_key"
    ON "UsuarioPreferencia"("usuario_id", "screen_key");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "UsuarioPreferencia_cliente_usuario_modulo_tela_key"
    ON "UsuarioPreferencia"("cliente_id", "usuario_id", "modulo", "tela");
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
