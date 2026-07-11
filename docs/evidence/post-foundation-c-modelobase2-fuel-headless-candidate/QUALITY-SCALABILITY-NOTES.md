# QUALITY & SCALABILITY NOTES — MODELOBASE2 FUEL HEADLESS CANDIDATE

## Objetivo
Explicar o candidato headless de combustível sobre o ModeloBase2 Operational Runtime.

## Escalabilidade
- **custo do adapter**: leve — possui um runtime + session; sem IO.
- **custo do command mapper**: O(1) (lookup em mapa).
- **custo do event mapper**: O(1) por evento (lookup + checksum FNV-1a).
- **custo do read state**: O(entries + events) por derivação.
- **custo do totalLiters**: O(entries) (redução única no summary).
- **custo do snapshot**: proporcional ao tamanho do draft (sanitize + checksum + clone).
- **impacto em módulos reais**: nenhum — nada em `src/modules` é importado/alterado.
- **impacto em UI**: nenhum — headless.

## Segurança / Fail-safe
- headless; `localOnly`; `sent:false`; `persistenceReal:false`.
- sem backend/Prisma, sem runtimeBridge, sem storage obrigatório, sem UI, sem React/DOM, sem fetch.
- payload validation fail-closed (função/handler/React/pollution/target proibido + regras de domínio).
- fallback/rollback passivos.
- gates de escopo (import-scan estrutural + git-diff de bloqueio).

## Riscos
- domínio combustível simplificado demais.
- futura integração com estoque/tanque.
- futura sincronização (offline-first).
- futura UI divergir do headless.
- confundir candidate com módulo real.

## Mitigações
- candidato headless; sem `src/modules`; sem UI.
- testes (20 casos / 70 cenários) + gate (34 checks) + evidências.
- reutiliza o operational runtime/kernel sem duplicá-los.
- próximo slice de **UI readiness** antes de tela real.

## Próximo passo recomendado
ModeloBase2 Fuel UI Readiness ou Fuel Beta UI Sandbox.
