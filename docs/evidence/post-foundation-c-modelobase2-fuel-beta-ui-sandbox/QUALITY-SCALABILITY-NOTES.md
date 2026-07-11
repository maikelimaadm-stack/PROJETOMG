# QUALITY & SCALABILITY NOTES — MODELOBASE2 FUEL BETA UI SANDBOX

## Objetivo
Explicar a sandbox visual beta de combustível sobre o Fuel Headless Candidate.

## Escalabilidade
- **custo do view model**: O(entries + events) por derivação; puro.
- **custo da sandbox session**: leve — envolve o fuel candidate; sem IO.
- **custo das actions**: O(1) (lookup em mapa).
- **custo dos components**: render props-driven; sem estado global.
- **custo do read state**: herdado do fuel-headless.
- **impacto em App/menu**: nenhum — nada é montado/registrado.
- **impacto em módulos reais**: nenhum — `src/modules` intocado.

## Segurança / Fail-safe
- sandbox isolada; não montada; sem rota; sem menu; sem `src/modules`.
- `localOnly`; `sent:false`; `persistenceReal:false`.
- sem backend/Prisma; sem runtimeBridge; sem storage obrigatório.
- React confinado a `components/`; headless/runtime React-free.
- gates de escopo (import-scan + git-diff de bloqueio) + diagnostics dinâmicos.

## Riscos
- UI sandbox ser confundida com módulo real.
- design ainda não representar a UI final.
- divergência futura entre sandbox e módulo real.
- montagem acidental no App.

## Mitigações
- no-route/no-menu validation (gate + diagnostics).
- components isolados; barrel sem JSX.
- testes (17 casos / 53 cenários) + gate (34 checks) + evidências.
- próximo slice de Dev Preview Route antes de tela real.

## Próximo passo recomendado
Fuel Dev Preview Route ou Fuel Module Shell Readiness.
