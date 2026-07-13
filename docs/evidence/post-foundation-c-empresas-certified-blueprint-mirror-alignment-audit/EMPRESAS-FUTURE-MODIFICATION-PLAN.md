# EMPRESAS FUTURE MODIFICATION PLAN

Slices futuros propostos (não implementados aqui). Ordem por risco crescente.

## 1. EMPRESAS STUDIO COMPATIBILITY SLICE 1 — contract-only fixes
- objetivo: alinhar field (campos_personalizados/cadcps) e validation ao contrato, headless
- escopo permitido: novo subtree headless; escopo proibido: Empresas/UI/backend/Prisma
- testes/gates/rollback: contract-only, fail-closed, reversível por não-consumo
- riscos: inferência errada de campo/validação

## 2. EMPRESAS STUDIO COMPATIBILITY SLICE 2 — ModeloBase1/table/form alignment
- objetivo: mirror endurecido de table/form + estados de tela; proibido alterar UI real

## 3. EMPRESAS STUDIO COMPATIBILITY SLICE 3 — preferences/layout alignment
- objetivo: mirror de preferências/layout como contrato; proibido alterar preferências reais

## 4. EMPRESAS STUDIO COMPATIBILITY SLICE 4 — permission/tenant hardening
- objetivo: certificar permissões de escrita fail-closed; proibido abrir permissão real

## 5. EMPRESAS STUDIO COMPATIBILITY SLICE 5 — runtime binding pilot
- objetivo: piloto de runtime binding headless; proibido produção/mutation

## 6. EMPRESAS STUDIO COMPATIBILITY SLICE 6 — backend/Prisma readiness (somente se necessário)
- objetivo: readiness documental de backend/Prisma; **nunca** migrar/mutar sem prompt específico

Cada slice futuro exige: objetivo, escopo permitido/proibido, arquivos prováveis,
testes, gates, rollback/fallback, riscos.

Se não houver gap crítico após SLICE 1, pode-se recomendar
**POST-FOUNDATION C — STUDIO BLUEPRINT ENGINE FOUNDATION**.
