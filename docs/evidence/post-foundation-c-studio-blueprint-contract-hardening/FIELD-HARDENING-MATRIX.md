# FIELD HARDENING MATRIX

`createStudioFieldHardeningMatrix()` — 35 cenários; `allMatched: true`.

## Válidos (14 tipos)

text · number · decimal · date · datetime · boolean · select · multiSelect ·
relation · computed (restrito) · money · percentage · filePlaceholder · status.

## Inválidos/perigosos (bloqueados)

type desconhecido · name vazio/com espaço/caractere perigoso/reservado/duplicado ·
label vazio · defaultValue incompatível · select/multiSelect sem options ·
relation sem target / sem tenantScope · computed com função / com código string ·
regex perigosa · protected editável por padrão · searchable/sortable/filterable em
tipo não permitido · order negativo · tenant field removido.

## Regras

`computed` nunca executa código; `relation` preserva tenant; `protected` é read-only
por padrão; capacidades derivam do tipo. `evaluateStudioField(field, ctx)` reutilizável.
