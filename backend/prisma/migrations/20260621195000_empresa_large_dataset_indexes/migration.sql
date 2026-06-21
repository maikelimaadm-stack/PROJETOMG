-- Índices complementares para listagem/filtros em bases grandes (1M+ registros).
-- Mantém a estrutura atual e acelera campos já usados por filtros/busca.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Filtros de baixa cardinalidade combinados com escopo do cliente.
CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_tipo_pessoa_idx"
  ON "Empresa"("cliente_id", "tipo_pessoa");

CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_tipo_vinculo_idx"
  ON "Empresa"("cliente_id", "tipo_vinculo");

CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_status_codempresa_idx"
  ON "Empresa"("cliente_id", "status", "codempresa");

-- Campos presentes na busca/filtros textuais que ainda não tinham trigram.
CREATE INDEX IF NOT EXISTS "Empresa_inscricao_estadual_trgm_idx"
  ON "Empresa" USING gin ("inscricao_estadual" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Empresa_cep_trgm_idx"
  ON "Empresa" USING gin ("cep" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Empresa_numero_trgm_idx"
  ON "Empresa" USING gin ("numero" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Empresa_observacoes_trgm_idx"
  ON "Empresa" USING gin ("observacoes" gin_trgm_ops);
