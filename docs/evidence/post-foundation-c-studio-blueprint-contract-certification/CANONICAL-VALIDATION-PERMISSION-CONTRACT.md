# CANONICAL VALIDATION & PERMISSION CONTRACT

## Validation contract

12 validações canônicas (required, typeCheck, min, max, regex, enum, relationExists,
uniquePlanned, tenantScope, computedValidation, crossFieldValidation,
asyncValidationPlanned).

Regras: unsafeValidation bloqueada · regex segura · function/eval/custom JS bloqueados ·
asyncValidationPlanned não chama rede · uniquePlanned não cria constraint ·
relationExists não acessa backend · tenantScope não pode ser removido.

## Permission contract

9 ações (read, create, update, delete, export, configure, approve, diagnostics, admin) ·
5 níveis (module, screen, field, row, tenant).

Regras: failClosed · defaultDeny · permission ausente bloqueia · admin não contorna
tenant · delete/mutation não nascem permitidos · protected exige regra explícita ·
row-level preserva tenant · production exige política futura explícita.
