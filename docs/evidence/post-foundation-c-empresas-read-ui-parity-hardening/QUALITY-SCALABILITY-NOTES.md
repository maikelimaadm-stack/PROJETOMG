# QUALITY & SCALABILITY NOTES — EMPRESAS READ UI PARITY HARDENING

## Objetivo

Explicar o hardening de paridade do read UI runtime v2 para Empresas — uma camada passiva e dev-only que produz checklist, score e diagnostics sobre o read UI overlay (que compõe guarded read UI → dual-read + read-only), garantindo consistência/segurança/determinismo antes de qualquer aproximação com a tela real. Sem migração real, sem write, sem dados reais como fonte principal, sem tocar backend/Prisma/runtime legado.

## Escalabilidade

- **Custo de criação do hardening model:** compõe o overlay model (→ guarded read UI → dual-read + read-only) — linear no número de campos/colunas/linhas, em memória, sem IO.
- **Custo da checklist:** O(itens) = 43 avaliações data-driven sobre o model já pronto; sem fs, sem IO (browser-safe).
- **Custo do score:** O(itens) — contagem + um cálculo de percentual.
- **Custo dos diagnostics:** O(1) — combina flags e o score.
- **Impacto com a flag DESLIGADA:** ~zero — model `skipped`; checklist toda `skipped`; painel renderiza um fallback pequeno; produção fail-closed.
- **Impacto em dev com a flag LIGADA:** o custo de compor os sub-models pequenos + avaliar a checklist — adequado a um painel dev.

## Segurança / Fail-safe

- **Sem migração real:** o hardening é análise passiva; nunca substitui a tela real nem vira fonte da verdade.
- **Sem dados reais como fonte principal:** inspeciona o controlled dataset (mock, mascarado) via o overlay.
- **Sem write:** write guard herdado — 11 operações bloqueadas.
- **Write guard:** ativo no model; componentes sem handlers de efeito.
- **UI read-only:** checklist/score/status presentacionais read-only.
- **Overlay dev-only + hardening opt-in:** ambos off por padrão, fail-closed em produção.
- **Sem backend/Prisma/MMM direto:** verificado por teste e gate (D-RI-13). A checklist é browser-safe (não lê arquivos); invariantes de código citam o gate mecânico que os aplica.
- **Runtime legado preservado:** nenhum import de makBootstrap/runtimeBridge; a UI real continua legada.
- **Rollback por flag:** flag off restaura tudo; sem schema/write a desfazer.
- **Feature flags:** hardening flag (+ `_ALLOW_PROD`) + respeita a matriz de flags do read chain.
- **Prototype pollution bloqueada** (no entrypoint) **; dados sensíveis mascarados.**

## Determinismo

- **Mesmo input gera o mesmo hardening model:** verificado por teste (`deepEqual` sobre cópia estável).
- **Ordem estável da checklist:** itens em ordem fixa de definição.
- **Componentes dependem de props/model:** presentacionais puros.
- **Sem side effects externos:** funções puras/passivas.
- **Outputs são cópias seguras:** `safeClone`; o write guard vivo é re-anexado após o clone (stateless).

## Riscos

- drift de vocabulário de colunas header-vs-dataset (mitigado: surfacado como warning não-bloqueante; readiness segue Dry Run)
- exposição acidental de dados (mitigado: mock + máscara + dev-only + fail-closed)
- handler de efeito acidental (mitigado: teste + gate proíbem onClick/onSubmit/onChange com write)
- rollback inconsistente (mitigado: flag off, sem schema/write)

## Próximo passo recomendado

- **Empresas Read UI Runtime Bridge Dry Run** se `readinessStatus = ready_for_next_slice`.
- **Empresas Read UI Parity Hardening Fixes** se houver critical/blocking failures.

## Débitos técnicos controlados

- ainda não substitui a tela real
- ainda não usa dados reais como fonte principal
- ainda não executa ações reais
- ainda não cria Studio
- writes reais ficam fora de escopo
- 1 warning conhecido (row shape header-vs-dataset) a alinhar em slice futuro

## Conclusão

O read UI parity hardening está **apto para merge**: camada read-only pura, determinística, reversível e passiva, com flag off por padrão, write impossível (guard ativo + componentes sem handlers de efeito), checklist de 43 itens em 6 categorias com score/readiness, diagnostics e rollback definidos — sem migração real, sem dados reais como fonte, sem write, sem dependência de Prisma/backend/MMM direto, sem dependência nova, sem CSS global novo, e sem React exportado pelo barrel do runtime. Readiness atual: `ready_for_next_slice` (99%).
