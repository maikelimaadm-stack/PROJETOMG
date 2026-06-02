-- Migration base do módulo __MODULE_ID__
-- Ajuste o DDL de acordo com o model final do domínio.
CREATE TABLE IF NOT EXISTS "__MODULE_ID_PASCAL__" (
  id TEXT PRIMARY KEY,
  cliente_id VARCHAR(64) NOT NULL,
  empresa_id VARCHAR(64) NOT NULL,
  codempresa INTEGER NOT NULL,
  nome_empresa VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "__MODULE_ID___cliente_empresa_createdAt_idx"
  ON "__MODULE_ID_PASCAL__" (cliente_id, empresa_id, "createdAt");

