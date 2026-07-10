# QUALITY & SCALABILITY NOTES — MODELOBASE1 CONTROLLED LOCAL WRITE PLAN

## Objetivo
Explicar a fundação de escrita local controlada (in-memory) do ModeloBase1 beta — contrato, controller local, validação, mutações em cópia segura — sem backend/Prisma/persistência.

## Escalabilidade
- **Custo do contrato:** O(1) — objeto declarativo estático (cópia segura).
- **Custo do controller:** semeia o draft com um `safeClone` do read state (proporcional às poucas linhas/colunas do dataset controlado). Cada mutação é O(rows) no pior caso (find por id).
- **Custo das mutações locais:** `applyModeloBase1LocalWriteMutation` faz um `safeClone` do draft por operação (dataset mock pequeno) → barato e determinístico.
- **Custo da validação:** deep-scan limitado a profundidade 8 sobre o payload (objeto pequeno).
- **Impacto com flags desligadas:** controller = null; nenhum draft, nenhum custo. Beta read-only intacto.
- **Impacto com flags ligadas:** um controller por tela beta, em memória; sem timers, sem IO, sem rede.

## Segurança / Fail-safe
- **localOnly:** todo resultado e o contrato carregam `localOnly:true` + `backend/prisma/runtimeBridge Touched=false` + `persistence:'none'`.
- **Sem backend/Prisma:** nenhum import de `/apis`/`/backend`/Prisma; `security` do contrato afirma; validação bloqueia targets.
- **Sem runtimeBridge global** · **sem storage obrigatório** (tokens de storage só aparecem como *blocked targets*, nunca como chamadas de API).
- **Sem outras telas** (gate de escopo) · **payload validation** fail-closed · **rollback por flag** · **sem dependência nova**.
- **Desacoplamento:** módulo `local-write/*` não importa `src/runtime` (teste 39 + gate check 8).
- **Não muta o original:** draft = `safeClone(readState)` (testes 11–12 + gate check 4).

## Riscos
- **Confundir write local com write real:** mitigado por `localOnly`/`backendTouched:false`/`sent:false`/nome das flags e do contrato.
- **Controller mutar objeto original:** mitigado por `safeClone` no seed e por retornos em cópia; testado.
- **Payload perigoso:** validação fail-closed (função/handler/React/pollution/sensível/backend-target).
- **Operação escapar para backend:** `blockedOperations` + validação de target + `hasForbiddenReference`.
- **Escopo amplo demais:** gate de escopo autorizado + paths proibidos.

## Mitigações
- Diagnostics `backendTouched/prismaTouched/runtimeBridgeTouched=false` explícitos.
- Payload validation + gates de escopo + 30 testes (incl. mutação segura + não-mutação do original) + evidências.

## Próximo passo recomendado
**ModeloBase1 Controlled Local Write Activation** — montar o controller na UI beta (dev-only, atrás de flag), edição local do draft, ainda sem persistência real.
