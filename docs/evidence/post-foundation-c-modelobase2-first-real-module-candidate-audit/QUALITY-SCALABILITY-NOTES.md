# QUALITY & SCALABILITY NOTES — MODELOBASE2 FIRST REAL MODULE CANDIDATE AUDIT

## Objetivo
Explicar a escolha segura do primeiro módulo real candidato ao ModeloBase2.

## Critérios
- **risco**: greenfield reduz risco de regressão (não há tela/serviço real a quebrar).
- **simplicidade**: shape mínimo e estável favorece validação de payload e read state.
- **valor de negócio**: abastecimento é rotina diária no agro, alto valor prático.
- **compatibilidade com event log**: abastecimento = append natural.
- **compatibilidade com command resolver**: mapeamento 1:1 com createDraft/appendEntry/…
- **compatibilidade com snapshot**: draft serializa trivialmente.
- **dependências**: fuel headless não exige backend/Prisma/device.
- **offline/local**: casa com localOnly/sent:false/persistenceReal:false.
- **escopo**: menor superfície de arquivos.

## Recomendação
**Combustível** é o primeiro candidato (78/80). É o domínio operacional mais simples, com shape
estável, encaixe natural em event/append, sem cálculo derivado nem device — ideal para provar o
padrão headless antes de domínios mais complexos (pesagem/apontamento).

## Riscos
- tocar módulo real cedo demais (mitigado: próximo slice é **headless**, greenfield, sob
  `src/ModeloBase2/`, não `src/modules/`).
- acoplamento com UI (mitigado: sem UI/rota/menu no próximo slice).
- acoplamento com storage existente (mitigado: sem storage; memory-only).
- legacy/migration (não há — greenfield).
- divergência com o ModeloBase2 runtime (mitigado: o adapter **consome** o runtime, não o duplica).

## Mitigações
- próximo slice headless (sem UI real).
- sem backend/Prisma; sem rota/menu.
- gates de escopo (import-scan estrutural + git-diff de bloqueio).
- testes cobrindo o ciclo completo + isolamento.
- fallback e invariantes preservados (localOnly/sent:false/persistenceReal:false).

## Observação sobre a natureza dos candidatos
A auditoria constatou que **nenhum** dos candidatos existe no código hoje — o codebase é um
framework de **cadastro** (empresas/cadcps sobre ModeloBase1). Portanto, "primeiro módulo real" =
**primeiro domínio operacional novo** construído headless sobre o ModeloBase2, e não a adaptação de
um módulo existente. Isso é uma vantagem de risco (nada a regredir) desde que o próximo slice
permaneça headless e local.
