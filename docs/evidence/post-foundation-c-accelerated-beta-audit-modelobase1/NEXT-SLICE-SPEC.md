# NEXT-SLICE-SPEC — POST-FOUNDATION C — MODELOBASE1 EMPRESAS/CAMPOS DIRECT BETA ACTIVATION

## Objetivo

Ativar, como **beta controlado**, uma leitura runtime v2 da tela de **Cadastro de Empresa** dentro do **ModeloBase1**, atrás de feature flag, com fallback total para a config atual quando desligada. Read-only nesta primeira ativação (write fica para uma fase posterior). Reutilizar o Empresas Read-Only Candidate + Controlled Dev Dataset já existentes como fonte da leitura. Preparar o mesmo padrão para Campos Personalizados.

## Arquivos prováveis

**Novos (runtime v2 ↔ ModeloBase1 adapter):**
- `src/runtime/migration/modelobase1-beta/createEmpresasModeloBase1BetaReadModel.js` — adapta o read-only view model do runtime v2 para o formato de leitura do ModeloBase1.
- `src/runtime/migration/modelobase1-beta/modeloBase1BetaConfig.js` — flag `MAK_MODELOBASE1_EMPRESAS_BETA` (+ `_ALLOW_PROD`), `isEmpresasModeloBase1BetaEnabled`.
- `src/runtime/migration/modelobase1-beta/errors.js`
- `src/runtime/types/modelobase1-empresas-beta.js`
- `src/runtime/__tests__/migration/modelobase1-empresas-beta.test.js`
- `scripts/gates/g423-modelobase1-empresas-beta.mjs`
- `docs/evidence/post-foundation-c-modelobase1-empresas-beta/*` (certification, diagrams, quality notes, beta report, fallback report, rollback validation)

**Alterados (escopo autorizado):**
- `src/modules/empresas/config/modeloBase1/empresasModeloBase1Config.js` — passa um `runtimeReadModel` opcional quando a flag beta está on.
- `src/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js` (ou `defineModeloBase1Config.js`) — aceita e propaga um hook opcional `runtimeReadModel` (no-op quando ausente → byte-idêntico ao atual).
- `src/runtime/index.js`, `package.json` (scripts).

## Alterações permitidas

- `src/modules/empresas/**`, `src/modules/cadcps/**`
- `src/ModeloBase1/**` (apenas o ponto de injeção `runtimeReadModel`, aditivo, no-op quando flag off)
- `src/runtime/**` relacionado
- `package.json` (scripts), `src/runtime/index.js`
- `src/App.jsx` **somente** se precisar de flag/rota beta (linha mínima; provavelmente não é necessário nesta fase)

## Alterações proibidas

- backend, APIs (`src/apis`), Prisma, schema
- `src/framework/**` compartilhado (incl. `framework/cadastro/*`)
- `src/modules/makBootstrap/runtimeBridge/**`, makBootstrap global, runtime legado global
- SSOT, Studio, Marketplace, BOS, outras telas de módulos
- CSS global, auth/permissões globais, remoção de runtime legado

## Feature flags

- `MAK_MODELOBASE1_EMPRESAS_BETA` — default off; fail-closed em produção; `MAK_MODELOBASE1_EMPRESAS_BETA_ALLOW_PROD` override explícito.

## Fallback

- Flag off → `empresasModeloBase1Config` e a leitura atuais, **byte-idênticas** ao comportamento pré-slice. O hook `runtimeReadModel` no ModeloBase1 é no-op quando ausente. Reversão = flag off / revert do PR. Sem schema/write destrutivo.

## Gates

1. **Escopo autorizado** — diff só em `src/modules/empresas`, `src/modules/cadcps`, `src/ModeloBase1`, `src/runtime`, `package.json`, `src/runtime/index.js` (e `src/App.jsx` mínimo se necessário). Qualquer outro path = falha.
2. **Backend/Prisma bloqueado** — nenhum diff em `src/apis`/prisma/schema; nenhum import novo de backend/Prisma.
3. **Outras telas bloqueadas** — nenhum diff em `src/modules/*` fora de empresas/cadcps.
4. **Fallback** — com a flag off, o ModeloBase1 config de Empresas é equivalente ao atual (o hook é no-op).
5. **Write bloqueado** — write guard ativo; nenhuma operação de write nesta fase (read-only beta).
6. **Sem CSS global** · **sem dependência nova** · **runtimeBridge global preservado** (nenhum import de makBootstrap/runtimeBridge legado).
7. **modeloBase1 invariante** — Empresas (e Campos, quando incluído) continuam consumindo o mesmo `ModeloBase1CadastroPage`.
8. **Testes** — `node --test` do slice + `test:runtime` PASS; `lint` + `build` PASS.

## Testes (mínimo)

- flag off → read model beta não injetado; config atual intacta (fallback).
- flag on → read model beta injetado; alimentado por Empresas Read-Only Candidate + controlled dataset; read-only (write guard ativo).
- produção fail-closed; override explícito.
- determinístico; cópias seguras; prototype pollution bloqueada; dados sensíveis mascarados.
- não altera backend/Prisma/framework/outras telas; sem CSS global; sem dependência nova.
- ModeloBase1 hook `runtimeReadModel` é no-op quando ausente (não quebra outros módulos).

## Evidências

CERTIFICATION-REPORT, MODULE-DIAGRAMS (Mermaid), QUALITY-SCALABILITY-NOTES, BETA-ACTIVATION-REPORT, FALLBACK-REPORT, ROLLBACK-VALIDATION.

## Relatório final esperado

Template rígido no padrão dos slices anteriores, reportando: flag, fallback, read-only, escopo autorizado respeitado, backend/Prisma/framework/outras telas intocados, gates/tests/lint/build, próximo passo (Fase 2 — modeloBase1 Runtime Wiring).
