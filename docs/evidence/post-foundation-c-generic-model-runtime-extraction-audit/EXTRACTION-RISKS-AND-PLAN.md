# EXTRACTION RISKS AND PLAN

## Riscos de extrair agora

- **Abstração errada:** só há 1 consumidor real (ModeloBase1). Extrair contratos antes de um 2º consumidor pode fixar a interface errada.
- **Acoplamento oculto:** dependências implícitas do shape do read state do ModeloBase1 (table.rows/form.fields) podem vazar para o "kernel".
- **Quebrar ModeloBase1:** mover código funcional arrisca regressão numa cadeia de 6 slices já verde.
- **Aumentar complexidade:** uma camada genérica + adapters adiciona indireção antes de haver payoff.
- **Atrasar beta funcional:** tempo em extração é tempo fora de entregar valor de tela.
- **Padronizar antes de validar persistence real:** o kernel ainda não provou persistência real; extrair a "persistence" agora pode padronizar um contrato incompleto.

## Riscos de não extrair

- **Duplicação em modeloBase2/base3:** cada modelo reimplementa read/write-local/persistence.
- **Local write preso ao ModeloBase1:** o controller/adapter não reutilizável.
- **Persistence duplicada:** serialize/validate/rehydrate copiados por modelo → divergência.
- **Gates inconsistentes:** cada modelo com seu gate ad-hoc.
- **Studio/Marketplace mais difícil:** sem contrato genérico, publicar modelo vira caso especial.
- **Arquitetura fragmentada:** N cadeias paralelas sem núcleo comum.

## Recomendação

**Extração incremental por contratos primeiro, código depois — sem tocar o ModeloBase1 funcional até o kernel estar testado.**

Concretamente:
1. **Criar contrato antes de mover código** — os contratos genéricos (puros, sem UI) primeiro.
2. **Extrair primeiro o que é 🟢 zero-coupling** (safety, fallback, adapter in-memory, versioning, write-payload validation, typed-error factory) — copiar/promover para `src/runtime/generic-model/` como **camada paralela nova**, com seus próprios testes.
3. **Congelar o ModeloBase1 como referência** — não refatorar a cadeia atual ainda; ela continua verde.
4. **Criar adapter genérico experimental para ModeloBase1** que consome o kernel novo, provado por teste, **sem** substituir o caminho atual.
5. **Só depois** de o adapter provar paridade, migrar o ModeloBase1 para o kernel.
6. **Preservar fallback + gates + test:runtime** em cada fase.

## Fases

| Fase | Objetivo | Toca ModeloBase1 funcional? |
|---|---|---|
| **Fase 1 — Generic Contracts Foundation** | Contratos puros + safety/fallback/diagnostics base em `src/runtime/generic-model/` + testes | Não |
| **Fase 2 — Generic Safety/Diagnostics/Foundation Tests** | Endurecer safety/validation/versioning/checksum genéricos + gate | Não |
| **Fase 3 — ModeloBase1 Adapter to Generic Kernel** | Adapter fino ModeloBase1 → kernel (experimental, paralelo) | Não (adapter novo) |
| **Fase 4 — Empresas/cadcps via Generic Kernel (through ModeloBase1)** | Provar paridade Empresas/cadcps pelo kernel atrás de flag | Sim, atrás de flag |
| **Fase 5 — modeloBase2 Prototype Adapter** | 2º consumidor real valida a genericidade | Não (novo modelo) |
| **Fase 6 — Studio/Marketplace Contract Alignment** | Alinhar template/published/permission/persistence contracts | Não |

## Gates sugeridos

- `gate:g424-generic-contracts` (Fase 1) — contratos puros, sem UI, sem src/runtime→ModeloBase1, sem backend/Prisma.
- Reutilizar o padrão dos gates g423 (escopo autorizado + paths proibidos + no-new-dep + no-CSS + testes).
- Manter todos os gates g423 do ModeloBase1 verdes em cada fase (não-regressão).

## Rollback

- Cada fase é **aditiva atrás de flag**; rollback = flag off / revert do PR.
- ModeloBase1 atual permanece o caminho default até a Fase 4 provar paridade.

## Critérios de sucesso

- Fase 1–2: `src/runtime/generic-model/` com contratos + testes verdes, zero import de ModeloBase1, zero backend/Prisma.
- Fase 3: adapter ModeloBase1→kernel com paridade provada em teste.
- Fase 4: Empresas/cadcps pelo kernel batem com o caminho atual (paridade), atrás de flag, fallback intacto.
- Fase 5: modeloBase2 protótipo funciona pelo mesmo kernel sem alterar o core.
- Em todas: `test:runtime` PASS, gates g423 verdes, lint/build 0.
