-- Migration base do módulo fazendas
-- Ajuste o DDL de acordo com o model final do domínio.
CREATE TABLE IF NOT EXISTS "Fazendas" (
  id TEXT PRIMARY KEY,
  cliente_id VARCHAR(64) NOT NULL,
  empresa_id VARCHAR(64) NOT NULL,
  codigo_empresa INTEGER NOT NULL,
  nome_empresa VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "fazendas_cliente_empresa_createdAt_idx"
  ON "Fazendas" (cliente_id, empresa_id, "createdAt");

