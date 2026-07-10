# CADCPS BETA UI REPORT

## Flag

`MAK_MODELOBASE1_CADCPS_BETA` (umbrella `MAK_MODELOBASE1_DIRECT_BETA`) — off por padrão; fail-closed em produção.

## Comportamento OFF

- `/CadastroCamposPersonalizados` mantém o comportamento atual, byte-idêntico.
- Hardening model → `fallback` (0 falhas bloqueantes).
- Painel de diagnostics não renderiza.
- Write real normal.

## Comportamento ON

- `/CadastroCamposPersonalizados` consome `config.runtimeReadModel` pelo **mesmo hardening base de Empresas** (mesmo checklist/diagnostics/model).
- Hardening reporta `hardened` (26 pass / 0 fail).
- Banner beta + badge read-only; painel dev-only.

## table/form

- **table:** colunas/linhas do controlled dataset cadcps (codigo/nome/tipo/telas/obrigatorio/ativo); `emptyStateSafe`/`sensitiveMasked` = pass.
- **form:** fields do dataset; `readOnly`/`noSubmit`/`noSave` = pass.

## Diagnostics

`hardened` — 26 pass / 0 fail. Sem dados sensíveis expostos.

## Fallback

Model inválido / resolve falha → `fallback`; tela legada de Campos.

## Write guard

Ativo — `createDirectBetaWriteGuard` (códigos MB1-BETA-003) bloqueia todas as operações de escrita.

## Limitações

- **Nenhuma arquitetura separada** — cadcps usa exatamente o mesmo hardening/model/checklist/componentes de Empresas.
- cadcps ainda sem descritor table/form runtime v2 próprio; estrutura vem do controlled dataset.
- Rota, App.jsx, backend, Prisma, `framework/cadastro` **não** alterados.
