# Validation & Permission Blueprint Requirements

## Validation Blueprint

required · type check · min/max · regex · enum · relation exists · unique (planned) · tenant scope ·
computed validation · cross-field validation · async validation (futura) · unsafe validation blocked.

## Permission Blueprint

Ações: read · create · update · delete · export · configure · approve · diagnostics · admin.
Granularidade: field-level visibility · field-level editability · row-level access · tenant scope ·
module scope.

## Regras (fail-closed)

- permissão ausente **bloqueia**;
- tenant **nunca** pode ser contornado;
- **admin não contorna tenant**;
- produção exige política explícita;
- **módulos gerados não podem nascer abertos por padrão** (default-deny).
