-- CreateTable
CREATE TABLE "ClienteIdGlobalSequencia" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "next_id_global" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClienteIdGlobalSequencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro_global" (
    "id" TEXT NOT NULL,
    "cliente_id" VARCHAR(64) NOT NULL,
    "id_global" INTEGER NOT NULL,
    "entity_name" VARCHAR(128) NOT NULL,
    "registro_id" VARCHAR(128) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registro_global_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN "id_global" INTEGER;
ALTER TABLE "CampoPersonalizado" ADD COLUMN "id_global" INTEGER;
ALTER TABLE "CadCpsCampo" ADD COLUMN "id_global" INTEGER;
ALTER TABLE "CadastroRegistro" ADD COLUMN "id_global" INTEGER;
ALTER TABLE "RegistroAnexo" ADD COLUMN "id_global" INTEGER;
ALTER TABLE "AuditLog" ADD COLUMN "id_global" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ClienteIdGlobalSequencia_cliente_id_key" ON "ClienteIdGlobalSequencia"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "registro_global_cliente_id_id_global_key" ON "registro_global"("cliente_id", "id_global");

-- CreateIndex
CREATE INDEX "registro_global_cliente_id_entity_name_idx" ON "registro_global"("cliente_id", "entity_name");

-- CreateIndex
CREATE INDEX "registro_global_cliente_id_registro_id_idx" ON "registro_global"("cliente_id", "registro_id");

-- CreateIndex
CREATE INDEX "Empresa_cliente_id_id_global_idx" ON "Empresa"("cliente_id", "id_global");
CREATE INDEX "CampoPersonalizado_cliente_id_id_global_idx" ON "CampoPersonalizado"("cliente_id", "id_global");
CREATE INDEX "CadCpsCampo_cliente_id_id_global_idx" ON "CadCpsCampo"("cliente_id", "id_global");
CREATE INDEX "CadastroRegistro_cliente_id_id_global_idx" ON "CadastroRegistro"("cliente_id", "id_global");
CREATE INDEX "RegistroAnexo_cliente_id_id_global_idx" ON "RegistroAnexo"("cliente_id", "id_global");
CREATE INDEX "AuditLog_cliente_id_id_global_idx" ON "AuditLog"("cliente_id", "id_global");

-- AddForeignKey
ALTER TABLE "ClienteIdGlobalSequencia" ADD CONSTRAINT "ClienteIdGlobalSequencia_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_global" ADD CONSTRAINT "registro_global_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
