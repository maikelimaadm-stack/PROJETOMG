# Next Slice Spec

## Nome

**POST-FOUNDATION C — MODELOBASE2 FUEL HEADLESS CANDIDATE**

## Objetivo

Construir um **adapter headless de Combustível** (greenfield) sobre o ModeloBase2 Operational
Runtime, mapeando dados reais de abastecimento para command/event/draft/snapshot — **sem UI, sem
rota, sem menu, sem backend, sem Prisma, sem runtimeBridge, sem persistência real**. Provar que o
runtime operacional serve um domínio real headless.

## Escopo permitido (próximo slice)

- Criar `src/ModeloBase2/candidates/fuel/` (ou `src/ModeloBase2/fuel-headless/`):
  - `createFuelHeadlessAdapter.js` (compõe o operational runtime por `moduleId:'combustivel'`)
  - `fuelEntrySchema.js` (shape mínimo: data, maquinaId, litros, horimetro?, operador?)
  - `mapFuelEntryToCommand.js` (dados de abastecimento → comandos operacionais)
  - `validateFuelEntryPayload.js` (validação de domínio + payload validation do runtime)
  - `createFuelHeadlessDiagnostics.js`, `createFuelHeadlessFallback.js`
  - `index.js`
- `src/runtime/__tests__/modelobase2-fuel-headless-candidate.test.js`
- `scripts/gates/g423-modelobase2-fuel-headless-candidate.mjs`
- `package.json` (apenas 2 scripts + append no `test:runtime`)
- `docs/evidence/post-foundation-c-modelobase2-fuel-headless-candidate/`
- Leitura de `src/ModeloBase2/operational-runtime/**` e `src/runtime/generic-model/**` (reuso).

## Escopo proibido (próximo slice)

- **Não** criar UI/tela/rota/menu; **não** alterar `App.jsx`.
- **Não** criar módulo real em `src/modules/` (fica em `src/ModeloBase2/` headless).
- **Não** alterar backend/APIs/Prisma/schema/framework compartilhado/runtimeBridge real/
  makBootstrap/Studio/Marketplace/BOS.
- **Não** alterar ModeloBase1, Empresas/cadcps, ou o operational-runtime existente (só consumir).
- **Não** usar `fetch`, Prisma/MMM direto, backend write, storage obrigatório, React/DOM.
- **Não** adicionar dependências novas.

## Arquivos prováveis

Ver escopo permitido — tudo novo sob `src/ModeloBase2/` + tests/gate/evidence + package.json.

## Testes necessários (mínimo)

- fuel adapter criado; modelType operacional; dangerous false.
- schema valida entry mínima; rejeita campos inseguros/target proibido.
- mapFuelEntryToCommand gera createDraft/appendEntry corretos.
- ciclo completo (createDraft → appendEntry×N → validate → save → submit simulado → snapshot →
  restore → reset) via runtime.
- event log append-only; sent:false; persistenceReal:false.
- fallback para entry inválida.
- isolamento: sem React/ModeloBase1/Empresas/cadcps/backend/Prisma/runtimeBridge/fetch/storage.
- gates anteriores continuam PASS; test:runtime PASS.

## Gates necessários

- `scripts/gates/g423-modelobase2-fuel-headless-candidate.mjs` (import-scan estrutural + git-diff de
  bloqueio + escopo autorizado + dynamic dos invariantes + próximo passo = weighing/pesagem candidate
  ou UI headless, **não** backend write).

## Evidências necessárias

CERTIFICATION-REPORT, FUEL-HEADLESS-ADAPTER-REPORT, FUEL-ENTRY-SCHEMA, COMMAND-EVENT-MAPPING,
SNAPSHOT-COMPATIBILITY, QUALITY-SCALABILITY-NOTES, MODULE-DIAGRAMS.

## Relatório final esperado

Formato curto padrão do programa, com: candidato (combustível), adapter headless, ciclo operacional
provado, invariantes (localOnly/sent:false/persistenceReal:false/…Touched:false), gates, e a
confirmação de que nenhum módulo real/UI/backend foi tocado.
