# SCREEN HARDENING MATRIX

`createStudioScreenHardeningMatrix()` — 22 cenários; `allMatched: true`.

## Válidos

table · form · detail · dashboardPlaceholder · kanbanPlaceholder · calendarPlaceholder.

## Inválidos/perigosos (bloqueados)

kind desconhecido · sem id · sem permission · gera componente React · componentPath real ·
App.jsx binding · route auto-binding · create/update/delete action default · export sem
permission · toolbar action sem guard · diagnostics com secret · estados empty/loading/
error ausentes · referência a field inexistente · layout circular.

## Regras

Screen **não** gera UI, **não** registra rota; ações de mutação bloqueadas por padrão;
estados obrigatórios; diagnostics sanitizados.
