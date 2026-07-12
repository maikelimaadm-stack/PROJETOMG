# Canonical Fixtures

`createEmpresasCanonicalFixtures({ profile })` — imutáveis, determinísticas, versionadas, sintéticas.

## Perfis

- **certification-small**: 20 registros
- **certification-medium**: 250 registros, ≥4 tenants

O perfil `large` permanece apenas no performance envelope (não é fixture imutável principal).

## Conteúdo

Múltiplos erpEmpresaId; valores nulos permitidos; strings equivalentes para sort estável; registros
ativos/inativos; página vazia possível; registros para filtros compostos e isolamento tenant/permissão.

## Metadata

`fixtureVersion` (1.0.0), `fixtureDigest`, `datasetProfile`, `seed` (7), `recordCount`, `tenantCount`,
`synthetic: true`, `environment: local_test`, `hasSensitiveData: false`. Sem CNPJ/e-mail/telefone/nome real.
Cópias seguras; mutar retorno não altera a fixture original.
