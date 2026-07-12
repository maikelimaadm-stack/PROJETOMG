# VALIDATION & PERMISSION CONTRACT

## Validation Blueprint

Tipos permitidos (12): `required`, `typeCheck`, `min`, `max`, `regex`, `enum`,
`relationExists`, `uniquePlanned`, `tenantScope`, `computedValidation`,
`crossFieldValidation`, `asyncValidationPlanned`.

Regras:

- Validação insegura é bloqueada (`unsafeValidationAllowed: false`).
- `regex` deve ser uma string segura.
- `computedValidation` não executa código arbitrário.
- `asyncValidationPlanned` **não** chama a rede neste slice.
- `uniquePlanned` **não** cria constraint no banco.
- `tenantScope` não pode ser removido por um blueprint perigoso.

## Permission Blueprint

Ações (9): `read`, `create`, `update`, `delete`, `export`, `configure`,
`approve`, `diagnostics`, `admin`. Níveis (5): `module`, `screen`, `field`,
`row`, `tenant`.

Invariantes:

- **fail-closed / default-deny**.
- Permissão ausente bloqueia.
- `admin` **não** fura o tenant.
- `delete` e `mutation` não começam habilitados.
- Campos protegidos exigem visibilidade em nível de campo.
- Acesso por linha preserva o escopo de tenant.
- Permissões de produção exigem política futura explícita.
