# PERMISSION HARDENING MATRIX

`createStudioPermissionHardeningMatrix()` — 26 cenários; `allMatched: true`.

## Válidos

read · create/update (bloqueado por persistence) · delete (bloqueado por default) ·
export · configure · approve · diagnostics · admin sintético restrito.

## Inválidos/perigosos (bloqueados)

defaultDeny false · failClosed false · permission ausente/vazia/desconhecida/de outro
módulo · admin bypass tenant · public read default · create/update/delete default
allowed · protected visible/editable sem regra · row-level sem tenant · tenant scope
removido · permission libera mutation sem persistence · permission libera production.

## Regras

Ausência bloqueia; admin não contorna tenant; mutation/delete nunca nascem liberados;
protected exige regra explícita; bypass gera blocker.
