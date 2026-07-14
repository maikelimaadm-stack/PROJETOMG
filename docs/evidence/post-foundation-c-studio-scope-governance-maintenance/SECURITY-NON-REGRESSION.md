# Security Non-Regression

Esta manutenção NÃO enfraquece nenhum bloqueio. Provas (testes + gate):

- `src/modules/**` → forbidden_scope
- `src/modules/empresas/**` → forbidden_scope
- `backend/**` e `backend/prisma/schema.prisma` → forbidden_scope
- `migrations/**` e qualquer `migration` → forbidden_scope
- `src/App.jsx`, `src/pages/**`, `src/components/**` → forbidden_scope (UI/React/rota/menu)
- `src/ModeloBase1/**`, `src/ModeloBase2/**` → forbidden_scope
- runtime produtivo (`src/runtime/` fora de `__tests__/`) → forbidden_scope
- `.css` → forbidden_scope
- `scripts/gates/lib/productionUiGuard.mjs` → forbidden_scope (salvo autorização explícita
  do slice atual)
- path desconhecido → unknown_scope (falha por padrão)
- dependências novas → bloqueadas (gate no-new-dependency)

Known-later NUNCA tolera forbidden: um diff com Preview Sandbox + `src/modules/x` continua
bloqueado, porque `src/modules/x` permanece forbidden.

O que NÃO foi alterado nos testes/gates antigos: asserts de contrato, segurança, flags,
digest, verifier, fallback, runtime, mutation, imports de código produtivo. Apenas a
parte de branch-relative scope check consome o helper. `productionUiGuard` intacto.
