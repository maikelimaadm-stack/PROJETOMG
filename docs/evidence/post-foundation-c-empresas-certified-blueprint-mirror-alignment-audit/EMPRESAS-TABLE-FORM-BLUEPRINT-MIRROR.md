# EMPRESAS TABLE/FORM BLUEPRINT MIRROR

## Table

Colunas derivadas dos campos certificados sortable/filterable (sem colunas inventadas):
codempresa · razao_social · nome_fantasia · status · cidade · estado · tipo_pessoa.
Row/toolbar actions: `existingProductionBehavior/referenceOnly`. Export (PDF) e
paginação presentes, referenceOnly. Preferências/layout referenceOnly.

## Form

Campos: required + optional certificados (id oculto), agrupados em identificação /
localização / status. Validações vivem em `empresasSchema.js` (referenceOnly, não
confirmadas no contrato → gap). create/edit/delete: `existingProductionBehavior/
referenceOnly`.

## Regras

Não altera UI nem preferências reais. Gaps registrados.
