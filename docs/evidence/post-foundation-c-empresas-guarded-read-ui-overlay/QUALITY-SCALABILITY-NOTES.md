# QUALITY & SCALABILITY NOTES — EMPRESAS GUARDED READ UI OVERLAY

## Objetivo

Explicar o overlay dev-only do Guarded Read UI para Empresas — um painel de preview dentro do ambiente runtime v2 dev preview que abre e inspeciona o guarded read UI (tabela/formulário/diagnostics/write-blocked), sem sobrepor a tela real de produção, sem write, sem dados reais como fonte principal, sem tocar backend/Prisma/runtime legado.

## Escalabilidade

- **Custo de criação do overlay model:** compõe o guarded read UI model (que compõe read-only candidate + dual-read compare) — linear no número de campos/colunas/linhas, tudo em memória, sem IO.
- **Custo de render do overlay:** status strip O(1) + panel que embute o guarded read UI slice.
- **Custo de render do guarded read UI dentro do overlay:** O(colunas × linhas) + O(campos) do controlled dataset (≤ 3 linhas).
- **Custo dos diagnostics:** O(1) — combina flags e o summary já calculado.
- **Impacto com a flag DESLIGADA:** ~zero — model `skipped`; o componente renderiza um fallback pequeno na rota dev; nenhum efeito colateral; produção fail-closed.
- **Impacto em dev com a flag LIGADA:** o custo de compor os sub-models pequenos + renderizar componentes presentacionais — adequado a um painel dev.

## Segurança / Fail-safe

- **Sem migração real:** o overlay nunca substitui a tela real nem vira fonte da verdade.
- **Sem dados reais como fonte principal:** rows vêm do controlled dataset (mock, mascarado).
- **Sem write:** write guard herdado — 11 operações bloqueadas.
- **Write guard:** ativo no model; componentes sem handlers de efeito.
- **UI read-only:** embute o guarded read UI slice read-only.
- **Overlay dev-only:** seção opt-in dentro da rota dev; fail-closed em produção; nunca no menu/rota pública.
- **Sem backend/Prisma/MMM direto:** verificado por teste e gate (D-RI-13).
- **Runtime legado preservado:** nenhum import de makBootstrap/runtimeBridge; a UI real continua legada.
- **Rollback por flag:** flag off restaura tudo; sem schema/write a desfazer.
- **Feature flags:** overlay flag (+ `_ALLOW_PROD`) + respeita a matriz de flags do read chain, off por padrão, fail-closed em produção.
- **Prototype pollution bloqueada; dados sensíveis mascarados.**

## Determinismo

- **Mesmo input gera o mesmo overlay model:** verificado por teste (`deepEqual` sobre cópia estável).
- **Componentes dependem de props/model:** presentacionais puros, sem estado interno mutável.
- **Sem side effects externos:** funções puras/passivas.
- **Outputs são cópias seguras:** `safeClone`; o write guard vivo é re-anexado após o clone (stateless).

## Riscos

- drift estrutural legado/v2 (mitigado: parity/blocking do dual-read; blocking força Drift Resolution antes de parity hardening)
- exposição acidental de dados (mitigado: mock + máscara + dev-only + fail-closed)
- integração na rota dev quebrar hub/route (mitigado: seção opt-in com fallback próprio; rota/hub gates verdes)
- handler de efeito acidental (mitigado: teste + gate proíbem onClick/onSubmit/onChange com write)
- rollback inconsistente (mitigado: flag off, sem schema/write)

## Próximo passo recomendado

- **Empresas Read UI Parity Hardening** se não houver critical/blocking differences.
- **Empresas Guarded Read UI Drift Resolution** se houver critical/blocking differences.

## Débitos técnicos controlados

- ainda não substitui a tela real
- ainda não usa dados reais como fonte principal
- ainda não executa ações reais
- ainda não cria Studio
- writes reais ficam fora de escopo

## Conclusão

O guarded read UI overlay está **apto para merge**: camada read-only pura, determinística, reversível e passiva, com flag off por padrão, write impossível (guard ativo + componentes sem handlers de efeito), integração dev-only opt-in na rota de preview runtime v2 com fallback seguro, diagnostics e rollback definidos — sem migração real, sem dados reais como fonte, sem write, sem dependência de Prisma/backend/MMM direto, sem dependência nova, sem CSS global novo, e sem React exportado pelo barrel do runtime.
