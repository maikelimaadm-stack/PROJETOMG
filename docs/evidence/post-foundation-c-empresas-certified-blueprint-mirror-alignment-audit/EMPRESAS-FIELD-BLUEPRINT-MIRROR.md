# EMPRESAS FIELD BLUEPRINT MIRROR

Mapeia os 14 campos REAIS de Empresas (do contrato certificado de leitura) para o
canonical field contract do Studio. **Nenhum campo inventado.**

## Campos (fonte: empresas-local-read-contract@1.0.0)

id · cliente_id (tenant, protected) · id_global · codempresa · razao_social ·
nome_fantasia · tipo_pessoa (select — opções não no contrato → needs_alignment) ·
cpf_cnpj · cidade · estado · status (→ Studio `status`) · campos_personalizados
(cadcps — sem tipo Studio único → **unsupported**, documentado) · createdAt · updatedAt.

## Classificação

- mappedFields: 13 · unsupportedFields: `campos_personalizados`
- required: id, cliente_id, codempresa, razao_social
- tenantFields: cliente_id (preservado) · protectedFields: cliente_id (read-only)
- searchable: razao_social, nome_fantasia, cidade
- filterable: codempresa, razao_social, nome_fantasia, status, cidade, estado, tipo_pessoa
- sortable: codempresa, razao_social, nome_fantasia, status, cidade, estado

## Regras

Campo sem contrato vira **gap**, não erro. Campo sensível/protegido não nasce aberto.
`campos_personalizados` documenta a referência a cadcps, não reimplementa. `invented: false`.
