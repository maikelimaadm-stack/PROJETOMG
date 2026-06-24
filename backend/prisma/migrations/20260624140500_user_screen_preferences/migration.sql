-- Expande UsuarioPreferencia para escopo cliente+usuario+modulo+tela

ALTER TABLE "UsuarioPreferencia"
  ADD COLUMN IF NOT EXISTS "modulo" VARCHAR(64) NOT NULL DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS "tela" VARCHAR(64) NOT NULL DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS "versao_schema" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "preferencias_json" JSONB NOT NULL DEFAULT '{}'::jsonb;

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

CREATE UNIQUE INDEX IF NOT EXISTS "UsuarioPreferencia_cliente_usuario_modulo_tela_key"
  ON "UsuarioPreferencia"("cliente_id", "usuario_id", "modulo", "tela");
