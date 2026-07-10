# QUALITY & SCALABILITY NOTES — EMPRESAS GUARDED READ UI SLICE

## Objetivo

Explicar o primeiro UI slice read-only guardado do runtime v2 para Empresas — uma visualização segura e dev-only que renderiza tabela/formulário/diagnostics/write-blocked a partir do read-only candidate e do dual-read compare, sem alterar produção, sem write, sem substituir a tela real, sem tocar backend/Prisma/runtime legado.

## Escalabilidade

- **Custo de criação do UI model:** compõe o read-only candidate (uma projection + dataset) + o dual-read compare (dois snapshots + comparação) — linear no número de campos/colunas/linhas, tudo em memória, sem IO.
- **Custo de render da tabela:** O(colunas × linhas) do controlled dataset (≤ 3 linhas).
- **Custo de render do formulário:** O(campos).
- **Custo dos diagnostics:** O(1) — combina flags e o summary já calculado.
- **Impacto com a flag DESLIGADA:** ~zero — model `skipped`; componente renderiza um fallback pequeno; nenhum efeito colateral; produção fail-closed.
- **Impacto em dev com a flag LIGADA:** o custo de compor os sub-models pequenos + renderizar componentes presentacionais — adequado a um painel dev.

## Segurança / Fail-safe

- **Sem migração real:** o slice nunca substitui a tela real nem vira fonte da verdade.
- **Sem dados reais como fonte principal:** rows vêm do controlled dataset (mock, mascarado).
- **Sem write:** write guard herdado do read-only candidate — 11 operações bloqueadas.
- **Write guard:** ativo no model; componentes sem handlers de efeito.
- **UI read-only:** formulário `readOnly`/`disabled`; sem `<form>` funcional; sem botão de salvar/editar/excluir.
- **Sem backend/Prisma/MMM direto:** verificado por teste e gate (D-RI-13).
- **Runtime legado preservado:** nenhum import de makBootstrap/runtimeBridge; a UI real continua legada.
- **Rollback por flag:** flag off restaura tudo; sem schema/write a desfazer.
- **Feature flags:** `MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI` (+ `_ALLOW_PROD`), off por padrão, fail-closed em produção.
- **Prototype pollution bloqueada; dados sensíveis mascarados.**

## Determinismo

- **Mesmo input gera o mesmo UI model:** verificado por teste (`deepEqual` sobre cópia estável).
- **Componentes dependem de props/model:** presentacionais puros, sem estado interno mutável.
- **Sem side effects externos:** funções puras/passivas.
- **Outputs são cópias seguras:** `safeClone`; o write guard vivo é re-anexado após o clone (stateless).

## Riscos

- drift estrutural legado/v2 (mitigado: parity/blocking do dual-read; blocking força Drift Resolution antes de overlay)
- exposição acidental de dados (mitigado: mock + máscara + dev-only + fail-closed)
- handler de efeito acidental em componente (mitigado: teste + gate proíbem onClick/onSubmit/onChange com write)
- rollback inconsistente (mitigado: flag off, sem schema/write)

## Próximo passo recomendado

- **Empresas Guarded Read UI Overlay** se não houver critical/blocking differences.
- **Empresas Guarded Read UI Drift Resolution** se houver critical/blocking differences.

## Débitos técnicos controlados

- ainda não substitui a tela real
- ainda não usa dados reais como fonte principal
- ainda não executa ações reais
- ainda não cria Studio
- writes reais ficam fora de escopo

## Conclusão

O guarded read UI slice está **apto para merge**: camada read-only pura, determinística, reversível e passiva, com flag off por padrão, write impossível (guard ativo + componentes sem handlers de efeito), UI read-only composta do read-only candidate + dual-read compare, diagnostics e rollback definidos — sem migração real, sem dados reais como fonte, sem write, sem dependência de Prisma/backend/MMM direto, sem dependência nova, sem CSS global novo, e sem React exportado pelo barrel do runtime.
