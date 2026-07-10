# QUALITY & SCALABILITY NOTES — EMPRESAS DUAL READ SHADOW COMPARE

## Objetivo

Explicar a comparação dual-read passiva entre legado e runtime v2 para Empresas — um mecanismo determinístico que mede divergências entre o snapshot legado e o snapshot runtime v2 read-only, sem alterar produção, sem write, sem substituir a tela real, sem tocar backend/Prisma/runtime legado.

## Escalabilidade

- **Custo de criação do legacy snapshot:** uma projection table/form (sem IO) + montagem do controlled dataset (≤ 3 registros) — O(campos + colunas + linhas), em memória.
- **Custo de criação do runtime v2 snapshot:** reusa o read-only view model — mesmo custo, mais o write guard (O(1)).
- **Custo do comparador:** O(campos + colunas + linhas + actions + validations + permissions) com uso de Sets/Maps para diffs por id — linear.
- **Custo do difference model:** O(n log n) na ordenação estável das differences.
- **Impacto com a flag DESLIGADA:** ~zero — retorna um objeto `skipped` pequeno; nenhum snapshot é construído; nenhum efeito colateral; produção fail-closed.
- **Impacto em dev com a flag LIGADA:** o custo de montar dois snapshots pequenos + comparar — adequado a um painel/relatório dev ou a um gate.

## Segurança / Fail-safe

- **Sem migração real:** o compare nunca substitui a tela real nem vira fonte da verdade.
- **Sem dados reais como fonte principal:** snapshots vêm do controlled dataset/fixture (mock, mascarado).
- **Sem write:** write guard herdado do read-only candidate — 11 operações bloqueadas.
- **Write guard:** permanece ativo no compare e no snapshot runtime v2.
- **Sem backend/Prisma/MMM direto:** verificado por teste e gate (D-RI-13).
- **Runtime legado preservado:** nenhum import de makBootstrap/runtimeBridge; a UI real continua legada.
- **Rollback por flag:** flag off restaura tudo; sem schema/write a desfazer.
- **Feature flags:** `MAK_RUNTIME_V2_EMPRESAS_DUAL_READ_COMPARE` (+ `_ALLOW_PROD`), off por padrão, fail-closed em produção.
- **Prototype pollution bloqueada; dados sensíveis mascarados.**

## Determinismo

- **Mesmo input gera o mesmo compare:** verificado por teste (`deepEqual` sobre cópia estável).
- **Ordem estável de differences:** ordenadas por (severity desc, category, path, id).
- **Sem side effects externos:** funções puras/passivas.
- **Outputs são cópias seguras:** `safeClone`; o write guard vivo é re-anexado após o clone (stateless).

## Riscos

- divergência estrutural legado/v2 (mitigado: classificada; blocking força Drift Resolution antes de UI)
- drift de validação/permissão (mitigado: categorizado com recommendedAction)
- execução acidental de ação (mitigado: write guard + ações como metadata)
- rollback inconsistente (mitigado: flag off, sem schema/write)

## Próximo passo recomendado

- **Empresas Guarded Read UI Slice** se não houver critical/blocking differences.
- **Empresas Dual Read Drift Resolution** se houver critical/blocking differences.

## Débitos técnicos controlados

- ainda não substitui a tela real
- ainda não usa dados reais como fonte principal
- ainda não executa ações reais
- ainda não cria Studio
- writes reais ficam fora de escopo

## Conclusão

O dual read compare está **apto para merge**: camada read-only pura, determinística, reversível e passiva, com flag off por padrão, write impossível (write guard), snapshots normalizados legado/v2, comparador classificado por severidade/categoria, diagnostics e rollback definidos — sem migração real, sem dados reais como fonte, sem write, sem dependência de Prisma/backend/MMM direto, sem dependência nova e sem CSS global novo.
