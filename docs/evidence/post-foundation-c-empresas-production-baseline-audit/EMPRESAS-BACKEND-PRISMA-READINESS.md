# Empresas — Backend / Prisma Readiness

Auditoria (nenhum arquivo alterado; **nada implementado**).

## Existe backend atual para Empresas?

**Sim.** Backend Fastify em `backend/` com rotas (`backend/src/routes/index.js`), Prisma client
(`backend/src/database/prismaClient.js`) e scripts operacionais (seed, migração, índices,
smoke de empresas, probe de segurança multiempresa).

## Existe schema/Prisma atual para Empresas?

**Sim.** `backend/prisma/schema.prisma` define `model Empresa` (+ `CadCpsCampo*`, `PermissaoEmpresa`,
`RegistroAnexo`, `UsuarioPreferencia`, registro MDP). O cadastro roda sobre esse schema em produção.

## Campos mínimos (já existentes)

`id`, `cliente_id`, `id_global`, `codempresa`, `razao_social`, `nome_fantasia`, `tipo_pessoa`,
`cpf_cnpj`, endereço/contatos, `status`, `campos_personalizados (Json)`, `createdAt`, `updatedAt`.
Nenhum campo novo é necessário para o baseline — apenas para pilotos específicos futuros.

## Riscos de migration

- É produção viva: qualquer migration precisa de plano de backup/rollback e janela controlada.
- Colunas legadas já passaram por scripts de renomeação/normalização (`renameCodempresaColumns`,
  `normalizeEmpresaCodes`) — cuidado com compatibilidade.

## Riscos de compatibilidade

- Multiempresa (`cliente_id`, escopo) e permissões (`PermissaoEmpresa`) devem ser preservados.
- Campos personalizados em `Json` + `CadCpsCampo*` — mudanças podem afetar tabela e formulário.

## Risco de dados existentes

- **Alto por natureza** (dados reais de clientes). Qualquer piloto de escrita exige dados de teste
  isolados / ambiente de staging, não a base de produção.

## Requisitos para pilot seguro

- Começar **read-only** (promover `runtimeReadModel` runtime-v2 de dev-only para produção controlada).
- Cobertura de paridade de leitura já existente (shadow-compare, parity-hardening) como pré-condição.
- Gate próprio + test plan + fallback por flag + aprovação explícita.

## O que NÃO implementar agora

- Nenhuma migration.
- Nenhum novo endpoint/coluna.
- Nenhuma promoção de flag beta para produção.
- Nenhuma alteração de `backend/` ou `schema.prisma`.
- Nenhuma alteração de UI/repository/API.

## Pré-condições antes de backend/Prisma

- audit completo (este documento)
- test plan
- backup/migration plan
- fallback plan
- schema proposal (apenas se um piloto específico exigir)
- gate próprio
- dados de teste (isolados de produção)
- rollback strategy
- **aprovação explícita do mantenedor**
