# Permission Matrix Results

`createEmpresasPermissionMatrix({ dataset })` — 11 perfis; fail-closed.

## Perfis

read-allowed · read-denied · no-permission · empty-permission · invalid-permission (não-array) ·
other-module-permission · admin-synthetic · partial-permission · no-userId · token-expired ·
tenant-mismatch.

## Regras validadas

- fail-closed: só lê quem tem `empresas.read` válido, header e tenant coerentes;
- **nenhuma permission libera mutation** (repository lança em qualquer escrita, admin incluído);
- **admin sintético continua read-only**;
- nenhuma permission contorna tenant/header/token state.

## Resultado

- `total: 11`, `passed: 11`
- `permissionBypassFound: false`
- `bypassCases: []`
