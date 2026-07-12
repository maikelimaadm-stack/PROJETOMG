# Future Gates Spec — Empresas Controlled Tests

Gates que **devem existir antes do primeiro piloto** (planejados aqui; não implementados neste slice).

## Feature flags futuras (planejadas, não implementadas)

- `MAK_EMPRESAS_CONTROLLED_TESTS`
- `MAK_EMPRESAS_LOCAL_INTEGRATION_TESTS`
- `MAK_EMPRESAS_STAGING_READ_PILOT`
- `MAK_EMPRESAS_STAGING_WRITE_PILOT`
- `MAK_EMPRESAS_RUNTIME_READ_PARITY`
- `MAK_EMPRESAS_TEST_FIXTURES`
- `MAK_EMPRESAS_TEST_CLEANUP`
- `MAK_EMPRESAS_ALLOW_PRODUCTION_OBSERVABILITY`

**Nunca** criar flag de production write. **Proibido** planejar:
`MAK_EMPRESAS_ALLOW_PRODUCTION_WRITE`, bypass de permission, bypass de tenant, bypass de JWT,
bypass de cleanup.

## Gate de ambiente

Falha se: ambiente for produção para mutation; `DATABASE_URL` apontar para produção; `API_URL`
apontar para produção; tenant não for sintético; usuário não for sintético; allow flag não estiver ativa.

## Gate de fixtures

Falha se: fixture não possuir `testRunId`; nome sem prefixo de teste (`MAK_TEST_...`); houver dado
pessoal real; tenant não isolado; cleanup plan inexistente.

## Gate de segurança de escrita

Falha se: DELETE sem ID explícito; UPDATE sem ID explícito; mutation sem tenant scope; mutation sem
JWT/permission; endpoint diferente de staging/local; produção detectada.

## Gate de cleanup

Falha se: fixture permanecer após o teste; preferência não restaurada; testRun ficar aberto; IDs
criados não reconciliados.

## Gate de paridade

Falha se: ModeloBase1 e runtime-v2 divergirem sem justificativa; filtros divergirem; paginação
divergir; tenant scope divergir; permissões divergirem; fallback não for byte-idêntico.
