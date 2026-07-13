# VALIDATION HARDENING MATRIX

`createStudioValidationHardeningMatrix()` — 26 cenários; `allMatched: true`.

## Válidos

required · typeCheck · min · max · regex segura · enum · relationExists planejado ·
uniquePlanned · tenantScope · computedValidation restrita · crossFieldValidation
declarativa · asyncValidationPlanned sem rede.

## Inválidos/perigosos (bloqueados)

validation desconhecida · regex não-string/perigosa · function validator · eval ·
Function constructor · custom JS code · async fetch / URL externa · unique que cria
constraint · relationExists com backend · tenantScope false · crossField circular ·
validation com side effect.

## Regras

Nenhuma validação executa código arbitrário, chama a rede, cria constraint ou altera
banco; tenantScope não pode ser removido.
