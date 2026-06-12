-- Índices para listagens paginadas, filtros e buscas (ERP MAK Gestão)

-- Empresa: filtros e ordenação frequentes
CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_nome_fantasia_idx" ON "Empresa"("cliente_id", "nome_fantasia");
CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_cpf_cnpj_idx" ON "Empresa"("cliente_id", "cpf_cnpj");
CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_cidade_idx" ON "Empresa"("cliente_id", "cidade");
CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_estado_idx" ON "Empresa"("cliente_id", "estado");
CREATE INDEX IF NOT EXISTS "Empresa_cliente_id_updatedAt_idx" ON "Empresa"("cliente_id", "updatedAt");

-- Empresa: busca em campos personalizados (JSONB)
CREATE INDEX IF NOT EXISTS "Empresa_campos_personalizados_gin_idx"
  ON "Empresa" USING GIN ("campos_personalizados" jsonb_path_ops);

-- CadCpsCampo: busca por nome/código
CREATE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_nome_idx" ON "CadCpsCampo"("cliente_id", "nome");
CREATE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_field_name_idx" ON "CadCpsCampo"("cliente_id", "field_name");
CREATE INDEX IF NOT EXISTS "CadCpsCampo_cliente_id_codigo_idx" ON "CadCpsCampo"("cliente_id", "codigo");

-- Cliente: listagens administrativas
CREATE INDEX IF NOT EXISTS "Cliente_nome_idx" ON "Cliente"("nome");
CREATE INDEX IF NOT EXISTS "Cliente_cpf_cnpj_idx" ON "Cliente"("cpf_cnpj");
CREATE INDEX IF NOT EXISTS "Cliente_status_idx" ON "Cliente"("status");
CREATE INDEX IF NOT EXISTS "Cliente_ativo_idx" ON "Cliente"("ativo");

-- CadastroRegistro: cadastros genéricos futuros
CREATE INDEX IF NOT EXISTS "CadastroRegistro_cliente_id_codigo_idx" ON "CadastroRegistro"("cliente_id", "codigo");
CREATE INDEX IF NOT EXISTS "CadastroRegistro_cliente_id_status_idx" ON "CadastroRegistro"("cliente_id", "status");

-- Trigram para ILIKE em campos de texto (requer extensão pg_trgm — disponível no Supabase)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Empresa_razao_social_trgm_idx"
  ON "Empresa" USING gin ("razao_social" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Empresa_nome_fantasia_trgm_idx"
  ON "Empresa" USING gin ("nome_fantasia" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Empresa_cpf_cnpj_trgm_idx"
  ON "Empresa" USING gin ("cpf_cnpj" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "CadCpsCampo_nome_trgm_idx"
  ON "CadCpsCampo" USING gin ("nome" gin_trgm_ops);
