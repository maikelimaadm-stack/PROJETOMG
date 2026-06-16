-- Hardening de integridade referencial e índices de leitura críticos

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'CadCpsHistorico_cliente_id_fkey'
  ) THEN
    ALTER TABLE "CadCpsHistorico"
      ADD CONSTRAINT "CadCpsHistorico_cliente_id_fkey"
      FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'CadCpsHistorico_usuario_id_fkey'
  ) THEN
    ALTER TABLE "CadCpsHistorico"
      ADD CONSTRAINT "CadCpsHistorico_usuario_id_fkey"
      FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'RegistroAnexo_cliente_id_fkey'
  ) THEN
    ALTER TABLE "RegistroAnexo"
      ADD CONSTRAINT "RegistroAnexo_cliente_id_fkey"
      FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'UsuarioPreferencia_cliente_id_fkey'
  ) THEN
    ALTER TABLE "UsuarioPreferencia"
      ADD CONSTRAINT "UsuarioPreferencia_cliente_id_fkey"
      FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'AuditLog_usuario_id_fkey'
  ) THEN
    ALTER TABLE "AuditLog"
      ADD CONSTRAINT "AuditLog_usuario_id_fkey"
      FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'AuditLog_empresa_id_fkey'
  ) THEN
    ALTER TABLE "AuditLog"
      ADD CONSTRAINT "AuditLog_empresa_id_fkey"
      FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "CadCpsHistorico_campo_id_createdAt_idx"
  ON "CadCpsHistorico"("campo_id", "createdAt");

CREATE INDEX IF NOT EXISTS "RegistroAnexo_cliente_id_empresa_id_idx"
  ON "RegistroAnexo"("cliente_id", "empresa_id");
