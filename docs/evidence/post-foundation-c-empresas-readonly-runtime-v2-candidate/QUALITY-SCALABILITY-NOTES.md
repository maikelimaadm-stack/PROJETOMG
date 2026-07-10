# QUALITY & SCALABILITY NOTES — EMPRESAS READ-ONLY RUNTIME V2 CANDIDATE

## Objetivo

Explicar o candidato read-only do runtime v2 para Empresas — a primeira leitura real do runtime v2 para o módulo, protegida por flag, com write impossível, reusando projection/dataset/shadow existentes, sem substituir a tela real, sem virar fonte da verdade e sem tocar backend/Prisma/runtime legado.

## Escalabilidade

- **Custo de criação do candidate:** dominado por uma projection table/form (assíncrona, mas sem IO) + montagem do dataset controlado (≤ 3 registros de exemplo) — O(campos + colunas + linhas), tudo em memória.
- **Custo do view model:** O(campos + colunas + linhas); nenhuma renderização, nenhum DOM.
- **Custo de diagnostics:** O(1) — combina flags e listas fixas.
- **Impacto com a flag DESLIGADA:** ~zero — retorna um objeto `skipped` pequeno; nenhum view model é construído; nenhum efeito colateral; em produção falha fechada.
- **Impacto em dev com a flag LIGADA:** o custo de montar objetos planos pequenos (safeClone via JSON) — adequado a um painel/relatório dev ou um gate.

## Segurança / Fail-safe

- **Sem migração real:** o candidate nunca substitui a tela real nem vira fonte da verdade.
- **Sem dados reais:** rows vêm apenas do controlled dataset (mock, mascarado).
- **Sem write:** ver `WRITE-GUARD-REPORT.md` — 11 operações bloqueadas.
- **Write guard:** todo write-shaped op retorna bloqueio estruturado; não há caminho de execução.
- **Sem backend/Prisma/MMM direto:** verificado por teste e gate (D-RI-13).
- **Runtime legado preservado:** nenhum import de makBootstrap/runtimeBridge; a UI real continua legada.
- **Rollback por flag:** flag off restaura tudo; sem schema/write a desfazer.
- **Feature flags:** `MAK_RUNTIME_V2_EMPRESAS_READONLY` (+ `_ALLOW_PROD`), off por padrão, fail-closed em produção.
- **Prototype pollution bloqueada; dados sensíveis mascarados.**

## Determinismo

- **Mesmo input gera o mesmo candidate:** verificado por teste (`deepEqual` sobre cópia estável).
- **Sem side effects externos:** funções puras/passivas.
- **Outputs são cópias seguras:** `safeClone`; mutar o retorno não afeta chamadas futuras (o write guard vivo é re-anexado após o clone, e é stateless).

## Riscos

- divergência estrutural legado/v2 (mitigado: read-only + próximo slice compara antes de expor)
- drift de validação/permissão (mitigado: metadata projetada e diffável)
- execução acidental de ação (mitigado: write guard + ações como metadata bloqueada)
- rollback inconsistente (mitigado: flag off, sem schema/write)

## Próximo passo recomendado

**Empresas Dual Read Shadow Compare.**

## Débitos técnicos controlados

- ainda não substitui a tela real
- ainda não usa dados reais como fonte principal
- ainda não executa ações reais
- ainda não cria Studio
- writes reais ficam fora de escopo

## Conclusão

O candidate está **apto para merge**: camada read-only pura, determinística, reversível e passiva, com flag off por padrão, write impossível (write guard), view model estrutural via projection + dataset controlado, diagnostics e rollback definidos — sem migração real, sem dados reais como fonte, sem write, sem dependência de Prisma/backend/MMM direto, sem dependência nova e sem CSS global novo.
