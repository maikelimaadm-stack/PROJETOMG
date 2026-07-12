# Prisma / Schema Validation Plan — Empresas

`backend/prisma/schema.prisma` e `model Empresa` **já existem** em produção. **Não** propor criação
de novo model nem migration neste (nem no próximo) slice.

## Auditoria do model Empresa (estado atual, não alterado)

- **Chave**: `id` (cuid).
- **Tenant**: `cliente_id` (FK `Cliente`, `onDelete: Cascade`).
- **Campos**: `id_global`, `codempresa`, `razao_social`, `nome_fantasia`, `tipo_pessoa`, `cpf_cnpj`,
  endereço/contatos, `status` (default "Ativa"), `campos_personalizados (Json?)`, `createdAt`, `updatedAt`.
- **Uniques**: `@@unique([cliente_id, codempresa])`, `@@unique([cliente_id, id_global])`.
- **Índices**: `[cliente_id, codempresa]`, `[cliente_id, razao_social]`, `[cliente_id, nome_fantasia]`,
  `[cliente_id, cpf_cnpj]`.
- **Relações**: `cliente`, `anexos (RegistroAnexo)`, `permissoes (PermissaoEmpresa)`,
  `cadcpsEmpresas (CadCpsCampoEmpresa)`.
- **Soft delete**: não observado — delete é físico (cuidado extra em testes de delete).
- **Timestamps**: `createdAt` / `updatedAt`.

## Riscos de dados / schema

- **CNPJ duplicado**: `cpf_cnpj` é indexado mas **não** unique — validação de duplicidade é de
  aplicação; testes devem cobrir.
- **Unique por tenant**: fixtures precisam respeitar `[cliente_id, codempresa]` e `[cliente_id, id_global]`.
- **Cascade**: excluir `Cliente` (tenant) apaga empresas em cascata — nunca testar sobre tenant real.
- **Migration**: qualquer alteração exige backup/rollback e staging — **fora de escopo**.

## Testes futuros SEM migration

- `prisma validate` (schema válido).
- `prisma format` check (se aplicável ao CI).
- repository contract (mock/local).
- query plan em banco sintético local.
- constraints com fixtures sintéticas (uniques, cascade, obrigatórios).
- isolamento por tenant sintético.

## Fora de escopo (agora e no próximo slice)

- migration
- alteração de `schema.prisma`
- novo model / novo campo
- índice novo
- qualquer mutation em banco de produção
