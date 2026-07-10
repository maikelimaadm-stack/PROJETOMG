# QUALITY & SCALABILITY NOTES — EMPRESAS RUNTIME BRIDGE READ SLOT CANDIDATE

## Objetivo

Explicar o candidato de read slot entre runtime v2 e bridge legado para Empresas — uma camada passiva e dev-only que descreve um contrato de slot read-only, gera um payload serializável validado e simula uma montagem teórica, sem montar nada na tela real e sem tocar o runtimeBridge/makBootstrap de produção.

## Escalabilidade

- **Custo de criação do read slot candidate:** compõe o bridge dry run (→ toda a cadeia) + monta o view model uma vez — linear no número de campos/colunas/linhas, em memória, sem IO.
- **Custo do contrato:** O(1) — dados declarativos estáticos.
- **Custo do payload:** O(campos + colunas + linhas) — cópia estrutural via JSON.
- **Custo da validação:** O(nós do payload) — scan recursivo limitado por profundidade.
- **Custo do mount plan:** O(preconditions).
- **Custo dos diagnostics:** O(1).
- **Impacto com a flag DESLIGADA:** ~zero — model `skipped`; contrato/payload/plan nulos; painel renderiza um fallback pequeno; produção fail-closed.
- **Impacto em dev com a flag LIGADA:** o custo de compor a cadeia uma vez + montar objetos planos pequenos — adequado a um painel dev.

## Segurança / Fail-safe

- **Sem migração real:** o candidate é descrição/simulação passiva.
- **Sem montagem real na tela Empresas:** `mountedAnythingReal:false`; App.jsx/tela real/runtimeBridge intocados.
- **Sem dados reais como fonte principal:** payload construído do view model read-only (controlled dataset, mock, mascarado).
- **Sem write:** write guard herdado (11 ops) + contrato bloqueia 16 ops + payload writeGuard summary (`writeBlocked:true`).
- **Read slot contract read-only:** allowed só leitura; `writeImpossible:true`, `noRuntimeBridgeMutation:true`, `noProductionUiReplacement:true`.
- **Payload validation:** bloqueia funções, React elements, prototype pollution e valores sensíveis expostos.
- **Read slot opt-in:** off por padrão, fail-closed em produção.
- **Sem backend/Prisma/MMM direto:** verificado por teste e gate (D-RI-13).
- **Runtime legado + runtimeBridge real preservados:** nenhum import de makBootstrap/runtimeBridge legado.
- **Rollback por flag:** flag off restaura tudo; sem schema/write a desfazer.
- **Feature flags:** read slot flag (+ `_ALLOW_PROD`) + respeita a matriz de flags da cadeia.
- **Prototype pollution bloqueada** (no entrypoint) **; dados sensíveis mascarados.**

## Determinismo

- **Mesmo input gera o mesmo candidate:** verificado por teste (`deepEqual`).
- **Contrato/payload/validação/mount plan estáveis** (ids fixos, timestamp source estável — funções puras das entradas).
- **Sem side effects externos:** funções puras/passivas.
- **Outputs são cópias seguras:** `safeClone`; o write guard vivo é re-anexado após o clone (stateless).

## Riscos

- precondition/payload não válido → `safeToProceed:false` (mitigado: reportado em blockers; nextAllowedStep vira Candidate Fixes)
- exposição acidental de dados (mitigado: mock + máscara + validação + dev-only + fail-closed)
- confusão entre candidate e ativação real (mitigado: `mountedAnythingReal:false`, contrato `candidate:true`, gate valida que monta nada)
- rollback inconsistente (mitigado: flag off, sem schema/write)

## Próximo passo recomendado

- **Empresas Runtime Bridge Read Slot Dev Activation** se `readinessStatus = ready_for_next_slice`, `slotReady = true`, `safeToProceed = true` e `payloadValidation.valid = true`.
- **Empresas Runtime Bridge Read Slot Candidate Fixes** se houver critical/blocking failures.

## Débitos técnicos controlados

- ainda não substitui a tela real
- ainda não monta slot real
- ainda não usa dados reais como fonte principal
- ainda não executa ações reais
- ainda não cria Studio
- writes reais ficam fora de escopo

## Conclusão

O read slot candidate está **apto para merge**: camada read-only pura, determinística, reversível e passiva, com flag off por padrão, write impossível (guard ativo + contrato bloqueando 16 ops + payload validado), contrato read-only, payload serializável validado (sem função/React/pollution) e mount plan que monta nada de verdade, diagnostics e rollback definidos — sem migração real, sem montagem real, sem dados reais como fonte, sem write, sem dependência de Prisma/backend/MMM direto, sem alterar o runtimeBridge/makBootstrap real, sem dependência nova, sem CSS global novo, e sem React exportado pelo barrel do runtime. `slotReady: true`, `payloadValidation.valid: true`, `readinessStatus: ready_for_next_slice`.
