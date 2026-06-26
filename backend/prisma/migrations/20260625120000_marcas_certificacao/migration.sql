-- CreateTable Marca (certificação MAK Foundation V7)
CREATE TABLE IF NOT EXISTS "Marca" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "id_global" INTEGER NOT NULL,
    "codigo" INTEGER NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'Ativo',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Marca_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Marca_cliente_id_codigo_key" ON "Marca"("cliente_id", "codigo");
CREATE UNIQUE INDEX IF NOT EXISTS "Marca_cliente_id_id_global_key" ON "Marca"("cliente_id", "id_global");
CREATE INDEX IF NOT EXISTS "Marca_cliente_id_nome_idx" ON "Marca"("cliente_id", "nome");
CREATE INDEX IF NOT EXISTS "Marca_cliente_id_status_idx" ON "Marca"("cliente_id", "status");

ALTER TABLE "Marca" ADD CONSTRAINT "Marca_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
