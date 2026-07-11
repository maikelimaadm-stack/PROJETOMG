# QUALITY & SCALABILITY NOTES — MODELOBASE2 PROTOTYPE ADAPTER

## Objetivo
Explicar o primeiro adapter operacional baseado no Generic Model Runtime.

## Escalabilidade
- **custo do adapter**: instância leve por chamada (descritor + contratos genéricos); sem IO.
- **custo de event append**: O(1) por evento — um `createGenericModelChecksum` (FNV-1a) sobre o
  conteúdo do evento + um `safeClone`.
- **custo de timeline local**: O(n) no número de eventos apenas ao recomputar
  `computeOperationalTimeline`/`summary` (reduções lineares).
- **custo de snapshot**: proporcional ao tamanho do draft (sanitize + checksum + clone).
- **impacto em ModeloBase1**: nenhum — ModeloBase2 não importa nem altera MB1.
- **impacto em futuros modelos operacionais**: o padrão (adapter fino sobre o kernel) escala para
  `movimentacao`/`financeiro` sem tocar o kernel.

## Segurança / Fail-safe
- **localOnly** em draft/evento/mutation/snapshot.
- **sent:false** em todo evento e no envelope de mutation.
- **persistenceReal false** em draft/snapshot/roundtrip.
- **sem backend/Prisma**, **sem runtimeBridge**, **sem storage obrigatório**, **sem fetch**.
- **dangerous capabilities false** (backendWrite/workflow/connector/marketplacePublish).
- **payload validation** fail-closed (função/handler/React/pollution/target proibido).
- **fallback/rollback** passivos (rollback nunca executa).

## Riscos
- modelType operacional ainda ser simplificado demais.
- event append não cobrir transações futuras.
- confundir prototype com módulo real.
- generalizar antes de validar com tela real.

## Mitigações
- headless prototype (sem UI real).
- gates de escopo (import-scan estrutural + git-diff de bloqueio).
- testes (22 casos cobrindo 55 cenários).
- sem UI real, sem backend.
- evidências completas.

## Próximo passo recomendado
Generic Model Multi-Type Hardening ou ModeloBase2 Operational Runtime Foundation.
