# Synthetic Data & Fixture Contract — Empresas

Contrato obrigatório para qualquer dado de teste. **Nenhum dado real de produção pode ser usado.**

## Campos de identificação de fixture

- `testRunId` — id único da execução de teste
- `fixtureId` — id da fixture dentro do run
- `synthetic: true`
- `environment` — unit | local | staging (nunca production)
- `tenantId` de teste (sintético)
- `createdByTestPlan: true`
- `expiresAt`
- `cleanupStatus` — pending | done | blocked

> Se o schema atual **não** tiver esses campos, **NÃO** alterar o schema neste (nem no próximo) slice.

## Alternativas sem migration (schema atual permanece intocado)

Como `model Empresa` já existe e não expõe esses campos, usar identificação **externa/convencional**:

- **prefixo previsível** em `razao_social` / `nome_fantasia`: `MAK_TEST_<RUN_ID>_...`
- **CNPJ sintético** válido apenas para ambiente de teste (nunca CNPJ real)
- **metadata externa** de test run (registry fora da tabela produtiva)
- **tenant de teste dedicado** (`cliente_id` sintético)
- **registry de fixtures** fora da tabela produtiva (arquivo/coleção de IDs do run)
- **lista de IDs** capturada durante a execução (para cleanup por ID)

## Padrão de nomenclatura

```
MAK_TEST_<RUN_ID>_<DESCRIÇÃO>
```

Exemplos: `MAK_TEST_RUN001_EMPRESA_A`, `MAK_TEST_RUN001_EMPRESA_UPDATE`,
`MAK_TEST_RUN001_EMPRESA_DELETE`.

## Nunca usar

empresa real · CNPJ real · e-mail real · telefone real · endereço real · usuário real.

## Relação com o schema real (auditado, não alterado)

`model Empresa` tem `@@unique([cliente_id, codempresa])` e `@@unique([cliente_id, id_global])` — as
fixtures sintéticas devem respeitar esses uniques dentro do tenant sintético para não colidir; o
`cliente_id` sintético isola o namespace de teste.
