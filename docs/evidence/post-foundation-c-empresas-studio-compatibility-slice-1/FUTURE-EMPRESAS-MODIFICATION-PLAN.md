# FUTURE EMPRESAS MODIFICATION PLAN

Plano de slices futuros (não implementados aqui). Ordem recomendada por risco.

## 1. EMPRESAS STUDIO COMPATIBILITY SLICE 2 — UI/State Alignment
- objetivo: alinhar detail (derive-from-form) + estados + validation metadata, headless/contract
- escopo permitido: novo subtree headless; proibido: alterar Empresas real/UI/backend/Prisma
- arquivos prováveis: detail/state/validation mirror endurecido
- testes/gates/rollback: contract-only, fail-closed, reversível por não-consumo
- critério de entrada: Slice 1 completo · critério de saída: detail/state contract certificados
- riscos: inferência de estado/detail errada

## 2. EMPRESAS STUDIO COMPATIBILITY SLICE 3 — Preferences/Layout Alignment
- objetivo: padronizar preferences/layout como contrato; proibido alterar preferências reais

## 3. EMPRESAS STUDIO COMPATIBILITY SLICE 4 — Permission/Tenant Hardening
- objetivo: certificar permissões de escrita e tenant scope fail-closed; proibido abrir permissão real

## 4. EMPRESAS STUDIO COMPATIBILITY SLICE 5 — Runtime Binding Pilot
- objetivo: piloto headless de consumo do mirror por engine/preview; proibido produção/mutation

## 5. EMPRESAS STUDIO COMPATIBILITY SLICE 6 — Backend/Prisma Readiness (somente se necessário)
- objetivo: readiness controlado; **ainda sem migration automática**; nunca migrar/mutar sem prompt específico

Cada slice futuro exige: objetivo, escopo permitido/proibido, arquivos prováveis, testes,
gates, rollback/fallback, riscos, critério de entrada, critério de saída.

## Conclusão

Os gaps **não bloqueiam** o Blueprint Engine. Portanto o próximo passo recomendado pode
ser **POST-FOUNDATION C — STUDIO BLUEPRINT ENGINE FOUNDATION**, mantendo o gap de
backend/Prisma reference-only até a SLICE 6.
