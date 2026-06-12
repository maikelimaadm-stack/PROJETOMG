-- Índices adicionais para performance de listagem e busca (ERP MAK Gestão)

CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_codempresa_idx" ON "Empresa"("cliente_id", "codempresa");
CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_status_idx" ON "Empresa"("cliente_id", "status");
CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_razao_social_idx" ON "Empresa"("cliente_id", "razao_social");

-- Trigram para campos de busca textual adicionais
CREATE INDEX IF NOT EXISTS "Empresa_telefone_trgm_idx"
  ON "Empresa" USING gin ("telefone" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Empresa_email_trgm_idx"
  ON "Empresa" USING gin ("email" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Empresa_cidade_trgm_idx"
  ON "Empresa" USING gin ("cidade" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Empresa_endereco_trgm_idx"
  ON "Empresa" USING gin ("endereco" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Empresa_bairro_trgm_idx"
  ON "Empresa" USING gin ("bairro" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Empresa_whatsapp_trgm_idx"
  ON "Empresa" USING gin ("whatsapp" gin_trgm_ops);

-- CadCpsCampo: ordenação em listApplicable
CREATE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_ordem_tabela_idx"
  ON "CadCpsCampo"("cliente_id", "ordem_tabela");

-- RegistroAnexo: listagem por registro
CREATE INDEX IF NOT EXISTS "RegistroAnexo_cliente_id_entity_name_record_id_idx"
  ON "RegistroAnexo"("cliente_id", "entity_name", "record_id");
