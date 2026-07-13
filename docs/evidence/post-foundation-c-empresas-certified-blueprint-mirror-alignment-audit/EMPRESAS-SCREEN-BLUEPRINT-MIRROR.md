# EMPRESAS SCREEN BLUEPRINT MIRROR

Mapeia as telas reais de Empresas (TBLEMP, FORMEMP, search view, toolbar) como
reference-only contra o canonical screen contract.

## Telas

- table → presente (`tblEmp.constants.js`)
- form → presente (`formEmp.constants.js`)
- detail → ausente (gap)

## Áreas

filters (`tblEmp.filters.js`) · toolbar (`empresasToolbarConfig.js`) ·
searchView (`empresasSearchViewConfig.js`) · preferences/layout
(`empresasLayoutConfig.js`, referenceOnly).

## Regras

Screen **não** gera React component · **não** registra rota · **não** altera PAGEMP /
ModeloBase1CadastroPage · ações de mutação mapeadas como
`existingProductionBehavior/referenceOnly` (não ativadas). Estados empty/loading/error
não constam no contrato → `needs_alignment`.
