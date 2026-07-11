# QUALITY & SCALABILITY NOTES — MODELOBASE2 FUEL DEV PREVIEW ROUTE

## Objetivo
Explicar a rota dev-only para visualizar a Fuel UI Sandbox.

## Escalabilidade
- **custo da rota**: lazy import — só carrega quando montada (dev + flag).
- **custo do access guard**: O(1) (checagem de flags/ambiente).
- **custo dos fixtures**: O(1) (dados fixos + seedActions).
- **custo do preview state**: seed determinístico + derivação do view model.
- **impacto em App.jsx**: 3 adições guardadas; nada removido; sem menu.
- **impacto em menu/módulos reais**: nenhum.

## Segurança / Fail-safe
- dev-only; sem menu; sem `src/modules`; sem `src/pages` real.
- `localOnly`; `sent:false`; `persistenceReal:false`.
- sem backend/Prisma; sem runtimeBridge; sem storage obrigatório; sem fetch.
- guard fail-closed em produção; override explícito com warning.
- gates de escopo + shared production-UI guard (rota fuel dev sancionada).

## Riscos
- rota dev ser confundida com módulo real.
- App.jsx receber alteração ampla demais.
- preview ficar acessível em produção.
- fixture parecer dado real.

## Mitigações
- access guard + flags + allowProd false por default.
- App.jsx-diff estrito (só a montagem dev sancionada) — gate + shared guard + teste.
- no-menu / no-module validation.
- fixtures explicitamente fictícias (`fictional:true`, `hasSensitiveData:false`).
- testes + gate + evidências.

## Próximo passo recomendado
ModeloBase2 Fuel Module Shell Readiness.
